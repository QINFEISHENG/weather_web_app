# Weather Web App (Next.js + Prisma)

A simple Weather app with:
- **Data Collection**: fetch OpenWeather forecast and store into DB
- **Data Analyzer**: read stored forecast points and compute stats / series for charts

This repo supports:
- **Local dev database**: SQLite (fast + easy)
- **Production database**: Postgres (e.g. Supabase / Vercel Postgres)

Web application :
	Next.js App Router web app (React UI + API routes under app/api/**)

basic form, reporting:
	app/page.tsx provides a simple city input form
	app/report/page.tsx wraps client UI with Suspense
	app/report/report-client.tsx renders the report cards + temperature line chart

Data collection :
	app/api/data_collection/forecast/route.ts calls OpenWeather /forecast, normalizes results, writes FORECAST rows into WeatherSnapshot, logs into EventLog
	app/api/data_collection/weather/route.ts calls OpenWeather /weather, writes OBSERVED snapshot, logs into EventLog

Data analyzer:
	app/api/data_analyzer/forecast_stats/route.ts reads FORECAST rows and computes count / avg / min / max / min_at / max_at
	app/api/data_analyzer/forecast_series/route.ts reads FORECAST rows and returns time-series points for charting

Unit tests
	Jest unit tests for pure logic modules: lib/weather_analyzer.test.ts

Data persistence
	Prisma ORM  persists data into DB tables: WeatherSnapshot, EventLog

any data store
	Local dev: SQLite via prisma
	Production: Postgres via prisma

Rest collaboration internal or API endpoint
	External REST: OpenWeather API in collection routes
	Internal REST: UI calls your internal endpoints like /api/data_collection/forecast and /api/data_analyzer/forecast_stats

Product environment
	Hosted on Vercel as production environment
	Production env vars: DATABASE_URL (Postgres), OPENWEATHER_API_KEY

Integration tests
	Route-level tests call GET for API endpoints and validate response + side effects
	Examples:
	    app/api/data_collection/forecast/route.test.ts
	    app/api/data_analyzer/forecast_stats/route.test.ts

Using mock objects or any test doubles
	Prisma mocked with jest.mock
	global.fetch mocked to simulate OpenWeather responses
	This makes tests fast, deterministic, and offline-friendly

Continuous integration
	CI runs npm test  on each push/PR via GitHub Actions.

Production monitoring
	Sentry dependency included nextjs for error tracking.
	DB-side monitoring via EventLog 

instrumenting
	Structured logs in routes (e.g., [forecast_collect] start/ok) including requestId, ms, inserted count
	Easy to extend with more metrics (counts, durations, error codes)

Event collaboration messaging
	EventLog table acts like a lightweight “event bus log”: every significant operation emits an event record
	Example event types: FORECAST_SAVED, WEATHER_SNAPSHOT_SAVED.

Continuous delivery
	Git push will automatically activate Vercel auto build + deploy.
	DB migration is applied via prisma migrate deploy.


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