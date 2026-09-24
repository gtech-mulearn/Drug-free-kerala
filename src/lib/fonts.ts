import { Poppins } from "next/font/google";

/**
 * Self-hosted at build time by next/font: no runtime request to Google, and
 * covered by the `font-src 'self'` CSP. Exposed to Tailwind as --font-poppins
 * (see --font-sans in src/styles/theme.css) and to the certificate canvas via
 * `poppins.style.fontFamily`.
 */
export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});
