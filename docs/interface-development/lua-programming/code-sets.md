---
title: Code Sets
---

# Code Sets

Code sets — code tables — live inside a schema file and give a coded field's permitted values and their meanings. `linkiir.data.codeset` reads them, and cross-maps them, so you can translate coded values between HL7 versions or between a source and a destination that define the same concept differently.

The full signatures are in [Message and Data](../../api/scripting-api/message-data.md). This page is about how to use them.

---

## Loading a code set

```lua
local codeset = linkiir.data.codeset

local Sex = codeset.get{ schema = 'demo.json', table = '0001' }
if Sex then
   print(Sex:desc('F'))   -- "Female"
end
```

`get` returns `nil` when the table ID is not in the schema, so you can branch on it without `pcall`. The schema path resolves against the node directory, the same way `linkiir.data.extract` resolves one, and the file is read once per process and cached — calling `get` repeatedly costs nothing after the first time.

A loaded code set answers three questions:

| Call | Gives |
| --- | --- |
| `Sex:codes()` | Every code value, in schema order |
| `Sex:pairs()` | An iterator of code/description pairs |
| `Sex:desc(code)` | One code's description, or `nil` |

---

## Mapping between two code sets

`match` compares two code sets by description and returns a plain Lua table of `sourceValue → destValue`. Comparison is case-insensitive and collapses whitespace. A source code whose description has no counterpart is **omitted**, not mapped to `nil`, so give the lookup a fallback:

```lua
local codeset = linkiir.data.codeset

local SourceSex = codeset.get{ schema = 'sourcedemo.json', table = '0001' }
local DestSex   = codeset.get{ schema = 'destdemo.json',   table = '0001' }
local Sex = codeset.match(SourceSex, DestSex)

Out.PID[8] = Sex[Msg.PID[8]:value()] or 'U'   -- fallback for unmapped codes
```

Cross-format mapping stays your decision. `match` automates the common case — the codes both sides describe the same way — and leaves the rest to you.

---

## A workflow that suits it

Code set mapping works well in two phases.

**Discovery, while developing.** Generate the mapping and print it, to see which codes matched and which did not.

```lua
local codeset = linkiir.data.codeset
local SRC, DST = 'source.json', 'dest.json'

local SourceSex = codeset.get{ schema = SRC, table = '0001' }
local DestSex   = codeset.get{ schema = DST, table = '0001' }
local Sex = codeset.match(SourceSex, DestSex)

for src, dst in pairs(Sex) do
   print(string.format('  %s -> %s', src, dst))
end
```

**Production.** Copy the printed mapping into the script as a literal table and fill in the gaps by hand. The script then no longer depends on the schema's code set section at run time, and the overrides are visible to whoever reads it next.

```lua
local Sex = {
   ["F"] = "F",
   ["M"] = "M",
   ["O"] = "O",
   ["U"] = "U",
   ["A"] = "U",   -- v2.5 Ambiguous has no v2.3 equivalent
   ["N"] = "U",   -- v2.5 Not applicable has no v2.3 equivalent
}

Out.PID[8] = Sex[Msg.PID[8]:value()] or 'U'
```

That gives you an auto-generated baseline while building and full control once it is live.

---

## Notes

- Code sets are the `tables` section of the schema JSON, populated when you add them through the Schema Editor — which opens on the Scripting page when you open a schema file.
- A code set that exists in one schema and not the other is a mapping you have to write yourself; `match` can only join what both sides describe.
- Print, or log, the codes you drop to a fallback. A silent default hides a feed that has started sending values you never mapped.

---

## Next

- [Message and Data](../../api/scripting-api/message-data.md) — `linkiir.data.codeset` signatures in full
- [Demo: HL7 LLP to Scripting to LLP](../sample-code/hl7-llp-scripting-llp.md)
- [Testing and Debugging Lua](testing-debugging.md)
