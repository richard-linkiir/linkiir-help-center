---
title: License Types
---

# License Types

**Settings → License** shows a **License Type** of either **Professional** or **Enterprise**. Those are the two types Linkiir recognises.

## Professional and Enterprise

The type is a label recorded in your license. What actually governs your installation is the capacity and expiry written into the same license:

| Field on the License tab | What it sets |
| --- | --- |
| **Active Workflows** | How many workflows may run at once |
| **Nodes per Workflow** | The largest single workflow you may build |
| **Expiration Date** | When the license lapses |

Two installations both showing **Professional** can have different limits, and a Professional license can carry a larger allowance than an Enterprise one. Read the numbers on the tab, not the type name, when you want to know what your installation may do.

:::note What each type entitles you to commercially
Which type suits your deployment, what it costs, how long it runs, and what support comes with it are commercial matters set by your agreement. This page describes what the product does with a license, not what you are entitled to buy. Check your agreement or ask your vendor.
:::

If the tab shows **Unknown** as the type, the applied code carries a type this build does not recognise. Capacity and expiry still apply normally, but ask your vendor to confirm the code is the one intended for you.

## Trials

There is no separate trial license type or built-in evaluation period. A fresh installation is simply unlicensed until you apply a code.

An evaluation is a normal license issued with a short expiry. It behaves like any other license: the same fields on the same tab, the same capacity limits, the same expiry and grace behaviour. When it lapses, workflows drain and stop.

Practical advice for an evaluation:

**Note the expiration date when you apply the code.** The tab shows **Expiring Soon** from 30 days out, which is little help on a two-week evaluation.

**Export anything you build before the license lapses.** Expiry stops workflows running; it does not delete your work, and the Grid stays usable. But get your projects out as bundles so the evaluation's results are not stranded on a server someone later reclaims. See [Import and Export](../deployment/import-export.md).

**Use synthetic data.** An evaluation environment has not been through your normal approval for handling patient data. Use clearly fake identifiers throughout.

**Do not run live traffic on an evaluation.** Beyond whatever your agreement says, an evaluation installation typically has no backups, no monitoring, and a deadline.

## High availability

Running an active/standby pair needs an **Enterprise license with the HA feature**, issued for that pair. One license covers both servers. Once it is applied, **Settings → License** shows the type as **Enterprise** with **HA** among the licensed features.

An installation whose license does not include the feature runs normally as a single server — nothing degrades, and HA simply cannot be enabled. You can add it later without rebuilding your projects.

See [HA Licensing](../../high-availability/licensing.md), and [High Availability](../../high-availability/index.md) for the design and topologies.

## Changing type or capacity

Apply a new code. Nothing is uninstalled first.

1. Open **Settings → License**.
2. Click **Replace License**.
3. Paste the new code under **Update License Code**, or use **Upload .lic**.
4. Click **Apply**.

Running workflows are not interrupted. The new capacity and expiry take effect immediately.

This is the route for extending an expiry, raising a workflow limit, or moving from an evaluation to a full license — all the same operation. It is not the route for moving to a different server; that is a [transfer](license-transfer.md).

## Next

- [License ID and License Code](license-id-code.md)
- [Capacity and Expiry](capacity-and-expiry.md)
- [License Transfer](license-transfer.md)
