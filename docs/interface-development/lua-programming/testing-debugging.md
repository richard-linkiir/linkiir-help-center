---
title: Testing and Debugging Lua
---

# Testing and Debugging Lua

The script editor runs your code against a sample without opening a port, consuming a real message, or sending anything to a destination. Use it before you start a node.

## Run Test or Debug?

| | **Run Test** | **Debug** |
| --- | --- | --- |
| Button | Blue **Run Test** | Grey **Debug**, bug icon |
| Breakpoints | Ignored | Honoured — execution pauses |
| Execution | Runs to completion | Pauses and steps |
| Variables shown | Final locals of `main` | Locals of the paused frame |
| Call stack | Not shown | Full stack, frames selectable |

Reach for Run Test first. It answers "does this parse, and what did it produce?" in one click. Switch to Debug when you need to know *why* a value is what it is.

---

## Create samples first

Both modes run against a sample, so you need at least one.

1. Open the **Samples** panel in the Scripting tab.
2. Add a sample and paste the content your node would actually receive.

What a sample contains depends on the node type:

| Node type | Sample content |
| --- | --- |
| Source HTTP | A complete raw HTTP request: request line, headers, blank line, body |
| Source LLP | An HL7 v2 message |
| Transform Custom | The message the upstream node produces |

A Source HTTP sample looks like this — the blank line before the body is required:

```text
POST /intake HTTP/1.1
Host: 127.0.0.1:9001
Content-Type: application/json

{"patientId":"TEST-1001","status":"active"}
```

Samples persist with the node, so they travel with the interface and are available to whoever maintains it next.

:::caution[Use synthetic data]
Samples are stored with the project and are visible to anyone who can open the node. Use clearly fake identifiers — `TEST000001`, `TEST^PATIENT`, `19700101` — never real patient data.
:::

---

## Run Test

1. Select a sample from the toolbar dropdown.
2. Click **Run Test**.

The Debug panel shows every local variable as it stood at the end of `main`, plus anything your script printed.

Use it to confirm:

- The script compiles.
- Parsing produced the tree you expected.
- Field mappings landed in the right places.
- Your `print` output shows the path the script took.

---

## Debug

1. Click the editor gutter, left of the line numbers, to place breakpoints. Any open file works — `main.lua` or a module it requires.
2. Select a sample.
3. Click **Debug**.

Execution starts at `main` and pauses at the first breakpoint. From there:

| Control | Does |
| --- | --- |
| **Continue** | Run to the next breakpoint, or to the end |
| **Step Over** | Next line in the current function |
| **Step Into** | First line of the function being called |
| **Step Out** | Run until the current function returns |
| **Stop** | End the session immediately |

The **Call Stack** lists the active frames, such as `mapPID @ mapping.lua:16`. Click a frame to inspect its variables; the editor jumps to that file and line. Step Into switches files automatically.

Variables always reflect the **paused frame**, not the end of `main`. That is the point: it is how you catch a value that is correct at the end but wrong in the middle.

### Reading the variables tree

- Branches are collapsed by default. Expand what you need.
- **Hide empty** is on by default and prunes branches with no values — useful with HL7, where most of a schema is unpopulated.
- Message trees show schema names: segments as `PID`, fields as `[5] Name`, down to the leaf value.

Turn **Hide empty** off when you are checking that a field really is empty rather than simply mis-navigated.

---

## Nothing leaves a test

In both modes, `linkiir.flow.push` is forced into non-live mode. It validates your arguments and returns a placeholder message ID, but writes nothing. You cannot accidentally produce a real message from the editor.

This is worth knowing when reading test output: a push that "succeeded" in Run Test confirms the call is well-formed, not that delivery works. Verify delivery by starting the node.

:::warning[Outbound calls are real]
Only queue output is contained. `linkiir.link.web.post`, `linkiir.link.mail.send`, and `linkiir.store` calls execute for real during a test.

Point them at test endpoints while developing, or pass `live = false` to the `linkiir.link` calls that accept it.
:::

---

## IntelliSense does not run your script

Completion, hover, and signature help come from the API definitions, your schema, and the text in the buffer. Typing never executes anything and never reads sample values or live data.

What it gives you:

| Type | Get |
| --- | --- |
| `linkiir.` | Sub-modules, then their functions |
| `Msg.` after `linkiir.data.extract` | Segment names from the schema, with field documentation |
| `Msg:` | Node methods |
| `req.` after `linkiir.link.web.request` | `method`, `path`, `headers`, `body`, and the rest |
| Inside `fn{ … }` | Parameter hints |

Runtime values appear only in the Debug panel. They are never fed back into completion.

---

## A test set worth keeping

Test more than the happy path. Keep a sample for each:

| Sample | Catches |
| --- | --- |
| Normal message | The baseline works |
| Missing required field | Unhandled `nil` |
| Optional segment absent | Navigation assuming a segment exists |
| Repeating field with several repeats | Code reading only the first repeat |
| Unsupported message type | Whether you filter or crash |
| Malformed input | Parse failure handling |
| Largest expected message | Size and performance surprises |
| Unusual characters | Encoding assumptions |

The missing-field and absent-segment samples earn their keep fastest. Most production script failures are an unhandled `nil` from a field that was always present in development.

---

## When a test passes but the node fails

| Symptom | Likely cause |
| --- | --- |
| Node goes to `ERRORED` on start | Compile error in a file you did not test, or a missing `require` |
| Works in test, fails on real traffic | The real message differs from your sample. Capture one from the logs and add it as a sample. |
| Test push succeeds, nothing arrives downstream | Nothing is connected after the node. Check the workflow. |
| Outbound call works in test, fails when running | Credentials or network reachability differ for the service account |

For a message that already went through a running node, open its record in log search and copy the payload into a new sample. Reproducing with the exact payload beats guessing.

---

## Next

- [Linkiir Scripting API](../../api/scripting-api/index.md)
- [Sample Code](../sample-code/index.md)
- [Error Handling and Retry](../error-handling.md)
