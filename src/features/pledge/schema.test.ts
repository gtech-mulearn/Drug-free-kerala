import { describe, expect, it } from "vitest";
import { PLEDGE_STATEMENT_IDS } from "./content";
import { LookupFormSchema, PledgeFormSchema } from "./schema";

const valid = {
  name: "Anjali Nair",
  email: "anjali@example.com",
  statements: [...PLEDGE_STATEMENT_IDS],
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

});

describe("LookupFormSchema", () => {
  it("needs both name and email", () => {
    expect(LookupFormSchema.safeParse({ name: "Anjali Nair", email: "a@example.com" }).success).toBe(true);
    expect(LookupFormSchema.safeParse({ email: "a@example.com" }).success).toBe(false);
    expect(LookupFormSchema.safeParse({ name: "Anjali Nair" }).success).toBe(false);
  });
});
