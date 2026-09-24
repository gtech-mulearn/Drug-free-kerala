import { useSafeId } from "@/lib/use-safe-id";
import { cn } from "@/lib/utils";
import { DoveMark, MarkGradient } from "./dove-mark";
import { MARK_BOX } from "./dove-path";

type LogoProps = {
  className?: string;
  /** Hide from assistive tech when a parent (e.g. the home link) already names it. */
  decorative?: boolean;
};

const naming = (decorative: boolean) =>
  decorative ? ({ "aria-hidden": true } as const) : ({ role: "img", "aria-label": "Drug Free Kerala" } as const);

/**
 * The logo lockup, rebuilt as SVG on the original's 140 × 61 grid: dove and
 * cage, "DRUG FREE" in the mark gradient and "KERALA" in currentColor
 * (white on forest, ink on light). Both lines are Bebas Neue, the logo's
 * lettering; textLength pins them to the original widths. KERALA is heavier
 * in the artwork than Bebas Regular, hence the thin matching stroke.
 */
export function Logo({ className, decorative = false }: LogoProps) {
  const gradientId = useSafeId("logo-type");
  return (
    <svg viewBox="0 0 140 61" className={cn("h-10 w-auto overflow-visible", className)} {...naming(decorative)}>
      <DoveMark cage x={0} y={0} width={MARK_BOX.width} height={MARK_BOX.height} />
      <MarkGradient id={gradientId} gradientUnits="userSpaceOnUse" y1="11" y2="29" />
      <text
        x={57}
        y={29}
        fontSize={25.71}
        textLength={79}
        lengthAdjust="spacingAndGlyphs"
        fill={`url(#${gradientId})`}
        className="font-poster"
      >
        DRUG FREE
      </text>
      <text
        x={57}
        y={61}
        fontSize={38.57}
        textLength={83}
        lengthAdjust="spacingAndGlyphs"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={0.9}
        paintOrder="stroke"
        className="font-poster"
      >
        KERALA
      </text>
    </svg>
  );
}

/**
 * "DRUG FREE KERALA" on one line, scaled to its container's width (the footer
 * sign-off). The viewBox is the text's natural advance at 210 px, so letters
 * are never stretched.
 */
export function Wordmark({ className }: { className?: string }) {
  const gradientId = useSafeId("wordmark");
  return (
    <svg viewBox="0 0 1202 150" aria-hidden="true" className={cn("h-auto w-full overflow-visible", className)}>
      <MarkGradient id={gradientId} gradientUnits="userSpaceOnUse" y1="0" y2="147" />
      <text x={0} y={147} fontSize={210} className="font-poster">
        <tspan fill={`url(#${gradientId})`}>DRUG FREE </tspan>
        <tspan fill="currentColor">KERALA</tspan>
      </text>
    </svg>
  );
}
