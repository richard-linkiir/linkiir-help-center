---
title: HTTP Server Settings
---

# HTTP Server Settings

**Settings → Http Server** configures the embedded HTTP(S) server that every **Source HTTP** node on the installation shares. There is no port field on the node itself — one server answers every route, across every project.

```text
Settings → Http Server            port 8081
├─ /intake      → Source HTTP node "Intake"        (project A)
└─ /discharge   → Source HTTP node "Discharge"     (project B)
```

This is not the Grid's own web server. The port and certificate the browser talks to live in **Settings → Instance**.

Changing anything here needs the **HTTP server settings** permission. See [Users and Roles](user-roles.md).

---

## Fields

| Field | Default | Description |
| --- | --- | --- |
| **Use Server** | On | Whether the embedded server runs at all. Turning it off stops every HTTP source node on the installation. |
| **Port** | `8081` | The port every route answers on. |
| **Secure** | Off | Serve over HTTPS. Makes *every* route HTTPS, not just some. |
| **Certificate** | *(empty)* | Path to the TLS certificate file (PEM). Shown only when **Secure** is on. |
| **Private Key** | *(empty)* | Path to the TLS private key file (PEM). Shown only when **Secure** is on. |
| **Verify Peer** | Off | Require and verify a client certificate (mutual TLS). Shown only when **Secure** is on. |
| **Certificate Authority File** | *(empty)* | The CA that signs accepted client certificates. Shown only when **Verify Peer** is on; leave it blank to use the system CA store. |
| **Serve Files** | Off | Serve static files from a directory alongside the node routes. |
| **Serve Files Directory** | *(empty)* | The directory to serve, when **Serve Files** is on. |

File paths are read by the Runtime on the server, not by your browser. Give absolute paths — `/etc/linkiir/certs/cert.pem` — rather than paths that only exist on the machine you are sitting at.

:::caution[TLS needs both files]
Saving with **Secure** on and either **Certificate** or **Private Key** blank is refused. It is refused deliberately: the Runtime's HTTP server will not start at all without them, so the alternative is every HTTP source node on the installation silently losing its listener.
:::

---

## Saving restarts the Runtime

The Runtime reads these settings once, when its process starts. There is no hot reload for them, so a change to a field the Runtime consumes only takes effect when the Runtime is replaced.

The save button says which one you are about to do:

| Button | When | Effect |
| --- | --- | --- |
| **Save** | You changed only **Use Server**, **Serve Files**, or **Serve Files Directory** | Stored. Nothing restarts. |
| **Save & Restart** | You changed **Port**, **Secure**, **Certificate**, **Private Key**, **Verify Peer**, or **Certificate Authority File** | Stored, then the Runtime is stopped and started again. |

A restart is fleet-wide: every node the Runtime was running stops with it and comes back as it starts up. Expect a few seconds of interruption, and up to about 30 seconds if the Runtime needs its full grace period to shut down cleanly. Only the Runtime restarts — the Grid stays up, so the page keeps its connection and tells you when the Runtime is back.

Two cases end with the settings saved but not applied, and say so rather than reporting success:

| Message | Meaning | What to do |
| --- | --- | --- |
| *This Grid does not supervise the Runtime* | Runtime supervision is turned off for this installation — typically a developer running the Runtime by hand or under a debugger | Restart the Runtime yourself |
| *The Runtime binary was not found* | No Runtime is installed at the configured path | Fix the installation, then restart |

---

## Related

- [Source Nodes](../../interface-development/interfaces/source-nodes.md) — the Source HTTP node's own fields
- [Edit the Script and Start the HTTP Server](../../getting-started/start-http-server.md) — end-to-end walkthrough
- [Security](../security/index.md) — exposing a route beyond the local machine
