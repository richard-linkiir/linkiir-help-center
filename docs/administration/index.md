---
title: Administration
---

# Administration

Administration covers the complete Linkiir platform lifecycle.

## Areas

- [Installation](installation/index.md): Windows, Linux, and macOS.
- [Licensing](licensing/index.md): Activation, capacity and expiry, and transfer to a replacement installation.
- [Upgrades](upgrades/index.md): In-place procedures by operating system.
- [Deployment](deployment/index.md): DEV, TEST, PROD, HA, and moving projects between environments.
- [High Availability](../high-availability/index.md): Active/standby pairs, topologies, requirements, and how HA differs from backup and disaster recovery.
- [Configurations](configurations/index.md): Project settings, users and roles, migration, Log Archive DB, and Kafka.
- [Backup and Restore](backup-restore/index.md): Protect and recover the Linkiir working directory.
- [Alerting and Notifications](notifications/index.md): Monitoring Linkiir, and alerting from a workflow.
- [Security](security/index.md): First-login hardening, remote access, secrets, and patient data in logs.
- [Troubleshooting](troubleshooting/index.md): Runtime crashes, crash reports, and Log Archiver connectivity.

## Common tasks

| I want to | Go to |
| --- | --- |
| Activate a license | [License ID and License Code](licensing/license-id-code.md) |
| Move a project to another environment | [Import and Export](deployment/import-export.md) |
| Add a user and control what they can do | [Users and Roles](configurations/user-roles.md) |
| Set project variables and secrets | [Project Settings](configurations/project-settings.md) |
| Connect my own Kafka cluster | [Kafka Configuration](configurations/kafka-redpanda.md) |
| Replace the server Linkiir runs on | [Backup and Restore](backup-restore/index.md), then [License Transfer](licensing/license-transfer.md) |
| Survive a server failure without an outage | [High Availability](../high-availability/index.md) |
| Get alerted when an interface fails | [Alerting and Notifications](notifications/index.md) |

## Daily operational checks

- Confirm `/api/health` reports `healthy`, or that you understand every `degraded` sub-check.
- Confirm the Runtime and Log Archiver checks in that response are `ok`.
- Review consumer lag against broker retention, and Log DB capacity.
- Review ERROR and WARN events.
- Confirm workflows that should be running are, and that none sit in a failed state holding license capacity.
- Confirm scheduled backups completed and include the master encryption key.
- Confirm production workflow changes were approved and auditable.

:::note Alerting is not built in
Linkiir has no built-in error or inactivity notifications. These checks need to come from your own monitoring system — see [Alerting and Notifications](notifications/index.md).
:::
