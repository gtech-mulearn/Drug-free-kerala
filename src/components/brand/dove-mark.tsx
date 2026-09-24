import type * as React from "react";
import { useSafeId } from "@/lib/use-safe-id";
import { cn } from "@/lib/utils";
import { CAGE_RECTS, DOVE_BOX, DOVE_PATH, MARK_BOX } from "./dove-path";

/** The logo's mint → teal gradient, from the mark-* tokens. */
export function MarkGradient({ id, ...props }: React.SVGProps<SVGLinearGradientElement> & { id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1" {...props}>
        <stop offset="0" style={{ stopColor: "var(--mark-start)" }} />
        <stop offset="1" style={{ stopColor: "var(--mark-end)" }} />
      </linearGradient>
    </defs>
  );
}

export type DoveMarkProps = Omit<React.SVGProps<SVGSVGElement>, "children"> & {
  /** Include the cage bars from the full logo mark. */
  cage?: boolean;
  /** "gradient": the logo's mint → teal. "solid": currentColor. */
  tone?: "gradient" | "solid";
};

/** The dove from the logo. Decorative: name it on its parent if it means something. */
export function DoveMark({ cage = false, tone = "gradient", className, ...props }: DoveMarkProps) {
  const gradientId = useSafeId("dove");
  const box = cage ? MARK_BOX : DOVE_BOX;

  return (
    <svg
      viewBox={`0 0 ${box.width} ${box.height}`}
      aria-hidden="true"
      focusable="false"
      className={cn("shrink-0", className)}
      {...props}
    >
      {tone === "gradient" ? <MarkGradient id={gradientId} x2="0.55" /> : null}
      <path d={DOVE_PATH} fill={tone === "gradient" ? `url(#${gradientId})` : "currentColor"} />
      {cage
        ? CAGE_RECTS.map(([x, y, width, height], index) => (
            <rect key={index} x={x} y={y} width={width} height={height} fill="currentColor" />
          ))
        : null}
    </svg>
  );
}
