// @vitest-environment node
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Design tokens are defined in exactly two files. Any other stylesheet that
 * redefines one silently re-themes the site: `shadcn init` once appended a
 * stock theme to globals.css (`:root { --background: oklch(1 0 0); … }`),
 * overriding every light-theme colour, the fonts and the radii.
 */
const SRC = fileURLToPath(new URL("../../", import.meta.url));
const TOKEN_FILES = new Set(["styles/tokens.css", "styles/theme.css"]);

/** Custom properties declared in `css` (`--name:`), comments removed. */
export function declaredProperties(css: string): string[] {
  const body = css.replace(/\/\*[\s\S]*?\*\//g, "");
  return [...body.matchAll(/(?:^|[\s{;])(--[\w-]+)\s*:/g)].map((match) => match[1] ?? "");
}

function stylesheets(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return stylesheets(full);
    return entry.name.endsWith(".css") ? [full] : [];
  });
}

const files = stylesheets(SRC).map((full) => ({
  relative: path.relative(SRC, full).split(path.sep).join("/"),
  css: readFileSync(full, "utf8"),
}));

const tokens = new Set(
  files.filter(({ relative }) => TOKEN_FILES.has(relative)).flatMap(({ css }) => declaredProperties(css)),
);

describe("stylesheet guard", () => {
  it("finds the token files", () => {
    expect(tokens.has("--background")).toBe(true);
    expect(tokens.has("--color-primary")).toBe(true);
    expect(tokens.has("--font-sans")).toBe(true);
  });

  it("flags a stock theme appended by a component installer", () => {
    const appended = ":root { --background: oklch(1 0 0); --radius: 0.625rem; }\n@theme inline { --font-sans: var(--font-sans); }";
    expect(declaredProperties(appended).filter((name) => tokens.has(name))).toEqual([
      "--background",
      "--radius",
      "--font-sans",
    ]);
  });

  it("no other stylesheet redefines a design token", () => {
    const violations = files
      .filter(({ relative }) => !TOKEN_FILES.has(relative))
      .flatMap(({ relative, css }) =>
        declaredProperties(css)
          .filter((name) => tokens.has(name))
          .map((name) => `${relative}: ${name}`),
      );
    expect(violations, "Define tokens only in src/styles/tokens.css and theme.css").toEqual([]);
  });
});
