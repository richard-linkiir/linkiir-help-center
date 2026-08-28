---
title: Athena Health Adapter
sidebar_label: Athena Health
description: Configure the Linkiir Athena Health adapter to poll the Athena platform for a practice and push each patient found into a workflow.
keywords: [Athena Health, athenahealth, adapter, OAuth, practice]
---

# Athena Health Adapter

A **Source Custom** node that polls the Athena Health platform on an interval and pushes every patient found downstream as JSON.

Part of the Linkiir Adapters package — see [requesting the package](index.md#requesting-the-adapters-package).

## What it does

On each interval the node obtains an access token with your client credentials, runs the configured patient search for a practice, and pushes one message per patient returned. The token is cached and reused until it nears expiry.

```text
Athena Health platform  →  Athena Adapter  →  your next node
```

Unlike the FHIR adapters, this one searches through Athena's own REST API, so the practice identifier is part of the request path rather than a search parameter.

## Before you start

Register an application at the [Athena developer portal](https://developer.athenahealth.com) and collect:

- The **Client ID** and **Client Secret**.
- The **Practice ID** of the practice you are connecting to.
- The **Base URL** for the environment you are targeting: the production platform host, or the preview host for sandbox work.

## Set it up

1. Open the **Athena Health Adapter** node in the Workflow Builder and click **Edit**.
2. Fill in the connection fields:

   | Field | Value |
   | --- | --- |
   | **Base URL** | The Athena platform root. Use the preview host while testing |
   | **Client ID** | From your registered application |
   | **Client Secret** | From your registered application |
   | **Practice ID** | The practice you are connecting to |
   | **Scopes** | The scopes your application is granted, space-separated |

3. Set **Search Query** to the parameters you want, for example `firstname=John`.
4. Set **Live Mode** off, then **Save**.
5. Connect a downstream node and start the workflow. Authentication still runs, so this pass proves the client credentials.
6. Turn **Live Mode** on. The log reports how many patients were pushed.

## Configuration reference

| Field | Type | Default | Purpose |
| --- | --- | --- | --- |
| **Interval** | number | `60000` | Milliseconds between polls |
| **Base URL** | string | Athena production platform root | Root URL of the Athena API platform. Use the preview host for sandbox |
| **Client ID** | string | *(empty)* | OAuth client identifier |
| **Client Secret** | password | *(empty)* | OAuth client secret |
| **Scopes** | string | Athena service and patient read scopes | OAuth scopes requested, space-separated |
| **Practice ID** | string | Athena's sandbox practice | Practice identifier used in the request path |
| **Search Query** | string | `firstname=John` | Search parameters as a URL query string |
| **Live Mode** | bool | `true` | Off simulates the API calls. Authentication is always live |
| **Verify TLS** | bool | `true` | Verify the Athena server's TLS certificate |

:::note[Change the practice before going live]
**Practice ID** arrives set to Athena's sandbox practice so the node is runnable out of the box. Replace it with your own practice, and switch **Base URL** from the preview host to production, in the same edit.
:::

## Verify it worked

- With **Live Mode** off, the node starts clean and logs that no request was sent.
- With **Live Mode** on, the log reports a count of pushed patients.
- Each message is a single patient record as JSON.

## If it didn't work

| Symptom in the log | Cause | Fix |
| --- | --- | --- |
| `CONFIG_ERROR` naming a field | **Client ID**, **Client Secret**, or **Practice ID** is empty | Fill the field named |
| `AUTH_FAILED` | Wrong client credentials, or the application is not enabled on this environment | Re-copy both values from the developer portal |
| `HTTP_403` | The application is not granted a requested scope, or not authorized for the practice | Reduce **Scopes**; confirm practice access |
| `HTTP_404` | **Practice ID** does not exist on this environment, or **Base URL** mixes production and preview | Match the practice to the environment |
| `failed to decrypt field` | The project was imported to a different installation | Re-enter **Client Secret** on this installation |
| `Live Mode is off` and nothing is pushed | Working as configured | Turn **Live Mode** on |
| No error, but nothing pushed | The search matched nothing | Widen the **Search Query** |

## Next

- [How Adapters Work](how-adapters-work.md)
- [Epic Adapter](epic.md)
- [FHIR Resource Creator](fhir-resource-creator.md)
