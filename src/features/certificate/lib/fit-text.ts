export type Measure = (text: string) => number;

/** Appends "…", shortening `text` until the result fits `maxWidth`. */
function withEllipsis(text: string, maxWidth: number, measure: Measure): string {
  let shortened = text.trimEnd();
  while (shortened.length > 0 && measure(`${shortened}…`) > maxWidth) {
    shortened = shortened.slice(0, -1).trimEnd();
  }
  return `${shortened}…`;
}

/** Returns `text` unchanged if it fits, otherwise an ellipsised prefix that does. */
export function truncateToWidth(text: string, maxWidth: number, measure: Measure): string {
  return measure(text) <= maxWidth ? text : withEllipsis(text, maxWidth, measure);
}

/**
 * Greedy word wrap into at most `maxLines` lines. Every returned line fits
 * `maxWidth`; if text remains, the last line ends with an ellipsis.
 */
export function wrapText(text: string, maxWidth: number, measure: Measure, maxLines: number): string[] {
  const lines: string[] = [];
  let current = "";

  for (const word of text.trim().split(/\s+/).filter(Boolean)) {
    const candidate = current ? `${current} ${word}` : word;
    if (!current || measure(candidate) <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);

  const fitted = lines.map((line) => truncateToWidth(line, maxWidth, measure));
  if (fitted.length <= maxLines) return fitted;

  const kept = fitted.slice(0, maxLines);
  kept[maxLines - 1] = withEllipsis(lines[maxLines - 1] ?? "", maxWidth, measure);
  return kept;
}

/** Line height as a multiple of font size, shared with the canvas renderer. */
export const LINE_HEIGHT = 1.2;

export type FitOptions = {
  maxWidth: number;
  maxLines: number;
  maxFontSize: number;
  minFontSize: number;
  /** Optional cap on the block's total height (lines × fontSize × LINE_HEIGHT). */
  maxHeight?: number;
  /** Width of `text` rendered at `fontSize`. */
  measure: (text: string, fontSize: number) => number;
};

/**
 * Picks a font size (stepping down by 2) so `text` fits without truncation.
 * Fewer lines win: a single line is preferred down to 75% of `maxFontSize`
 * before wrapping is allowed; the last line budget may shrink to
 * `minFontSize`. If nothing fits, the minimum size is used, truncated.
 */
export function fitText(text: string, options: FitOptions): { fontSize: number; lines: string[] } {
  const { maxWidth, maxLines, maxFontSize, minFontSize, maxHeight = Number.POSITIVE_INFINITY, measure } = options;

  for (let lineBudget = 1; lineBudget <= maxLines; lineBudget++) {
    const floor = lineBudget === maxLines ? minFontSize : Math.max(minFontSize, Math.round(maxFontSize * 0.75));
    for (let fontSize = maxFontSize; fontSize >= floor; fontSize -= 2) {
      const measureAt: Measure = (value) => measure(value, fontSize);
      const lines = wrapText(text, maxWidth, measureAt, Number.POSITIVE_INFINITY);
      const truncated = lines.some((line) => line.endsWith("…") && !text.includes(line));
      const fitsHeight = lines.length * fontSize * LINE_HEIGHT <= maxHeight;
      if (lines.length <= lineBudget && !truncated && fitsHeight) return { fontSize, lines };
    }
  }

  const measureAt: Measure = (value) => measure(value, minFontSize);
  return { fontSize: minFontSize, lines: wrapText(text, maxWidth, measureAt, maxLines) };
}
