import { Bebas_Neue, Inter_Tight } from "next/font/google";

/**
 * Self-hosted at build time by next/font: no runtime request to Google, and
 * covered by the `font-src 'self'` CSP. Exposed to Tailwind as --font-sans and
 * --font-poster (src/styles/theme.css).
 */

/** Everything: headings and body. A variable font, so every weight is one file. */
export const interTight = Inter_Tight({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter-tight",
});

/** Numerals and the wordmark only; it is the logo's DRUG FREE lettering. */
export const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-bebas",
});

/** Class list for <html>. */
export const fontVariables = `${interTight.variable} ${bebasNeue.variable}`;
