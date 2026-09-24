import { ImageResponse } from "next/og";
import { CAGE_RECTS, DOVE_PATH, MARK_BOX } from "@/components/brand/dove-path";
import { brandColors } from "@/config/brand";

export const alt = "Drug Free Kerala: united against addiction. Take the pledge.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Link preview for WhatsApp, Facebook, X and LinkedIn shares. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: 88,
          background: `radial-gradient(60% 70% at 85% 20%, ${brandColors.teal}66, transparent), ${brandColors.forest}`,
          color: brandColors.paper,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 720 }}>
          <div style={{ display: "flex", fontSize: 30, color: brandColors.mint }}>#StrongerWithoutDrugs</div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 104, lineHeight: 0.95, letterSpacing: -4 }}>
            United against addiction.
          </div>
          <div style={{ display: "flex", marginTop: 32, fontSize: 36, color: brandColors.sage }}>
            Take the pledge and get your certificate.
          </div>
          <div style={{ display: "flex", marginTop: 52, fontSize: 26, color: brandColors.mint }}>
            μLearn × GTech · drugfreekerala.com
          </div>
        </div>
        <svg width="282" height="366" viewBox={`0 0 ${MARK_BOX.width} ${MARK_BOX.height}`}>
          <defs>
            <linearGradient id="dove" x1="0" y1="0" x2="0.55" y2="1">
              <stop offset="0" stopColor={brandColors.mint} />
              <stop offset="1" stopColor={brandColors.teal} />
            </linearGradient>
          </defs>
          <path d={DOVE_PATH} fill="url(#dove)" />
          {CAGE_RECTS.map(([x, y, width, height], index) => (
            <rect key={index} x={x} y={y} width={width} height={height} fill={brandColors.paper} />
          ))}
        </svg>
      </div>
    ),
    size,
  );
}
