# Level One — Booking App

A Next.js booking system preserving the original Level One dark design, with Google Calendar, Zoom, and email integration.

## Tech Stack
- Next.js 14 (App Router)
- Google Calendar API (availability + event creation)
- Zoom Server-to-Server OAuth (auto-creates meeting rooms)
- Resend (confirmation emails)
- Make.com webhook (original integration preserved)

## Quick Start

```bash
npm install
cp .env.example .env.local
# Fill in your keys — see .env.example for instructions
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

See `.env.example` for all required keys and where to get them.

## Deploy

```bash
# Push to GitHub then import in vercel.com
# Or deploy directly via CLI:
npm install -g vercel
vercel --prod
```
