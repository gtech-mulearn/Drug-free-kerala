import { Noto_Sans_Malayalam, Poppins } from "next/font/google";

/*
 * Fonts the canvas draws names and IDs in. Loaded only with the certificate
 * view, not with the page; the canvas waits for them (document.fonts.load).
 */

/** The certificate artwork is set in Poppins Bold. */
const poppins = Poppins({
  subsets: ["latin"],
  weight: "700",
  display: "swap",
  preload: false,
});

/** Names written in Malayalam script (Poppins has no Malayalam glyphs). */
const notoSansMalayalam = Noto_Sans_Malayalam({
  subsets: ["malayalam"],
  weight: "700",
  display: "swap",
  preload: false,
});

/** CSS font-family list for canvas text: Latin from Poppins, Malayalam from Noto. */
export const certificateFontFamily = `${poppins.style.fontFamily}, ${notoSansMalayalam.style.fontFamily}`;
