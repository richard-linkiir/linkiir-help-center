---
title: Azure OpenAI Adapter
sidebar_label: Azure OpenAI
description: Configure the Linkiir Azure OpenAI adapter to send message content to a model deployment and route the response downstream.
keywords: [Azure OpenAI, AI, adapter, Entra ID, API key, model deployment]
---

# Azure OpenAI Adapter

A **Transform Custom** node that sends the message reaching it to an Azure OpenAI model deployment and pushes the model's response downstream.

Part of the Linkiir Adapters package — see [requesting the package](index.md#requesting-the-adapters-package).

## What it does

When a message arrives, the node combines your system prompt with the message content, calls your Azure OpenAI deployment, and pushes the response onward. The endpoint URL you configure decides which Azure API shape is used, so pointing at a different deployment style needs no other change.

```text
upstream node  →  Azure OpenAI Adapter  →  your next node
                        ↕
                Azure OpenAI deployment
```

:::caution Decide what content may leave your environment
This node sends message content to Azure. Before you turn Live Mode on, confirm that sending this data to your Azure resource is permitted under your organisation's agreements and your patient-data policy, and constrain what reaches the node upstream. See [Security](../administration/security/index.md).
:::

## Before you start

From the Azure portal or Azure AI Foundry:

- Deploy a model and note its **deployment name**.
- Copy the deployment's **endpoint URL**, including the API version query parameter.
- Choose an authentication mode:

| Mode | What you need |
| --- | --- |
| **API Key** | The key from the deployment page |
| **Entra ID** | An app registration granted the Azure OpenAI user role on the resource, plus its client ID, tenant ID, and client secret |

API Key is quicker to set up. Entra ID avoids a long-lived key and is the better fit for production.

## Set it up

1. Open the Azure OpenAI node in the Workflow Builder and click **Edit**.
2. Set **Authentication Mode**, which decides which credential fields appear:

   | Mode | Fill in |
   | --- | --- |
   | API Key | **API Key** |
   | Entra ID | **Azure Client ID**, **Azure Tenant ID**, **Azure Client Secret** |

3. Paste the deployment endpoint into **Model URI**, and set **Model Name** to the deployment name.
4. Write the **System Prompt**: the standing instructions for the model, covering tone, output format, and anything it must not do.
5. Set **Live Mode** off, then **Save**. Send one message through and read the log to confirm the request is shaped as you expect.
6. Turn **Live Mode** on and send another message.

## Configuration reference

| Field | Type | Default | Purpose |
| --- | --- | --- | --- |
| **Authentication Mode** | list | `API Key` | Chooses between a static API key and Entra ID |
| **Model URI** | string | *(empty)* | Full deployment endpoint URL, including the API version query parameter |
| **API Key** | password | *(empty)* | Azure OpenAI key. Shown only in API Key mode |
| **Azure Client ID** | string | *(empty)* | Application (client) ID. Shown only in Entra ID mode |
| **Azure Tenant ID** | string | *(empty)* | Directory (tenant) ID. Shown only in Entra ID mode |
| **Azure Client Secret** | password | *(empty)* | Client secret. Shown only in Entra ID mode |
| **System Prompt** | string | *(a healthcare assistant prompt)* | Standing instructions: tone, format, constraints |
| **Model Name** | string | *(empty)* | Deployment identifier. Required for deployments that use the responses endpoint |
| **Max Tokens** | number | `4096` | Upper limit on generated output. Raise it if responses are cut off |
| **Temperature** | number | *(empty)* | Sampling temperature, `0.0`–`1.0`. Empty uses the model default |
| **TopP** | number | *(empty)* | Nucleus sampling, `0.0`–`1.0`. Empty uses the model default |
| **Request Timeout** | number | `30` | Seconds to wait for a response. Raise it for long prompts |
| **Live Mode** | bool | `true` | When off, requests are simulated and nothing leaves the installation |

:::note Which fields are visible
The credential fields depend on **Authentication Mode**: switch the mode and the other set appears. This is the conditional-field behavior described in [Interfaces and Core Nodes](../interface-development/interfaces/index.md).
:::

## Verify it worked

- With **Live Mode** off, a message passes through and the log shows the request that would have been sent, with no call leaving the installation.
- With **Live Mode** on, the downstream node receives the model's response.
- Responses that end mid-sentence mean **Max Tokens** is too low for your prompt.

## If it didn't work

| Symptom in the log | Cause | Fix |
| --- | --- | --- |
| `CONFIG_ERROR` naming a field | A field required by the selected **Authentication Mode** is empty | Fill the field named |
| `HTTP_401` in API Key mode | The key is wrong or has been rotated | Copy the key again from the deployment page |
| `HTTP_401` in Entra ID mode | The app registration lacks the Azure OpenAI role on the resource | Grant the role, then restart the node |
| `HTTP_404` | **Model URI** points at a deployment that does not exist, or omits the API version | Re-copy the endpoint URL from the deployment page |
| `HTTP_429` | The deployment's rate or token quota is exhausted | Slow the upstream feed, or raise the quota in Azure |
| `TIMEOUT` | The prompt takes longer than **Request Timeout** | Raise the timeout, or shorten the input |
| Response is truncated | **Max Tokens** is too low | Raise **Max Tokens** |
| `failed to decrypt field` | The project was imported to a different installation | Re-enter **API Key** or **Azure Client Secret** here |
| Nothing is sent | **Live Mode** is off | Turn **Live Mode** on |

## Next

- [How Adapters Work](how-adapters-work.md)
- [Custom Scripting Nodes](../interface-development/interfaces/custom-scripting-nodes.md)
- [Security](../administration/security/index.md)
