import BuzzBadge from "@/app/_components/BuzzBadge";
import ScrapeButton from "@/app/_components/ScrapeButton";
import SourceFilter from "@/app/_components/SourceFilter";
import { getSupabaseAdmin } from "@/lib/supabase";
import { fetchItems as fetchHackerNewsItems } from "@/lib/sources/hackernews";
import { fetchItems as fetchProductHuntItems } from "@/lib/sources/producthunt";
import { fetchItems as fetchTechNewsItems } from "@/lib/sources/technews";
import { scoreBuzz } from "@/lib/buzz";

export const dynamic = "force-dynamic";

interface ProductFeedItem {
  id?: string;
  source: string;
  source_id: string;
  title: string;
  tagline: string | null;
  url: string;
  votes: number;
  comments: number;
  news_mentions: number;
  buzz_score: number;
}

function tierFor(index: number, total: number): "High" | "Medium" | "Low" {
  if (total <= 1) {
    return "High";
  }

  const rank = index / total;
  return rank < 0.33 ? "High" : rank < 0.66 ? "Medium" : "Low";
}

async function getProducts(source?: string): Promise<ProductFeedItem[]> {
  try {
    const db = getSupabaseAdmin();
    let query = db.from("products").select("*");

    if (source) {
      query = query.eq("source", source);
    }

    const { data, error } = await query.order("buzz_score", { ascending: false });

    if (error) {
      return [];
    }

    const rows = (data ?? []) as ProductFeedItem[];
    if (rows.length > 0) {
      return rows;
    }
  } catch {
    // fall through to local fallback below
  }

  const sources = [fetchHackerNewsItems, fetchProductHuntItems, fetchTechNewsItems];
  const items = (await Promise.all(sources.map((source) => source().catch(() => [])))).flat();
  const rows = items
    .filter((item) => !source || item.source === source)
    .map((item) => ({
      ...item,
      buzz_score: scoreBuzz(item),
    }))
    .sort((left, right) => right.buzz_score - left.buzz_score);

  return rows as ProductFeedItem[];
}

async function getLastUpdated(): Promise<string | null> {
  try {
    const db = getSupabaseAdmin();
    const { data } = await db
      .from("ingest_runs")
      .select("finished_at")
      .order("finished_at", { ascending: false })
      .limit(1);

    return data?.[0]?.finished_at ?? null;
  } catch {
    return null;
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>;
}) {
  const { source } = await searchParams;
  const active = source ?? "all";
  const [products, lastUpdated] = await Promise.all([
    getProducts(source),
    getLastUpdated(),
  ]);

  return (
    <main className="page-shell">
      <header className="feed-header">
        <div>
          <h1 className="feed-title">AI Product Buzz Feed</h1>
          <p className="feed-subtitle">
            Ranked AI product launches from high buzz to low buzz, based on votes,
            comments, and news mentions.
          </p>
        </div>
        <ScrapeButton />
      </header>

      {lastUpdated ? (
        <p className="last-updated">
          Last updated {new Date(lastUpdated).toLocaleString()}
        </p>
      ) : null}

      <SourceFilter active={active} />

      {products.length > 0 ? (
        <ol className="feed-list">
          {products.map((product, index) => (
            <li className="feed-item" key={`${product.source}:${product.source_id}`}>
              <div className="feed-item-heading">
                <a
                  className="feed-item-title"
                  href={product.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {product.title}
                </a>
                <BuzzBadge tier={tierFor(index, products.length)} />
              </div>
              {product.tagline ? (
                <p className="feed-item-tagline">{product.tagline}</p>
              ) : null}
              <div className="feed-meta">
                <span>{product.source}</span>
                <span>
                  buzz <strong>{product.buzz_score.toFixed(2)}</strong>
                </span>
                <span>votes {product.votes}</span>
                <span>comments {product.comments}</span>
                <span>news {product.news_mentions}</span>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="empty-state">No products yet. Run a scrape to populate the feed.</p>
      )}
    </main>
  );
}
