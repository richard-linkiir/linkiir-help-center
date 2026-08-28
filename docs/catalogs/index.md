---
title: Catalogs
description: A catalog distributes adapter node templates and libraries between Linkiir grids over a git repository or a folder, with versioned content and reviewable updates.
keywords: [catalog, adapters, distribution, node templates, libraries, versioning, subscribe, publish]
---

# Catalogs

A **catalog** is a package of adapter content — node templates and shared libraries — that one grid publishes and other grids subscribe to. It is how an adapter gets from whoever built it to whoever runs it, and how it stays up to date afterwards.

## What a catalog holds

| Content | Versioned by | Notes |
| --- | --- | --- |
| **Node templates** | A `version` field the template declares | One template per adapter, at one path. A change that does not move the version forward is refused. |
| **Shared libraries** | The version name itself | Published versions sit side by side and are immutable. Several versions can be installed at once, and a node pins the one it uses. |

Both are the same objects you already build inside a project. You develop an adapter in a project, make a node template of it, publish a library version, and then promote those into a catalog. There is no separate authoring environment.

## How a catalog reaches a grid

A catalog lives in a git repository, and a grid gets at it one of three ways:

| Transport | Used for | Can this grid publish to it? |
| --- | --- | --- |
| **HTTPS** | Public or read-only subscriptions, cloned anonymously | No — supply the SSH URL to publish |
| **SSH** | The normal case for a catalog you maintain | Yes, with commit rights on the repository |
| **A folder on this machine** | Grids with no route to a git server | Yes |

The folder option exists because plenty of integration servers sit on a network segment with no outbound access at all. A catalog exported to a mounted share or a removable drive is the same object as one served over SSH — same layout, same manifest, same immutable library versions — so a grid can hold both kinds at once. See [Offline delivery](offline-delivery.md).

:::info[Any git host]
A catalog repository can be hosted anywhere that speaks git. There is no restriction to a particular provider.
:::

## Subscribed and owned

Every catalog on a grid records where it came from:

- **Subscribed** — cloned from a publisher.
- **Owned** — created on this grid.

That is provenance, and it is displayed, but it is not what decides who may change a catalog. **Write access** does, and write access is established by a verified test push to the repository rather than by where the catalog came from.

The practical consequence is that one catalog can be maintained from more than one grid. A vendor with a second installation, or a colleague holding commit rights on a catalog somebody else set up, can add content and publish from wherever they are sitting. A read-only subscription cannot, because the repository will not accept the push.

## Permission

Every catalog operation — subscribing, updating, publishing, and removing — needs the Administration-tier **Manage catalogs** permission. See [Users and Roles](../administration/configurations/user-roles.md).

Deciding whether to trust a publisher is an operator judgement, which is why it sits behind an administration permission and why an update shows you the commit and the diff before it is applied. A catalog is ordinary Lua that will run on your grid; Linkiir validates that its content will not break the grid or misrepresent itself, but it does not sandbox it.

## Where to go next

| Page | Covers |
| --- | --- |
| [Subscribing to a catalog](subscribing.md) | Adding a catalog, reviewing updates, and pulling them |
| [Using catalog content](using-catalog-content.md) | Building nodes from catalog adapters, and keeping them updated |
| [Publishing a catalog](publishing.md) | Creating a catalog, adding content, and publishing it |
| [Offline delivery](offline-delivery.md) | Moving a catalog on a share or a removable drive |
