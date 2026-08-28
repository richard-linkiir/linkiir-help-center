---
title: License ID and License Code
---

# License ID and License Code

Activating Linkiir is an exchange of two values. You send your vendor a **License ID**; they send back a **License Code**; you paste it in.

---

## License ID

Every installation generates its own License ID the first time it starts:

```text
LK-4TQ8M-9WXZ2-BKN7R-3PJH5-K
```

It is derived from an identifier Linkiir writes into its working directory on first start, and nothing else. It does not depend on your hardware, MAC address, hostname, or install path — so renaming the server, moving it to different hardware, or changing its IP does **not** change the License ID or invalidate your license.

What does change it is a new working directory. A fresh install pointed at an empty working directory is a new installation with a new License ID, even on the same machine.

| Detail | Behaviour |
| --- | --- |
| Where to find it | **Settings → License**, with a copy button |
| Safe to share? | Yes, with your vendor. It grants nothing on its own. |
| Changes if the host changes? | No |
| Changes with a new working directory? | Yes — that is a new installation |
| Survives an upgrade? | Yes, as long as the working directory is preserved |

:::caution[Restoring a backup preserves the License ID; a fresh install does not]
This is the practical consequence worth knowing. Restoring your working directory onto a replacement server keeps the same License ID, so your existing License Code keeps working. Installing fresh and importing projects produces a new License ID and needs a [transfer](license-transfer.md).

Plan which route you are taking before you rebuild a server, not after. See [Backup and Restore](../backup-restore/index.md).
:::

---

## License Code

The code your vendor issues. It starts with `LK1.` followed by a long encoded string:

```text
LK1.eyJ2IjoxLCJqdGkiOiI...
```

It is cryptographically signed and bound to the License ID it was issued for. Applying it to a different installation does not work — the installation will report the license does not match.

| Detail | Behaviour |
| --- | --- |
| Format | One line, no spaces. May be supplied as a `.lic` file. |
| Editable? | No. Any change breaks the signature. |
| Reusable on another install? | No. It is bound to one License ID. |
| Secret? | Treat it as licensed material. It is not a password, but it is yours. |

---

## Apply a license

1. Sign in as an administrator.
2. Open **Settings** and select the **License** tab.
3. Copy the **License ID** using the copy button next to it.
4. Send it to your vendor through your normal channel.
5. When the code arrives, paste it into the **License Code** box, or click **Upload .lic** and select the file.
6. Click **Apply**.

The page redraws showing **License Type**, **License ID**, **Expiration Date**, **Active Workflows**, **Nodes per Workflow**, and **Install Origin**.

No restart is needed. Workflows can be started as soon as the license is in place.

Record the activation in your change management system, and keep the code file with your installation records — you will want it if you ever rebuild this server from a backup.

---

## Replace a license

Use this to extend an expiry, change capacity, or change license type. It is the same operation for all three.

1. Open **Settings → License**.
2. Click **Replace License**.
3. Paste the new code under **Update License Code**, or use **Upload .lic**.
4. Click **Apply**.

Running workflows are not interrupted.

---

## Remove a license

Removing a license returns the installation to its unlicensed state, which stops workflows from running. There is rarely a reason to do this on a working installation.

---

## Managing the license by environment variable

Set `LINKIIR_LICENSE_CODE` and it takes precedence over whatever is stored on disk. The **License** tab then shows:

> Managed by environment variable — read-only.

and the **Replace License** and **Migrate** buttons are hidden. To change the license, change the variable and restart.

This suits container and infrastructure-as-code deployments, where the license belongs with the rest of the deployment configuration rather than in a file inside a volume.

| Consideration | Detail |
| --- | --- |
| Precedence | The variable always wins over the stored license |
| Still bound to the License ID | The code must match this installation's License ID, however it is supplied |
| Changing it | Update the variable and restart the Grid |
| Where to set it | Windows: `linkiir.env`. Docker: the bundle's `.env`. Linux: the service environment file. |

Pick one method per installation. Setting the variable while a license is also stored on disk works, but makes it easy to change the wrong one and wonder why nothing happened.

---

## Offline and air-gapped installations

Activation needs no network access from the Linkiir host. The exchange is two strings, moved however your environment allows — a ticket, a secure file transfer, or a note.

1. Read the License ID from **Settings → License** on the isolated host.
2. Carry it out to a machine that can reach your vendor.
3. Carry the returned code back in, as text or a `.lic` file.
4. Apply it.

Nothing phones home, and there is no periodic revalidation. Do not open network access from a Linkiir host purely for licensing.

---

## If activation fails

| Symptom | Likely cause |
| --- | --- |
| The license does not match this installation | The code was issued for a different License ID. Confirm the ID you sent matches the one on this tab. |
| The license is rejected as malformed | The code was truncated, wrapped, or edited in transit. Ask for it as a `.lic` file. |
| **Apply** does nothing visible | The box is empty, or the license is managed by environment variable. |
| No License ID is shown | Linkiir could not write to its working directory. Check the directory exists and is writable — see [Troubleshooting](../troubleshooting/index.md). |
| The code is refused because it was migrated away | This installation declared a migration for that code. Cancel the migration, or apply the replacement code. See [License Transfer](license-transfer.md). |

---

## Next

- [License Types](license-types.md)
- [Capacity and Expiry](capacity-and-expiry.md)
- [License Transfer](license-transfer.md)
