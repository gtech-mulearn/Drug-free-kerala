/**
 * Literal colours for contexts that cannot read CSS variables: the Open Graph
 * image (next/og), the theme-color meta tag and the certificate canvas.
 *
 * This is the only file allowed to contain colour literals
 * (src/test/design-system/guard.test.ts). brand.test.ts asserts that every
 * value here matches its palette token in src/styles/tokens.css.
 */
export const brandColors = {
  green: "#5cb769", // --palette-green-400
  greenDeep: "#2b7036", // --palette-green-700
  greenDarkest: "#0f2914", // --palette-green-950
  ink: "#1e1e1e", // --palette-neutral-900
  paper: "#efeeec", // --palette-neutral-100
  offWhite: "#f2f2f2", // --palette-neutral-50
  black: "#000000", // --palette-neutral-1000
} as const;

/** Palette token each brand colour mirrors (checked by brand.test.ts). */
export const brandColorTokens: Record<keyof typeof brandColors, string> = {
  green: "--palette-green-400",
  greenDeep: "--palette-green-700",
  greenDarkest: "--palette-green-950",
  ink: "--palette-neutral-900",
  paper: "--palette-neutral-100",
  offWhite: "--palette-neutral-50",
  black: "--palette-neutral-1000",
};

/**
 * Ink colours baked into the certificate artwork
 * (src/assets/images/certificate-template.jpg). They belong to that image,
 * not to the UI theme, so they have no palette token.
 */
export const certificateInk = {
  name: "#000000",
  id: "#5d5d5d",
} as const;
