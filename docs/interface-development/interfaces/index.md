---
title: Interfaces and Core Nodes
---

# Interfaces and Core Nodes

A workflow is built from three kinds of node.

```text
Source  →  Transform  →  Destination
```

## The node palette

In the Workflow Builder, the palette groups node types under three headings. Drag one onto the canvas to add it.

| Group | Node | Triggered by | Script |
| --- | --- | --- | --- |
| **Source** | **HTTP** | An inbound HTTP request on a route | Required |
| **Source** | **LLP** | An inbound HL7 v2 message over MLLP | Only for a custom ACK |
| **Source** | **File/FTP** | A timer, polling a directory or FTP/FTPS/SFTP server | Not used |
| **Source** | **Custom** | A timer | Required |
| **Transform** | **Custom** | An inbound message from an upstream node | Required |
| **Destination** | **File/FTP** | An inbound message from an upstream node | Not used |
| **Destination** | **LLP** | An inbound message from an upstream node | Not used |

Transport nodes are configured with fields, not code. You write Lua only where the work is genuinely yours: HTTP handling, transformation, and generated or fetched messages.

:::note[How this documentation names nodes]
The palette shows a group heading and a short name. In running text, naming a node type needs both, so this documentation writes them together — "Source HTTP", "Destination File/FTP". In the Grid you will see **HTTP** under **Source**.
:::

Your project's own [node templates](../../administration/configurations/project-settings.md) appear in the same palette, under the group matching their type. Prebuilt [adapters](../../adapters/index.md) arrive as templates too, so an Epic or S3 node is added the same way as any other and configured with fields.

### Finding things in the palette

| Control | What it does |
| --- | --- |
| **Search** | Filters the palette by node name |
| **All / Project / Catalog** tabs | Narrows to built-in nodes, this project's own templates, or adapters from a subscribed [catalog](../../catalogs/index.md) |
| **Catalog filter** | On the **Catalog** tab, shows or hides individual catalogs when several are subscribed |
| **Drag the palette's edge** | Resizes it, for adapter names too long to read at the default width |

:::caution[Destination Custom]
The palette also offers **Custom** under **Destination**. It has no runtime implementation in this release — a workflow containing one will not run it. Use **Transform Custom** for script-driven delivery instead: a transform node that calls out and never pushes is a destination in every practical sense. See [Custom Scripting Nodes](custom-scripting-nodes.md).
:::

## Choosing a source

| You need to receive | Use |
| --- | --- |
| HL7 v2 over an MLLP socket | Source LLP |
| An HTTP or REST call | Source HTTP |
| Files from a directory | Source File/FTP |
| Files from an FTP, FTPS, or SFTP server | Source File/FTP with **Use FTP** enabled |
| Data you fetch or generate yourself on a schedule | Source Custom |

## Choosing a destination

| You need to deliver | Use |
| --- | --- |
| HL7 v2 over MLLP, with ACK handling | Destination LLP |
| Files to a directory | Destination File/FTP |
| Files to an FTP, FTPS, or SFTP server | Destination File/FTP with **Upload to FTP** enabled |
| An outbound HTTP call | Transform Custom, calling `linkiir.link.web.post` |
| Email | Transform Custom, calling `linkiir.link.mail.send` |
| A database write | Transform Custom, calling `linkiir.store` |

The last three are transform nodes rather than dedicated destination types: you make the outbound call from a script. See [Linkiir Scripting API](../../api/scripting-api/index.md).

## The Node Parameters panel

Click a node on the canvas to open **Node Parameters** on the right. Everything about the node lives there — there is no separate node details dialog.

| In the panel | Holds |
| --- | --- |
| Title | The node's name, editable in place |
| **Description** | Free text describing what the node does |
| **Debug Logging** | Per-node switch for verbose logging |
| **Run From Commit** | Which commit of the node's files the Runtime executes |
| Configuration fields | The node type's own fields, plus any you added |

The panel is read-only until you click **Edit** in its header, and **Save** writes the name, description, debug logging, and configuration fields together. The permissions behind them are separate: changing a field's value needs **Edit config values**, adding or redefining a field needs **Edit config fields**, and the name, description, and debug logging need **Edit node details**. A refused save says which permission it wanted rather than failing quietly. See [Users and Roles](../../administration/configurations/user-roles.md).

**Run From Commit** is the exception: it saves the moment you pick a commit, because pinning reloads the node in the Runtime. Choosing the newest commit means "follow the latest" — the node keeps picking up new commits instead of freezing on that one. Pinning needs the **Set run commit** permission.

## Required fields and when they are checked

Node configuration forms do not mark fields as required, and they let you save an incomplete node. Validation happens when the node **starts**: a missing or invalid value stops the start and names the field.

```text
missing required field: Route Path
invalid required field: Interval (must be > 0)
missing required field: FTP Server (required when Use FTP is enabled)
```

The reference pages below mark the fields each node type needs to start. Everything else has a working default.

This is why **Run Test** followed by starting a single node is the right order when building: the test catches script errors, the start catches configuration errors.

## Fields you can add yourself

Beyond the fields a node type defines, you can add your own to a node's configuration and read them from your script. Useful for values you want configurable without editing code.

Nodes created from a Linkiir-supplied template have their built-in fields locked: you can change a value, but not a label, type, or option list, and you cannot remove one. Fields you add yourself remain fully editable.

## Editing the canvas

Adding, moving, connecting, and deleting all happen in the Workflow Builder's **Edit** mode. Outside it the canvas is read-only, though you can still select a node to read its parameters and open its script.

Right-click a node for:

| Item | Available |
| --- | --- |
| **Create template** | Always |
| **Edit script** | Always, except on File/FTP nodes, which have no script |
| **Remove upstream connection** | Edit mode |
| **Remove downstream connection** | Edit mode, and not on a destination node |
| **Delete node** | Edit mode |

Right-click a connection, in edit mode, for **Delete connection** — that one line only, rather than everything running into or out of a node.

Each of these asks before it acts, naming what it is about to change: the node by name, or the two nodes a connection joins. Canvas changes stay local until you click **Save**; **Cancel** restores the canvas as it was when you entered edit mode.

The breadcrumb above the canvas switches project and workflow, and creates them too: the project dropdown offers **New project** and the workflow dropdown **New workflow**, each taking a name and description and opening what it creates.

## Reference pages

- [Source Nodes](source-nodes.md)
- [Destination Nodes](destination-nodes.md)
- [Custom Scripting Nodes](custom-scripting-nodes.md)

:::note[Conditional fields]
Many fields appear only once the setting they depend on is enabled. The FTP fields on a File/FTP node appear after you turn **Use FTP** on; the TLS fields appear after **Use SSL**. If a field in these pages is not visible, check the setting it depends on.
:::
