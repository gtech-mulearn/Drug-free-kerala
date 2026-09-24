"use client";

import { useEffect, useRef } from "react";
import { useSafeId } from "@/lib/use-safe-id";
import { cn } from "@/lib/utils";
import { loadMotionEngine, motionWelcome } from "./load-engine";

/**
 * A mint ribbon of slogans along a curve, drifting as the page scrolls
 * (Divi's "Let's make change together" band). The drift animates the SVG
 * textPath's startOffset: the one exception to "transform, opacity and
 * clip-path only", and cheap because the SVG is small.
 */
export function CurvedRibbon({ lines, className }: { lines: readonly string[]; className?: string }) {
  const pathId = useSafeId("ribbon");
  const root = useRef<SVGSVGElement>(null);
  const loop = `${Array.from({ length: 4 }, () => lines.join("  •  ")).join("  •  ")}  •  `;

  useEffect(() => {
    const svg = root.current;
    if (!svg || !motionWelcome()) return;
    let cancelled = false;
    let dispose: (() => void) | undefined;
    loadMotionEngine()
      .then((engine) => {
        if (!cancelled) dispose = engine.ribbonDrift(svg);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      dispose?.();
    };
  }, []);

  return (
    <div className={cn("pointer-events-none relative", className)}>
      <p className="sr-only">{lines.map((line) => `${line}.`).join(" ")}</p>
      <svg
        ref={root}
        aria-hidden="true"
        viewBox="0 0 1200 260"
        className="relative left-1/2 h-auto w-[140%] max-w-none -translate-x-1/2 overflow-visible"
      >
        <path id={pathId} d="M-120 190 C 180 60, 460 40, 720 140 S 1140 250, 1340 110" fill="none" />
        <use href={`#${pathId}`} className="fill-none stroke-brand" strokeWidth={52} strokeLinecap="round" />
        <text fontSize={30} letterSpacing={1} dy={10} className="fill-brand-foreground font-poster">
          <textPath href={`#${pathId}`} startOffset="0%">
            {loop}
          </textPath>
        </text>
      </svg>
    </div>
  );
}
