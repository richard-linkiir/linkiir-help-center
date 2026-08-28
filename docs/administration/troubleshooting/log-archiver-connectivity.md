---
title: Message History Is Not Being Recorded
---

# Message History Is Not Being Recorded

Symptom: workflows are running and delivering messages, but log search returns nothing recent, or stops at a point in time.

Message history is written in the background by the Log Archiver, which needs both the message broker and the Log DB. Either side failing produces the same visible symptom.

## Confirm the symptom first

Records appear in log search a moment after the event, not instantly. Before investigating, confirm you are looking at a real gap:

1. Send a test message through a DEV workflow.
2. Wait ten seconds.
3. Search for it.

If it appears, there is no fault — you were looking too soon. If it does not, continue.

Also confirm the workflow is actually processing. A node in `STOPPED` or `ERRORED` produces no messages to record. Check node state before assuming a history problem.

## Narrow it down

```powershell
Invoke-RestMethod http://127.0.0.1:8080/api/health
```

```bash
curl -s http://127.0.0.1:8080/api/health
```

Read `checks.archiver.detail` and `checks.queue.detail`. Each names its own reason.

| What you see | Where the problem is |
| --- | --- |
| Queue check fails | Broker connectivity |
| Queue fine, archiver reports database errors | Log DB connectivity or permissions |
| Both fine, history still missing | Retention, or the Archiver is behind |
| History stops at a specific time and never resumes | Check for an error at that timestamp in the service logs |

## Broker side

- Resolve every bootstrap hostname from the Linkiir host.
- Test TCP reachability to each broker port.
- Verify the SASL username, password, and mechanism.
- Verify the CA certificate path resolves on the Linkiir host — in Docker, that means the path **inside the container**.
- Confirm the service account can read Linkiir's topics and commit consumer-group offsets. Missing offset-commit permission is easy to overlook and produces exactly this symptom.

A connection test is available without any Kafka tooling installed. See [Kafka Configuration](../configurations/kafka-redpanda.md) — it reports the first stage that failed, so a wrong port is not mistaken for a wrong password.

## Log DB side

- Verify host, port, database name, and credentials.
- Confirm the account can read and write the Linkiir schema, and could create it during installation or upgrade.
- Check free disk space and, on PostgreSQL or MS SQL, transaction log capacity. A full disk stops history cleanly and silently.
- Confirm firewall and TLS rules between the Linkiir host and the database.
- On SQLite, confirm only one Archiver is configured. SQLite does not support concurrent writers.

## History stops but nothing looks broken

| Cause | Check |
| --- | --- |
| Log DB disk or transaction log full | Free space on the database server |
| Broker retention shorter than the outage | If records aged out during downtime, that history is unrecoverable |
| Archiver behind after a long outage | Watch whether lag is decreasing; if so, wait |
| Only one instance working, others idle | More Archivers than the workload can split across. Extra instances stay idle by design. |

:::warning[Aged-out records cannot be recovered]
If the broker discarded records before they were copied to the Log DB, that history is gone. It cannot be rebuilt from the Log DB, because it never arrived.

This is why lag alerting matters more than it appears to: lag approaching your retention window is the warning that history is about to be lost permanently. See [Kafka Configuration](../configurations/kafka-redpanda.md).
:::

## Recovery

1. Fix the connectivity or capacity problem.
2. Restart the affected Archiver instance without changing its consumer group.
3. Confirm it is assigned work and that lag is decreasing.
4. Search for the first record after recovery to confirm history is flowing again.
5. Compare the gap against your retention window to establish what, if anything, was permanently lost.

Duplicate records are prevented automatically, so a redelivery during recovery does not produce duplicate rows in log search.

:::caution[Do not skip past a backlog]
Manually advancing the Archiver past a backlog makes lag disappear from monitoring, but permanently discards the history it skipped. Let it catch up.
:::

## Collect diagnostics

If the cause is not clear, collect a diagnostics bundle and send it to support. It contains logs, service status, and configuration with credentials redacted — no message payloads or patient data.

**Windows:** Start Menu → Linkiir → **Linkiir Diagnostics**

**macOS and Linux (Docker):**

```bash
./scripts/linkiirctl doctor
./scripts/linkiirctl logs > linkiir-logs.txt
```

## Related

- [Kafka Configuration](../configurations/kafka-redpanda.md)
- [Log Archive Database](../configurations/log-archive-database.md)
- [Troubleshooting](index.md)
