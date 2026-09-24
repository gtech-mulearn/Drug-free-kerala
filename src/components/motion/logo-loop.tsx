"use client";

import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { cn } from "@/lib/utils";
import { useMotionEnabled } from "./use-motion-enabled";

/*
 * LogoLoop from React Bits (reactbits.dev), ported to this codebase:
 * TypeScript, a client component, Tailwind instead of its stylesheet, and a
 * mask for the edge fade (it works on any surface, so no fade colour).
 * Kept from the original: copies fill the container, velocity eases towards
 * its target (hover slows smoothly), pause on hover, scale on hover.
 * Added: a still, wrapping row under reduced motion; no animation while
 * off-screen; copies are inert.
 */

const ANIMATION = { SMOOTH_TAU: 0.25, MIN_COPIES: 2, COPY_HEADROOM: 2 };

export type LogoItem = {
  key: string;
  /** Rendered logo (an image or a lockup). */
  node: ReactNode;
  /** Accessible name when `node` is purely visual. */
  title: string;
};

export type LogoLoopProps = {
  logos: readonly LogoItem[];
  /** Pixels per second. */
  speed?: number;
  direction?: "left" | "right";
  gap?: number;
  pauseOnHover?: boolean;
  fadeOut?: boolean;
  scaleOnHover?: boolean;
  /** Names the region. */
  ariaLabel: string;
  className?: string;
};

/** Moves the track, easing velocity towards its target; stops when inactive. */
function useAnimationLoop(
  trackRef: RefObject<HTMLDivElement | null>,
  targetVelocity: number,
  sequenceWidth: number,
  active: boolean,
) {
  const offset = useRef(0);
  const velocity = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !active || sequenceWidth <= 0) return;

    let frame = 0;
    let last: number | null = null;
    const animate = (time: number) => {
      const delta = last === null ? 0 : Math.max(0, time - last) / 1000;
      last = time;
      velocity.current += (targetVelocity - velocity.current) * (1 - Math.exp(-delta / ANIMATION.SMOOTH_TAU));
      offset.current = (((offset.current + velocity.current * delta) % sequenceWidth) + sequenceWidth) % sequenceWidth;
      track.style.transform = `translate3d(${-offset.current}px, 0, 0)`;
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [trackRef, targetVelocity, sequenceWidth, active]);
}

export const LogoLoop = memo(function LogoLoop({
  logos,
  speed = 48,
  direction = "left",
  gap = 64,
  pauseOnHover = true,
  fadeOut = true,
  scaleOnHover = false,
  ariaLabel,
  className,
}: LogoLoopProps) {
  const motion = useMotionEnabled();
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const sequenceRef = useRef<HTMLUListElement>(null);

  const [sequenceWidth, setSequenceWidth] = useState(0);
  const [copies, setCopies] = useState(ANIMATION.MIN_COPIES);
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(true);

  const measure = useCallback(() => {
    const containerWidth = containerRef.current?.clientWidth ?? 0;
    const width = sequenceRef.current?.getBoundingClientRect().width ?? 0;
    if (width <= 0) return;
    setSequenceWidth(Math.ceil(width));
    setCopies(Math.max(ANIMATION.MIN_COPIES, Math.ceil(containerWidth / width) + ANIMATION.COPY_HEADROOM));
  }, []);

  useEffect(() => {
    if (!motion) return;
    measure();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    if (containerRef.current) observer?.observe(containerRef.current);
    if (sequenceRef.current) observer?.observe(sequenceRef.current);
    // Images change the sequence width as they load.
    const images = [...(sequenceRef.current?.querySelectorAll("img") ?? [])];
    images.forEach((image) => image.addEventListener("load", measure));
    return () => {
      observer?.disconnect();
      images.forEach((image) => image.removeEventListener("load", measure));
    };
  }, [motion, measure, logos, gap]);

  useEffect(() => {
    const container = containerRef.current;
    if (!motion || !container || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry?.isIntersecting ?? true));
    observer.observe(container);
    return () => observer.disconnect();
  }, [motion]);

  const baseVelocity = Math.abs(speed) * (direction === "left" ? 1 : -1);
  const targetVelocity = pauseOnHover && hovered ? 0 : baseVelocity;
  useAnimationLoop(trackRef, targetVelocity, sequenceWidth, motion && visible);

  const list = (copy: number) => (
    <ul
      key={copy}
      ref={copy === 0 ? sequenceRef : undefined}
      className={cn("flex items-center", motion ? "shrink-0" : "flex-wrap justify-center gap-y-8")}
      style={{ columnGap: gap, paddingRight: motion ? gap : 0 }}
      {...(copy > 0 ? { "aria-hidden": true, inert: true } : {})}
    >
      {logos.map((logo) => (
        <li
          key={logo.key}
          className={cn(
            "shrink-0",
            scaleOnHover && "transition-transform duration-300 ease-out-expo hover:scale-110",
          )}
        >
          <span role="img" aria-label={logo.title} className="flex items-center">
            {logo.node}
          </span>
        </li>
      ))}
    </ul>
  );

  const fade: CSSProperties | undefined =
    motion && fadeOut
      ? {
          maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }
      : undefined;

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={ariaLabel}
      className={cn("relative", motion && "overflow-hidden", className)}
      style={fade}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {motion ? (
        <div ref={trackRef} className="flex w-max will-change-transform select-none">
          {Array.from({ length: copies }, (_, copy) => list(copy))}
        </div>
      ) : (
        list(0)
      )}
    </div>
  );
});
