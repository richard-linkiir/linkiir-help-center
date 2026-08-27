---
title: HA System Requirements
sidebar_label: System Requirements
description: Servers, sizing, shared storage, database, broker cluster, network ports, and time synchronisation required for a Linkiir HA deployment.
keywords: [HA requirements, sizing, shared storage, PostgreSQL, MS SQL, ports, latency]
---

# HA System Requirements

What you need in place before an HA build. Confirm the whole page against your environment during planning — most failed HA deployments are traceable to shared storage or the log database, both of which are on this list.

## Sizing

Linkiir is lightweight. A single 4-vCPU instance sustains a few thousand messages per second end to end in Linkiir v1.1.0 benchmarks, so most sites are sizing for headroom rather than for the load itself.

| Component | CPU | RAM | Disk | Notes |
| --- | --- | --- | --- | --- |
| Linkiir server (×2) | 2–4 cores | 4–8 GB | 50 GB SSD | 4 GB is comfortable for most workloads |
| Broker node (×3) | 2–4 cores | 4–8 GB | Sized by retention, below | Leave memory free for the operating system's page cache |
| Log database | 2–4 cores | 8 GB or more | Sized by retention | PostgreSQL or MS SQL. Needs its own HA |
| Shared storage | — | — | 50 GB or more | Under 2 ms round-trip latency, and must honour file locks |
| Front door | 1–2 cores | 1 GB | — | Or use a load balancer you already run |

Broker disk per node, for planning:

```text
retention_hours × 3600 × messages_per_second × average_message_bytes
  × replication_factor ÷ node_count × 1.3
```

The trailing factor is headroom for index and overhead. Size for your retention policy, not for your average day.

### Sizing examples

| Scenario | Topology | Linkiir servers | Broker cluster | Log database |
| --- | --- | --- | --- | --- |
| Regional hospital, 40 interfaces, ~500 msg/s, 90-day retention, Windows estate | [A](topologies.md#topology-a-windows) | 2 × 4 core / 8 GB Windows | 3 × 2 core / 4 GB Linux, roughly 2 TB each | MS SQL with its own HA |
| Mid-size integrator, ~100 msg/s, 30-day retention, smallest footprint | [B](topologies.md#topology-b-linux-co-located) | 2 × 2 core / 4 GB, co-located with brokers | On the same three hosts, roughly 300 GB each | PostgreSQL with replication |
| Large enterprise, ~1,000 msg/s, cloud-first | [D](topologies.md#topology-d-cloud) | 2 × 4 vCPU across availability zones | Managed Kafka, 3 nodes | Managed PostgreSQL, multi-zone |

A 500 msg/s hospital uses a small fraction of a correctly sized pair's capacity, which leaves room to grow before anything needs scaling up.

## Shared storage

One directory, presented to both servers at the **same absolute path**.

| Requirement | Why it matters |
| --- | --- |
| The same path on both servers | Both servers work from this one directory. Different paths means two separate installations, not a pair |
| Writable by the Linkiir service account on both | Either server has to be able to write settings and projects when it is the active one |
| Working file locks | The pair relies on them to keep exactly one server active |
| Round-trip latency under 2 ms | Above that, project operations get slow and failovers become less predictable |
| Its own redundancy | It is the one resource both servers depend on |

:::caution Validate storage before anything is installed
Shared storage is the most common cause of a failed HA deployment. Confirm the same path, the service account's write access, cross-server visibility, latency, and file locking **before** the build. Support will walk through this validation with you — it takes minutes and saves days.
:::

Platform notes: on Windows this is typically an SMB share, and the Linkiir service account needs full control on it. On Linux it is typically NFS or a clustered filesystem. In cloud deployments use a premium file-storage tier — standard tiers are usually too slow for version-controlled project operations.

## Log database

| Requirement | Detail |
| --- | --- |
| Engine | **PostgreSQL or MS SQL**. Either server has to be able to write to it |
| Reachability | From **both** servers, not only the currently active one |
| High availability | Provided by your database platform — replication, AlwaysOn, or a managed multi-zone offering |

SQLite serves one writer at a time, which suits a single-server installation. Use PostgreSQL or MS SQL for a pair, and migrate before the build if your current installation is on SQLite. See [Adding HA to an existing installation](planning-your-deployment.md#adding-ha-to-an-existing-installation).

A promoted server that cannot reach the database comes up without its archiver, so include both servers in your database firewall rules from the start. See [Log Archive Database](../administration/configurations/log-archive-database.md).

## Message broker cluster

| Requirement | Detail |
| --- | --- |
| Nodes | **Exactly three**, or five for very large deployments. Never two |
| Broker settings | Set the cluster's replication factor to 3 and its minimum in-sync replicas to 2 |
| Reachability | From both Linkiir servers |
| Platform | Linux is recommended for broker nodes. Running them on Windows is supported but not recommended in production |

A managed offering is fine provided it is a real broker cluster with replication and quorum, rather than only a protocol-compatible endpoint. If you are evaluating a managed service, confirm the specific offering with Linkiir support during planning. See [Kafka Configuration](../administration/configurations/kafka-redpanda.md).

## Network ports

| Port | Carries | Should be reachable from |
| --- | --- | --- |
| Linkiir HTTP (default 8080) | The UI and API — what your front door balances | The front door, and administrators |
| Broker client port | Messages between Linkiir and the cluster | The Linkiir servers |
| Broker internal ports | Cluster coordination and replication | The broker nodes only |
| Database port | Log records and message history | The Linkiir servers |
| Node listener ports | Your inbound integration feeds | Your integration partners |

:::info Integration traffic is a separate decision
The front door in front of the Linkiir HTTP port carries the UI and API. Inbound HL7 and HTTP feeds arrive on node listener ports on the active server. If those feeds must also follow a failover, plan for that explicitly — it is the most commonly missed part of an HA rollout. See [Planning Your Deployment](planning-your-deployment.md).
:::

## Front door

You need something that moves client traffic to the active server. The pair fails over with or without it, but a client pointed straight at a dead server keeps trying that server.

| Option | Failover speed | Use when |
| --- | --- | --- |
| Load balancer with an HTTP health check | Automatic, seconds | The recommended default |
| Floating virtual IP | Automatic, seconds | No load balancer available, and you want no DNS dependency |
| DNS change | Manual, plus the record's time to live | A planned-maintenance-only posture, or DEV and TEST |

Requirements your load balancer must satisfy, whichever product it is:

- Health-check over HTTP, treating only a success response as healthy. Support will give you the exact check to configure.
- Willing to send **all** traffic to one member. This is active/passive, not round-robin.
- Pass the Linkiir session cookie through unmodified, and do not rewrite request paths.
- An idle timeout of at least 65 seconds, and no response buffering, so live event streams in the UI keep working.
- Session affinity **off**. Sessions are portable between the two servers, so stickiness gains nothing and slows a failover down.
- **Not running on either Linkiir server.** Losing that server would take the front door with it.

## Also required

| Requirement | Why |
| --- | --- |
| Time synchronised on both servers | Failover detection is time-based, so clock drift causes needless failovers |
| The same Linkiir release on both servers | A pair runs one version. Patching is rolling, not mixed steady-state |
| A reachable backup destination from both | HA does not replace backups. See [Backup, Restore, and Disaster Recovery](backup-and-disaster-recovery.md) |
| Enterprise license with the HA feature | See [HA Licensing](licensing.md) |

## Next

- [HA Topologies](topologies.md)
- [Planning Your Deployment](planning-your-deployment.md)
- [Backup, Restore, and Disaster Recovery](backup-and-disaster-recovery.md)
