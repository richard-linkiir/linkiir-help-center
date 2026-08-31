---
title: Standard Support
description: Open a Linkiir support ticket by email or through the support portal, what to expect in your inbox, and how a ticket moves from submission to resolution.
---

# Standard Support

Standard Support handles product questions, configuration issues, workflow and node problems, troubleshooting, installation and upgrade questions, suspected defects, and feature requests.

Two ways in. Both create the same ticket, and both are tracked in the same place.

| Option | Use |
| --- | --- |
| Email | [support@linkiir.com](mailto:support@linkiir.com) |
| Support portal | [linkiir.atlassian.net/servicedesk/customer/portals](https://linkiir.atlassian.net/servicedesk/customer/portals) |

:::info Production outage?
If your Linkiir production platform is down or core services will not start, and your organisation is covered for 24/7 support, use [24/7 Urgent Production Support](urgent-production-support.md) instead. Standard Support is not monitored around the clock.
:::

---

## Option A — Email

Send your request to **support@linkiir.com**.

Write a subject line that describes the problem, and put the technical detail in the body. There is no form to fill in and no account to create.

What happens next:

1. Your email creates a support ticket automatically.
2. You receive an email confirmation with the ticket reference.
3. A Linkiir support engineer reviews the request.
4. Every reply arrives by email and is recorded on the ticket.

You can continue the whole conversation by replying to those emails. Attachments work normally.

:::note Keep the subject line
Reply to the support emails without editing the subject. That is what keeps your reply attached to the same ticket instead of opening a second one.
:::

---

## Option B — Support portal

Open the [Linkiir support portal](https://linkiir.atlassian.net/servicedesk/customer/portals) and choose **Technical Support**.

You may be asked to sign in to or create a customer account before submitting. Once you have one, the portal gives you a list of your organisation's requests and their current status.

The form asks for:

| Field | Notes |
| --- | --- |
| **Summary** | Required. A short title that names the problem. |
| **What do you need help with?** | Required. The full description. |
| **Operating system** | Windows, Linux, or macOS, with version. |
| **Linkiir product version** | The version the problem occurs on. |
| **Environment type** | Production, Test, or Development. |
| **Attachments** | Screenshots, de-identified log excerpts, reproduction steps. |
| **PHI confirmation** | You confirm the submission and attachments contain no PHI or other personal information that has not been de-identified. See [PHI in Support Requests](phi-policy.md). |

[Submitting a Support Request](submitting-a-request.md) covers what to put in each field.

What happens next:

1. The ticket is created immediately.
2. The request appears in your portal request list.
3. A Linkiir support engineer reviews it.
4. Replies arrive by email and are also visible in the portal.

### Which option should you use?

Email is faster to send. The portal gives you structured fields, a request list you can browse, and a place to check status without searching your mailbox. Pick either — a ticket raised by email is handled exactly like a ticket raised in the portal.

---

## What to expect in your inbox

Assume email is where the conversation happens, whichever channel you started in.

| Email | When it arrives | What to do |
| --- | --- | --- |
| **Request received** | Immediately after your email or portal submission | Nothing. Keep it for the ticket reference. |
| **Support reply or question** | When an engineer responds | Reply to the email, or use **View request** to answer in the portal. |
| **Status change** | When the ticket moves between stages | Read it. If the status is **Waiting for Customer**, Linkiir is blocked on you. |
| **Resolved** | When the request is closed | Confirm it worked, or reply if the issue persists. |
| **Satisfaction survey** | Shortly after resolution | Optional, and it takes one click. |

Every support email includes a **View request** link that opens the ticket in the portal, where you can read the full history and add attachments.

:::tip If confirmation never arrives
Check your spam and quarantine folders, and ask your mail administrator to allow mail from the Linkiir support domain. If there is still nothing, submit through the [support portal](https://linkiir.atlassian.net/servicedesk/customer/portals) instead — the portal shows your request regardless of email delivery.
:::

---

## The support workflow

```text
        Request submitted
        (email or portal)
                |
                v
       Waiting for Support
                |
                v
           In Progress
                |
        +-------+-------+
        |               |
        v               v
Waiting for Customer  Pending / Escalated
        |               |
        +-------+-------+
                |
                v
             Resolved
```

The common path is short: **Waiting for Support → In Progress → Resolved**. The side branches exist for the cases that need them.

### What each status means

| Status | Meaning | Who is holding it |
| --- | --- | --- |
| **Waiting for Support** | Received, awaiting review or assignment. | Linkiir |
| **In Progress** | An engineer is actively working on it. | Linkiir |
| **Waiting for Customer** | Linkiir needs information, a confirmation, or a de-identified resubmission from you. | You |
| **Pending** | Paused on a known dependency — a maintenance window, an internal build, a scheduled test, or a third party. | Linkiir |
| **Escalated** | Raised for additional technical or management attention. Ownership does not change; the ticket keeps moving. | Linkiir |
| **Resolved** | Fixed, answered, or an accepted workaround is in place. Closed. | Closed |
| **Canceled** | No longer required, submitted in error, or a duplicate of another ticket. | Closed |

**Waiting for Customer** is the status worth watching. A ticket sitting there is waiting on your reply, not on Linkiir.

---

## Replying to Linkiir Support

You have three options, and they all land on the same ticket:

- Reply directly to the support email.
- Select **View request** in the email, then comment in the portal.
- Open the request from your portal list and comment there.

When you reply, include:

- The answer to whatever was asked.
- Anything that has changed since you submitted — new errors, a different symptom, a wider impact.
- New attachments, de-identified.

Re-check attachments for PHI and secrets every time, not just on the first submission.

---

## Resolution

Linkiir resolves a request when the issue is fixed, the guidance you asked for has been provided, or a workaround has been accepted and nothing further is outstanding.

The closing response summarises what was found, what changed or was recommended, and any action still left with you. Where Linkiir needs your confirmation before closing, the ticket waits in **Waiting for Customer** rather than being closed on your behalf.

If the problem comes back after a ticket is resolved, reply on the original ticket. The history is already there, which is usually faster than starting again.

Follow-up engineering work — a defect fix scheduled for a future release, for example — is tracked separately from your support ticket. Your ticket can be resolved while that work continues.

---

## Satisfaction survey

After a request is resolved you may receive a short survey:

> **How was our service for this request?**

Ratings run from **Very poor** to **Very good**. Comments are optional and read. They feed directly into how Linkiir adjusts its support process and this documentation.

---

## Support channel summary

| Need | Channel |
| --- | --- |
| Standard technical support by email | [support@linkiir.com](mailto:support@linkiir.com) |
| Standard technical support on the web | [Linkiir support portal](https://linkiir.atlassian.net/servicedesk/customer/portals) |
| Check the status of an existing request | [Linkiir support portal](https://linkiir.atlassian.net/servicedesk/customer/portals) |
| Critical production outage, 24/7 | [24/7 Urgent Production Support](urgent-production-support.md) |
| The 24/7 number, or a question about your entitlements | Your Linkiir Account Manager |

---

## Next

- [Submitting a Support Request](submitting-a-request.md)
- [PHI in Support Requests](phi-policy.md)
- [24/7 Urgent Production Support](urgent-production-support.md)
- [Troubleshooting](../administration/troubleshooting/index.md)
