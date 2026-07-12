import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export async function withTable<T>(
  client: SupabaseClient,
  primaryTable: string,
  fallbackTable: string,
  run: (table: string) => Promise<T>,
): Promise<T> {
  try {
    return await run(primaryTable);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (!message.includes("does not exist") && !message.includes("relation")) {
      throw error;
    }

    return await run(fallbackTable);
  }
}

export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error("Missing SUPABASE_URL");
  }

  if (!key) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
    },
  });
}
