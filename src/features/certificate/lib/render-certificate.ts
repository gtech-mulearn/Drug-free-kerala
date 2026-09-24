import { certificateInk } from "@/config/brand";
import type { CertificateLanguage } from "../types";
import { fitText, LINE_HEIGHT } from "./fit-text";

type TextBlock = {
  /** Anchor on the 1920 × 1080 design grid (horizontal centre of the text). */
  x: number;
  y: number;
  /**
   * "center": `y` is the middle of the block.
   * "last-baseline": `y` is the last line's baseline; extra lines grow upward.
   */
  anchor: "center" | "last-baseline";
  maxWidth: number;
  maxLines: number;
  maxFontSize: number;
  minFontSize: number;
  /** Tallest the block may be, in grid units. */
  maxHeight?: number;
  color: string;
};

const ID_BLOCK: TextBlock = {
  x: 960,
  y: 800,
  anchor: "center",
  maxWidth: 500,
  maxLines: 1,
  maxFontSize: 32,
  minFontSize: 24,
  color: certificateInk.id,
};

const nameBlock = (y: number): TextBlock => ({
  x: 960,
  y,
  anchor: "last-baseline",
  maxWidth: 1300,
  maxLines: 2,
  maxFontSize: 56,
  minFontSize: 28,
  maxHeight: 96,
  color: certificateInk.name,
});

/**
 * Where text goes on certificate-template-{en,ml}.jpg (16:9, rendered from
 * scripts/certificate/template.html; keep the two in sync). Measured ink:
 *
 * - en: "I," ends at y 397 and the pledge starts at 547; the name is centred
 *   between them ("I, <name> solemnly pledge…").
 * - ml: the logo ends at y 288 and the pledge starts at 493; the name sits
 *   nearer the pledge it begins ("<name> എന്ന ഞാൻ…").
 * - both: "My Unique Id" ends at 748 and the hashtag starts at 848; the ID sits
 *   nearer its label.
 *
 * A second line of name grows upward.
 */
export const CERTIFICATE_LAYOUT = {
  grid: { width: 1920, height: 1080 },
  languages: {
    en: { name: nameBlock(492), id: ID_BLOCK },
    ml: { name: nameBlock(432), id: ID_BLOCK },
  },
} satisfies {
  grid: { width: number; height: number };
  languages: Record<CertificateLanguage, { name: TextBlock; id: TextBlock }>;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load the certificate template"));
    image.src = src;
  });
}

function drawBlock(
  context: CanvasRenderingContext2D,
  text: string,
  block: TextBlock,
  scale: number,
  fontFamily: string,
) {
  const font = (size: number) => `700 ${size * scale}px ${fontFamily}`;
  const { fontSize, lines } = fitText(text, {
    maxWidth: block.maxWidth * scale,
    maxLines: block.maxLines,
    maxFontSize: block.maxFontSize,
    minFontSize: block.minFontSize,
    // Font sizes and height are both in grid units; only `measure` scales.
    maxHeight: block.maxHeight,
    measure: (value, size) => {
      context.font = font(size);
      return context.measureText(value).width;
    },
  });

  context.font = font(fontSize);
  context.fillStyle = block.color;
  context.textAlign = "center";
  context.textBaseline = "alphabetic";

  const lineHeight = fontSize * LINE_HEIGHT * scale;
  const extraLines = lines.length - 1;
  const firstLineY = block.y * scale - (block.anchor === "center" ? (lineHeight * extraLines) / 2 : lineHeight * extraLines);
  lines.forEach((line, index) => context.fillText(line, block.x * scale, firstLineY + index * lineHeight));
}

export type RenderCertificateInput = {
  name: string;
  certificateId: string;
  language: CertificateLanguage;
  /** The artwork for `language`. */
  templateSrc: string;
  /** CSS font-family list, e.g. `certificateFontFamily`. */
  fontFamily: string;
};

/** Draws the personalised certificate onto `canvas` at the template's native size. */
export async function renderCertificate(canvas: HTMLCanvasElement, input: RenderCertificateInput): Promise<void> {
  const [template] = await Promise.all([
    loadImage(input.templateSrc),
    // Canvas text does not wait for web fonts; load the faces this text needs
    // (Poppins, plus Noto Sans Malayalam for names in Malayalam script).
    document.fonts.load(`700 48px ${input.fontFamily}`, `${input.name} ${input.certificateId}`).catch(() => []),
  ]);

  canvas.width = template.naturalWidth;
  canvas.height = template.naturalHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D context is unavailable");

  context.drawImage(template, 0, 0);
  const scale = canvas.width / CERTIFICATE_LAYOUT.grid.width;
  const layout = CERTIFICATE_LAYOUT.languages[input.language];
  drawBlock(context, input.name, layout.name, scale, input.fontFamily);
  drawBlock(context, input.certificateId, layout.id, scale, input.fontFamily);
}

/** PNG blob of the rendered canvas. */
export function canvasToPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not export the certificate"))), "image/png");
  });
}
