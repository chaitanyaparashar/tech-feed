import { expect, test, vi } from "vitest";
import fixture from "@/lib/sources/__fixtures__/producthunt.json";
import { fetchItems, parseProductHunt } from "@/lib/sources/producthunt";

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

test("falls back to local fixtures when Product Hunt scraping fails", async () => {
  vi.mock("@/lib/firecrawl", () => ({
    firecrawlScrape: vi.fn().mockRejectedValue(new Error("offline")),
  }));

  const items = await fetchItems();

  expect(items).toHaveLength(2);
  expect(items[0].source).toBe("producthunt");
});
