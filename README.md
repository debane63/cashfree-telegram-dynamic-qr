Cashfree + Telegram Dynamic QR (Vercel)

## Overview
This example creates dynamic QR / payment link for a Telegram user using Cashfree Orders API, verifies webhook and credits points automatically.

## Environment Variables (set in Vercel dashboard)
- `CASHFREE_APP_ID` — your Cashfree APP ID
- `CASHFREE_SECRET` — your Cashfree SECRET
- `TELEGRAM_BOT_TOKEN` — Telegram bot token
- `BASE_URL` — your deployed base URL e.g. https://your-app.vercel.app

## Setup steps
1. Create a GitHub repo and push these files.
2. Go to Vercel, import the GitHub repo and deploy.
3. In Vercel Project Settings -> Environment Variables, add the variables above (for Production and Preview if needed).
4. Configure Cashfree dashboard:
   - Set your webhook URL to `https://<YOUR_BASE>/api/cashfree-webhook`
5. Configure Telegram webhook:
   - Call: `https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=https://<YOUR_BASE>/api/telegram-webhook`

## Usage
- User sends `/pay 10` to your Telegram bot — bot creates an order and sends the payment link.
- On successful payment Cashfree will POST to `/api/cashfree-webhook` and the user will be credited points equal to the paid amount.

## Notes & Security
- This is a minimal demo. Do NOT use flat JSON files in production. Use a DB.
- Verify Cashfree webhook signature per Cashfree docs.
- Use HTTPS and secure your env vars.
