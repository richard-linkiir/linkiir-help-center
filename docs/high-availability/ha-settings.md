---
title: Using the HA Settings
sidebar_label: Using the HA Settings
description: How to use the High Availability page in Linkiir - naming the servers, clearing the readiness checks, enabling HA, stepping down, and turning HA off.
keywords: [HA settings, enable HA, step down, readiness checks, failover timings, ACTIVE, STANDBY]
---

# Using the HA Settings

Everything about High Availability lives on one screen: **Settings → High Availability**. This page walks through it in the order you use it, from first sight of the page to running pair.

You can open it from **either** server, and changes you make apply to the pair.

## What the page shows

Before HA is enabled, the page has four parts:

| Part | What it is for |
| --- | --- |
| **Header** | The current state, and the **Enable HA** button |
| **The pair** | Both servers, each with a display name and the address its partner uses |
| **Failover timings** | How quickly a failure is detected and acted on |
| **Readiness** | Seven checks that must pass before HA can be turned on |

Once HA is enabled the header changes to show **ACTIVE** or **STANDBY**, a summary of which server currently holds the active role appears, and the buttons become **Step Down** and **Disable HA**.

```text
 Settings
 ─────────────────────────────────────────────────────────────
 About   License   Database   Logging   Notifications
 [ High Availability ]   Roles   Users   Http Server   Instance
 ─────────────────────────────────────────────────────────────

   High Availability     DISABLED            [ Enable HA ]

   The pair
     Site A (Rack 1)   [this server]
     Site B (Rack 2)                        [ Test Connection ]

   Failover timings                         [ Save timings ]
     Estimated failover window   ~18s

   Readiness                                [ Re-run checks ]
     ● Working directory writable
     ● Log backend supports concurrent writers · postgres
     ● License includes HA
     ● Node identity configured
     ● Pair has exactly two nodes
     ● Peer reachable
     ● Kafka has more than one broker · 3 brokers reachable
```

## Check both servers are listed

Both servers appear here by themselves, within about 30 seconds of starting. Neither has to be told about the other.

| What you see | What it means |
| --- | --- |
| Both servers listed | Ready to continue |
| Only one listed | The other has not started yet, or is not pointed at the same shared working directory. Start it, or correct its working directory |
| More than two listed | A third installation is pointed at this working directory — often a test instance or a clone. Stop it, then use **Forget** to remove it from the list |

:::note Forget only works on a stopped server
A server that is still running re-registers itself and reappears in the list. Stop it first, then forget it.
:::

## Name the servers

Two fields per server are editable, and you can edit either server from either screen.

| Field | When to change it |
| --- | --- |
| **Display name** | Whenever you want friendlier labels than hostnames. Cosmetic only |
| **Address its partner uses** | Only when the address shown is not how the other server reaches this one — split-horizon DNS, a management network, or a reverse proxy in between |

:::tip Name a server for where it is, not what it does
Use "Rack 2" or "DC-West", never "Backup" or "Standby". Roles move at every failover, so a name describing the role is wrong half the time. The current role is shown beside the name anyway.
:::

Click **Test Connection** after changing an address. It makes a real request and tells you what answered, which is faster than enabling HA and finding out.

The server identity itself is fixed and not editable. It is what the pair uses to tell the two servers apart, so renaming it on a running pair is not offered.

## Clear the readiness checks

All seven must pass. **Enable HA** stays disabled until they do, so a half-built pair cannot be switched on.

The labels below are the ones on screen. "Node" and "peer" are the page's words for a server in the pair and for the other server.

| Check | Passes when |
| --- | --- |
| **Working directory writable** | The shared working directory is writable by the Linkiir service account |
| **Log backend supports concurrent writers** | The log database is PostgreSQL or MS SQL. It names the engine it found |
| **License includes HA** | The license is Enterprise with the HA feature — see [HA Licensing](licensing.md) |
| **Node identity configured** | Each server has a stable identity |
| **Pair has exactly two nodes** | Both servers are registered, and no third installation is present |
| **Peer reachable** | Each server can reach the other at the address shown |
| **Kafka has more than one broker** | The broker cluster is reachable. It reports how many nodes answered |

Each failure says what to fix. Click **Re-run checks** after fixing something rather than reloading the page.

If a check will not clear, it is nearly always shared storage, the log database engine, or the license. Those three are covered in [System Requirements](system-requirements.md), and support can work through them with you.

## Enable HA

Click **Enable High Availability**. The server you are on becomes **ACTIVE**; the other becomes **STANDBY** by itself within a few seconds.

| | |
| --- | --- |
| Restart needed | **No** |
| Running workflows interrupted | **No** |
| Applies to | Both servers, whichever one you clicked it on |

After enabling, confirm three things:

1. Exactly **one** server shows **ACTIVE**, and the other shows **STANDBY**.
2. Each server shows the other as its partner, reachable.
3. The role badge appears in the top bar on every page.

:::caution Both servers showing ACTIVE
This should not happen, and it means the two servers are not working as a pair. Do not run integrations in this state — contact [support@linkiir.com](mailto:support@linkiir.com).
:::

## Read the live state

Once HA is on, the page tells you who is serving and how quickly a failure would be covered.

| On screen | Meaning |
| --- | --- |
| **ACTIVE** / **STANDBY** in the header | The role of the server you are looking at |
| Role badge in the top bar | The same, on every page — how you tell which server you have reached when both sit behind one address |
| Which server holds the active role | The one currently serving users and running your integrations |
| Failover window | Roughly how long an unplanned failover would take, given the current timings |

For the history of who took over and when, use the **audit log**. It is the durable record, and HA events appear there as they happen.

## Failover timings

The timings control how quickly an unplanned failure is detected and acted on. They are shared by both servers, and the page shows the estimated failover window as you change them.

:::caution Keep the defaults unless you have measured a reason to change them
The defaults give roughly 18 seconds to detect an unplanned failure and about 30 seconds to full recovery. Shortening them makes needless failovers more likely during a brief storage or network hiccup; lengthening them extends your outage. Change them with support, not on a hunch.
:::

The page enforces one rule for you: the renewal interval must stay at or below a third of the overall window, so that several attempts fit inside it and one slow moment does not trigger a failover.

**Leave automatic failback off.** With it off, a recovered server rejoins as standby and waits — so you decide when the role moves back, during a quiet moment, instead of taking a second unplanned interruption. See [Move the role back](operations.md#move-the-role-back).

## Step Down

**Step Down**, on the active server, hands the active role to the other one. It takes under 10 seconds.

Use it to:

- Move traffic off a server you are about to patch or reboot.
- Test a failover safely, which you should do before go-live and after every upgrade.
- Move the role back after a recovered server has rejoined.

The other server must be standby and reachable. If it is not, the page says so rather than stepping down into nothing.

See [Operating an HA Pair](operations.md) for both procedures in full.

## Turning HA off

**Disable HA**, on either server, stops the pair coordinating. Read the confirmation dialog: it names which server does what.

| After disabling | What happens |
| --- | --- |
| The server that was active | Keeps running your integrations |
| The other server | Stops its integrations but stays reachable, so you can still sign in and see its status |

This is not configurable, and it is the safe behavior: two servers running the same integrations would process every message twice.

Re-enable HA from either server when you are ready. As with enabling, neither server needs a restart.

## Permissions

Viewing the page and changing HA needs different rights, so read access can be given widely without handing over failover control.

| Action | Needs |
| --- | --- |
| View the page, roles, and readiness checks | Access to Settings |
| Enable, disable, or step down | The HA management permission |

See [Users and Roles](../administration/configurations/user-roles.md).

## Next

- [Operating an HA Pair](operations.md)
- [HA Licensing](licensing.md)
- [System Requirements](system-requirements.md)
