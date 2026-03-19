# 📺 YouTube Latest Videos Bot

A Telegram bot powered by **Cloudflare Workers** that fetches the latest videos from any YouTube channel — including live streams, archived streams, and regular videos.

---

## ✨ Features

- Fetch latest **N** videos from any YouTube channel
- Supports `@handle` or full YouTube URL as input
- Detects video type: 🎬 Video · 📡 Stream · 🔴 Live · 🔔 Upcoming
- Shows video duration and publish date in **Iran time (UTC+3:30)**
- Access restricted to whitelisted Telegram user IDs
- Runs **serverless** on Cloudflare Workers (free tier)

---

## 🚀 Quick Setup

### Prerequisites

| Tool | Link |
|------|------|
| Node.js (v18+) | https://nodejs.org |
| Cloudflare account (free) | https://cloudflare.com |
| Telegram bot token | [@BotFather](https://t.me/BotFather) |
| YouTube Data API v3 key | [Google Cloud Console](https://console.cloud.google.com) |

---

### Step 1 — Clone the repository

```bash
git clone https://github.com/ali934h/youtube-latest-videos-bot
cd youtube-latest-videos-bot
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Get a Cloudflare API Token

1. Go to [Cloudflare Dashboard → API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token**
3. Use the **Edit Cloudflare Workers** template
4. Copy the generated token

Set it as an environment variable:

```bash
# macOS / Linux
export CLOUDFLARE_API_TOKEN=your_token_here

# Windows (Command Prompt)
set CLOUDFLARE_API_TOKEN=your_token_here

# Windows (PowerShell)
$env:CLOUDFLARE_API_TOKEN="your_token_here"
```

### Step 4 — Deploy to Cloudflare Workers

```bash
npx wrangler deploy
```

After deployment you will see your Worker URL:
```
https://youtube-latest-videos-bot.<your-subdomain>.workers.dev
```

### Step 5 — Set secrets

Run each command and enter the value when prompted:

```bash
npx wrangler secret put TELEGRAM_BOT_TOKEN
```
> Enter your Telegram bot token from @BotFather

```bash
npx wrangler secret put YOUTUBE_API_KEY
```
> Enter your YouTube Data API v3 key from Google Cloud Console

```bash
npx wrangler secret put ALLOWED_USER_IDS
```
> Enter comma-separated Telegram numeric user IDs
> Example: `123456789,987654321`
>
> 💡 To find your Telegram user ID, message [@userinfobot](https://t.me/userinfobot)

### Step 6 — Register Telegram Webhook

Open this URL in your browser (replace the placeholders):

```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://<YOUR_WORKER_URL>/webhook
```

You should see:
```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

### Step 7 — Set bot commands (optional but recommended)

Open this URL in your browser to register shortcut commands:

```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setMyCommands?commands=[{"command":"start","description":"Show welcome message"},{"command":"help","description":"How to use the bot"},{"command":"examples","description":"Show usage examples"}]
```

---

## 💬 Usage

Send the bot a message in this format:

```
@ChannelHandle N
```

**Examples:**

```
@Capitol_Report 5
@MrBeast 10
https://www.youtube.com/@veritasium 3
```

The bot replies with the latest N videos including type, duration, and publish date.

---

## 📋 Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message and quick guide |
| `/help` | Detailed usage instructions |
| `/examples` | Ready-to-use example queries |

---

## 🔧 Environment Variables

| Variable | Description |
|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | Telegram bot token from @BotFather |
| `YOUTUBE_API_KEY` | YouTube Data API v3 key |
| `ALLOWED_USER_IDS` | Comma-separated allowed Telegram user IDs |

---

## 🔄 Updating

To deploy updates:

```bash
git pull origin main
npx wrangler deploy
```

---

## 📄 License

MIT
