import { expect, test, vi } from "vitest";
import { runIngest } from "@/lib/ingest/run";
import type { RawItem } from "@/lib/sources/types";

const item = (overrides: Partial<RawItem>): RawItem => ({
  source: "hackernews",
  source_id: "1",
  title: "x",
  tagline: null,
  url: "https://x",
  launched_at: null,
  votes: 0,
  comments: 0,
  news_mentions: 0,
  ...overrides,
});

test("scores, dedupes, and upserts across sources", async () => {
  const upsert = vi.fn().mockResolvedValue(undefined);

  const result = await runIngest({
    sources: [
      async () => [item({ source_id: "1", votes: 10 }), item({ source_id: "1", votes: 10 })],
      async () => [item({ source: "producthunt", source_id: "2", votes: 5 })],
    ],
    upsert,
  });

  expect(result.total).toBe(2);
  expect(result.bySource.hackernews).toBe(1);
  expect(result.bySource.producthunt).toBe(1);
  expect(upsert).toHaveBeenCalledTimes(1);
  const rows = upsert.mock.calls[0]?.[0];
  expect(rows?.[0]).toHaveProperty("buzz_score");
});

test("one failing source does not abort the run", async () => {
  const upsert = vi.fn().mockResolvedValue(undefined);

  const result = await runIngest({
    sources: [
      async () => {
        throw new Error("boom");
      },
      async () => [item({ source: "producthunt", source_id: "2" })],
    ],
    upsert,
  });

  expect(result.total).toBe(1);
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0]).toContain("boom");
});
