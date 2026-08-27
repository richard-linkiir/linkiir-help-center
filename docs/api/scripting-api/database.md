---
title: Database
---

# Database

`linkiir.store`

Database access, named for what it does (store / retrieve). Connection-object style only; query results are Linkiir node trees (protocol code 103 = DB).

---

## `linkiir.store.open`

*function*

```lua
linkiir.store.open{ driver=, name=, user=, password=, live= }
```

Open a database connection. Pass one of the driver constants (linkiir.store.SQLITE, MYSQL, MARIADB, ORACLE, POSTGRES_ODBC, SQLSERVER_ODBC, ORACLE_ODBC, MYSQL_ODBC) as the driver parameter.

**Usage**

```lua
local conn, err = linkiir.store.open{ driver=, name=, user=, password=, timeout=, live= }
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `driver` | integer | Yes | One of the linkiir.store.* driver constants (e.g. linkiir.store.SQLITE). These are integer values, not strings. |
| `name` | string | Yes | DSN / host / database / file, per driver. For SQLITE this is a file path: a relative path resolves against the Runtime's working directory (linkiir.sys.workingDir()), never the process working directory, and an absolute path is used unchanged. The :memory: sentinel and file: URIs are passed to SQLite untouched. For every other driver the value is a server, DSN or database name and is never treated as a path. |
| `user` | string | No | Username. |
| `password` | string | No | Password. |
| `timeout` | integer | No | Connect timeout (seconds). |
| `live` | boolean | No | Default true. |

**Returns**

- conn (connection object) on success — see the Connection:* methods in this module.
- nil, err on failure

**Errors**

Returns result, err.

Codes: `DRIVER_NOT_FOUND`, `AUTH_FAILED`, `CONNECT_FAILED`, `TIMEOUT`

**Example**

```lua
local Conn, Err = linkiir.store.open{ driver = linkiir.store.POSTGRES_ODBC, name = 'clinicdb',
                               user = 'svc', password = Secret }
if not Conn then error(Err.message) end
```


## `linkiir.store.tables`

*function*

```lua
linkiir.store.tables{ name= }
```

Create an empty database table node tree.

Create an empty database table node tree for building rows to insert or update. The returned node is a Linkiir node (protocol code 103 = DB) that can be populated field by field, then passed to Connection:execute for INSERT/UPDATE operations.

**Usage**

```lua
local tbl = linkiir.store.tables{ name = 'patients' }
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | string | Yes | Table name in the database. |

**Returns**

- `node` — Root node of the database table tree.

**Example**

```lua
local tbl = linkiir.store.tables{ name = 'patients' }
tbl.first_name = 'John'
tbl.last_name = 'Smith'
Conn:execute{ sql = 'insert into patients (first_name, last_name) values ('
                    .. Conn:quote(tbl.first_name:value()) .. ', '
                    .. Conn:quote(tbl.last_name:value()) .. ')' }
```


## `linkiir.store.SQLITE`

*field*

```lua
linkiir.store.SQLITE
```

Driver constant (1013).

SQLite (file-based database). The name parameter is the file path. Pass as the driver= argument to linkiir.store.open.

**Usage**

```lua
local driver = linkiir.store.SQLITE
```

**Returns**

- `integer` — Constant value 1013.


## `linkiir.store.MYSQL`

*field*

```lua
linkiir.store.MYSQL
```

Driver constant (1001).

MySQL (native connector). Pass as the driver= argument to linkiir.store.open.

**Usage**

```lua
local driver = linkiir.store.MYSQL
```

**Returns**

- `integer` — Constant value 1001.


## `linkiir.store.MARIADB`

*field*

```lua
linkiir.store.MARIADB
```

Driver constant (1014).

MariaDB (native connector). Pass as the driver= argument to linkiir.store.open.

**Usage**

```lua
local driver = linkiir.store.MARIADB
```

**Returns**

- `integer` — Constant value 1014.


## `linkiir.store.ORACLE`

*field*

```lua
linkiir.store.ORACLE
```

Driver constant (1003).

Oracle Database (native OCI). Pass as the driver= argument to linkiir.store.open.

**Usage**

```lua
local driver = linkiir.store.ORACLE
```

**Returns**

- `integer` — Constant value 1003.


## `linkiir.store.POSTGRES_ODBC`

*field*

```lua
linkiir.store.POSTGRES_ODBC
```

Driver constant (1002).

PostgreSQL via ODBC. The name parameter is the connection string or database name. Pass as the driver= argument to linkiir.store.open.

**Usage**

```lua
local driver = linkiir.store.POSTGRES_ODBC
```

**Returns**

- `integer` — Constant value 1002.


## `linkiir.store.SQLSERVER_ODBC`

*field*

```lua
linkiir.store.SQLSERVER_ODBC
```

Driver constant (1006).

Microsoft SQL Server via ODBC. Pass as the driver= argument to linkiir.store.open.

**Usage**

```lua
local driver = linkiir.store.SQLSERVER_ODBC
```

**Returns**

- `integer` — Constant value 1006.


## `linkiir.store.ORACLE_ODBC`

*field*

```lua
linkiir.store.ORACLE_ODBC
```

Driver constant (1012).

Oracle Database via ODBC. Pass as the driver= argument to linkiir.store.open.

**Usage**

```lua
local driver = linkiir.store.ORACLE_ODBC
```

**Returns**

- `integer` — Constant value 1012.


## `linkiir.store.MYSQL_ODBC`

*field*

```lua
linkiir.store.MYSQL_ODBC
```

Driver constant (1015).

MySQL via ODBC (use for remote MySQL when native driver is unavailable). Pass as the driver= argument to linkiir.store.open.

**Usage**

```lua
local driver = linkiir.store.MYSQL_ODBC
```

**Returns**

- `integer` — Constant value 1015.


## Connection methods

### `Connection:query`

*method of `Connection`*

```lua
conn:query{ sql=, live= }
```

SELECT; rows navigable as a node tree.

**Usage**

```lua
local rows, err = conn:query{ sql= }
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `sql` | string | Yes | Complete SQL query text. |
| `live` | boolean | No | Default true; false simulates (test mode). |

:::caution Build the complete statement in the script
`sql` reaches the database exactly as written, including any `$1`-style markers, which arrive as literal text. Compose the whole statement in the script, and pass every value that came from a message, a variable, or user input through [`Connection:quote`](#connectionquote) as you build it.
:::

**Returns**

- result node tree, err

**Example**

```lua
local Rows, Err = Conn:query{
   sql = 'select id, name from patient where mrn = ' .. Conn:quote(Mrn),
}
if not Rows then error(Err.message) end
for i = 1, #Rows do
   print(Rows[i].id:value(), Rows[i].name:value())
end
```


### `Connection:execute`

*method of `Connection`*

```lua
conn:execute{ sql=, live= }
```

INSERT/UPDATE/DELETE/DDL.

**Usage**

```lua
local n, err = conn:execute{ sql= }
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `sql` | string | Yes | Complete SQL statement text. |
| `live` | boolean | No | Default true; false simulates (test mode). |

:::caution Build the complete statement in the script
As with `conn:query`, `sql` reaches the database exactly as written, and `$1`-style markers arrive as literal text. Compose the whole statement in the script, and pass every value that came from a message, a variable, or user input through [`Connection:quote`](#connectionquote) as you build it.
:::

**Returns**

- affected count, err

**Example**

```lua
local Affected, Err = Conn:execute{
   sql = 'update patient set active = false where mrn = ' .. Conn:quote(Mrn),
}
if not Affected then error(Err.message) end
```


### `Connection:merge`

*method of `Connection`*

```lua
conn:merge{ data=<tableTree>, live= }
```

Upsert a table tree from linkiir.data.tables.

**Usage**

```lua
local n, err = conn:merge{ data=<tableTree> }
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `data` | node | Yes | A linkiir.data.tables node tree to upsert. |
| `live` | boolean | No | Default true; false simulates. |

**Returns**

- rows merged, err

**Example**

```lua
local Merged, Err = Conn:merge{ data = TableTree }
if not Merged then error(Err.message) end
```


### `Connection:begin`

*method of `Connection`*

```lua
conn:begin{ live= }
```

Begin a transaction.

**Usage**

```lua
conn:begin()
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `live` | boolean | No | Default true; false simulates. |

**Returns**

- ok, err

**Example**

```lua
local Ok, Err = Conn:begin()
if not Ok then error(Err.message) end
```


### `Connection:commit`

*method of `Connection`*

```lua
conn:commit{ live= }
```

Commit.

**Usage**

```lua
conn:commit()
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `live` | boolean | No | Default true; false simulates. |

**Returns**

- ok, err

**Example**

```lua
Conn:commit()
```


### `Connection:rollback`

*method of `Connection`*

```lua
conn:rollback{ live= }
```

Roll back.

**Usage**

```lua
conn:rollback()
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `live` | boolean | No | Default true; false simulates. |

**Returns**

- ok, err

**Example**

```lua
Conn:rollback()
```


### `Connection:check`

*method of `Connection`*

```lua
conn:check()
```

Liveness probe.

**Usage**

```lua
if conn:check() then ... end
```

**Returns**

- boolean

**Example**

```lua
if not Conn:check() then
   Conn = linkiir.store.open{ driver = linkiir.store.POSTGRES_ODBC, name = 'clinicdb' }
end
```


### `Connection:quote`

*method of `Connection`*

```lua
conn:quote(s)
```

Escape a value for use in a statement.

Escape a value so it can be included in the `sql` text passed to `conn:query` or `conn:execute`. Use it on every value that came from a message, a variable, or user input.

**Usage**

```lua
local q = conn:quote(s)
```

**Parameters**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `s` | string | Yes | String to escape. |

**Returns**

- string

**Example**

```lua
local Sql = 'select id from patient where mrn = ' .. Conn:quote(Mrn)
local Rows, Err = Conn:query{ sql = Sql }
```


### `Connection:close`

*method of `Connection`*

```lua
conn:close()
```

Release the connection.

**Usage**

```lua
conn:close()
```

**Returns**

- none

**Example**

```lua
Conn:close()
```

