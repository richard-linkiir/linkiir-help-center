---
title: Slack Adapter
sidebar_label: Slack
description: Configure the Linkiir Slack adapter to post workflow messages and alerts into a Slack channel.
keywords: [Slack, adapter, notifications, bot token, channel]
---

# Slack Adapter

A **Transform Custom** node that posts the message reaching it into a Slack channel.

Part of the Linkiir Adapters package — see [requesting the package](index.md#requesting-the-adapters-package).

## What it does

When a message arrives, the node posts its content to the configured channel as your Slack app. It can prefix the post with a mention, resolved from an email address, so the right person is notified.

```text
upstream node  →  Slack Adapter  →  Slack channel
```

Common uses: alerting a support channel when a feed errors, and announcing that a batch finished.

## Before you start

In your Slack workspace:

1. Create a Slack app, or use an existing one.
2. Under **OAuth & Permissions**, add the scopes the app needs to post messages, and to look up users by email if you plan to use mentions.
3. Install the app to the workspace and copy the **Bot User OAuth Token**.
4. Invite the app to the target channel. A bot that is not in the channel cannot post to it.
5. Copy the **channel ID** from the channel's URL.

:::caution Treat the bot token as a credential
Enter the token in the **API Token** field, which is masked and encrypted in the project. Anyone holding it can post as your app. Rotate it in Slack if it is ever exposed.
:::

## Set it up

1. Open the Slack node in the Workflow Builder and click **Edit**.
2. Fill in the fields:

   | Field | Value |
   | --- | --- |
   | **API Token** | The Bot User OAuth Token |
   | **Channel ID** | The target channel's ID |
   | **Mention Email** | Optional. The email of a workspace member to mention |

3. Set **Live Mode** off, then **Save**.
4. Send one message through and check the log — it shows the post that would have been made.
5. Turn **Live Mode** on and send another. The message appears in the channel.

## Configuration reference

| Field | Type | Default | Purpose |
| --- | --- | --- | --- |
| **API Token** | password | *(empty)* | Slack Bot User OAuth Token |
| **Channel ID** | string | *(empty)* | Target channel identifier |
| **Mention Email** | string | *(empty)* | Email resolved to a user mention on the post. Leave empty for no mention |
| **Live Mode** | bool | `true` | When off, nothing is sent to Slack |
| **Verify TLS** | bool | `true` | Verify Slack's TLS certificate |

## Verify it worked

- With **Live Mode** on, the message appears in the channel within a second or two.
- With **Mention Email** set, the post begins with that person's mention.
- The node log records the outcome for each attempt.

## If it didn't work

| Symptom in the log | Cause | Fix |
| --- | --- | --- |
| `SLACK_ERROR: invalid_auth` | The token is wrong or has been revoked | Regenerate the Bot Token in the Slack app settings and re-enter it |
| `SLACK_ERROR: channel_not_found` | The channel ID is wrong | Copy the ID again from the channel's URL |
| `SLACK_ERROR: not_in_channel` | The app was never invited to that channel | Invite it, then retry |
| `SLACK_ERROR: missing_scope` | The app lacks a scope the call needs | Add the scope under **OAuth & Permissions** and reinstall the app |
| `USER_NOT_FOUND` | **Mention Email** is not a member of the workspace | Use a member's email, or clear the field |
| `REQUEST_FAILED` or a timeout | The server cannot reach Slack | Check outbound network access and DNS |
| Posts arrive empty | The upstream node is sending nothing | Check the source or transform produces content |
| Nothing is posted, no error | **Live Mode** is off | Turn **Live Mode** on |

## Next

- [How Adapters Work](how-adapters-work.md)
- [Alerting and Notifications](../administration/notifications/index.md)
- [Error Handling and Retry](../interface-development/error-handling.md)
