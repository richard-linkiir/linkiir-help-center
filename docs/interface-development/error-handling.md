---
title: Error Handling and Retry
---

# Error Handling and Retry

Interfaces fail. What separates a maintainable interface from a fragile one is deciding, in advance, which failures stop the feed and which ones do not.

## Classify the failure first

| Category | Example | Retry helps? | Response |
| --- | --- | --- | --- |
| **Transient** | Timeout, connection reset, receiver restarting | Yes | Retry with backoff |
| **Data** | Missing required field, malformed payload | No | Reject the message; the sender must fix it |
| **Configuration** | Wrong port, bad credentials, missing certificate | No | Fix the configuration |
| **Business rejection** | Receiver returns a negative ACK or a `409` | Depends | Follow the receiver's contract |

Retrying a data error just fails repeatedly at a slower rate. Refusing to retry a transient error turns a two-second network blip into a manual restart.

## Raising an error in a script

Use `error()` when the message cannot be processed correctly:

```lua
local mrn = Msg.PID[3][1][1]:value()
if mrn == nil or mrn == "" then
   error("PID-3 patient identifier is missing")
end
```

Name the field, not its value. Error text is stored and searchable, so a value in an error message becomes a patient identifier in a log.

| Write | Not |
| --- | --- |
| `error("PID-3 patient identifier is missing")` | `error("bad MRN: " .. mrn)` |
| `error("receiver returned " .. resp.code)` | `error("failed sending " .. Data)` |

## Filtering is not an error

Returning without pushing drops a message deliberately. That is normal operation:

```lua
if MsgType ~= "ADT" then
   print("Skipping message type " .. tostring(MsgType))
   return   -- not an error
end
```

Print a line when you do. Otherwise a working filter and a broken node look identical to whoever asks why nothing arrived.

## Never swallow a failure

The most damaging pattern in an interface is treating a failed delivery as success:

```lua
-- Wrong: the message is lost and nobody knows
local resp = linkiir.link.web.post{ url = Url, body = Data }

-- Right: check both the transport and the response
local resp, err = linkiir.link.web.post{ url = Url, body = Data }
if not resp then
   error("delivery failed: " .. err.message)
end
if resp.code >= 400 then
   error("receiver returned " .. resp.code)
end
```

`resp` being present means the request completed, not that the receiver accepted it. Check the status code too.

## Stopping versus continuing

When a script raises an error, the node reports the failure and stops processing. Unprocessed messages wait in the queue.

That is the safe default for clinical interfaces, and it is worth understanding why: stopping is not data loss. The queue is durable, order is preserved, and the failure is impossible to miss. A node that silently continues past errors can discard a day of data before anyone notices.

Where individual bad records are genuinely expected and must not halt a feed, handle them in the script rather than letting them raise:

```lua
function main(Data)
   local ok, Msg = pcall(function()
      return linkiir.data.extract{ schema = "adt.json", data = Data, type = "hl7" }
   end)

   if not ok then
      -- Record it and move on, rather than stopping the feed.
      print("Unparseable message skipped")
      return
   end

   linkiir.flow.push{ data = Msg:text() }
end
```

Doing it this way makes the decision explicit in the script, where a reviewer can see it, and lets you distinguish the cases you tolerate from the ones you do not. Print a line whenever you swallow something, or a working filter and a broken node look identical to whoever asks why nothing arrived.

For destination-side rejections, the equivalent decision is a node field — **Ack Error Handling** on Destination LLP. See [Destination Nodes](interfaces/destination-nodes.md).

## Retry at the node, not in the script

Transport nodes already handle reconnection. Configure it rather than writing retry loops:

| Node | Fields |
| --- | --- |
| Destination LLP | **Attempt to Reconnect**, **Reconnect Attempts**, **Reconnection Interval**, **Resend on Ack Timeout**, **Resend Attempts**, **Ack Timeout** |
| Source or Destination File/FTP, with FTP enabled | **Attempt to Reconnect**, **Reconnect Limit Times**, **Reconnection Interval** |

For an outbound call from a script, let the error propagate rather than looping. A retry loop inside `main` holds the worker and hides the failure from the node's state.

## What happens when a node stops

| Guarantee | Detail |
| --- | --- |
| Messages are not lost | Unprocessed messages wait in the queue |
| Order is preserved | Delivery resumes in order when the node restarts |
| No silent gap | The failure appears in the node state and in log search |

This is why stopping is a safe response to an error. You are pausing a durable queue, not dropping traffic.

## Duplicates are possible

Delivery is at-least-once. A message can be delivered twice if processing is interrupted between doing the work and confirming it.

Design the receiver's side for it:

| Destination | Protection |
| --- | --- |
| Destination LLP | `Original ID and message type` ACK verification; receiver deduplicates on message control ID |
| Destination File/FTP | `Unique ID` file naming; **FTP Overwrite Handling** set to `not be uploaded` |
| Outbound HTTP | A stable idempotency key derived from the message, if the API supports one |
| Database write | An upsert or guarded insert keyed on a message identifier |

Decide how duplicates are detected before go-live. A replay must not create a second clinical or financial transaction.

## Investigating a failure

1. Open the node and read its status detail — it carries the last error.
2. Search log search for `ERROR` level records in the project.
3. Open the failing record and note its correlation ID.
4. Search that correlation ID to see how far the message got.
5. Copy the archived payload into a sample and reproduce it with Run Test.

Step 5 is the one that saves time. Reproducing with the exact payload beats reasoning about what the sender might have sent.

## Replay rather than rewind

To reprocess a message, replay that specific archived payload from log search.

Rewinding a queue consumer to an earlier position reprocesses everything from that point, which usually means re-delivering messages that already succeeded. Replay targets one message.

| Action | Scope | Use for |
| --- | --- | --- |
| Replay an archived message | One message | Normal recovery |
| Bulk replay | A selected set, up to 500 at a time | A known batch that failed together |
| Rewind a consumer position | Everything from that point | Rarely; only with a full understanding of the side effects |

Confirm the receiver tolerates a duplicate before replaying anything.

### Correcting a message on the way back out

Select the records in **Logs** and click **Resubmit**. The confirmation window lists each selected message and shows the archived payload itself, not just its index row, so you can read what is about to go back onto a live topic — and edit it first.

| Behaviour | Detail |
| --- | --- |
| An untouched message | Resubmitted byte-for-byte as archived |
| An edited message | The edited text is published in its place |
| The archived record | Never rewritten. The edit applies to this one resubmission |
| Skipped messages | Reported individually, with the reason, rather than failing the whole batch |

Use it for the cases where the payload is the problem and the sender cannot resend: a bad delimiter, a field the receiver rejects, a truncated segment. It is not a substitute for fixing the sender, and every edit is a clinical record that no longer matches what was originally received — say so in your change record.

:::caution[Editing masked messages]
HL7 payloads render masked unless you hold **Unredact PHI** and reveal the message in the window. A masked message cannot be edited, and an edit that still contains mask blocks is refused on the server as well as in the page. Both refusals exist for the same reason: an edit made against `██████` would publish the mask in place of the patient identifiers.

Resubmitting itself needs **Resubmit messages**, and reading the payload needs **View log messages**. See [Users and Roles](../administration/configurations/user-roles.md).
:::

## Safe context to record

Include enough to diagnose without exposing patient data.

**Safe:** project, workflow, and node names; message ID and correlation ID; error category and code; retry attempt; queue position; timestamps.

**Never:** raw HL7, FHIR, CDA, or X12 payloads in general service logs; patient name, MRN, date of birth, health card number, address, or phone number in error text, metric labels, or email alerts.

Message payloads are archived deliberately, with access control, in the Log DB. That is where they belong — not in an error string. See [Security](../administration/security/index.md).

## Next

- [Custom Scripting Nodes](interfaces/custom-scripting-nodes.md)
- [Testing and Debugging Lua](lua-programming/testing-debugging.md)
- [Troubleshooting](../administration/troubleshooting/index.md)
