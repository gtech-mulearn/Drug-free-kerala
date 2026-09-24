"use client";

import { useEffect, useState } from "react";
import { Heading } from "@/components/ui/heading";

export const POLL_INTERVAL_MS = 30_000;
const formatter = new Intl.NumberFormat("en-IN");

function readTotal(data: unknown): number | null {
  return typeof data === "object" && data !== null && "total" in data && typeof data.total === "number"
    ? data.total
    : null;
}

/**
 * Live pledge count. The server renders the real number (no "0" flash, and
 * crawlers see it); the browser refreshes it every 30 s while the tab is
 * visible, through the CDN-cached /api/pledges/total.
 */
export function PledgeCounter({ initialTotal }: { initialTotal: number | null }) {
  const [total, setTotal] = useState(initialTotal);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      if (document.visibilityState !== "visible") return;
      try {
        const response = await fetch("/api/pledges/total", { cache: "no-store" });
        if (!response.ok) return;
        const next = readTotal(await response.json());
        if (!cancelled && next !== null) setTotal(next);
      } catch {
        // Keep showing the last known total.
      }
    }

    const timer = window.setInterval(refresh, POLL_INTERVAL_MS);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-2 md:w-1/3">
      <Heading as="p" size="counter" data-testid="pledge-total">
        {total === null ? "—" : formatter.format(total)}
      </Heading>
      <Heading as="p" size="display" className="font-medium">
        Pledges
      </Heading>
    </div>
  );
}
