---
title: Script Globals
---

# Script Globals

`script.globals`

Values and functions available in every script without requiring any module: the script's input payload, the current node directory, and stdlib-style helpers for loading modules and debug printing.

---

## `Data`

*field*

```lua
Data
```

The inbound message/request payload.

The inbound message/request payload passed to `main(Data)`. For Source HTTP nodes this is the raw HTTP request text; for Transform/LLP nodes it is the message body.

**Usage**

```lua
local raw = Data
```

**Returns**

- `string` — the raw inbound payload.

**Example**

```lua
local Raw = Data
print(#Raw)
```


## `require`

*function*

```lua
require(modname)
```

Load a Lua module.

Loads a Lua module. Search path: node dir (including any linked library dependencies, staged there at run time), then the project's common/ dir (shared modules), then system defaults.

**Usage**

```lua
local mod = require "modname"
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `modname` | string | Yes | Module name (e.g. "legacy_adapter"). |

**Returns**

- module table

**Errors**

Raises a Lua error when the module cannot be found.

**Example**

```lua
local Adapter = require('legacy_adapter')
Adapter.transform(Data)
```


## `print`

*function*

```lua
print(...)
```

Print values to stdout.

Prints values to stdout, prefixed with the node ID.

**Usage**

```lua
print(Msg:name(), Msg:count())
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `...` | any | No | Values to print (variadic). |

**Returns**

- nil

**Example**

```lua
print('processing', linkiir.sys.guid(128))
```


## `trace`

*function*

```lua
trace(...)
```

Pretty-print values to stdout.

Pretty-prints values to stdout (legacy debug trace). Recursively expands tables.

**Usage**

```lua
trace(SomeTable)
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `...` | any | No | Values to pretty-print (variadic). |

**Returns**

- nil

**Example**

```lua
trace({ id = 1, items = { 'a', 'b' } })
```


## `type`

*function*

```lua
type(v)
```

Type name of a value.

Returns the type of its only argument, coded as a string: "nil", "boolean", "number", "string", "table", "function", "thread", or "userdata".

**Usage**

```lua
type(v)
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `v` | any | Yes | Value to inspect. |

**Returns**

- string

**Example**

```lua
print(type(Data))     -- "string"
print(type(nil))      -- "nil"
print(type({}))       -- "table"
```


## `tostring`

*function*

```lua
tostring(v)
```

Convert a value to a printable string.

Receives a value of any type and converts it to a string in a reasonable format.

**Usage**

```lua
tostring(v)
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `v` | any | Yes | Value to convert. |

**Returns**

- string

**Example**

```lua
print(tostring(42))     -- "42"
print(tostring(nil))    -- "nil"
```


## `tonumber`

*function*

```lua
tonumber(e [, base])
```

Convert a value to a number.

Tries to convert its argument to a number. If the argument is already a number or a string convertible to a number, returns that number; otherwise returns nil. An optional base (2-36) interprets e as an integer in that base.

**Usage**

```lua
tonumber(e, base)
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `e` | any | Yes | Value to convert. |
| `base` | integer | No | Numeric base (2-36) for string conversion. |

**Returns**

- number, or nil if the conversion fails

**Example**

```lua
print(tonumber('42'))      -- 42
print(tonumber('2A', 16)) -- 42
print(tonumber('abc'))    -- nil
```


## `pairs`

*function*

```lua
pairs(t)
```

Iterate all key/value pairs of a table.

Returns three values (next, t, nil) so that a generic for loop iterates over all key/value pairs of table t, in an undefined order.

**Usage**

```lua
for k, v in pairs(t) do ... end
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `t` | table | Yes | Table to iterate. |

**Returns**

- next, t, nil (for use in a generic for loop)

**Example**

```lua
local Headers = { ['Content-Type'] = 'text/plain', ['X-Id'] = '123' }
for k, v in pairs(Headers) do
   print(k, v)
end
```


## `ipairs`

*function*

```lua
ipairs(t)
```

Iterate the array part of a table in order.

Returns three values so that a generic for loop iterates over the pairs (1, t[1]), (2, t[2]), ..., up to the first nil value.

**Usage**

```lua
for i, v in ipairs(t) do ... end
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `t` | table | Yes | Table (array) to iterate. |

**Returns**

- iterator function, t, 0 (for use in a generic for loop)

**Example**

```lua
local Files = linkiir.sys.fs.list{ path = '/inbound' }
for i, f in ipairs(Files) do
   print(i, f)
end
```


## `next`

*function*

```lua
next(t [, k])
```

Low-level table iterator.

Returns the next key/value pair after key k in table t, in an undefined order; returns nil when there are no more. Called with k = nil (or omitted) returns the first pair. Underlies pairs().

**Usage**

```lua
next(t, k)
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `t` | table | Yes | Table to iterate. |
| `k` | any | No | Previous key; omit to get the first pair. |

**Returns**

- nextKey, nextValue, or nil when exhausted

**Example**

```lua
local k, v = next(Headers)
while k do
   print(k, v)
   k, v = next(Headers, k)
end
```


## `select`

*function*

```lua
select(index, ...)
```

Count or pick from a variadic argument list.

If index is the string "#", returns the total number of extra arguments. Otherwise returns all arguments from index onward.

**Usage**

```lua
select(index, ...)
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `index` | integer\|string | Yes | 1-based position, or "#" for the count. |
| `...` | any | No | Variadic arguments. |

**Returns**

- the selected arguments, or a count when index is "#"

**Example**

```lua
local function Count(...)
   return select('#', ...)
end
print(Count('a', 'b', 'c'))  -- 3
print(select(2, 'a', 'b', 'c'))  -- "b"  "c"
```


## `error`

*function*

```lua
error(message [, level])
```

Raise a Lua error.

Terminates the last protected function called (or the whole script) and returns message as the error object. level controls where position info is added (1 = the caller of error, the default).

**Usage**

```lua
error(message, level)
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `message` | any | Yes | Error value, usually a string. |
| `level` | integer | No | Position-info level. Default 1. |

**Returns**

- does not return

**Example**

```lua
if not Resp then error('request failed') end
```


## `assert`

*function*

```lua
assert(v [, message])
```

Raise an error if v is falsy.

If v is false or nil, calls error(message), using "assertion failed!" as a default message. Otherwise returns all its arguments.

**Usage**

```lua
assert(v, message)
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `v` | any | Yes | Value to check. |
| `message` | any | No | Error value used when v is falsy. |

**Returns**

- v, ... (all arguments, unchanged, when v is truthy)

**Example**

```lua
local Mrn = assert(Msg.PID[3][1][1]:value(), 'missing MRN')
```


## `pcall`

*function*

```lua
pcall(f, ...)
```

Call a function in protected mode.

Calls f with the given arguments in protected mode: any error inside f is caught instead of propagating. Returns true plus f's results on success, or false plus the error object on failure.

**Usage**

```lua
local ok, result = pcall(f, ...)
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `f` | function | Yes | Function to call. |
| `...` | any | No | Arguments to pass to f. |

**Returns**

- true, results... on success
- false, errorObject on failure

**Example**

```lua
local Ok, Msg, MsgType = pcall(linkiir.data.extract, { schema = 'demo.json', data = Data })
if not Ok then error('extract failed: ' .. tostring(Msg)) end
```


## `xpcall`

*function*

```lua
xpcall(f, msgh)
```

Call a function in protected mode with a message handler.

Like pcall, but calls the message handler msgh in the context of the error, before the stack unwinds — useful for attaching a traceback.

**Usage**

```lua
local ok, result = xpcall(f, msgh)
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `f` | function | Yes | Function to call (no arguments). |
| `msgh` | function | Yes | Message handler, called with the error object. |

**Returns**

- true, results... on success
- false, handlerResult on failure

**Example**

```lua
local Ok, Err = xpcall(function() return riskyStep() end, debug.traceback)
if not Ok then print(Err) end
```


## `unpack`

*function*

```lua
unpack(list [, i [, j]])
```

Expand a table into multiple return values.

Returns the elements from the given table list, from list[i] to list[j]. Defaults are i = 1 and j = #list.

**Usage**

```lua
unpack(list, i, j)
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `list` | table | Yes | Table (array) to expand. |
| `i` | integer | No | Start index. Default 1. |
| `j` | integer | No | End index. Default #list. |

**Returns**

- the unpacked values

**Example**

```lua
local Args = { 'a', 'b', 'c' }
print(unpack(Args))  -- "a"  "b"  "c"
```


## `rawequal`

*function*

```lua
rawequal(v1, v2)
```

Compare two values without metamethods.

Checks whether v1 is equal to v2, without invoking the __eq metamethod.

**Usage**

```lua
rawequal(v1, v2)
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `v1` | any | Yes | First value. |
| `v2` | any | Yes | Second value. |

**Returns**

- boolean

**Example**

```lua
print(rawequal(1, 1))  -- true
```


## `rawget`

*function*

```lua
rawget(t, k)
```

Read a table field without metamethods.

Gets the real value of t[k], without invoking the __index metamethod.

**Usage**

```lua
rawget(t, k)
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `t` | table | Yes | Table to read. |
| `k` | any | Yes | Key to read. |

**Returns**

- the raw value

**Example**

```lua
print(rawget(SomeTable, 'id'))
```


## `rawset`

*function*

```lua
rawset(t, k, v)
```

Write a table field without metamethods.

Sets the real value of t[k] to v, without invoking the __newindex metamethod. Returns t.

**Usage**

```lua
rawset(t, k, v)
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `t` | table | Yes | Table to modify. |
| `k` | any | Yes | Key to set. |
| `v` | any | Yes | Value to set. |

**Returns**

- t

**Example**

```lua
rawset(SomeTable, 'id', 42)
```


## `setmetatable`

*function*

```lua
setmetatable(t, metatable)
```

Attach a metatable to a table.

Sets the metatable for table t. Returns t.

**Usage**

```lua
setmetatable(t, metatable)
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `t` | table | Yes | Table to modify. |
| `metatable` | table\|nil | Yes | New metatable, or nil to remove it. |

**Returns**

- t

**Example**

```lua
local Vector = setmetatable({ x = 1, y = 2 }, VectorMeta)
```


## `getmetatable`

*function*

```lua
getmetatable(t)
```

Read a table's metatable.

Returns the metatable of t, or nil if it has none (or the metatable's __metatable field, if that is set).

**Usage**

```lua
getmetatable(t)
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `t` | any | Yes | Value to inspect. |

**Returns**

- table, or nil

**Example**

```lua
local Meta = getmetatable(Vector)
```


## `collectgarbage`

*function*

```lua
collectgarbage([opt [, arg]])
```

Control the garbage collector.

Runs garbage-collector actions. With no arguments, performs a full collection cycle. opt selects the action (e.g. "collect", "count", "step").

**Usage**

```lua
collectgarbage(opt, arg)
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `opt` | string | No | Action name. Default "collect". |
| `arg` | any | No | Argument for the selected action. |

**Returns**

- depends on opt (e.g. current memory use in Kbytes for "count")

**Example**

```lua
collectgarbage()               -- full collection cycle
print(collectgarbage('count'))  -- current memory use, in Kbytes
```


## `_VERSION`

*field*

```lua
_VERSION
```

The running Lua version string.

A global variable (not a function) holding a string with the running Lua version, e.g. "Lua 5.1".

**Usage**

```lua
print(_VERSION)
```

**Returns**

- string

**Example**

```lua
print(_VERSION)  -- "Lua 5.1"
```


## `_G`

*field*

```lua
_G
```

The global environment table.

The table representing the script's global environment. Reading/writing _G.x is equivalent to reading/writing the global variable x.

**Usage**

```lua
_G.SomeGlobal
```

**Returns**

- table

**Example**

```lua
_G.Counter = 0
print(Counter)  -- 0
```


## `dofile`

*function*

```lua
dofile([filename])
```

Execute a Lua file as a chunk.

Loads and immediately runs the Lua chunk in filename (or stdin, if omitted), in the global environment. Errors propagate to the caller, unprotected. Prefer require for loading reusable modules — dofile re-runs the file every call and has no module caching.

**Usage**

```lua
dofile(path)
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `filename` | string | No | Path of the Lua file to run. Default stdin. |

**Returns**

- whatever the chunk returns

**Example**

```lua
dofile(linkiir.sys.nodeDir() .. '/helpers.lua')
```


## `loadfile`

*function*

```lua
loadfile([filename])
```

Load a Lua file without running it.

Loads a chunk from filename (or stdin, if omitted) without running it. Returns the compiled chunk as a function, or nil plus an error message on a syntax error.

**Usage**

```lua
local chunk, err = loadfile(path)
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `filename` | string | No | Path of the Lua file to load. Default stdin. |

**Returns**

- function on success; nil, errorMessage on failure

**Example**

```lua
local Chunk, Err = loadfile(linkiir.sys.nodeDir() .. '/helpers.lua')
if Chunk then Chunk() end
```


## `loadstring`

*function*

```lua
loadstring(string [, chunkname])
```

Compile a Lua chunk from a string.

Loads a chunk from the given string without running it. Returns the compiled chunk as a function, or nil plus an error message on a syntax error. chunkname is used in error messages and debug info.

**Usage**

```lua
local chunk, err = loadstring(code)
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `string` | string | Yes | Lua source code. |
| `chunkname` | string | No | Name used in error messages/tracebacks. Default the string itself. |

**Returns**

- function on success; nil, errorMessage on failure

**Example**

```lua
local Chunk = loadstring('return 1 + 1')
print(Chunk())  -- 2
```


## `load`

*function*

```lua
load(func [, chunkname])
```

Compile a Lua chunk from a reader function.

Loads a chunk using func, a reader function repeatedly called with no arguments that must return successive pieces of the chunk's source (or nil/empty string to signal the end). Returns the compiled chunk as a function, or nil plus an error message on a syntax error.

**Usage**

```lua
local chunk, err = load(reader)
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `func` | function | Yes | Reader function returning successive source chunks. |
| `chunkname` | string | No | Name used in error messages/tracebacks. |

**Returns**

- function on success; nil, errorMessage on failure

**Example**

```lua
local Parts = { 'return ', '1 + 1' }
local I = 0
local Chunk = load(function() I = I + 1 return Parts[I] end)
print(Chunk())  -- 2
```


## `getfenv`

*function*

```lua
getfenv([f])
```

Read a function's environment table.

Returns the current environment table of f (a function, or a stack-level integer; default 1, the calling function).

**Usage**

```lua
getfenv(f)
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `f` | function\|integer | No | Function, or stack level. Default 1. |

**Returns**

- table

**Example**

```lua
local Env = getfenv(1)
```


## `setfenv`

*function*

```lua
setfenv(f, table)
```

Set a function's environment table.

Sets the environment for the function f (a function, or a stack-level integer, where 1 means the calling function) to table. Returns f when f is a function.

**Usage**

```lua
setfenv(f, table)
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `f` | function\|integer | Yes | Function, or stack level. |
| `table` | table | Yes | New environment table. |

**Returns**

- f (when f is a function)

**Example**

```lua
local Sandbox = setmetatable({}, { __index = _G })
setfenv(SomeFn, Sandbox)
```


## `module`

*function*

```lua
module(name [, ...])
```

Create or enter a named module.

Legacy Lua 5.1 module system: creates (or reuses) a table for module name, sets it as the value of the global name and of package.loaded[name], and sets it as the new environment of the running function, so subsequent top-level function/variable definitions become fields of the module. Optional arguments are 'module modifiers' such as package.seeall. Superseded in most modern Lua code by returning a table from a plain chunk loaded via require.

**Usage**

```lua
module('mymodule')
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | string | Yes | Module name. |
| `...` | function | No | Optional module modifiers, e.g. package.seeall. |

**Returns**

- none

**Example**

```lua
module('mymodule', package.seeall)

function greet(name)
   return 'hello, ' .. name
end
```

