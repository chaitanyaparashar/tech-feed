## Product Overview

The AI Product Buzz Feed is a lightweight product discovery tool that collects newly launched AI products and the engagement signals surrounding them, then presents them in a ranked feed from highest buzz to lowest buzz. It is designed for people who want to quickly notice what is gaining attention in the AI space without manually scanning multiple sources.

## Goals & Non-Goals

### Goals
- Aggregate AI product launches and related buzz signals from multiple sources.
- Score each item deterministically using engagement metrics such as votes, comments, and news mentions.
- Surface the most interesting products first through a ranked feed.
- Support on-demand ingestion so the data can be refreshed manually.

### Non-Goals
- Automatic or scheduled ingestion in v1.
- Social source coverage such as X or Reddit.
- LLM-based significance scoring.
- Recency-decay based ranking.
- Notifications, alerts, or personalized recommendations.

## Target Users / Personas

- **Curious product watchers** who want a fast view of what is new in AI.
- **Developers and builders** who want to discover tools and launches without reading many separate sources.
- **Stakeholders or reviewers** who need a simple, ranked summary of product momentum.

## Core Features

- **Multi-source ingestion** — pulls product and buzz data from Hacker News, Product Hunt, and tech news sources so the feed is broader than a single channel.
- **Deterministic buzz scoring** — ranks items using a fixed formula based on engagement signals, making results explainable and repeatable.
- **Ranked product feed** — presents results in descending order of computed buzz so the most relevant items appear first.
- **On-demand refresh** — lets a user or operator trigger ingestion manually when fresh data is needed.
- **Data persistence** — stores ingested items and ingest run metadata so the feed can be served consistently from a database.

## Tech Stack & Architecture Summary

- **Frontend and backend:** Next.js (App Router) in a single full-stack application.
- **Database:** Supabase Postgres.
- **Ingestion layer:** source-specific adapters that normalize data into a shared item shape.
- **External integrations:** Hacker News API, Firecrawl for Product Hunt and news search, and Supabase for storage.
- **Validation:** Vitest-based unit and integration tests.

## Key User Flows

### 1. View the ranked feed
1. A user opens the main product page.
2. The application reads ranked product items from the API.
3. The feed displays the results from highest buzz to lowest buzz.

### 2. Trigger an ingest run
1. A user or operator clicks the ingestion action.
2. The system calls the ingest endpoint.
3. Source adapters fetch fresh data, normalize it, score it, and store it.
4. The user sees the updated feed and ingest summary.

### 3. Review stored product data
1. A user or developer inspects the API output for the current ranked list.
2. The data is returned from Supabase using the stored buzz score.
3. The UI or downstream consumers can use that list for discovery or analysis.

## Constraints & Assumptions

- The v1 product is **on-demand only**; there is no scheduled ingestion or background worker in scope.
- Buzz scoring is **engagement-only** and does not include recency decay or LLM-based interpretation.
- The initial implementation depends on **Firecrawl API credentials** and **Supabase credentials** for full source coverage.
- The project assumes a single deployment environment with a unified Next.js app and Supabase database.
- The Supabase schema is expected to be applied manually unless automated migration tooling is added later.

## Success Metrics

- The feed successfully returns ranked product items from the database.
- Ingestion runs complete and store new data without duplicate conflicts.
- Users can quickly identify the highest-buzz products from the feed.
- The system remains deterministic and reproducible for the same input set.

## Open Questions / Assumptions Made

- The exact product UI design and presentation details beyond a ranked feed are not fully specified in the provided materials.
- The intended audience for the public-facing experience is inferred as general AI-curious users, but no explicit audience segmentation was provided.
- The final production deployment and hosting approach were not specified, so this document assumes a standard Next.js + Supabase deployment model.
- The precise source-specific data fields and fallback handling for failed adapters were not fully detailed, so this document assumes a best-effort ingestion model with per-source error handling.
