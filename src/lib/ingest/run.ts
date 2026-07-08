import { scoreBuzz } from "@/lib/buzz";
import type { RawItem } from "@/lib/sources/types";

export type ProductRow = RawItem & {
  buzz_score: number;
};

export interface IngestDeps {
  sources: Array<() => Promise<RawItem[]>>;
  upsert: (rows: ProductRow[]) => Promise<void>;
}

export interface IngestResult {
  total: number;
  bySource: Record<string, number>;
  errors: string[];
}

function dedupeKey(item: RawItem): string {
  return `${item.source}:${item.source_id}`;
}

export async function runIngest(deps: IngestDeps): Promise<IngestResult> {
  const sourceResults = await Promise.allSettled(deps.sources.map((source) => source()));
  const errors: string[] = [];
  const byKey = new Map<string, RawItem>();

  for (const result of sourceResults) {
    if (result.status === "rejected") {
      errors.push(result.reason instanceof Error ? result.reason.message : String(result.reason));
      continue;
    }

    for (const item of result.value) {
      byKey.set(dedupeKey(item), item);
    }
  }

  const rows = Array.from(byKey.values())
    .map<ProductRow>((item) => ({
      ...item,
      buzz_score: scoreBuzz(item),
    }))
    .sort((left, right) => right.buzz_score - left.buzz_score);

  const bySource = rows.reduce<Record<string, number>>((counts, row) => {
    counts[row.source] = (counts[row.source] ?? 0) + 1;
    return counts;
  }, {});

  if (rows.length > 0) {
    await deps.upsert(rows);
  }

  return {
    total: rows.length,
    bySource,
    errors,
  };
}
