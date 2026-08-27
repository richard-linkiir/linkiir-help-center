---
title: Cerner Adapter
sidebar_label: Cerner
description: Configure the Linkiir Cerner adapter to poll a Cerner FHIR endpoint with a registered System Account and push each resource into a workflow.
keywords: [Cerner, FHIR, adapter, System Account, JWKS, SMART on FHIR]
---

# Cerner Adapter

A **Source Custom** node that polls a Cerner FHIR endpoint on an interval and pushes every matching resource downstream as JSON.

Part of the Linkiir Adapters package — see [requesting the package](index.md#requesting-the-adapters-package).

## What it does

On each interval the node discovers Cerner's token endpoint from the published SMART configuration, obtains an access token for the scopes you requested, runs your FHIR search, and pushes one message per resource returned. The token is cached and reused until it nears expiry.

```text
Cerner FHIR endpoint  →  Cerner Adapter  →  your next node
```

## Before you start

Register a System Account on CernerCentral as a **backend services** client, and collect:

- The **client ID**.
- An **RSA keypair**, with the public half published as a JWKS.
- The **Key ID** (`kid`) identifying which key in that JWKS Cerner should verify against.
- The **base URL** of the Cerner FHIR endpoint for your tenant.

If you do not already have a keypair, generate one:

```bash
openssl genrsa -out cerner_private.pem 2048
openssl rsa -in cerner_private.pem -pubout -out cerner_public.pem
```

| File | What to do with it |
| --- | --- |
| `cerner_public.pem` | Publish it as part of a JWKS on the CernerCentral System Account |
| `cerner_private.pem` | Put it on the machine running the Linkiir Runtime, readable only by the account the Runtime runs as |

The node stores the key's path, not its contents, so the key never enters the project or an export.

## Set it up

1. Open the **Cerner FHIR Adapter** node in the Workflow Builder and click **Edit**.
2. Fill in the connection fields:

   | Field | Value |
   | --- | --- |
   | **Base URL** | The Cerner FHIR root for your tenant |
   | **Client ID** | The client ID from the System Account |
   | **Private Key Path** | Absolute path to `cerner_private.pem` |
   | **Key ID** | The `kid` of the matching public key in your JWKS |
   | **Scopes** | The scopes your integration needs, space-separated |

3. Say what to fetch with **Resource Type** and **Search Query**.
4. Set **Live Mode** off, then **Save**.
5. Connect a downstream node and start the workflow. Authentication still runs, so this first pass proves the client ID, key, and `kid` line up.
6. Turn **Live Mode** on. The log reports how many resources were pushed.

## Configuration reference

| Field | Type | Default | Purpose |
| --- | --- | --- | --- |
| **Interval** | number | `60000` | Milliseconds between polls |
| **Base URL** | string | *(empty)* | Root of the Cerner FHIR endpoint. A trailing slash is added if missing |
| **Client ID** | string | *(empty)* | OAuth client identifier from the CernerCentral System Account |
| **Private Key Path** | file path | *(empty)* | PEM RSA private key used to sign the token request |
| **Key ID** | string | *(empty)* | The `kid` identifying which public key in your JWKS Cerner verifies against |
| **Scopes** | string | `system/Patient.read` | SMART on FHIR scopes requested on the token exchange |
| **Resource Type** | string | `Patient` | FHIR resource type to search each poll |
| **Search Query** | string | *(example)* | Search parameters as a URL query string |
| **Live Mode** | bool | `true` | Off simulates the FHIR calls. Authentication is always live |
| **Verify TLS** | bool | `true` | Verify Cerner's TLS certificate. Turn off only for a local test proxy |

## Verify it worked

- With **Live Mode** off, the node starts clean and logs that no request was sent.
- With **Live Mode** on, the log reports a count of pushed resources and the downstream node receives that many messages.
- Each message is a single FHIR resource as JSON.

## If it didn't work

| Symptom in the log | Cause | Fix |
| --- | --- | --- |
| `CONFIG_ERROR` naming a field | That field is empty, or a file path cannot be read | Fill the field; check the Runtime account can read the key |
| `AUTH_FAILED` mentioning the assertion or signature | The **Key ID** does not match the published JWKS, or the private key is not the pair of the published public key | Re-check the `kid`, and republish the JWKS if needed |
| `AUTH_FAILED` mentioning scopes | The System Account is not approved for a requested scope | Reduce **Scopes** to what the account is granted |
| `HTTP_401` after a successful token | The token does not carry the scope the search needs | Add the scope, then restart the node |
| `HTTP_404` | Wrong **Base URL** for the tenant, or a misspelled **Resource Type** | Correct the URL or resource type |
| `Live Mode is off` and nothing is pushed | Working as configured | Turn **Live Mode** on |
| No error, but nothing pushed | The search matched nothing | Widen the **Search Query** |

## Next

- [How Adapters Work](how-adapters-work.md)
- [Epic Adapter](epic.md)
- [FHIR Resource Creator](fhir-resource-creator.md)
