"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { loadMotionEngine } from "./load-engine";
import { useMotionEnabled } from "./use-motion-enabled";

export type MarqueeProps<T> = {
  items: readonly T[];
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  /** Names the region and its pause button ("press clippings"). */
  label: string;
  /** Base speed in px/s; scrolling the page adds up to 4× on top. */
  speed?: number;
  className?: string;
  /** Classes for the moving strip, e.g. to run it edge to edge. */
  viewportClassName?: string;
};

/**
 * An endless row that drifts left and speeds up while the page scrolls.
 * It pauses on hover, on keyboard focus, off-screen and via its button
 * (WCAG 2.2.2). Without motion it is a plain horizontally scrollable row.
 */
export function Marquee<T>({
  items,
  getKey,
  renderItem,
  label,
  speed = 32,
  className,
  viewportClassName,
}: MarqueeProps<T>) {
  const motion = useMotionEnabled();
  const [paused, setPaused] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const hold = useRef({ paused: false, hover: false, focus: false, offscreen: false });

  useEffect(() => {
    hold.current.paused = paused;
  }, [paused]);

  useEffect(() => {
    const element = track.current;
    if (!motion || !element) return;

    const held = () => Object.values(hold.current).some(Boolean);
    const visibility =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(([entry]) => {
            hold.current.offscreen = !entry?.isIntersecting;
          });
    visibility?.observe(element);

    let cancelled = false;
    let dispose: (() => void) | undefined;
    loadMotionEngine()
      .then((engine) => {
        if (!cancelled) dispose = engine.marqueeLoop(element, speed, held);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      dispose?.();
      visibility?.disconnect();
    };
  }, [motion, speed]);

  const list = (copy: boolean) => (
    <ul className="flex shrink-0 gap-4 pr-4" {...(copy ? { "aria-hidden": true, inert: true } : {})}>
      {items.map((item) => (
        <li key={getKey(item)} className="shrink-0">
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );

  return (
    <div role="group" aria-label={label} className={cn("flex flex-col gap-5", className)}>
      <div
        className={cn(motion ? "overflow-hidden" : "overflow-x-auto pb-3", viewportClassName)}
        onPointerEnter={() => {
          hold.current.hover = true;
        }}
        onPointerLeave={() => {
          hold.current.hover = false;
        }}
        onFocus={() => {
          hold.current.focus = true;
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) hold.current.focus = false;
        }}
      >
        <div ref={track} className="flex w-max">
          {list(false)}
          {motion ? list(true) : null}
        </div>
      </div>
      {motion ? (
        <Button
          variant="outline"
          size="icon-sm"
          aria-label={`Pause ${label}`}
          aria-pressed={paused}
          onClick={() => setPaused((value) => !value)}
          className="self-start"
        >
          {paused ? <Play className="fill-current" /> : <Pause className="fill-current" />}
        </Button>
      ) : null}
    </div>
  );
}
