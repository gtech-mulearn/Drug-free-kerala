"use client";

import { useEffect, useRef, type RefObject } from "react";
import { loadMotionEngine, motionWelcome } from "./load-engine";
import { markRevealed } from "./reveal-state";

/**
 * Counts a number up from 0 the first time it scrolls into view. The element
 * needs [data-count] (its CSS start state) and a single text child: the
 * engine rewrites that text node's value, which React still owns, so later
 * renders keep working. `format` must be stable (a module-level function).
 */
export function useCountUp(
  ref: RefObject<HTMLElement | null>,
  value: number | null,
  format: (value: number) => string,
) {
  const latest = useRef(value);
  useEffect(() => {
    latest.current = value;
  });
  const hasValue = value !== null;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const text = element.firstChild;
    const target = latest.current;
    // Nothing to count (API down) or no motion wanted: show what's there.
    if (!hasValue || target === null || !(text instanceof Text) || !motionWelcome()) {
      markRevealed(element);
      return;
    }

    let cancelled = false;
    let dispose: (() => void) | undefined;
    loadMotionEngine()
      .then((engine) => {
        if (!cancelled) dispose = engine.countUp(element, text, target, format, () => latest.current);
      })
      .catch(() => markRevealed(element));

    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [ref, hasValue, format]);
}
