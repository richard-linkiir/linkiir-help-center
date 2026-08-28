---
title: "Demo: HTTP Source to File"
---

# Demo: HTTP Source to File

A three-node interface that accepts a JSON request over HTTP, transforms it, and writes the result to a file.

```text
Source HTTP  →  Transform Custom  →  Destination File/FTP
   /intake         normalise             ./out
```

If you have not built an HTTP source node before, work through [Getting Started](../../getting-started/index.md) first — it builds the first node of this interface step by step.

---

## 1. Turn on the HTTP server

In **Settings → Http Server**:

| Setting | Value |
| --- | --- |
| **Use Server** | On |
| **Port** | `9001` |

This is an installation-wide setting shared by every HTTP source node, not a per-project one. See [Source Nodes](../interfaces/source-nodes.md).

---

## 2. Source HTTP node — `Intake`

Drag **HTTP** from the **Source** group of the palette.

| Field | Value |
| --- | --- |
| **Route Path** | `/intake` |
| **Worker Count** | `1` |

`main(Data)` receives the complete raw HTTP request text. Parse it, validate, hand the payload onward, and answer the caller.

```lua
function main(Data)
   local req, err = linkiir.link.web.request{ data = Data }
   if not req then
      linkiir.link.web.respond{
         code = 400,
         contentType = "text/plain",
         body = "Malformed request: " .. err.message,
      }
      return
   end

   if req.method ~= "POST" then
      linkiir.link.web.respond{
         code = 405,
         contentType = "text/plain",
         body = "Use POST",
      }
      return
   end

   if req.body == nil or req.body == "" then
      linkiir.link.web.respond{
         code = 400,
         contentType = "text/plain",
         body = "Body is required",
      }
      return
   end

   local messageId = linkiir.flow.push{ data = req.body }

   linkiir.link.web.respond{
      code = 200,
      contentType = "application/json",
      body = '{"accepted":true,"messageId":"' .. messageId .. '"}',
   }
end
```

There are no node fields for method or body-size limits. Enforce what you accept in the script, and reject the rest with an explicit status code.

---

## 3. Transform Custom node — `Normalise`

Drag **Custom** from the **Transform** group. It has no configuration fields of its own.

Connect `Intake` to this node. Its `main(Data)` receives the payload the source pushed.

JSON is handled by `linkiir.json`, which returns ordinary Lua tables — no schema file needed.

```lua
function main(Data)
   local input = linkiir.json.parse(Data)

   local patientId = input.patientId
   if patientId == nil or patientId == "" then
      error("patientId is missing")
   end

   local output = {
      patientId = patientId,
      status    = string.upper(input.status or "UNKNOWN"),
      processed = true,
   }

   linkiir.flow.push{ data = linkiir.json.serialize(output), key = patientId }
end
```

Passing `key = patientId` gives the message a meaningful correlation key, which makes it easy to find in log search later.

`linkiir.json.parse` raises on malformed input, so a request that got past the source node's checks but is not valid JSON stops here rather than producing a broken output message.

:::note[JSON and HL7 use different modules]
`linkiir.json` returns plain Lua tables. `linkiir.data` returns a navigable node tree and is for HL7 v2, X12, and XML — passing `type = "json"` to it is an error. The [HL7 demo](hl7-llp-scripting-llp.md) shows the tree style.
:::

---

## 4. Destination File/FTP node — `Write`

Drag **File/FTP** from the **Destination** group.

| Field | Value |
| --- | --- |
| **Output Directory** | A local directory you can read, such as `./out` |
| **Write Each Message To** | `Separate files` |
| **Use as File ID** | `Unique ID (YYYYMMDDhhmmss_XXXXX)` |
| **Output File Mask** | `%i.json` |
| **Temporary File Extension** | `tmp` |

Connect `Normalise` to this node. It has no script — it consumes and writes.

Keep **Temporary File Extension** different from the extension in **Output File Mask**, so anything watching `./out` for `*.json` never sees a partial file.

---

## 5. Test each script before starting

For `Intake`, add a sample containing a raw HTTP request. The blank line before the body is required:

```text
POST /intake HTTP/1.1
Host: 127.0.0.1:9001
Content-Type: application/json

{"patientId":"TEST-1001","status":"active"}
```

For `Normalise`, add a sample containing just the JSON body:

```json
{"patientId":"TEST-1001","status":"active"}
```

Click **Run Test** on each and confirm the console output and final variables. `linkiir.flow.push` is non-live during a test, so nothing is produced. See [Testing and Debugging Lua](../lua-programming/testing-debugging.md).

---

## 6. Start and call it

Start the workflow and wait for every node to reach `RUNNING`.

```bash
curl -i -X POST http://127.0.0.1:9001/intake \
  -H 'Content-Type: application/json' \
  -d '{"patientId":"TEST-1001","status":"active"}'
```

Expected response:

```text
HTTP/1.1 200 OK
Content-Type: application/json

{"accepted":true,"messageId":"..."}
```

Expected file in the output directory:

```json
{"patientId":"TEST-1001","status":"ACTIVE","processed":true}
```

Check the rejections too:

```bash
curl -i http://127.0.0.1:9001/intake                      # 405, wrong method
curl -i -X POST http://127.0.0.1:9001/intake              # 400, empty body
curl -i -X POST http://127.0.0.1:9001/intake \
  -H 'Content-Type: application/json' -d '{"status":"active"}'   # accepted, then errors in Normalise
```

The last one is worth watching: the source accepts it because the body is present, and `Normalise` rejects it because `patientId` is missing. The caller already got its `200`, so the failure shows up in the logs rather than in the HTTP response. That is the normal consequence of acknowledging on receipt — validate in the source instead if the caller must be told.

---

## 7. Verify in the logs

Open **Logs** and search the `patientId` value, `TEST-1001`, or filter by project.

You should find records at all three nodes sharing one correlation ID:

| Node | Record |
| --- | --- |
| `Intake` | The payload as received, plus your `print` output |
| `Normalise` | The transformed payload |
| `Write` | The delivery event |

Open a data record to view the archived payload. Searching the correlation ID returns the whole journey — that is how you answer "what happened to this message?" in production.

---

## Extending this

| Change | How |
| --- | --- |
| Return a `400` for a missing `patientId` | Move the validation into `Intake`, before the push |
| Handle concurrent callers | Raise `Worker Count` on `Intake` |
| Deliver over HTTP instead of to a file | Drop `Write`; call `linkiir.link.web.post` from `Normalise` |
| Split a batch request | Loop over the parsed array and push once per item in `Normalise` |
| Serve HTTPS | Enable **Secure** in **Settings → Http Server** and supply certificates. This affects every route on the installation. |

---

## Next

- [Demo: HL7 LLP → Scripting → LLP](hl7-llp-scripting-llp.md)
- [Linkiir Scripting API](../../api/scripting-api/index.md)
- [Error Handling and Retry](../error-handling.md)
