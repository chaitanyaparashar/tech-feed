import fixture from "@/lib/sources/__fixtures__/technews.json";
import { firecrawlSearch } from "@/lib/firecrawl";
import type { RawItem } from "@/lib/sources/types";

interface NewsResult {
  title: string;
  url: string;
  snippet?: string;
}

function key(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, " ");
}

export function parseTechNews(results: unknown[]): RawItem[] {
  const groups = new Map<string, { first: NewsResult; count: number }>();

  for (const result of results as NewsResult[]) {
    const groupKey = key(result.title);
    const existing = groups.get(groupKey);

    if (existing) {
      existing.count += 1;
    } else {
      groups.set(groupKey, { first: result, count: 1 });
    }
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
  try {
    const results = await firecrawlSearch("new AI product launch", {
      sources: ["news"],
      limit: 20,
    });
    return parseTechNews(results);
  } catch {
    return parseTechNews(fixture);
  }
}
