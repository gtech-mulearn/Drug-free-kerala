/**
 * Literal colours for contexts that cannot read CSS variables: the Open Graph
 * image (next/og) and the theme-color meta tag.
 *
 * This is the only file allowed to contain colour literals
 * (src/test/design-system/guard.test.ts). brand.test.ts asserts that every
 * value here matches its palette token in src/styles/tokens.css.
 */
export const brandColors = {
  forest: "#0a2622", // --palette-forest-900
  forestDeep: "#061a17", // --palette-forest-950
  mint: "#71d884", // --palette-mint-400
  teal: "#23a093", // --palette-teal-500
  paper: "#f4f5f2", // --palette-neutral-50
  ink: "#0e1512", // --palette-neutral-900
  sage: "#a3b8b1", // --palette-forest-200
} as const;

/** Palette token each brand colour mirrors (checked by brand.test.ts). */
export const brandColorTokens: Record<keyof typeof brandColors, string> = {
  forest: "--palette-forest-900",
  forestDeep: "--palette-forest-950",
  mint: "--palette-mint-400",
  teal: "--palette-teal-500",
  paper: "--palette-neutral-50",
  ink: "--palette-neutral-900",
  sage: "--palette-forest-200",
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
