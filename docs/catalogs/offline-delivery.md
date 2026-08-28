---
title: Offline Delivery
description: Move a Linkiir catalog between grids on a mounted share or a removable drive, for installations with no route to a git server.
keywords: [catalog, offline, air-gapped, export, import, folder, removable drive]
---

# Offline Delivery

A catalog is normally reached over HTTPS or SSH, which assumes the grid has a route to the publisher. Plenty do not — a hospital's integration server is commonly on a segment with no outbound access at all.

For those, a catalog can live in a plain git repository in a folder: a mounted share, or a removable drive. The two ends of that are **export** and **import**.

| Step | What it does |
| --- | --- |
| **Export** | Pushes the catalog this grid holds into a folder, creating the repository there if the folder is empty. The folder is then carried to the other grid. |
| **Import** | Subscribing, with the folder's path in place of a URL. |

Nothing else about import differs from an ordinary subscription: the same validation runs, and what lands is an ordinary catalog that can be updated later from the same folder.

## Export a catalog

Open the catalog in **Settings → Catalogs** and export it, giving the **folder to publish to**.

:::caution The folder must already exist
Linkiir creates the git repository inside an empty folder, but will not create the folder itself. Refusing a path that does not exist is what catches a mistyped mount point — which would otherwise write a catalog into a folder nobody will ever look in.
:::

## Import a catalog

On the receiving grid, subscribe as usual but give the folder's absolute path instead of a URL. See [Subscribing to a catalog](subscribing.md).

## Updating later

Carry the folder back to the publishing grid, export again, and carry it across. The receiving grid pulls from the folder exactly as another grid pulls from a server — it sees an update waiting, shows the diff, and applies it when you choose.

## Nothing changes in transit

Same layout, same manifest, same immutable library versions. A catalog published over SSH and one handed over on a USB stick are the same object, and a grid can hold both kinds at once.

You can also publish a catalog to a folder from the start, rather than exporting one that was created against a server. See [Publishing a catalog](publishing.md).
