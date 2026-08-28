---
title: Runtime & System
---

# Runtime & System

`linkiir.sys`

Small runtime helpers and filesystem access in one place. Time/env helpers (os.date, os.time, os.getenv) stay as native Lua. Path resolution: every linkiir.sys.fs function resolves a relative path against the Runtime's working directory (linkiir.sys.workingDir()), never the process working directory. An absolute path is used unchanged. A relative path that escapes the working directory via .. is rejected.

---

## `linkiir.sys.guid`

*function*

```lua
linkiir.sys.guid(bits)
```

Generate a random GUID of the requested bit length.

Generate a random GUID. The bit count is required: it must be at least 128 and divisible by 8. Calling guid() with no argument, or with fewer than 128 bits, raises a Lua error.

**Usage**

```lua
local id = linkiir.sys.guid(128)
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `bits` | integer | Yes | Length in bits. Minimum 128, must be divisible by 8. |

**Returns**

- GUID string.

**Errors**

Raises a Lua error on failure.

Codes: `RUNTIME_ERROR`

**Example**

```lua
local Id  = linkiir.sys.guid(128)   -- 128-bit GUID
local Big = linkiir.sys.guid(256)   -- 256 bits when more entropy is wanted
-- linkiir.sys.guid()   -- error: bits is required
-- linkiir.sys.guid(32) -- error: must be at least 128 bits
```


## `linkiir.sys.sleep`

*function*

```lua
linkiir.sys.sleep(ms)
```

Pause the current run.

Pause the current run for the given number of milliseconds.

**Usage**

```lua
linkiir.sys.sleep(ms)
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `ms` | integer | Yes | Milliseconds to sleep. |

**Returns**

- none

**Errors**

Raises a Lua error on failure.

Codes: `INVALID_PARAMETER`

**Example**

```lua
linkiir.sys.sleep(250)
```


## `linkiir.sys.workingDir`

*function*

```lua
linkiir.sys.workingDir()
```

Absolute path of the Runtime's working directory.

Absolute path of the Runtime's working directory - the parent of projects/, users/, logs/ and run/. This is the base a relative linkiir.store or linkiir.sys.fs path resolves against, so a project built on it means the same thing regardless of how the service was started. Returns the same value under Run Test and Debug as the live Runtime reports for that node.

**Usage**

```lua
local wd = linkiir.sys.workingDir()
```

**Returns**

- `string` — absolute path to the working directory.

**Errors**

Raises a Lua error naming the missing context when the working directory is unknown to the calling VM, rather than returning an empty string.

**Example**

```lua
local Root = linkiir.sys.workingDir()
print('working dir: ' .. Root)

-- Rarely needed: a relative path already resolves here.
local DB = linkiir.store.open{ driver = linkiir.store.SQLITE, name = 'demo/patient.db' }
```


## `linkiir.sys.nodeDir`

*function*

```lua
linkiir.sys.nodeDir()
```

Absolute path of the executing node's directory.

Absolute path of the directory the executing node's files were loaded from. Under the live Runtime this is the staged run folder; under Run Test and Debug it is your dev clone. Replaces the deprecated __node_dir global. A relative schema path already resolves against this directory, so concatenation is not needed.

**Usage**

```lua
local nd = linkiir.sys.nodeDir()
```

**Returns**

- `string` — absolute path to the node directory.

**Errors**

Raises a Lua error naming the missing context when the node directory is unknown to the calling VM.

**Example**

```lua
local Dir = linkiir.sys.nodeDir()
print('node dir: ' .. Dir)

-- Rarely needed: a relative schema path already resolves here.
local Msg = linkiir.data.extract{ schema = 'demo.json', data = Data }
```


## `linkiir.sys.fs.stat`

*function*

```lua
linkiir.sys.fs.stat(path)
```

Filesystem: stat.

Return metadata (size, mtime, type, mode) for a file or directory.

**Usage**

```lua
linkiir.sys.fs.stat(path)
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `path` | string | Yes | Filesystem path. |

**Returns**

- `{ size=, mtime=, type=, mode= }, err`

**Errors**

Returns result, err.

Codes: `NOT_FOUND`, `PERMISSION_DENIED`, `IO_ERROR`

**Example**

```lua
for _, p in ipairs(linkiir.sys.fs.list{ path = '/inbound', pattern = '*.hl7' }) do
   local st = linkiir.sys.fs.stat(p)
   print(p, st.size)
end
```


## `linkiir.sys.fs.list`

*function*

```lua
linkiir.sys.fs.list{ path=, pattern='*.hl7' }
```

Filesystem: list.

List files in a directory matching a glob pattern.

**Usage**

```lua
linkiir.sys.fs.list{ path=, pattern='*.hl7' }
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `path` | string | Yes | Directory to list. |
| `pattern` | string | No | Glob pattern, default '*.hl7'. |

**Returns**

- array, err

**Errors**

Returns result, err.

Codes: `NOT_FOUND`, `PERMISSION_DENIED`, `IO_ERROR`

**Example**

```lua
for _, p in ipairs(linkiir.sys.fs.list{ path = '/inbound', pattern = '*.hl7' }) do
   local st = linkiir.sys.fs.stat(p)
   print(p, st.size)
end
```


## `linkiir.sys.fs.mkdir`

*function*

```lua
linkiir.sys.fs.mkdir(path)
```

Filesystem: mkdir.

Create a directory.

**Usage**

```lua
linkiir.sys.fs.mkdir(path)
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `path` | string | Yes | Directory path to create. |

**Returns**

- ok, err

**Errors**

Returns result, err.

Codes: `NOT_FOUND`, `PERMISSION_DENIED`, `IO_ERROR`

**Example**

```lua
local Ok, Err = linkiir.sys.fs.mkdir('/inbound/archive')
if not Ok then error(Err.message) end
```


## `linkiir.sys.fs.rmdir`

*function*

```lua
linkiir.sys.fs.rmdir(path)
```

Filesystem: rmdir.

Remove an empty directory.

**Usage**

```lua
linkiir.sys.fs.rmdir(path)
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `path` | string | Yes | Directory path to remove (must be empty). |

**Returns**

- ok, err

**Errors**

Returns result, err.

Codes: `NOT_FOUND`, `PERMISSION_DENIED`, `IO_ERROR`

**Example**

```lua
local Ok, Err = linkiir.sys.fs.rmdir('/inbound/archive')
if not Ok then error(Err.message) end
```


## `linkiir.sys.fs.remove`

*function*

```lua
linkiir.sys.fs.remove(path)
```

Filesystem: remove.

Delete a file.

**Usage**

```lua
linkiir.sys.fs.remove(path)
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `path` | string | Yes | File path to delete. |

**Returns**

- ok, err

**Errors**

Returns result, err.

Codes: `NOT_FOUND`, `PERMISSION_DENIED`, `IO_ERROR`

**Example**

```lua
local Ok, Err = linkiir.sys.fs.remove('/inbound/old.hl7')
if not Ok then error(Err.message) end
```


## `linkiir.sys.fs.access`

*function*

```lua
linkiir.sys.fs.access{ path=, mode='r' }
```

Filesystem: access.

Test whether a file is accessible with the given mode ('r', 'w', 'x').

**Usage**

```lua
linkiir.sys.fs.access{ path=, mode='r' }
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `path` | string | Yes | Filesystem path to test. |
| `mode` | string | No | Access mode to test: 'r', 'w', or 'x'. Default 'r'. |

**Returns**

- boolean

**Errors**

Returns result, err.

Codes: `NOT_FOUND`, `PERMISSION_DENIED`, `IO_ERROR`

**Example**

```lua
local Readable = linkiir.sys.fs.access{ path = '/inbound/demo.hl7', mode = 'r' }
```


## `linkiir.sys.fs.chmod`

*function*

```lua
linkiir.sys.fs.chmod{ path=, mode=0755 }
```

Filesystem: chmod.

Change a file's permission bits.

**Usage**

```lua
linkiir.sys.fs.chmod{ path=, mode=0755 }
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `path` | string | Yes | Filesystem path. |
| `mode` | integer | No | Permission bits (octal), default 0755. |

**Returns**

- ok, err

**Errors**

Returns result, err.

Codes: `NOT_FOUND`, `PERMISSION_DENIED`, `IO_ERROR`

**Example**

```lua
local Ok, Err = linkiir.sys.fs.chmod{ path = '/inbound/demo.hl7', mode = 0755 }
if not Ok then error(Err.message) end
```


## `linkiir.sys.fs.chown`

*function*

```lua
linkiir.sys.fs.chown{ path=, owner=, group= }
```

Filesystem: chown.

Change a file's owner and group.

**Usage**

```lua
linkiir.sys.fs.chown{ path=, owner=, group= }
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `path` | string | Yes | Filesystem path. |
| `owner` | string | Yes | New owner. |
| `group` | string | Yes | New group. |

**Returns**

- ok, err

**Errors**

Returns result, err.

Codes: `NOT_FOUND`, `PERMISSION_DENIED`, `IO_ERROR`

**Example**

```lua
local Ok, Err = linkiir.sys.fs.chown{ path = '/inbound/demo.hl7', owner = 'linkiir', group = 'linkiir' }
if not Ok then error(Err.message) end
```


## `linkiir.sys.fs.touch`

*function*

```lua
linkiir.sys.fs.touch{ path=, time= }
```

Filesystem: touch.

Create a file if missing, or update its modification time.

**Usage**

```lua
linkiir.sys.fs.touch{ path=, time= }
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `path` | string | Yes | Filesystem path. |
| `time` | integer | No | Modification time (unix epoch); defaults to now. |

**Returns**

- ok, err

**Errors**

Returns result, err.

Codes: `NOT_FOUND`, `PERMISSION_DENIED`, `IO_ERROR`

**Example**

```lua
local Ok, Err = linkiir.sys.fs.touch{ path = '/inbound/.keep' }
if not Ok then error(Err.message) end
```

