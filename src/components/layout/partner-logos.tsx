import { getImageProps, type StaticImageData } from "next/image";
import type { CSSProperties } from "react";
import gtechLogo from "@/assets/images/logo-gtech.png";
import mulearnLogo from "@/assets/images/logo-mulearn-white.png";
import { cn } from "@/lib/utils";

const PARTNERS: ReadonlyArray<{ name: string; image: StaticImageData }> = [
  { name: "GTech", image: gtechLogo },
  { name: "μLearn", image: mulearnLogo },
];

/**
 * The single-colour artwork becomes a mask, painted with the text colour.
 * The mask comes through the image optimizer at display size (the source
 * PNGs are 1100–1600 px wide), since CSS images load even below the fold.
 */
function maskStyle(image: StaticImageData, displayHeight: number): CSSProperties {
  const { width, height } = image;
  const { props } = getImageProps({ src: image, alt: "", height: displayHeight });
  const mask = `url(${props.src})`;
  return {
    aspectRatio: `${width} / ${height}`,
    maskImage: mask,
    WebkitMaskImage: mask,
    maskSize: "contain",
    WebkitMaskSize: "contain",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskPosition: "left center",
    WebkitMaskPosition: "left center",
  };
}

type MaskedLogoProps = {
  image: StaticImageData;
  /** Accessible name; omit when a parent already names the logo. */
  name?: string;
  /** Rendered height in px (also sizes the optimized mask). */
  height?: number;
  className?: string;
};

/** White single-colour artwork shown in the surrounding text colour. */
export function MaskedLogo({ image, name, height, className }: MaskedLogoProps) {
  return (
    <span
      {...(name ? { role: "img", "aria-label": name } : { "aria-hidden": true })}
      className={cn("block bg-current", className)}
      style={{ ...maskStyle(image, height ?? 32), ...(height ? { height } : {}) }}
    />
  );
}

/** Campaign partners, in the surrounding text colour (ink on light, white on forest). */
export function PartnerLogos({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-5 sm:gap-6", className)}>
      {PARTNERS.map(({ name, image }) => (
        <MaskedLogo key={name} image={image} name={name} className="h-5 sm:h-6" />
      ))}
    </div>
  );
}
