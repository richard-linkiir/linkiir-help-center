---
title: Kafka Configuration
---

# Kafka Configuration

Linkiir communicates with Apache Kafka through the Kafka protocol. Redpanda is also compatible as an alternative broker since it implements the same protocol, but the bundled and documented broker is Apache Kafka.

## Which broker should be used?

| Scenario | Recommendation |
| --- | --- |
| Local DEV | Bundled Kafka. |
| Shared TEST | Bundled broker for simplicity, or external cluster for production-like validation. |
| PROD | External organization-managed Kafka cluster. |
| Windows host | Bundled Kafka is supported; production brokers are preferably Linux-hosted. |

## Connection settings

Typical settings include:

- Bootstrap servers.
- Security protocol: `PLAINTEXT`, `SSL`, `SASL_PLAINTEXT`, or `SASL_SSL`.
- SASL mechanism and service account.
- CA certificate path.
- Topic retention and partition count.
- Replication factor and minimum in-sync replicas.

## Linkiir manages its own topics

You do not create, name, or size topics. Linkiir provisions what a workflow needs when you deploy it, and its own components discover them automatically.

What this means for broker administration:

| Do | Do not |
| --- | --- |
| Grant the Linkiir service account permission to create topics, read, write, and commit consumer-group offsets | Create Linkiir topics by hand ahead of time |
| Set storage policy for the cluster as a whole | Rename or delete Linkiir topics directly on the broker |
| Monitor consumer lag and disk usage | Change retention or partition counts on Linkiir topics outside Linkiir |

Editing Linkiir topics directly on the broker is the most common cause of an installation that looks healthy but silently stops recording message history.

## Service account permissions

The Linkiir service account needs, on Linkiir's own topics:

- Create topics
- Produce and consume
- Describe topics and consumer groups
- Commit consumer-group offsets

Use a dedicated account for Linkiir rather than a shared administrative one. It keeps the audit trail meaningful and limits the blast radius of a leaked credential.

## Retention matters for message history

Linkiir copies messages into the Log DB in the background. If the broker discards records before that copy completes, those records never reach the Log DB and cannot be recovered.

| Guidance | Reason |
| --- | --- |
| Keep retention comfortably longer than your worst expected outage | Gives the copy time to catch up after downtime |
| Alert on consumer lag well before it approaches the retention window | Lag approaching retention is the warning sign of permanent history gaps |
| Do not shorten retention to reclaim disk without checking lag first | Shortening retention under lag discards history immediately |

A day of retention is a reasonable local default. For production, size it against how long you could plausibly be down over a weekend or a holiday.

## Setting queue retention

Set **Queue Retention (days)** under **Settings → Logging**, in the **Queue Configuration** section. Linkiir applies it to the broker for you; do not set retention on Linkiir's topics by hand.

`0` means keep forever. The maximum is 3650 days.

How it is applied depends on who operates the broker:

| Broker | What Linkiir sets |
| --- | --- |
| **Bundled with Linkiir** | The cluster default, so topics created later inherit it, **and** a per-topic override on the `linkiir.*` topics that already exist |
| **External, customer-operated** | Only the per-topic override on the `linkiir.*` topics. The cluster default is left alone, because that cluster carries topics that are not Linkiir's to re-time. |

The per-topic override is what makes a change take effect immediately — an existing topic otherwise keeps whatever default it was created with.

Linkiir also reconciles retention at startup, reading back what the broker actually has and correcting only the topics that have drifted. Drift is normal rather than a fault: the Runtime creates topics on its own while Grid is down, and those inherit whatever default the broker had at the time.

:::note
Saving the setting always stores the value, even if the broker could not be reached. What did or did not reach the broker is reported back to you, and startup reconciliation picks up anything that was missed.
:::

## Tuning producer batching

By default the Runtime does not wait to batch messages before sending them to the broker — a push blocks until the broker confirms delivery, so waiting would add latency to every message. That is what latency-bound flows such as LLP want.

Throughput-bound installations can trade that latency back for batching by setting the `LINKIIR_QUEUE_LINGER_MS` environment variable on the Runtime.

| Value | Effect |
| --- | --- |
| `0` (default) | No linger. Lowest per-message latency. |
| A few milliseconds | Lets the producer batch across node threads, which raises throughput on installations sending at a high sustained rate |

The value is in milliseconds and must be between 0 and 900000. An invalid value fails at startup with a configuration error naming the variable, visible in the Runtime log. Changing it needs a Runtime restart, not a rebuild.

Leave it at the default unless you have measured a throughput ceiling; on a latency-sensitive interface it makes things worse rather than better.

## Best practices

- Use TLS and SASL in line with your security policy.
- Give Linkiir a dedicated service account.
- Keep retention longer than your worst expected outage.
- Monitor consumer lag and broker storage together.
- Test connectivity before changing a live installation.
- Let running workflows drain before switching clusters; in-flight messages are not migrated.
