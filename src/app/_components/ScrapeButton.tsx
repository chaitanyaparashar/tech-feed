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

      if (!response.ok) {
        setError("Scrape failed");
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
