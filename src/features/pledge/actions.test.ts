// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UpstreamError } from "@/server/mulearn/client";
import { lookupCertificate, submitPledge } from "./actions";
import { PLEDGE_STATEMENT_IDS } from "./content";
import { IDLE } from "./types";

const mocks = vi.hoisted(() => ({
  headers: vi.fn(),
  createPledge: vi.fn(),
  findPledge: vi.fn(),
  findCollege: vi.fn(),
  check: vi.fn(),
  getRateLimiter: vi.fn(),
}));

vi.mock("next/headers", () => ({ headers: mocks.headers }));
vi.mock("@/server/pledge-service", () => ({ createPledge: mocks.createPledge, findPledge: mocks.findPledge }));
vi.mock("@/server/college-service", () => ({ findCollege: mocks.findCollege }));
vi.mock("@/server/security/rate-limit", () => ({ getRateLimiter: mocks.getRateLimiter }));

function form(fields: Record<string, string | string[]>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    for (const item of [value].flat()) data.append(key, item);
  }
  return data;
}

const pledgeFields = {
  name: "Anjali Nair",
  email: "anjali@example.com",
  statements: [...PLEDGE_STATEMENT_IDS],
};

beforeEach(() => {
  mocks.headers.mockResolvedValue(new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }));
  mocks.getRateLimiter.mockReturnValue({ check: mocks.check });
  mocks.check.mockResolvedValue({ allowed: true, retryAfterSeconds: 0 });
});

describe("submitPledge", () => {
  it("creates the pledge for valid input within the rate limit", async () => {
    mocks.createPledge.mockResolvedValue({ status: "created", certificateId: "DKFC00042", name: "Anjali Nair" });

    const state = await submitPledge(IDLE, form({ ...pledgeFields, name: "  Anjali Nair " }));

    expect(state).toEqual({ status: "created", certificateId: "DKFC00042", name: "Anjali Nair" });
    expect(mocks.createPledge).toHaveBeenCalledWith({
      name: "Anjali Nair",
      email: "anjali@example.com",
      is_student: false,
    });
    expect(mocks.getRateLimiter).toHaveBeenCalledWith("pledge");
    expect(mocks.check).toHaveBeenCalledWith("203.0.113.7");
  });

  it("returns field errors for invalid input without touching the network", async () => {
    const state = await submitPledge(IDLE, form({ ...pledgeFields, name: "A", email: "nope" }));

    expect(state).toMatchObject({ status: "invalid", fieldErrors: { name: expect.any(Array), email: expect.any(Array) } });
    expect(mocks.check).not.toHaveBeenCalled();
    expect(mocks.createPledge).not.toHaveBeenCalled();
  });

  it("requires every pledge statement", async () => {
    const state = await submitPledge(IDLE, form({ ...pledgeFields, statements: ["aware"] }));
    expect(state).toEqual({
      status: "invalid",
      fieldErrors: { statements: ["Accept every pledge statement to continue."] },
    });
  });

  it("stops rate-limited clients before calling the API", async () => {
    mocks.check.mockResolvedValue({ allowed: false, retryAfterSeconds: 120 });

    expect(await submitPledge(IDLE, form(pledgeFields))).toEqual({ status: "rate_limited", retryAfterSeconds: 120 });
    expect(mocks.createPledge).not.toHaveBeenCalled();
  });

  it("reports a generic error and logs without personal data when the API fails", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.createPledge.mockRejectedValue(new UpstreamError("create/ responded 502", "http", 502));

    expect(await submitPledge(IDLE, form(pledgeFields))).toEqual({ status: "error" });
    const logged = JSON.stringify(log.mock.calls);
    expect(logged).toContain("502");
    expect(logged).not.toContain("anjali");
  });

  it("buckets clients without an IP together rather than skipping the limit", async () => {
    mocks.headers.mockResolvedValue(new Headers());
    mocks.createPledge.mockResolvedValue({ status: "email_taken" });

    await submitPledge(IDLE, form(pledgeFields));
    expect(mocks.check).toHaveBeenCalledWith("unknown");
  });

  describe("students", () => {
    const COLLEGE = { id: "02488535-1599-459f-adab-f3ef8fee2281", title: "GOVERNMENT COLLEGE NEDUMANGAD" };
    const student = { ...pledgeFields, is_student: "on" };

    beforeEach(() => {
      mocks.createPledge.mockResolvedValue({ status: "created", certificateId: "DKFC00042", name: "Anjali Nair" });
    });

    it("sends a listed college with the title from the server's own copy of the list", async () => {
      mocks.findCollege.mockResolvedValue(COLLEGE);

      // A title posted by the browser is ignored.
      const state = await submitPledge(IDLE, form({ ...student, college_id: COLLEGE.id, college_name: "Fake Title" }));

      expect(state).toMatchObject({ status: "created" });
      expect(mocks.findCollege).toHaveBeenCalledWith(COLLEGE.id);
      expect(mocks.createPledge).toHaveBeenCalledWith({
        name: "Anjali Nair",
        email: "anjali@example.com",
        is_student: true,
        college_id: COLLEGE.id,
        college_name: COLLEGE.title,
      });
    });

    it("sends an unlisted college as the typed name alone", async () => {
      await submitPledge(IDLE, form({ ...student, college_id: "other", college_other: "  GHSS Nedumangad " }));

      expect(mocks.findCollege).not.toHaveBeenCalled();
      expect(mocks.createPledge).toHaveBeenCalledWith({
        name: "Anjali Nair",
        email: "anjali@example.com",
        is_student: true,
        college_name: "GHSS Nedumangad",
      });
    });

    it("rejects a college id that is not on the list", async () => {
      mocks.findCollege.mockResolvedValue(null);

      const state = await submitPledge(IDLE, form({ ...student, college_id: COLLEGE.id }));

      expect(state).toEqual({
        status: "invalid",
        fieldErrors: { college_id: ["We couldn't find that college. Search again, or pick Other."] },
      });
      expect(mocks.createPledge).not.toHaveBeenCalled();
    });

    it("asks for the name instead of failing when the college list is unavailable", async () => {
      const log = vi.spyOn(console, "error").mockImplementation(() => {});
      mocks.findCollege.mockRejectedValue(new UpstreamError("/api/v1/register/colleges/ responded 502", "http", 502));

      const state = await submitPledge(IDLE, form({ ...student, college_id: COLLEGE.id }));

      expect(state).toEqual({
        status: "invalid",
        fieldErrors: { college_id: ["We couldn't check the college list just now. Pick Other and type its name."] },
      });
      expect(mocks.createPledge).not.toHaveBeenCalled();
      expect(JSON.stringify(log.mock.calls)).toContain("502");
    });

    it("requires a student to choose a college, without touching the network", async () => {
      const state = await submitPledge(IDLE, form(student));

      expect(state).toEqual({
        status: "invalid",
        fieldErrors: { college_id: ["Choose your college or school, or pick Other."] },
      });
      expect(mocks.check).not.toHaveBeenCalled();
    });

    it("checks the rate limit before looking up the college", async () => {
      mocks.check.mockResolvedValue({ allowed: false, retryAfterSeconds: 60 });

      expect(await submitPledge(IDLE, form({ ...student, college_id: COLLEGE.id }))).toMatchObject({
        status: "rate_limited",
      });
      expect(mocks.findCollege).not.toHaveBeenCalled();
    });
  });
});

describe("lookupCertificate", () => {
  const lookupFields = { name: "Anjali Nair", email: "anjali@example.com" };

  it("returns the certificate for a matching name and email", async () => {
    mocks.findPledge.mockResolvedValue({ status: "found", certificateId: "DKFC00042", name: "Anjali Nair" });

    expect(await lookupCertificate(IDLE, form(lookupFields))).toEqual({
      status: "found",
      certificateId: "DKFC00042",
      name: "Anjali Nair",
    });
    expect(mocks.findPledge).toHaveBeenCalledWith(lookupFields);
    expect(mocks.getRateLimiter).toHaveBeenCalledWith("lookup");
  });

  it("passes not-found through", async () => {
    mocks.findPledge.mockResolvedValue({ status: "not_found" });
    expect(await lookupCertificate(IDLE, form(lookupFields))).toEqual({ status: "not_found" });
  });

  it("requires the name as well as the email", async () => {
    const state = await lookupCertificate(IDLE, form({ ...lookupFields, name: "" }));
    expect(state).toMatchObject({ status: "invalid", fieldErrors: { name: expect.any(Array) } });
    expect(mocks.findPledge).not.toHaveBeenCalled();
  });

  it("stops rate-limited clients", async () => {
    mocks.check.mockResolvedValue({ allowed: false, retryAfterSeconds: 60 });
    expect(await lookupCertificate(IDLE, form(lookupFields))).toEqual({ status: "rate_limited", retryAfterSeconds: 60 });
    expect(mocks.findPledge).not.toHaveBeenCalled();
  });
});
