---
title: Edit the Script and Start the HTTP Server
unlisted: true
---

# Edit the Script and Start the HTTP Server

You have a project, a workflow, and an HTTP source node on `/intake`. Now you write the script that handles each request, test it against a sample, start the node, and call the endpoint.

---

## 1. Open the script editor

1. Open the `Intake` node in the `HTTP Intake` workflow.
2. Switch to the **Scripting** tab.

The editor opens `main.lua`. Every Lua node has one entry point:

```lua
function main(Data)
   -- runs once per request
end
```

`main` is a global function. Linkiir calls it by name, so it must be declared exactly as `main` — a node whose script does not define it fails to start with `script does not define main()`.

## 2. Understand what `Data` contains

For an HTTP source node, `Data` is the **complete raw HTTP request text** — request line, headers, blank line, then the body:

```text
POST /intake HTTP/1.1
Host: 127.0.0.1:9001
Content-Type: application/json
Content-Length: 44

{"patientId":"TEST-1001","status":"active"}
```

You do not parse that by hand. Linkiir gives you a parser and a response builder.

| Call | Purpose |
| --- | --- |
| `linkiir.link.web.request{ data = Data }` | Turn the raw request into a table |
| `linkiir.link.web.respond{ code =, body = }` | Send the HTTP response back to the caller |

The parsed request table gives you:

| Field | Contains |
| --- | --- |
| `method` | `GET`, `POST`, and so on |
| `path` | The request path, without the query string |
| `body` | The raw request body |
| `headers` | Header name → value |
| `query` | Decoded query-string parameters |
| `form` | Decoded form fields when the body is form-encoded |
| `params` | `query` and `form` merged |
| `cookies` | Decoded cookies |
| `rawQuery`, `version` | The raw query string and HTTP version |

## 3. Write the script

Replace the contents of `main.lua` with this:

```lua
function main(Data)
   -- Parse the raw HTTP request.
   local req, err = linkiir.link.web.request{ data = Data }
   if not req then
      linkiir.link.web.respond{
         code = 400,
         contentType = "text/plain",
         body = "Bad request: " .. err.message,
      }
      return
   end

   print("Received " .. req.method .. " " .. req.path)

   -- Only accept POST for this route.
   if req.method ~= "POST" then
      linkiir.link.web.respond{
         code = 405,
         contentType = "text/plain",
         body = "Use POST",
      }
      return
   end

   -- Reject an empty body rather than passing it downstream.
   if req.body == nil or req.body == "" then
      linkiir.link.web.respond{
         code = 400,
         contentType = "text/plain",
         body = "Body is required",
      }
      return
   end

   -- Hand the payload to the next node in the workflow.
   local messageId = linkiir.flow.push{ data = req.body }

   -- Acknowledge the caller.
   linkiir.link.web.respond{
      code = 200,
      contentType = "application/json",
      body = '{"accepted":true,"messageId":"' .. messageId .. '"}',
   }
end
```

Save the script.

### What the three calls do

**`linkiir.link.web.request`** follows Linkiir's convention for operations that can fail on input: it returns the result, or `nil` plus an error table with `code` and `message`. Check the first return value before using it.

**`linkiir.flow.push`** hands the payload to whatever node you connect after this one. You do not name a destination — Linkiir resolves it from the workflow you drew. It returns a message ID, and it raises an error on failure rather than returning one, so a delivery problem stops the script instead of being silently ignored.

Your single-node workflow has nothing connected yet, so this push has no consumer. That is fine: the message is retained, and it will be delivered as soon as you add a downstream node.

**`linkiir.link.web.respond`** sends the HTTP response. `Content-Length` is added for you. If you never call it, Linkiir falls back to using whatever string `main` returns as a `200` response body — but calling it explicitly is clearer and lets you set the status code.

**`print`** output goes to the test console and to the node's events, so you can find it later in log search.

---

## 4. Test before starting anything

Testing runs your script without opening a port or sending anything to a real destination.

1. Create a sample from the **Samples** panel. Paste a raw HTTP request as the sample content:

   ```text
   POST /intake HTTP/1.1
   Host: 127.0.0.1:9001
   Content-Type: application/json

   {"patientId":"TEST-1001","status":"active"}
   ```

2. Select the sample in the toolbar dropdown.
3. Click **Run Test**.

The Debug panel shows the local variables at the end of `main` and the console output. You should see your `Received POST /intake` line.

:::info[Nothing leaves the test]
In both Run Test and Debug, `linkiir.flow.push` is forced into non-live mode. It validates your call and returns a placeholder message ID, but writes nothing to the queue. You can test freely without producing real messages.
:::

If you want to watch the script run line by line, click the editor gutter to set a breakpoint and use **Debug** instead. Full details in [Testing and Debugging Lua](../interface-development/lua-programming/testing-debugging.md).

### Fix errors here, not later

A script that fails to compile will not start. Run Test surfaces syntax and logic errors immediately, with the failing line, which is faster than starting the node and reading its error state.

---

## 5. Start the node

Starting the node is what opens the listener. Until then, nothing is answering on port `9001`.

1. Return to the workflow editor, or open the project popout.
2. Start the workflow, or start the `Intake` node on its own.

The node moves through these states:

| State | Meaning |
| --- | --- |
| `STOPPED` | Not running. Nothing is listening. |
| `STARTING` | Script compiling, workers spinning up, route binding. |
| `RUNNING` | Listening and ready to accept requests. |
| `STOPPING` | Finishing in-flight work before shutting down. |
| `ERRORED` | Failed to start, or hit an error it could not continue past. |

In the project popout and workflow list, a workflow's rolled-up state reads **Off**, **Running**, **Processing**, or **Failed**.

Wait for `RUNNING`. The node reaches it only after the script compiled, its workers are ready, **and** the route is bound — so `RUNNING` is a real guarantee that the endpoint answers.

### If the node goes to `ERRORED`

Check the node's status detail first; it carries the last error.

| Symptom | Likely cause |
| --- | --- |
| Reports a Lua error with a line number | Script problem. Fix it and use Run Test before starting again. |
| `missing required field: Route Path` | The field is blank. Set it and save. |
| `invalid required field: Worker Count (must be >= 1)` | Worker Count is `0` or negative. |
| Reports the port is unavailable | Another process holds port `9001`. Change **Port** in [**Settings → Http Server**](../administration/configurations/http-server.md) — saving a port change restarts the Runtime, so every running node restarts with it. |
| Two nodes conflict on a route | Two HTTP source nodes share the same **Route Path**. Give each its own. |
| The workflow will not start and mentions capacity | The license limits how many workflows run at once, and how many nodes a workflow may contain. See [Licensing](../administration/licensing/index.md). |

---

## 6. Call the endpoint

```bash
curl -i -X POST http://127.0.0.1:9001/intake \
  -H 'Content-Type: application/json' \
  -d '{"patientId":"TEST-1001","status":"active"}'
```

Expected response:

```text
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 52

{"accepted":true,"messageId":"..."}
```

Check the guard clauses too:

```bash
# Wrong method → 405
curl -i http://127.0.0.1:9001/intake

# Empty body → 400
curl -i -X POST http://127.0.0.1:9001/intake
```

:::note[Requests only work from this machine]
Node listeners bind to `127.0.0.1` by default. `curl` from another machine will not connect until you deliberately change that. See [Security](../administration/security/index.md).
:::

---

## 7. Confirm it in the logs

Open **Logs** in the Grid and search for recent events in the `Getting Started` project.

You should find:

- A data record holding the payload you posted.
- Node events for the request, including your `print` output.

Open the data record to view the archived payload, and note its correlation ID. As you add nodes to this workflow, that same correlation ID appears at every node — searching it returns the whole journey of one message. See [Logging](../administration/troubleshooting/index.md) for the filters available.

:::tip[Give the Archiver a moment]
Message history is written by the Log Archiver in the background, so a record can take a second or two to appear in search. Live node state, by contrast, updates immediately in the workflow view.
:::

---

## 8. Stop the node

Stop the workflow or the node when you are done. Stopping releases the route and lets in-flight requests finish first.

---

## What you built

```text
Getting Started              project
└─ HTTP Intake               workflow
   └─ Intake                 Source HTTP on /intake
                             parses the request, pushes the payload,
                             and answers the caller

Settings → Http Server       installation-wide, port 9001
```

## Where to go next

| Goal | Read |
| --- | --- |
| Add a transform or a destination after this node | [Interfaces and Core Nodes](../interface-development/interfaces/index.md) |
| Work with HL7 v2, X12, XML, or JSON payloads | [Linkiir Scripting API](../api/scripting-api/index.md) |
| See a full HL7 interface end to end | [Demo: HL7 LLP → Scripting → LLP](../interface-development/sample-code/hl7-llp-scripting-llp.md) |
| Handle failures and retries properly | [Error Handling and Retry](../interface-development/error-handling.md) |
| Move this into a real environment | [Deployment](../administration/deployment/index.md) |
