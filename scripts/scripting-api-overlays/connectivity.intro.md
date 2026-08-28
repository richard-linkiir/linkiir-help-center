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

:::caution tls and verifyTls control different things
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

