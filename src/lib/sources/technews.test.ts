import { expect, test, vi } from "vitest";
import fixture from "@/lib/sources/__fixtures__/technews.json";
import { fetchItems, parseTechNews } from "@/lib/sources/technews";

test("groups by title and counts mentions", () => {
  const items = parseTechNews(fixture);
  const nova = items.find((item) => item.title.includes("Nova"));
  const beta = items.find((item) => item.title.includes("Beta"));

  expect(nova?.news_mentions).toBe(2);
  expect(beta?.news_mentions).toBe(1);
  expect(nova?.source).toBe("technews");
});

test("falls back to local fixtures when the news search fails", async () => {
  vi.mock("@/lib/firecrawl", () => ({
    firecrawlSearch: vi.fn().mockRejectedValue(new Error("offline")),
  }));

  const items = await fetchItems();

  expect(items).toHaveLength(2);
  expect(items[0].source).toBe("technews");
});
