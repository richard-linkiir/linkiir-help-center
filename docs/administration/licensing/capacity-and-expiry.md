---
title: Capacity and Expiry
---

# Capacity and Expiry

Two things in a license affect day-to-day operation: how much you may run, and until when. Both are visible on **Settings → License**.

---

## Workflow capacity

**Active Workflows** limits how many workflows may run **at the same time**. The tab shows it as usage:

```text
Active Workflows      7 of 10 running
[███████░░░]
```

The limit counts running workflows, not workflows you have built. A project can hold any number of workflows; only the ones you start consume capacity.

### What happens at the limit

Starting a workflow when you are already at the limit is refused. The workflow stays stopped and reports that it is at capacity. Workflows already running are unaffected — Linkiir never stops one to make room for another.

To start something else, stop a workflow you do not need running.

### What does and does not consume capacity

| Action | Consumes capacity? |
| --- | --- |
| Starting a workflow | Yes, one |
| Starting an additional node inside an already-running workflow | No |
| Building a workflow without starting it | No |
| A workflow in the `Failed` state | Yes, while it is still started |
| Run Test or Debug in the script editor | No |

That third row catches people out: a failed workflow that has not been stopped still holds its slot. If you are unexpectedly at capacity, look for started-but-failing workflows and stop the ones you are not actively fixing.

### Designing around the limit

Because the unit is the workflow, how you divide interfaces between workflows decides how much capacity you consume.

| Approach | Capacity used | Trade-off |
| --- | --- | --- |
| One workflow per interface | One slot each | Clean separation; start and stop each independently |
| Related interfaces in one workflow | One slot for the group | Fewer slots; they start and stop together |

One workflow per interface is the better default — being able to stop one feed without stopping its neighbours is worth a slot. Consolidate only when you are genuinely constrained, and only where the interfaces share a lifecycle.

---

## Nodes per workflow

**Nodes per Workflow** caps how many nodes a single workflow may contain. This one is checked when a workflow starts, so an oversized workflow simply will not start, naming the limit.

Split it into a chain of smaller workflows, or reduce the node count. Note that splitting one workflow into two consumes an extra workflow slot, so the two limits interact.

---

## Expiry

A license has an expiration date, and past it a grace period before enforcement.

| State | Badge | When | Behaviour |
| --- | --- | --- | --- |
| Valid | *(none)* | Before expiry | Normal |
| Expiring | **Expiring Soon** | Within 30 days of expiry | Normal. Renew now. |
| Grace | **Grace Period** | Past expiry, within the grace window | Normal. Everything keeps running. |
| Expired | — | Past the grace window | Workflows drain and stop |

The grace period is set in your license. Seven days is the usual default — check the tab rather than assuming.

### What expiry does and does not do

When a license fully expires:

| Keeps working | Stops |
| --- | --- |
| Signing in to the Grid | Running workflows — they finish in-flight messages, then stop |
| Viewing and searching message history | Starting a workflow |
| Opening, editing, and exporting projects | |
| Message history recording | |

Expiry does not delete anything. Your projects, workflows, scripts, users, settings, and message history are all intact. Applying a valid code returns the installation to normal, and you start your workflows again.

Workflows drain rather than being killed, so messages in flight are not lost. Anything already queued waits for the workflows to start again.

:::caution[Grace is a safety net, not a schedule]
The grace period exists so a renewal that slips by a few days does not take your interfaces down. Treating it as normal operating headroom means the day something does go wrong with a renewal, you have already spent your margin.

Renew on **Expiring Soon**, not in grace.
:::

### Renewing

Apply the new code with **Replace License**. Running workflows are not interrupted, and there is no window where the installation is unlicensed. See [License ID and License Code](license-id-code.md).

You can renew at any point — while valid, expiring, in grace, or after full expiry.

### Recovering from an expiry

1. Apply a valid License Code with **Replace License**.
2. Confirm the badge clears and the new **Expiration Date** is shown.
3. Start your workflows, most critical first.
4. Check queue depth. A backlog built up while workflows were stopped, and it will now drain.
5. Watch for duplicates at destinations. Delivery is at-least-once, and messages interrupted mid-delivery may be redelivered — see [Error Handling and Retry](../../interface-development/error-handling.md).

---

## What to monitor

Nothing in Linkiir will email you about an expiring license, because there is no built-in alerting. Cover it yourself:

| Watch | Why |
| --- | --- |
| Expiration date, in your calendar and renewal process | The only reliable reminder |
| Active Workflows usage against the limit | So you find out before a deployment is blocked |
| Workflows that fail to start | Distinguishes a capacity refusal from a configuration error |

Add the expiration date to whatever tracks your other renewals when you first apply a license. See [Alerting and Notifications](../notifications/index.md) for monitoring the platform generally.

---

## Next

- [License ID and License Code](license-id-code.md)
- [License Types](license-types.md)
- [License Transfer](license-transfer.md)
