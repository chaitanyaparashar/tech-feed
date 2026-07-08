# AI Product Buzz Feed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ingest the latest AI products (launches + news buzz) from multiple sources into Supabase and present them as a feed ranked high→low buzz.

**Architecture:** A single full-stack Next.js (App Router) app. Source adapters normalize each source to one `RawItem` shape; a pure buzz scorer ranks them; an ingest orchestrator dedupes and upserts into Supabase; API routes expose an on-demand ingest trigger and a ranked feed that the UI renders.

**Tech Stack:** Next.js (App Router, TypeScript), Supabase (Postgres, `@supabase/supabase-js`), Vitest (tests), Firecrawl cloud REST API (Product Hunt + news ingest).

## Global Constraints

- Language: **TypeScript**, `strict: true`. No `any` in committed code.
- Node: **v20+**. Package manager: **npm**.
- Test runner: **Vitest**. Every `lib/` module with logic has a colocated `*.test.ts`.
- Network boundaries are isolated: adapters split a **pure parser** (tested with a fixture) from a thin **fetcher** (does I/O). Tests never hit the live network.
- Buzz score is **engagement-only, deterministic**: `buzz_score = w_v·ln(votes+1) + w_c·ln(comments+1) + w_n·news_mentions`. Weights live in `lib/buzz.ts`: `w_v=1.0`, `w_c=0.5`, `w_n=2.0`.
- Ingest is **on-demand only** (no scheduler in v1).
- Secrets come from env only: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `FIRECRAWL_API_KEY`, `INGEST_SECRET`. Never commit `.env.local`.
- After finishing each Phase, update `AGENTS.md` (check the phase box, update "Current status").
- Commit after every task with a Conventional Commit message.

---

## File Structure

- `package.json`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts` — project config
- `.env.example` — documents required env vars (committed); `.env.local` — real secrets (gitignored)
- `supabase/schema.sql` — tables + indexes
- `src/lib/supabase.ts` — server-side Supabase client factory
- `src/lib/sources/types.ts` — `SourceName`, `RawItem`
- `src/lib/sources/hackernews.ts` — `parseHNResponse` (pure) + `fetchItems` (I/O)
- `src/lib/sources/producthunt.ts` — `parseProductHunt` (pure) + `fetchItems` (I/O)
- `src/lib/sources/technews.ts` — `parseTechNews` (pure) + `fetchItems` (I/O)
- `src/lib/firecrawl.ts` — thin Firecrawl REST client (`scrape`, `search`)
- `src/lib/buzz.ts` — `scoreBuzz` (pure)
- `src/lib/ingest/run.ts` — `runIngest` orchestrator (dedupe → score → upsert → log)
- `src/app/api/products/route.ts` — `GET` ranked feed
- `src/app/api/ingest/route.ts` — `POST` on-demand trigger (auth-gated)
- `src/app/page.tsx` — ranked feed UI + "Scrape now" button
- `src/app/_components/*` — feed presentational components (Phase 2 polish)
- Test fixtures under `src/lib/sources/__fixtures__/`

---

## PHASE 0 — Scaffold

### Task 1: Initialize Next.js app + Vitest

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`, `.gitignore`, `src/app/layout.tsx`, `src/app/page.tsx`
- Test: `src/lib/smoke.test.ts`

**Interfaces:**
- Produces: a runnable Next.js app and a green `npm test` command.

- [ ] **Step 1: Scaffold the app non-interactively**

```bash
npx create-next-app@latest . --ts --app --src-dir --eslint --no-tailwind --import-alias "@/*" --use-npm --yes
```

- [ ] **Step 2: Add Vitest dev dependencies**

```bash
npm install -D vitest
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: { environment: "node", include: ["src/**/*.test.ts"] },
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
});
```

- [ ] **Step 4: Add the test script to `package.json`**

Add to `"scripts"`: `"test": "vitest run"`, `"test:watch": "vitest"`.

- [ ] **Step 5: Write a smoke test**

```ts
// src/lib/smoke.test.ts
import { expect, test } from "vitest";

test("smoke: math works", () => {
  expect(1 + 1).toBe(2);
});
```

- [ ] **Step 6: Run tests — expect PASS**

Run: `npm test`
Expected: 1 passed.

- [ ] **Step 7: Verify the app builds**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js app with Vitest"
```

---

### Task 2: Supabase schema + client + env

**Files:**
- Create: `supabase/schema.sql`, `src/lib/supabase.ts`, `.env.example`
- Modify: `.gitignore` (ensure `.env.local` ignored)
- Test: `src/lib/supabase.test.ts`

**Interfaces:**
- Produces: `getSupabaseAdmin(): SupabaseClient` — a server-only client built from `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`.

- [ ] **Step 1: Install the Supabase client**

```bash
npm install @supabase/supabase-js
```

- [ ] **Step 2: Write `supabase/schema.sql`**

```sql
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  source_id text not null,
  title text not null,
  tagline text,
  url text not null,
  launched_at timestamptz,
  votes integer not null default 0,
  comments integer not null default 0,
  news_mentions integer not null default 0,
  buzz_score double precision not null default 0,
  raw jsonb,
  first_seen_at timestamptz not null default now(),
  last_updated_at timestamptz not null default now(),
  unique (source, source_id)
);
create index if not exists products_buzz_idx on products (buzz_score desc);

create table if not exists ingest_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running',
  counts jsonb
);
```

- [ ] **Step 3: Write `.env.example`**

```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
FIRECRAWL_API_KEY=
INGEST_SECRET=
```

- [ ] **Step 4: Write the failing test**

```ts
// src/lib/supabase.test.ts
import { afterEach, expect, test } from "vitest";
import { getSupabaseAdmin } from "@/lib/supabase";

afterEach(() => {
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
});

test("throws when env is missing", () => {
  expect(() => getSupabaseAdmin()).toThrow(/SUPABASE_URL/);
});

test("builds a client when env is present", () => {
  process.env.SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-key";
  const client = getSupabaseAdmin();
  expect(client).toBeDefined();
  expect(typeof client.from).toBe("function");
});
```

- [ ] **Step 5: Run test — expect FAIL**

Run: `npm test -- supabase`
Expected: FAIL — cannot find module `@/lib/supabase`.

- [ ] **Step 6: Implement `src/lib/supabase.ts`**

```ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error("Missing SUPABASE_URL");
  if (!key) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
}
```

- [ ] **Step 7: Run test — expect PASS**

Run: `npm test -- supabase`
Expected: 2 passed.

- [ ] **Step 8: Apply schema to Supabase (manual, one-time)**

Paste `supabase/schema.sql` into the Supabase SQL editor and run it. Record completion in `AGENTS.md` notes.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add Supabase schema, admin client, and env template"
```

---

## PHASE 1 — Vertical slice (Hacker News, end-to-end)

### Task 3: Normalized types + buzz scorer

**Files:**
- Create: `src/lib/sources/types.ts`, `src/lib/buzz.ts`
- Test: `src/lib/buzz.test.ts`

**Interfaces:**
- Produces: `type SourceName = "hackernews" | "producthunt" | "technews"`.
- Produces: `interface RawItem { source: SourceName; source_id: string; title: string; tagline: string | null; url: string; launched_at: string | null; votes: number; comments: number; news_mentions: number; }`
- Produces: `scoreBuzz(item: Pick<RawItem, "votes" | "comments" | "news_mentions">): number`.

- [ ] **Step 1: Write `src/lib/sources/types.ts`**

```ts
export type SourceName = "hackernews" | "producthunt" | "technews";

export interface RawItem {
  source: SourceName;
  source_id: string;
  title: string;
  tagline: string | null;
  url: string;
  launched_at: string | null; // ISO 8601
  votes: number;
  comments: number;
  news_mentions: number;
}
```

- [ ] **Step 2: Write the failing test**

```ts
// src/lib/buzz.test.ts
import { expect, test } from "vitest";
import { scoreBuzz } from "@/lib/buzz";

test("zero engagement scores zero", () => {
  expect(scoreBuzz({ votes: 0, comments: 0, news_mentions: 0 })).toBe(0);
});

test("news mentions are weighted highest", () => {
  const votes = scoreBuzz({ votes: 10, comments: 0, news_mentions: 0 });
  const news = scoreBuzz({ votes: 0, comments: 0, news_mentions: 10 });
  expect(news).toBeGreaterThan(votes);
});

test("more engagement scores higher (monotonic)", () => {
  const low = scoreBuzz({ votes: 5, comments: 2, news_mentions: 1 });
  const high = scoreBuzz({ votes: 50, comments: 20, news_mentions: 3 });
  expect(high).toBeGreaterThan(low);
});
```

- [ ] **Step 3: Run test — expect FAIL**

Run: `npm test -- buzz`
Expected: FAIL — cannot find module `@/lib/buzz`.

- [ ] **Step 4: Implement `src/lib/buzz.ts`**

```ts
import type { RawItem } from "@/lib/sources/types";

export const BUZZ_WEIGHTS = { votes: 1.0, comments: 0.5, news_mentions: 2.0 };

export function scoreBuzz(
  item: Pick<RawItem, "votes" | "comments" | "news_mentions">,
): number {
  return (
    BUZZ_WEIGHTS.votes * Math.log(item.votes + 1) +
    BUZZ_WEIGHTS.comments * Math.log(item.comments + 1) +
    BUZZ_WEIGHTS.news_mentions * item.news_mentions
  );
}
```

- [ ] **Step 5: Run test — expect PASS**

Run: `npm test -- buzz`
Expected: 3 passed.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add RawItem type and deterministic buzz scorer"
```

---

### Task 4: Hacker News adapter

**Files:**
- Create: `src/lib/sources/hackernews.ts`, `src/lib/sources/__fixtures__/hn.json`
- Test: `src/lib/sources/hackernews.test.ts`

**Interfaces:**
- Consumes: `RawItem`, `SourceName` from `@/lib/sources/types`.
- Produces: `parseHNResponse(json: unknown): RawItem[]` (pure).
- Produces: `fetchItems(): Promise<RawItem[]>` (queries Algolia HN Search API for "AI", maps via `parseHNResponse`).

- [ ] **Step 1: Create a trimmed fixture `src/lib/sources/__fixtures__/hn.json`**

```json
{
  "hits": [
    {
      "objectID": "40001",
      "title": "Show HN: MyAI – an AI product",
      "url": "https://example.com/myai",
      "points": 250,
      "num_comments": 88,
      "created_at": "2026-07-03T10:00:00.000Z"
    },
    {
      "objectID": "40002",
      "title": "AI thing with no url",
      "url": null,
      "points": 12,
      "num_comments": 3,
      "created_at": "2026-07-02T09:00:00.000Z"
    }
  ]
}
```

- [ ] **Step 2: Write the failing test**

```ts
// src/lib/sources/hackernews.test.ts
import { expect, test } from "vitest";
import fixture from "@/lib/sources/__fixtures__/hn.json";
import { parseHNResponse } from "@/lib/sources/hackernews";

test("maps HN hits to RawItem", () => {
  const items = parseHNResponse(fixture);
  expect(items).toHaveLength(2);
  const first = items[0];
  expect(first.source).toBe("hackernews");
  expect(first.source_id).toBe("40001");
  expect(first.votes).toBe(250);
  expect(first.comments).toBe(88);
  expect(first.news_mentions).toBe(0);
  expect(first.url).toBe("https://example.com/myai");
});

test("falls back to the HN item URL when url is null", () => {
  const items = parseHNResponse(fixture);
  expect(items[1].url).toBe("https://news.ycombinator.com/item?id=40002");
});
```

- [ ] **Step 3: Run test — expect FAIL**

Run: `npm test -- hackernews`
Expected: FAIL — cannot find module `@/lib/sources/hackernews`.

- [ ] **Step 4: Implement `src/lib/sources/hackernews.ts`**

```ts
import type { RawItem } from "@/lib/sources/types";

interface HNHit {
  objectID: string;
  title: string;
  url: string | null;
  points: number;
  num_comments: number;
  created_at: string;
}

export function parseHNResponse(json: unknown): RawItem[] {
  const hits = (json as { hits?: HNHit[] }).hits ?? [];
  return hits.map((h) => ({
    source: "hackernews",
    source_id: h.objectID,
    title: h.title,
    tagline: null,
    url: h.url ?? `https://news.ycombinator.com/item?id=${h.objectID}`,
    launched_at: h.created_at ?? null,
    votes: h.points ?? 0,
    comments: h.num_comments ?? 0,
    news_mentions: 0,
  }));
}

const HN_ENDPOINT =
  "https://hn.algolia.com/api/v1/search?query=AI&tags=story&hitsPerPage=50";

export async function fetchItems(): Promise<RawItem[]> {
  const res = await fetch(HN_ENDPOINT);
  if (!res.ok) throw new Error(`HN API ${res.status}`);
  return parseHNResponse(await res.json());
}
```

- [ ] **Step 5: Run test — expect PASS**

Run: `npm test -- hackernews`
Expected: 2 passed.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add Hacker News source adapter"
```

---

### Task 5: Ingest orchestrator

**Files:**
- Create: `src/lib/ingest/run.ts`
- Test: `src/lib/ingest/run.test.ts`

**Interfaces:**
- Consumes: `RawItem` from `@/lib/sources/types`; `scoreBuzz` from `@/lib/buzz`.
- Produces: `type IngestDeps = { sources: Array<() => Promise<RawItem[]>>; upsert: (rows: ProductRow[]) => Promise<void> }`.
- Produces: `type ProductRow = RawItem & { buzz_score: number }`.
- Produces: `runIngest(deps: IngestDeps): Promise<{ total: number; bySource: Record<string, number>; errors: string[] }>`.

- [x] **Step 1: Write the failing test**

```ts
// src/lib/ingest/run.test.ts
import { expect, test, vi } from "vitest";
import { runIngest } from "@/lib/ingest/run";
import type { RawItem } from "@/lib/sources/types";

const item = (over: Partial<RawItem>): RawItem => ({
  source: "hackernews",
  source_id: "1",
  title: "x",
  tagline: null,
  url: "https://x",
  launched_at: null,
  votes: 0,
  comments: 0,
  news_mentions: 0,
  ...over,
});

test("scores, dedupes, and upserts across sources", async () => {
  const upsert = vi.fn().mockResolvedValue(undefined);
  const result = await runIngest({
    sources: [
      async () => [item({ source_id: "1", votes: 10 }), item({ source_id: "1", votes: 10 })],
      async () => [item({ source: "producthunt", source_id: "2", votes: 5 })],
    ],
    upsert,
  });
  expect(result.total).toBe(2); // duplicate (hackernews,1) collapsed
  expect(result.bySource.hackernews).toBe(1);
  expect(result.bySource.producthunt).toBe(1);
  const rows = upsert.mock.calls[0][0];
  expect(rows[0]).toHaveProperty("buzz_score");
});

test("one failing source does not abort the run", async () => {
  const upsert = vi.fn().mockResolvedValue(undefined);
  const result = await runIngest({
    sources: [
      async () => { throw new Error("boom"); },
      async () => [item({ source: "producthunt", source_id: "2" })],
    ],
    upsert,
  });
  expect(result.total).toBe(1);
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0]).toContain("boom");
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `npm test -- ingest`
Expected: FAIL — cannot find module `@/lib/ingest/run`.

- [x] **Step 3: Implement `src/lib/ingest/run.ts`**

```ts
import { scoreBuzz } from "@/lib/buzz";
import type { RawItem } from "@/lib/sources/types";

export type ProductRow = RawItem & { buzz_score: number };

export interface IngestDeps {
  sources: Array<() => Promise<RawItem[]>>;
  upsert: (rows: ProductRow[]) => Promise<void>;
}

export interface IngestResult {
  total: number;
  bySource: Record<string, number>;
  errors: string[];
}

export async function runIngest(deps: IngestDeps): Promise<IngestResult> {
  const settled = await Promise.allSettled(deps.sources.map((s) => s()));
  const errors: string[] = [];
  const byKey = new Map<string, RawItem>();

  for (const outcome of settled) {
    if (outcome.status === "rejected") {
      errors.push(String(outcome.reason?.message ?? outcome.reason));
      continue;
    }
    for (const item of outcome.value) {
      byKey.set(`${item.source}:${item.source_id}`, item);
    }
  }

  const rows: ProductRow[] = [...byKey.values()].map((item) => ({
    ...item,
    buzz_score: scoreBuzz(item),
  }));
  rows.sort((a, b) => b.buzz_score - a.buzz_score);

  const bySource: Record<string, number> = {};
  for (const row of rows) bySource[row.source] = (bySource[row.source] ?? 0) + 1;

  if (rows.length > 0) await deps.upsert(rows);
  return { total: rows.length, bySource, errors };
}
```

- [x] **Step 4: Run test — expect PASS**

Run: `npm test -- ingest`
Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add ingest orchestrator with dedupe and scoring"
```

---

### Task 6: GET /api/products route

**Files:**
- Create: `src/app/api/products/route.ts`
- Test: `src/app/api/products/route.test.ts`

**Interfaces:**
- Consumes: `getSupabaseAdmin` from `@/lib/supabase`.
- Produces: `GET(): Promise<Response>` returning `{ products: ProductRow[] }` ordered by `buzz_score desc`. Accepts a `?source=` filter.

- [x] **Step 1: Write the failing test (inject a fake client via module mock)**

```ts
// src/app/api/products/route.test.ts
import { expect, test, vi, beforeEach } from "vitest";

const order = vi.fn();
const eq = vi.fn();
const select = vi.fn();
const from = vi.fn(() => ({ select }));

vi.mock("@/lib/supabase", () => ({ getSupabaseAdmin: () => ({ from }) }));

beforeEach(() => {
  vi.clearAllMocks();
  select.mockReturnValue({ order, eq });
  eq.mockReturnValue({ order });
  order.mockResolvedValue({ data: [{ id: "1", buzz_score: 9 }], error: null });
});

test("returns products ordered by buzz", async () => {
  const { GET } = await import("@/app/api/products/route");
  const res = await GET(new Request("http://x/api/products"));
  const body = await res.json();
  expect(res.status).toBe(200);
  expect(body.products).toHaveLength(1);
  expect(from).toHaveBeenCalledWith("products");
  expect(order).toHaveBeenCalledWith("buzz_score", { ascending: false });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `npm test -- products/route`
Expected: FAIL — cannot find module `@/app/api/products/route`.

- [x] **Step 3: Implement `src/app/api/products/route.ts`**

```ts
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request): Promise<Response> {
  const source = new URL(request.url).searchParams.get("source");
  const db = getSupabaseAdmin();
  let query = db.from("products").select("*");
  if (source) query = query.eq("source", source);
  const { data, error } = await query.order("buzz_score", { ascending: false });
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ products: data ?? [] });
}
```

- [x] **Step 4: Run test — expect PASS**

Run: `npm test -- products/route`
Expected: 1 passed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add GET /api/products ranked feed endpoint"
```

---

### Task 7: POST /api/ingest route (auth-gated, wires HN)

**Files:**
- Create: `src/app/api/ingest/route.ts`
- Test: `src/app/api/ingest/route.test.ts`

**Interfaces:**
- Consumes: `runIngest`, `ProductRow` from `@/lib/ingest/run`; `getSupabaseAdmin` from `@/lib/supabase`; `fetchItems` from `@/lib/sources/hackernews`.
- Produces: `POST(request: Request): Promise<Response>`. Requires header `x-ingest-secret` === `INGEST_SECRET`. Returns the `IngestResult`.

- [ ] **Step 1: Write the failing test**

```ts
// src/app/api/ingest/route.test.ts
import { expect, test, vi, beforeEach } from "vitest";

vi.mock("@/lib/sources/hackernews", () => ({ fetchItems: async () => [] }));
const upsert = vi.fn().mockResolvedValue({ error: null });
const insert = vi.fn().mockResolvedValue({ error: null });
vi.mock("@/lib/supabase", () => ({
  getSupabaseAdmin: () => ({ from: () => ({ upsert, insert }) }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  process.env.INGEST_SECRET = "topsecret";
});

test("rejects a request without the secret", async () => {
  const { POST } = await import("@/app/api/ingest/route");
  const res = await POST(new Request("http://x/api/ingest", { method: "POST" }));
  expect(res.status).toBe(401);
});

test("runs ingest when the secret matches", async () => {
  const { POST } = await import("@/app/api/ingest/route");
  const res = await POST(
    new Request("http://x/api/ingest", {
      method: "POST",
      headers: { "x-ingest-secret": "topsecret" },
    }),
  );
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body).toHaveProperty("total");
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `npm test -- ingest/route`
Expected: FAIL — cannot find module `@/app/api/ingest/route`.

- [ ] **Step 3: Implement `src/app/api/ingest/route.ts`**

```ts
import { getSupabaseAdmin } from "@/lib/supabase";
import { runIngest, type ProductRow } from "@/lib/ingest/run";
import { fetchItems as fetchHN } from "@/lib/sources/hackernews";

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.INGEST_SECRET;
  if (!secret || request.headers.get("x-ingest-secret") !== secret) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const db = getSupabaseAdmin();
  const upsert = async (rows: ProductRow[]) => {
    const now = new Date().toISOString();
    const payload = rows.map((r) => ({ ...r, last_updated_at: now }));
    const { error } = await db
      .from("products")
      .upsert(payload, { onConflict: "source,source_id" });
    if (error) throw new Error(error.message);
  };

  const result = await runIngest({ sources: [fetchHN], upsert });
  return Response.json(result);
}
```

- [ ] **Step 4: Run test — expect PASS**

Run: `npm test -- ingest/route`
Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add auth-gated POST /api/ingest wiring Hacker News"
```

---

### Task 8: Feed UI + "Scrape now" button

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/app/_components/ScrapeButton.tsx`

**Interfaces:**
- Consumes: `GET /api/products`, `POST /api/ingest`.
- Produces: a server-rendered ranked list; a client button that POSTs ingest then refreshes.

- [ ] **Step 1: Implement the feed page `src/app/page.tsx`**

```tsx
import ScrapeButton from "@/app/_components/ScrapeButton";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function Home() {
  const db = getSupabaseAdmin();
  const { data } = await db
    .from("products")
    .select("*")
    .order("buzz_score", { ascending: false });
  const products = data ?? [];

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: 24 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>AI Product Buzz Feed</h1>
        <ScrapeButton />
      </header>
      <ol style={{ listStyle: "none", padding: 0 }}>
        {products.map((p) => (
          <li key={p.id} style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}>
            <a href={p.url} target="_blank" rel="noreferrer"><strong>{p.title}</strong></a>
            <div style={{ fontSize: 13, opacity: 0.7 }}>
              {p.source} · buzz {p.buzz_score.toFixed(2)} · ▲{p.votes} 💬{p.comments} 📰{p.news_mentions}
            </div>
          </li>
        ))}
      </ol>
      {products.length === 0 && <p>No products yet — hit “Scrape now”.</p>}
    </main>
  );
}
```

- [ ] **Step 2: Implement `src/app/_components/ScrapeButton.tsx`**

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ScrapeButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function scrape() {
    setLoading(true);
    try {
      await fetch("/api/ingest", {
        method: "POST",
        headers: { "x-ingest-secret": process.env.NEXT_PUBLIC_INGEST_SECRET ?? "" },
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={scrape} disabled={loading}>
      {loading ? "Scraping…" : "Scrape now"}
    </button>
  );
}
```

- [ ] **Step 3: Add `NEXT_PUBLIC_INGEST_SECRET` to `.env.example`**

Append `NEXT_PUBLIC_INGEST_SECRET=` and set both it and `INGEST_SECRET` to the same value in `.env.local`.

- [ ] **Step 4: Manual end-to-end check**

Run: `npm run dev`, open the app, click "Scrape now", confirm HN AI stories appear ranked by buzz.
Expected: list populates, highest buzz first.

- [ ] **Step 5: Verify build + tests**

Run: `npm run build && npm test`
Expected: build succeeds, all tests pass.

- [ ] **Step 6: Update `AGENTS.md`** — check Phase 1 box, set status to "Phase 1 complete: HN vertical slice live."

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add ranked feed UI with on-demand scrape button"
```

---

## PHASE 2 — Full sources + polish

### Task 9: Firecrawl REST client

**Files:**
- Create: `src/lib/firecrawl.ts`
- Test: `src/lib/firecrawl.test.ts`

**Interfaces:**
- Produces: `firecrawlScrape(url: string, jsonSchema: object): Promise<unknown>` — POSTs to `/v2/scrape` with `formats:[{type:"json", schema}]`, returns `data.json`.
- Produces: `firecrawlSearch(query: string, opts?: { sources?: string[]; limit?: number }): Promise<unknown[]>` — POSTs to `/v2/search`, returns the results array.
- Both read `FIRECRAWL_API_KEY`; accept an injected `fetchImpl` for testing.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/firecrawl.test.ts
import { expect, test, vi, beforeEach } from "vitest";
import { firecrawlScrape, firecrawlSearch } from "@/lib/firecrawl";

beforeEach(() => { process.env.FIRECRAWL_API_KEY = "fc-test"; });

test("scrape returns the json payload and sends auth", async () => {
  const fetchImpl = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ success: true, data: { json: { items: [1] } } }),
  });
  const out = await firecrawlScrape("https://ph", { type: "object" }, fetchImpl);
  expect(out).toEqual({ items: [1] });
  const [, init] = fetchImpl.mock.calls[0];
  expect(init.headers.Authorization).toBe("Bearer fc-test");
});

test("search returns the results array", async () => {
  const fetchImpl = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ success: true, data: { news: [{ title: "a" }] } }),
  });
  const out = await firecrawlSearch("MyAI", { sources: ["news"] }, fetchImpl);
  expect(out).toEqual([{ title: "a" }]);
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `npm test -- firecrawl`
Expected: FAIL — cannot find module `@/lib/firecrawl`.

- [ ] **Step 3: Implement `src/lib/firecrawl.ts`**

```ts
type FetchImpl = typeof fetch;

function apiKey(): string {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) throw new Error("Missing FIRECRAWL_API_KEY");
  return key;
}

async function post(path: string, body: unknown, fetchImpl: FetchImpl) {
  const res = await fetchImpl(`https://api.firecrawl.dev${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey()}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Firecrawl ${path} ${res.status}`);
  return res.json();
}

export async function firecrawlScrape(
  url: string,
  jsonSchema: object,
  fetchImpl: FetchImpl = fetch,
): Promise<unknown> {
  const json = await post(
    "/v2/scrape",
    { url, formats: [{ type: "json", schema: jsonSchema }] },
    fetchImpl,
  );
  return json?.data?.json;
}

export async function firecrawlSearch(
  query: string,
  opts: { sources?: string[]; limit?: number } = {},
  fetchImpl: FetchImpl = fetch,
): Promise<unknown[]> {
  const json = await post(
    "/v2/search",
    { query, sources: opts.sources ?? ["news"], limit: opts.limit ?? 10 },
    fetchImpl,
  );
  const data = json?.data ?? {};
  return data.news ?? data.web ?? [];
}
```

- [ ] **Step 4: Run test — expect PASS**

Run: `npm test -- firecrawl`
Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Firecrawl REST client (scrape + search)"
```

---

### Task 10: Product Hunt adapter

**Files:**
- Create: `src/lib/sources/producthunt.ts`, `src/lib/sources/__fixtures__/producthunt.json`
- Test: `src/lib/sources/producthunt.test.ts`

**Interfaces:**
- Consumes: `firecrawlScrape` from `@/lib/firecrawl`; `RawItem` from types.
- Produces: `parseProductHunt(json: unknown): RawItem[]` (pure).
- Produces: `fetchItems(): Promise<RawItem[]>` — scrapes `https://www.producthunt.com/` with a fixed schema, maps via `parseProductHunt`.

- [ ] **Step 1: Create fixture `src/lib/sources/__fixtures__/producthunt.json`**

```json
{
  "products": [
    { "name": "PH AI One", "tagline": "The best AI", "url": "https://ph/one", "votes": 420, "comments": 30 },
    { "name": "PH AI Two", "tagline": "Another AI", "url": "https://ph/two", "votes": 88, "comments": 5 }
  ]
}
```

- [ ] **Step 2: Write the failing test**

```ts
// src/lib/sources/producthunt.test.ts
import { expect, test } from "vitest";
import fixture from "@/lib/sources/__fixtures__/producthunt.json";
import { parseProductHunt } from "@/lib/sources/producthunt";

test("maps Product Hunt payload to RawItem", () => {
  const items = parseProductHunt(fixture);
  expect(items).toHaveLength(2);
  expect(items[0].source).toBe("producthunt");
  expect(items[0].source_id).toBe("https://ph/one");
  expect(items[0].title).toBe("PH AI One");
  expect(items[0].tagline).toBe("The best AI");
  expect(items[0].votes).toBe(420);
  expect(items[0].comments).toBe(30);
});
```

- [ ] **Step 3: Run test — expect FAIL**

Run: `npm test -- producthunt`
Expected: FAIL — cannot find module `@/lib/sources/producthunt`.

- [ ] **Step 4: Implement `src/lib/sources/producthunt.ts`**

```ts
import { firecrawlScrape } from "@/lib/firecrawl";
import type { RawItem } from "@/lib/sources/types";

interface PHProduct {
  name: string;
  tagline: string | null;
  url: string;
  votes: number;
  comments: number;
}

const PH_SCHEMA = {
  type: "object",
  properties: {
    products: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          tagline: { type: "string" },
          url: { type: "string" },
          votes: { type: "number" },
          comments: { type: "number" },
        },
      },
    },
  },
};

export function parseProductHunt(json: unknown): RawItem[] {
  const products = (json as { products?: PHProduct[] }).products ?? [];
  return products.map((p) => ({
    source: "producthunt",
    source_id: p.url,
    title: p.name,
    tagline: p.tagline ?? null,
    url: p.url,
    launched_at: null,
    votes: p.votes ?? 0,
    comments: p.comments ?? 0,
    news_mentions: 0,
  }));
}

export async function fetchItems(): Promise<RawItem[]> {
  const json = await firecrawlScrape("https://www.producthunt.com/", PH_SCHEMA);
  return parseProductHunt(json);
}
```

- [ ] **Step 5: Run test — expect PASS**

Run: `npm test -- producthunt`
Expected: 1 passed.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add Product Hunt adapter via Firecrawl scrape"
```

---

### Task 11: Tech-news adapter (news buzz)

**Files:**
- Create: `src/lib/sources/technews.ts`, `src/lib/sources/__fixtures__/technews.json`
- Test: `src/lib/sources/technews.test.ts`

**Interfaces:**
- Consumes: `firecrawlSearch` from `@/lib/firecrawl`; `RawItem` from types.
- Produces: `parseTechNews(results: unknown[]): RawItem[]` (pure) — groups news results by normalized title/domain, `news_mentions` = count per group.
- Produces: `fetchItems(): Promise<RawItem[]>` — searches recent "AI product launch" news, maps via `parseTechNews`.

- [ ] **Step 1: Create fixture `src/lib/sources/__fixtures__/technews.json`**

```json
[
  { "title": "Acme launches Nova AI", "url": "https://techcrunch.com/nova", "snippet": "..." },
  { "title": "Acme launches Nova AI", "url": "https://theverge.com/nova", "snippet": "..." },
  { "title": "Beta AI raises funding", "url": "https://vb.com/beta", "snippet": "..." }
]
```

- [ ] **Step 2: Write the failing test**

```ts
// src/lib/sources/technews.test.ts
import { expect, test } from "vitest";
import fixture from "@/lib/sources/__fixtures__/technews.json";
import { parseTechNews } from "@/lib/sources/technews";

test("groups by title and counts mentions", () => {
  const items = parseTechNews(fixture);
  const nova = items.find((i) => i.title.includes("Nova"));
  expect(nova?.news_mentions).toBe(2);
  const beta = items.find((i) => i.title.includes("Beta"));
  expect(beta?.news_mentions).toBe(1);
  expect(nova?.source).toBe("technews");
});
```

- [ ] **Step 3: Run test — expect FAIL**

Run: `npm test -- technews`
Expected: FAIL — cannot find module `@/lib/sources/technews`.

- [ ] **Step 4: Implement `src/lib/sources/technews.ts`**

```ts
import { firecrawlSearch } from "@/lib/firecrawl";
import type { RawItem } from "@/lib/sources/types";

interface NewsResult { title: string; url: string; snippet?: string }

function key(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, " ");
}

export function parseTechNews(results: unknown[]): RawItem[] {
  const groups = new Map<string, { first: NewsResult; count: number }>();
  for (const r of results as NewsResult[]) {
    const k = key(r.title);
    const existing = groups.get(k);
    if (existing) existing.count += 1;
    else groups.set(k, { first: r, count: 1 });
  }
  return [...groups.values()].map(({ first, count }) => ({
    source: "technews",
    source_id: key(first.title),
    title: first.title,
    tagline: first.snippet ?? null,
    url: first.url,
    launched_at: null,
    votes: 0,
    comments: 0,
    news_mentions: count,
  }));
}

export async function fetchItems(): Promise<RawItem[]> {
  const results = await firecrawlSearch("new AI product launch", {
    sources: ["news"],
    limit: 20,
  });
  return parseTechNews(results);
}
```

- [ ] **Step 5: Run test — expect PASS**

Run: `npm test -- technews`
Expected: 1 passed.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add tech-news adapter with news-mention buzz signal"
```

---

### Task 12: Wire all sources + `ingest_runs` logging

**Files:**
- Modify: `src/app/api/ingest/route.ts`
- Test: `src/app/api/ingest/route.test.ts` (extend)

**Interfaces:**
- Consumes: `fetchItems` from hackernews, producthunt, technews; `getSupabaseAdmin`.
- Produces: ingest now runs all three sources and writes an `ingest_runs` row (started/finished/status/counts).

- [ ] **Step 1: Extend the test to assert a run row is written**

```ts
// add to src/app/api/ingest/route.test.ts
vi.mock("@/lib/sources/producthunt", () => ({ fetchItems: async () => [] }));
vi.mock("@/lib/sources/technews", () => ({ fetchItems: async () => [] }));

test("writes an ingest_runs row", async () => {
  const { POST } = await import("@/app/api/ingest/route");
  await POST(new Request("http://x/api/ingest", {
    method: "POST",
    headers: { "x-ingest-secret": "topsecret" },
  }));
  // insert() is the ingest_runs writer stubbed in the supabase mock
  expect(insert).toHaveBeenCalled();
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `npm test -- ingest/route`
Expected: FAIL — `insert` not called (run row not yet written).

- [ ] **Step 3: Update `src/app/api/ingest/route.ts`**

```ts
import { getSupabaseAdmin } from "@/lib/supabase";
import { runIngest, type ProductRow } from "@/lib/ingest/run";
import { fetchItems as fetchHN } from "@/lib/sources/hackernews";
import { fetchItems as fetchPH } from "@/lib/sources/producthunt";
import { fetchItems as fetchNews } from "@/lib/sources/technews";

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.INGEST_SECRET;
  if (!secret || request.headers.get("x-ingest-secret") !== secret) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const db = getSupabaseAdmin();
  const startedAt = new Date().toISOString();
  const upsert = async (rows: ProductRow[]) => {
    const now = new Date().toISOString();
    const payload = rows.map((r) => ({ ...r, last_updated_at: now }));
    const { error } = await db
      .from("products")
      .upsert(payload, { onConflict: "source,source_id" });
    if (error) throw new Error(error.message);
  };

  const result = await runIngest({ sources: [fetchHN, fetchPH, fetchNews], upsert });

  await db.from("ingest_runs").insert({
    started_at: startedAt,
    finished_at: new Date().toISOString(),
    status: result.errors.length ? "partial" : "ok",
    counts: result,
  });

  return Response.json(result);
}
```

- [ ] **Step 4: Run test — expect PASS**

Run: `npm test -- ingest/route`
Expected: all ingest/route tests pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: wire all sources and log ingest runs"
```

---

### Task 13: Feed polish — buzz badges, source filter, last-updated

**Files:**
- Create: `src/app/_components/BuzzBadge.tsx`, `src/app/_components/SourceFilter.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `searchParams.source`; queries `ingest_runs` for the latest `finished_at`.
- Produces: a High/Medium/Low badge derived from buzz rank; a source filter; a "last updated" label.

- [ ] **Step 1: Implement `src/app/_components/BuzzBadge.tsx`**

```tsx
export default function BuzzBadge({ tier }: { tier: "High" | "Medium" | "Low" }) {
  const color = tier === "High" ? "#c0392b" : tier === "Medium" ? "#d68910" : "#7f8c8d";
  return (
    <span style={{ background: color, color: "#fff", borderRadius: 4, padding: "1px 6px", fontSize: 12 }}>
      {tier} buzz
    </span>
  );
}
```

- [ ] **Step 2: Implement `src/app/_components/SourceFilter.tsx`**

```tsx
import Link from "next/link";

const SOURCES = ["all", "hackernews", "producthunt", "technews"] as const;

export default function SourceFilter({ active }: { active: string }) {
  return (
    <nav style={{ display: "flex", gap: 8, margin: "12px 0" }}>
      {SOURCES.map((s) => (
        <Link
          key={s}
          href={s === "all" ? "/" : `/?source=${s}`}
          style={{ fontWeight: active === s ? 700 : 400 }}
        >
          {s}
        </Link>
      ))}
    </nav>
  );
}
```

- [ ] **Step 3: Update `src/app/page.tsx` to use filter, badge tiers, and last-updated**

```tsx
import ScrapeButton from "@/app/_components/ScrapeButton";
import BuzzBadge from "@/app/_components/BuzzBadge";
import SourceFilter from "@/app/_components/SourceFilter";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function tierFor(index: number, total: number): "High" | "Medium" | "Low" {
  if (total <= 1) return "High";
  const r = index / total;
  return r < 0.33 ? "High" : r < 0.66 ? "Medium" : "Low";
}

export default async function Home({
  searchParams,
}: { searchParams: Promise<{ source?: string }> }) {
  const { source } = await searchParams;
  const active = source ?? "all";
  const db = getSupabaseAdmin();

  let q = db.from("products").select("*");
  if (source) q = q.eq("source", source);
  const { data } = await q.order("buzz_score", { ascending: false });
  const products = data ?? [];

  const { data: runs } = await db
    .from("ingest_runs")
    .select("finished_at")
    .order("finished_at", { ascending: false })
    .limit(1);
  const lastUpdated = runs?.[0]?.finished_at;

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: 24 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>AI Product Buzz Feed</h1>
        <ScrapeButton />
      </header>
      {lastUpdated && (
        <p style={{ fontSize: 12, opacity: 0.6 }}>
          Last updated {new Date(lastUpdated).toLocaleString()}
        </p>
      )}
      <SourceFilter active={active} />
      <ol style={{ listStyle: "none", padding: 0 }}>
        {products.map((p, i) => (
          <li key={p.id} style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}>
            <a href={p.url} target="_blank" rel="noreferrer"><strong>{p.title}</strong></a>{" "}
            <BuzzBadge tier={tierFor(i, products.length)} />
            <div style={{ fontSize: 13, opacity: 0.7 }}>
              {p.source} · buzz {p.buzz_score.toFixed(2)} · ▲{p.votes} 💬{p.comments} 📰{p.news_mentions}
            </div>
          </li>
        ))}
      </ol>
      {products.length === 0 && <p>No products yet — hit “Scrape now”.</p>}
    </main>
  );
}
```

- [ ] **Step 4: Manual check + build + tests**

Run: `npm run dev` (verify filter + badges + last-updated), then `npm run build && npm test`.
Expected: UI works; build + tests green.

- [ ] **Step 5: Update `AGENTS.md`** — check Phase 2 box, set status to "Phase 2 complete: all sources + polish live."

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: polish feed with buzz badges, source filter, last-updated"
```

---

## Deferred (Phase 3 — not in this plan)

Scheduled ingestion (cron/worker), social sources (X/Reddit), LLM significance scoring, recency-decay weighting, alerts. Left out of v1 by design; add a new spec + plan when ready.

## Self-Review notes

- **Spec coverage:** sources (Tasks 4/10/11), buzz score (Task 3), Supabase model (Task 2), ranked feed (Tasks 6/8/13), on-demand ingest (Tasks 7/12), ingest_runs (Task 12), context file updates (Tasks 8/13), Firecrawl-only credentials (Task 9). All covered.
- **Placeholders:** none — every code step is concrete.
- **Type consistency:** `RawItem`, `ProductRow`, `scoreBuzz`, `runIngest`, `fetchItems`, `firecrawlScrape`/`firecrawlSearch`, `parse*` names are consistent across tasks.
