---
title: Connectivity
---

# Connectivity

`linkiir.link`

All connectivity to external systems, named for the heart of Linkiir. Sub-areas: web (HTTP), socket (TCP), mail (SMTP), file (FTP/FTPS/SFTP). All calls return result, err.


Every outbound HTTP call can present a client certificate, for destinations that require mutual TLS. See [Client certificates (mutual TLS)](#client-certificates-mutual-tls).

---

## Client certificates (mutual TLS)

Some partner APIs require **mutual TLS** (mTLS): during the TLS handshake the server asks the client to prove who it is with a certificate, and refuses the request without one. Add a `tls` table to any outbound `linkiir.link.web.*` call to present that certificate.

```lua
tls = { certFile = 'certs/partner-client.pem',
        keyFile  = 'certs/partner-client.key',
        caFile   = 'certs/partner-ca.pem' }
```

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `certFile` | string | With `keyFile` | Path to the client certificate file (PEM). |
| `keyFile` | string | With `certFile` | Path to the matching private key file (PEM), not passphrase-protected. |
| `caFile` | string | No | Path to the certificate authority file (PEM) used to verify the destination's certificate. Omit to use the system CA store. |

### How the fields behave

- `certFile` and `keyFile` are supplied together. One without the other raises a Lua error before any connection is opened.
- `caFile` is independent. Use it on its own when a destination presents a certificate signed by a private CA, with or without a client certificate.
- Leaving `tls` out sends the request exactly as it was sent before. Existing scripts need no change.
- Paths follow the same rules as `linkiir.sys.fs`: a relative path resolves against the Runtime working directory (`linkiir.sys.workingDir()`), an absolute path is used unchanged, and a relative path that escapes the working directory with `..` is rejected.
- Each file must exist and be readable by the account the Runtime runs as. If one is not, the call raises a Lua error naming the field and the full path it tried, before contacting the destination.
- `tls` is accepted by `get`, `post`, `put`, `patch`, `delete`, `head`, and `options`, and behaves identically on all seven.
- `linkiir.link.web.request` and `linkiir.link.web.respond` do not accept `tls`. They handle an inbound request, where a client certificate has no meaning.
- `tls` combines with `auth`. One request can present a client certificate and send Basic or Bearer credentials at the same time, which is what a token endpoint behind mTLS usually needs.

Scripts pass file paths only. Certificate and key contents are never loaded into a script value, so private keys do not appear in log records, message data, or script output.

:::caution[tls and verifyTls control different things]
`tls` decides what Linkiir presents about itself. `verifyTls` decides whether Linkiir checks the *destination's* certificate. Adding `tls` leaves `verifyTls` at whatever it was, and the client certificate is presented for whatever value `verifyTls` holds. Keep `verifyTls` at its default of `true` for production destinations.
:::

### Prepare the certificate files

Linkiir reads PEM files, and the private key must not be passphrase-protected. This is the same format as the **Certificate File** and **Private Key File** fields in [HTTP Server Settings](../../administration/configurations/http-server.md).

If the partner issued a `.pfx` or `.p12` bundle, convert it once before pointing a script at it:

```bash
openssl pkcs12 -in partner-client.pfx -clcerts -nokeys -out partner-client.pem
openssl pkcs12 -in partner-client.pfx -nocerts -nodes -out partner-client.key
```

| File | What it is | Used as |
| --- | --- | --- |
| `partner-client.pfx` | The bundle the partner issued | Input to the conversion only |
| `partner-client.pem` | Certificate extracted from the bundle | `certFile` |
| `partner-client.key` | Private key extracted from the bundle | `keyFile` |

The CA file comes from the partner separately, and is only needed when the destination's certificate is signed by a private CA.

Then:

1. Copy the certificate, the key, and the CA file if you have one to the Linkiir server, on a path the Runtime account can read — for example `certs/` under the Runtime working directory.
2. Restrict the key file so only the Runtime account can read it (`chmod 600` on Linux, or remove inherited access on Windows).
3. Reference the files from the script by path, as shown above.

### Error codes

| Code | What it means |
| --- | --- |
| `TLS_CLIENT_CERT_ERROR` | The certificate or key file could not be used: wrong format, a certificate and key that do not match, or a passphrase-protected key. |
| `TLS_CA_ERROR` | The file given as `caFile` could not be read as a certificate authority file. |
| `TLS_ERROR` | The handshake failed. Common causes: the destination rejected the certificate, the certificate expired, or the destination's own certificate did not verify against `caFile`. |

A destination that requires a client certificate and does not get one usually answers with a normal HTTP error response rather than a handshake failure, so check `Resp.code` as well as `Err`.

### Example: token exchange, then a data call

Both legs use the same certificate. The first leg adds Basic credentials, the second uses the token it returned.

```lua
local Tls = {
   certFile = 'certs/partner-client.pem',
   keyFile  = 'certs/partner-client.key',
   caFile   = 'certs/partner-ca.pem',
}

local TokenResp, TokenErr = linkiir.link.web.post{
   url     = 'https://api.example.com/auth/token',
   headers = { ['Content-Type'] = 'application/x-www-form-urlencoded' },
   body    = 'grant_type=client_credentials',
   -- Credentials come from the project's Variables tab, never a literal here
   auth    = { type = 'basic', user = ClientId, password = ClientSecret },
   tls     = Tls,
}
if not TokenResp then error(TokenErr.message) end
if TokenResp.code ~= 200 then error('token request returned ' .. TokenResp.code) end

local Token = linkiir.json.parse(TokenResp.body).access_token

local Resp, Err = linkiir.link.web.post{
   url     = 'https://api.example.com/v1/observations',
   headers = { ['Content-Type'] = 'application/json' },
   body    = linkiir.json.serialize(Out),
   auth    = { type = 'bearer', token = Token },
   tls     = Tls,
}
if not Resp then error(Err.message) end
print(Resp.code, Resp.body)
```

---

## `linkiir.link.web.get`

*function*

```lua
linkiir.link.web.get{ url=, headers=, params=, body=, auth=, timeout=, tls=, verifyTls=, live= }
```

Perform an outbound HTTP GET request. The tls sub-table is supported identically on all seven verbs (get, post, put, patch, delete, head, options), which share one request path.

**Usage**

```lua
linkiir.link.web.get{ url=, headers=, params=, body=, auth=, timeout=, tls=, verifyTls=, live= }
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `url` | string | Yes | Target URL. |
| `headers` | table | No | Request headers. |
| `params` | table | No | Query-string parameters. |
| `body` | string | No | Request body (POST/PUT/PATCH). |
| `auth` | table | No | `{ type='basic'\|'bearer', user=, password=, token= }.` |
| `timeout` | integer | No | Seconds. |
| `tls` | table | No | `Client certificate for mutual TLS (mTLS): { certFile=, keyFile=, caFile= }. All three are filesystem paths to PEM files - certificate or key material is never accepted inline, so a private key never enters script memory. PEM is the only accepted format, matching the Linkiir web server's Certificate File and Private Key File settings; convert a PKCS#12 bundle or an encrypted key once with openssl before use. certFile and keyFile must be supplied together. caFile pins the trust anchor for verifying the server and may be used with or without a client certificate; it does not disable verification, which stays with verifyTls. Relative paths resolve against the working directory and may not escape it; absolute paths are used unchanged. Each path must be a readable file or the call raises before any request is made.` |
| `verifyTls` | boolean | No | Default true. |
| `live` | boolean | No | Default true. |

**Returns**

- `resp = { code=<int>, body=<string>, headers=<table> } on success`
- nil, err on failure

**Errors**

Returns result, err (err = \{ code=, message= \}).

Codes: `INVALID_URL`, `TIMEOUT`, `TLS_ERROR`, `TLS_CLIENT_CERT_ERROR`, `TLS_CA_ERROR`, `CONNECT_FAILED`, `HTTP_ERROR`

**Example**

```lua
local Resp, Err = linkiir.link.web.get{ url = 'https://fhir.example.com/Patient/123' }
if not Resp then error(Err.message) end
print(Resp.code, Resp.body)
```

```lua
-- mTLS applies to every verb, not just post: the tls sub-table is read on
-- one shared request path. Here it is on a read, with a bearer token.
local Resp, Err = linkiir.link.web.get{
   url    = Cfg.pcc_api_base .. '/orgs/' .. Cfg.pcc_org_uuid .. '/patients',
   params = { facId = Cfg.pcc_fac_id },
   auth   = { type = 'bearer', token = Token },
   tls    = { certFile = Cfg.pcc_cert_file,   -- 0644
              keyFile  = Cfg.pcc_key_file },  -- 0600
}
if not Resp then error('transport failure: ' .. Err.code) end
if Resp.code ~= 200 then error('lookup rejected: HTTP ' .. Resp.code) end
```


## `linkiir.link.web.post`

*function*

```lua
linkiir.link.web.post{ url=, headers=, params=, body=, auth=, timeout=, tls=, verifyTls=, live= }
```

Perform an outbound HTTP POST request.

Perform an outbound HTTP POST request, sending `body` as the request payload. The tls sub-table is supported identically on all seven verbs (get, post, put, patch, delete, head, options), which share one request path.

**Usage**

```lua
linkiir.link.web.post{ url=, headers=, params=, body=, auth=, timeout=, tls=, verifyTls=, live= }
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `url` | string | Yes | Target URL. |
| `headers` | table | No | Request headers. |
| `params` | table | No | Query-string parameters. |
| `body` | string | No | Request body (POST/PUT/PATCH). |
| `auth` | table | No | `{ type='basic'\|'bearer', user=, password=, token= }.` |
| `timeout` | integer | No | Seconds. |
| `tls` | table | No | `Client certificate for mutual TLS (mTLS): { certFile=, keyFile=, caFile= }. All three are filesystem paths to PEM files.` |
| `verifyTls` | boolean | No | Default true. |
| `live` | boolean | No | Default true. |

**Returns**

- `resp = { code=<int>, body=<string>, headers=<table> } on success`
- nil, err on failure

**Errors**

Returns result, err (err = \{ code=, message= \}).

Codes: `INVALID_URL`, `TIMEOUT`, `TLS_ERROR`, `TLS_CLIENT_CERT_ERROR`, `TLS_CA_ERROR`, `CONNECT_FAILED`, `HTTP_ERROR`

**Example**

```lua
local Resp, Err = linkiir.link.web.post{
   url     = 'https://fhir.example.com/Patient',
   headers = { ['Content-Type'] = 'application/fhir+json' },
   body    = linkiir.data.serialize{ data = Out },
   auth    = { type = 'bearer', token = Token },
}
if not Resp then error(Err.message) end
print(Resp.code, Resp.body)
```

```lua
-- Two-legged OAuth over mTLS: HTTP Basic *and* a client certificate on
-- the same request, then a bearer token plus the same certificate.
-- Recommended permissions: certificate 0644, private key 0600, both
-- outside any project directory so they never enter a project repository.
local Cfg = linkiir.config.node()
local Tls = { certFile = Cfg.pcc_cert_file,   -- certs/pcc-client.pem
              keyFile  = Cfg.pcc_key_file }   -- certs/pcc-client.key

local Resp, Err = linkiir.link.web.post{
   url     = Cfg.pcc_token_url,
   auth    = { type = 'basic', user = Cfg.pcc_client_id,
               password = Cfg.pcc_client_secret },
   headers = { ['Content-Type'] = 'application/x-www-form-urlencoded' },
   body    = 'grant_type=client_credentials',
   timeout = 20,
   tls     = Tls,
}
if not Resp then error('token transport failure: ' .. Err.code) end
local Token = linkiir.json.parse(Resp.body).access_token

local Obs = linkiir.link.web.post{
   url     = Cfg.pcc_api_base .. '/observations',
   auth    = { type = 'bearer', token = Token },
   headers = { ['Content-Type'] = 'application/json' },
   body    = linkiir.json.serialize(Payload),
   tls     = Tls,
}
if not Obs then error('api transport failure: ' .. Err.code) end
```


## `linkiir.link.web.put`

*function*

```lua
linkiir.link.web.put{ url=, headers=, params=, body=, auth=, timeout=, tls=, verifyTls=, live= }
```

Perform an outbound HTTP PUT request.

Perform an outbound HTTP PUT request, sending `body` as the request payload. The tls sub-table is supported identically on all seven verbs (get, post, put, patch, delete, head, options), which share one request path.

**Usage**

```lua
linkiir.link.web.put{ url=, headers=, params=, body=, auth=, timeout=, tls=, verifyTls=, live= }
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `url` | string | Yes | Target URL. |
| `headers` | table | No | Request headers. |
| `params` | table | No | Query-string parameters. |
| `body` | string | No | Request body (POST/PUT/PATCH). |
| `auth` | table | No | `{ type='basic'\|'bearer', user=, password=, token= }.` |
| `timeout` | integer | No | Seconds. |
| `tls` | table | No | `Client certificate for mutual TLS (mTLS): { certFile=, keyFile=, caFile= }. All three are filesystem paths to PEM files.` |
| `verifyTls` | boolean | No | Default true. |
| `live` | boolean | No | Default true. |

**Returns**

- `resp = { code=<int>, body=<string>, headers=<table> } on success`
- nil, err on failure

**Errors**

Returns result, err (err = \{ code=, message= \}).

Codes: `INVALID_URL`, `TIMEOUT`, `TLS_ERROR`, `TLS_CLIENT_CERT_ERROR`, `TLS_CA_ERROR`, `CONNECT_FAILED`, `HTTP_ERROR`

**Example**

```lua
local Resp, Err = linkiir.link.web.put{
   url  = 'https://fhir.example.com/Patient/123',
   body = linkiir.data.serialize{ data = Out },
}
if not Resp then error(Err.message) end
```


## `linkiir.link.web.patch`

*function*

```lua
linkiir.link.web.patch{ url=, headers=, params=, body=, auth=, timeout=, tls=, verifyTls=, live= }
```

Perform an outbound HTTP PATCH request.

Perform an outbound HTTP PATCH request, sending `body` as the request payload. The tls sub-table is supported identically on all seven verbs (get, post, put, patch, delete, head, options), which share one request path.

**Usage**

```lua
linkiir.link.web.patch{ url=, headers=, params=, body=, auth=, timeout=, tls=, verifyTls=, live= }
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `url` | string | Yes | Target URL. |
| `headers` | table | No | Request headers. |
| `params` | table | No | Query-string parameters. |
| `body` | string | No | Request body (POST/PUT/PATCH). |
| `auth` | table | No | `{ type='basic'\|'bearer', user=, password=, token= }.` |
| `timeout` | integer | No | Seconds. |
| `tls` | table | No | `Client certificate for mutual TLS (mTLS): { certFile=, keyFile=, caFile= }. All three are filesystem paths to PEM files.` |
| `verifyTls` | boolean | No | Default true. |
| `live` | boolean | No | Default true. |

**Returns**

- `resp = { code=<int>, body=<string>, headers=<table> } on success`
- nil, err on failure

**Errors**

Returns result, err (err = \{ code=, message= \}).

Codes: `INVALID_URL`, `TIMEOUT`, `TLS_ERROR`, `TLS_CLIENT_CERT_ERROR`, `TLS_CA_ERROR`, `CONNECT_FAILED`, `HTTP_ERROR`

**Example**

```lua
local Resp, Err = linkiir.link.web.patch{
   url  = 'https://fhir.example.com/Patient/123',
   body = linkiir.json.serialize{ active = false },
}
if not Resp then error(Err.message) end
```


## `linkiir.link.web.delete`

*function*

```lua
linkiir.link.web.delete{ url=, headers=, params=, body=, auth=, timeout=, tls=, verifyTls=, live= }
```

Perform an outbound HTTP DELETE request. The tls sub-table is supported identically on all seven verbs (get, post, put, patch, delete, head, options), which share one request path.

**Usage**

```lua
linkiir.link.web.delete{ url=, headers=, params=, body=, auth=, timeout=, tls=, verifyTls=, live= }
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `url` | string | Yes | Target URL. |
| `headers` | table | No | Request headers. |
| `params` | table | No | Query-string parameters. |
| `body` | string | No | Request body (POST/PUT/PATCH). |
| `auth` | table | No | `{ type='basic'\|'bearer', user=, password=, token= }.` |
| `timeout` | integer | No | Seconds. |
| `tls` | table | No | `Client certificate for mutual TLS (mTLS): { certFile=, keyFile=, caFile= }. All three are filesystem paths to PEM files.` |
| `verifyTls` | boolean | No | Default true. |
| `live` | boolean | No | Default true. |

**Returns**

- `resp = { code=<int>, body=<string>, headers=<table> } on success`
- nil, err on failure

**Errors**

Returns result, err (err = \{ code=, message= \}).

Codes: `INVALID_URL`, `TIMEOUT`, `TLS_ERROR`, `TLS_CLIENT_CERT_ERROR`, `TLS_CA_ERROR`, `CONNECT_FAILED`, `HTTP_ERROR`

**Example**

```lua
local Resp, Err = linkiir.link.web.delete{ url = 'https://fhir.example.com/Patient/123' }
if not Resp then error(Err.message) end
```


## `linkiir.link.web.head`

*function*

```lua
linkiir.link.web.head{ url=, headers=, params=, body=, auth=, timeout=, tls=, verifyTls=, live= }
```

Perform an outbound HTTP HEAD request.

Perform an outbound HTTP HEAD request; the response has no body. The tls sub-table is supported identically on all seven verbs (get, post, put, patch, delete, head, options), which share one request path.

**Usage**

```lua
linkiir.link.web.head{ url=, headers=, params=, body=, auth=, timeout=, tls=, verifyTls=, live= }
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `url` | string | Yes | Target URL. |
| `headers` | table | No | Request headers. |
| `params` | table | No | Query-string parameters. |
| `body` | string | No | Request body (POST/PUT/PATCH). |
| `auth` | table | No | `{ type='basic'\|'bearer', user=, password=, token= }.` |
| `timeout` | integer | No | Seconds. |
| `tls` | table | No | `Client certificate for mutual TLS (mTLS): { certFile=, keyFile=, caFile= }. All three are filesystem paths to PEM files.` |
| `verifyTls` | boolean | No | Default true. |
| `live` | boolean | No | Default true. |

**Returns**

- `resp = { code=<int>, body=<string>, headers=<table> } on success`
- nil, err on failure

**Errors**

Returns result, err (err = \{ code=, message= \}).

Codes: `INVALID_URL`, `TIMEOUT`, `TLS_ERROR`, `TLS_CLIENT_CERT_ERROR`, `TLS_CA_ERROR`, `CONNECT_FAILED`, `HTTP_ERROR`

**Example**

```lua
local Resp, Err = linkiir.link.web.head{ url = 'https://fhir.example.com/Patient/123' }
if not Resp then error(Err.message) end
print(Resp.code)
```


## `linkiir.link.web.options`

*function*

```lua
linkiir.link.web.options{ url=, headers=, params=, body=, auth=, timeout=, tls=, verifyTls=, live= }
```

Perform an outbound HTTP OPTIONS request. The tls sub-table is supported identically on all seven verbs (get, post, put, patch, delete, head, options), which share one request path.

**Usage**

```lua
linkiir.link.web.options{ url=, headers=, params=, body=, auth=, timeout=, tls=, verifyTls=, live= }
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `url` | string | Yes | Target URL. |
| `headers` | table | No | Request headers. |
| `params` | table | No | Query-string parameters. |
| `body` | string | No | Request body (POST/PUT/PATCH). |
| `auth` | table | No | `{ type='basic'\|'bearer', user=, password=, token= }.` |
| `timeout` | integer | No | Seconds. |
| `tls` | table | No | `Client certificate for mutual TLS (mTLS): { certFile=, keyFile=, caFile= }. All three are filesystem paths to PEM files.` |
| `verifyTls` | boolean | No | Default true. |
| `live` | boolean | No | Default true. |

**Returns**

- `resp = { code=<int>, body=<string>, headers=<table> } on success`
- nil, err on failure

**Errors**

Returns result, err (err = \{ code=, message= \}).

Codes: `INVALID_URL`, `TIMEOUT`, `TLS_ERROR`, `TLS_CLIENT_CERT_ERROR`, `TLS_CA_ERROR`, `CONNECT_FAILED`, `HTTP_ERROR`

**Example**

```lua
local Resp, Err = linkiir.link.web.options{ url = 'https://fhir.example.com/Patient/123' }
if not Resp then error(Err.message) end
print(Resp.headers['Allow'])
```


## `linkiir.link.web.request`

*function*

```lua
linkiir.link.web.request()
```

Read the inbound HTTP request (From-HTTP context).

In an inbound HTTP context, returns the parsed inbound request.

**Usage**

```lua
local Req = linkiir.link.web.request()
```

**Returns**

- `{ method=, path=, headers=, params=, body= }` — the parsed inbound request.

**Errors**

Raises a Lua error on failure.

Codes: `CONTEXT_UNAVAILABLE`

**Example**

```lua
local Req = linkiir.link.web.request()
```


## `linkiir.link.web.respond`

*function*

```lua
linkiir.link.web.respond{ code=, body=, headers= }
```

Send the HTTP response (From-HTTP context).

In an inbound HTTP context, sends the HTTP response for the current request.

**Usage**

```lua
linkiir.link.web.respond{ code=, body=, headers= }
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `code` | integer | Yes | HTTP status code. |
| `body` | string | No | Response body. |
| `headers` | table | No | Response headers. |

**Returns**

- ok, err

**Errors**

respond() returns ok, err.

Codes: `CONTEXT_UNAVAILABLE`, `IO_ERROR`

**Example**

```lua
linkiir.link.web.respond{ code = 200, body = '{"status":"ok"}',
                    headers = { ['Content-Type'] = 'application/json' } }
```


## `linkiir.link.socket.connect`

*function*

```lua
linkiir.link.socket.connect{ host=, port=, timeout= }
```

Open a raw TCP socket.

Open a raw TCP socket for custom LLP/TCP clients.

**Usage**

```lua
local sock, err = linkiir.link.socket.connect{ host=, port=, timeout= }
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `host` | string | Yes | Target host. |
| `port` | integer | Yes | Target port. |
| `timeout` | integer | No | Connect timeout (seconds). |

**Returns**

- sock (socket object) on success — see the Socket:* methods in this module.
- nil, err on failure

**Errors**

Returns result, err.

Codes: `CONNECT_FAILED`, `TIMEOUT`, `IO_ERROR`

**Example**

```lua
local Sock, Err = linkiir.link.socket.connect{ host = '10.0.0.5', port = 5001, timeout = 5 }
if not Sock then error(Err.message) end
Sock:send(Msg:text())
local Reply = Sock:recv()
Sock:close()
```


## `linkiir.link.mail.send`

*function*

```lua
linkiir.link.mail.send{ server=, from=, to=, header=, body=, … }
```

Send an email over SMTP.

Send email through SMTP via libcurl. Returns ok, err following the I/O convention.

**Usage**

```lua
linkiir.link.mail.send{ server=, from=, to=, header=, body=, username=, password=, use_ssl=, timeout=, verifyTls=, live= }
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `server` | string | Yes | SMTP URL (smtp://host:port) or plain hostname. |
| `from` | string | Yes | Envelope sender address (MAIL FROM). |
| `to` | table | Yes | Array of recipient addresses (RCPT TO). |
| `header` | table | No | Email headers as key/value pairs (Subject, From, To, Date). |
| `body` | string | No | Email body text. |
| `username` | string | No | SMTP auth username. |
| `password` | string | No | SMTP auth password. |
| `use_ssl` | string | No | 'yes' (require TLS), 'try' (STARTTLS if available), or '' (none). |
| `timeout` | integer | No | Seconds (default 15). |
| `verifyTls` | boolean | No | TLS verification, default true. |
| `live` | boolean | No | Default true; false simulates. |

**Returns**

- true on success
- nil, err on failure

**Errors**

Returns ok, err.

Codes: `INVALID_SERVER`, `MISSING_PARAM`, `AUTH_FAILED`, `CONNECT_FAILED`, `TLS_ERROR`, `TIMEOUT`, `SEND_FAILED`

**Example**

```lua
local ok, err = linkiir.link.mail.send{
   server   = 'smtp://mail.example.com:587',
   from     = 'alerts@example.com',
   to       = { 'oncall@example.com', 'admin@example.com' },
   header   = { From = 'alerts@example.com', To = 'oncall@example.com',
                Subject = 'Interface Alert', Date = os.date() },
   body     = 'The ADT feed has stopped.',
   username = 'alerts@example.com', password = Secret,
   use_ssl  = 'try',
}
if not ok then error(err.message) end
```


## `linkiir.link.file.open`

*function*

```lua
linkiir.link.file.open{ scheme='ftp'|'ftps'|'sftp', host=, … }
```

File transfer over FTP / FTPS / SFTP.

Unified file transfer with a scheme selector, instead of three near-identical modules (net.ftp / net.ftps / net.sftp).

**Usage**

```lua
local conn, err = linkiir.link.file.open{ scheme=, host=, port=, user=, password=, key=, timeout= }
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `scheme` | string | Yes | 'ftp' \| 'ftps' \| 'sftp'. |
| `host` | string | Yes | Server host. |
| `user` | string | No | Username. |
| `password` | string | No | Password. |
| `key` | string | No | Private key (SFTP). |
| `port` | integer | No | Server port. |
| `timeout` | integer | No | Connect timeout. |

**Returns**

- conn (connection object) on success — see the FileConnection:* methods in this module.
- nil, err on failure

**Errors**

Returns result, err.

Codes: `AUTH_FAILED`, `CONNECT_FAILED`, `NOT_FOUND`, `IO_ERROR`

**Example**

```lua
local Conn, Err = linkiir.link.file.open{ scheme = 'sftp', host = 'sftp.lab.example.com',
                                   user = 'feed', key = KeyPem }
if not Conn then error(Err.message) end
Conn:put{ ['local'] = '/tmp/out.hl7', remote = '/inbound/out.hl7' }
Conn:close()
```


## Socket methods

### `Socket:send`

*method of `Socket`*

```lua
sock:send(data [, startByte [, endByte]])
```

Send bytes over the socket.

**Usage**

```lua
local n, err = sock:send(data)
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `data` | string | Yes | Bytes to send. |
| `startByte` | integer | No | 1-based start offset into data; defaults to the beginning. |
| `endByte` | integer | No | 1-based end offset into data; defaults to the end. |

**Returns**

- bytesSent, err

**Example**

```lua
local Sent, Err = Sock:send(Msg:text())
if not Sent then error(Err.message) end
```


### `Socket:recv`

*method of `Socket`*

```lua
sock:recv([maxBytes])
```

Receive data (nil when closed).

**Usage**

```lua
local data, err = sock:recv()
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `maxBytes` | integer | No | Maximum bytes to read; defaults to a runtime buffer size. |

**Returns**

- data, err

**Example**

```lua
local Reply, Err = Sock:recv()
if Reply == nil then print('connection closed') end
```


### `Socket:close`

*method of `Socket`*

```lua
sock:close()
```

Close the socket.

**Usage**

```lua
sock:close()
```

**Returns**

- none

**Example**

```lua
Sock:close()
```


## FileConnection methods

### `FileConnection:get`

*method of `FileConnection`*

```lua
conn:get{ remote=, local= }
```

Download a file.

**Usage**

```lua
local ok, err = conn:get{ remote=, local= }
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `remote` | string | Yes | Remote file path to download. |
| `local` | string | Yes | Local destination path. |

**Returns**

- ok, err

**Example**

```lua
local Ok, Err = Conn:get{ remote = '/inbound/out.hl7', ['local'] = '/tmp/out.hl7' }
if not Ok then error(Err.message) end
```


### `FileConnection:put`

*method of `FileConnection`*

```lua
conn:put{ local=, remote= }
```

Upload a file.

**Usage**

```lua
local ok, err = conn:put{ local=, remote= }
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `local` | string | Yes | Local file path to upload. |
| `remote` | string | Yes | Remote destination path. |

**Returns**

- ok, err

**Example**

```lua
Conn:put{ ['local'] = '/tmp/out.hl7', remote = '/inbound/out.hl7' }
```


### `FileConnection:list`

*method of `FileConnection`*

```lua
conn:list{ path= }
```

List a directory.

**Usage**

```lua
local files, err = conn:list{ path= }
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `path` | string | Yes | Remote directory to list. |

**Returns**

- array, err

**Example**

```lua
local Files, Err = Conn:list{ path = '/inbound' }
if not Files then error(Err.message) end
for _, f in ipairs(Files) do print(f) end
```


### `FileConnection:delete`

*method of `FileConnection`*

```lua
conn:delete{ path= }
```

Delete a file.

**Usage**

```lua
local ok, err = conn:delete{ path= }
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `path` | string | Yes | Remote file path to delete. |

**Returns**

- ok, err

**Example**

```lua
local Ok, Err = Conn:delete{ path = '/inbound/old.hl7' }
if not Ok then error(Err.message) end
```


### `FileConnection:rename`

*method of `FileConnection`*

```lua
conn:rename{ from=, to= }
```

Rename/move a file.

**Usage**

```lua
local ok, err = conn:rename{ from=, to= }
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `from` | string | Yes | Current remote path. |
| `to` | string | Yes | New remote path. |

**Returns**

- ok, err

**Example**

```lua
Conn:rename{ from = '/inbound/tmp', to = '/inbound/out.hl7' }
```


### `FileConnection:close`

*method of `FileConnection`*

```lua
conn:close()
```

Close the connection.

**Usage**

```lua
conn:close()
```

**Returns**

- none

**Example**

```lua
Conn:close()
```

