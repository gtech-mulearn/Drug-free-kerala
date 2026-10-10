// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { UpstreamError } from "@/server/mulearn/client";
import { GET } from "./route";

const { getColleges } = vi.hoisted(() => ({ getColleges: vi.fn() }));
vi.mock("@/server/college-service", () => ({ getColleges }));

const COLLEGES = [
  { id: "9b3f1c2e-4d5a-4b6c-8d7e-0f1a2b3c4d5e", title: "alpha college" },
  { id: "02488535-1599-459f-adab-f3ef8fee2281", title: "GOVERNMENT COLLEGE NEDUMANGAD" },
];

describe("GET /api/colleges", () => {
  it("returns the college list, cacheable by the CDN and the browser", async () => {
    getColleges.mockResolvedValue(COLLEGES);
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ colleges: COLLEGES });
    expect(response.headers.get("Cache-Control")).toMatch(/^public, max-age=[1-9]\d*, s-maxage=[1-9]\d*/);
  });

  it("returns 503 without caching, and logs no more than the error summary", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    getColleges.mockRejectedValue(new UpstreamError("/api/v1/register/colleges/ responded 502", "http", 502));
    const response = await GET();
    expect(response.status).toBe(503);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(log).toHaveBeenCalledWith("[api/colleges] failed", {
      kind: "http",
      status: 502,
      message: "/api/v1/register/colleges/ responded 502",
    });
  });
});
