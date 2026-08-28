---
title: Import and Export Projects
---

# Import and Export Projects

A project is the unit that travels. Export one to a file, hand that file to another Linkiir grid, and import it there — workflows, nodes, scripts, schemas, samples, libraries, and canvas layout arrive intact.

There are two ways to move a project, and they answer different questions.

| Method | Use when | Keeps history | Stays linked |
| --- | --- | --- | --- |
| **Zip bundle** | The two grids cannot reach each other, or you want a point-in-time copy | No | No |
| **Git remote** | Both grids can reach a shared repository | Yes, every commit | Yes, push and pull |

A bundle is a file you can email, attach to a change ticket, or archive with a release. A remote is a live link: the project on the target grid stays connected to the same repository, so you can pull later updates instead of importing again.

---

## Export a project as a bundle

1. Open **Projects**.
2. Click the project card to open it.
3. Go to the **Git** tab.
4. Click **Export project**.

Your browser downloads a `.zip` file named after the project, for example `Patient_Administration.linkiir.zip`.

The button sits next to **Configure remote** on purpose: they are the two ways a project leaves the grid.

### What the bundle contains

| Included | Detail |
| --- | --- |
| Project settings | Name, description, and project configuration |
| Every workflow | Workflow settings and the nodes inside them, with their connections |
| Node configuration | Every field you set on every node |
| Scripts | `main.lua`, ACK scripts, and node-local modules |
| Shared modules | The project's `common` directory |
| Libraries | The project's versioned library bundles |
| Schemas and samples | Everything stored with a node |
| Canvas layout | Node positions, so imported workflows open laid out rather than stacked at the origin |

### What the bundle deliberately leaves out

| Excluded | Why, and what to do about it |
| --- | --- |
| **Usable secret values** | Variables marked **Secret** travel encrypted, and only the installation that encrypted them can read them back. On another grid their names arrive intact and their values do not work. Re-enter them on the target. |
| **The remote URL** | An imported project starts out local-only. Connect a remote on the target grid if you want one. |
| **Git history** | A bundle is a snapshot. If the commit history matters, move the project by remote instead. |

:::tip[Check the bundle before you send it]
A bundle is an ordinary zip. Open it to confirm what you are handing over. `linkiir_project.json` at the root records the project name, description, workflow count, who exported it, and when.
:::

### Before you export

- Save any open script edits. The bundle carries what you see in the app, including work you have not pushed.
- Remove or replace samples containing real patient data. Samples travel with the node.
- Note the source environment and Linkiir version alongside the file, so whoever imports it knows what they have.

---

## Import a project from a bundle

1. Open **Projects**.
2. Click the chevron on **Add Project**.
3. Choose **From zip**.
4. Drop the `.zip` on **Choose a project bundle**, or click to browse for it.
5. Optionally type a **Name**. Leave it blank to keep the name in the bundle.
6. Click **Import**.

The project appears in the list, ready to open. Nothing needs restarting — the runtime picks up the new project on its own.

### When names and identifiers collide

Linkiir gives every project, workflow, and node a stable identifier separate from its display name. Importing normally preserves those identifiers, which is what keeps a project promoted from DEV to TEST recognisably the same project.

Importing a bundle onto a grid that already has that project is the exception. Rather than refusing, the import gives the copy fresh identifiers and tells you so:

> A project with these ids was already here, so the copy was given new ones.

That makes a bundle safe to import twice on one grid — useful for cloning a project as a starting point for a new one. The two copies are then independent: a change to one does not touch the other.

Display names are not checked for uniqueness, so give the copy a distinct **Name** at import time if you want to tell them apart at a glance.

### If an import is refused

| Message | What it means |
| --- | --- |
| That file isn't a zip archive | The upload is not a zip. Re-download or re-export it. |
| Not a Linkiir project bundle | The zip has no `linkiir_project.json` at its root. It is a different kind of archive, or the project directory was zipped by hand instead of exported. |
| …or it was exported by a newer version of Linkiir than this grid can read | The source grid is newer than the target. Upgrade the target, or export from a grid at the target's version. |
| The bundle is incomplete | The archive is missing the project configuration. Export it again. |
| A project with that id is already on this grid | A rare race with another import of the same project. Retry. |
| That archive is larger than this grid will import | A bundle is text plus samples, so this normally means large sample payloads. Trim them and export again. |
| The archive contains a symlink / an unsafe path | The archive was not produced by Linkiir. Only import bundles you exported. |

---

## Import a project from a Git remote

Use this when the project lives in a repository both grids can reach. The clone becomes this grid's copy of the project and stays linked to the remote, so **Push** and **Pull** work immediately.

### Prerequisites

- The repository URL must be SSH — `git@host:path` or `ssh://host/path`. HTTPS URLs are not accepted.
- Your own user account needs an SSH key. An administrator sets it in **Settings → Users**, on your user, in **SSH private key path**. Push, pull, and remote import all authenticate as whoever triggers them, using that key — there is no shared project-level key.

### Steps

1. Open **Projects**.
2. Click the chevron on **Add Project**.
3. Choose **From remote**.
4. Enter the **Remote SSH URL**, for example `git@github.com:org/patient-administration.git`.
5. Optionally type a **Name**. Leave it blank to keep the name in the repository.
6. Click **Import**.

The project arrives with its full history and its remote already configured.

### Publishing a project to a remote in the first place

On the grid that owns the project:

1. Open the project and go to the **Git** tab.
2. Click **Configure remote**.
3. Enter the **Remote SSH URL** and save.
4. Use the **Push to remote** button in the project header.

The target repository must be empty — the project's history is pushed into it.

### If a remote import is refused

| Message | What to do |
| --- | --- |
| No SSH key is configured for your user | Have an administrator set **SSH private key path** on your user in **Settings → Users**. |
| Remote URL must be an SSH URL | Use the `git@…` form of the URL, not `https://`. |
| Could not clone that repository | Check the URL, and that your key has access to it. |
| That repository doesn't hold a Linkiir project | The repository is not a pushed Linkiir project. |
| That project is already on this grid | Pull it from its **Git** tab instead of importing a second copy. |
| A workflow in that project shares its id with one already on this grid | Import it as a zip bundle instead. That gives the copy fresh identifiers. |

Unlike a zip import, a remote import never regenerates identifiers — it has to stay the same project for pushes back to the remote to mean anything.

---

## After any import

Work through these before you start anything.

1. **Re-enter secrets.** Open the project's **Variables** tab. Every variable marked **Secret** arrived encrypted under the source installation's key and is unusable here. The names tell you what is needed.
2. **Check project variables.** The **Variables** tab travelled with its values. Anything environment-specific — hostnames, paths, account identifiers — needs repointing at this environment.
3. **Repoint node configuration.** Source and destination nodes carry the source environment's directories, hosts, and ports. A destination LLP node imported from DEV still names the DEV receiver.
4. **Connect a remote, if you want one.** A bundle import is local-only. Set it up in the **Git** tab.
5. **Test before starting.** Use **Run Test** on each script against its samples. Queue output is held back during a test, so nothing is produced.
6. **Start one workflow and verify end to end** before starting the rest.

:::caution[An imported project can point at production]
This is the failure worth guarding against: importing a PROD project into TEST and starting it, while its destination nodes still name production systems. Repoint every endpoint before the first start, not after.
:::

---

## Copying node templates between projects

To reuse a node's configuration without moving a whole project, use a node template. Templates copy between projects on the same grid.

1. In the Workflow Builder, use **Create template** on a configured node. It is saved to that project.
2. Open the project you want to copy it into, go to the **Templates** tab, and click **Import from Project**.
3. Pick the **Source Project**, tick the templates you want, and click **Import Selected**.

Imported templates appear in the node palette in the Workflow Builder, ready to drag onto a canvas.

A template name has to be unique within a project's templates for its node type. If one already exists with that name, rename the existing template before importing.

---

## Promoting a project through environments

A workable promotion path using the two methods together:

```text
DEV grid                      TEST grid                     PROD grid
   │                              │                             │
   ├── Configure remote ──────────┼─────────────────────────────┤
   │   Push                       │                             │
   │                          Add Project                   Add Project
   │                          > From remote                 > From remote
   │                              │                             │
   │                          Pull for updates             Pull for updates
```

Publish the project to a repository once, then import it from that remote on each downstream grid. Later changes are a **Pull** rather than another import, and the repository is your record of what changed between environments.

Where grids are network-isolated — a common arrangement for production — use a bundle for the isolated hop and keep the bundle with the change record.

| Practice | Reason |
| --- | --- |
| Import into TEST before PROD | An import is a configuration change; validate it like one. |
| Keep the bundle you imported | It is the exact artifact that was promoted, which a re-export later is not. |
| Record source grid and version | Makes an import reproducible and a rollback possible. |
| Repoint endpoints and credentials before the first start | The one step that prevents a test system contacting live systems. |
| Promote whole projects, not hand-edited bundles | A bundle assembled or edited by hand is refused, and a partially copied project is worse than none. |

---

## What import and export do not cover

These are separate from project portability. Moving a project does not move them.

| Not in a project bundle | Where it lives |
| --- | --- |
| Users, roles, and permissions | Instance settings — recreate them on the target grid |
| Broker connection settings | [Kafka Configuration](../configurations/kafka-redpanda.md) |
| Log Archive DB settings and archived message history | [Log Archive Database](../configurations/log-archive-database.md) |
| The HTTP server port and TLS settings | Instance settings — see [Security](../security/index.md) |
| The license | [Licensing](../licensing/index.md) |
| The master encryption key | [Backup and Restore](../backup-restore/index.md) |

For protecting a whole installation rather than moving one project, see [Backup and Restore](../backup-restore/index.md). Export is project portability; it is not a backup of the grid.

---

## Next

- [Deployment](index.md) — environment profiles.
- [Backup and Restore](../backup-restore/index.md) — protecting the whole installation.
- [Security](../security/index.md) — credentials, TLS, and remote access.
