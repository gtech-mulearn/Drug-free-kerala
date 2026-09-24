import "server-only";
import { connection } from "next/server";
import { UpstreamError } from "@/server/mulearn/client";
import { getPledgeTotal } from "@/server/pledge-service";

/**
 * Request-time total for the streamed counters; null when the API is down.
 * getPledgeTotal() sits in the Next data cache, so several counters on one
 * page share a single upstream call.
 */
export async function loadInitialPledgeTotal(): Promise<number | null> {
  // Request-time data: never fetch it during `next build`.
  await connection();
  return getPledgeTotal().catch((error: unknown) => {
    console.error("[landing] pledge total unavailable", error instanceof UpstreamError ? error.toLog() : error);
    return null;
  });
}
