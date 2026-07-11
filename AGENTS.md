# AGENTS.md — Project Context & Progress

> **Living context file.** Every agent MUST read this before starting work and
> update it after making meaningful progress (completing a phase, making a
> decision, or changing scope). Keep it accurate — it is the shared source of truth.

## What we're building

An **AI Product Buzz Feed**: scrape/ingest the latest AI products launched in the
market plus the buzz/trend they generate in news, and present them as a feed
**ranked from high buzz to low buzz**.

## Stack

- **Frontend + Backend:** Next.js (App Router) — single full-stack app.
- **Database:** Supabase (Postgres).
- **Ingest:** source adapters; Firecrawl cloud REST API for Product Hunt + news.

## Key decisions (see `docs/superpowers/specs/2026-07-04-ai-product-buzz-feed-design.md`)

- Single full-stack Next.js app (not two separate apps).
- Sources v1: Hacker News (Algolia API), Product Hunt (Firecrawl scrape),
  Tech news (Firecrawl search).
- Buzz score is **engagement-only, deterministic** — no LLM, no recency decay in v1.
- Ingest is **on-demand** (API/button) — no scheduler in v1.
- v1 credentials: **Firecrawl API key + Supabase keys only** (no Product Hunt token).

## Buzz formula

`buzz_score = w_v·log(votes+1) + w_c·log(comments+1) + w_n·news_mentions`
(log-scaled, weights tunable in `lib/buzz.ts`). Rank `ORDER BY buzz_score DESC`.

## Phases

- [x] **Phase 0 — Scaffold:** Next.js app, Supabase schema, env, this doc.
- [ ] **Phase 1 — Vertical slice:** HN adapter → buzz → `products` → `GET /api/products`
      → minimal ranked feed + manual `POST /api/ingest`. Zero external creds.
- [ ] **Phase 2 — Full sources + polish:** Product Hunt + Tech-news adapters,
      cross-source dedupe, `ingest_runs` logging, feed polish.
- [ ] **Phase 3 — Deferred:** scheduling, social sources, LLM scoring, recency decay, alerts.

## Current status

- **Phase:** Phase 0 complete.
- **Done:** Task 1 and Task 2 complete: Next.js app scaffolded, Vitest configured, smoke test added, Supabase schema/env/admin client added, tests/build pass, and a basic Supabase Auth login page was added at `/login`.
- **Next:** Start Phase 1.

## Notes / open items

- Supabase schema was applied successfully in the Supabase SQL editor; `products` and `ingest_runs` are visible in the database.
- Login uses Supabase Auth from the browser and needs `NEXT_PUBLIC_SUPABASE_URL` plus `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.
