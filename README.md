# Weather Web App (Next.js + Prisma)

A simple Weather app with:
- **Data Collection**: fetch OpenWeather forecast and store into DB
- **Data Analyzer**: read stored forecast points and compute stats / series for charts

This repo supports:
- **Local dev database**: SQLite (fast + easy)
- **Production database**: Postgres (e.g. Supabase / Vercel Postgres)

---

## Requirements

- Node.js 18+ (recommended)
- npm

---

## 1 Install

bash

npm install

## 2 Environment Variables

Create .env.local:

OPENWEATHER_API_KEY="YOUR_OPENWEATHER_KEY"
DATABASE_URL="file:./dev.db"

## 3  Database (Local SQLite) — first time setup

npm run db:local:reset
npm run prisma:local:generate
npm run prisma:local:migrate


## 4  Run it!!!!!

npm run dev