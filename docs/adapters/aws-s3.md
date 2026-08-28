---
title: AWS S3 Adapter
sidebar_label: AWS S3
description: Configure the Linkiir S3 adapter to poll a bucket for new objects, upload messages as objects, and browse bucket contents from a browser.
keywords: [AWS S3, object storage, adapter, MinIO, S3-compatible, IAM]
---

# AWS S3 Adapter

Three nodes for moving messages through S3 or any S3-compatible object store:

| Node | Palette group | What it does |
| --- | --- | --- |
| **S3 Source** | Source Custom | Polls a prefix, downloads new objects, pushes each one downstream |
| **S3 Destination** | Transform Custom | Uploads every message it receives as a new object |
| **S3 Explorer** | Source HTTP | Serves a page for listing and viewing objects in the bucket |

Part of the Linkiir Adapters package — see [requesting the package](index.md#requesting-the-adapters-package).

```text
bucket  →  S3 Source  →  your workflow  →  S3 Destination  →  bucket
```

## Before you start

Collect:

- The **region** and **bucket name**.
- An **access key ID** and **secret access key** for an IAM user or role with access to that bucket.

The identity needs these actions on the target bucket:

```json
{
  "Effect": "Allow",
  "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject", "s3:ListBucket"],
  "Resource": [
    "arn:aws:s3:::your-bucket-name",
    "arn:aws:s3:::your-bucket-name/*"
  ]
}
```

| Placeholder | Replace with |
| --- | --- |
| `your-bucket-name` | The name of your bucket, in both entries |

`s3:ListBucket` applies to the bucket itself, the other three to the objects inside it. Drop `s3:DeleteObject` if you leave **Delete After Download** off, and drop `s3:PutObject` if you only ever read.

## Set it up

1. Open each S3 node in the Workflow Builder, click **Edit**, and enter the connection fields:

   | Field | Value |
   | --- | --- |
   | **Region** | The bucket's region, for example `us-east-1` |
   | **Bucket Name** | The bucket to connect to |
   | **Access Key** | The IAM access key ID |
   | **Secret Key** | The IAM secret access key |

   Region matters beyond routing: it is part of how each request is signed, so a mismatch fails even when the bucket name is right.

2. Configure the behavior fields for the node you are using, from the tables below.
3. Leave **Live Mode** off — the S3 nodes ship that way — and start the node. It builds and signs each request and logs it without sending anything.
4. Turn **Live Mode** on when the log looks right.

### Talking to an S3-compatible service

Set **Endpoint Override** to point the same nodes at MinIO, LocalStack, Backblaze B2, Cloudflare R2, or another S3-compatible API. Leave it empty for AWS. For a service with a self-signed certificate, and only on a local test service, turn **Verify TLS** off.

## Configuration reference

### Shared connection fields

| Field | Type | Default | Purpose |
| --- | --- | --- | --- |
| **Region** | string | *(empty)* | Bucket region. Part of the request signature |
| **Bucket Name** | string | *(empty)* | Bucket to connect to |
| **Access Key** | password | *(empty)* | IAM access key ID |
| **Secret Key** | password | *(empty)* | IAM secret access key |
| **Endpoint Override** | string | *(empty)* | Base URL of an S3-compatible service. Empty means AWS |
| **Verify TLS** | bool | `true` | Verify the endpoint's TLS certificate |
| **Live Mode** | bool | `false` | Off signs and logs the request without sending it |

### S3 Source

| Field | Type | Default | Purpose |
| --- | --- | --- | --- |
| **Interval** | number | `60000` | Milliseconds between polls |
| **Prefix** | string | `incoming/` | Key prefix to watch |
| **Minimum Object Age** | number | `60` | Seconds an object must exist before it is picked up |
| **Max Objects Per Poll** | number | `10` | Cap on objects handled in one cycle |
| **Delete After Download** | bool | `true` | Remove the object from the bucket after a successful push |

:::info[Why objects must age]
An object being written is visible in a listing before the write finishes. **Minimum Object Age** makes the poller ignore anything newer than the age you set, so it never downloads half a file. Lower it only when you know the writer uploads atomically.
:::

### S3 Destination

| Field | Type | Default | Purpose |
| --- | --- | --- | --- |
| **Key Prefix** | string | `incoming/` | Prepended to every object key |
| **Key Naming** | list | `Timestamp + GUID` | How the unique part of the key is generated |
| **Key Extension** | string | `json` | File extension, without the dot |
| **Content Type** | string | `application/json` | Content type stored with the object |

| **Key Naming** option | Result | Trade-off |
| --- | --- | --- |
| Timestamp + GUID | Sorts chronologically and never collides | Longest keys |
| Timestamp | Sorts chronologically | Two messages in the same second collide |
| GUID | Never collides | No ordering |

### S3 Explorer

| Field | Type | Default | Purpose |
| --- | --- | --- | --- |
| **Route Path** | string | *(supplied)* | The URL path the page is served on |
| **Allowed Prefix** | string | *(supplied)* | The viewer refuses any key outside this prefix |
| **Max View Bytes** | number | `256 KB` | Cap on the size of an object the page will display |

:::danger[The Explorer page has no authentication]
Anyone who can reach the node's HTTP port can read every object under **Allowed Prefix**. Use it on a local or isolated network for setup and demonstration, and do not expose it from a production installation or through a public endpoint. **Allowed Prefix** and **Max View Bytes** limit the blast radius; they are not access control. See [Security](../administration/security/index.md).
:::

## Verify it worked

- With **Live Mode** off, the node logs the request it would have sent, including the signed key and bucket.
- Upload a file into the source prefix, wait for **Minimum Object Age** to pass, and the source node's next poll pushes it and logs the key.
- Send a message through the destination node and the object appears in the bucket under **Key Prefix**.

## If it didn't work

| Symptom | Cause | Fix |
| --- | --- | --- |
| `403 AccessDenied` | Wrong credentials, or the IAM identity lacks a required action | Verify the keys; grant `GetObject`, `PutObject`, `DeleteObject`, `ListBucket` |
| `403 SignatureDoesNotMatch` | The secret key has a typo or trailing whitespace | Re-enter **Secret Key** cleanly |
| `404 NoSuchBucket` | Bucket name or region is wrong | Both must match — region is part of the signature |
| `failed to decrypt field` | The project was imported to a different installation | Re-enter **Access Key** and **Secret Key** on this installation |
| Poller finds nothing | Objects are younger than **Minimum Object Age**, or **Prefix** does not match where they land | Wait for the age gate; check the prefix |
| Objects remain after download | Listings take a moment to catch up, or **Delete After Download** is off | Re-check shortly after; confirm the field |
| Explorer page lists nothing | Nothing in the bucket under **Allowed Prefix** | Upload something first |

## Next

- [How Adapters Work](how-adapters-work.md)
- [Source Nodes](../interface-development/interfaces/source-nodes.md)
- [Security](../administration/security/index.md)
