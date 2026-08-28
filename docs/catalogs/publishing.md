---
title: Publishing a Catalog
description: Create a catalog on a Linkiir grid, promote node templates and library versions into it from a project, and publish it for other grids to subscribe to.
keywords: [catalog, publish, authoring, adapters, node templates, libraries, write access, versioning]
---

# Publishing a Catalog

A catalog you publish is the mirror image of one you subscribe to. Both end up as the same kind of thing on the grid, which is why an adapter you author appears in your own node palette exactly as a subscriber will see it.

Everything here needs the **Manage catalogs** permission.

## Create a catalog

In **Settings → Catalogs**, click **Create a catalog** and supply:

| Field | What it is |
| --- | --- |
| **Catalog name** | Display name shown to subscribers |
| **Identifier** | Lowercase letters, numbers, `-` or `_`. Namespaces the catalog's node types so they cannot collide with another catalog's. |
| **Publisher** | Who publishes it |
| **Description** | Shown to subscribers |
| **Repository to publish to** | An SSH URL, or a folder on this machine |

:::caution[The repository must already exist, and must be empty]
Linkiir does not create the remote repository — make it on your git host first. It must be **empty**: publishing into a repository that already has content would either be refused by git, or graft the catalog onto an unrelated project's history. The check is read-only, so a rejected URL is left exactly as it was.

For a folder, the folder itself must exist. Linkiir creates the git repository inside an empty one, but will not invent the folder — that is what catches a mistyped mount point, which would otherwise write a catalog somewhere nobody will look.
:::

## Add content

Catalog content is built and tested in a project first, then promoted. There is no separate authoring environment: you build an adapter in a project, make a node template of it, publish a library version, and promote the result.

Click **Add content**, choose the source project, and pick a **Node template** or a **Library**. You can also add a node to a catalog from its right-click context menu in the Builder.

Two things are rewritten on the way in:

- **The node type identifier is re-namespaced** to the catalog's own identifier, so it cannot collide with another catalog's or with the types the Runtime handles specially.
- **Password fields are blanked.** Creating a node template encrypts password fields into it, so promoting one unchanged would ship an encrypted secret to every subscriber — who could not decrypt it against their own key, and would see an error blaming the key rather than the catalog.

Published library versions are copied as they are, and never overwritten. A version is immutable, and a subscriber's node pins it by name and version.

Adding content commits to the catalog locally. Nothing reaches subscribers until you publish.

## Version your adapters

A node template declares its version, and an update that changes a versioned adapter without moving its version forward is refused. That rule is what lets a subscriber's node record `1.2.0` and be offered versions rather than commit hashes as the thing to move between — without it, one version could name several different sets of files.

The version field is optional, so adapters published before it keep working and are addressed by commit. But an adapter that declares a version can never drop it, because subscribers' nodes are pinned to it.

Publishing enforces the version rule at the point of authoring, so a missed bump is caught by you rather than by every subscriber's refused pull.

## Publish

**Publish** commits whatever the catalog currently holds and pushes it.

Subscribers see that an update is waiting on their next background check, review the diff, and pull when it suits them. Fill in **Release notes** to tell them what changed — it is shown alongside the diff.

Publishing runs the *same* validation a subscriber runs on pull, before the push rather than after. Publishing content that every subscriber would then refuse is a failure that belongs where the person who can fix it is standing, not in a support ticket.

## Publishing to a catalog you subscribed to

Publishing is not restricted to catalogs created on this grid. What decides it is whether the repository accepts a push from here, not where the catalog came from.

A catalog is one repository however many grids it is installed on, so a vendor maintaining it from a second installation, or a colleague with commit rights, has every business editing it. The only thing that should stop them is git saying no.

Write access is established by a verified test push, run once and recorded, rather than being assumed from provenance. Read access proves nothing — a read-only deploy key passes that happily.

Two things may need fixing first, both consequences of how a subscription was cloned:

| Situation | What happens |
| --- | --- |
| **The clone is shallow** | Servers commonly refuse a push from a truncated history, and update safety depends on ancestry. Confirming access fetches the full history first. |
| **It was cloned over HTTPS** | HTTPS cannot be pushed to at all. You are asked for the repository's SSH URL and the remote is re-pointed at it. Both URLs name the same repository, so nothing about the catalog changes. |


## Pulling into a catalog you publish to

A catalog you can write to is pulled like any other, but applied differently. A read-only checkout can be reset onto the incoming commit because there is nothing to lose. A checkout you can write to may hold unpublished work, so your own commits are replayed on top of the incoming ones, and only a genuine conflict stops it.
