---
title: eClinicalWorks Adapter
sidebar_label: eClinicalWorks
description: Configure the Linkiir eCW adapter to poll an eClinicalWorks FHIR endpoint, using its separate authorization server, and push each resource into a workflow.
keywords: [eClinicalWorks, eCW, FHIR, adapter, OAuth]
---

# eClinicalWorks Adapter

A **Source Custom** node that polls an eClinicalWorks (eCW) FHIR endpoint on an interval and pushes every matching resource downstream as JSON.

Part of the Linkiir Adapters package — see [requesting the package](index.md#requesting-the-adapters-package).

## What it does

On each interval the node obtains an access token from the eCW authorization server, runs your FHIR search against the FHIR base URL, and pushes one message per resource returned. The token is cached and reused until it nears expiry.

```text
eCW FHIR endpoint  →  eCW Adapter  →  your next node
```

eCW is the one FHIR adapter with **two** URLs to configure: the authorization server and the FHIR endpoint are different hosts.

## Before you start

Register through eCW's developer process and collect:

- The **client ID**.
- An **RSA keypair**, with the public half registered against that client.
- The **key ID** (`kid`) identifying your registered key.
- The **FHIR base URL** of your eCW environment, including your tenant segment.
- The **OAuth server URL**, which is a separate host from the FHIR base URL.
- The **scopes** your integration needs.

If you do not already have a keypair, generate one:

```bash
openssl genrsa -out ecw_private.pem 2048
openssl rsa -in ecw_private.pem -pubout -out ecw_public.pem
```

Register `ecw_public.pem` with eCW. Put `ecw_private.pem` on the machine running the Linkiir Runtime, readable only by the account the Runtime runs as. The node stores the path, not the key.

## Set it up

1. Open the **eCW FHIR Adapter** node in the Workflow Builder and click **Edit**.
2. Fill in both URLs, and the credentials:

   | Field | Value |
   | --- | --- |
   | **Base URL** | The eCW FHIR root, including your tenant segment |
   | **Auth URL** | The eCW OAuth server root. The token path is appended to it |
   | **Client ID** | The client ID eCW issued |
   | **Private Key Path** | Absolute path to `ecw_private.pem` |
   | **Key ID** | The `kid` of your registered key |
   | **Scopes** | Space-separated scopes your registration allows |

3. Say what to fetch with **Resource Type** and **Search Query**.
4. Set **Live Mode** off, then **Save**.
5. Connect a downstream node and start the workflow. Authentication still runs, so this pass proves the credentials and both URLs.
6. Turn **Live Mode** on. The log reports how many resources were pushed.

## Configuration reference

| Field | Type | Default | Purpose |
| --- | --- | --- | --- |
| **Interval** | number | `60000` | Milliseconds between polls |
| **Base URL** | string | eCW staging root | Root of the eCW FHIR endpoint. Resource paths are appended to it |
| **Auth URL** | string | eCW staging OAuth root | Root of the eCW OAuth server. The token path is appended to it |
| **Client ID** | string | *(empty)* | Client ID from the eCW app registration |
| **Private Key Path** | file path | *(empty)* | PEM RSA private key used to sign the token request |
| **Key ID** | string | *(empty)* | Key identifier (`kid`) for your registered key |
| **FHIR Version** | list | `R4` | `R4`, `STU3`, or `DSTU2` |
| **Scopes** | string | patient, medication, and encounter read scopes | Space-separated OAuth scopes |
| **Resource Type** | string | `Patient` | FHIR resource type to search each poll |
| **Search Query** | string | *(example)* | Search parameters as a URL query string |
| **Live Mode** | bool | `true` | Off simulates the FHIR calls. Authentication is always live |
| **Verify TLS** | bool | `true` | Verify the eCW server's TLS certificate |

:::note[The defaults point at staging]
**Base URL** and **Auth URL** arrive pointing at eCW's staging environment, including a sample tenant segment. Replace both with your own environment before you turn Live Mode on.
:::

## Verify it worked

- With **Live Mode** off, the node starts clean and logs that no request was sent.
- With **Live Mode** on, the log reports a count of pushed resources.
- Each message is a single FHIR resource as JSON.

## If it didn't work

| Symptom in the log | Cause | Fix |
| --- | --- | --- |
| `CONFIG_ERROR` naming a field | That field is empty, or the key file cannot be read | Fill the field; check the Runtime account can read the key |
| `AUTH_FAILED` | The registered public key, the **Key ID**, or the client ID does not match | Re-check all three against your eCW registration |
| `REQUEST_FAILED` on the token call | **Auth URL** points at the FHIR host rather than the OAuth host | Set **Auth URL** to the OAuth server root |
| `HTTP_404` on the search | **Base URL** is missing the tenant segment, or **Resource Type** is misspelled | Correct the URL or resource type |
| `HTTP_403` | The scope for that resource type was not granted | Adjust **Scopes** to what your registration allows |
| `Live Mode is off` and nothing is pushed | Working as configured | Turn **Live Mode** on |
| No error, but nothing pushed | The search matched nothing | Widen the **Search Query** |

## Next

- [How Adapters Work](how-adapters-work.md)
- [ModMed Adapter](modmed.md)
- [FHIR Resource Creator](fhir-resource-creator.md)
