"use client";

import { useEffect } from "react";
import { loadMotionEngine, motionWelcome } from "./load-engine";

/**
 * Site-wide motion, mounted once in the root layout. Renders nothing.
 *
 * Under reduced motion it only records <html data-motion="static">.
 * Otherwise it loads the motion engine after the first paint and starts
 * Lenis and the data-* effects (engine.ts: startMotion).
 */
export function MotionRuntime() {
  useEffect(() => {
    const root = document.documentElement;
    if (!motionWelcome()) {
      root.dataset.motion = "static";
      return;
    }

    let cancelled = false;
    let stop: (() => void) | undefined;
    loadMotionEngine()
      .then((engine) => {
        if (!cancelled) stop = engine.startMotion();
      })
      .catch((error: unknown) => {
        console.error("[motion] engine failed to load", error);
        root.dataset.motion = "static";
      });

    return () => {
      cancelled = true;
      stop?.();
    };
  }, []);

  return null;
}
