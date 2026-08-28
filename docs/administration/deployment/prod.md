---
title: PROD Deployment
---

# PROD Deployment

Production should use infrastructure managed to the organization’s availability, security, and support standards.

## Recommended profile

- External Kafka cluster rather than a single bundled broker.
- PostgreSQL or MS SQL for the Log Archive DB.
- TLS for remote Grid/API access and secure broker protocols where required.
- Named service accounts and least privilege.
- Scheduled working-directory and database backups.
- Monitoring of Runtime health, Archiver health, queue lag, disk, and database capacity.
- Approved change and rollback procedures.

:::caution[Built-in brokers]
Bundled brokers are convenient for DEV and TEST. They should not be assumed to satisfy production HA, capacity, patching, or support requirements.
:::

## Windows production note

Linkiir services can run on Windows. For production Kafka, Linux-hosted brokers are operationally preferred. A Windows Linkiir tier can connect to a dedicated Linux Kafka cluster.
