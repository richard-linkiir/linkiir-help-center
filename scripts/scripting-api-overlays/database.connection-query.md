:::caution Build the complete statement in the script
`sql` reaches the database exactly as written, including any `$1`-style markers, which arrive as literal text. Compose the whole statement in the script, and pass every value that came from a message, a variable, or user input through [`Connection:quote`](#connectionquote) as you build it.
:::
