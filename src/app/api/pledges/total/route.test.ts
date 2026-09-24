// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { UpstreamError } from "@/server/mulearn/client";
import { GET } from "./route";

const { getPledgeTotal } = vi.hoisted(() => ({ getPledgeTotal: vi.fn() }));
vi.mock("@/server/pledge-service", () => ({ getPledgeTotal }));

describe("GET /api/pledges/total", () => {
  it("returns the total with CDN caching", async () => {
    getPledgeTotal.mockResolvedValue(5886);
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ total: 5886 });
    expect(response.headers.get("Cache-Control")).toContain("s-maxage=15");
  });

  it("returns 503 without caching when the upstream fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    getPledgeTotal.mockRejectedValue(new UpstreamError("total/ responded 500", "http", 500));
    const response = await GET();
    expect(response.status).toBe(503);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
});
