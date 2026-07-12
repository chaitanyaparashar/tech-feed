import { expect, test } from "vitest";
import fixture from "@/lib/sources/__fixtures__/technews.json";
import { parseTechNews } from "@/lib/sources/technews";

test("groups by title and counts mentions", () => {
  const items = parseTechNews(fixture);
  const nova = items.find((item) => item.title.includes("Nova"));
  const beta = items.find((item) => item.title.includes("Beta"));

  expect(nova?.news_mentions).toBe(2);
  expect(beta?.news_mentions).toBe(1);
  expect(nova?.source).toBe("technews");
});
