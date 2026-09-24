// @vitest-environment node
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Parses src/styles/tokens.css, resolves var() chains, and checks WCAG 2.2
 * contrast for every foreground/surface pair the UI actually uses, in both
 * themes. Changing a token to an inaccessible value fails the build.
 */
const css = readFileSync(
  fileURLToPath(new URL("../../styles/tokens.css", import.meta.url)),
  "utf8",
);

function declarations(selector: string): Map<string, string> {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const block = css.match(new RegExp(`(?:^|\\n)${escaped}\\s*\\{([^}]*)\\}`));
  if (!block?.[1]) throw new Error(`No "${selector}" block in tokens.css`);
  const body = block[1].replace(/\/\*[\s\S]*?\*\//g, "");
  const map = new Map<string, string>();
  for (const [, name, value] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    if (name && value) map.set(name, value.trim());
  }
  return map;
}

const root = declarations(":root");
const themes = {
  light: root,
  inverse: new Map([...root, ...declarations(".theme-inverse")]),
};

function resolve(theme: Map<string, string>, name: string, seen = new Set<string>()): string {
  if (seen.has(name)) throw new Error(`Circular token reference at ${name}`);
  seen.add(name);
  const value = theme.get(name);
  if (!value) throw new Error(`Token ${name} is not defined`);
  const reference = value.match(/^var\((--[\w-]+)\)$/);
  if (reference?.[1]) return resolve(theme, reference[1], seen);
  if (!/^#[0-9a-f]{6}$/i.test(value)) {
    throw new Error(`Token ${name} must resolve to a 6-digit hex colour, got "${value}"`);
  }
  return value;
}

function luminance(hex: string): number {
  const [r = 0, g = 0, b = 0] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (light + 0.05) / (dark + 0.05);
}

/** Text on a surface: WCAG 1.4.3 (4.5:1). */
const TEXT_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ["foreground", "background"],
  ["card-foreground", "card"],
  ["popover-foreground", "popover"],
  ["muted-foreground", "background"],
  ["muted-foreground", "card"],
  ["muted-foreground", "muted"],
  ["accent-foreground", "accent"],
  ["surface-brand-foreground", "surface-brand"],
  ["primary-foreground", "primary"],
  ["primary", "background"],
  ["primary", "card"],
  ["primary", "popover"],
  ["primary", "muted"],
  ["secondary-foreground", "secondary"],
  ["brand-foreground", "brand"],
  ["destructive-foreground", "destructive"],
  ["destructive", "background"],
  ["destructive", "card"],
  ["destructive", "popover"],
];

/** Light-theme-only placements (brand-tinted surfaces exist only there). */
const LIGHT_ONLY_TEXT_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ["primary", "accent"],
  ["primary", "surface-brand"],
];

/** Non-text UI boundaries: WCAG 1.4.11 (3:1). */
const UI_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ["ring", "background"],
  ["ring", "card"],
  ["ring", "popover"],
  ["input", "card"],
  ["input", "popover"],
];

describe.each(Object.entries(themes))("%s theme", (_name, theme) => {
  const ratio = (fg: string, bg: string) =>
    contrast(resolve(theme, `--${fg}`), resolve(theme, `--${bg}`));

  it.each(TEXT_PAIRS)("%s on %s ≥ 4.5:1", (fg, bg) => {
    expect(ratio(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(UI_PAIRS)("%s against %s ≥ 3:1", (fg, bg) => {
    expect(ratio(fg, bg)).toBeGreaterThanOrEqual(3);
  });
});

describe("light theme placements", () => {
  it.each(LIGHT_ONLY_TEXT_PAIRS)("%s on %s ≥ 4.5:1", (fg, bg) => {
    const theme = themes.light;
    expect(contrast(resolve(theme, `--${fg}`), resolve(theme, `--${bg}`))).toBeGreaterThanOrEqual(4.5);
  });
});

describe("token completeness", () => {
  it("defines every semantic token in both themes", () => {
    const semantic = [...root.keys()].filter((name) => !name.startsWith("--palette-"));
    const inverse = declarations(".theme-inverse");
    expect(semantic.filter((name) => !inverse.has(name))).toEqual([]);
  });

  it("maps every semantic token to a Tailwind colour utility", () => {
    const themeCss = readFileSync(
      fileURLToPath(new URL("../../styles/theme.css", import.meta.url)),
      "utf8",
    );
    const semantic = [...root.keys()].filter((name) => !name.startsWith("--palette-"));
    const unmapped = semantic.filter(
      (name) => !themeCss.includes(`--color-${name.slice(2)}: var(${name});`),
    );
    expect(unmapped).toEqual([]);
  });
});
