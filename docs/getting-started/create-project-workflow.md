---
title: Create a Project, Workflow, and HTTP Source Node
unlisted: true
---

# Create a Project, Workflow, and HTTP Source Node

In this step you build the structure of your first interface: a project to hold it, a workflow to define the message path, and a **Source → HTTP** node to receive requests.

You will write the script and start the listener in [the next step](start-http-server.md).

---

## 1. Create the project

1. Open **Projects** in the Grid.
2. Click the chevron on **Add Project** and choose **New project**.
3. Name it `Getting Started`. A description is optional.
4. Save.

A project holds workflows, scripts, schemas, project variables, and libraries.

:::tip[Names versus identifiers]
Linkiir gives every project, workflow, and node a stable internal identifier separate from its display name. Renaming something for clarity later will not break the interface, so pick a readable name now.
:::

---

## 2. Create the workflow

1. Click the `Getting Started` project card to open it.
2. On the **Workflows** tab, click **Add Workflow**.
3. Name it `HTTP Intake` and save.

The workflow is the unit you start and stop. Everything you add next lives inside it.

---

## 3. Add the HTTP source node

Click the hammer icon on the workflow row (**Open in Builder**) to reach the Workflow Builder, then drag **HTTP** from the **Source** group of the node palette onto the canvas.

### The node palette

The palette groups node types under three headings. This walkthrough uses **Source → HTTP**.

| Group | Node | What it does |
| --- | --- | --- |
| **Source** | **HTTP** | Accepts inbound HTTP requests on a route |
| **Source** | **LLP** | Accepts inbound HL7 v2 over MLLP on a listen port |
| **Source** | **File/FTP** | Polls a local directory or an FTP/FTPS/SFTP server for files |
| **Source** | **Custom** | Runs your script on a timer to generate or fetch messages |
| **Transform** | **Custom** | Runs your script on each inbound message |
| **Destination** | **File/FTP** | Writes messages to files locally or over FTP/FTPS/SFTP |
| **Destination** | **LLP** | Sends HL7 v2 over MLLP to a remote host and handles the ACK |

See [Source Nodes](../interface-development/interfaces/source-nodes.md) and [Destination Nodes](../interface-development/interfaces/destination-nodes.md) for the full field reference for each.

:::note[Naming in this documentation]
The palette shows a group heading and a short node name. This documentation writes them together — "Source HTTP", "Destination File/FTP" — so a node type can be named unambiguously in running text. In the Grid you will see **HTTP** under **Source**.
:::

### Configure the node

Click the node to open **Node Parameters** on the right, click **Edit** in the panel header, and set:

| Field | Set it to | Notes |
| --- | --- | --- |
| **Route Path** | `/intake` | The path this node answers on. Must be unique across the HTTP nodes sharing the server. |
| **Worker Count** | `1` | How many requests the node handles at the same time. Defaults to `1`. |

The node's name is the first thing in the same panel — set it to `Intake` — then **Save**. Its Lua script, `main.lua`, is created with the node.

These are the fields the node needs before it will start. The Grid does not mark fields as required — a node with a missing value fails at start with a message naming the field, for example `missing required field: Route Path`.

:::info[There is no port field on the node]
The HTTP server and its port are configured once for the installation, in **Settings → Http Server**. Every HTTP source node answers on that one server and is told apart by its **Route Path**. You set the port in the next step.

That is why Route Path has to be unique: two nodes claiming `/intake` cannot both answer it.
:::

---

## 4. Turn on the HTTP server

The HTTP server is an installation-wide setting, not a per-project one.

1. Open **Settings** and select the **Http Server** tab.
2. Click **Edit**.
3. Turn on **Use Server**.
4. Set **Port** to `9001`.
5. Click **Save & Restart**.

The button reads **Save & Restart** rather than **Save** because the Runtime only reads the port when it starts. It is restarted for you; every running node stops and comes back with it. See [HTTP Server Settings](../administration/configurations/http-server.md).

Combined with the node's Route Path, your endpoint will be:

```text
http://127.0.0.1:9001/intake
```

### Choosing a port

| Guidance | Reason |
| --- | --- |
| Do not use `8080` | The Grid itself uses it by default |
| Do not use `9092` | The bundled message broker uses it |
| Pick a port nothing else on the host holds | The server fails to start if the port is already bound |

Other settings on this tab:

| Setting | What it does |
| --- | --- |
| **Secure** | Turns the server into HTTPS, and reveals **Certificate**, **Private Key**, and **Verify Peer**. Turning **Verify Peer** on reveals **Certificate Authority File** as well. |
| **Serve Files** | Serves static files from the directory named in **Serve Files Directory**. |

Leave **Secure** off for this local walkthrough. Adding TLS is covered in [Security](../administration/security/index.md).

---

## 5. Confirm the structure

Your project should now look like this:

```text
Getting Started              (project)
└─ HTTP Intake               (workflow)
   └─ Intake                 (Source HTTP, Route Path /intake, 1 worker)

Settings → Http Server       (installation-wide, port 9001)
```

A single-node workflow is valid and useful for a first test: the node receives a request and replies to it. Adding a Transform or Destination node after it is what makes messages flow onward — see [Interfaces and Core Nodes](../interface-development/interfaces/index.md) when you are ready to extend this.

---

## Next

Continue with [Edit the Script and Start the HTTP Server](start-http-server.md).

## Also worth knowing

The project popout has more than the **Workflows** tab. You do not need them for this walkthrough, but they are where project-wide settings live:

| Tab | Use it for |
| --- | --- |
| **Variables** | Project-level variables available to all workflows, with a **Secret** flag for passwords and keys |
| **Templates** | Reusable node templates, and importing them from another project |
| **Libraries** | Versioned code bundles shared across the project's nodes |
| **Git** | Project history, remote configuration, and **Export project** |

See [Project Settings](../administration/configurations/project-settings.md).
