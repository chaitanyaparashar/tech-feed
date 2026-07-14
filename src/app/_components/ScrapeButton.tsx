"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ScrapeButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function scrape() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ingest", {
        method: "POST",
        headers: {
          "x-ingest-secret": process.env.NEXT_PUBLIC_INGEST_SECRET ?? "",
        },
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        const message = body?.error ? String(body.error) : "Scrape failed";
        setError(message);
        return;
      }

      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="scrape-control">
      <button className="scrape-button" type="button" onClick={scrape} disabled={loading}>
        {loading ? "Scraping..." : "Scrape now"}
      </button>
      {error ? <p className="scrape-error">{error}</p> : null}
    </div>
  );
}
