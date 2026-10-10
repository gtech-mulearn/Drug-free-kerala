// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { findCollege, getColleges } from "./college-service";

const fetchMock = vi.fn<typeof fetch>();

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

/** The envelope https://mulearn.org/api/v1/register/colleges/ wraps the list in. */
const envelope = (colleges: unknown[]) => ({
  hasError: false,
  statusCode: 200,
  message: { general: [] },
  response: { colleges },
});

const ZETA = { id: "02488535-1599-459f-adab-f3ef8fee2281", title: "ZETA COLLEGE" };
const ALPHA = { id: "9b3f1c2e-4d5a-4b6c-8d7e-0f1a2b3c4d5e", title: "alpha college" };
const BETA = { id: "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d", title: "Beta Institute" };

function lastRequest() {
  const [input, init] = fetchMock.mock.lastCall ?? [];
  return { url: String(input), init: init ?? {} };
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("MULEARN_REGISTER_API_BASE_URL", "https://api.test/register");
});

describe("getColleges", () => {
  it("fetches the µLearn list and caches it for a day", async () => {
    fetchMock.mockResolvedValue(json(envelope([ALPHA])));
    await getColleges();
    const { url, init } = lastRequest();
    expect(url).toBe("https://api.test/register/colleges/");
    expect(init.method).toBe("GET");
    expect(init).toMatchObject({ next: { revalidate: 86400 } });
  });

  it("calls the production register API when no override is set", async () => {
    vi.stubEnv("MULEARN_REGISTER_API_BASE_URL", "");
    fetchMock.mockResolvedValue(json(envelope([ALPHA])));
    await getColleges();
    expect(lastRequest().url).toBe("https://mulearn.org/api/v1/register/colleges/");
  });

  it("sorts by title, ignoring case", async () => {
    fetchMock.mockResolvedValue(json(envelope([ZETA, ALPHA, BETA])));
    await expect(getColleges()).resolves.toEqual([ALPHA, BETA, ZETA]);
  });

  it("trims titles, as the pledge API would", async () => {
    fetchMock.mockResolvedValue(json(envelope([{ ...ALPHA, title: "  alpha college " }])));
    await expect(getColleges()).resolves.toEqual([ALPHA]);
  });

  it("drops entries the pledge API would reject instead of failing the whole list", async () => {
    fetchMock.mockResolvedValue(
      json(envelope([ALPHA, { id: "not-a-uuid", title: "BAD ID" }, { id: BETA.id, title: " X " }, { title: "NO ID" }])),
    );
    await expect(getColleges()).resolves.toEqual([ALPHA]);
  });

  it("raises a typed error when the envelope is not the expected shape", async () => {
    fetchMock.mockResolvedValue(json({ colleges: [ALPHA] }));
    await expect(getColleges()).rejects.toMatchObject({ name: "UpstreamError", kind: "invalid_response" });
  });
});

describe("findCollege", () => {
  beforeEach(() => {
    fetchMock.mockResolvedValue(json(envelope([ZETA, ALPHA, BETA])));
  });

  it("returns the college with that id", async () => {
    await expect(findCollege(BETA.id)).resolves.toEqual(BETA);
  });

  it("returns null for an id that is not on the list", async () => {
    await expect(findCollege("00000000-0000-4000-8000-000000000000")).resolves.toBeNull();
  });
});
