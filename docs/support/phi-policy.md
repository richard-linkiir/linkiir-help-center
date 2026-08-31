---
title: PHI in Support Requests
description: Linkiir Support does not accept or request Protected Health Information. What is prohibited, what to send instead, and Linkiir's clean-delete process if PHI is submitted by accident.
---

# PHI in Support Requests

**Linkiir Support does not accept Protected Health Information, and will never ask you for it.**

This applies to every support channel — email, the support portal, and the 24/7 urgent production channel — and to every attachment, screenshot, log excerpt, and reply on any of them.

Linkiir can diagnose the overwhelming majority of issues from structure, configuration, error text, and synthetic data. Real patient data is almost never necessary, and Linkiir Support is instructed not to request it.

---

## What Linkiir Support will never ask you for

No Linkiir support engineer will ask you to provide any of the following, at any severity, including during a production outage:

- Production message payloads containing real patient data.
- Production sample data attached to a node or workflow.
- Screenshots of production screens showing real patient information.
- Log excerpts that have not had patient data removed.
- Patient names, MRNs, health card numbers, or dates of birth.
- Passwords, API keys, access tokens, or private keys.
- Database credentials.
- Your Linkiir master encryption key.

:::caution Verify unexpected requests
If anyone claiming to be from Linkiir asks you to send patient data, credentials, or your master encryption key — by email, phone, chat, or on a support ticket — treat it as suspicious. Do not send it. Confirm the request with your Linkiir Account Manager through a channel you already trust.
:::

Where remote access to a production environment is genuinely required, it is arranged through a method your organisation approves and controls, not by sending credentials to a support ticket.

---

## What must not be submitted

| Category | Examples |
| --- | --- |
| Patient identifiers | Names, medical record numbers, health card numbers, dates of birth tied to an identifiable patient, addresses, phone numbers |
| Clinical data | Results, diagnoses, medications, or notes linked to an identifiable patient |
| Production payloads | Real HL7 v2, FHIR, CDA, or X12 messages |
| Production samples | Test samples on a node that were built from real data |
| Screenshots | Any image showing the above, including a browser tab title or a background window |
| Credentials | Passwords, API keys, access tokens, private keys, database credentials |
| Keys | The Linkiir master encryption key |
| Full logs | Unredacted log archives containing payload content |

File names count too. `smith-john-adt-error.txt` discloses a patient name before anyone opens it.

## What to send instead

Keep the structure, replace the data:

```text
PID|1||TEST000001^^^LINKIIR^MR||TEST^PATIENT||19700101|M
```

Synthetic identifiers — `TEST000001`, `TEST^PATIENT`, `19700101` — reproduce parsing, mapping, and validation problems just as reliably as real ones. [Submitting a Support Request](submitting-a-request.md) covers how to prepare a request this way, including the places PHI tends to hide.

The portal's Technical Support form asks you to confirm this before submitting:

> I confirm this submission and any attachments have been reviewed and do not contain PHI or other personal information that has not been de-identified.

---

## If PHI reaches Linkiir by accident

It happens, usually in a log excerpt or a screenshot rather than in the description. Linkiir has a defined **clean-delete** process for it.

### What Linkiir does

1. **Stops using the content.** Troubleshooting from the PHI-containing material stops immediately. It is not used to diagnose your issue.
2. **Contains it.** The content is not copied onward into internal collaboration tools, engineering tickets, notes, or screenshots. Any copy already created during handling is located.
3. **Removes it.** The PHI-containing content is removed from every support location under Linkiir's control — the support mailbox and its deleted-items retention path, the support ticket description, comments and attachments, internal collaboration tools, engineering trackers, and any local copies held by the engineer handling the request.
4. **Escalates what a support user cannot purge.** Where a platform retains the content in an audit, revision, history, or backup layer that a support user cannot remove, it is escalated to the authorised Linkiir administrator and privacy owner for purge or documented remediation.
5. **Notifies you in writing.** You receive a written confirmation on the ticket. See below.
6. **Asks you to resubmit.** If support is still required, Linkiir asks you to resend the request fully de-identified.
7. **Records a sanitised note only.** The internal audit record states that prohibited content was received, removed, and that you were notified. The PHI itself is never copied into that note.

### The confirmation you receive

The written notification tells you:

- that PHI or patient-identifiable information was identified in your request or an attachment;
- that Linkiir Support does not accept PHI through the support channel;
- that the PHI-containing content has been removed from Linkiir's support systems in accordance with its support handling process;
- that the material will not be used for troubleshooting;
- that you should resubmit de-identified if support is still needed, reviewing screenshots, logs, file names, and attachments first;
- where complete removal could not be confirmed, that it has been escalated to the authorised Linkiir administrator and privacy owner, and what remediation was taken.

Linkiir states what it has removed and where it has escalated. It does not claim that content has been permanently purged from every underlying platform layer unless that has actually been verified — some hosted platforms retain audit, backup, or legal-hold data outside the support team's control, and telling you otherwise would not be accurate.

:::note Your obligations are unaffected
Linkiir's clean-delete process is an internal remediation measure. It does not determine whether an accidental disclosure is reportable under HIPAA, PIPEDA, PHIPA, or any other regime that applies to your organisation. Assess that under your own incident and breach-notification procedures, and use Linkiir's written confirmation as part of your record.
:::

---

## Why the rule exists

Linkiir archives production payloads deliberately, in your Log DB, inside your environment and under your access controls. That is the controlled place for them.

A support ticket is not. It travels through email, a hosted service desk, and the mailboxes of whoever is on the thread. Every copy is a copy your organisation no longer controls. Keeping PHI out of the support channel keeps the boundary where it belongs.

[Security](../administration/security/index.md) covers the same principle inside the product: what belongs in the Log DB, what must stay out of error text and service logs, and how to keep node samples synthetic.

---

## Your side of it

- Review the description, attachments, screenshots, and **file names** before submitting.
- Re-check on every reply, not only the first submission.
- De-identify log excerpts rather than attaching them whole.
- Build node test samples from synthetic data, so they are safe to share from the outset.
- Tell Linkiir promptly if you realise PHI was sent — on the same ticket, without repeating the PHI in your message.
- Never send credentials or your master encryption key, whoever asks.

See the applicable Linkiir Privacy Policy, and your signed Linkiir agreement, for the contractual and privacy terms that apply to your organisation.

---

## Next

- [Submitting a Support Request](submitting-a-request.md)
- [Standard Support](standard-support.md)
- [24/7 Urgent Production Support](urgent-production-support.md)
- [Security](../administration/security/index.md)
