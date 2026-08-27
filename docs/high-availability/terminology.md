---
title: HA Terminology
sidebar_label: Terminology
description: The terms used in Linkiir High Availability - active, standby, failover, failback, split-brain, RPO, RTO, quorum, and the front door.
keywords: [HA terminology, glossary, failover, failback, RPO, RTO, quorum, split-brain]
---

# HA Terminology

The vocabulary a design or procurement discussion about Linkiir HA will use. Terms are grouped by what they describe rather than alphabetically, because they make more sense read in order.

## Roles and state

**Active**
The server currently serving users and running your integrations. Exactly one server in the pair is active at any moment.

**Standby (warm standby)**
The other server. It is installed, running, and reachable, but it does not run integrations. "Warm" means it is already up and only has to take over, rather than being built or started from cold.

**Pair**
The two Linkiir servers together. A pair is always exactly two — never one, never three.

**Role**
Which of the two states a server is in. A server's role changes over its life; its identity does not.

**Node ID**
The stable identity of one server within the pair. It does not change when the role moves.

**Display name**
A friendly label you can give each server. Name it after *where* the server is — "Rack 2", "DC-West" — never after what it does. A server called "Standby" is wrong half the time, because roles move.

**Role badge**
The **ACTIVE** or **STANDBY** indicator Linkiir shows on screen, so you always know which of the two servers you have reached when both sit behind one address.

## How the role moves

**Promotion**
A standby becoming active: it starts the integration runtime and the log archiver, and begins reporting itself as the active server to your front door.

**Demotion**
An active server becoming standby, either because you moved the role deliberately or because it stopped being able to serve.

**Failover window**
The time between the active server failing and the standby serving. With the default timings this is about 18 seconds, plus however long your front door takes to notice. The High Availability page shows the current estimate — see [Failover timings](ha-settings.md#failover-timings).

**Failover timings**
The settings that determine how quickly a failure is detected and acted on. They are shared by the pair and adjustable, and the defaults suit most sites.

## Moving the role

**Failover**
The role moving because something went wrong. Automatic.

**Step down**
Deliberately handing the active role to the other server, from the Linkiir UI. Takes under 10 seconds and is the basis of both maintenance and failover testing.

**Failback**
Moving the role back to a server that previously failed and has since recovered. In Linkiir this is **manual by design**: a recovered server rejoins as standby and waits. Automatic failback would mean a second interruption, at a time nobody chose.

**Rolling patch**
Patching the pair without downtime: patch the standby, let it rejoin, step down the active one so the patched server takes over, then patch the server that just became standby. One interruption, under 10 seconds, at a moment you picked.

## Shared resources

**Working directory**
The single directory holding your settings, users, roles, and projects. Both servers open the **same** directory, at the **same** path, so both work from one set of data. This is the resource an HA deployment depends on most.

**Log database**
The database holding message history and log records. An HA deployment requires PostgreSQL or MS SQL, because either server has to be able to write to it. SQLite serves one writer at a time, so it suits a single-server installation rather than a pair.

**Front door**
Whatever sends client traffic to the active server: a load balancer, a floating virtual IP, or in the simplest posture a DNS change. The pair fails over with or without one, but a client pointed directly at a dead server keeps trying that server.

**Health check**
The HTTP request your load balancer makes to decide where to send traffic. Linkiir answers it differently on each server: the active one reports that it should receive traffic, the standby one reports that it should not. Support configures this with you.

## Failure modes

**Split-brain**
Both servers believing they are active at the same time, which would process every message twice. Linkiir is designed to prevent it, and will not let HA be enabled until its readiness checks pass. If you ever see both servers reporting **ACTIVE**, stop and contact support — see [Operating an HA Pair](operations.md#when-to-call-support).

**Quorum**
The majority of a cluster's nodes that must be reachable for it to accept writes. Three broker nodes tolerate losing one; two tolerate losing none. Quorum is the reason a broker cluster is three nodes and not two.

**Degraded**
Running, but with reduced redundancy — for example two of three broker nodes reachable. Service continues; the margin for the next failure does not.

## Recovery objectives

**RPO — Recovery Point Objective**
How much data you can afford to lose, measured in time. A Linkiir failover has an **RPO of zero**: in-flight messages wait in the broker, archiving resumes from committed offsets, and a redelivered message is not stored twice.

**RTO — Recovery Time Objective**
How long you can afford to be down. For an unplanned Linkiir failover this is roughly 30 seconds end to end, including your load balancer.

These two terms belong to backup and disaster recovery as much as to HA, and the numbers are very different for each. See [Backup, Restore, and Disaster Recovery](backup-and-disaster-recovery.md).

## Related concepts that are not HA

**Backup**
A separate copy of your data, taken over time, that lets you recover from damage to the data itself. HA does not do this — both servers read one copy.

**Disaster recovery (DR)**
The ability to resume service at a different site after losing the first one. An HA pair lives in one site.

**Scaling out**
Adding capacity by adding servers. HA does not do this either: the second server is idle by design, and only one is ever active.

## Next

- [HA Architecture](architecture.md)
- [HA Licensing](licensing.md)
- [Backup, Restore, and Disaster Recovery](backup-and-disaster-recovery.md)
