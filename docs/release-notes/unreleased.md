---
title: Unreleased — Release Notes
sidebar_label: Unreleased
---

# Unreleased — Release Notes

**Status:** In development

Changes on `main` that have not yet been assigned a release version.

---

## New Features

| # | Feature | Description |
|---|---------|-------------|
| #16 | Catalogs (adapter distribution) | Distribute adapter node templates and shared libraries between grids over a git repository, on any host, or a folder on a mounted share or removable drive for installations with no network route. Subscribe, review an incoming update's diff, and pull it. Nodes built from a catalog adapter stay linked to it and are updated in place, keeping their configuration, wiring, and identity. Catalogs can be created and published from any grid whose repository accepts a push, so one catalog can be maintained from more than one installation. Gated on the new **Manage catalogs** permission. See [Catalogs](../catalogs/index.md). |
| #16 | Bulk adapter and library updates | After a pull, Settings lists every node across the grid whose adapter has a newer release, and every node still on an older version of a library, so a chosen set can be moved forward together. Nodes that cannot be updated are reported and stepped over rather than failing the batch. |
| #16 | Node templates capture the whole node | Creating a template now copies every script the node has and the library versions it pins, not just its entry-point script. Sample messages are excluded by default and included by an explicit toggle, since on a live grid a sample is real traffic. |
| #19 | Schema Editor merged into the Scripting page | Schemas are no longer edited on a separate page. Opening an HL7 v2 or X12 grammar file on the Scripting page shows the Schema Editor's structure view in place of the text editor. |
| — | Format code | A **Format** button and <kbd>Shift</kbd>+<kbd>Alt</kbd>+<kbd>F</kbd> in the Scripting editor. |
| — | Queue retention setting | **Queue Retention (days)** under Settings → Logging, applied to the broker by Linkiir and reconciled at startup. See [Kafka and Redpanda](../administration/configurations/kafka-redpanda.md). |
| — | Resizable node palette | The Builder's node palette can be resized, and filtered by catalog when several are subscribed. |
| — | Monitor filters | The Monitor page filters workflows by **Project**, **Node type**, and **Queue** from controls beside the search box, alongside the existing status tabs and name search. Filters combine, a line above the table reports how many workflows are showing, and the current view is held in the page's address so a narrowed view can be bookmarked or shared. Filtering by node type also narrows an expanded workflow to just the matching nodes. |
| #17 | Configurable producer batching | `LINKIIR_QUEUE_LINGER_MS` trades latency for batching on throughput-bound installations, without a rebuild. The default stays `0`, which is what latency-bound flows such as LLP want. |

## Improvements

| # | Improvement | Description |
|---|---------|-------------|
| #17 | HTTP connection reuse | Outbound `linkiir.link.web.*` calls reuse a connection per thread instead of opening one per call, so HTTP keep-alive survives. Removes a local ephemeral-port ceiling that surfaced as connection failures under sustained load. |
| #16 | Any git host for catalogs | Catalog repositories are no longer restricted to a particular provider. |
| #16 | Published library versions are immutable across collaborators | Publishing checks the project hub rather than only the publisher's own clone, so two collaborators cannot each publish a different version under the same name. Publishing now propagates to other clones immediately. |
| #16 | Pinned libraries carry across project import | Importing a project brings the library versions its nodes pin, so those nodes arrive able to resolve their dependencies. |

## Bug Fixes

| # | Fix | Description |
|---|-----|-------------|
| #21 | Node commits shown under the wrong node | The Scripting page's git history could list commits belonging to a different node. |
| — | Failed node creation left a dead node behind | A node that failed to be created is now cleaned up rather than left in place. |
| — | Scripting page did not load files until refresh | An edge case where a node's files stayed empty until the page was reloaded. |
| — | Default node scripts missing on Linux | The installer did not create the default node scripts. |
| — | File browse path on Linux | Browsing for a file path failed on Linux. |
| — | Library modal display issues | Visual fixes to the library picker. |
| — | Tooltips | Unified tooltip behavior across the site. |
| — | Monitor status tabs matched the wrong thing | **Failed** never matched any workflow, and **On** and **Off** followed each workflow's auto-start setting rather than what it was actually doing. The tabs now match the status shown on the row, and **Failed** covers degraded workflows as well as failed ones. |
| — | **Open in Monitor** did not filter to the project | Opening the Monitor from a project card, a project's workflow panel, or a workflow in the project popup left the page showing every project. It now opens filtered to the project you came from. |
