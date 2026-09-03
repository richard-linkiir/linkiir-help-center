---
title: PointClickCare Adapter
sidebar_label: PointClickCare
description: Configure the Linkiir PointClickCare adapter to authenticate with two-legged OAuth over mutual TLS and make authenticated API requests from a workflow.
keywords: [PointClickCare, PCC, adapter, two-legged OAuth, client credentials, mutual TLS, mTLS, sandbox, long-term care]
---

# PointClickCare Adapter

Two nodes that connect a workflow to a PointClickCare organization.

| Node | Palette group | Role |
| --- | --- | --- |
| **PCC Connect** | Source Custom | Authenticates on a timer and reports what the connection can see |
| **PCC Request** | Transform Custom | Makes an authenticated request to any PointClickCare path |

Part of the Linkiir Adapters package — see [requesting the package](index.md#requesting-the-adapters-package).

## What it does

```text
PCC Connect  →  connection status downstream
     ↕
PointClickCare
     ↕
request in  →  PCC Request  →  response out
```

**PCC Connect** proves the connection works. Each cycle it obtains a token, reads the organization's facilities, and pushes a status message. Run it first: it tells you your credentials, certificate, and organization are all correct before you build anything on top.

**PCC Request** is the general way through. It takes a request description and returns the response, so one node serves any endpoint:

```json
{ "method": "GET", "path": "/orgs/{orgUuid}/facs" }
```

`{orgUuid}` is filled in for you from the token. The response comes back as:

```json
{ "type": "PCC_RESPONSE", "ok": true, "status": 200, "json": { } }
```

:::caution[This reaches resident records]
PointClickCare holds identifiable resident health information. Confirm your intended reads and writes are permitted under your agreement with PointClickCare and your organisation's policies before turning **Live Mode** on. See [Security](../administration/security/index.md).
:::

## Choose your OAuth mode first

This is the one decision that shapes everything else, and the two modes are not interchangeable.

| | **2-legged** *(default)* | **3-legged** |
| --- | --- | --- |
| Who is authenticated | The application | A person who signs in |
| Client certificate | **Required** | Not used |
| Needs a person | No | Yes, roughly every 15 days |
| Suits | Unattended feeds | Work carrying one user's privileges |
| Privileges | Granted to the application | Those of the signing user |

**Use 2-legged unless you have a reason not to.** Nothing expires that needs a human, which is what an always-on integration requires.

:::warning[The two modes live on different hosts]
Each mode uses a different PointClickCare host, and pairing a mode with the wrong host is the most common reason a first connection fails.

**Leave Auth Base URL and API Base URL empty.** The adapter then selects the correct host for the mode you chose. Only fill them in if PointClickCare has given you a specific endpoint.
:::

## Before you start

### 1. Get a PointClickCare developer account

Register at **[developer.pointclickcare.com](https://developer.pointclickcare.com/)**.

Access is granted by PointClickCare rather than self-service, so request it early. Ask specifically for **sandbox** access and note that you intend to use the **two-legged (client credentials)** grant.

### 2. Create an application and note its credentials

From the developer portal, note:

- **Client ID** — the Customer Key
- **Client Secret** — the Customer Secret
- The **scopes** your application needs, per endpoint you intend to call

### 3. Obtain a client certificate (2-legged only)

Two-legged OAuth uses **mutual TLS**: PointClickCare requires your application to present a client certificate, and refuses the request without one.

- The certificate must be issued for **client authentication** by a certificate authority PointClickCare accepts.
- A **self-signed certificate will be rejected.**
- Confirm the expected subject name with PointClickCare *before* purchasing, so you do not buy the wrong certificate.

Place the certificate and its private key on the Linkiir server where the `linkiir` service account can read them, for example under `/etc/linkiir/certs/`.

:::note[Planning ahead on certificates]
Publicly issued client-authentication certificates are being phased out across the industry. If this is a long-lived integration, ask PointClickCare how they intend to support it, and consider whether a private certificate authority is an option for you.
:::

### 4. Know which facility you are working with

The number shown in the PointClickCare user interface is usually the **facility code**, not the **`facId`** the API expects. Do not guess: **PCC Connect** lists both for every facility, which is the reliable way to find the right one.

## Set it up

### Step 1 — Configure PCC Connect

1. Open the node in the Workflow Builder and click **Edit**.
2. Leave **OAuth Mode** as `2-legged`.
3. Fill in **Client ID** and **Client Secret**.
4. Set **Client Certificate File** and **Client Key File** to the paths on the server, relative to the Linkiir working directory or absolute:

   ```text
   /etc/linkiir/certs/pcc-client.pem
   /etc/linkiir/certs/pcc-client.key
   ```

   :::warning[Both are required together]
   Set the certificate without the key and the connection fails during the TLS handshake with an error that looks like a server fault. The adapter checks for both and tells you which is missing.
   :::

5. Leave **Organization UUID**, **Auth Base URL**, and **API Base URL** empty. PointClickCare returns the organization with the token, and the adapter picks the host.
6. Leave **Interval** at `900000` (fifteen minutes). The token is reused until it nears expiry, so this costs very little.
7. Leave **Live Mode** off. **Save**.

### Step 2 — Confirm the configuration before going live

Start the workflow. With **Live Mode** off, the node log names anything still missing, for example:

```text
PCC Connect: not configured yet (Client ID, Client Secret,
Client Certificate File (required for 2-legged), Client Key File (required for 2-legged))
```

Nothing is sent to PointClickCare in this state.

### Step 3 — Connect

1. Turn **Live Mode** **on** and **Save**.
2. Watch the node log. A working connection looks like:

   ```text
   PCC Connect: PointClickCare 2-legged · live · client certificate set · token valid 119m · 3 facility(ies)
   ```

3. The status message pushed downstream lists each facility with its **`facId`** and **facility code**. Note the `facId` you need.

### Step 4 — Configure PCC Request

Copy the same **OAuth Mode**, **Client ID**, **Client Secret**, **Client Certificate File**, and **Client Key File** into the PCC Request node, then turn **Live Mode** on.

### Step 5 — Make your first request

Send this node a message describing the call:

```json
{ "method": "GET", "path": "/orgs/{orgUuid}/patients", "query": { "facId": 12, "patientStatus": "Current" } }
```

The response arrives downstream as a `PCC_RESPONSE` message with `status` and `json`.

To write, use `POST` and supply a body:

```json
{ "method": "POST",
  "path": "/orgs/{orgUuid}/patients/6209/observations",
  "body": { "type": "bloodSugar", "value": 126, "unit": "mg/dL" } }
```

:::note[Privileges belong to the credential]
A request only succeeds if the authenticated identity holds the privilege for it. Writes in particular need an explicitly granted permission — read access does not imply it. A `403` means the privilege is missing, not that the request is malformed.
:::

## Configuration reference

Both nodes share the same connection fields. **PCC Connect** adds **Interval**.

| Field | Type | Default | Purpose |
| --- | --- | --- | --- |
| **Interval** *(Connect only)* | number | `900000` | Milliseconds between connection checks. `900000` is fifteen minutes |
| **OAuth Mode** | list | `2-legged` | `2-legged` authenticates the application; `3-legged` authenticates a person |
| **Client ID** | string | *(empty)* | The Customer Key from the developer portal |
| **Client Secret** | password | *(empty)* | The Customer Secret. Stored encrypted |
| **Organization UUID** | string | *(empty)* | Leave empty. Returned with the token; set only to pin one organization |
| **Client Certificate File** | string | *(empty)* | Path to the client certificate. **Required for 2-legged** |
| **Client Key File** | string | *(empty)* | Path to its private key. **Required for 2-legged** |
| **CA File** | string | *(empty)* | Optional trust anchor. Empty uses the system store |
| **Redirect URI** | string | *(empty)* | 3-legged only. Must match the portal registration and be `https` |
| **Auth Base URL** | string | *(empty)* | Leave empty to follow **OAuth Mode** |
| **API Base URL** | string | *(empty)* | Leave empty to follow **OAuth Mode** |
| **Request Timeout** | number | `20` | Seconds to wait for a response |
| **Verify TLS** | bool | `true` | Leave on |
| **Live Mode** | bool | `false` | When off, nothing is sent to PointClickCare |

## Templates and library

The adapter arrives as two node templates plus the library behind them. See [How Adapters Work](how-adapters-work.md) for the general pattern.

| Template | Palette group | Adds |
| --- | --- | --- |
| **PCC Connect** | Source Custom | The connection check |
| **PCC Request** | Transform Custom | The general request node |

| Library | Version | Used by |
| --- | --- | --- |
| `pcc_api` | 1.0.0 | Both templates, already linked |

### Add another instance

One **PCC Request** node can serve every endpoint, because the path travels in the message rather than the configuration. You usually need only one.

Add a second when you want a genuinely separate connection — a different organization, or a different credential with different privileges:

1. In the Workflow Builder, switch to **Edit** mode.
2. Drag **PCC Request** from the **Transform Custom** group onto the canvas.
3. Give it its own Client ID, Client Secret, and certificate paths.
4. Connect it and save.

:::tip[Reuse before duplicating]
If the only difference is the endpoint, send a different `path` to the existing node instead. A second node means a second set of credentials to rotate.
:::

### Use the library in your own node

If you are writing a node rather than using the templates, link the `pcc_api` library to it and get a ready-configured client from the node's own fields:

```lua
local PCCcfg = require 'pcc_api_config'
local client, cfg = PCCcfg.fromNodeConfig()

client:connect()                                  -- obtain a token, cached until it ages out
client:get{ path = '/orgs/' .. client:orgUuid() .. '/facs' }
```

`client` follows the **OAuth Mode** field, so the same code works for either grant and picks the matching host. `connect()` is safe to call as often as you like: the token is reused until it nears expiry. Every call returns a result or an error rather than stopping the node, leaving you to decide whether a failure should halt the flow.

## Using 3-legged OAuth instead

Switch **OAuth Mode** to `3-legged` when a deployment must act with a specific user's privileges. Then:

- Set a **Redirect URI** and register the identical value in the developer portal.
- Leave the certificate fields empty; three-legged does not use mutual TLS.
- Sign in using **`orgcode.username`** — the organization code and username together in the first field. This catches most people out on their first attempt.
- Expect to sign in again roughly every 15 days.

:::info[Three-legged needs somewhere to keep its refresh token]
The refresh token changes every time it is used, and the previous one stops working. A three-legged deployment therefore needs exactly one component responsible for storing it. Two components refreshing the same authorization will break each other. Two-legged has no such constraint, which is why it is the default.
:::

## Verify it worked

- With **Live Mode** off, the log names the missing fields and nothing leaves the installation.
- With **Live Mode** on, **PCC Connect** logs `client certificate set`, a token validity, and a facility count.
- The downstream status message lists each facility with its `facId`.
- **PCC Request** returns `"ok": true` with a `status` of `200` or `201`.

## If it didn't work

| Symptom in the log | Cause | Fix |
| --- | --- | --- |
| `two-legged OAuth requires a client certificate` | Certificate or key path is empty | Set both **Client Certificate File** and **Client Key File** |
| `file not found or not readable` | The path is wrong, or the service account cannot read it | Correct the path; make the files readable by the `linkiir` account |
| `No required SSL certificate was sent` | The request reached PointClickCare without a certificate | Confirm both files are set and readable, then restart the node |
| `The SSL certificate error` | The certificate is self-signed or not accepted | Use one issued for client authentication by an accepted authority |
| `HTTP 400 Invalid Authorization Code` | Credentials were accepted but the grant did not complete | Normal while testing three-legged; the code is single-use and expires in about a minute |
| `HTTP 401` | Wrong Client ID or Secret | Re-copy both from the developer portal |
| `HTTP 403` | The identity lacks the privilege for that call | Have the required permission granted, then restart the node |
| `HTTP 404 Facility Not Found` | A facility **code** was used where a **`facId`** was expected | Use the `facId` from the PCC Connect status message |
| `HTTP 429 Quota Violation` | Too many requests in a short period | Raise **Interval**, and reduce how much you request at once |
| `organization UUID unknown` | A request ran before a token was obtained | Let **PCC Connect** run, or set **Organization UUID** |
| `three-legged mode cannot obtain a token on its own` | 3-legged selected without completing sign-in | Complete the redirect flow, or switch to `2-legged` |
| `Live Mode is off` | Expected while validating configuration | Turn **Live Mode** on |
| `failed to decrypt field` | The project was imported to another installation | Re-enter **Client Secret** on both nodes |

## Next

- [Dexcom CGM Adapter](dexcom.md)
- [How Adapters Work](how-adapters-work.md)
- [Security](../administration/security/index.md)
