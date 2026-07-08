import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request): Promise<Response> {
  const source = new URL(request.url).searchParams.get("source");
  const db = getSupabaseAdmin();
  let query = db.from("products").select("*");

  if (source) {
    query = query.eq("source", source);
  }

  const { data, error } = await query.order("buzz_score", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ products: data ?? [] });
}
