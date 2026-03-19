# Setup Guide

## Prerequisites

- A [Cloudflare](https://cloudflare.com) account (free)
- A Telegram bot token from [@BotFather](https://t.me/BotFather)
- A YouTube Data API v3 key from [Google Cloud Console](https://console.cloud.google.com)

## Steps

### 1. Clone the repository

```bash
git clone https://github.com/ali934h/youtube-latest-videos-bot
cd youtube-latest-videos-bot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure secrets in Cloudflare

```bash
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put YOUTUBE_API_KEY
npx wrangler secret put ALLOWED_USER_IDS
```

> For `ALLOWED_USER_IDS`, enter a comma-separated list of numeric Telegram user IDs.
> Example: `123456789,987654321`

### 4. Deploy

```bash
npx wrangler deploy
```

### 5. Register Webhook

After deploying, register the webhook with Telegram by visiting:

```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://<YOUR_WORKER_URL>/webhook
```

## Usage

Send the bot a message in this format:

```
@Capitol_Report 5
```

Or with a full URL:

```
https://www.youtube.com/@Capitol_Report 5
```

The bot will reply with the latest 5 video links from that channel.
