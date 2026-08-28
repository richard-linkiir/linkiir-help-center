---
title: "Demo: HL7 LLP to Scripting to LLP"
---

# Demo: HL7 LLP to Scripting to LLP

The most common healthcare interface shape: receive HL7 v2 over MLLP, transform it, forward it to another system, and handle both acknowledgments.

```text
Source LLP  →  Transform Custom  →  Destination LLP
  :2575          map ADT            remote :2576
```

---

## 1. Source LLP node — `Receive ADT`

Drag **LLP** from the **Source** group of the palette.

| Field | Value |
| --- | --- |
| **Listen Port** | `2575` |
| **Acknowledgment Mode** | `Default` |
| **Message Encoding** | Match the sending system |
| **LLP Delimiters** | `Normal LLP` |
| **Use SSL** | Off, unless the sender uses TLS |

With `Default`, Linkiir generates the ACK for you and the node needs no script. Switch to `Custom` only when the sender requires specific ACK codes or application-level validation before acknowledging — then supply an ACK script whose `main(Data)` returns the ACK text.

:::caution[Decide what your ACK promises]
A `Default` ACK confirms the message was received and accepted into the workflow. It does not confirm the downstream system got it. If your sender treats an ACK as proof of end-to-end delivery, that expectation needs correcting, or the interface needs a `Custom` ACK that waits for more.
:::

Set **Message Encoding** to match the sender. A mismatch shows up as corrupted names and accented characters, often only for a minority of patients — which makes it easy to miss during testing.

---

## 2. Transform Custom node — `Map ADT`

Drag **Custom** from the **Transform** group. It has no configuration fields of its own — its Lua script is created with the node.

Connect `Receive ADT` to this node. Place your HL7 schema, `adt.json`, in the node's directory.

```lua
function main(Data)
   local MsgIn, MsgType = linkiir.data.extract{
      schema = "adt.json",
      data = Data,
      type = "hl7",
   }

   -- Only forward the message types this interface handles.
   if MsgType ~= "ADT" then
      print("Skipping message type " .. tostring(MsgType))
      return
   end

   -- Require the patient identifier before going further.
   local mrn = MsgIn.PID[3][1][1]:value()
   if mrn == nil or mrn == "" then
      error("PID-3 patient identifier is missing")
   end

   -- Copy the inbound message, then adjust only what changes.
   local MsgOut = linkiir.data.create{
      schema = "adt.json",
      name = MsgType,
      type = "hl7",
   }
   MsgOut:map(MsgIn)

   local family = MsgIn.PID[5][1][1][1]:value()
   MsgOut.PID[5][1][1][1] = string.upper(family or "")

   linkiir.flow.push{ data = MsgOut:text(), key = mrn }
end
```

### What each part does

| Line | Purpose |
| --- | --- |
| `extract` | Parses the message into a navigable tree and returns its type |
| `MsgType ~= "ADT"` | Filters by returning without pushing — normal operation, not an error |
| `mrn == ""` check | Raises for a genuinely broken message the sender must fix |
| `create` then `map` | Copies everything that matches, so only changed fields need writing |
| `PID[5][1][1][1]` | Segment → field → repeat → component → sub-component |
| `key = mrn` | Gives the message a meaningful correlation key for log search |

Raising an error here rather than skipping the message is deliberate: a message missing a patient identifier signals a problem with the feed, not one bad record. Stopping preserves order and makes the problem visible immediately instead of letting hundreds of messages fail unnoticed. See [Error Handling and Retry](../error-handling.md).

### Guard every field you read

`PID-5` is present in virtually every real ADT, so `string.upper(family or "")` looks like defensive noise — until one sender omits it and the node stops on a `nil`. Guard each field you navigate into, or accept a default:

```lua
local given = MsgIn.PID[5][1][2][1]:value() or ""
```

---

## 3. Destination LLP node — `Send ADT`

Drag **LLP** from the **Destination** group.

| Field | Value |
| --- | --- |
| **Remote Host** | The receiving system's hostname |
| **Remote Port** | `2576` |
| **Wait for Ack** | On |
| **Ack Timeout** | `30000` milliseconds, or whatever the receiver's contract states |
| **Ack Verification** | `Original ID and message type` |
| **Ack Error Handling** | `Stop channel` |
| **Persistent Connection** | Match the receiver's expectation |
| **Attempt to Reconnect** | `Yes, with limit`, with a count and interval |
| **Use SSL** | Match the receiver — this node defaults to **on** |

Connect `Map ADT` to this node. It has no script.

### The settings that matter most

**Ack Verification — `Original ID and message type`.** The ACK must match the message that was sent. Without this, an ACK for one message can be credited to another, and you will believe messages were delivered that were not.

**Ack Error Handling — `Stop channel`.** A negative ACK means the receiver rejected the message and a person needs to decide what happens next. `Queue message` retains rejections and keeps going; `Discard message` drops them. For clinical data, start with `Stop channel`.

**Wait for Ack — on.** Without it, a message counts as delivered once written to the socket, which tells you nothing about whether the receiver accepted it.

**Use SSL — check it.** This node defaults to TLS on, while Source LLP defaults to off. Sending to a receiver expecting plain MLLP with **Use SSL** left on produces a connection that opens and immediately drops.

:::note[Remote Host defaults to `localhost`]
That is a valid value, so a node you forgot to configure starts cleanly and sends nowhere useful. Set it deliberately, and re-check it after importing this project into another environment.
:::

See [Destination Nodes](../interfaces/destination-nodes.md) for the full field list.

---

## 4. Test the script before starting

Add samples to `Map ADT` containing HL7 messages. Use clearly synthetic identifiers:

```text
MSH|^~\&|SENDER|FACILITY|RECEIVER|FACILITY|20260805120000||ADT^A01|MSG00001|P|2.5
EVN|A01|20260805120000
PID|1||TEST000001^^^FACILITY^MR||TEST^PATIENT^A||19700101|M
PV1|1|I|WARD^101^1
```

Keep a sample for each of these:

| Sample | Confirms |
| --- | --- |
| Normal ADT | The mapping works |
| A message type other than ADT | The filter returns quietly |
| `PID-3` absent | The error is raised as intended |
| `PID-5` absent | The guard holds |
| Repeating `PID-3` | You read the repeat you meant to |
| Accented characters in the name | Encoding survives the round trip |

Click **Run Test**, then set a breakpoint on the `PID[5]` line and use **Debug** to inspect `MsgIn` and `MsgOut` side by side. In the variables tree, turn **Hide empty** off when you want to confirm a field really is empty rather than mis-navigated.

---

## 5. Start and validate

1. Start the workflow and wait for all three nodes to reach `RUNNING`.
2. Send an MLLP-framed ADT to port `2575` from your test sender.
3. Confirm the sender received an ACK.
4. Confirm the receiving system got the message and returned its ACK.
5. Open **Logs**, search the MRN or the correlation ID, and confirm records at all three nodes.

The payload at `Send ADT` should show the surname uppercased. Comparing the archived payload at `Receive ADT` against the one at `Send ADT` is the quickest way to verify a mapping against real traffic.

---

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Sender connects but the message never completes | LLP framing. Leave **LLP Delimiters** on `Normal LLP` unless the sender documents otherwise. |
| Connection opens and immediately drops | TLS mismatch. **Use SSL** defaults on for Destination LLP and off for Source LLP. |
| Names arrive corrupted | **Message Encoding** on the source does not match the sender. |
| `Map ADT` goes to `ERRORED` on a `nil` value | A field your script assumed was present is absent. Add it as a sample and guard it. |
| Nothing reaches the destination | Confirm the nodes are connected in the workflow, and that `MsgType` really is `ADT`. |
| Destination times out waiting for an ACK | **Ack Timeout** too short, receiver not answering, or a network device closing an idle **Persistent Connection**. |
| Messages stop after one rejection | Expected with `Ack Error Handling` set to `Stop channel`. Read the ACK detail in the logs, resolve it, then restart. |
| Receiver reports duplicates | Delivery is at-least-once, so a redelivery is possible. Have the receiver deduplicate on message control ID. |

---

## Next

- [Demo: HTTP Source to File](http-source-demo.md)
- [Destination Nodes](../interfaces/destination-nodes.md)
- [Error Handling and Retry](../error-handling.md)
