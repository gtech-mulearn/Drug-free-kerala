import Image, { type StaticImageData } from "next/image";
import { DOVE_BOX, DOVE_PATH } from "@/components/brand/dove-path";
import { useSafeId } from "@/lib/use-safe-id";
import { cn } from "@/lib/utils";

type DoveFrameProps = {
  image: StaticImageData;
  alt: string;
  sizes: string;
  className?: string;
};

/**
 * A photo cut to the logo's dove (Divi's asterisk-masked portrait). The clip
 * path is the traced dove in object-bounding-box units, so it scales with
 * the frame.
 */
export function DoveFrame({ image, alt, sizes, className }: DoveFrameProps) {
  const clipId = useSafeId("dove-clip");
  return (
    <div className={cn("relative aspect-3/4", className)}>
      <svg aria-hidden="true" width="0" height="0" className="absolute">
        <clipPath
          id={clipId}
          clipPathUnits="objectBoundingBox"
          transform={`scale(${1 / DOVE_BOX.width} ${1 / DOVE_BOX.height})`}
        >
          <path d={DOVE_PATH} />
        </clipPath>
      </svg>
      <div className="absolute inset-0" style={{ clipPath: `url(#${clipId})` }}>
        <div data-clip-media className="absolute inset-0">
          <Image src={image} alt={alt} fill sizes={sizes} placeholder="blur" className="object-cover object-[42%_center]" />
        </div>
      </div>
    </div>
  );
}
