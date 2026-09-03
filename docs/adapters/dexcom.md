---
title: Dexcom CGM Adapter
sidebar_label: Dexcom CGM
description: Configure the Linkiir Dexcom adapter to authorize a Dexcom account and read continuous glucose monitor values into a workflow.
keywords: [Dexcom, CGM, continuous glucose monitoring, adapter, OAuth, EGV, sandbox, G7]
---

# Dexcom CGM Adapter

Two nodes that connect a workflow to a Dexcom account and read its continuous glucose monitor (CGM) values.

| Node | Palette group | Role |
| --- | --- | --- |
| **Dexcom Authorize** | Source HTTP | A web page where a person authorizes their Dexcom account, once |
| **Dexcom Read EGV** | Source Custom | Reads glucose values on a timer and pushes them downstream |

Part of the Linkiir Adapters package — see [requesting the package](index.md#requesting-the-adapters-package).

## What it does

```text
                 person signs in once
                          ↓
Dexcom Authorize  →  stores the authorization
                          ↓
Dexcom Read EGV   →  your next node
       ↕
  Dexcom API
```

**Dexcom Read EGV** emits one message per cycle containing the readings Dexcom returned, exactly as Dexcom returned them:

```json
{
  "type": "DEXCOM_EGVS",
  "dexcomUserId": "...",
  "window": { "start": "2026-09-03T10:00:00", "end": "2026-09-03T11:00:00" },
  "count": 12,
  "records": [ { "systemTime": "...", "value": 126, "unit": "mg/dL", "trend": "flat" } ]
}
```

The adapter does not interpret, reshape, or de-duplicate the readings. Deciding what a value means and where it goes is the job of the workflow you build around it.

:::caution[This is patient data]
Glucose readings are health data about an identifiable person. Confirm you have that person's authorization and that your handling of the data is permitted under your organisation's policies before turning **Live Mode** on. See [Security](../administration/security/index.md).
:::

## Before you start

### 1. Get a Dexcom developer account

Register at **[developer.dexcom.com](https://developer.dexcom.com/)**.

Sandbox access is granted on sign-up, so you can build the whole integration before requesting anything else. Production access is a separate review by Dexcom.

### 2. Create an application

In the Dexcom developer portal, add an application and note:

- **Client ID**
- **Client Secret**
- **Redirect URI** — the address Dexcom returns the browser to after sign-in

:::info[The redirect URI must match exactly]
Dexcom compares the redirect URI character for character, and it must be **`https`**. Register the same value you will put in the node, including the port if your Linkiir HTTP server uses one.

For a Linkiir HTTP server on port 8081 at `studio.example.com`, that is:

```text
https://studio.example.com:8081/dexcom/authorize
```

The path must match the node's **Route Path**.
:::

### 3. Know your sandbox test accounts

Dexcom's sandbox provides fixed test users with pre-loaded reading patterns, listed in the portal's sandbox documentation. You sign in as one of those users during authorization; no real device is involved.

## Set it up

### Step 1 — Serve the authorization page over HTTPS

Dexcom will only redirect to an `https` address. Before configuring the nodes, confirm your Linkiir HTTP server has TLS enabled, under **Settings → Http Server**. See [Project Settings](../administration/configurations/project-settings.md).

### Step 2 — Configure the Dexcom Authorize node

1. Open the node in the Workflow Builder and click **Edit**.
2. Set **Route Path**, or keep `dexcom/authorize`. This becomes part of your redirect URI.
3. Set **Environment** to `sandbox`.
4. Fill in **Client ID**, **Client Secret**, and **Redirect URI** from the portal.
5. Set **Token Store Path** to a file the adapter may create, for example:

   ```text
   projects/YourProject_<guid>/dexcom-tokens.sqlite
   ```

   The path is relative to the Linkiir working directory. This holds the authorization so it survives restarts.
6. Leave **Live Mode** off. **Save**.

### Step 3 — Check the page before going live

Open the route in a browser:

```text
https://studio.example.com:8081/dexcom/authorize
```

With fields missing, the page lists exactly what is still needed. With everything filled and **Live Mode** still off, it loads and shows the connection state — proving the route and TLS work before Dexcom is involved.

### Step 4 — Authorize

1. Turn **Live Mode** **on** and **Save**.
2. Reload the page and click **Authorize Dexcom**.
3. Sign in at Dexcom as your sandbox test user and approve access.
4. Dexcom returns you to the page, which now reports **Authorized** and shows the Dexcom user id.

:::note[Do this once]
The authorization persists in the token store. The read node refreshes it automatically. You only return here to connect a different account, or if the authorization is revoked.
:::

### Step 5 — Configure the Dexcom Read EGV node

1. Open the node and click **Edit**.
2. Copy the **same** Environment, Client ID, Client Secret, Redirect URI, and **Token Store Path** you used above.

   :::warning[The token store path must match]
   Both nodes must point at the same file. If they differ, the read node will report that nothing has been authorized, even though the page said it succeeded.
   :::

3. Set **Interval** — how often to read. `300000` (five minutes) matches how often a CGM produces a value.
4. Set **Lookback Minutes** — how far back each read reaches. `60` is a safe default.
5. Turn **Live Mode** on and **Save**.

### Step 6 — Start the workflow

Start it and watch the node log. Within one interval you should see a line like:

```text
Dexcom Read: pushed 12 reading(s) for 2026-09-03T10:00:00 .. 2026-09-03T11:00:00
```

## Configuration reference

### Dexcom Authorize (Source HTTP)

| Field | Type | Default | Purpose |
| --- | --- | --- | --- |
| **Route Path** | string | `dexcom/authorize` | URL path this page listens on. Must match your registered redirect URI |
| **Worker Count** | number | `1` | Parallel request handlers. One is enough for an authorization page |
| **Environment** | list | `sandbox` | `sandbox` or `production`. Separate hosts with separate credentials |
| **Client ID** | string | *(empty)* | From your Dexcom application |
| **Client Secret** | password | *(empty)* | From your Dexcom application. Stored encrypted |
| **Redirect URI** | string | *(empty)* | Must match the Dexcom registration exactly, and be `https` |
| **Base URL Override** | string | *(empty)* | Leave blank. Set only to point at a mock or proxy |
| **Token Store Path** | string | *(empty)* | File holding the authorization, relative to the working directory |
| **Request Timeout** | number | `20` | Seconds to wait for Dexcom |
| **Verify TLS** | bool | `true` | Leave on |
| **Live Mode** | bool | `false` | When off, nothing is sent to Dexcom |

### Dexcom Read EGV (Source Custom)

| Field | Type | Default | Purpose |
| --- | --- | --- | --- |
| **Interval** | number | `300000` | Milliseconds between reads. `300000` is five minutes |
| **Lookback Minutes** | number | `60` | How far back each read reaches |
| **Environment** | list | `sandbox` | Must match the Authorize node |
| **Client ID** | string | *(empty)* | Must match the Authorize node |
| **Client Secret** | password | *(empty)* | Must match the Authorize node |
| **Redirect URI** | string | *(empty)* | Must match the Authorize node |
| **Base URL Override** | string | *(empty)* | Leave blank |
| **Token Store Path** | string | *(empty)* | **Must match the Authorize node** |
| **Request Timeout** | number | `20` | Seconds to wait for Dexcom |
| **Verify TLS** | bool | `true` | Leave on |
| **Live Mode** | bool | `false` | When off, nothing is sent to Dexcom |

:::note[Overlapping windows are expected]
Consecutive reads overlap, so the same reading can arrive more than once. That is deliberate: it means a late-arriving value is not missed. De-duplicating is the consuming workflow's job, because only it knows what has already been acted on.
:::

## Templates and library

The adapter arrives as two node templates plus the library behind them. See [How Adapters Work](how-adapters-work.md) for the general pattern.

| Template | Palette group | Adds |
| --- | --- | --- |
| **Dexcom Authorize** | Source HTTP | The authorization page |
| **Dexcom Read EGV** | Source Custom | The timed reader |

| Library | Version | Used by |
| --- | --- | --- |
| `dexcom_cgm` | 1.0.0 | Both templates, already linked |

### Add another instance

To read a second Dexcom account, add a second pair of nodes from the templates rather than editing the first:

1. In the Workflow Builder, switch to **Edit** mode.
2. Drag **Dexcom Authorize** from the **Source HTTP** group onto the canvas, and **Dexcom Read EGV** from **Source Custom**.
3. Give the new Authorize node a **different Route Path**, and register its redirect URI with Dexcom.
4. Give the new pair a **different Token Store Path**, so the two authorizations do not overwrite each other.
5. Configure, then connect the reader to your downstream node.

:::warning[One authorization per token store]
The token store holds a single authorization. Two Dexcom accounts need two store paths. Pointing both pairs at one file means the second authorization replaces the first.
:::

### Use the library in your own node

If you are writing a node rather than using the templates, link the `dexcom_cgm` library to it and get a ready-configured client from the node's own fields:

```lua
local DXcfg = require 'dexcom_cgm_config'
local client, cfg = DXcfg.fromNodeConfig()
```

`client` is authenticated according to the fields described in the [Configuration reference](#configuration-reference), so your node deals only with what to fetch. Every call returns a result or an error rather than stopping the node, leaving you to decide whether a failure should halt the flow.

## Verify it worked

- The Authorize page reports **Authorized** and shows a Dexcom user id.
- With **Live Mode** off, the read node logs `not configured yet` or `Live Mode is off`, and nothing leaves the installation.
- With **Live Mode** on, the read node logs how many readings it pushed, and your downstream node receives a `DEXCOM_EGVS` message.
- A quiet log saying `no readings in <window>` is normal for a sandbox user outside their loaded data range. Raise **Lookback Minutes**.

## If it didn't work

| Symptom | Cause | Fix |
| --- | --- | --- |
| Dexcom shows a redirect-URI error | The registered URI and the node's **Redirect URI** differ | Make them identical, including scheme, port, and path |
| Dexcom will not accept the redirect | The URI is not `https` | Enable TLS on the Linkiir HTTP server |
| Page says *Not configured yet* | A required field is empty | Fill the fields listed on the page |
| Authorize button does nothing | **Live Mode** is off | Turn it on and save |
| `not authorized yet` in the read node | No authorization stored, or a different **Token Store Path** | Make both nodes use the same path, then authorize again |
| `Dexcom rejected the refresh token` | The authorization was revoked or expired | Re-authorize on the Authorize node |
| `no readings in <window>` | The window falls outside the account's data | Raise **Lookback Minutes** |
| `HTTP 429` | Too many requests | Raise **Interval**; Dexcom throttles firmly |
| `HTTP 401` right after setup | Sandbox credentials used against production, or the reverse | Check **Environment** matches the credentials |
| `failed to decrypt field` | The project was imported to another installation | Re-enter **Client Secret** on both nodes |

## Next

- [PointClickCare Adapter](pointclickcare.md)
- [How Adapters Work](how-adapters-work.md)
- [Security](../administration/security/index.md)
