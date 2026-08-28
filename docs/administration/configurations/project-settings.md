---
title: Project Settings
---

# Project Settings

Open a project by clicking its card on the **Projects** page. The popout that appears is where everything project-wide lives.

---

## The project card

Each card on the **Projects** page carries the project's name and description, a chip summarising its workflows, and a footer showing **Total Queue**, the workflow count, and when the project last changed.

| To | Do |
| --- | --- |
| Open the project's settings | Click the card |
| Open the Builder or Monitor | Right-click the card, choose **Open in Builder** or **Open in Monitor**. The Monitor opens filtered to this project. |
| Rename or re-describe it | Right-click the card, choose **Edit project** |
| Delete it | Right-click the card, choose **Delete project**, then type the project's name to confirm |
| Reorder the cards | Drag a card by the grip handle in its top-right corner |
| Create or import a project | Click the chevron on **Add Project** — **New project**, **From zip**, or **From remote** |

**Edit project** and **Delete project** are greyed out without the **Edit project details** and **Delete projects** permissions; card order is only a display preference, so it is open to everyone and saves as soon as you drop the card.

A project you do not collaborate on shows as **No access** — name and description only, with no counters and no right-click menu.

---

## The project popout

Across the top it shows four counters — **Workflow Count**, **Workflows Running**, **Nodes Running**, and **Current Queue** — then a row of tabs.

| Tab | Use it for |
| --- | --- |
| [Workflows](#workflows) | Create, start, stop, and open the project's workflows |
| [Variables](#variables) | Values shared by every workflow in the project |
| [Templates](#templates) | Reusable node configurations, and importing them from another project |
| [Libraries](#libraries) | Versioned code bundles the project's scripts share |
| [Git](#git) | Project history, the remote, and **Export project** |
| [Collaborators](#collaborators) | Who may open this project at all |

---

## Workflows

The default tab. Each row shows the workflow name, its state, its auto-start setting, queue depth, error count, and last activity.

| State | Meaning |
| --- | --- |
| **Off** | No nodes running |
| **Running** | Nodes running and ready |
| **Processing** | Running with messages in flight |
| **Failed** | At least one node errored |

Per-row actions:

| Action | Does |
| --- | --- |
| **Open in Builder** (hammer icon) | Opens the Workflow Builder to lay out and configure nodes |
| **Open in Monitor** (activity icon) | Opens the Monitor filtered to this project, with the workflow's name in the search box |
| **Start** / **Stop** | Starts or stops every node in the workflow |

Header actions: **Add Workflow**, **Start All** / **Stop All**, and a sort button that cycles the order rows are listed in.

Right-click a workflow row for **Edit workflow** — name, description, and **Auto Start** — and **Delete workflow**. Both need the **Edit workflows** permission; without it the menu does not open.

A workflow with no nodes has no Start button. There is nothing to run yet.

### Auto Start

Each row carries an **Auto start on** or **Auto start off** badge. It decides whether the Runtime starts that workflow by itself when it boots — after a server reboot, a service restart, or a Runtime restart from **Settings → Http Server**.

| Setting | At Runtime start-up |
| --- | --- |
| **Auto start on** | The workflow's nodes start automatically |
| **Auto start off** (default) | The workflow stays off until someone starts it |

To change it: right-click the workflow row, choose **Edit workflow**, and switch **Auto Start** on or off. It is saved with the workflow's name and description, and is committed to the project's history like any other change.

Turn it on for production interfaces that must come back on their own after a restart. Leave it off for anything half-built, or for a workflow whose destination is a live system you do not want written to unattended — an auto-started workflow begins consuming its queue as soon as the Runtime is up, with nobody watching.

Auto start is a property of the workflow, so it travels with the project into an export.

---

## Variables

> Project-level variables available to all workflows in this project.

Use variables for the values that differ between environments: hostnames, directory paths, account identifiers, feature switches — and, with the **Secret** flag set, the passwords and keys those endpoints need.

1. Click **Edit**.
2. Click **Add Variable**.
3. Set a **Label** and a **Value**.
4. Click **Save**.

The label is the name your scripts and node configuration refer to, so use a stable, readable form. The default text reads `VARIABLE_NAME`.

### Secrets

Each row has a **Secret** checkbox. This is where connection passwords and keys belong — there is no separate credentials tab. Ticking **Secret** masks the value in the UI and clears whatever was there, so you re-enter it deliberately, and the value is encrypted at rest rather than stored as plain text. Password-typed fields on a node's configuration are protected the same way.

Reference a secret from node configuration and scripts by its label. Never paste a password into a Lua file: the file is committed to the project's history and travels in an export.

:::caution[Secrets do not survive a move to another installation]
Secrets leave in their encrypted form, and only the installation that encrypted them can read them back. Import the bundle somewhere else and every secret arrives unreadable — the labels are intact, the values are not usable. Re-enter them on the target before starting anything.

Restoring onto the same installation, with the same key, keeps them working.
:::

:::tip[Variables are what make a project portable]
A project whose endpoints are variables is repointed by editing this tab. A project with hostnames typed into every node has to be edited node by node. Decide this early — it is the difference between a five-minute promotion and an afternoon of it. See [Import and Export](../deployment/import-export.md).
:::

---

## Templates

> Reusable node templates created from this project's workflows (via "Create template" on a node). Drag them from the node palette in the Workflow Builder to add a new node.

A template captures a configured node so the next one like it starts from the same settings instead of from defaults. Useful for a house-standard LLP listener, or a File/FTP node pointed at your usual directory layout.

**Creating one:** configure a node in the Workflow Builder, then use **Create template** on it. It is saved to the project and appears in the palette alongside the built-in node types.

The whole node is captured — every script it has and the library versions it pins, not just its entry-point script. A node built from an adapter carries several modules and a library dependency, and a template holding only one file could not run.

**Sample messages** are the one part you choose, and they are left out by default. Every other file in a node is something an author wrote; a sample is a message captured to test against, which on a live grid is real traffic. Turn **Sample Messages** on only when the samples are safe to travel — a template can be reused by a colleague, copied into another project, or promoted into a catalog and shipped to customers.

Files that came from a pinned library are deliberately not copied. Those belong to the pin, and are restored from the version the template names — carrying frozen copies would mean a template that kept shipping a library's old code after its pin had moved on.

**Replacing one:** saving a template whose name is already taken for that node type replaces it outright rather than merging. The dialog says so before you confirm, because names collide once punctuation and case are stripped — "My Adapter" lands on "my adapter" without your having aimed at it. Nodes already built from the old template keep their own copies and are unaffected.

**Copying from another project:** click **Import from Project**, pick a **Source Project**, tick the templates you want, and click **Import Selected**. Any libraries the templates pin that this project does not already have come across with them. This only reaches projects on the same installation. To move templates between installations, move the whole project — see [Import and Export](../deployment/import-export.md) — or publish them in a [catalog](../../catalogs/index.md).

Right-click a template row for **Edit template** and **Delete template**. Both need the **Manage node templates** permission.

---

## Libraries

> Reusable, versioned code bundles shared across this project's nodes. Created, edited, and linked to nodes from the Scripting page's Libraries picker.

The tab lists what exists, showing each library's name, its current working version, how many versions are published, and its description. A library that has never been published shows `unpublished`.

Create, edit, publish, and link libraries from the **Libraries** picker on the Scripting page, where a node links to a library at the point it is used.

**Copying from another project:** click **Import from Project**, pick a **Source Project**, tick the libraries you want, and click **Import Selected**. The whole library comes across — the working copy and every published version. A name already taken in this project is refused rather than merged, and this only reaches projects on the same installation.

**Removing one:** right-click a library row and choose **Remove library from project** (needs **Manage shared libraries**). Before you confirm, the dialog lists every node that currently links to it — workflow, node, and the version each is pinned to — so you can see what the removal touches. Those nodes are unlinked automatically and keep running: their own scripts are untouched, but anything they called from the library is gone.

Use a library rather than the project's `common` directory when you want versioning: a node pins a published version, so changing the library does not silently change every node that uses it.

Libraries travel inside a project export. Importing a project also carries the library versions its nodes pin, so those nodes arrive able to resolve their dependencies.

**Published versions are immutable.** Publishing checks the project hub rather than only your own clone, so two collaborators cannot each publish a different `2.0.0`. Publishing propagates to other collaborators' clones straight away, so their version pickers and update indicators reflect it without waiting for a pull.

Libraries can also be installed from a subscribed catalog, and a catalog library upgrade is offered to every project that has it installed. See [Using catalog content](../../catalogs/using-catalog-content.md).

---

## Collaborators

> Only collaborators can open this project. Everyone else sees that it exists and nothing more.

Permissions decide what a user may do; this tab decides which projects they may do it to. Both have to allow an action for it to go through — see [Users and Roles](user-roles.md).

| Action | Needs | Does |
| --- | --- | --- |
| **Add Collaborators** | **Add collaborators** | Opens a picker of every user not already on the project; tick names and add them together |
| Trash icon on a row | **Remove collaborators** | Removes that person, after a confirmation |

Your own row is marked **you**, and you can remove yourself — the confirmation says so plainly, because it takes your own access away.

There is no owner. Whoever creates the project is added as its first collaborator like anybody else. That means the list can end up empty, which is legal and shows as *Nobody is on this project. It cannot be opened until someone is added.* Anyone holding **Add collaborators** can reopen it, on any project on the instance; that permission is what makes a lockout recoverable, and it grants no access to the contents on its own.

A project you are not on still appears on the **Projects** page as **No access**, with its name and description and nothing else — no workflows, no counters, no right-click menu. Someone holding **Add collaborators** or **Remove collaborators** can still open such a project, and the popout then shows this tab and nothing else: enough to grant access, not enough to read the project.

The collaborator list lives inside the project, so it travels with an export and with a git sync, and deleting the project takes it along.

---

## Git

Every project is version controlled. This tab shows **Project History** — the commits covering structural changes and content edits from every user, newest first.

Click a commit to see its changed files, and a file to see its diff.

| Action | Does |
| --- | --- |
| **Export project** | Downloads the project as a `.zip` bundle another installation can import |
| **Configure remote** | Sets the **Remote SSH URL** this project pushes to and pulls from |
| Refresh icon | Re-reads the history |

**Push to remote** and **Pull from remote** are the cloud icons in the project header and on the project card. A dot on the icon means there is something to send or receive.

Both authenticate as whoever clicks them, using the **SSH private key path** set on that user in **Settings → Users**. There is no shared project key, which means a user without a key configured cannot push or pull.

The remote must be SSH — `git@host:path` or `ssh://host/path`. HTTPS URLs are not accepted. When you first configure a remote it must point at an empty repository, because the project's history is pushed into it.

See [Import and Export](../deployment/import-export.md) for moving projects between installations.

---

## Where instance-wide settings live instead

These are not project settings. They apply to the whole installation, in **Settings**:

| Setting | Tab |
| --- | --- |
| [HTTP server port and TLS](http-server.md) | **Http Server** |
| Grid port and TLS | **Instance** |
| Session timeouts | **Instance** |
| Users, and their SSH keys | **Users** |
| Roles and permissions | **Roles** |
| Log Archive DB | **Database**, **Logging** |
| Environment variables | **Environment** |
| License | **License** |

---

## Next

- [Import and Export](../deployment/import-export.md)
- [Users and Roles](user-roles.md)
- [Interface Development](../../interface-development/index.md)
