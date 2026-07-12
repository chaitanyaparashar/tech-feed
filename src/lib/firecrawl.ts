type FetchImpl = typeof fetch;

function apiKey(): string {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) {
    throw new Error("Missing FIRECRAWL_API_KEY");
  }
  return key;
}

async function post(path: string, body: unknown, fetchImpl: FetchImpl) {
  const response = await fetchImpl(`https://api.firecrawl.dev${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey()}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Firecrawl ${path} ${response.status}`);
  }

  return response.json();
}

export async function firecrawlScrape(
  url: string,
  jsonSchema: object,
  fetchImpl: FetchImpl = fetch,
): Promise<unknown> {
  const json = await post(
    "/v2/scrape",
    { url, formats: [{ type: "json", schema: jsonSchema }] },
    fetchImpl,
  );
  return json?.data?.json;
}

export async function firecrawlSearch(
  query: string,
  opts: { sources?: string[]; limit?: number } = {},
  fetchImpl: FetchImpl = fetch,
): Promise<unknown[]> {
  const json = await post(
    "/v2/search",
    { query, sources: opts.sources ?? ["news"], limit: opts.limit ?? 10 },
    fetchImpl,
  );
  const data = json?.data ?? {};
  return data.news ?? data.web ?? [];
}
