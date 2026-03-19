# YouTube Latest Videos Bot

A Telegram bot powered by Cloudflare Workers that fetches the latest videos from any YouTube channel.

## Features

- Fetch latest N videos from any YouTube channel (supports `@handle`, full URL)
- Supports regular videos, live streams, and premieres
- Access restricted to whitelisted Telegram user IDs
- Runs serverless on Cloudflare Workers (free tier)

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Bot**: Telegram Bot API (Webhook)
- **Data**: YouTube Data API v3

## Environment Variables

| Variable | Description |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Your Telegram bot token from @BotFather |
| `YOUTUBE_API_KEY` | Your YouTube Data API v3 key |
| `ALLOWED_USER_IDS` | Comma-separated list of allowed Telegram numeric user IDs |

## Setup

See [docs/SETUP.md](docs/SETUP.md) for full setup instructions.
