---
title: Adapters
description: Prebuilt Linkiir adapters for Epic, Cerner, eCW, ModMed, Athena, PointClickCare, Dexcom CGM, Salesforce, Dynamics 365, AWS S3, Slack, and Azure OpenAI. Configure them with fields, not code.
keywords: [adapters, connectors, integrations, FHIR, EHR, CRM, S3, Slack, Azure OpenAI, PointClickCare, Dexcom, CGM]
---

# Adapters

Adapters are prebuilt Linkiir nodes that connect a workflow to an external system. Each one arrives as a node template plus the code library behind it, so you add it from the palette and fill in fields rather than writing a client from scratch.

You configure credentials, endpoints, and what to fetch or send. The connection work — authentication, token refresh, request signing, retries, error reporting — is already done.

## Requesting the Adapters package

:::info
Adapters are supplied separately from the Linkiir installation. To request them for your environment, email [support@linkiir.com](mailto:support@linkiir.com) with your Linkiir version, your platform, and the systems you need to connect to.

You receive either a **catalog** to subscribe to, which keeps its adapters updatable in place afterwards, or a **project** to import with the templates and libraries already attached to the nodes that use them. See [Catalogs](../catalogs/index.md) and [Project Import and Export](../administration/deployment/import-export.md).
:::

## Available adapters

<div class="lnk-grid">
<a class="lnk-card lnk-card-link" href="/docs/adapters/epic">
  <svg class="lnk-card__icon" viewBox="0 0 32 32" aria-hidden="true">
    <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="6.5" y="5" width="19" height="23" rx="3" />
      <rect x="12" y="2.5" width="8" height="5" rx="2" />
      <path d="M16 14v7" />
      <path d="M12.5 17.5h7" />
    </g>
  </svg>
  <span class="lnk-card__title">Epic</span>
  <span class="lnk-card__body">Poll an Epic FHIR endpoint and push each matching resource downstream.</span>
</a>
<a class="lnk-card lnk-card-link" href="/docs/adapters/cerner">
  <svg class="lnk-card__icon" viewBox="0 0 32 32" aria-hidden="true">
    <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="6.5" y="5" width="19" height="23" rx="3" />
      <rect x="12" y="2.5" width="8" height="5" rx="2" />
      <path d="M16 14v7" />
      <path d="M12.5 17.5h7" />
    </g>
  </svg>
  <span class="lnk-card__title">Cerner</span>
  <span class="lnk-card__body">Poll a Cerner FHIR endpoint using a registered System Account.</span>
</a>
<a class="lnk-card lnk-card-link" href="/docs/adapters/ecw">
  <svg class="lnk-card__icon" viewBox="0 0 32 32" aria-hidden="true">
    <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="6.5" y="5" width="19" height="23" rx="3" />
      <rect x="12" y="2.5" width="8" height="5" rx="2" />
      <path d="M16 14v7" />
      <path d="M12.5 17.5h7" />
    </g>
  </svg>
  <span class="lnk-card__title">eClinicalWorks</span>
  <span class="lnk-card__body">Poll an eCW FHIR endpoint, with its separate authorization server.</span>
</a>
<a class="lnk-card lnk-card-link" href="/docs/adapters/modmed">
  <svg class="lnk-card__icon" viewBox="0 0 32 32" aria-hidden="true">
    <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="6.5" y="5" width="19" height="23" rx="3" />
      <rect x="12" y="2.5" width="8" height="5" rx="2" />
      <path d="M16 14v7" />
      <path d="M12.5 17.5h7" />
    </g>
  </svg>
  <span class="lnk-card__title">ModMed</span>
  <span class="lnk-card__body">Poll a ModMed FHIR endpoint with an API key and account credentials.</span>
</a>
<a class="lnk-card lnk-card-link" href="/docs/adapters/athena">
  <svg class="lnk-card__icon" viewBox="0 0 32 32" aria-hidden="true">
    <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="6.5" y="5" width="19" height="23" rx="3" />
      <rect x="12" y="2.5" width="8" height="5" rx="2" />
      <path d="M16 14v7" />
      <path d="M12.5 17.5h7" />
    </g>
  </svg>
  <span class="lnk-card__title">Athena Health</span>
  <span class="lnk-card__body">Poll the Athena Health platform for a practice and push each patient found.</span>
</a>
<a class="lnk-card lnk-card-link" href="/docs/adapters/dexcom">
  <svg class="lnk-card__icon" viewBox="0 0 32 32" aria-hidden="true">
    <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 17h5l3-6 4 12 3.5-9 2.5 5h8" />
    </g>
  </svg>
  <span class="lnk-card__title">Dexcom CGM</span>
  <span class="lnk-card__body">Authorize a Dexcom account and read continuous glucose values on a timer.</span>
</a>
<a class="lnk-card lnk-card-link" href="/docs/adapters/pointclickcare">
  <svg class="lnk-card__icon" viewBox="0 0 32 32" aria-hidden="true">
    <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="4.5" y="9" width="23" height="19" rx="3" />
      <path d="M11 9V6a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v3" />
      <path d="M16 15v7" />
      <path d="M12.5 18.5h7" />
    </g>
  </svg>
  <span class="lnk-card__title">PointClickCare</span>
  <span class="lnk-card__body">Authenticate with two-legged OAuth and call any PointClickCare endpoint.</span>
</a>
<a class="lnk-card lnk-card-link" href="/docs/adapters/salesforce">
  <svg class="lnk-card__icon" viewBox="0 0 32 32" aria-hidden="true">
    <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="11" r="4.2" />
      <path d="M4.5 26c0-4.4 3.4-7.6 7.5-7.6s7.5 3.2 7.5 7.6" />
      <circle cx="22.8" cy="12.6" r="3.1" />
      <path d="M20.4 19.4c4 0 7.1 2.7 7.1 6.6" />
    </g>
  </svg>
  <span class="lnk-card__title">Salesforce</span>
  <span class="lnk-card__body">Query and update Salesforce records over the REST API from a script node.</span>
</a>
<a class="lnk-card lnk-card-link" href="/docs/adapters/dynamics-365">
  <svg class="lnk-card__icon" viewBox="0 0 32 32" aria-hidden="true">
    <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="11" r="4.2" />
      <path d="M4.5 26c0-4.4 3.4-7.6 7.5-7.6s7.5 3.2 7.5 7.6" />
      <circle cx="22.8" cy="12.6" r="3.1" />
      <path d="M20.4 19.4c4 0 7.1 2.7 7.1 6.6" />
    </g>
  </svg>
  <span class="lnk-card__title">Dynamics 365</span>
  <span class="lnk-card__body">Poll Microsoft Dynamics 365 CRM on a schedule with a FetchXML query.</span>
</a>
<a class="lnk-card lnk-card-link" href="/docs/adapters/aws-s3">
  <svg class="lnk-card__icon" viewBox="0 0 32 32" aria-hidden="true">
    <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9.8 25h12.7a5.6 5.6 0 0 0 .6-11.2 7.6 7.6 0 0 0-14.4 1.7A4.8 4.8 0 0 0 9.8 25z" />
    </g>
  </svg>
  <span class="lnk-card__title">AWS S3</span>
  <span class="lnk-card__body">Poll a bucket for new objects, upload messages as objects, and browse a bucket.</span>
</a>
<a class="lnk-card lnk-card-link" href="/docs/adapters/slack">
  <svg class="lnk-card__icon" viewBox="0 0 32 32" aria-hidden="true">
    <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 5h16a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5h-7l-6 4.6V23H8a5 5 0 0 1-5-5v-8a5 5 0 0 1 5-5z" />
    </g>
  </svg>
  <span class="lnk-card__title">Slack</span>
  <span class="lnk-card__body">Post workflow messages and alerts into a Slack channel.</span>
</a>
<a class="lnk-card lnk-card-link" href="/docs/adapters/azure-openai">
  <svg class="lnk-card__icon" viewBox="0 0 32 32" aria-hidden="true">
    <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12.8 4.5l2.2 6.1 6.1 2.2-6.1 2.2-2.2 6.1-2.2-6.1L4.5 12.8l6.1-2.2z" />
      <path d="M23.2 19.5l1.2 3.3 3.3 1.2-3.3 1.2-1.2 3.3-1.2-3.3-3.3-1.2 3.3-1.2z" />
    </g>
  </svg>
  <span class="lnk-card__title">Azure OpenAI</span>
  <span class="lnk-card__body">Send message content to a model deployment and route the response downstream.</span>
</a>
<a class="lnk-card lnk-card-link" href="/docs/adapters/fhir-resource-creator">
  <svg class="lnk-card__icon" viewBox="0 0 32 32" aria-hidden="true">
    <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8.5 4h9l6 6v18a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
      <path d="M17.5 4v6h6" />
      <path d="M11.5 18h9" />
      <path d="M11.5 23h6" />
    </g>
  </svg>
  <span class="lnk-card__title">FHIR Resource Creator</span>
  <span class="lnk-card__body">Turn inbound patient data into a clean FHIR R4 Patient resource.</span>
</a>
<a class="lnk-card lnk-card-link" href="/docs/adapters/fhir-profiling-tools">
  <svg class="lnk-card__icon" viewBox="0 0 32 32" aria-hidden="true">
    <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8.5 4h9l6 6v18a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
      <path d="M17.5 4v6h6" />
      <path d="M11.5 18h9" />
      <path d="M11.5 23h6" />
    </g>
  </svg>
  <span class="lnk-card__title">FHIR Profiling Tools</span>
  <span class="lnk-card__body">Browse FHIR resources and get a JSON template for any of them.</span>
</a>
</div>

## By category

| Adapter | Connects to | Palette group | Library |
| --- | --- | --- | --- |
| [Epic](epic.md) | Epic FHIR endpoint | Source Custom | `epic_fhir` |
| [Cerner](cerner.md) | Cerner FHIR endpoint | Source Custom | `cerner_fhir` |
| [eClinicalWorks](ecw.md) | eCW FHIR endpoint | Source Custom | `ecw_fhir` |
| [ModMed](modmed.md) | ModMed FHIR endpoint | Source Custom | `modmed_fhir` |
| [Athena Health](athena.md) | Athena Health platform | Source Custom | `athena_health` |
| [Dexcom CGM](dexcom.md) | Dexcom CGM account | Source HTTP, Source Custom | `dexcom_cgm` |
| [PointClickCare](pointclickcare.md) | PointClickCare organization | Source Custom, Transform Custom | `pcc_api` |
| [Salesforce](salesforce.md) | Salesforce REST API | Transform Custom | `salesforce` |
| [Dynamics 365](dynamics-365.md) | Microsoft Dynamics 365 CRM | Source Custom | `dynamics_crm` |
| [AWS S3](aws-s3.md) | S3 and S3-compatible storage | Source Custom, Transform Custom, Source HTTP | `aws_s3` |
| [Slack](slack.md) | Slack workspace | Transform Custom | `slack` |
| [Azure OpenAI](azure-openai.md) | Azure OpenAI deployment | Transform Custom | `azure_openai` |
| [FHIR Resource Creator](fhir-resource-creator.md) | Nothing — local transformation | Transform Custom | `fhir_resource` |
| [FHIR Profiling Tools](fhir-profiling-tools.md) | Nothing — local HTTP service | Source HTTP | `fhir_profiling` |

## Start here

| If you want to | Read |
| --- | --- |
| Understand how an adapter is delivered and configured | [How Adapters Work](how-adapters-work.md) |
| Pull patient data from an EHR | [Epic](epic.md), [Cerner](cerner.md), [eClinicalWorks](ecw.md), [ModMed](modmed.md), [Athena Health](athena.md) |
| Read glucose data from a CGM device | [Dexcom CGM](dexcom.md) |
| Read or write records in long-term care | [PointClickCare](pointclickcare.md) |
| Read or write records in a CRM | [Salesforce](salesforce.md), [Dynamics 365](dynamics-365.md) |
| Move messages through object storage | [AWS S3](aws-s3.md) |
| Send an alert to a channel | [Slack](slack.md) |
| Send message content to a model | [Azure OpenAI](azure-openai.md) |
| Build or inspect FHIR resources locally | [FHIR Resource Creator](fhir-resource-creator.md), [FHIR Profiling Tools](fhir-profiling-tools.md) |

## What every adapter has in common

- **Fields, not code.** Endpoints, credentials, and what to fetch are node configuration. See [How Adapters Work](how-adapters-work.md).
- **Live Mode.** A switch that lets the node authenticate and log what it would send, without sending it. Use it for the first run of every adapter.
- **Verify TLS on by default.** Certificate verification stays on unless you deliberately turn it off for a local test proxy.
- **Secrets stored as masked fields.** Passwords, API keys, and secret keys are encrypted in the project and never written to logs. Private keys stay on disk and are referenced by path.
- **Errors in the node log.** Each adapter reports a stable error code and a readable message, listed on its page.

:::caution[Build against a sandbox first]
Point a new adapter at the vendor's sandbox or test environment, with synthetic data, before connecting it to production. See [Sample Code](../interface-development/sample-code/index.md) for the practices the demo interfaces follow.
:::

## Next

- [How Adapters Work](how-adapters-work.md)
- [Interfaces and Core Nodes](../interface-development/interfaces/index.md)
- [Project Settings](../administration/configurations/project-settings.md)
