// @vitest-environment node
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Design-system guard: scans every source file in src/ (including
 * components/ui) and fails on styling that bypasses the token system.
 * Each rule explains the replacement in its message.
 */
const SRC = fileURLToPath(new URL("../../", import.meta.url));

/**
 * The one file allowed to hold literal colours: values for contexts that
 * cannot read CSS variables (OG image, theme-color meta, canvas artwork).
 * brand.test.ts keeps it in sync with tokens.css.
 */
const COLOR_LITERAL_ALLOWLIST = new Set(["config/brand.ts"]);

type Rule = { id: string; pattern: RegExp; message: string; allow?: Set<string> };

const COLOR_NAMES =
  "slate|gray|grey|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
const COLOR_UTILITIES =
  "bg|text|border|border-[trblxy]|ring|ring-offset|outline|fill|stroke|from|via|to|decoration|divide|placeholder|caret|accent|shadow";

const RULES: Rule[] = [
  {
    id: "arbitrary-colour",
    pattern: /[\w-]-\[(?:#|rgba?\(|hsla?\(|oklch\(|oklab\(|lab\(|lch\(|color-mix\(|var\(--palette)/,
    message: "Arbitrary colour in a class. Use a semantic token utility (bg-primary, text-muted-foreground, …).",
  },
  {
    id: "palette-class",
    pattern: new RegExp(
      `(?<![\\w-])(?:${COLOR_UTILITIES})-(?:black|white|(?:${COLOR_NAMES})-\\d{2,3})(?![\\w-])`,
    ),
    message: "Tailwind palette colour. Use a semantic token; dark surfaces use .theme-inverse.",
  },
  {
    id: "dark-variant",
    pattern: /(?<![\w-])dark:/,
    message: '`dark:` variant. Theme dark surfaces with <Section tone="inverse"> / .theme-inverse.',
  },
  {
    id: "arbitrary-type",
    pattern: /(?<![\w-])(?:text-\[\d|font-\[|leading-\[\d|tracking-\[)/,
    message: "Arbitrary typography. Use the type scale (text-display, text-headline, text-title, text-base, …).",
  },
  {
    id: "raw-img",
    pattern: /<img[\s>]/,
    message: "Raw <img>. Use next/image for sizing, lazy loading and modern formats.",
  },
  {
    id: "colour-literal",
    pattern: /(?<![\w&/])#[0-9a-fA-F]{3,8}(?![\w-])|\b(?:rgba?|hsla?|oklch|oklab)\(/,
    message: "Literal colour in code. Use tokens; non-CSS contexts import from src/config/brand.ts.",
    allow: COLOR_LITERAL_ALLOWLIST,
  },
];

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "test" ? [] : sourceFiles(full);
    return /\.(ts|tsx)$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

const files = sourceFiles(SRC).map((full) => ({
  relative: path.relative(SRC, full).split(path.sep).join("/"),
  lines: readFileSync(full, "utf8").split(/\r?\n/),
}));

describe("guard rules", () => {
  // Real violations taken from the pre-migration codebase.
  const shouldFlag: Record<string, string[]> = {
    "arbitrary-colour": [
      'className="bg-[rgba(92,183,105,1)]"',
      "text-[#1E1E1E] text-3xl",
      "hover:bg-[rgba(92,183,105,0.1)]",
    ],
    "palette-class": ["bg-gray-100", '"text-white"', "bg-black/60", "border-zinc-400", "text-green-400"],
    "dark-variant": ["dark:bg-input/30"],
    "arbitrary-type": ["text-[15px]", "font-['Poppins']"],
    "raw-img": ['<img src="/images/gtech.png" />'],
    "colour-literal": ["color: '#5D5D5D'", 'stroke="rgba(92,183,105,1)"'],
  };
  const shouldPass = [
    'href="#about"',
    "bg-primary text-primary-foreground hover:bg-primary/90",
    "text-foreground/70 bg-overlay/60 border-input shadow-card fill-current",
    "ring-[3px] max-w-[calc(100%-2rem)] text-display",
    "&#8212;",
  ];

  it.each(RULES.map((rule) => [rule.id, rule] as const))("%s flags known violations", (id, rule) => {
    for (const sample of shouldFlag[id] ?? []) expect(rule.pattern.test(sample), sample).toBe(true);
  });

  it.each(shouldPass)("allows %s", (sample) => {
    expect(RULES.filter((rule) => rule.pattern.test(sample)).map((rule) => rule.id)).toEqual([]);
  });
});

describe("design-system guard", () => {
  it("scans the source tree", () => {
    expect(files.length).toBeGreaterThan(10);
  });

  it.each(RULES.map((rule) => [rule.id, rule] as const))("%s", (_id, rule) => {
    const violations = files.flatMap(({ relative, lines }) =>
      rule.allow?.has(relative)
        ? []
        : lines.flatMap((line, index) =>
            rule.pattern.test(line) ? [`${relative}:${index + 1}  ${line.trim()}`] : [],
          ),
    );
    expect(violations, rule.message).toEqual([]);
  });
});
