import { beforeEach, expect, test, vi } from "vitest";

vi.mock("@/lib/sources/hackernews", () => ({
  fetchItems: async () => [
    {
      source: "hackernews",
      source_id: "hn-1",
      title: "Show HN: Useful AI Tool",
      tagline: null,
      url: "https://example.com/tool",
      launched_at: null,
      votes: 12,
      comments: 4,
      news_mentions: 0,
    },
  ],
}));

vi.mock("@/lib/sources/producthunt", () => ({
  fetchItems: async () => [],
}));

vi.mock("@/lib/sources/technews", () => ({
  fetchItems: async () => [],
}));

const upsert = vi.fn().mockResolvedValue({ error: null });
const insert = vi.fn().mockResolvedValue({ error: null });
const from = vi.fn((table: string) => {
  if (table === "products") {
    return { upsert };
  }

  if (table === "ingest_runs") {
    return { insert };
  }

  return {};
});

vi.mock("@/lib/supabase", () => ({
  getSupabaseAdmin: () => ({ from }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  process.env.INGEST_SECRET = "topsecret";
  upsert.mockResolvedValue({ error: null });
  insert.mockResolvedValue({ error: null });
});

test("rejects a request without the secret", async () => {
  const { POST } = await import("@/app/api/ingest/route");

  const response = await POST(new Request("http://x/api/ingest", { method: "POST" }));
  const body = await response.json();

  expect(response.status).toBe(401);
  expect(body.error).toBe("unauthorized");
  expect(from).not.toHaveBeenCalled();
});

test("runs ingest when the secret matches", async () => {
  const { POST } = await import("@/app/api/ingest/route");

  const response = await POST(
    new Request("http://x/api/ingest", {
      method: "POST",
      headers: { "x-ingest-secret": "topsecret" },
    }),
  );
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(body.total).toBe(1);
  expect(body.bySource.hackernews).toBe(1);
  expect(from).toHaveBeenCalledWith("products");
  expect(upsert).toHaveBeenCalledWith(
    expect.arrayContaining([
      expect.objectContaining({
        source: "hackernews",
        source_id: "hn-1",
        buzz_score: expect.any(Number),
        last_updated_at: expect.any(String),
      }),
    ]),
    { onConflict: "source,source_id" },
  );
});

test("writes an ingest_runs row", async () => {
  const { POST } = await import("@/app/api/ingest/route");

  await POST(
    new Request("http://x/api/ingest", {
      method: "POST",
      headers: { "x-ingest-secret": "topsecret" },
    }),
  );

  expect(from).toHaveBeenCalledWith("ingest_runs");
  expect(insert).toHaveBeenCalledWith(
    expect.objectContaining({
      status: "ok",
      counts: expect.objectContaining({ total: 1 }),
    }),
  );
});

test("returns a server error when Supabase upsert fails", async () => {
  upsert.mockResolvedValueOnce({ error: { message: "write failed" } });
  const { POST } = await import("@/app/api/ingest/route");

  const response = await POST(
    new Request("http://x/api/ingest", {
      method: "POST",
      headers: { "x-ingest-secret": "topsecret" },
    }),
  );
  const body = await response.json();

  expect(response.status).toBe(500);
  expect(body.error).toBe("write failed");
});
