import { MarkGradient } from "@/components/brand/dove-mark";
import { CAGE_RECTS, DOVE_PATH, MARK_BOX } from "@/components/brand/dove-path";
import { useSafeId } from "@/lib/use-safe-id";
import { cn } from "@/lib/utils";

const VIEW_BOX = `0 0 ${MARK_BOX.width} ${MARK_BOX.height}`;

/**
 * The logo mark split into two layers on one grid: the cage stays put while
 * the dove drifts up out of it as the page scrolls (data-parallax). At rest
 * it is the logo as drawn. Decorative.
 */
export function BreakingFreeMark({ className }: { className?: string }) {
  const gradientId = useSafeId("breaking-free");
  return (
    <div
      aria-hidden="true"
      className={cn("relative", className)}
      style={{ aspectRatio: `${MARK_BOX.width} / ${MARK_BOX.height}` }}
    >
      <div data-parallax="-14" className="absolute inset-0">
        <svg viewBox={VIEW_BOX} focusable="false" className="size-full">
          <MarkGradient id={gradientId} x2="0.55" />
          <path d={DOVE_PATH} fill={`url(#${gradientId})`} />
        </svg>
      </div>
      <svg viewBox={VIEW_BOX} focusable="false" className="absolute inset-0 size-full">
        {CAGE_RECTS.map(([x, y, width, height], index) => (
          <rect key={index} x={x} y={y} width={width} height={height} fill="currentColor" />
        ))}
      </svg>
    </div>
  );
}
