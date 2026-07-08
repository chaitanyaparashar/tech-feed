import { beforeEach, expect, test, vi } from "vitest";

const order = vi.fn();
const eq = vi.fn();
const select = vi.fn();
const from = vi.fn(() => ({ select }));

vi.mock("@/lib/supabase", () => ({
  getSupabaseAdmin: () => ({ from }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  select.mockReturnValue({ eq, order });
  eq.mockReturnValue({ order });
  order.mockResolvedValue({ data: [{ id: "1", buzz_score: 9 }], error: null });
});

test("returns products ordered by buzz", async () => {
  const { GET } = await import("@/app/api/products/route");

  const response = await GET(new Request("http://x/api/products"));
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(body.products).toHaveLength(1);
  expect(from).toHaveBeenCalledWith("products");
  expect(order).toHaveBeenCalledWith("buzz_score", { ascending: false });
});

test("filters by source when requested", async () => {
  const { GET } = await import("@/app/api/products/route");

  await GET(new Request("http://x/api/products?source=hackernews"));

  expect(eq).toHaveBeenCalledWith("source", "hackernews");
  expect(order).toHaveBeenCalledWith("buzz_score", { ascending: false });
});

test("returns a 500 response when Supabase returns an error", async () => {
  order.mockResolvedValueOnce({ data: null, error: { message: "db failed" } });
  const { GET } = await import("@/app/api/products/route");

  const response = await GET(new Request("http://x/api/products"));
  const body = await response.json();

  expect(response.status).toBe(500);
  expect(body.error).toBe("db failed");
});
