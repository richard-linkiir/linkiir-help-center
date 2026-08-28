---
title: License Transfer
---

# License Transfer

A transfer moves your license from one installation to a replacement. You need it when the new installation has a different **License ID** — because a License Code is bound to the ID it was issued for.

## First: check whether you need one

| Situation | License ID | Need a transfer? |
| --- | --- | --- |
| Restoring the working directory onto a replacement server | Unchanged | **No.** Your existing code keeps working. |
| Upgrading Linkiir in place | Unchanged | No |
| Renaming the host, changing its IP, moving to different hardware | Unchanged | No |
| Fresh install, then importing projects | New | **Yes** |
| Fresh install pointed at a new working directory | New | Yes |
| Moving from a physical host to a container, or between clouds | New, unless the working directory comes with it | Yes, unless you carry the working directory |

The dividing line is the working directory, not the machine. Carry it and your License ID travels with it. See [Backup and Restore](../backup-restore/index.md).

:::tip[The cheapest transfer is the one you avoid]
If your goal is simply to replace a server, restoring the working directory onto the new host is fewer steps than a transfer, keeps your history and settings, and needs no vendor involvement. Consider that route first.
:::

---

## How a transfer works

Three values go to your vendor, and one comes back.

```text
OLD installation                          NEW installation
      │                                          │
      │  License ID (old)                        │  License ID (new)
      │  Migration Code  ◄── click Migrate       │
      │                                          │
      └──────────────► your vendor ◄─────────────┘
                            │
                            └──► transferred License Code
                                 (apply on the NEW installation)
```

The **Migration Code** is your declaration that the old installation is being retired. Your vendor requires it before running a transfer, which is what makes retiring the old install part of the procedure rather than a promise. It is bound to the old installation's License ID, so it cannot be produced anywhere else.

---

## Procedure

### 1. Prepare the old installation

Back it up before you change anything:

- The working directory and configuration.
- The master encryption key.
- The Log DB, if it is external.

Export any projects you will move as bundles, or confirm they are pushed to their Git remotes. A license transfer moves **only the license** — projects, credentials, users, settings, and message history are all separate. See [Import and Export](../deployment/import-export.md).

Note the current **License ID**, **License Type**, **Expiration Date**, and capacity from **Settings → License** so you can verify the replacement matches.

### 2. Install the replacement and get its License ID

Install Linkiir on the new host and complete the administrator password change. Open **Settings → License** — it shows **No License** and the new installation's **License ID**. Copy it.

Do this before declaring the migration, so you have both IDs in hand.

### 3. Declare the migration on the old installation

1. On the **old** installation, open **Settings → License**.
2. Click **Migrate** and confirm.

The page switches to **Migration In Progress** and shows two values:

- **1. License ID (this installation)**
- **2. Migration Code**

Copy both.

Nothing stops. Workflows on the old installation keep running exactly as before — declaring a migration is a statement of intent, not a shutdown.

### 4. Request the transferred license

Send your vendor:

| Value | From |
| --- | --- |
| Old **License ID** | The old installation's License tab |
| **Migration Code** | The old installation, from step 3 |
| New **License ID** | The new installation's License tab |

Your commercial terms carry forward — type, capacity, and expiry come across unchanged. A transfer moves your entitlement; it does not renew or resize it. Combine it with a renewal by asking for both at once.

### 5. Apply the transferred code

On the **new** installation, paste the returned code into **License Code** and click **Apply**.

The **License** tab now shows **Install Origin: Transferred**, along with **Generation** and **Previous License ID** — a visible record that this installation inherited its license.

### 6. Move your content and validate

1. Import your projects — from their Git remotes, or from the bundles you exported. See [Import and Export](../deployment/import-export.md).
2. Re-enter secret credential values. They do not travel in a bundle.
3. Repoint anything environment-specific.
4. Confirm platform health at `/api/health`.
5. Start one workflow and verify end to end before starting the rest.

### 7. Retire the old installation

Only once the new one has been stable long enough that you no longer need to roll back.

Stop the old installation's workflows first, and confirm nothing is still sending to it. Two installations running the same interfaces will both process traffic — which is the failure mode most worth avoiding during a transfer.

---

## Running both during cutover

The old installation keeps working after you declare a migration, which is deliberate: it gives you a rollback path and a parallel-run window. It also creates a real hazard.

| Risk | Control |
| --- | --- |
| Both installations process the same feed | Stop the old workflows before starting the new ones, or point senders at one host only |
| Duplicate deliveries to a receiver | Verify the receiver deduplicates before running both against live traffic |
| Both write to the same directories or databases | Repoint the new installation, or keep the old one stopped |

Decide before cutover whether you are doing a hard switch or a parallel run, and if it is parallel, exactly which side is authoritative for delivery.

---

## Cancelling a migration

If the transfer does not go ahead — the replacement is delayed, or you decide to keep the old server — click **Cancel Migration** on the old installation.

The **Migration In Progress** badge clears and the installation returns to normal. It keeps running throughout; cancelling does not restart anything.

The Migration Code stays on record and is still shown on the tab, marked as cancelled. Resuming the transfer later reuses the same code.

---

## If something goes wrong

| Symptom | What to do |
| --- | --- |
| No **Migration Code** appeared | Click **Migrate** again. It is idempotent and returns the same code. |
| **Migrate** is refused because no License ID is available | The installation cannot read its working directory. Fix that first — see [Troubleshooting](../troubleshooting/index.md). |
| **Migrate** and **Replace License** are missing | The license is managed by the `LINKIIR_LICENSE_CODE` environment variable. Change the variable instead. |
| The transferred code is rejected on the new install | It was issued for a different License ID. Confirm you sent the new installation's ID, not the old one's. |
| The old install refuses to re-apply its original code | That code was migrated away. **Cancel Migration** to re-allow it. |
| The old installation was destroyed before you clicked Migrate | Contact your vendor. There is a support path for a transfer without a Migration Code. |
| Both installations are processing traffic | Stop the old installation's workflows immediately, then reconcile for duplicates. |

:::caution[Click Migrate before you decommission]
The Migration Code can only be produced by the installation being transferred away from. Once that host is gone, so is the ability to generate it, and the transfer becomes a support case.

Add "click Migrate and record the code" to your decommissioning checklist, ahead of "wipe the server".
:::

---

## Next

- [License ID and License Code](license-id-code.md)
- [Import and Export](../deployment/import-export.md)
- [Backup and Restore](../backup-restore/index.md)
