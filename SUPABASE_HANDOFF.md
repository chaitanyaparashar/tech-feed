# AI Product Buzz Feed - Supabase Data Handoff Guide

This document is prepared for your coding AI / engineer to connect this working Next.js App Router UI to your live Supabase backend.

---

## 1. Supabase Database Schema DDL

Run the following SQL migration script in your Supabase SQL Editor to create all necessary tables and indexes.

```sql
-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    tagline TEXT NOT NULL,
    source TEXT NOT NULL CHECK (source IN ('hacker_news', 'product_hunt', 'tech_news')),
    url TEXT NOT NULL,
    buzz_score NUMERIC(5,2) DEFAULT 0.0,
    votes INT DEFAULT 0,
    comments INT DEFAULT 0,
    news_mentions INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Ingest Runs Table
CREATE TABLE IF NOT EXISTS public.ingest_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed',
    items_ingested INT DEFAULT 0,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. User Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    profile_picture_url TEXT DEFAULT '',
    interests TEXT[] DEFAULT '{}',
    avatar_concept TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Product Likes Table
CREATE TABLE IF NOT EXISTS public.product_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- 6. Drawers Table
CREATE TABLE IF NOT EXISTS public.drawers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Drawer Items Table
CREATE TABLE IF NOT EXISTS public.drawer_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    drawer_id UUID NOT NULL REFERENCES public.drawers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(drawer_id, product_id)
);

-- 8. Feedback Table
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    category TEXT CHECK (category IN ('bug', 'feature request', 'product suggestion', 'general feedback')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_buzz ON public.products(buzz_score DESC);
CREATE INDEX IF NOT EXISTS idx_product_likes_user ON public.product_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_drawer_items_drawer ON public.drawer_items(drawer_id);
```

---

## 2. Row Level Security (RLS) Policies

```sql
-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drawers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drawer_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Products: Everyone can read
CREATE POLICY "Public read access to products" ON public.products FOR SELECT USING (true);

-- Profiles: Public can read basic profile info, owner can update
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can edit own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Product Likes: Logged in users manage their own likes
CREATE POLICY "Users view own likes" ON public.product_likes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own likes" ON public.product_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own likes" ON public.product_likes FOR DELETE USING (auth.uid() = user_id);

-- Drawers: Owner access only
CREATE POLICY "Users view own drawers" ON public.drawers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own drawers" ON public.drawers FOR ALL USING (auth.uid() = user_id);

-- Drawer Items: Owner access only
CREATE POLICY "Users manage own drawer items" ON public.drawer_items 
    FOR ALL USING (drawer_id IN (SELECT id FROM public.drawers WHERE user_id = auth.uid()));

-- Feedback: Users can submit feedback
CREATE POLICY "Users submit feedback" ON public.feedback FOR INSERT WITH CHECK (true);
```

---

## 3. How to Connect `src/context/AppContext.tsx` to Supabase

1. Set Environment Variables in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
2. Initialize Supabase Client in `src/lib/supabaseClient.ts`:
   ```ts
   import { createClient } from '@supabase/supabase-js';
   export const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
   );
   ```
3. Replace the `INITIAL_PRODUCTS`, `toggleLike`, `saveToDrawer`, and `submitFeedback` state functions in `src/context/AppContext.tsx` with direct `supabase.from('tableName').select()`, `.insert()`, `.delete()` queries.
