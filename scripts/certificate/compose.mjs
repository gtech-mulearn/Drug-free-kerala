/**
 * Renders the pledge certificate artwork (scripts/certificate/template.html)
 * to src/assets/images/certificate-template-{en,ml}.jpg, 1920 × 1080.
 *
 *   npm run certificate:template
 *
 * Needs a network connection (Poppins, Noto Sans Malayalam and Bebas Neue come from Google Fonts)
 * and Playwright's Chromium (npx playwright install chromium). Re-run it
 * whenever the template, a logo or the brand dove changes.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const IMAGES = path.join(ROOT, "src/assets/images");
const LANGUAGES = ["en", "ml"];
const output = (language) => path.join(IMAGES, `certificate-template-${language}.jpg`);

/** The two campaigns, left and right of the Drug Free Kerala mark. */
const FLANKS = ["logo-mayangilla Keralam.webp", "logo-operation-thunder.webp"];
/** The strip along the bottom edge. */
const PARTNERS = ["logo-Emblom.webp"];

const MIME = { ".png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg" };
const dataUri = (file) =>
  `data:${MIME[path.extname(file)]};base64,${readFileSync(path.join(IMAGES, file)).toString("base64")}`;

/** The traced dove and cage bars, shared with the site (src/components/brand/dove-path.ts). */
function brandPaths() {
  const source = readFileSync(path.join(ROOT, "src/components/brand/dove-path.ts"), "utf8");
  const dove = source.match(/DOVE_PATH =\s*"([^"]+)"/)?.[1];
  const cage = [...source.matchAll(/\[(\d+), (\d+), (\d+), (\d+)\]/g)].map(
    ([, x, y, width, height]) => `<rect x="${x}" y="${y}" width="${width}" height="${height}" />`,
  );
  if (!dove || cage.length === 0) throw new Error("Could not read DOVE_PATH / CAGE_RECTS from dove-path.ts");
  return { dove, cage: cage.join("") };
}

/** Recolours single-colour white artwork: the image becomes a mask over the ink colour. */
function maskStyle(file) {
  const uri = dataUri(file);
  // Aspect ratio from the PNG header (width and height at bytes 16–23).
  const header = readFileSync(path.join(IMAGES, file));
  const aspect = header.readUInt32BE(16) / header.readUInt32BE(20);
  return `aspect-ratio: ${aspect}; mask-image: url(${uri}); -webkit-mask-image: url(${uri});`;
}

const { dove, cage } = brandPaths();
const html = readFileSync(path.join(ROOT, "scripts/certificate/template.html"), "utf8")
  .replaceAll("{{DOVE_PATH}}", dove)
  .replace("{{CAGE_RECTS}}", cage)
  .replace("{{MULEARN_STYLE}}", maskStyle("logo-mulearn-white.png"))
  .replace("{{GTECH_STYLE}}", maskStyle("logo-gtech.png"))
  .replace("{{FLANKS}}", JSON.stringify(FLANKS.map(dataUri)))
  .replace("{{PARTNERS}}", JSON.stringify(PARTNERS.map(dataUri)));

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "networkidle" });
  const fonts = await page.evaluate(() => window.ready);
  if (Object.values(fonts).includes(false)) throw new Error(`Fonts did not load: ${JSON.stringify(fonts)}`);
  for (const language of LANGUAGES) {
    await page.evaluate((lang) => (document.body.dataset.lang = lang), language);
    await page.locator("#certificate").screenshot({ path: output(language), type: "jpeg", quality: 92 });
    process.stdout.write(`wrote ${path.relative(ROOT, output(language))} (1920 × 1080)\n`);
  }
} finally {
  await browser.close();
}
