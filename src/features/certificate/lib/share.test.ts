import { describe, expect, it } from "vitest";
import { buildShareMessage, certificateFileName, shareUrl } from "./share";

describe("share helpers", () => {
  const message = buildShareMessage("DKFC00042", "https://drugfreekerala.com");

  it("includes the pledge id and site", () => {
    expect(message).toContain("🆔 My Pledge ID: DKFC00042");
    expect(message.trim().endsWith("drugfreekerala.com")).toBe(true);
  });

  it("builds share URLs with the message encoded", () => {
    expect(shareUrl("x", message, "https://drugfreekerala.com")).toMatch(/^https:\/\/x\.com\/intent\/tweet\?text=Proud/);
    expect(shareUrl("whatsapp", message, "https://drugfreekerala.com")).toContain("DKFC00042");
  });

  it("shares the site URL on Facebook, which ignores prefilled text", () => {
    expect(shareUrl("facebook", message, "https://drugfreekerala.com")).toBe(
      "https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fdrugfreekerala.com",
    );
  });

  it("names downloads after the certificate", () => {
    expect(certificateFileName("DKFC00042")).toBe("DrugFreeKerala-Certificate-DKFC00042.png");
  });
});
