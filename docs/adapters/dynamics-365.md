---
title: Dynamics 365 Adapter
sidebar_label: Dynamics 365
description: Configure the Linkiir Dynamics 365 adapter to poll Microsoft Dynamics CRM on a schedule with a FetchXML query.
keywords: [Dynamics 365, Microsoft CRM, adapter, FetchXML, Azure AD]
---

# Dynamics 365 Adapter

A **Source Custom** node that polls Microsoft Dynamics 365 CRM on an interval, using a FetchXML query, and pushes each record downstream.

Part of the Linkiir Adapters package — see [requesting the package](index.md#requesting-the-adapters-package).

## What it does

On each interval the node signs in to Azure AD with the configured account, runs your FetchXML query against the Dynamics Web API, and pushes the records it returns. The entity named in the query determines what is queried, so changing what you pull is a query edit, not a code change.

```text
Dynamics 365 CRM  →  Dynamics CRM Adapter  →  your next node
```

## Before you start

Collect from your Dynamics 365 environment:

- The **base URL** of the instance, for example `https://yourorg.crm.dynamics.com/`.
- A **username** and **password** for an Azure AD account with access to that instance.
- A **FetchXML query** describing the records you want.

The account signs in with the Azure AD resource owner password grant, so it must be a plain account: multi-factor authentication and conditional access policies that require interaction will block it. Use a dedicated service account with only the CRM access it needs.

## Set it up

1. Open the **Dynamics CRM Adapter** node in the Workflow Builder and click **Edit**.
2. Fill in the connection fields:

   | Field | Value |
   | --- | --- |
   | **URL** | The Dynamics instance base URL. The Web API path is appended to it |
   | **Username** | The Azure AD account |
   | **Password** | That account's password |

3. Put your query in **FetchXML Query**. To pull records dated today, use the `{{curr_date}}` token where the date belongs — the node substitutes it in `YYYY-MM-DD` form on each poll.
4. Set **Live Mode** off, then **Save**.
5. Connect a downstream node and start the workflow. Sign-in still happens, so this pass proves the account works.
6. Turn **Live Mode** on. The log reports how many records were pushed.

## Configuration reference

| Field | Type | Default | Purpose |
| --- | --- | --- | --- |
| **Interval** | number | `60000` | Milliseconds between polls |
| **URL** | string | *(empty)* | Base URL of the Dynamics 365 instance. The Web API path is appended to it |
| **Username** | string | *(empty)* | Azure AD username |
| **Password** | password | *(empty)* | Azure AD password |
| **FetchXML Query** | string | *(template)* | The query to run. `{{curr_date}}` is replaced with today's date. The entity in the query decides what is queried |
| **Live Mode** | bool | `true` | Off simulates the requests. Sign-in is always live |
| **Verify TLS** | bool | `true` | Verify the server's TLS certificate. Turn off only for a local test proxy |

## Verify it worked

- With **Live Mode** off, the node starts clean and logs that no request was sent.
- With **Live Mode** on, the log reports a count of pushed records.
- Change the entity in **FetchXML Query**, restart the node, and the count changes accordingly.

## If it didn't work

| Symptom in the log | Cause | Fix |
| --- | --- | --- |
| `CONFIG_ERROR` naming a field | **URL**, **Username**, or **Password** is empty | Fill the field named |
| `AUTH_FAILED` mentioning interaction or MFA | The account requires interactive sign-in | Use a service account without MFA or a blocking conditional access policy |
| `AUTH_FAILED` on correct credentials | The account has no access to the Dynamics instance | Grant it access in Dynamics |
| `HTTP_400` mentioning the query | The FetchXML is malformed, or names an entity or attribute that does not exist | Test the query in Dynamics first, then paste it in |
| `HTTP_404` | **URL** is wrong for the instance | Correct the base URL |
| `failed to decrypt field` | The project was imported to a different installation | Re-enter **Password** on this installation |
| `Live Mode is off` and nothing is pushed | Working as configured | Turn **Live Mode** on |
| No error, but nothing pushed | The query matched no records | Widen the query, or check `{{curr_date}}` is the date you expect |

## Next

- [How Adapters Work](how-adapters-work.md)
- [Salesforce Adapter](salesforce.md)
- [Custom Scripting Nodes](../interface-development/interfaces/custom-scripting-nodes.md)
