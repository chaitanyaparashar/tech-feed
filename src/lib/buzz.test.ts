import { expect, test } from "vitest";
import { scoreBuzz } from "@/lib/buzz";

test("zero engagement scores zero", () => {
  expect(scoreBuzz({ votes: 0, comments: 0, news_mentions: 0 })).toBe(0);
});

test("news mentions are weighted highest", () => {
  const votes = scoreBuzz({ votes: 10, comments: 0, news_mentions: 0 });
  const news = scoreBuzz({ votes: 0, comments: 0, news_mentions: 10 });

  expect(news).toBeGreaterThan(votes);
});

test("more engagement scores higher (monotonic)", () => {
  const low = scoreBuzz({ votes: 5, comments: 2, news_mentions: 1 });
  const high = scoreBuzz({ votes: 50, comments: 20, news_mentions: 3 });

  expect(high).toBeGreaterThan(low);
});
