---
title: Migrating Existing Interfaces
---

# Migrating Existing Interfaces

Bringing interfaces from another integration engine into Linkiir means mapping their structure onto Linkiir's model and getting their scripts running.

The goal is to preserve observable behaviour: the same messages in, the same messages out, the same acknowledgments.

## Map the structure

Most integration engines organise work in units that translate cleanly:

| What you have | Linkiir equivalent |
| --- | --- |
| A channel or interface | A workflow |
| A component or stage within it | A node |
| A group of related channels | A project |
| A transformation or translation script | A Transform Custom node |
| A message definition or grammar file | A Linkiir schema in the node's directory |
| A connection between components | A connection you draw in the workflow editor |
| Environment-specific values | Linkiir configuration and credential settings |

Start by drawing each existing interface as a source, a transform, and a destination. That shape usually maps one-to-one.

## Get existing scripts running

Linkiir ships a compatibility adapter that provides the global namespaces used by legacy engine scripts — names such as `hl7`, `x12`, `json`, `xml`, `net`, `db`, `queue`, and `util` — implemented on top of the native Linkiir API.

Load it at the top of the script:

```lua
require "legacy_adapter"

function main(Data)
   local Msg = hl7.parse{ schema = "adt.json", data = Data }
   queue.push{ data = Msg:S() }
end
```

Without that line, only the `linkiir.*` API exists.

Use the adapter to get an interface working with minimal edits, then move to the native API as you touch each script. The complete name mapping is in [Linkiir Scripting API](../../api/scripting-api/index.md).

:::note[Message definitions need converting]
Linkiir uses JSON schema files rather than the binary message-definition formats used by some engines. Existing definitions need converting to Linkiir schemas before `hl7.parse` or `linkiir.data.extract` can use them. Plan for this — it is usually the longest step.
:::

## Classify each dependency before you start

Go through every script and configuration item and put it in one bucket:

| Bucket | Meaning | Effort |
| --- | --- | --- |
| **Native** | A direct Linkiir equivalent exists | Configuration only |
| **Compatible** | Works through the adapter | Minimal edits |
| **Needs redesign** | No equivalent; the approach must change | Plan properly |

Do this before committing to a timeline. The "needs redesign" list is what determines how long a migration takes, and finding it in week one is much cheaper than finding it during cutover.

Common items that need redesign:

- Engine-specific runtime or logging APIs with no Linkiir counterpart.
- Custom plugins or native extensions.
- Interactive or UI-driven behaviour embedded in scripts.
- Scripts relying on shared mutable state between messages.

## Migration process

1. **Inventory.** List every interface, endpoint, script, shared module, schema, schedule, and credential.
2. **Classify.** Sort every dependency into native, compatible, or needs-redesign.
3. **Build in DEV.** Recreate one interface as a project, workflow, and nodes. Convert its schemas.
4. **Bind credentials.** Configure them in Linkiir. Do not carry secrets across in script files.
5. **Compare outputs.** Run the same input through both systems and diff the output byte for byte.
6. **Validate behaviour.** Check acknowledgments, retries, ordering, error handling, and file naming — not just the happy path.
7. **Run in parallel.** Have both systems process live traffic, with only the legacy system delivering.
8. **Cut over one interface at a time.** Keep rollback available until each is stable.

### Comparing outputs properly

Step 5 is where migrations succeed or fail. Diff the actual output, not a visual inspection.

Pay attention to:

| Detail | Why it bites |
| --- | --- |
| Trailing segment separators and line endings | Some receivers reject a message over a `\r` versus `\r\n` difference |
| Character encoding | Shows up only on accented names, often a small minority of patients |
| Empty versus absent fields | An empty field and a missing one are not the same to a strict receiver |
| Field padding and date formats | Silently accepted, then wrong in the receiving system |
| ACK content | A receiver may parse more of it than you expect |

Use the same set of real-shaped test messages against both systems, including the awkward ones.

## Start with the right interface

Pick a first migration that teaches you the platform without risk:

**Good first candidate:** moderate volume, one source and one destination, a transformation you understand, and a receiver that tolerates a test message.

**Poor first candidate:** your highest-volume feed, anything with complex acknowledgment logic, or an interface nobody currently understands.

## Keep both systems until you are sure

Run parallel long enough to cover a full business cycle, including a month-end or overnight batch if those behave differently. Keep the legacy interface stopped-but-restorable rather than deleted until the Linkiir version has been stable in production.

## Next

- [Linkiir Scripting API](../../api/scripting-api/index.md) — the legacy-to-native name mapping.
- [Deployment](../deployment/index.md) — DEV, TEST, and PROD practice.
- [Project Import and Export](../deployment/import-export.md) — moving a project between environments.
