---
title: Salesforce Adapter
sidebar_label: Salesforce
description: Configure the Linkiir Salesforce adapter to query and update Salesforce records over the REST API from a workflow.
keywords: [Salesforce, CRM, adapter, connected app, client credentials]
---

# Salesforce Adapter

A **Transform Custom** node that queries and updates Salesforce records over the REST API as messages pass through a workflow.

Part of the Linkiir Adapters package — see [requesting the package](index.md#requesting-the-adapters-package).

## What it does

When a message reaches the node, it authenticates against your Salesforce org, runs the query or update the node is configured for, and passes the result downstream. Tokens are cached and reused until they near expiry.

```text
upstream node  →  Salesforce Adapter  →  your next node
                        ↕
                Salesforce REST API
```

Because it is a transform node, it can sit anywhere in a workflow: enriching a message with CRM data on the way through, or delivering the message into Salesforce as the final step.

## Before you start

Create a **connected app** in your Salesforce org, configured for the client credentials flow:

1. In Salesforce Setup, create a Connected App with OAuth enabled.
2. Enable the **Client Credentials Flow** in the OAuth section.
3. Assign a **Run-As User** to the connected app.
4. Confirm the app has API access scopes.
5. Note the **Client ID** (consumer key) and **Client Secret** (consumer secret).

You also need your org's **My Domain** host, for example `myorg.my.salesforce.com`. Enter it without the `https://` prefix.

## Set it up

1. Open the Salesforce node in the Workflow Builder and click **Edit**.
2. Fill in the connection fields:

   | Field | Value |
   | --- | --- |
   | **Domain** | Your My Domain host, no `https://` |
   | **Client ID** | The connected app's consumer key |
   | **Client Secret** | The connected app's consumer secret |
   | **API Version** | The REST API version your org supports |

3. Set **Live Mode** off, then **Save**.
4. Connect an upstream node, send one message through, and check the log. Authentication still runs, so this pass proves the connected app is configured correctly.
5. Turn **Live Mode** on and send another message.

:::tip Already have a token
If your environment issues bearer tokens through another process, enter it in the **Key** field. When **Key** is set the node uses it directly and skips the OAuth exchange, so **Client ID** and **Client Secret** are not needed.
:::

## Configuration reference

| Field | Type | Default | Purpose |
| --- | --- | --- | --- |
| **Domain** | string | *(empty)* | Salesforce instance domain, without the `https://` prefix |
| **Client ID** | string | *(empty)* | OAuth consumer key from the connected app |
| **Client Secret** | password | *(empty)* | OAuth consumer secret from the connected app |
| **Key** | password | *(empty)* | An existing bearer token. When set, the node uses it instead of the OAuth exchange |
| **API Version** | string | `59.0` | Salesforce REST API version |
| **Live Mode** | bool | `true` | When off, no requests are sent |
| **Verify TLS** | bool | `true` | Verify the Salesforce TLS certificate |

## Verify it worked

- With **Live Mode** off, a message passes through and the log shows the request that would have been sent.
- With **Live Mode** on, the log shows the Salesforce response status, and the record appears or updates in the org.

## If it didn't work

| Symptom in the log | Cause | Fix |
| --- | --- | --- |
| `CONFIG_ERROR` naming a field | **Domain**, **Client ID**, or **Client Secret** is empty, and no **Key** is set | Fill the fields, or supply a **Key** |
| `AUTH_FAILED` mentioning an unsupported grant | The connected app does not have the Client Credentials Flow enabled | Enable it in the app's OAuth settings |
| `AUTH_FAILED` mentioning a run-as user | No Run-As User is assigned to the connected app | Assign one |
| `HTTP_400` on a query | The query references a field or object the Run-As User cannot see | Grant the user access, or change the query |
| `HTTP_404` | **Domain** is wrong, or **API Version** is newer than the org supports | Correct the domain; lower the API version |
| `failed to decrypt field` | The project was imported to a different installation | Re-enter **Client Secret** on this installation |
| Nothing reaches Salesforce | **Live Mode** is off | Turn **Live Mode** on |

## Next

- [How Adapters Work](how-adapters-work.md)
- [Dynamics 365 Adapter](dynamics-365.md)
- [Custom Scripting Nodes](../interface-development/interfaces/custom-scripting-nodes.md)
