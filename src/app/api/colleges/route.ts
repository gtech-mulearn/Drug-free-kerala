import { getColleges } from "@/server/college-service";
import { UpstreamError } from "@/server/mulearn/client";

/**
 * µLearn's college list for the pledge form's college picker (~200 KB, rarely
 * changes). Cached for an hour in the browser and a day at the CDN; the
 * browser never calls mulearn.org itself (connect-src 'self').
 */
export async function GET() {
  try {
    const colleges = await getColleges();
    return Response.json(
      { colleges },
      { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" } },
    );
  } catch (error) {
    console.error("[api/colleges] failed", error instanceof UpstreamError ? error.toLog() : error);
    return Response.json({ error: "unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
