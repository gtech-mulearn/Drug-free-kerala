import { describe, expect, it } from "vitest";
import { formatCertificateId } from "./certificate-id";

describe("formatCertificateId", () => {
  it("pads to five digits with the DKFC prefix used on issued certificates", () => {
    expect(formatCertificateId(42)).toBe("DKFC00042");
    expect(formatCertificateId(5886)).toBe("DKFC05886");
  });

  it("does not truncate ids beyond five digits", () => {
    expect(formatCertificateId(123456)).toBe("DKFC123456");
  });

  it.each([0, -1, 1.5, Number.NaN])("rejects %s", (id) => {
    expect(() => formatCertificateId(id)).toThrow(RangeError);
  });
});
