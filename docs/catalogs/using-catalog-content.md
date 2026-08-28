---
title: Using Catalog Content
description: Build nodes from catalog adapters, keep them following the catalog, update them one at a time or in bulk, and install catalog libraries into a project.
keywords: [catalog, adapters, node templates, linked nodes, updates, libraries, versions]
---

# Using Catalog Content

A subscribed catalog puts its adapters in the node palette and its libraries within reach of every project. This page covers what happens after that: how a node stays connected to the adapter it came from, and how updates reach it.

## Adding a node from a catalog adapter

Catalog adapters appear in the Builder's node palette alongside the built-in nodes, grouped by the catalog they came from. Drag one onto the canvas as usual.

Creating the node copies the adapter's files into the project and installs any libraries the adapter pins that the project does not already have. Nothing else on the grid is touched.

:::tip Palette display
The palette's grouping and sort controls are in its header, and the palette itself can be resized to suit how many adapters you have installed.
:::

## Linked nodes

A node created from a catalog adapter stays **linked** to it. That link is what makes an in-place update possible at all — without it, moving a node to a newer version of its adapter meant deleting it and adding it again, losing its configuration, its wiring, and its identity in every log and metric keyed to it.

While a node is linked:

- **Its files belong to the vendor**, and the grid refuses to edit them. That is what lets an update be a clean re-materialization rather than a merge against local changes nobody recorded.
- **Its configuration values stay yours** and remain editable throughout. Following a catalog rather than forking it is the whole point.

### Unlinking

**Unlink** stops the node following its catalog. Every file stays exactly as it is; what changes is that the files become editable and no further updates are offered.

Unlinking is deliberately one-way. A fork can never be silently reconnected to a catalog, because there would be no way to tell which of its files were still the vendor's.

A node also keeps working — and stays updatable from what it recorded — if its catalog is removed from the grid entirely. The node remembers which of its files came from the vendor, so a later update can still tell vendor code apart from anything you added.

## Updating a node

Pulling a catalog updates the catalog's checkout and nothing else. Nodes built from its adapters keep the files they were created with, so a pull can never disturb a running workflow.

That means a pull leaves work behind: every node following an adapter that moved is now a version behind. Updating those nodes is a separate, deliberate action.

### What an update preserves

An update re-materializes the node from the chosen version of the adapter. Three things are handled explicitly:

| Item | What happens |
| --- | --- |
| **Config values you set** | Matched field by field, by label. A field the vendor did not redefine keeps its value. Only a field the vendor actually redefined resets to the new default, because that is the one case where the old value no longer has a defined meaning. Fields the vendor added arrive with defaults; fields the vendor dropped go. |
| **Files the vendor stopped shipping** | Removed, and only those. An orphaned file from an old version cannot shadow a `require` in the new one. |
| **Files you added after unlinking** | Untouched — an unlinked node is not offered updates at all. |

An update lands as an ordinary project commit, so the existing run-from-commit picker rolls it back wholesale, files and merged configuration together.

### Choosing a version

An update can target any version of the adapter the catalog holds, not only its newest. Catalogs carry their full history, so moving a node back to an earlier version is an ordinary action rather than a restore.

This is a different question from the run-from-commit picker, and they are worth keeping straight:

| Action | Answers |
| --- | --- |
| **Choosing an adapter version** | "Which version of the vendor's adapter should this node be on?" Lands as a new commit, with configuration merged against that version. |
| **Run-from-commit picker** | "Which moment in this project's own history should the Runtime execute?" Replays what was already there. |

The version a node should be on is a per-node decision; pulling the catalog is instance-wide. That is why the two are not the same control.

### Updating several nodes at once

After a pull, **Settings → Catalogs** lists every node across the grid whose adapter has a newer release, under **Nodes built from adapters**. Select the ones to move and apply them together.

A node that cannot be updated — it is running, it has been unlinked, or its catalog is gone — is reported and stepped over rather than failing the rest of the batch.

Updating a node needs the **Edit config fields** permission, because an update can add, remove, and redefine the node's configuration fields. That is the same authority as editing them by hand; the only difference is that the vendor decided the shape rather than you.

## Catalog libraries

Pulling a catalog updates the instance-level checkout. A library becomes usable by a node only once it is installed into a project, which happens two ways:

- **Explicitly**, from the project's Libraries tab or the Scripting page's catalog libraries tab.
- **Automatically**, when a node is created from a catalog adapter that pins libraries the project does not have yet.

### Versions are immutable

A published library version is immutable, and versions are additive. Installing a newer version never disturbs nodes already running: a node pins one version by name, keeps resolving that version, and the Scripting page's update dot simply lights up to say a newer one exists.

Moving nodes onto a new version is its own step, for the same reason node updates are: "version 2.0.0 exists" and "this node runs 2.0.0" are two different facts. The Scripting page lists every node still on an older version and moves a chosen set forward.

:::info Publishing a version is shared, immediately
Publishing a library version checks the project hub, not just your own clone, so two collaborators cannot each publish a different `2.0.0`. Publishing also propagates to other collaborators' clones straight away — it is the act that declares a version ready for other people, so their version pickers and update indicators reflect it without waiting for a pull.
:::

## Carrying pinned libraries between projects

Importing a project into another project brings the libraries its nodes pin along with it, so nodes arrive able to resolve their dependencies rather than referring to versions the destination has never seen.
