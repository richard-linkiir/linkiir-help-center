---
title: Destination Nodes
---

# Destination Nodes

A destination node delivers a message out of the workflow. It consumes from the node connected before it and performs the external side effect.

Fields marked **needed to start** must have a usable value before the node will start.

---

## Destination LLP

Sends HL7 v2 over MLLP to a remote host and handles the ACK.

### Core fields

| Field | Default | Notes |
| --- | --- | --- |
| **Remote Host** | `localhost` | **Needed to start.** Hostname or IP of the receiving system. |
| **Remote Port** | `5145` | **Needed to start**, and must be greater than `0`. |
| **Message Encoding** | `Western (ISO-8859-1)` | Character encoding for outbound messages. |
| **Escape 8-Bit Characters** | off | Escape high-bit characters in the outbound stream. |
| **Persistent Connection** | `Yes` | `Yes` reuses one connection; `No` connects per message. |

:::caution[Check Remote Host before you start]
The default is `localhost`, which is a valid value — so a node you forgot to configure starts cleanly and sends nowhere useful. Set it deliberately, and check it after importing a project from another environment.
:::

### Framing

| Field | Default |
| --- | --- |
| **LLP Delimiters** | `Normal LLP` |
| **Messages Begin After** | `\x0B` |
| **Messages Continue Until** | `\x1C\x0D` |

### Acknowledgment

| Field | Default | Notes |
| --- | --- | --- |
| **Wait for Ack** | on | Whether to wait for an ACK before treating the message as delivered. |
| **Ack Timeout** | `10000` | Milliseconds to wait for the ACK. |
| **Ack Verification** | `Any message` | `Any message`, or `Original ID and message type` for a strict match. |
| **Ack Error Handling** | `Stop channel` | `Stop channel`, `Queue message`, or `Discard message`. |

### Resend and reconnect

| Field | Default | Notes |
| --- | --- | --- |
| **Resend on Ack Timeout** | on | Resend when no ACK arrives in time. |
| **Resend on Ack Verification Failure** | off | Resend when the ACK does not match. |
| **Resend Attempts Unlimited** | off | |
| **Resend Attempts** | `5` | |
| **Disconnect Between Resend Attempts** | on | |
| **Reconnect After Resend** | `10000` | Milliseconds. |
| **Attempt to Reconnect** | `Yes, with limit` | `No`, `Yes`, or `Yes, with limit`. |
| **Reconnect Attempts** | `60` | With `Yes, with limit`. |
| **Reconnection Interval** | `10000` | Milliseconds between attempts. |

A node sitting in its reconnect wait still stops when you stop it — it does not finish the interval first. Stopping a whole workflow or project joins each node in turn, so a large one takes proportionally longer to come to a stop; wait for the state to settle rather than clicking again.

### TLS

| Field | Default | Notes |
| --- | --- | --- |
| **Use SSL** | **on** | This node defaults to TLS. |
| **Certificate File** | *(empty)* | |
| **Private Key File** | *(empty)* | |
| **Verify Peer** | **on** | |
| **Certificate Authority File** | *(empty)* | |

:::note[This node defaults to TLS on, and Source LLP defaults to off]
If you are connecting two Linkiir installations, or sending to a receiver that expects plain MLLP, the defaults will not match. A TLS mismatch usually looks like a connection that opens and immediately drops. Set **Use SSL** on both ends deliberately rather than relying on defaults.
:::

### Choosing Ack Error Handling

This is the most consequential setting on the node. It decides what happens when the receiver returns a negative ACK.

| Setting | Behaviour | Use when |
| --- | --- | --- |
| `Stop channel` | The node stops | Safest default. A rejection needs a human decision, and stopping preserves order and prevents a flood of failures. |
| `Queue message` | The message is held and the node continues | Rejections are expected for individual messages and must be retained for review. |
| `Discard message` | The message is dropped and the node continues | Rarely appropriate for clinical or financial data. Choose it only when loss is genuinely acceptable. |

Start with `Stop channel`. It surfaces a receiver problem immediately instead of letting hundreds of messages fail unnoticed. Stopping is safe: unprocessed messages wait in the durable queue.

### Wait for Ack and Ack Verification

| Combination | Meaning |
| --- | --- |
| **Wait for Ack** off | Delivered once written to the socket. Fastest, weakest guarantee. |
| On, `Any message` | Any response counts as an acknowledgment. |
| On, `Original ID and message type` | The ACK must match the message sent. Strongest guarantee. |

Use `Original ID and message type` when the receiver may respond out of order or on a shared connection. Without it, an ACK for one message can be credited to another — which means a message that was actually rejected is recorded as delivered.

### Persistent Connection

Set `Yes` when the receiver expects a long-lived connection and the volume justifies it. Set `No` when the receiver is intolerant of idle connections, or when a network device between you closes them silently — a closed-but-not-noticed connection produces confusing timeouts.

---

## Destination File/FTP

Writes each message to a file, locally or to an FTP/FTPS/SFTP server.

### Core fields

| Field | Default | Notes |
| --- | --- | --- |
| **Output Directory** | *(empty)* | **Needed to start.** Where files are written. |
| **Write Each Message To** | `Separate files` | `Separate files` or `A single file`. |
| **Single File** | *(empty)* | The target filename, with `A single file`. |
| **Output File Encoding** | `Western (ISO-8859-1)` | Character encoding of written files. |
| **Escape 8-Bit Characters** | off | Escape high-bit characters on output. |

### Naming files, with `Separate files`

| Field | Default | Notes |
| --- | --- | --- |
| **Use as File ID** | `Unique ID (YYYYMMDDhhmmss_XXXXX)` | See the table below. |
| **Custom Timestamp Format** | `output_%Y_%m_%d_%H_%M_%S_%f.hl7` | With `Custom Timestamp`. |
| **Number of Padded Digits** | `5` | `3` to `7`, with `Padded integer index`. |
| **Next File Index** | `0` | Starting number, with either index mode. |
| **Output File Mask** | `%i.txt` | **Needed to start** with `Separate files`. Filename pattern. |
| **Temporary File Extension** | `tmp` | Extension used while writing. |

### Choosing a file ID

| Option | Suits |
| --- | --- |
| `Unique ID (YYYYMMDDhhmmss_XXXXX)` | Default choice. Safe under any volume and after a restart. |
| `Timestamp (to the millisecond)` | Human-scannable output, if two messages cannot share a millisecond. |
| `Custom Timestamp` | A receiver that parses filenames. |
| `Integer index` | A receiver that expects a sequence. |
| `Padded integer index` | A receiver that sorts filenames as text. |

Timestamp naming collides under load when two messages land in the same interval, and index naming restarts from **Next File Index** if that value is ever reset. Use `Unique ID` unless a receiver requires otherwise.

### The temporary extension matters

Linkiir writes to a temporary name and renames on completion, so a downstream watcher configured to pick up `*.txt` never sees a partial file.

Keep **Temporary File Extension** different from the extension in **Output File Mask**. If they match, a reader can grab a file mid-write — which is exactly the failure the temporary name exists to prevent.

### FTP upload

Turn on **Upload to FTP** to write to a remote server.

| Field | Default | Notes |
| --- | --- | --- |
| **FTP Protocol** | `FTP` | `FTP`, `FTPS (FTP over SSL)`, or `SFTP (Secure Shell FTP)`. |
| **Authentication** | `Username/Password` | `Username/Password` or `Private/Public Key`. |
| **FTP Server** | *(empty)* | **Needed to start** when **Upload to FTP** is on. |
| **FTP Port** | `21` | |
| **FTP Username** | *(empty)* | **Needed to start** when **Upload to FTP** is on. |
| **FTP Password** | *(empty)* | For password authentication. |
| **FTP Path** | *(empty)* | Remote directory. |
| **Certificate File**, **Private Key File** | *(empty)* | For FTPS. |
| **SFTP Private Key File**, **Public Key File** | *(empty)* | For key-based SFTP. |
| **Verify Peer** | off | Leave on outside a trusted network. |
| **Verify Host Fingerprint** | off | Leave on outside a trusted network. |
| **Use Remote Temporary File** | on | Upload under a temporary name and rename on completion. |
| **FTP Overwrite Handling** | `be overwritten` | An existing file may `be overwritten`, `be renamed`, or `not be uploaded`. |
| **Keep Local Files** | on | Retain a local copy after upload. |
| **Attempt to Reconnect** | `No` | `No`, `Yes (unlimited)`, or `Yes, with limit`. |
| **Reconnect Limit Times** | `60` | With `Yes, with limit`. |
| **Reconnection Interval** | `10000` | Milliseconds between attempts. |

Leave **Use Remote Temporary File** on whenever the receiver polls the upload directory, for the same reason as the local temporary extension.

**Keep Local Files** is on by default, which is useful while validating a new interface — the local copies are your evidence of what was sent. Plan for the disk they consume, or turn it off once the interface is established.

:::caution[FTP Overwrite Handling defaults to overwriting]
The default silently replaces an existing remote file of the same name. Combined with timestamp or index naming, a redelivery can overwrite a file the receiver has not read yet. Set it to `not be uploaded` when silent replacement would lose data.
:::

Put the password in the project's **Variables** tab flagged **Secret**, and reference it. See [Project Settings](../../administration/configurations/project-settings.md).

---

## Outbound HTTP, email, and database writes

There is no working dedicated node type for these. Make the call from a **Transform Custom** node:

```lua
function main(Data)
   local resp, err = linkiir.link.web.post{
      url = "https://api.example.com/messages",
      body = Data,
      headers = { ["Content-Type"] = "application/json" },
      auth = { type = "bearer", token = Token },
      timeout = 30,
   }
   if not resp then
      error("delivery failed: " .. err.message)
   end
   if resp.code >= 400 then
      error("receiver returned " .. resp.code)
   end
end
```

A transform node that calls out and never pushes is a destination in every practical sense.

Raising an error on a failed delivery matters: it stops the message being treated as delivered, so it is not silently lost. Check both the transport result and the status code — `resp` being present means the request completed, not that the receiver accepted it. See [Error Handling and Retry](../error-handling.md).

:::note[Destination Custom is not usable]
The palette offers **Custom** under **Destination**, but it has no runtime implementation in this release. Use Transform Custom as above.
:::

---

## Make delivery idempotent

Delivery is at-least-once, so a message can be delivered twice after an interruption or a retry.

| Destination | How to protect the receiver |
| --- | --- |
| Destination LLP | Use `Original ID and message type` verification and let the receiver deduplicate on message control ID. |
| Destination File/FTP | Use `Unique ID` naming and **FTP Overwrite Handling** set to `not be uploaded`, so a redelivery cannot silently replace a file. |
| Outbound HTTP | Send a stable idempotency key derived from the message, if the API supports one. |
| Database write | Use an upsert or guarded insert keyed on a message identifier. |

Decide how the receiver detects duplicates before you go live, not after. A replay or retry must not create a duplicate clinical or financial transaction.

---

## Next

- [Source Nodes](source-nodes.md)
- [Custom Scripting Nodes](custom-scripting-nodes.md)
- [Error Handling and Retry](../error-handling.md)
