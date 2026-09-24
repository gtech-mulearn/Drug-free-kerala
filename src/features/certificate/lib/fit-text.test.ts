import { describe, expect, it } from "vitest";
import { fitText, truncateToWidth, wrapText } from "./fit-text";

/** Monospace stand-in: every character is 10 units wide at size 10. */
const measureAt = (text: string, fontSize = 10) => text.length * fontSize;
const measure = (text: string) => measureAt(text);

describe("wrapText", () => {
  it("keeps short text on one line", () => {
    expect(wrapText("Anjali Nair", 200, measure, 2)).toEqual(["Anjali Nair"]);
  });

  it("wraps at word boundaries", () => {
    expect(wrapText("Aswathy Krishnan Pillai", 170, measure, 2)).toEqual(["Aswathy Krishnan", "Pillai"]);
  });

  it("ellipsises the last line when there are more lines than allowed", () => {
    const lines = wrapText("one two three four five six", 90, measure, 2);
    expect(lines).toHaveLength(2);
    expect(lines[1]?.endsWith("…")).toBe(true);
    expect(lines.every((line) => measure(line) <= 90)).toBe(true);
  });

  it("truncates a single word wider than the line", () => {
    const [line] = wrapText("Venkatanarasimharajuvaripeta", 100, measure, 1);
    expect(line?.endsWith("…")).toBe(true);
    expect(measure(line ?? "")).toBeLessThanOrEqual(100);
  });

  it("collapses repeated whitespace", () => {
    expect(wrapText("  Anjali   Nair ", 200, measure, 1)).toEqual(["Anjali Nair"]);
  });
});

describe("truncateToWidth", () => {
  it("returns fitting text unchanged", () => {
    expect(truncateToWidth("DKFC00042", 90, measure)).toBe("DKFC00042");
  });
});

describe("fitText", () => {
  const options = { maxWidth: 200, maxLines: 2, maxFontSize: 20, minFontSize: 10, measure: measureAt };

  it("keeps a name on one line at the largest size that fits", () => {
    expect(fitText("Anjali Nair", options)).toEqual({ fontSize: 18, lines: ["Anjali Nair"] });
  });

  it("prefers one line at 75% size over wrapping at full size", () => {
    // Fits one line only at 16 (75% floor is 15); must not wrap at 20.
    expect(fitText("Aswathy Nair", options)).toEqual({ fontSize: 16, lines: ["Aswathy Nair"] });
  });

  it("wraps and shrinks long names instead of cutting them off", () => {
    const result = fitText("Muhammed Shahid Abdul Rahman Kunjumon", { ...options, maxWidth: 300 });
    expect(result).toEqual({ fontSize: 14, lines: ["Muhammed Shahid Abdul", "Rahman Kunjumon"] });
  });

  it("shrinks wrapped text until the block fits a height cap", () => {
    // Two lines at 14 would be 33.6 tall; the cap forces 12 (28.8).
    const result = fitText("Muhammed Shahid Abdul Rahman Kunjumon", { ...options, maxWidth: 300, maxHeight: 30 });
    expect(result).toEqual({ fontSize: 12, lines: ["Muhammed Shahid Abdul", "Rahman Kunjumon"] });
  });

  it("truncates only when even the minimum size cannot fit", () => {
    const result = fitText("word ".repeat(40).trim(), options);
    expect(result.fontSize).toBe(10);
    expect(result.lines).toHaveLength(2);
    expect(result.lines[1]?.endsWith("…")).toBe(true);
  });
});
