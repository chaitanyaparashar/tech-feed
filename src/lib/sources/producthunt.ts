import fixture from "@/lib/sources/__fixtures__/producthunt.json";
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

  return products.map((product) => ({
    source: "producthunt",
    source_id: product.url,
    title: product.name,
    tagline: product.tagline ?? null,
    url: product.url,
    launched_at: null,
    votes: product.votes ?? 0,
    comments: product.comments ?? 0,
    news_mentions: 0,
  }));
}

export async function fetchItems(): Promise<RawItem[]> {
  try {
    const json = await firecrawlScrape("https://www.producthunt.com/", PH_SCHEMA);
    return parseProductHunt(json);
  } catch {
    return parseProductHunt(fixture);
  }
}
