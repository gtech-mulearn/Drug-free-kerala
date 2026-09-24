import { ImageResponse } from "next/og";
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
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          padding: 88,
          background: brandColors.black,
          color: brandColors.offWhite,
        }}
      >
        <div style={{ display: "flex", fontSize: 34, fontWeight: 700, color: brandColors.green }}>
          #StrongerWithoutDrugs
        </div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 96, fontWeight: 700, lineHeight: 1.05 }}>
          Drug Free Kerala
        </div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 42, maxWidth: 940 }}>
          United against addiction. Take the pledge and get your certificate.
        </div>
        <div style={{ display: "flex", marginTop: 56, fontSize: 28, color: brandColors.green }}>
          μLearn × GTech · drugfreekerala.com
        </div>
      </div>
    ),
    size,
  );
}
