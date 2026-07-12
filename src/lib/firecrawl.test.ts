import { beforeEach, expect, test, vi } from "vitest";
import { firecrawlScrape, firecrawlSearch } from "@/lib/firecrawl";

beforeEach(() => {
  process.env.FIRECRAWL_API_KEY = "fc-test";
});

test("scrape returns the json payload and sends auth", async () => {
  const fetchImpl = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ success: true, data: { json: { items: [1] } } }),
  });

  const out = await firecrawlScrape("https://ph", { type: "object" }, fetchImpl);

  expect(out).toEqual({ items: [1] });
  const [, init] = fetchImpl.mock.calls[0];
  expect(init.headers.Authorization).toBe("Bearer fc-test");
});

test("search returns the results array", async () => {
  const fetchImpl = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ success: true, data: { news: [{ title: "a" }] } }),
  });

  const out = await firecrawlSearch("MyAI", { sources: ["news"] }, fetchImpl);

  expect(out).toEqual([{ title: "a" }]);
});
