import { expect, test, vi } from "vitest";
import fixture from "@/lib/sources/__fixtures__/hn.json";
import { fetchItems, parseHNResponse } from "@/lib/sources/hackernews";

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

test("falls back to local fixtures when the HN API fails", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

  const items = await fetchItems();

  expect(items).toHaveLength(2);
  expect(items[0].source).toBe("hackernews");

  vi.unstubAllGlobals();
});
