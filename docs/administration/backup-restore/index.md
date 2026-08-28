---
title: Backup and Restore
---

# Backup and Restore

The Linkiir working directory contains projects, workflows, settings, and local state. Back it up together with configuration and the master encryption key.

## Scope

| Platform | Working data and configuration |
| --- | --- |
| Windows | `C:\ProgramData\Linkiir` |
| Linux native | `/var/lib/linkiir` and `/etc/linkiir` |
| macOS/Linux Docker | `linkiir_work`, `linkiir_logs`, `linkiir_config`, `.env`, and optionally `linkiir_queue` |

## Critical key material

- Windows: `C:\ProgramData\Linkiir\config\linkiir.env`
- Linux: `/etc/linkiir/linkiir.env`
- Docker: `LINKIIR_SECRET_KEY` in `.env`

Losing the key does not delete projects, workflows, users, or message history. What breaks is the stored broker and Log DB passwords: they can no longer be decrypted and must be re-entered. User passwords are unaffected — they are hashed independently of this key.

## The License ID travels with the working directory

Worth knowing before you plan a restore. An installation's License ID is derived from an identifier inside its working directory.

| Recovery route | License ID | License |
| --- | --- | --- |
| Restore the working directory onto a replacement host | Unchanged | Your existing License Code keeps working |
| Install fresh and import projects | New | Needs a [license transfer](../licensing/license-transfer.md) |

Restoring the working directory is therefore the cheaper route for replacing a server. Decide which one you are taking before you rebuild. See [License ID and License Code](../licensing/license-id-code.md).

## Backup procedure

1. Confirm platform health.
2. Quiesce configuration changes; for a consistent full backup, stop Grid and supervised child processes.
3. Back up the working directory and configuration.
4. Back up the Log DB using database-native tools when PostgreSQL/MS SQL is external.
5. Back up broker data only when the broker architecture and recovery plan require it; queue backup is separate from Linkiir project backup.
6. Encrypt the backup and restrict access.
7. Record version, queue mode, database version, and timestamp.
8. Test restore on a non-production host.

:::note[Backup is your own procedure]
`linkiirctl` lists `backup` and `restore` verbs, but they are provided by the platform installer rather than by Linkiir itself, and they are not available when running from a source tree. Check what your installation's `linkiirctl backup` actually does before relying on it:

```bash
linkiirctl backup
```

If it reports that the verb is implemented by the platform installer, treat backup as your own responsibility and script it against the paths in the table above. Copying the working directory, the configuration directory, and the key file — with the platform stopped — is the whole job.
:::

## Backing up a project rather than an installation

Exporting a project produces a portable bundle of one project's content. It is useful, and it is not a backup of the installation: it carries no users, roles, broker settings, Log DB settings, license, or message history, and it deliberately blanks secret credential values.

Use it to move a project between environments or to keep a versioned artifact of an interface alongside a release. Use a working-directory backup to protect the installation. See [Import and Export](../deployment/import-export.md).

## Restore procedure

1. Install the same compatible Linkiir version and package type.
2. Stop Linkiir services.
3. Restore configuration, working data, and the original master key.
4. Restore the external Log DB separately when applicable.
5. Reconnect to the intended broker; do not accidentally point a restored TEST system at PROD.
6. Start Linkiir.
7. Verify `/api/health` reports `healthy` or an understood `degraded`, then check projects, credentials, Runtime state, Archiver progress, and recent logs.
8. Confirm **Settings → License** still shows your license. A restored working directory keeps the same License ID, so it should.
9. Run controlled interface tests before accepting traffic.

:::note[Everyone is signed out after a restore]
Sessions live in the running Grid process, so restarting it ends them. Users sign in again with their existing passwords — which are restored with the working directory and are not affected by the master key.
:::

:::caution[Environment cloning]
When cloning PROD into TEST, replace endpoints and credentials before starting Runtime. Otherwise restored workflows may contact live systems.
:::
