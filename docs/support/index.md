---
title: Support
description: How to get help from Linkiir. Standard Support by email or the support portal, and 24/7 urgent production support for critical production outages.
---

# Support

Two support channels, and the choice between them comes down to one question: is your Linkiir **production platform** down right now?

<div class="lnk-grid">

<a class="lnk-card lnk-card-link" href="/docs/support/standard-support">
  <svg class="lnk-card__icon" viewBox="0 0 32 32" aria-hidden="true">
    <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="7" width="26" height="18" rx="3" />
      <path d="M4.5 9.5L16 18l11.5-8.5" />
    </g>
  </svg>
  <span class="lnk-card__title">Standard Support</span>
  <span class="lnk-card__body">Email or the support portal, for product questions, configuration, troubleshooting, and everything that is not a production outage.</span>
</a>

<a class="lnk-card lnk-card-link" href="/docs/support/urgent-production-support">
  <svg class="lnk-card__icon" viewBox="0 0 32 32" aria-hidden="true">
    <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="16" cy="16" r="12.5" />
      <path d="M16 9.5v7l4.5 3" />
    </g>
  </svg>
  <span class="lnk-card__title">24/7 Urgent Production Support</span>
  <span class="lnk-card__body">Call the Linkiir 24/7 number for critical production outages, any hour of the day, where your organisation is covered for 24/7 support.</span>
</a>

</div>

## Pick a channel

| Your situation | Channel |
| --- | --- |
| Product question, how-to, or training | [Standard Support](standard-support.md) |
| Configuration, workflow, node, or mapping problem | [Standard Support](standard-support.md) |
| One Lua script or one message failing | [Standard Support](standard-support.md) |
| Installation or upgrade question | [Standard Support](standard-support.md) |
| Suspected product defect | [Standard Support](standard-support.md) |
| DEV, TEST, or UAT issue of any severity | [Standard Support](standard-support.md) |
| Feature request | [Standard Support](standard-support.md) |
| Linkiir **production** platform is down or core services will not start | [24/7 Urgent Production Support](urgent-production-support.md) |

The test for the 24/7 channel is **broad production platform impact**, not the severity of a single error message. A healthy platform with one failing workflow is Standard Support, even at 2 a.m.

## Submit a request

| Channel | Where |
| --- | --- |
| Email | [support@linkiir.com](mailto:support@linkiir.com) |
| Support portal | [Linkiir support portal](https://linkiir.atlassian.net/servicedesk/customer/portals) |
| 24/7 urgent production | **Call** the Linkiir 24/7 support number issued to your organisation — see [24/7 Urgent Production Support](urgent-production-support.md) |

Both Standard Support channels create the same ticket and are tracked the same way. Use whichever suits you.

## Before you write

A few minutes of checking often resolves the issue outright, and where it does not, it makes the ticket far faster to answer.

- Check `/api/health` and note any sub-check that is not `ok`. See [Troubleshooting](../administration/troubleshooting/index.md).
- Search this help center. [FAQ](../faq/index.md) covers the questions that come up most.
- Check the [Release Notes](../release-notes/index.md) for your version.
- Confirm whether one node, one workflow, the Runtime, the Archiver, or the Grid is affected.

Then gather the details in [Submitting a Support Request](submitting-a-request.md), which lists what Linkiir needs and — just as importantly — what must never be sent.

:::caution No PHI, no credentials
Linkiir Support does not accept Protected Health Information, patient-identifiable data, passwords, API keys, tokens, or private keys through any support channel, and will never ask you for them. De-identify everything before you attach it, including screenshots, log excerpts, and file names. See [PHI in Support Requests](phi-policy.md).
:::

## In this section

- [Standard Support](standard-support.md): How to open a ticket by email or portal, what lands in your inbox, and how a ticket moves to resolution.
- [24/7 Urgent Production Support](urgent-production-support.md): What qualifies, how to reach Linkiir at any hour, and what happens after you make contact.
- [Submitting a Support Request](submitting-a-request.md): The information to include, how to prepare it, and a pre-submit checklist.
- [PHI in Support Requests](phi-policy.md): What Linkiir Support will never ask you for, what must not be submitted, and the clean-delete process if PHI arrives by accident.

Your signed Linkiir agreement governs the support entitlements that apply to your organisation. Where this section and that agreement differ, the agreement takes precedence.
