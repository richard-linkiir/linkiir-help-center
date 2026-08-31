---
title: 24/7 Urgent Production Support
description: Linkiir's 24/7 urgent production support policy — what qualifies, the 30-minute engagement target, and how to reach Linkiir at any hour using the 24/7 support number issued to your organisation.
---

# 24/7 Urgent Production Support

Linkiir's 24/7 channel exists for one thing: **critical production incidents that materially prevent Linkiir from operating**, reported at any hour, on any day.

It is not an after-hours troubleshooting, development, mapping, configuration, or training channel. Everything else goes to [Standard Support](standard-support.md).

:::info Availability
24/7 urgent production support is available to organisations whose Linkiir support agreement includes it. If you are not sure whether yours does, ask your Linkiir Account Manager.
:::

---

## How to submit a 24/7 request

**Call the Linkiir 24/7 support number.**

The number is issued directly to organisations that qualify for 24/7 services. It is deliberately not published in this help center, in release notes, or on linkiir.com.

A phone call is the only way to open a 24/7 urgent production request. Have the four items under [What to have ready](#what-to-have-ready) to hand before you dial.

### Getting the number

Contact your **Linkiir Account Manager**. They will confirm your 24/7 entitlement and provide the number, along with the emergency fallback contact method for your organisation.

Do this **before** you need it:

- Store the number where your on-call staff can reach it at 3 a.m. — your on-call runbook, your monitoring escalation policy, your NOC contact list.
- Do not rely on one person's mobile phone as the only copy.
- Include the fallback contact method alongside it.
- Re-confirm the details with your Account Manager after any change to your support agreement.

:::caution Keep it internal
The 24/7 number is for your organisation's authorised technical and on-call staff. Please do not publish it externally, post it in shared or public channels, or pass it to third parties without talking to your Account Manager first.
:::

If you cannot reach Linkiir on the 24/7 number, use the alternative emergency contact method identified in your Linkiir onboarding materials or your customer agreement.

---

## Initial response target

For an eligible urgent production issue reported through the approved 24/7 channel, Linkiir's target for **initial human ownership and engagement is 30 minutes**.

Within that window Linkiir works to:

- receive and register your request;
- assign a named Linkiir responder to it; and
- begin the urgent production support process.

Thirty minutes is an **engagement** target, not a resolution time. How long a fix takes depends on the cause, your environment, infrastructure dependencies, access requirements, and the remediation involved.

Where your signed agreement defines different support terms, the signed agreement takes precedence over this page.

---

## What qualifies

Use the 24/7 number for broad Linkiir **production availability** failures:

- The Linkiir production server or platform is down.
- Linkiir Runtime cannot start, or repeatedly crashes.
- Linkiir Log Archiver cannot start, or repeatedly crashes, and production logging or audit capability is materially affected.
- The queue infrastructure Linkiir production depends on is unavailable and production processing has stopped.
- Linkiir Studio, Grid, or another core platform service is unavailable and this materially prevents production operation.
- Linkiir monitoring or notification capability is unavailable in a way that materially affects production operations.
- HA failover has failed and production service is unavailable.
- A broad Linkiir production processing outage is affecting your environment.

The test is **production platform impact**. An error message on its own, however alarming it looks, is not the test.

## What does not qualify

The 24/7 channel is not for routine or localised issues, even urgent-feeling ones:

- A single Lua script failing.
- A single workflow that will not start while the rest of the platform is healthy.
- One node or one configuration problem.
- A single message-processing error.
- An HL7, FHIR, or X12 mapping problem.
- A problem in a data source or destination system rather than in Linkiir.
- Anything in a development, test, or UAT environment.
- Help writing or debugging code.
- Product training and how-to questions.
- Feature requests.
- Scheduled implementation work.

All of these belong in [Standard Support](standard-support.md).

### Worked examples

| Situation | 24/7 channel? |
| --- | --- |
| Production Linkiir server is down | **Yes** |
| Runtime cannot start in production | **Yes** |
| Queue outage has stopped broad production processing | **Yes** |
| Production Log Archiver crashing repeatedly with material operational impact | **Yes** |
| HA failover failed and production is unavailable | **Yes** |
| One Lua script is failing | No — Standard Support |
| One workflow has a configuration problem | No — Standard Support |
| One HL7 message failed | No — Standard Support |
| Need help writing a Lua transformation | No — Standard Support |
| A UAT interface does not work | No — Standard Support |
| Training or how-to question | No — Standard Support |

If you genuinely cannot tell which side of the line you are on and production is affected, make the call. Linkiir would rather redirect an eligible-looking request than have a real outage wait until morning.

---

## What to have ready

Four items get a responder engaged. Have them at hand before you call:

```text
1. Your name
2. Your organisation
3. A callback number that will be answered
4. Which Linkiir production service has failed, and the current impact
```

You will be guided through these on the call, so keep each answer short and speak clearly.

If you have them, also be ready with:

- confirmation that the issue affects **PROD**;
- the affected Linkiir service or component;
- the approximate time the failure started;
- whether an infrastructure, configuration, or deployment change happened recently.

Keep this first contact brief. Detailed diagnostics are collected after a responder engages with you.

---

## What happens after you make contact

1. Your request enters the Linkiir 24/7 channel and reaches the on-call responder team.
2. One Linkiir responder takes ownership of it.
3. That responder contacts you on the callback number you provided.
4. Together you confirm the affected production service, the impact, and that it is an eligible urgent production issue.
5. Urgent production response begins, with stabilising production as the first objective.
6. If the issue turns out to be routine rather than a production platform failure, the responder will tell you and move it to Standard Support.

You do not need an incident number or a reference code to use the 24/7 channel. Your organisation name and callback number are enough to identify the request.

Expect diagnostics and remote access to be arranged through an approved secure method once a responder is engaged — not on the initial contact.

---

## Do not disclose sensitive data on the call

The 24/7 line is an **operational alert channel**. It is not a secure clinical-data exchange.

Never read out, dictate, or otherwise disclose:

- patient names or any other PHI;
- production HL7, FHIR, CDA, or X12 payloads;
- screenshots containing patient information;
- passwords;
- API keys or tokens;
- database credentials;
- certificates or private keys;
- full production logs containing sensitive data.

Describe the failure at a high level instead:

```text
Say:
"Production Runtime cannot start after a server reboot."

Never:
"Let me read you the production HL7 message for the affected patient..."
```

No Linkiir responder will ask you for patient data or credentials on this channel, however urgent the outage — see [PHI in Support Requests](phi-policy.md). Linkiir will provide an approved secure method for exchanging diagnostics once a responder is engaged, and [Crash Report Collection](../administration/troubleshooting/crash-report.md) covers what a useful, redacted diagnostic bundle contains.

---

## Your side of it

The 24/7 process depends on a few things from your team:

- Use the channel only for eligible urgent production issues. Misuse dilutes it for everyone.
- Provide the four intake items.
- Give a callback number that will actually be answered.
- Keep a technical contact available for the callback.
- Provide approved remote access when it is required and permitted.
- Move sensitive diagnostics to the secure method Linkiir requests.
- Tell Linkiir when production service has recovered, including when it recovered on your side.

---

## Communications availability

Voice communications depend on telecommunications networks and third-party carriers. Linkiir maintains operational safeguards and tests this channel regularly, but no carrier or communications provider can guarantee that every call connects under every condition.

That is why your onboarding materials include a fallback contact method. Keep it stored alongside the 24/7 number.

---

## Policy review

Linkiir reviews and updates this policy as its support offering evolves. Contractual commitments remain governed by your signed Linkiir customer agreement.

| | |
| --- | --- |
| **Scope** | Critical Linkiir production platform availability issues |
| **Channel** | A phone call to the Linkiir 24/7 support number issued to your organisation |
| **Initial engagement target** | 30 minutes for eligible urgent production issues |
| **How to get the number** | Your Linkiir Account Manager |
| **Everything else** | [Standard Support](standard-support.md) |

---

## Next

- [Standard Support](standard-support.md)
- [Submitting a Support Request](submitting-a-request.md)
- [PHI in Support Requests](phi-policy.md)
- [Linkiir Runtime Crashed](../administration/troubleshooting/runtime-crash.md)
- [High Availability Operations](../high-availability/operations.md)
