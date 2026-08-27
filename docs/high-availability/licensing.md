---
title: HA Licensing
sidebar_label: Licensing
description: Linkiir High Availability requires an Enterprise license with the HA feature. What to request, and what the License page shows once it is applied.
keywords: [HA license, Enterprise license, licensing, HA feature]
---

# HA Licensing

High Availability requires an **Enterprise license with the HA feature**. One license covers the pair.

## What to request

Ask for an **Enterprise license with High Availability**, and say that it is for an HA pair. Email [support@linkiir.com](mailto:support@linkiir.com).

| Question | Answer |
| --- | --- |
| How many licenses does a pair need? | **One.** It covers both servers |
| Where is it applied? | Once. The second server picks it up |
| Already have an Enterprise license without HA? | Ask support to re-issue it with the HA feature. Your projects and settings are unaffected |

## What you see once it is applied

Open **Settings → License**. With the right license in place the page shows:

| On the License page | Value |
| --- | --- |
| License type | **Enterprise** |
| Features | **HA** listed among the licensed features |

That is the confirmation to look for before you try to turn HA on. The **High Availability** page also checks it for you: one of its readiness checks is that the license includes HA, and it reports plainly whether it does. See [Using the HA Settings](ha-settings.md#clear-the-readiness-checks).

## Without the HA feature

A Linkiir installation whose license does not include HA **runs normally as a single server**. Nothing degrades, nothing warns, and no integration behaves differently. The only difference is that HA cannot be enabled.

You can therefore run a single server now and add HA later, without rebuilding your projects. See [Adding HA to an existing installation](planning-your-deployment.md#adding-ha-to-an-existing-installation).

## What HA licensing does not change

- **Capacity.** The HA feature is about topology, not throughput. Your workflow and volume entitlements are the same with a standby as without one.
- **Your other environments.** DEV and TEST are separate installations with their own licenses. They only need the HA feature if you are running an HA pair there.

## If the license is not accepted

The License page states what it found. If it reports that the license does not match this installation, or does not cover HA, contact [support@linkiir.com](mailto:support@linkiir.com) with the message shown — it is quicker to have the license checked than to re-apply it.

## Next

- [Using the HA Settings](ha-settings.md)
- [Planning Your Deployment](planning-your-deployment.md)
- [License Types](../administration/licensing/license-types.md)
