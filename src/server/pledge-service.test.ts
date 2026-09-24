// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UpstreamError } from "./mulearn/client";
import { createPledge, findPledge, getPledgeTotal } from "./pledge-service";

const fetchMock = vi.fn<typeof fetch>();

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

function lastRequest() {
  const [input, init] = fetchMock.mock.lastCall ?? [];
  return { url: String(input), init: init ?? {} };
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("MULEARN_API_BASE_URL", "https://api.test/drugfreekerala");
});

describe("getPledgeTotal", () => {
  it("returns the upstream total and caches it for 30 seconds", async () => {
    fetchMock.mockResolvedValue(json({ total: 5886 }));
    await expect(getPledgeTotal()).resolves.toBe(5886);
    const { url, init } = lastRequest();
    expect(url).toBe("https://api.test/drugfreekerala/total/");
    expect(init.method).toBe("GET");
    expect(init).toMatchObject({ next: { revalidate: 30 } });
  });
});

describe("createPledge", () => {
  it("returns the new certificate", async () => {
    fetchMock.mockResolvedValue(json({ id: 42, name: "Anjali Nair", email: "anjali@example.com" }));
    await expect(createPledge({ name: "Anjali Nair", email: "anjali@example.com" })).resolves.toEqual({
      status: "created",
      certificateId: "DKFC00042",
      name: "Anjali Nair",
    });
    const { url, init } = lastRequest();
    expect(url).toBe("https://api.test/drugfreekerala/create/");
    expect(init.method).toBe("POST");
    expect(JSON.parse(String(init.body))).toEqual({ name: "Anjali Nair", email: "anjali@example.com" });
    expect(init.cache).toBe("no-store");
  });

  it("returns the existing certificate when a duplicate email comes with the same name", async () => {
    fetchMock.mockResolvedValue(json({ id: 7, name: "Anjali  Nair", email: "a@example.com", is_error: true }));
    await expect(createPledge({ name: " anjali nair ", email: "a@example.com" })).resolves.toEqual({
      status: "already_pledged",
      certificateId: "DKFC00007",
      name: "Anjali  Nair",
    });
  });

  it("reveals nothing when a duplicate email comes with a different name", async () => {
    fetchMock.mockResolvedValue(json({ id: 7, name: "Someone Else", email: "a@example.com", is_error: true }));
    const outcome = await createPledge({ name: "Anjali Nair", email: "a@example.com" });
    expect(outcome).toEqual({ status: "email_taken" });
    expect(JSON.stringify(outcome)).not.toContain("Someone");
  });

  it("calls the production API when no override is set", async () => {
    vi.stubEnv("MULEARN_API_BASE_URL", "");
    fetchMock.mockResolvedValue(json({ id: 1, name: "A B", email: "a@example.com" }));
    await createPledge({ name: "A B", email: "a@example.com" });
    expect(lastRequest().url).toBe("https://mulearn.org/api/v1/drugfreekerala/create/");
  });
});

describe("findPledge", () => {
  it("finds a pledge when name and email match", async () => {
    fetchMock.mockResolvedValue(json({ id: 42, name: "Anjali Nair", email: "anjali@example.com" }));
    await expect(findPledge({ name: "ANJALI NAIR", email: "anjali@example.com" })).resolves.toEqual({
      status: "found",
      certificateId: "DKFC00042",
      name: "Anjali Nair",
    });
    expect(lastRequest().url).toBe("https://api.test/drugfreekerala/get/?email=anjali%40example.com");
  });

  it("reports not found for the upstream's HTTP 200 not-found body", async () => {
    fetchMock.mockResolvedValue(json({ message: "User not found", is_error: true }));
    await expect(findPledge({ name: "A B", email: "nobody@example.com" })).resolves.toEqual({ status: "not_found" });
  });

  it("treats a name mismatch exactly like not found", async () => {
    fetchMock.mockResolvedValue(json({ id: 42, name: "Anjali Nair", email: "anjali@example.com" }));
    await expect(findPledge({ name: "Mallory", email: "anjali@example.com" })).resolves.toEqual({
      status: "not_found",
    });
  });
});

describe("upstream failures", () => {
  it("raises a typed error for HTTP errors", async () => {
    fetchMock.mockResolvedValue(json({ detail: "boom" }, 500));
    await expect(getPledgeTotal()).rejects.toMatchObject({ name: "UpstreamError", kind: "http", status: 500 });
  });

  it("raises a typed error for an unexpected response shape", async () => {
    fetchMock.mockResolvedValue(json({ count: "many" }));
    await expect(getPledgeTotal()).rejects.toMatchObject({ kind: "invalid_response" });
  });

  it("raises a typed error on timeout", async () => {
    fetchMock.mockRejectedValue(new DOMException("The operation timed out.", "TimeoutError"));
    await expect(getPledgeTotal()).rejects.toMatchObject({ kind: "timeout" });
  });

  it("raises a typed error on network failure", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    const error = await createPledge({ name: "A B", email: "a@example.com" }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(UpstreamError);
    expect((error as UpstreamError).kind).toBe("network");
    expect(JSON.stringify((error as UpstreamError).toLog())).not.toContain("a@example.com");
  });
});
