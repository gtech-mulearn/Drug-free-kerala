import { UpstreamError } from "@/server/mulearn/client";
import { getPledgeTotal } from "@/server/pledge-service";

/**
 * Public pledge count for the live counter. Cached at the CDN for 15 s so
 * every open tab polling it costs the upstream API one request per window.
 */
export async function GET() {
  try {
    const total = await getPledgeTotal();
    return Response.json(
      { total },
      { headers: { "Cache-Control": "public, max-age=0, s-maxage=15, stale-while-revalidate=60" } },
    );
  } catch (error) {
    console.error("[api/pledges/total] failed", error instanceof UpstreamError ? error.toLog() : error);
    return Response.json({ error: "unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
