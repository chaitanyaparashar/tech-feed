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
