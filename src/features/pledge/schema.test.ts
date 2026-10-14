import { describe, expect, it } from "vitest";
import { z } from "zod";
import { PLEDGE_STATEMENT_IDS } from "./content";
import { LookupFormSchema, PledgeFormSchema, readPledgeForm } from "./schema";

const valid = {
  name: "Anjali Nair",
  email: "anjali@example.com",
  statements: [...PLEDGE_STATEMENT_IDS],
  is_student: false,
};

const COLLEGE_ID = "02488535-1599-459f-adab-f3ef8fee2281";

const fieldErrors = (input: unknown) => {
  const result = PledgeFormSchema.safeParse(input);
  return result.success ? {} : z.flattenError(result.error).fieldErrors;
};

describe("PledgeFormSchema", () => {
  it("accepts a complete pledge and trims whitespace", () => {
    const result = PledgeFormSchema.parse({ ...valid, name: "  Anjali Nair ", email: " anjali@example.com " });
    expect(result.name).toBe("Anjali Nair");
    expect(result.email).toBe("anjali@example.com");
  });

  it.each(["അഞ്ജലി നായർ", "K. P. O'Neil", "Mary-Ann D’Souza", "Nguyễn Văn An"])("accepts the name %s", (name) => {
    expect(PledgeFormSchema.safeParse({ ...valid, name }).success).toBe(true);
  });

  it.each(["A", "<script>", "Robert'); DROP TABLE", "12345", " ", "x".repeat(81)])("rejects the name %s", (name) => {
    expect(PledgeFormSchema.safeParse({ ...valid, name }).success).toBe(false);
  });

  it.each(["not-an-email", "a@b", "@example.com"])("rejects the email %s", (email) => {
    expect(PledgeFormSchema.safeParse({ ...valid, email }).success).toBe(false);
  });

  it("requires every pledge statement", () => {
    const result = PledgeFormSchema.safeParse({ ...valid, statements: ["aware", "commit"] });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Accept every pledge statement to continue.");
  });

  it("rejects unknown statement ids", () => {
    expect(PledgeFormSchema.safeParse({ ...valid, statements: [...PLEDGE_STATEMENT_IDS, "other"] }).success).toBe(
      false,
    );
  });

  describe("student and college", () => {
    const student = { ...valid, is_student: true };

    it("accepts a pledge from someone who is not a student", () => {
      expect(PledgeFormSchema.parse(valid)).toMatchObject({ is_student: false });
    });

    it("accepts a student with a college picked from the list", () => {
      expect(PledgeFormSchema.parse({ ...student, college_id: COLLEGE_ID })).toMatchObject({
        is_student: true,
        college_id: COLLEGE_ID,
      });
    });

    it("accepts a student whose college is not listed, trimming the typed name", () => {
      expect(
        PledgeFormSchema.parse({ ...student, college_id: "other", college_other: "  GHSS Nedumangad " }),
      ).toMatchObject({ college_id: "other", college_other: "GHSS Nedumangad" });
    });

    it("asks a student to choose a college", () => {
      expect(fieldErrors(student)).toEqual({ college_id: ["Choose your college or school, or pick Other."] });
    });

    it.each([undefined, " ", "X"])("asks for the name of an unlisted college (%j)", (college_other) => {
      expect(fieldErrors({ ...student, college_id: "other", college_other })).toEqual({
        college_other: ["Enter the name of your college or school."],
      });
    });

    it("rejects an unlisted college name over 255 characters", () => {
      expect(fieldErrors({ ...student, college_id: "other", college_other: "x".repeat(256) })).toHaveProperty(
        "college_other",
      );
      expect(fieldErrors({ ...student, college_id: "other", college_other: "x".repeat(255) })).toEqual({});
    });

    it("rejects a college id that is neither a UUID nor Other", () => {
      expect(fieldErrors({ ...student, college_id: "college-1" })).toHaveProperty("college_id");
    });

    it("reports a missing college alongside the other field errors", () => {
      expect(Object.keys(fieldErrors({ ...student, name: "A", statements: [] })).sort()).toEqual([
        "college_id",
        "name",
        "statements",
      ]);
    });
  });
});

describe("readPledgeForm", () => {
  function form(fields: Record<string, string | string[]>) {
    const data = new FormData();
    for (const [key, value] of Object.entries(fields)) {
      for (const item of [value].flat()) data.append(key, item);
    }
    return data;
  }

  const base = { name: "Anjali Nair", email: "anjali@example.com", statements: [...PLEDGE_STATEMENT_IDS] };

  it("reads an unticked student checkbox as not a student, ignoring stray college fields", () => {
    expect(readPledgeForm(form({ ...base, college_id: COLLEGE_ID, college_other: "GHSS" }))).toEqual({
      ...base,
      is_student: false,
    });
  });

  it("reads a ticked student checkbox and the college fields", () => {
    expect(
      readPledgeForm(form({ ...base, is_student: "on", college_id: "other", college_other: "GHSS Nedumangad" })),
    ).toEqual({ ...base, is_student: true, college_id: "other", college_other: "GHSS Nedumangad" });
  });

  it("treats blank college inputs as missing", () => {
    expect(readPledgeForm(form({ ...base, is_student: "on", college_id: "", college_other: "" }))).toEqual({
      ...base,
      is_student: true,
    });
  });

  it("treats missing name and email as empty, so the schema reports them", () => {
    expect(readPledgeForm(new FormData())).toEqual({ name: "", email: "", statements: [], is_student: false });
  });
});

describe("LookupFormSchema", () => {
  it("needs both name and email", () => {
    expect(LookupFormSchema.safeParse({ name: "Anjali Nair", email: "a@example.com" }).success).toBe(true);
    expect(LookupFormSchema.safeParse({ email: "a@example.com" }).success).toBe(false);
    expect(LookupFormSchema.safeParse({ name: "Anjali Nair" }).success).toBe(false);
  });
});
