"use client";

import { useSyncExternalStore } from "react";
import { MOTION_QUERY } from "./constants";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * True when the visitor welcomes motion. Always false on the server and during
 * hydration, so motion-only markup (marquee copies) is added after hydration.
 */
export function useMotionEnabled(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MOTION_QUERY).matches,
    () => false,
  );
}
