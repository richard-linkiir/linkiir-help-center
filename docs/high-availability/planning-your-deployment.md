---
title: Planning Your HA Deployment
sidebar_label: Planning Your Deployment
description: What to decide and have ready before a Linkiir HA build, what the build involves, and how to arrange it with Linkiir support.
keywords: [HA planning, prerequisites, readiness, deployment, support, go-live]
---

# Planning Your HA Deployment

What to settle before an HA build, and what the build itself involves. Work through this page, then bring the answers to Linkiir support.

:::info[The build is done with Linkiir support]
Installing the pair, enabling HA, configuring your front door, and testing failover are done together with Linkiir support, against your environment. That is deliberate: the parts most likely to go wrong are your shared storage, your database, and your load balancer, and they are quicker to get right with someone who has done it before than from a written procedure.

Email [support@linkiir.com](mailto:support@linkiir.com) with the completed planning decisions below.
:::

## Step 1 — Confirm HA is what you need

| You want to | You need |
| --- | --- |
| Survive a server or process failure with seconds of interruption | HA |
| Recover a deleted project or a bad change | [Backups](backup-and-disaster-recovery.md) |
| Survive losing the whole site | [Disaster recovery](backup-and-disaster-recovery.md#disaster-recovery) |
| Process more messages per second | Neither — a single correctly sized server handles a few thousand messages per second. See [System Requirements](system-requirements.md#sizing) |

HA is worth doing when an outage of minutes to hours is unacceptable for your feeds. If your feeds tolerate a maintenance window and your recovery need is really about data, invest in backups and testing them first.

## Step 2 — Choose a topology

Pick from the five in [HA Topologies](topologies.md). The decision is driven by your platform and how many servers you can run, not by anything in Linkiir — the Linkiir side of the build is identical in all five.

Record: the topology, and where each server will live.

## Step 3 — Decide the four things around the pair

These are yours to provide, and they are where HA deployments succeed or fail.

| Decision | What to record | Reference |
| --- | --- | --- |
| **Shared storage** | Platform, the absolute path both servers will use, measured latency, whether file locking works | [System Requirements](system-requirements.md#shared-storage) |
| **Log database** | PostgreSQL or MS SQL, its HA arrangement, and confirmation both servers can reach it | [System Requirements](system-requirements.md#log-database) |
| **Front door** | Which load balancer or virtual IP, and who administers it | [System Requirements](system-requirements.md#front-door) |
| **Broker cluster** | Three nodes, self-hosted or managed, and which offering | [System Requirements](system-requirements.md#message-broker-cluster) |

:::caution[Validate shared storage before the build date]
Confirm the same absolute path on both servers, write access for the service account, that a file created on one is visible on the other, latency under 2 ms, and working file locks. If any of that is unresolved, fix it first — the build cannot succeed over storage that does not meet these requirements.
:::

## Step 4 — Decide how integration traffic follows a failover

Your load balancer covers the UI and API. Inbound HL7 and HTTP feeds arrive on **node listener ports**, and they need their own answer.

| Option | What it means for your partners |
| --- | --- |
| A virtual IP covering the listener ports | Nothing changes on their side |
| A load-balancer rule per listener port | Nothing changes on their side |
| Partners reconfigured after a failover | Manual, slow, and not a real HA posture |

Decide this now, with names against it. It is the most commonly missed part of an HA rollout, and it is much cheaper to design in than to retrofit.

## Step 5 — Arrange licensing

One Enterprise license with the HA feature covers the pair, and it must be **issued for an HA pair**. Request or re-issue it as part of planning rather than on the build day. See [HA Licensing](licensing.md).

## Step 6 — Plan backups alongside HA

HA does not back anything up. Before go-live, have all three configured: instance backup, a remote per project, and database backups — with destinations reachable from both servers. See [Backup, Restore, and Disaster Recovery](backup-and-disaster-recovery.md).

## What the build involves

So you know what to expect and can schedule the right people.

| Stage | What happens | Who needs to be there |
| --- | --- | --- |
| Validation | Shared storage, database reachability, broker health, and time sync are confirmed | Infrastructure and database |
| Install | The same release is installed on both servers, pointed at the one shared directory | Server administrators |
| Configure | Database and license are set once, and read by both servers | Linkiir administrator |
| Enable HA | Readiness checks are cleared and HA is switched on. No restart, and running workflows are not interrupted | Linkiir administrator |
| Front door | Health check, timeouts, and session handling are configured and verified | Load-balancer administrator |
| Failover test | A planned hand-over, then an unplanned failure, both measured | Everyone above |

Two things worth knowing in advance: **enabling HA needs no restart and does not interrupt running workflows**, and the second server does not need to be told about the first — both register themselves in the shared directory and find each other.

### The readiness checks

Linkiir will not let HA be enabled until all seven of these pass, so a half-built pair cannot be switched on. Knowing what they are tells you what to have ready.

| Check | What must be true |
| --- | --- |
| **Working directory writable** | The shared working directory is writable by the service account |
| **Log backend supports concurrent writers** | The log database is PostgreSQL or MS SQL |
| **License includes HA** | Enterprise with the HA feature |
| **Node identity configured** | Each server has a stable identity |
| **Pair has exactly two nodes** | Both servers registered, and no third installation present |
| **Peer reachable** | Each server can reach the other |
| **Kafka has more than one broker** | The three-node broker cluster is reachable |

## Before you go live

**Infrastructure**
- Three broker nodes, healthy, with replication factor 3
- Log database is PostgreSQL or MS SQL, reachable from both servers, with its own HA
- Shared directory at the same absolute path on both, file locking verified, latency under 2 ms
- Time synchronised on both servers

**The pair**
- Both servers on the same release, against the same working directory
- The license shows **Enterprise** with **HA** among its features
- All seven readiness checks passing, and exactly one server showing **ACTIVE**

**Front door**
- Health-checking correctly, with only a success response treated as healthy
- Session affinity off, session cookie passed through unmodified
- Idle timeout of at least 65 seconds, response buffering off
- Verified it never routes to the standby
- Not running on either Linkiir server

**Integration traffic**
- A decision recorded for how inbound feeds follow a failover

**Tested**
- A planned hand-over completed in under 10 seconds
- An unplanned failure recovered in under a minute
- A signed-in session survived the failover
- No duplicate log records afterwards
- One broker node stopped, and the cluster kept serving
- The recovered server rejoined as standby and did not take the role back

**Understood by the team**
- HA is not a backup, and backups are configured for instance, projects, and database
- Failback is manual by design
- Who does what after an unplanned failover, and who to call

## Adding HA to an existing installation

You can start with a single server and add HA later, without rebuilding your projects. It involves:

1. Moving the working directory onto shared storage.
2. Migrating the log database from SQLite to PostgreSQL or MS SQL, if it is not there already.
3. Adding the second Linkiir server, the three-node broker cluster, and the front door.
4. Having the license re-issued for a pair.

Steps 1 and 2 need a planned downtime window. Plan the migration with Linkiir support — email [support@linkiir.com](mailto:support@linkiir.com) with your current setup and target topology.

## Next

- [HA Topologies](topologies.md)
- [System Requirements](system-requirements.md)
- [Backup, Restore, and Disaster Recovery](backup-and-disaster-recovery.md)
