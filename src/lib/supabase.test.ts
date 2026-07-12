import { afterEach, expect, test, vi } from "vitest";
import { getSupabaseAdmin, withTable } from "@/lib/supabase";

afterEach(() => {
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
});

test("throws when env is missing", () => {
  expect(() => getSupabaseAdmin()).toThrow(/SUPABASE_URL/);
});

test("builds a client when env is present", () => {
  process.env.SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-key";

  const client = getSupabaseAdmin();

  expect(client).toBeDefined();
  expect(typeof client.from).toBe("function");
});

test("falls back to singular table names when plural tables are missing", async () => {
  const client = {
    from: vi.fn((table: string) => {
      if (table === "products") {
        throw new Error('relation "products" does not exist');
      }

      return {
        select: vi.fn().mockResolvedValue({ data: [{ id: 1 }], error: null }),
      };
    }),
  } as unknown as ReturnType<typeof getSupabaseAdmin>;

  const rows = await withTable(client, "products", "product", async (table) => {
    const { data } = await client.from(table).select("*");
    return data ?? [];
  });

  expect(rows).toEqual([{ id: 1 }]);
});
