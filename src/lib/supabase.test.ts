import { afterEach, expect, test } from "vitest";
import { getSupabaseAdmin } from "@/lib/supabase";

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
