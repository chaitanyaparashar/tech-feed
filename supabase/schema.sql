create extension if not exists pgcrypto;

create table if not exists public.products (
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
  created_at timestamptz not null default now(),
  first_seen_at timestamptz not null default now(),
  last_updated_at timestamptz not null default now(),
  unique (source, source_id)
);

create index if not exists products_buzz_idx on public.products (buzz_score desc);

create table if not exists public.ingest_runs (
  id uuid primary key default gen_random_uuid(),
  source text,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  completed_at timestamptz,
  status text not null default 'running',
  items_ingested integer default 0,
  counts jsonb
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  profile_picture_url text default '',
  interests text[] default '{}',
  avatar_concept text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.product_likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

create table if not exists public.drawers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  is_default boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.drawer_items (
  id uuid primary key default gen_random_uuid(),
  drawer_id uuid not null references public.drawers(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  saved_at timestamptz default now(),
  unique(drawer_id, product_id)
);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  message text not null,
  rating integer check (rating between 1 and 5),
  category text check (category in ('bug', 'feature request', 'product suggestion', 'general feedback')),
  created_at timestamptz default now()
);

create index if not exists idx_product_likes_user on public.product_likes(user_id);
create index if not exists idx_drawer_items_drawer on public.drawer_items(drawer_id);

alter table public.products enable row level security;
alter table public.profiles enable row level security;
alter table public.product_likes enable row level security;
alter table public.drawers enable row level security;
alter table public.drawer_items enable row level security;
alter table public.feedback enable row level security;

drop policy if exists "Public read access to products" on public.products;
create policy "Public read access to products"
  on public.products for select
  using (true);

drop policy if exists "Public read profiles" on public.profiles;
create policy "Public read profiles"
  on public.profiles for select
  using (true);

drop policy if exists "Users create own profile" on public.profiles;
create policy "Users create own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users edit own profile" on public.profiles;
create policy "Users edit own profile"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users view own likes" on public.product_likes;
create policy "Users view own likes"
  on public.product_likes for select
  using (auth.uid() = user_id);

drop policy if exists "Users create own likes" on public.product_likes;
create policy "Users create own likes"
  on public.product_likes for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own likes" on public.product_likes;
create policy "Users delete own likes"
  on public.product_likes for delete
  using (auth.uid() = user_id);

drop policy if exists "Users view own drawers" on public.drawers;
create policy "Users view own drawers"
  on public.drawers for select
  using (auth.uid() = user_id);

drop policy if exists "Users create own drawers" on public.drawers;
create policy "Users create own drawers"
  on public.drawers for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own drawers" on public.drawers;
create policy "Users update own drawers"
  on public.drawers for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own drawers" on public.drawers;
create policy "Users delete own drawers"
  on public.drawers for delete
  using (auth.uid() = user_id);

drop policy if exists "Users view own drawer items" on public.drawer_items;
create policy "Users view own drawer items"
  on public.drawer_items for select
  using (drawer_id in (select id from public.drawers where user_id = auth.uid()));

drop policy if exists "Users create own drawer items" on public.drawer_items;
create policy "Users create own drawer items"
  on public.drawer_items for insert
  with check (drawer_id in (select id from public.drawers where user_id = auth.uid()));

drop policy if exists "Users delete own drawer items" on public.drawer_items;
create policy "Users delete own drawer items"
  on public.drawer_items for delete
  using (drawer_id in (select id from public.drawers where user_id = auth.uid()));

drop policy if exists "Users submit feedback" on public.feedback;
create policy "Users submit feedback"
  on public.feedback for insert
  with check (auth.uid() = user_id or user_id is null);

drop policy if exists "Users view own feedback" on public.feedback;
create policy "Users view own feedback"
  on public.feedback for select
  using (auth.uid() = user_id);
