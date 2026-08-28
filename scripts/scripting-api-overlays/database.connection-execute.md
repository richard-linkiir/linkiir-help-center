:::caution Build the complete statement in the script
As with `conn:query`, `sql` reaches the database exactly as written, and `$1`-style markers arrive as literal text. Compose the whole statement in the script, and pass every value that came from a message, a variable, or user input through [`Connection:quote`](#connectionquote) as you build it.
:::
