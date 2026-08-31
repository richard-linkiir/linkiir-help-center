---
title: Linkiir Documentation
description: Install Linkiir, build your first interface, and operate it in production. Node reference, Lua scripting API, deployment, licensing, and troubleshooting.
slug: /
---

# Linkiir Documentation

Linkiir is a healthcare integration platform for designing, testing, deploying, and monitoring interfaces across HL7 v2, X12, APIs, files, and other healthcare data formats.

## New to Linkiir?

[**Getting Started**](getting-started/index.md) takes you from a downloaded package to a running interface in three steps:

1. [Download and install](getting-started/quick-install.md) — macOS Docker bundle, Windows installer, or Linux.
2. [Reset the admin user](getting-started/first-login.md) — set the administrator password.
3. [Import the Linkiir Demo Project](getting-started/demo-project.md) — four ready-made workflows that generate HL7, move it over LLP, store it, and serve it back as JSON.

About 20 minutes on a local machine.

## Documentation areas

<div class="lnk-grid">

<a class="lnk-card lnk-card-link" href="/docs/getting-started/">
  <svg class="lnk-card__icon" viewBox="0 0 32 32" aria-hidden="true">
    <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="16" cy="16" r="12.5" />
      <path d="M13.4 10.9L22 16l-8.6 5.1z" />
    </g>
  </svg>
  <span class="lnk-card__title">Getting Started</span>
  <span class="lnk-card__body">Install Linkiir and build your first interface.</span>
</a>

<a class="lnk-card lnk-card-link" href="/docs/interface-development/">
  <svg class="lnk-card__icon" viewBox="0 0 32 32" aria-hidden="true">
    <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10.3 9.6l11.5 5.6" />
      <path d="M10.3 22.4l11.5-5.6" />
      <circle cx="6.6" cy="8" r="3.4" />
      <circle cx="6.6" cy="24" r="3.4" />
      <circle cx="25.4" cy="16" r="3.4" />
    </g>
    <circle cx="25.4" cy="16" r="1.4" fill="currentColor" />
  </svg>
  <span class="lnk-card__title">Interface Development</span>
  <span class="lnk-card__body">Node types and their fields, Lua scripting, sample interfaces, error handling.</span>
</a>

<a class="lnk-card lnk-card-link" href="/docs/adapters/">
  <svg class="lnk-card__icon" viewBox="0 0 32 32" aria-hidden="true">
    <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M13.5 3.5v6" />
      <path d="M18.5 3.5v6" />
      <path d="M9.5 9.5h13v5a6.5 6.5 0 0 1-6.5 6.5A6.5 6.5 0 0 1 9.5 14.5z" />
      <path d="M16 21v7.5" />
    </g>
  </svg>
  <span class="lnk-card__title">Adapters</span>
  <span class="lnk-card__body">Prebuilt connectors for EHR, CRM, cloud storage, messaging, and AI systems.</span>
</a>
<a class="lnk-card lnk-card-link" href="/docs/administration/">
  <svg class="lnk-card__icon" viewBox="0 0 32 32" aria-hidden="true">
    <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3.5" y="4" width="25" height="6.5" rx="3.25" />
      <rect x="3.5" y="13" width="25" height="6.5" rx="3.25" />
      <rect x="3.5" y="22" width="25" height="6.5" rx="3.25" />
    </g>
    <g fill="currentColor">
      <circle cx="8.2" cy="7.25" r="1.5" />
      <circle cx="8.2" cy="16.25" r="1.5" />
      <circle cx="8.2" cy="25.25" r="1.5" />
    </g>
  </svg>
  <span class="lnk-card__title">Administration</span>
  <span class="lnk-card__body">Licensing, upgrades, deployment environments, configuration, backups, security, troubleshooting.</span>
</a>

<a class="lnk-card lnk-card-link" href="/docs/high-availability/">
  <svg class="lnk-card__icon" viewBox="0 0 32 32" aria-hidden="true">
    <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3.5" y="6" width="11" height="20" rx="2.5" />
      <rect x="17.5" y="6" width="11" height="20" rx="2.5" />
      <path d="M9 11v10" />
      <path d="M23 11v10" />
    </g>
  </svg>
  <span class="lnk-card__title">High Availability</span>
  <span class="lnk-card__body">Active/standby pairs, topologies, system requirements, backup and disaster recovery.</span>
</a>
<a class="lnk-card lnk-card-link" href="/docs/faq/">
  <svg class="lnk-card__icon" viewBox="0 0 32 32" aria-hidden="true">
    <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 5h16a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5h-7l-6 4.6V23H8a5 5 0 0 1-5-5v-8a5 5 0 0 1 5-5z" />
      <path d="M12.9 11.4a3.2 3.2 0 1 1 3.2 3.2v1.5" />
    </g>
    <circle cx="16.1" cy="19.4" r="1.35" fill="currentColor" />
  </svg>
  <span class="lnk-card__title">FAQ</span>
  <span class="lnk-card__body">Queue and database choices, and day-to-day operating practice.</span>
</a>

<a class="lnk-card lnk-card-link" href="/docs/support/">
  <svg class="lnk-card__icon" viewBox="0 0 32 32" aria-hidden="true">
    <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6.5 19v-3a9.5 9.5 0 0 1 19 0v3" />
      <path d="M6.5 16.5H8a1.5 1.5 0 0 1 1.5 1.5v4A1.5 1.5 0 0 1 8 23.5H6.5A2.5 2.5 0 0 1 4 21v-2a2.5 2.5 0 0 1 2.5-2.5z" />
      <path d="M25.5 16.5H24a1.5 1.5 0 0 0-1.5 1.5v4a1.5 1.5 0 0 0 1.5 1.5h1.5A2.5 2.5 0 0 0 28 21v-2a2.5 2.5 0 0 0-2.5-2.5z" />
      <path d="M25.5 23.5V25a3.5 3.5 0 0 1-3.5 3.5h-4" />
    </g>
  </svg>
  <span class="lnk-card__title">Support</span>
  <span class="lnk-card__body">Open a ticket by email or the support portal, and the 24/7 urgent production support policy.</span>
</a>

</div>

## Common tasks

| I want to | Go to |
| --- | --- |
| Install on Windows | [Install on Windows](administration/installation/windows.md) |
| Install on macOS | [Install on macOS](administration/installation/macos.md) |
| Recover a lost administrator password | [Reset the Admin User](getting-started/first-login.md) |
| Receive HL7 v2 over MLLP | [Source Nodes](interface-development/interfaces/source-nodes.md) |
| Connect to Epic, Cerner, Salesforce, S3, or Slack | [Adapters](adapters/index.md) |
| Look up a Lua function | [Linkiir Scripting API](api/scripting-api/index.md) |
| Test a script before starting a node | [Testing and Debugging Lua](interface-development/lua-programming/testing-debugging.md) |
| Copy a complete working interface | [Sample Code](interface-development/sample-code/index.md) |
| Connect my own Kafka cluster | [Kafka Configuration](administration/configurations/kafka-redpanda.md) |
| Understand High Availability and pick a topology | [High Availability](high-availability/index.md) |
| Find out why messages are not arriving | [Troubleshooting](administration/troubleshooting/index.md) |
| Move a project between environments | [Project Import and Export](administration/deployment/import-export.md) |
| Open a support ticket | [Standard Support](support/standard-support.md), or the [support portal](https://linkiir.atlassian.net/servicedesk/customer/portals) |
| Report a critical production outage | [24/7 Urgent Production Support](support/urgent-production-support.md) |

:::info[Documentation status]
Licensing and Notifications content is marked where commercial policy or feature availability is not yet finalized. Confirm against the release notes for your version.
:::
