---
title: FHIR Resource Creator
description: Use the Linkiir FHIR Resource Creator node to turn inbound patient data into a clean FHIR R4 Patient resource.
keywords: [FHIR, R4, Patient resource, adapter, transform]
---

# FHIR Resource Creator

A **Transform Custom** node that maps inbound patient data onto a FHIR R4 Patient resource and pushes it downstream as JSON.

Part of the Linkiir Adapters package — see [requesting the package](index.md#requesting-the-adapters-package).

## What it does

When a message arrives, the node maps its fields onto a FHIR R4 Patient template, removes every field the message did not populate, and pushes the result. What comes out is a valid Patient resource with no empty scaffolding left in it.

```text
upstream node  →  FHIR Resource Creator  →  your next node
```

No network calls and no credentials: this is a local transformation, so it runs the same in DEV as in PROD and has nothing to authenticate.

## Where it fits

Pair it with an adapter or a transport node that produces structured patient data, then send the resource on to whatever consumes FHIR.

| Upstream | Downstream |
| --- | --- |
| An HL7 v2 feed already mapped to fields | An HTTP call to a FHIR server |
| A database query | A file written for a downstream system |
| A CRM adapter | Another transform that adds more resources |

## Set it up

1. Add the **FHIR Resource Creator** node to a workflow from the palette, or open the supplied one.
2. Connect the node producing your patient data to its input.
3. Connect the node that should receive the resource to its output.
4. Send one message through with **Run Test** on the upstream node, then start both nodes.

## Configuration reference

This node has no configuration fields. Everything it needs comes from the inbound message, so what it produces is controlled by what you send it.

To change which fields land where, edit the node's own script — the mapping lives there rather than in configuration. See [Custom Scripting Nodes](../interface-development/interfaces/custom-scripting-nodes.md).

## Verify it worked

- The downstream node receives JSON with `resourceType` set to `Patient`.
- Fields your message did not supply are absent from the output, not present and null.
- Sending the same message twice produces identical output.

## If it didn't work

| Symptom | Cause | Fix |
| --- | --- | --- |
| The node errors on a parse | The inbound message is not the structured data the mapping expects | Check what the upstream node emits; add a transform ahead of it if the shape differs |
| Expected fields are missing from the resource | The message did not carry them, so they were stripped | Confirm the upstream node populates them |
| Output still contains empty values | Those fields were populated with empty strings rather than left unset | Leave them unset upstream |

## Next

- [FHIR Profiling Tools](fhir-profiling-tools.md) — get a JSON template for any FHIR resource
- [How Adapters Work](how-adapters-work.md)
- [Custom Scripting Nodes](../interface-development/interfaces/custom-scripting-nodes.md)
