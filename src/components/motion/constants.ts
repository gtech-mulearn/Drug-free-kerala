/** The motion vocabulary shared by the runtime, effects and components. */

export const MOTION_QUERY = "(prefers-reduced-motion: no-preference)";
export const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
export const DESKTOP_QUERY = "(min-width: 1024px)";

/**
 * After this long the CSS failsafe reveals everything on its own
 * (src/styles/motion.css: keep the two in sync).
 */
export const FAILSAFE_MS = 2500;

/**
 * True once the failsafe has had its chance to run. The clock starts when the
 * page loader finishes (it records <html data-preloaded-at>), because the
 * failsafe is held while the loader covers the page.
 */
export const isLate = () =>
  performance.now() - (Number(document.documentElement.dataset.preloadedAt) || 0) > FAILSAFE_MS;

/** One easing family: expo.out for entrances (CSS: ease-out-expo). */
export const EASE = { enter: "expo.out", settle: "power2.out" } as const;

/** Seconds. */
export const DURATION = { enter: 1.1, media: 1.3, count: 1.8 } as const;

/** Never more than this between siblings. */
export const STAGGER = 0.08;

/** Elements that start hidden (CSS) and animate in once. */
export const ENTRANCE_SELECTOR = "[data-reveal], [data-split], [data-clip], [data-count]";
