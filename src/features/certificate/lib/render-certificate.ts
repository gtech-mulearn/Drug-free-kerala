import { certificateInk } from "@/config/brand";
import { fitText, LINE_HEIGHT } from "./fit-text";

type TextBlock = {
  /** Anchor on a 1080 × 1080 design grid (horizontal centre of the text). */
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

/**
 * Where text goes on certificate-template.jpg. The name sits in the gap
 * between the "I" (≈ y 395) and the pledge paragraph (≈ y 510); a single
 * line keeps the original baseline at y 480.
 */
export const CERTIFICATE_LAYOUT = {
  grid: 1080,
  name: {
    x: 550,
    y: 480,
    anchor: "last-baseline",
    maxWidth: 800,
    maxLines: 2,
    maxFontSize: 48,
    minFontSize: 24,
    maxHeight: 88,
    color: certificateInk.name,
  },
  id: {
    x: 530,
    y: 850,
    anchor: "center",
    maxWidth: 400,
    maxLines: 1,
    maxFontSize: 30,
    minFontSize: 22,
    color: certificateInk.id,
  },
} satisfies { grid: number; name: TextBlock; id: TextBlock };

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
  templateSrc: string;
  /** CSS font-family list, e.g. `poppins.style.fontFamily`. */
  fontFamily: string;
};

/** Draws the personalised certificate onto `canvas` at the template's native size. */
export async function renderCertificate(canvas: HTMLCanvasElement, input: RenderCertificateInput): Promise<void> {
  const [template] = await Promise.all([
    loadImage(input.templateSrc),
    // Canvas text does not wait for web fonts; load Poppins first.
    document.fonts.load(`700 48px ${input.fontFamily}`).catch(() => []),
  ]);

  canvas.width = template.naturalWidth;
  canvas.height = template.naturalHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D context is unavailable");

  context.drawImage(template, 0, 0);
  const scale = canvas.width / CERTIFICATE_LAYOUT.grid;
  drawBlock(context, input.name, CERTIFICATE_LAYOUT.name, scale, input.fontFamily);
  drawBlock(context, input.certificateId, CERTIFICATE_LAYOUT.id, scale, input.fontFamily);
}

/** PNG blob of the rendered canvas. */
export function canvasToPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not export the certificate"))), "image/png");
  });
}
