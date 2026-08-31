---
title: Security
---

# Security

What a fresh Linkiir installation gives you, what it does not, and what to do about each before you put patient data through it.

## Where a fresh install starts

| Aspect | Out of the box |
| --- | --- |
| Network exposure | Bound to `127.0.0.1`. Reachable only from the machine it runs on. |
| Administrator account | `admin` / `password`, blocked from everything until the password is changed |
| Transport | Plain HTTP. TLS is available but not configured. |
| Stored secrets | Broker and Log DB passwords encrypted with a generated master key |
| User passwords | Hashed individually |
| Sessions | 15-minute idle timeout, 24-hour absolute timeout |

The two things to do first: change the administrator password, and decide how the Grid will be reached.

---

## 1. Complete the administrator password change

A fresh installation seeds `admin` with the password `password` and blocks every other part of the product until it is changed. Do this before anything else. See [Reset the Admin User](../../getting-started/first-login.md).

Then stop using it for daily work. Create named accounts with the narrowest roles that let people do their jobs, and keep `admin` in your privileged-access system for recovery. See [Users and Roles](../configurations/user-roles.md).

Enforced password rules are a minimum length of 8 characters and "not the same as the current password". There is no complexity requirement, no reuse history, and no account lockout — so the strength of your credentials is a matter of your own policy, and protecting the login surface is a network-layer job.

---

## 2. Protect remote access

Linkiir binds to localhost, and nothing you do inside the Grid changes that. Opening remote access is a deliberate act: changing the bind address, publishing a port, or putting a proxy in front.

Before you do:

- Complete the administrator password change.
- Put TLS in front of the Grid. Terminate it at Linkiir where its own TLS settings suffice, or at a reverse proxy or load balancer you control.
- Redirect or block plain HTTP.
- Use organisation-issued certificates.
- Restrict source addresses at the firewall to the networks that need access.

:::caution[Do not publish the Grid directly]
The Grid is a full administrative surface: it edits interfaces, reads message payloads, and manages credentials. Put it behind a reverse proxy providing TLS and whatever access controls your organisation requires, and restrict who can reach that proxy. Treat it like any other administrative console, not like a public web application.
:::

### Ports to keep private

| Surface | Exposure |
| --- | --- |
| Grid (default `8080`) | Restricted, TLS-terminated, authenticated |
| Node listeners (HTTP, LLP) | Only to the systems that send to them |
| Runtime internals | Private to the host |
| Broker and broker management | Private to your infrastructure |

Node listeners are a separate decision from the Grid. An LLP listener has to be reachable by the sending system and by nothing else — restrict it at the network layer, not by hoping nobody finds the port.

Use secure broker protocols such as `SSL` or `SASL_SSL` where your broker requires them. See [Kafka Configuration](../configurations/kafka-redpanda.md).

### Outbound connections from interfaces

Outbound HTTP calls made from a script verify the destination's certificate by default. Leave that verification on.

Where a partner API requires mutual TLS, a script can present a client certificate on the call instead of routing through a separate proxy. Put the PEM certificate and key on the Linkiir server, readable only by the Runtime account, and reference them by path. See [Client certificates (mutual TLS)](../../api/scripting-api/connectivity.md#client-certificates-mutual-tls).

---

## 3. Sessions

| Timeout | Default | Configure in |
| --- | --- | --- |
| Idle | 15 minutes | **Settings → Instance** |
| Absolute | 24 hours | **Settings → Instance** |

Background polling the Grid performs on its own does not count as activity, so an unattended tab still times out.

Sessions live in the running Grid process. Restarting it signs everyone out — worth knowing before a planned restart, and a useful lever if you need to revoke access immediately.

Shorten the idle timeout on installations reachable beyond a trusted network, and on shared workstations.

---

## 4. Secrets

Linkiir generates a master encryption key at install time and uses it to encrypt the broker and Log DB passwords it stores, so they are never written in clear.

| Platform | Key location |
| --- | --- |
| Windows | `C:\ProgramData\Linkiir\config\linkiir.env` |
| Linux | `/etc/linkiir/linkiir.env` |
| Docker | `LINKIIR_SECRET_KEY` in `.env` |

Restrict its filesystem permissions, and include it in your backups — see [Backup and Restore](../backup-restore/index.md). Losing it does not affect projects, users, or message history; it makes the stored broker and database passwords unrecoverable.

### Secrets in projects

Keep connection secrets in a project's **Variables** tab with the **Secret** flag set, and reference them by name from node configuration and scripts. Never paste a password into a Lua file: the file is committed to the project's history and travels in an export.

Secret values leave an export encrypted, and only the installation that exported them can read them back. Their names survive, so whoever imports the project elsewhere can see exactly what needs re-entering. See [Project Settings](../configurations/project-settings.md) and [Import and Export](../deployment/import-export.md).

### Service accounts

Give Linkiir its own named accounts for the broker and the database, with the narrowest rights that work. Shared administrative credentials make an audit trail useless and widen the impact of a leak.

---

## 5. Patient data and logs

Linkiir archives message payloads deliberately, in the Log DB, so you can trace and replay messages. That is the controlled place for them. The risk is payload content leaking into places that are not controlled.

**Keep out of error text, alerts, and general service logs:** patient name, MRN, date of birth, health card number, address, phone number, and raw HL7, FHIR, CDA, or X12 payloads.

**Safe to record:** project, workflow, and node names; message and correlation IDs; error category and code; retry counts; queue positions; timestamps.

```lua
-- Right: names the field
error("PID-3 patient identifier is missing")

-- Wrong: puts an identifier in a log
error("bad MRN: " .. mrn)
```

Test samples are stored with the project and visible to anyone who can open the node. Use clearly synthetic identifiers — `TEST000001`, `TEST^PATIENT`, `19700101`. See [Error Handling and Retry](../../interface-development/error-handling.md).

The same boundary applies when you raise a support ticket: payloads belong in your Log DB, not in a support request. Linkiir Support does not accept PHI and will never ask you for it — see [PHI in Support Requests](../../support/phi-policy.md).

Apply the retention and purge policy your organisation requires to the Log DB, and restrict who can view payloads and perform replays. Note that the permission model is coarse: **View Logs** covers reading message history including payloads, and there is no separate permission for payload access. Where a stricter split matters, separate environments rather than relying on roles within one.

---

## 6. Message payload encryption

:::info[Not available]
Linkiir does not encrypt message payloads at the application level before they enter the queue. Payloads sit in the broker in the form the interface produced.

Rely on broker TLS, storage-level encryption, access control, and network isolation. Do not assume payloads in the queue are encrypted by Linkiir.
:::

---

## Pre-production checklist

| Item | Done when |
| --- | --- |
| Administrator password changed | The forced change completed and `admin` is out of daily use |
| Named accounts with narrow roles | Each person has their own account |
| Grid not directly published | TLS terminated, source addresses restricted |
| Node listeners restricted | Only sending systems can reach them |
| Broker uses a secure protocol | Where your broker requires it |
| Master key backed up, permissions restricted | Included in your backup, readable only by the service account |
| Secrets in the Variables tab with **Secret** ticked, not in scripts | No secrets in any `.lua` file |
| Samples are synthetic | No real identifiers in any sample |
| Session timeouts suit your exposure | Reviewed rather than left at defaults |
| Log DB retention and access reviewed | Policy applied, access restricted |
| External monitoring in place | Health, lag, and disk alerts exist — see [Alerting and Notifications](../notifications/index.md) |

---

## Next

- [Users and Roles](../configurations/user-roles.md)
- [Backup and Restore](../backup-restore/index.md)
- [Error Handling and Retry](../../interface-development/error-handling.md)
