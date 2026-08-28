---
title: Download and Install
---

# Download and Install

Linkiir ships as a single self-contained package per platform. It includes the application, the Runtime, the Log Archiver, and — if you choose a bundled variant — a message broker. You do not need to install Python, Java, Node.js, or Kafka yourself.

Pick your platform:

- [macOS — Docker bundle](#macos--docker-bundle)
- [Windows — installer](#windows--installer)
- [Linux](../administration/installation/linux.md)

Both walkthroughs end at the same place: the Grid open at `http://127.0.0.1:8080`.

:::info[Version numbers]
Commands below use `1.0.0` as an example. Replace it with the version you downloaded.
:::

---

## Choose a package variant

Every platform offers the same three variants. The variant decides which message broker you get, and you choose it by which file you download.

| Variant | Use for | Broker |
| --- | --- | --- |
| `kafka` | DEV / TEST | Bundled Apache Kafka. Self-contained, no external dependencies. |
| `external` | PRODUCTION | None. You point Linkiir at your own Kafka cluster. |

For a first install, take **`kafka`**. It works with no broker configuration at all.

You are not locked in. A bundled installation can be pointed at your own cluster later, keeping your projects, workflows, settings, and logs. See [Kafka Configuration](../administration/configurations/kafka-redpanda.md).

---

## macOS — Docker bundle

### 1. Check the requirements

| Requirement | Minimum |
| --- | --- |
| macOS | 12 Monterey or later, Intel or Apple Silicon |
| Docker Desktop | Current version, running |
| RAM | 4 GB available for containers, 8 GB recommended with bundled Kafka |
| Disk | 2 GB free |
| Network | None. Every image ships inside the bundle. |

Install Docker Desktop first:

1. Download it from [docker.com](https://www.docker.com/products/docker-desktop/).
2. Drag it to Applications and launch it.
3. Wait for the whale icon in the menu bar to stop animating.

Confirm Docker is ready:

```bash
docker info
```

### 2. Pick the right download

macOS bundle filenames follow this pattern:

```text
linkiir-1.0.0-macos-docker-<variant>-<arch>.zip
```

The architecture suffix must match your Mac, because a Docker image is built for one CPU architecture. Check yours:

```bash
uname -m
```

| `uname -m` returns | Download the bundle ending in |
| --- | --- |
| `arm64` | `-arm64` (Apple Silicon: M1/M2/M3/M4) |
| `x86_64` | `-amd64` (Intel Macs) |

Installing the wrong architecture stops with a clear message rather than a confusing container crash, so a mistake here is recoverable — just download the other one.

### 3. Install

Substitute the variant and architecture you downloaded:

```bash
unzip linkiir-1.0.0-macos-docker-kafka-arm64.zip
cd linkiir-1.0.0-macos-docker-kafka-arm64
./scripts/linkiirctl install
```

Install asks no questions for bundled variants. The bundle already knows which broker it carries. It checks Docker, writes configuration, generates an encryption key, loads its images without downloading anything, starts the broker and Linkiir, waits for the Grid to answer its health check, and prints the URL.

`install` is also how you bring a stopped installation back up. It is safe to run again.

### 4. Open the Grid

```text
http://127.0.0.1:8080
```

### 5. Learn the four commands you will actually use

```bash
./scripts/linkiirctl status    # are the containers up?
./scripts/linkiirctl logs      # tail all logs
./scripts/linkiirctl doctor    # health checks
./scripts/linkiirctl restart   # apply .env changes
```

The full command list is in [Install on macOS](../administration/installation/macos.md).

### Connecting to your own broker

If you downloaded the `external` variant, install prompts for your broker details and **tests the connection before starting anything**. If the broker cannot be reached, install stops and leaves nothing half-configured. See [Install on macOS](../administration/installation/macos.md) for the prompts and the unattended equivalent.

---

## Windows — installer

### 1. Check the requirements

| Requirement | Minimum |
| --- | --- |
| Windows | 10, 11, Server 2016, 2019, or 2022 (x64) |
| RAM | 4 GB, 8 GB recommended with bundled Kafka |
| Disk | 2 GB free, 4 GB with bundled Kafka |
| Privileges | Administrator |

Nothing else is required. The installer supplies everything, including Java and Kafka when you choose the bundled broker.

### 2. Run the installer

Download `LinkiirSetup-1.0.0-x64.exe` and double-click it.

1. Accept the software terms.
2. Choose the install location. The default is `C:\Program Files\Linkiir`.
3. Choose a queue mode:
   - **Install Apache Kafka for me** — recommended for a first install. Zero configuration.
   - **Connect to my own Kafka broker** — enter the broker address, security protocol, and SASL credentials, plus a CA certificate if you use TLS.
4. If you chose your own broker, click **Test Connection** and confirm it passes before continuing.
5. Review the summary and click **Install**.

:::note[Unsigned builds]
Windows SmartScreen warns about installers without a code-signing certificate. If you see that warning on a build you obtained from Linkiir, choose **More info → Run anyway**.
:::

### 3. Wait for the readiness check

The final step can take up to a minute. The installer does not simply check that the services report Running — it waits for the broker to accept connections and for the Grid to answer its health check.

The completion page offers **Open Linkiir Grid Grid** only when the Grid actually responded, so you are never sent to a URL that will not load. If something did not come up, that page names the problem and points at `C:\ProgramData\Linkiir\logs\installer\`.

### 4. Open the Grid

Your browser opens automatically to:

```text
http://127.0.0.1:8080
```

Use `127.0.0.1`, not the machine name. Linkiir binds to localhost on a fresh install.

### 5. Know the two services

| Service | Name | Present when |
| --- | --- | --- |
| Linkiir Grid | `LinkiirGrid` | Always |
| Linkiir Kafka | `LinkiirKafka` | Bundled Kafka mode only |

```powershell
Get-Service LinkiirGrid, LinkiirKafka
Restart-Service LinkiirGrid
```

The Runtime and Log Archiver run under the Grid, so they are not separate services. Stopping `LinkiirGrid` stops them too. Start Kafka before the Grid if you start them by hand.

### Silent installation

```powershell
LinkiirSetup-1.0.0-x64.exe /VERYSILENT /SUPPRESSMSGBOXES /NORESTART
```

Check the result:

```powershell
Get-Content "C:\ProgramData\Linkiir\logs\installer\readiness.txt"
```

`READY` means every service came back up and answered. Anything else starts with `NOTREADY|` and the reason. External-broker parameters and the encrypted-password workflow are in [Install on Windows](../administration/installation/windows.md).

---

## Verify the installation

Do this on either platform before moving on.

**macOS**

```bash
curl -s http://127.0.0.1:8080/api/health
./scripts/linkiirctl doctor
```

**Windows**

```powershell
Invoke-RestMethod http://127.0.0.1:8080/api/health
```

The endpoint always returns HTTP 200. The `status` field carries the verdict:

| `status` | What to do |
| --- | --- |
| `healthy` | Continue to the next step. |
| `degraded` | Normal for the first minute after an install. The queue is reachable; the Runtime or Archiver is still settling. Wait and check again. |
| `unhealthy` | A dependency is unreachable, usually the broker. See [Troubleshooting](../administration/troubleshooting/index.md). |

If `degraded` persists, read `checks.runtime.detail` and `checks.archiver.detail` in the response — each names its own reason.

---

## Back up the encryption key now

Your installation generated a master encryption key at install time. It encrypts the broker and Log DB passwords Linkiir stores for you, so they are never written in clear.

| Platform | Key location |
| --- | --- |
| Windows | `C:\ProgramData\Linkiir\config\linkiir.env` |
| macOS (Docker) | `LINKIIR_SECRET_KEY` in the bundle's `.env` file |

Do not delete or regenerate it. If you lose it, your projects, workflows, users, and message history are unaffected — but the stored broker and database passwords can no longer be decrypted and have to be re-entered. Include it in your normal backups — see [Backup and Restore](../administration/backup-restore/index.md).

---

## Next

Continue with [Reset the Admin User](first-login.md).
