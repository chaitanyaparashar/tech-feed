import Link from "next/link";

const SOURCES = ["all", "hackernews", "producthunt", "technews"] as const;

export default function SourceFilter({ active }: { active: string }) {
  return (
    <nav className="source-filter" aria-label="Filter by source">
      {SOURCES.map((source) => (
        <Link
          key={source}
          className={active === source ? "source-filter-link active" : "source-filter-link"}
          href={source === "all" ? "/" : `/?source=${source}`}
        >
          {source}
        </Link>
      ))}
    </nav>
  );
}
