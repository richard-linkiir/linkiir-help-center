---
title: Deployment
---

# Deployment

Use separate Linkiir environments and promote controlled, versioned project packages through the lifecycle.

| Environment | Primary purpose | Typical queue | Typical Log DB |
| --- | --- | --- | --- |
| [DEV](dev.md) | Build and debug interfaces | Bundled Kafka or local queue profile | SQLite |
| [TEST](test.md) | Integration, regression, and customer validation | Bundled or external Kafka | SQLite, PostgreSQL, or MS SQL |
| [PROD](prod.md) | Live healthcare processing | External Kafka | PostgreSQL or MS SQL |
| [HA](ha.md) | Production continuity — an active/standby pair | Resilient external broker cluster, 3 nodes | Shared resilient PostgreSQL/MS SQL |

For the HA design, topologies, and planning, see [High Availability](../../high-availability/index.md).

Use [Import and Export](import-export.md) to move projects without copying environment-specific secrets.
