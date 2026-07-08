import type { RawItem } from "@/lib/sources/types";

interface HNHit {
  objectID: string;
  title?: string;
  story_title?: string;
  url?: string | null;
  points?: number | null;
  num_comments?: number | null;
  created_at?: string | null;
}

interface HNResponse {
  hits?: HNHit[];
}

const HN_ENDPOINT =
  "https://hn.algolia.com/api/v1/search?query=AI&tags=story&hitsPerPage=50";

function isHNResponse(json: unknown): json is HNResponse {
  return typeof json === "object" && json !== null;
}

export function parseHNResponse(json: unknown): RawItem[] {
  if (!isHNResponse(json) || !Array.isArray(json.hits)) {
    return [];
  }

  return json.hits.map((hit) => {
    const title = hit.title ?? hit.story_title ?? "Untitled Hacker News story";

    return {
      source: "hackernews",
      source_id: hit.objectID,
      title,
      tagline: null,
      url: hit.url ?? `https://news.ycombinator.com/item?id=${hit.objectID}`,
      launched_at: hit.created_at ?? null,
      votes: hit.points ?? 0,
      comments: hit.num_comments ?? 0,
      news_mentions: 0,
    };
  });
}

export async function fetchItems(): Promise<RawItem[]> {
  const response = await fetch(HN_ENDPOINT);

  if (!response.ok) {
    throw new Error(`HN API ${response.status}`);
  }

  return parseHNResponse(await response.json());
}
