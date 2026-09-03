---
title: How Adapters Work
description: How a Linkiir adapter is delivered, where its configuration lives, how to run it safely the first time, and how to reuse it across workflows.
keywords: [adapters, node templates, libraries, live mode, configuration]
---

# How Adapters Work

Every adapter follows the same shape, so once you have configured one the rest are familiar. This page covers what arrives, where you configure it, and the order to bring one up in.

## What arrives

An adapter comes as two parts.

| Part | What it is | What you do with it |
| --- | --- | --- |
| **Node template** | A ready-made node with its configuration fields already defined | Drag it from the palette to add another instance |
| **Library** | The versioned code bundle the node uses to talk to the remote system | Leave it alone; link it when you build a node yourself |

The library knows *how* to talk to the remote system. The node decides *what* to ask for and *what happens next*. That split is why several nodes can share one library, and why updating the library does not disturb the configuration on each node.

## How an adapter reaches your grid

There are two routes, and they differ mainly in what happens after the first install.

| Route | How it arrives | Getting later versions |
| --- | --- | --- |
| **A catalog** | Subscribe to the publisher's catalog. Its adapters appear in the node palette. | The grid tells you an update is waiting. Review the diff and apply it per node, keeping each node's configuration and wiring. |
| **A project export** | Import a project that already contains the adapter | The next version arrives as another project to import and reconcile by hand |

Catalogs are the supported way to keep an adapter current, because a node built from a catalog adapter stays linked to it and can be updated in place. See [Catalogs](../catalogs/index.md).

Either way an adapter travels inside a project export once it is configured, so one you set up in DEV moves to TEST and PROD with the project. See [Project Import and Export](../administration/deployment/import-export.md).

:::info[Requesting the Adapters package]
Adapters ship separately from the Linkiir installation. Email [support@linkiir.com](mailto:support@linkiir.com) with your Linkiir version, your platform, and the systems you need to reach. You receive either a catalog to subscribe to or a project to import, with each node already linked to the library it needs.
:::

## Where the configuration lives

Click the adapter node on the canvas to open **Node Parameters** on the right, click **Edit**, fill in the fields, and click **Save**. Nothing about an adapter is configured in a file.

Every adapter's page in this section carries a **Configuration reference** table listing each field, its type, its default, and what it does.

| Field type | Behavior |
| --- | --- |
| string, number, list | Stored in the project as entered |
| **password** | Encrypted in the project, decrypted only when the node runs, never written to a log |
| **file path** | Only the path is stored. The file stays on the server and is read when the node needs it |

Fields on a supplied template are locked to their labels and types: you change values, not the form. Fields you add yourself stay fully editable. See [Interfaces and Core Nodes](../interface-development/interfaces/index.md).

:::caution[Credentials belong in fields, not scripts]
Enter every secret in its **password** field, or keep it in the project's **Variables** tab with **Secret** ticked. A credential pasted into a script travels in the project history and in every export. See [Security](../administration/security/index.md).
:::

## Bringing an adapter up

The same six steps work for every adapter in this section.

1. **Collect the vendor prerequisites.** Each adapter page lists what you need — client ID, keypair, API key, bucket name — and where to get it. Do this before you open Linkiir.
2. **Fill in the connection fields.** Endpoint, credentials, and any tenant or practice identifier.
3. **Say what to fetch or send.** Resource type and search query for the FHIR adapters, a query for the CRM adapters, a prefix for storage, a channel for messaging.
4. **Leave Live Mode off and run it once.** The node still authenticates, so you find out whether your credentials work before any patient data moves. The log reports that no request was sent.
5. **Turn Live Mode on.** The log now reports how many records were pushed, or why none were.
6. **Connect the downstream node** and start the workflow.

Run each node on its own before starting the whole workflow. Script problems surface in **Run Test**; configuration problems surface when the node **starts** and name the field at fault.

:::note[Configuration is checked at start, not at save]
An adapter node saves with fields still empty. Validation happens when the node starts, and the message names the field — for example `CONFIG_ERROR: Client ID is not configured`.
:::

## What Live Mode does

Live Mode is the switch that separates "prove the configuration" from "move data".

| Live Mode | What happens |
| --- | --- |
| Off | The node authenticates for real, builds and signs the request it would send, logs it, and sends nothing |
| On | The request goes to the remote system and results are pushed downstream |

Authentication is always live, in both states. That is deliberate: a first run with Live Mode off tells you whether your credentials, endpoint, and key file are right, without touching patient data.

Most adapters ship with Live Mode on and are safe to leave that way once configured. Some ship with it **off**, so that an imported adapter cannot reach a live system until someone deliberately enables it:

| Adapter | Why it ships with Live Mode off |
| --- | --- |
| [AWS S3](aws-s3.md) | It writes objects to a bucket |
| [Dexcom CGM](dexcom.md) | It reads a named person's health data |
| [PointClickCare](pointclickcare.md) | It reads and writes resident records |

## Adding a second instance

To point the same adapter at another endpoint, another resource type, or another channel, add a second node from the template rather than editing the first.

1. In the Workflow Builder, open **Edit** mode.
2. Find the adapter's template in the node palette, under the group matching its type, and drag it onto the canvas.
3. Configure the new node. It carries the same fields, independently valued.
4. Connect it and save.

Both nodes use the same library, so there is one copy of the client code to maintain. See [Project Settings](../administration/configurations/project-settings.md) for how libraries are listed, versioned, and copied between projects.

## Reading the errors

Adapters report failures as a stable code plus a readable message in the node log, so a symptom maps to a cause without reading code. The codes are listed on each adapter page.

| Code you will see across adapters | Means |
| --- | --- |
| `CONFIG_ERROR` | A required field is empty, or a file path cannot be read |
| `AUTH_FAILED` | The remote system rejected the credentials |
| `HTTP_<status>` | The request reached the remote system and it answered with an error status |
| `PARSE_ERROR` | The response was not the format expected |
| `REQUEST_FAILED` | The request could not be sent — network, DNS, or TLS |

Turn on **Debug Logging** on the node while you are bringing it up, and turn it off once it runs clean. Payload content stays out of the log either way — see [Security](../administration/security/index.md) for what is safe to record.

## Next

- [Adapters overview](index.md)
- [Interfaces and Core Nodes](../interface-development/interfaces/index.md)
- [Error Handling and Retry](../interface-development/error-handling.md)
