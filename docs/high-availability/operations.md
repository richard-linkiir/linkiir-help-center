---
title: Operating an HA Pair
sidebar_label: Operating an HA Pair
description: Day-to-day HA operations in Linkiir - testing a failover, patching without downtime, what to do after an unplanned failover, and what to monitor.
keywords: [failover test, step down, patching, rolling upgrade, monitoring, HA operations]
---

# Operating an HA Pair

What you do with an HA pair once it is running: test it, patch it, and know what to do when it fails over on its own.

Every procedure here is done from **Settings → High Availability**. See [Using the HA Settings](ha-settings.md) for the screen itself.

## Test a failover

An untested failover is an assumption, not a capability. Test before go-live, and after every upgrade.

### Planned hand-over

1. Note which server is **ACTIVE**.
2. On that server, click **Step Down**.
3. Watch the other server take the role, and your front door follow.
4. Confirm the roles swapped, and that you are still signed in.

Expect **under 10 seconds**. This is also your maintenance procedure, so it is worth being familiar.

### Unplanned failure

Test this too, because a graceful shutdown and a crash do not take the same path. With your infrastructure team, stop the active server abruptly — pull the power, or kill the process without letting it shut down cleanly.

Expect the standby to take over in about **18 seconds**, plus a few seconds for your front door.

### What to check afterwards

| Check | Expected |
| --- | --- |
| The surviving server | **ACTIVE** |
| Both servers showing ACTIVE | **Never.** Stop and contact support if you see it |
| Audit log | Records the change of role |
| Workflows | Restarted on the surviving server |
| Your browser session | Still signed in |
| Log records | No duplicates, and no gap over the failover window |
| The recovered server | Rejoins as **STANDBY** and does not take the role back |

## Patch without downtime

Always patch the **standby** first.

1. Confirm which server is **STANDBY** on the High Availability page.
2. Patch and reboot that server.
3. Wait for it to rejoin as standby, with its partner reachable.
4. On the active server, click **Step Down**. The freshly patched server takes over.
5. Patch and reboot the server that is now standby.

One interruption, under 10 seconds, at a moment you chose.

:::caution Run one release on the pair
A pair is designed to run one Linkiir version. Mixed versions are a transient state during a rolling patch, not something to sit on — finish step 5 in the same maintenance window.
:::

Restart broker nodes one at a time, and let the cluster return to full replication before restarting the next. Restarting two at once drops the cluster below its minimum in-sync replicas and writes begin to fail.

## After an unplanned failover

Work in this order. Service is already restored on the promoted server; the goal is to confirm health, then bring the failed server back **as a standby** without causing a second interruption.

**Confirm service**

1. One server shows **ACTIVE**, and your front door sends traffic only to it.
2. Workflows have restarted, and the broker cluster shows all three nodes.
3. The audit log records the role change.

**Diagnose before restarting**

4. Find out why it failed. Common causes are shared-storage stalls, clock drift, running out of memory, and host failure.
5. Confirm shared storage and time synchronisation are healthy **before** you start the server again. A server that failed on storage will fail again.

**Rejoin**

6. Start Linkiir on the recovered server. It rejoins as **STANDBY** and will not take the role back on its own.
7. Confirm it shows **STANDBY** with its partner reachable.

**Then, only if you want to**

8. Move the role back during a quiet window — see below.

### Move the role back

There is no need to move it back. The two servers are interchangeable, and the one currently active is a perfectly good place to keep running.

Move it back only when you have a reason — the other server is larger, or is in your preferred site. To do it: click **Step Down** on the current active server during a quiet window.

## What to monitor

Your monitoring system should watch these. Linkiir does not send alerts by itself — see [Alerting and Notifications](../administration/notifications/index.md).

| Watch | Alert when |
| --- | --- |
| Roles across the pair | Both servers report active, or neither does |
| Pair membership | A server goes missing, or a third appears |
| Partner reachability | Unreachable for more than a minute |
| Overall health | Reported unhealthy |
| Broker cluster | Fewer than three nodes reachable |
| HA events in the audit log | Any role change, planned or not |

:::tip Alert on successful failovers too
A failover nobody noticed is a server that is still broken, and a pair with no remaining redundancy. Treat a successful failover as an incident to follow up, not a non-event.
:::

## Things that behave differently in a pair

| | Behavior |
| --- | --- |
| Sign-in | A session works on either server, so a failover does not sign anyone out |
| Settings changes | Made once, and read by both servers. There is no second copy to update |
| Project changes | Made on the active server, as normal |
| The standby's UI | Reachable and usable for viewing status — it just runs no integrations |
| Backups | Unaffected by failover, and still required. See [Backup, Restore, and Disaster Recovery](backup-and-disaster-recovery.md) |

## When to call support

Contact [support@linkiir.com](mailto:support@linkiir.com) for:

- Both servers reporting **ACTIVE**.
- A readiness check that will not clear.
- Repeated failovers with no obvious cause.
- A failover that took minutes rather than seconds.
- Anything you are about to do for the first time on a production pair.

Say which topology you run, what the High Availability page shows on **both** servers, and what the audit log recorded around the event.

## Next

- [Using the HA Settings](ha-settings.md)
- [Backup, Restore, and Disaster Recovery](backup-and-disaster-recovery.md)
- [Planning Your Deployment](planning-your-deployment.md)
