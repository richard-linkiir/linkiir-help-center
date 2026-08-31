---
title: Submitting a Support Request
description: What to include in a Linkiir support request, the PHI and credentials rules that apply to every support channel, and a checklist to run before you submit.
---

# Submitting a Support Request

A support ticket is answered as fast as the information in it allows. This page covers what to include, what must never be included, and a checklist to run before you press send.

Applies to both [Standard Support](standard-support.md) channels — email and the portal.

---

## Summary

One line that names the problem. Specific beats dramatic.

```text
Good:  Runtime service cannot start after server reboot
Good:  LLP source node stops accepting connections after ~200 messages
Good:  Log Archiver reports LOG_DB_UNREACHABLE since 06:40 UTC

Weak:  Urgent
Weak:  Linkiir not working
Weak:  Question
```

## Description

Answer four questions, in this order:

1. **What were you trying to do?**
2. **What happened?**
3. **What did you expect to happen?**
4. **What have you already tried?**

Then add whatever of the following you have:

- The exact error message, copied as text rather than described.
- When the issue started, with the timezone.
- Whether it is repeatable, intermittent, or happened once.
- How many workflows, nodes, or messages are affected.
- Any configuration, deployment, upgrade, or infrastructure change in the days before it started.
- What `/api/health` reports, and which sub-checks are not `ok`.

Recent change is the single most useful detail people leave out. A reboot, a certificate renewal, a firewall rule, a broker upgrade, a new node — say so even if you are confident it is unrelated.

## Environment details

Include these every time. They decide which code path Linkiir looks at.

| Detail | Example |
| --- | --- |
| Operating system and version | Windows Server 2022, Ubuntu 24.04, macOS 15.3 |
| Linkiir product version | The version the problem occurs on |
| Environment type | Production, Test, or Development |
| Deployment shape | Single node, or HA active/standby |
| Queue and Log DB | Bundled or your own cluster or server |

If more than one environment is involved — it works in TEST but not in PROD — say what differs between them.

## Attachments

Useful, in rough order:

- A screenshot of the error, with any patient data removed.
- De-identified log excerpts covering the minutes before and after the failure.
- `/api/health` output, before and after a restart.
- Reproduction steps, ideally with a synthetic message.
- Configuration screenshots with credentials and secrets cropped or masked.

Trim log excerpts to the relevant window. A targeted 200 lines is worth more than a 200 MB archive.

For a crash, [Crash Report Collection](../administration/troubleshooting/crash-report.md) lists what to gather and what to strip out.

---

## PHI and sensitive data

**Linkiir Support does not accept Protected Health Information or credentials through any support channel, and will never ask you for them.** This applies to email, the portal, the 24/7 channel, and every attachment on any of them.

The short version of what must never be sent:

- Patient identifiers and clinical data — names, MRNs, health card numbers, dates of birth, results.
- Real production payloads, and node samples built from real data.
- Screenshots showing any of the above.
- Passwords, API keys, tokens, private keys, database credentials, or your master encryption key.

[PHI in Support Requests](phi-policy.md) is the full policy: the complete prohibited list, what Linkiir Support will never ask you for, and the clean-delete process Linkiir follows if PHI arrives by accident.

### Places PHI hides

The description is the easy part. PHI is usually found somewhere less obvious:

- Inside log excerpts, where a payload was written to an error message.
- In screenshots — a browser tab title, a background window, a notification.
- In **file names**, such as `smith-john-adt-error.txt`.
- In embedded images inside a document you are attaching.
- In test samples stored on a node, if real data was used to build them.
- In a later reply, after a clean first submission.

Review every attachment on every message, not just the first one.

### Use synthetic data instead

Replace identifiers with obviously fake values and keep the structure intact:

```text
Instead of the real message, send the shape of it:
  PID|1||TEST000001^^^LINKIIR^MR||TEST^PATIENT||19700101|M
```

That is nearly always enough to reproduce a mapping or parsing problem. [Security](../administration/security/index.md) covers what belongs in logs and error text, and [Error Handling and Retry](../interface-development/error-handling.md) covers writing errors that are diagnosable without payload content.

### If PHI is sent by mistake

It happens. Tell Linkiir Support as soon as you notice, on the same ticket, without repeating the PHI in your message. Linkiir stops using the content, removes it under its clean-delete process, and confirms in writing — see [If PHI reaches Linkiir by accident](phi-policy.md#if-phi-reaches-linkiir-by-accident).

---

## Checklist

Before you submit:

- [ ] The Summary names the specific problem.
- [ ] The description says what I did, what happened, and what I expected.
- [ ] The exact error text is included, copied rather than paraphrased.
- [ ] I said when it started, and whether it repeats.
- [ ] I noted any recent change, even one I think is unrelated.
- [ ] Operating system and version are included.
- [ ] Linkiir product version is included.
- [ ] Environment is identified as Production, Test, or Development.
- [ ] Attachments are trimmed to the relevant window.
- [ ] Every attachment has been opened and reviewed.
- [ ] No PHI in the text, the logs, the screenshots, or the file names.
- [ ] No passwords, API keys, tokens, private keys, or the master encryption key.
- [ ] Samples use synthetic identifiers.
- [ ] I picked the right channel: Standard Support, or [24/7](urgent-production-support.md) for a production platform outage.

---

## Next

- [PHI in Support Requests](phi-policy.md)
- [Standard Support](standard-support.md)
- [24/7 Urgent Production Support](urgent-production-support.md)
- [Troubleshooting](../administration/troubleshooting/index.md)
- [Security](../administration/security/index.md)
