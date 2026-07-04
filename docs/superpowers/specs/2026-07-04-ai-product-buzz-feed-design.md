# AI Product Buzz Feed — Design

**Date:** 2026-07-04
**Status:** Approved
**Author:** brainstormed with Claude Code

## Problem

Track the latest AI products launched in the market, together with the buzz/trend
they are generating in news, and present them as a feed ranked from **high buzz to
low buzz**.

## Goals (v1)

- Ingest AI-product items from multiple sources on demand.
- Score each item's "buzz" deterministically from engagement metrics.
- Store in Supabase and expose a ranked feed (high → low buzz).
- Keep a living project-progress context file that every agent reads and updates.
- Ship in phases so v1 scope stays honest.

## Non-goals (v1, explicitly deferred)

- Scheduled/automatic ingestion (on-demand only in v1).
- Social sources (X / Reddit).
- LLM significance scoring.
- Recency-decay weighting.
- Alerts / notifications.

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| App topology | **Single full-stack Next.js (App Router)** app | Least infra, one deploy, shared types. "Backend"/"frontend" are folders. |
| Database | **Supabase** Postgres | Requested; managed Postgres + easy client. |
| Sources (v1) | Product Hunt, Hacker News, Tech news sites | Cover launches (PH/HN) + news trend (news sites). |
| Buzz scoring | **Engagement metrics only**, deterministic | Cheap, fast, reproducible. No LLM, no recency in v1. |
| Ingest cadence | **On-demand** (API/button trigger) | No scheduler infra in v1. |
| Context file | **Project-progress doc for coding agents** (`AGENTS.md`) | Living state doc agents read + update per phase. |
| Fetch strategy | API/RSS-first, Firecrawl where needed | Avoid brittle HTML scraping; minimize credentials. |

## Fetch strategy per source

| Source | Method | Notes |
|---|---|---|
| Hacker News | Free **Algolia HN Search API** | Clean JSON with points + comments. No key, no Firecrawl. |
| Product Hunt | **Firecrawl `/scrape`** with JSON extraction schema | Structured leaderboard. **No Product Hunt API token needed.** |
| Tech news | **Firecrawl `/search`** (source: news) + `/scrape` fallback | Mention count = news-buzz signal, uniform across sites. |

**v1 credentials required:** Firecrawl API key + Supabase keys only.

The Firecrawl API key is used by the **running app** (Firecrawl cloud REST API), not
the build-time MCP tools. Each source sits behind a `fetchItems()` adapter that
normalizes to one shape, so Firecrawl is a swappable implementation detail.

## Architecture

Single full-stack Next.js (App Router) app + Supabase Postgres.

```
tech-feed/
  AGENTS.md                  # living project-progress context doc
  src/
    app/
      page.tsx               # ranked feed UI (high→low buzz)
      api/
        products/route.ts    # GET ranked feed from Supabase
        ingest/route.ts      # POST on-demand ingest trigger (protected)
    lib/
      sources/
        types.ts             # RawItem normalized shape
        hackernews.ts        # fetchItems() via Algolia HN API
        producthunt.ts       # fetchItems() via Firecrawl /scrape
        technews.ts          # fetchItems() via Firecrawl /search (news)
      firecrawl.ts           # thin Firecrawl REST client
      buzz.ts                # deterministic engagement score
      ingest/run.ts          # orchestrate: fetch→dedupe→score→upsert
      supabase.ts            # server client
  supabase/
    schema.sql               # tables + indexes
```

## Data flow

1. `POST /api/ingest` → `ingest/run.ts`.
2. Call each source adapter → normalize to `RawItem[]`.
3. Dedupe by `(source, source_id)`.
4. `buzz.ts` scores each item.
5. Upsert into `products`; write one `ingest_runs` audit row.
6. `GET /api/products` → `SELECT ... ORDER BY buzz_score DESC`.
7. Feed page renders the ranked list + a "Scrape now" button → ingest route.

## Data model (Supabase)

### `products`
`id`, `source`, `source_id`, `title`, `tagline`, `url`, `launched_at`,
`votes`, `comments`, `news_mentions`, `buzz_score`,
`first_seen_at`, `last_updated_at`, `raw jsonb`.

- Unique `(source, source_id)` → idempotent upserts.
- Index on `buzz_score DESC`.

### `ingest_runs`
`id`, `started_at`, `finished_at`, `status`, `counts jsonb`
(per-source item counts + errors). Audit trail + "last updated" label.

## Buzz score (engagement-only, deterministic)

```
buzz_score = w_v·log(votes+1) + w_c·log(comments+1) + w_n·news_mentions
```

- Log-scaled so one source can't dominate.
- Weights `w_v`, `w_c`, `w_n` are tunable constants in `buzz.ts`.
- No recency decay in v1.
- Ranking is `ORDER BY buzz_score DESC`.

## Error handling

- Each adapter is isolated: a failing source records its error in the
  `ingest_runs.counts` payload and does not abort the whole run.
- Ingest route returns a per-source summary (counts + errors) so failures are visible.
- Upserts are idempotent, so re-running ingest is always safe.

## Testing

- Unit-test `buzz.ts` scoring (deterministic → easy assertions).
- Unit-test each adapter's normalization against a captured fixture payload
  (no live network in tests).
- Integration-test `ingest/run.ts` with stubbed adapters → asserts dedupe + upsert.

## Phases

### Phase 0 — Scaffold
Next.js app, Supabase project + `schema.sql`, env wiring, seeded `AGENTS.md`.

### Phase 1 — Vertical slice (one source, end-to-end)
HN adapter (free, easiest) → buzz score → `products` table → `GET /api/products`
→ minimal ranked feed UI + manual `POST /api/ingest`. Proves the whole pipeline
with zero external credentials.

### Phase 2 — Full sources + polish
Add Product Hunt (Firecrawl scrape) and Tech-news buzz (Firecrawl search) adapters,
cross-source dedupe/merge, `ingest_runs` logging, feed polish (buzz badges,
source filter, "last updated").

### Phase 3 — Later (deferred, not promised)
Scheduled ingestion (cron/worker), social sources, LLM significance scoring,
recency decay, alerts.

## Context file (`AGENTS.md`)

A living doc every agent reads and updates. Tracks: current phase, what's done,
key decisions, and next steps — updated as each phase completes.
