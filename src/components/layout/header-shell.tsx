"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export type HeaderState = { solid: boolean; hidden: boolean };

const SOLID_AFTER = 24;
const HIDE_AFTER = 480;
const JITTER = 6;

/** Solid once scrolled; hidden while scrolling down the page, back on the way up. */
export function nextHeaderState(previousY: number, y: number, current: HeaderState): HeaderState {
  const solid = y > SOLID_AFTER;
  if (y <= HIDE_AFTER) return { solid, hidden: false };
  const delta = y - previousY;
  if (Math.abs(delta) < JITTER) return { solid, hidden: current.hidden };
  return { solid, hidden: delta > 0 };
}

/** Fixed forest header over the page; see nextHeaderState for its behaviour. */
export function HeaderShell({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<HeaderState>({ solid: false, hidden: false });

  useEffect(() => {
    let previousY = window.scrollY;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      // Stay put while keyboard focus is in the header or a menu/dialog is open.
      const pinned =
        ref.current?.contains(document.activeElement) === true || document.body.hasAttribute("data-scroll-locked");
      setState((current) => {
        const next = nextHeaderState(previousY, y, current);
        const hidden = next.hidden && !pinned;
        return next.solid === current.solid && hidden === current.hidden ? current : { solid: next.solid, hidden };
      });
      previousY = y;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    frame = requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header
      ref={ref}
      data-solid={state.solid}
      data-hidden={state.hidden}
      className="theme-inverse fixed inset-x-0 top-0 z-40 bg-transparent text-foreground transition-[translate,background-color,backdrop-filter] duration-500 ease-out-expo data-[hidden=true]:-translate-y-full data-[solid=true]:bg-background/85 data-[solid=true]:backdrop-blur-md"
    >
      {children}
    </header>
  );
}
