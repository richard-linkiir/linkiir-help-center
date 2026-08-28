---
title: Subscribing to a Catalog
description: Add a published catalog to a Linkiir grid, see when an update is waiting, review what it changes, and pull it.
keywords: [catalog, subscribe, pull, update, adapters, validation, diff]
---

# Subscribing to a Catalog

Subscribing installs a publisher's catalog on this grid, so its adapters appear in the node palette and its libraries can be installed into projects.

Catalogs are managed in **Settings → Catalogs**. Everything on this page needs the **Manage catalogs** permission.

## Add a catalog

Click **Subscribe to a catalog** and fill in:

| Field | What it is |
| --- | --- |
| **Repository URL or folder** | An `https://` URL, an SSH URL, or the absolute path of a folder on this server holding an exported catalog |
| **Branch or tag** | The ref to track. Defaults to `main`. |
| **Install as** | The name the catalog is installed under. Defaults to the repository name. |
| **SSH key** | Private key for an SSH repository. Leave empty to use the admin user's key. |
| **CA bundle** | Only for a self-hosted HTTPS repository whose certificate this host does not already trust. |

The catalog is cloned into a staging area and validated before anything is installed. If validation fails, nothing is left behind — no directory and no registry entry — and the reason is reported.

### What validation refuses

Validation is not a sandbox. A catalog is ordinary Lua that will run on your grid, and deciding whether to trust its publisher is your call. What these checks do is narrower: refuse content that would break the grid or misrepresent itself, whoever published it.

| Refused | Why |
| --- | --- |
| No catalog manifest at the repository root | It is not a Linkiir catalog |
| A manifest this version cannot read | The catalog uses a newer format than this grid supports |
| Unsafe, too deeply nested, or Windows-reserved paths | The content could not be checked out safely on every platform |
| Symbolic links and git submodules | Both can point outside the catalog |
| A node type identifier already in use on this grid | Identifiers must not collide with another catalog's, or with the ones the Runtime handles specially |
| A password field shipped with a value | A catalog must never carry a secret. An encrypted one would not decrypt on a subscriber's grid anyway. |
| An empty repository, or more files than the grid accepts | Nothing to install, or implausibly large |

A catalog that declares a version for an adapter can never drop it later, and an update that changes a versioned adapter without moving its version forward is refused. That rule is what makes a version, rather than a commit hash, the thing a node can be pinned to.

## Seeing that an update is waiting

A background check fetches each catalog on a schedule and caches the answer, so the Catalogs tab can show which catalogs are behind without stalling on the network. It runs shortly after the grid starts, on an interval after that, and again whenever you open the Catalogs tab.

The fetch is strictly read-only. Nothing is ever applied on its own — pulling an update stays a decision somebody makes.

## Review and pull an update

Open the catalog and choose to view the update. You see the incoming commit and a diff of what it changes, grouped as **What changed** with the publisher's release notes alongside.

Review it before applying. A pull replaces the checkout, so this is the point at which a force-pushed or compromised upstream is visible — afterwards there would be nothing left to compare against.

Click **Pull** to apply. What happens next depends on whether this grid can write to the catalog:

- **A read-only subscription** is reset onto the incoming commit. There is nothing local to lose.
- **A catalog this grid can publish to** may hold unpublished work, so its own commits are replayed on top of the incoming ones. Only a genuine conflict stops it.

Pulling a catalog updates the catalog itself. It does not touch the nodes built from it — those are updated per node, which is a separate and deliberate decision. See [Using catalog content](using-catalog-content.md).

## Remove a catalog

**Remove this catalog from the grid** deletes the checkout and its registry entry. Nodes already built from its adapters keep working: their files live in the project, not in the catalog. What they lose is the ability to be updated from it.
