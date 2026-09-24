// @vitest-environment node
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { brandColors, brandColorTokens } from "@/config/brand";

const tokens = readFileSync(
  fileURLToPath(new URL("../../styles/tokens.css", import.meta.url)),
  "utf8",
);

describe("brand colour constants", () => {
  it.each(Object.entries(brandColors))("%s mirrors its palette token", (key, value) => {
    const token = brandColorTokens[key as keyof typeof brandColors];
    const match = tokens.match(new RegExp(`${token}:\\s*(#[0-9a-f]{6})`, "i"));
    expect(match?.[1]?.toLowerCase(), `${token} not found in tokens.css`).toBe(value);
  });
});
