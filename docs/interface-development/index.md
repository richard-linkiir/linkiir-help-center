---
title: Interface Development
---

# Interface Development

Everything you need to build a Linkiir interface: how projects are structured, which node types to use, how to write and test Lua, and how to handle failure.

```text
Project → Workflow → Node
```

## Start here

| If you want to | Read |
| --- | --- |
| Understand the structure you build within | [How Interfaces Are Organized](architecture.md) |
| Pick and configure a transport | [Interfaces and Core Nodes](interfaces/index.md) |
| Write transformation logic | [Lua Programming](lua-programming/index.md) |
| Copy a complete working interface | [Sample Code](sample-code/index.md) |
| Connect to an EHR, CRM, cloud store, or AI service | [Adapters](../adapters/index.md) |
| Decide what stops a feed and what does not | [Error Handling and Retry](error-handling.md) |

New to Linkiir? [Getting Started](../getting-started/index.md) builds a working HTTP interface step by step first.

## The shape of an interface

```text
Source  →  Transform  →  Destination
```

You configure transports with fields and write Lua only where the logic is yours — HTTP handling, transformation, and generated or fetched messages.

| Palette group | Node | Role |
| --- | --- | --- |
| Source | HTTP | Receive HTTP requests |
| Source | LLP | Receive HL7 v2 over MLLP |
| Source | File/FTP | Poll a directory or FTP/FTPS/SFTP server |
| Source | Custom | Fetch or generate messages on a timer |
| Transform | Custom | Process each inbound message |
| Destination | File/FTP | Write files, locally or over FTP/FTPS/SFTP |
| Destination | LLP | Send HL7 v2 over MLLP with ACK handling |

## Reference

- [How Interfaces Are Organized](architecture.md)
- [Interfaces and Core Nodes](interfaces/index.md)
  - [Source Nodes](interfaces/source-nodes.md)
  - [Destination Nodes](interfaces/destination-nodes.md)
  - [Custom Scripting Nodes](interfaces/custom-scripting-nodes.md)
- [Sample Code](sample-code/index.md)
  - [Demo: HTTP Source to File](sample-code/http-source-demo.md)
  - [Demo: HL7 LLP to Scripting to LLP](sample-code/hl7-llp-scripting-llp.md)
- [Adapters](../adapters/index.md)
  - [How Adapters Work](../adapters/how-adapters-work.md)
- [Lua Programming](lua-programming/index.md)
  - [Linkiir Scripting API](../api/scripting-api/index.md)
  - [Testing and Debugging Lua](lua-programming/testing-debugging.md)
- [Error Handling and Retry](error-handling.md)
