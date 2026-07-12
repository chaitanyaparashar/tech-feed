import { runIngest, type ProductRow } from "@/lib/ingest/run";
import { fetchItems as fetchHackerNewsItems } from "@/lib/sources/hackernews";
import { fetchItems as fetchProductHuntItems } from "@/lib/sources/producthunt";
import { fetchItems as fetchTechNewsItems } from "@/lib/sources/technews";
import { getSupabaseAdmin, withTable } from "@/lib/supabase";

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.INGEST_SECRET ?? "dev-secret";
  const provided = request.headers.get("x-ingest-secret") ?? "";

  if (secret !== "dev-secret" && provided !== secret) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  let db: ReturnType<typeof getSupabaseAdmin> | null = null;

  try {
    db = getSupabaseAdmin();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Supabase configuration error";
    return Response.json({ error: message }, { status: 500 });
  }

  const startedAt = new Date().toISOString();

  const upsert = async (rows: ProductRow[]): Promise<void> => {
    const now = new Date().toISOString();
    const payload = rows.map((row) => ({
      ...row,
      last_updated_at: now,
    }));

    const { error } = await withTable(
      db!,
      "products",
      "product",
      async (table) => db!.from(table).upsert(payload, { onConflict: "source,source_id" }),
    );

    if (error) {
      throw new Error(error.message);
    }
  };

  try {
    const result = await runIngest({
      sources: [fetchHackerNewsItems, fetchProductHuntItems, fetchTechNewsItems],
      upsert,
    });

    await withTable(
      db!,
      "ingest_runs",
      "ingest_run",
      async (table) =>
        db!.from(table).insert({
          started_at: startedAt,
          finished_at: new Date().toISOString(),
          status: result.errors.length ? "partial" : "ok",
          counts: result,
        }),
    );

    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ingest failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
