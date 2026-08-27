---
title: Epic Adapter
sidebar_label: Epic
description: Configure the Linkiir Epic adapter to poll an Epic FHIR endpoint and push each matching resource into a workflow.
keywords: [Epic, FHIR, adapter, backend services, SMART on FHIR]
---

# Epic Adapter

A **Source Custom** node that polls an Epic FHIR endpoint on an interval and pushes every matching resource downstream as JSON.

Part of the Linkiir Adapters package — see [requesting the package](index.md#requesting-the-adapters-package).

## What it does

On each interval the node authenticates against Epic, runs the FHIR search you configured, and pushes one message per resource returned. It caches the access token and reuses it until it nears expiry, so a short interval does not mean a token request every cycle. If the search matches nothing, it logs that and pushes nothing.

```text
Epic FHIR endpoint  →  Epic Adapter  →  your next node
```

## Before you start

Register your application with Epic as a **backend services** client, through [open.epic](https://open.epic.com) or App Orchard, and collect:

- The **client ID** Epic issued.
- An **RSA keypair**, with the public half registered against that client.
- The **base URL** of the Epic environment you are pointed at.

If you do not already have a keypair, generate one:

```bash
openssl genrsa -out epic_private.pem 2048
openssl rsa -in epic_private.pem -pubout -out epic_public.pem
```

| File | What to do with it |
| --- | --- |
| `epic_public.pem` | Register it with Epic against your client |
| `epic_private.pem` | Put it on the machine running the Linkiir Runtime, readable only by the account the Runtime runs as |

The private key stays on disk. The node stores its path, not its contents, so the key never enters the project or an export.

## Set it up

1. Open the **EPIC Adapter** node in the Workflow Builder and click **Edit**.
2. Fill in the connection fields:

   | Field | Value |
   | --- | --- |
   | **Base URL** | Your Epic FHIR root |
   | **Client ID** | The client ID Epic issued |
   | **Private Key Path** | Absolute path to `epic_private.pem` |
   | **FHIR Version** | `R4`, unless your endpoint serves something else |

3. Say what to fetch:

   | Field | Value |
   | --- | --- |
   | **Resource Type** | `Patient`, `Encounter`, `Observation`, and so on |
   | **Search Query** | Search parameters as a query string, for example `family=Smith&birthdate=1970-01-01` |

   Epic rejects unfiltered searches for most resource types, so include at least one identifying parameter.

4. Set **Live Mode** off, then **Save**.
5. Connect a downstream node and start the workflow. The log reads `Live Mode is off, no request was sent.` — the credentials were still exercised, so this run proves them.
6. Turn **Live Mode** on. The log now reports how many resources were pushed.

## Configuration reference

| Field | Type | Default | Purpose |
| --- | --- | --- | --- |
| **Interval** | number | `60000` | Milliseconds between polls |
| **Base URL** | string | Epic's public sandbox root | Root of the Epic endpoint. A trailing slash is added if missing |
| **Client ID** | string | *(empty)* | Client ID from the Epic app registration |
| **Private Key Path** | file path | *(empty)* | PEM RSA private key used to sign the token request |
| **FHIR Version** | list | `R4` | `R4`, `STU3`, or `DSTU2`. Becomes the version segment of the request path |
| **Resource Type** | string | `Patient` | FHIR resource type to search each poll |
| **Search Query** | string | *(example)* | Search parameters as a URL query string |
| **Live Mode** | bool | `true` | Off simulates the FHIR calls. Authentication is always live |
| **Verify TLS** | bool | `true` | Verify Epic's TLS certificate. Turn off only for a local test proxy |

## Verify it worked

- With **Live Mode** off, the node starts without a `CONFIG_ERROR` or `AUTH_FAILED` and logs that no request was sent.
- With **Live Mode** on, the log reports a count of pushed resources, and the downstream node receives that many messages.
- Each message is a single FHIR resource as JSON, not a Bundle.

## If it didn't work

| Symptom in the log | Cause | Fix |
| --- | --- | --- |
| `CONFIG_ERROR: Client ID is not configured` | The **Client ID** field is empty | Enter the client ID Epic issued |
| `CONFIG_ERROR: cannot open private key at …` | Wrong path, or the Runtime's account cannot read the file | Correct the path; grant read access to the Runtime account |
| `CONFIG_ERROR: private key file is empty` | The path points at a zero-byte or truncated file | Re-copy the key file |
| `AUTH_FAILED` with HTTP 400 | The registered public key does not match your private key, or the client ID is wrong | Re-register `epic_public.pem`, and confirm the client ID |
| `AUTH_FAILED` mentioning `invalid_client` | The app is not registered for backend services, or is not enabled on this Epic environment | Check the registration with Epic |
| `FHIR_OPERATION_OUTCOME: No patient identifiers supplied` | **Search Query** has no identifying parameter | Add one, such as `family=` or `identifier=` |
| `HTTP_404` | **FHIR Version** does not match what the endpoint serves, or **Resource Type** is misspelled | Correct the version or the resource type |
| `Live Mode is off` and nothing is pushed | Working as configured | Turn **Live Mode** on |
| No error, but nothing pushed | The search succeeded and matched nothing | Widen the **Search Query** |

Two Epic behaviors worth knowing: most resource types require at least one search parameter, and a search that matches nothing is a success with an empty result, not an error.

## Next

- [How Adapters Work](how-adapters-work.md)
- [Cerner Adapter](cerner.md)
- [FHIR Resource Creator](fhir-resource-creator.md)
