# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DineLead is a Restaurant CRM & Lead Scraping Platform. It scrapes restaurant data from Google Maps, manages leads through a CRM pipeline, and exports data in multiple formats.

## Commands

```bash
# Development
pnpm dev          # Start Next.js dev server (localhost:3000)
pnpm worker       # Start BullMQ background scraping worker (requires Redis on localhost:6379)

# Build
pnpm build        # Production build (ESLint and TypeScript errors are ignored)
pnpm start        # Start production server

# Database
pnpm seed:dev     # Full DB reset: prisma db push --force-reset + generate + seed
pnpm seed         # Seed only (no reset)

# Lint
pnpm lint         # next lint
```

> Both `pnpm dev` and `pnpm worker` must run simultaneously for scraping jobs to work.

## Architecture

**Next.js App Router** with route groups:
- `app/(auth)/` — public login/register pages
- `app/(protected)/` — authenticated pages (dashboard, restaurants, scraping-jobs, export, settings)
- `app/api/` — REST API routes

**Background job system:** Scraping runs via BullMQ (Redis queue). `app/api/scrape/` enqueues jobs; `worker/scrapper.worker.ts` processes them using the Google Maps API. Scraped data lands in `ScrapingData`, then users manually promote records to `Lead`/`Company`.

**Database (Prisma + PostgreSQL):** Schema in `prisma/schema.prisma`. Prisma client is generated to `lib/generated/prisma/` (non-standard output path — always import from there or via `lib/prisma.ts`). Key models: `User`, `Lead`, `Company`, `LeadStatus`, `ScrapingJob`, `ScrapingData`, `LeadNotes`, `LeadActivity`.

**Auth:** NextAuth.js v4 with credentials provider + Prisma adapter. JWT session strategy. Token is extended with `id`, `email`, `name` in `lib/auth.ts`. Default seeded admin: `admin@admin.com` / `password`.

**UI:** shadcn/ui (New York style) + Radix UI primitives + Tailwind CSS v4. Components in `components/ui/` are shadcn base components; feature components are in subdirectories (`components/dashboard/`, `components/restaurants/`, etc.).

**Export:** `lib/export-utils.ts` handles Excel (ExcelJS), CSV (json2csv), and JSON export formats.

## Key Environment Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | NextAuth JWT secret |
| *(none)* | Scraping uses Overpass API + Nominatim (OpenStreetMap) — no API key required |
| `NEXTAUTH_URL` | App base URL |

Redis must be running locally on port `6379` for the scraping worker.

## Path Aliases

`@/*` maps to the project root. Example: `@/lib/prisma`, `@/components/ui/button`, `@/types/restaurant.type`.

## Behavior Rules

- **Always ask before making important decisions** — do not assume or decide unilaterally on anything that affects architecture, data models, file structure, or business logic. When in doubt, ask the user first.