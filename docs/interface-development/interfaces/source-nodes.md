---
title: Source Nodes
---

# Source Nodes

A source node brings a message into the workflow. This page lists the fields for each source type and how to set them.

Fields marked **needed to start** must have a usable value before the node will start. Everything else has a working default or belongs to an optional mode.

---

## Source HTTP

Accepts inbound HTTP requests. Your script parses the request and sends the response.

| Field | Default | Notes |
| --- | --- | --- |
| **Route Path** | *(empty)* | **Needed to start.** The path this node answers, for example `/intake`. |
| **Worker Count** | `1` | **Needed to start**, and must be at least `1`. Concurrent requests handled. |

Its Lua script is created with the node and is also needed to start.

### The server is installation-wide

There is no port field on this node. Every HTTP source node answers on one embedded server, configured in **Settings → Http Server**: **Use Server**, **Port**, and optionally **Secure** with its certificate fields. See [HTTP Server Settings](../../administration/configurations/http-server.md).

```text
Settings → Http Server            port 9001
├─ /intake      → Source HTTP node "Intake"        (project A)
└─ /discharge   → Source HTTP node "Discharge"     (project B)
```

Consequences worth knowing:

- **Route Path** must be unique across every HTTP source node that is running, not just within one workflow. Two nodes claiming `/intake` cannot both answer it.
- Changing the port affects every HTTP source node on the installation.
- Turning **Use Server** off stops all of them.
- Enabling **Secure** makes every route HTTPS, not just some.
- Changing the port or any TLS field restarts the Runtime when saved, which stops and restarts every running node on the installation — not only the HTTP ones.

Prefix routes with the interface they belong to — `/adt/intake`, `/orders/intake` — so a second project cannot accidentally claim a path a first one already uses.

### Worker Count

How many requests the node handles simultaneously. Each worker is an independent script instance.

| Value | Behaviour |
| --- | --- |
| `1` | Strictly sequential. One request at a time, in order. |
| Higher | Concurrent. Requests are handed to a free worker, and queue briefly if all are busy. |

Raise it when concurrent inbound requests matter and your script does not depend on ordering. Leave it at `1` when you want predictable sequential handling.

Do not keep state in module-level variables when Worker Count is above `1`. Each worker has its own copy, so the behaviour depends on which worker took the request.

### Working with the request

`main(Data)` receives the complete raw HTTP request text. Parse it and respond:

```lua
function main(Data)
   local req, err = linkiir.link.web.request{ data = Data }
   if not req then
      linkiir.link.web.respond{ code = 400, body = "Bad request" }
      return
   end

   linkiir.flow.push{ data = req.body }

   linkiir.link.web.respond{
      code = 200,
      contentType = "application/json",
      body = '{"accepted":true}',
   }
end
```

A new HTTP source node starts from a default script that does roughly this: parse the request, answer `400` if it cannot be parsed, echo the body back (or `Hello from Linkiir` when the body is empty), and push the body downstream **only when it is not empty**. An empty request body is answered but not pushed, so a health check or a stray `GET` does not enqueue a blank message. Replace the default with your own handling before the node goes anywhere near production.

Method checks, path checks, authentication, and body size limits are yours to enforce in the script — there are no node fields for them. Reject what you do not accept with an explicit status code rather than letting it through.

:::caution[There is no authentication field on this node]
An HTTP source node answers any request that reaches its route. If the node needs to be reachable beyond your own machine, enforce authentication in the script and restrict access at the network layer. See [Security](../../administration/security/index.md).
:::

Walkthrough: [Edit the Script and Start the HTTP Server](../../getting-started/start-http-server.md).

---

## Source LLP

Accepts HL7 v2 messages over an MLLP socket and returns an ACK.

### Core fields

| Field | Default | Notes |
| --- | --- | --- |
| **Listen Port** | `5349` | **Needed to start**, and must be greater than `0`. |
| **Acknowledgment Mode** | `Default` | **Needed to start.** `Default` or `Custom`. |
| **Message Encoding** | `Western (ISO-8859-1)` | Character encoding of inbound messages. |
| **Connection Timeout** | off | Turn on to close idle connections. |
| **Connection Timeout Minutes** | `30` | Shown when **Connection Timeout** is on. |

With `Custom`, an ACK script is also needed to start.

### Framing

| Field | Default | Notes |
| --- | --- | --- |
| **LLP Delimiters** | `Normal LLP` | `Normal LLP` or `Custom`. |
| **Messages Begin After** | `\x0B` | Start byte, with `Custom`. |
| **Messages Continue Until** | `\x1C\x0D` | End bytes, with `Custom`. |

Leave **LLP Delimiters** on `Normal LLP` unless the sending system documents non-standard framing. Mismatched framing shows up as messages that never complete or connections that hang, rather than as a clear error.

### TLS

| Field | Default | Notes |
| --- | --- | --- |
| **Use SSL** | off | Turn on to accept TLS connections. |
| **Certificate File** | *(empty)* | Shown with **Use SSL**. |
| **Private Key File** | *(empty)* | Shown with **Use SSL**. |
| **Verify Peer** | off | Require and verify a client certificate. |
| **Certificate Authority File** | *(empty)* | Used when verifying the peer. |

### Choosing an acknowledgment mode

| Mode | Use when |
| --- | --- |
| `Default` | The sender accepts a standard ACK. Fastest, no script to maintain. |
| `Custom` | The sender requires specific ACK codes, application-level validation, or non-standard fields. |

With `Custom`, the value your script returns is sent back to the sender as the ACK.

Decide deliberately what you acknowledge. An ACK sent before the message is safely handed onward tells the sender the message is accepted when it may not be — and once a sender has an ACK, it will not resend.

---

## Source File/FTP

Polls a directory, or an FTP/FTPS/SFTP server, and creates one message per file.

### Core fields

| Field | Default | Notes |
| --- | --- | --- |
| **Interval** | `10000` | **Needed to start**, and must be greater than `0`. Poll interval in milliseconds. |
| **Input Directory** | *(empty)* | **Needed to start.** Directory to poll. |
| **File Extension** | *(empty)* | **Needed to start.** Which files to pick up. |
| **Minimum File Age** | `0` | Seconds a file must be untouched before it is read. |
| **Input File Type** | *(empty)* | `Arbitrary text`, `HL7`, or `X12`. |
| **Input File Encoding** | `Western (ISO-8859-1)` | Character encoding of file contents. |
| **Hex EOF Character** | *(empty)* | End-of-file marker, when the sender writes one. |
| **Ignored Segments List** | *(empty)* | Segments to skip, for HL7 and X12 input. |

:::caution[Set Minimum File Age when a sender writes in place]
A poller can read a file the sender is still writing, producing a truncated message. Set **Minimum File Age** to a few seconds, or ask the sender to write to a temporary name and rename on completion. A rename is atomic and needs no age delay.
:::

### After a local file is processed

| Field | Options |
| --- | --- |
| **Processed Files** | `Delete processed files` or `Move processed files` |
| **Processed File Path** | Where successful files go, with `Move processed files` |
| **Error File Path** | Where failed files go |

Prefer `Move processed files` over deleting. A directory of processed files is the fastest way to answer "did we receive it?", and it lets you re-drop a file to reprocess it.

### FTP, FTPS, and SFTP

Turn on **Use FTP** to poll a remote server instead of a local directory.

| Field | Default | Notes |
| --- | --- | --- |
| **FTP Protocol** | `FTP` | `FTP`, `FTPS (FTP over SSL)`, or `SFTP (Secure Shell FTP)`. |
| **Authentication** | `Username/Password` | `Username/Password` or `Private/Public Key`. Shown for SFTP. |
| **FTP Server** | *(empty)* | **Needed to start** when **Use FTP** is on. |
| **FTP Port** | `21` | |
| **FTP Username** | *(empty)* | **Needed to start** when **Use FTP** is on. |
| **FTP Password** | *(empty)* | For password authentication. |
| **FTP Path** | *(empty)* | Remote directory to poll. |
| **Certificate File**, **FTPS Private Key File** | *(empty)* | For FTPS. |
| **SFTP Private Key File**, **Public Key File** | *(empty)* | For key-based SFTP. |
| **Verify Peer** | off | Leave on outside a trusted network. |
| **Verify Host Fingerprint** | off | Leave on outside a trusted network. |
| **Attempt to Reconnect** | `No` | `No`, `Yes (unlimited)`, or `Yes, with limit`. |
| **Reconnect Limit Times** | `60` | With `Yes, with limit`. |
| **Reconnection Interval** | `10000` | Milliseconds between attempts. |

After a remote file is downloaded, a second **Processed Files** field controls the remote side, with its own options: `Delete remote files after downloading` or `Move remote files after downloading to another remote directory`. With the move option, set **FTP Path for Downloaded Files**.

:::note[Two fields named Processed Files]
With **Use FTP** on, the form shows two fields with this label — one for the remote server and one for the local directory. Tell them apart by their options: the remote one names *remote files*.
:::

Choose SFTP or FTPS over plain FTP. Plain FTP sends credentials and file contents unencrypted.

Put the password in the project's **Variables** tab flagged **Secret**, and reference it, rather than typing it into the node. See [Project Settings](../../administration/configurations/project-settings.md).

---

## Source Custom

Runs your script on a timer. Use it when you fetch data yourself — from an API, a database, or a computation — rather than receiving it.

| Field | Default | Notes |
| --- | --- | --- |
| **Interval** | `10000` | **Needed to start**, and must be greater than `0`. Milliseconds between runs. |

Its Lua script is also needed to start.

`main` is called with **no argument** on this node type — there is no inbound message. Fetch or build your data and push each message:

```lua
function main()
   local resp, err = linkiir.link.web.get{
      url = "https://api.example.com/pending",
      timeout = 15,
   }
   if not resp then
      error("fetch failed: " .. err.message)
   end
   if resp.code >= 400 then
      error("source returned " .. resp.code)
   end

   linkiir.flow.push{ data = resp.body }
end
```

Declaring `main(Data)` here is harmless, but `Data` will be `nil`. Write `main()` so the signature matches what actually happens.

### Interval guidance

| Interval | Suits |
| --- | --- |
| `1000`–`5000` | Near-real-time polling of a fast, cheap source |
| `10000`–`60000` | Normal polling of an API or directory |
| Minutes | Batch pulls, scheduled extracts |

Keep the run shorter than the interval. A run that regularly takes longer than its interval means the node is always busy and the schedule stops being meaningful.

There is no cron-style schedule. For "once a day at 02:00", poll at a sensible interval and have the script decide whether it is time to act.

---

## Handling script errors

Custom nodes run your code, so a script error is a case you need to decide about. Whether an error stops the node or is skipped is behaviour of the node's error handling — see [Error Handling and Retry](../error-handling.md) for how to choose, and for keeping payload content out of error text.

For clinical interfaces, prefer stopping. A node that quietly skips messages can discard a day of data before anyone notices, and the durable queue means stopping loses nothing.

---

## Next

- [Destination Nodes](destination-nodes.md)
- [Custom Scripting Nodes](custom-scripting-nodes.md)
- [Linkiir Scripting API](../../api/scripting-api/index.md)
