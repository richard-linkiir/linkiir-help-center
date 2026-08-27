---
title: ModMed Adapter
sidebar_label: ModMed
description: Configure the Linkiir ModMed adapter to poll a ModMed FHIR endpoint with an API key and account credentials.
keywords: [ModMed, Modernizing Medicine, FHIR, adapter, API key]
---

# ModMed Adapter

A **Source Custom** node that polls a ModMed FHIR endpoint on an interval and pushes every matching resource downstream as JSON.

Part of the Linkiir Adapters package — see [requesting the package](index.md#requesting-the-adapters-package).

## What it does

On each interval the node exchanges the API account credentials for an access token, runs your FHIR search, and pushes one message per resource returned. The ModMed API key travels on every request, including the token exchange. The token is cached and reused until it nears expiry.

```text
ModMed FHIR endpoint  →  ModMed Adapter  →  your next node
```

This adapter uses a username and password rather than a keypair, which makes it the quickest of the FHIR adapters to bring up.

## Before you start

Collect from ModMed:

- A **username** and **password** for the API account.
- The **API key** ModMed issued.
- The **base URL** of your ModMed endpoint.

Both the password and the API key are entered as masked fields, so they are encrypted in the project and never appear in a log or an export in readable form.

## Set it up

1. Open the **ModMed FHIR Adapter** node in the Workflow Builder and click **Edit**.
2. Fill in the connection fields:

   | Field | Value |
   | --- | --- |
   | **Base URL** | Your ModMed endpoint root. The token and FHIR paths are appended to it |
   | **Username** | The API account username |
   | **Password** | The API account password |
   | **API Key** | The key ModMed issued |

3. Say what to fetch with **Resource Type** and **Search Query**.
4. Set **Live Mode** off, then **Save**.
5. Connect a downstream node and start the workflow. Authentication still runs, so this pass proves the account and the API key.
6. Turn **Live Mode** on. The log reports how many resources were pushed.

## Configuration reference

| Field | Type | Default | Purpose |
| --- | --- | --- | --- |
| **Interval** | number | `60000` | Milliseconds between polls |
| **Base URL** | string | *(empty)* | Root of the ModMed endpoint. The token path and FHIR path are appended to it |
| **Username** | string | *(empty)* | API account username |
| **Password** | password | *(empty)* | API account password |
| **API Key** | password | *(empty)* | The API key sent on every request, including the token exchange |
| **Resource Type** | string | `Patient` | FHIR resource type to search each poll |
| **Search Query** | string | `_count=20` | Search parameters as a URL query string |
| **Live Mode** | bool | `true` | Off simulates the FHIR calls. Authentication is always live |
| **Verify TLS** | bool | `true` | Verify the server's TLS certificate. Turn off only for a local test proxy |

## Verify it worked

- With **Live Mode** off, the node starts clean and logs that no request was sent.
- With **Live Mode** on, the log reports a count of pushed resources.
- Each message is a single FHIR resource as JSON.

## If it didn't work

| Symptom in the log | Cause | Fix |
| --- | --- | --- |
| `CONFIG_ERROR` naming a field | **Base URL**, **Username**, **Password**, or **API Key** is empty | Fill the field named |
| `AUTH_FAILED` | Wrong username or password, or the account is not enabled for API access | Re-enter the credentials; confirm API access with ModMed |
| `HTTP_401` on the search but the token succeeded | The **API Key** is wrong or has been rotated | Re-enter the API key |
| `HTTP_404` | Wrong **Base URL**, or a misspelled **Resource Type** | Correct the URL or resource type |
| `failed to decrypt field` | The project was imported to a different installation | Re-enter **Password** and **API Key** on this installation |
| `Live Mode is off` and nothing is pushed | Working as configured | Turn **Live Mode** on |
| No error, but nothing pushed | The search matched nothing | Widen the **Search Query** |

## Next

- [How Adapters Work](how-adapters-work.md)
- [Athena Health Adapter](athena.md)
- [FHIR Resource Creator](fhir-resource-creator.md)
