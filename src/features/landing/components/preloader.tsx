import { headers } from "next/headers";
import { DOVE_BOX, DOVE_PATH } from "@/components/brand/dove-path";
import { PRELOADER_FILL, PRELOADER_SCRIPT } from "../lib/preloader-script";

/**
 * Full-screen loader: the dove fills from the bottom as the page's resources
 * load, with a 0–100 count. Server-rendered so it covers the first paint;
 * driven by an inline script (see preloader-script.ts). Without JavaScript
 * it is hidden by CSS (src/styles/motion.css).
 *
 * Decorative: the page behind it is already in the accessibility tree.
 * suppressHydrationWarning: the script updates the count, the fill and the
 * state class before React hydrates.
 */
export async function Preloader() {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <>
      <div className="preloader theme-inverse" aria-hidden="true" suppressHydrationWarning>
        <svg className="preloader__dove" viewBox={`0 0 ${DOVE_BOX.width} ${DOVE_BOX.height}`}>
          <defs>
            <linearGradient id="preloader-fill" x1="0" y1="0" x2="0.55" y2="1">
              <stop offset="0" style={{ stopColor: "var(--mark-start)" }} />
              <stop offset="1" style={{ stopColor: "var(--mark-end)" }} />
            </linearGradient>
            <clipPath id="preloader-level">
              <rect
                data-preloader-level
                x="0"
                y={PRELOADER_FILL.y}
                width={PRELOADER_FILL.width}
                height={PRELOADER_FILL.height}
                suppressHydrationWarning
              />
            </clipPath>
          </defs>
          <path className="preloader__ghost" d={DOVE_PATH} />
          <path d={DOVE_PATH} fill="url(#preloader-fill)" clipPath="url(#preloader-level)" />
        </svg>
        <div className="preloader__footer">
          <p className="preloader__label">Drug Free Kerala</p>
          <p className="preloader__count">
            <span data-preloader-count suppressHydrationWarning>
              0
            </span>
            <small>%</small>
          </p>
        </div>
      </div>
      {/* A static constant (no user data), allowed by this request's CSP nonce. */}
      {/* eslint-disable-next-line react/no-danger */}
      <script nonce={nonce} dangerouslySetInnerHTML={{ __html: PRELOADER_SCRIPT }} />
    </>
  );
}
