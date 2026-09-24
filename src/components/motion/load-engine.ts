import { MOTION_QUERY } from "./constants";
import type * as EngineModule from "./engine";

type Engine = typeof EngineModule;

let engine: Promise<Engine> | undefined;

/** Resolves once the current frame has been painted. */
const afterFirstPaint = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

/**
 * Resolves once the page loader (src/features/landing/lib/preloader-script.ts)
 * has finished: it holds <html data-preloading> while it covers the page.
 */
export function whenPreloaded(): Promise<void> {
  const root = document.documentElement;
  return new Promise((resolve) => {
    if (!root.hasAttribute("data-preloading")) return resolve();
    const observer = new MutationObserver(() => {
      if (root.hasAttribute("data-preloading")) return;
      observer.disconnect();
      resolve();
    });
    observer.observe(root, { attributes: true, attributeFilter: ["data-preloading"] });
  });
}

/**
 * The motion engine (GSAP, ScrollTrigger, SplitText, Lenis: ~65 KB) is
 * fetched once, after the page has painted and the loader has finished, so it
 * never competes with the page's own resources (and hero effects don't play
 * behind the loader). Reduced-motion visitors never download it.
 */
export function loadMotionEngine(): Promise<Engine> {
  engine ??= afterFirstPaint()
    .then(whenPreloaded)
    .then(() => import("./engine"));
  return engine;
}

/** True when the visitor welcomes motion (read once, at call time). */
export function motionWelcome(): boolean {
  return window.matchMedia(MOTION_QUERY).matches;
}
