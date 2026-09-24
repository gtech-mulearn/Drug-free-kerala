import type Lenis from "lenis";

let activeLenis: Lenis | null = null;

/** MotionRuntime registers its Lenis instance here; null while motion is off. */
export function setActiveLenis(lenis: Lenis | null) {
  activeLenis = lenis;
}

export function getActiveLenis(): Lenis | null {
  return activeLenis;
}

/** Lenis leaves wheel and touch inside these nodes to the browser (dialogs, sheets). */
export function isLenisPrevented(node: HTMLElement): boolean {
  return node.matches('[role="dialog"], [data-lenis-prevent]');
}

/**
 * Scrolls to an in-page target, honouring its scroll-margin-top (which clears
 * the fixed header, see globals.css). Native scrolling when Lenis is off.
 */
export function scrollToTarget(target: HTMLElement, { immediate = false }: { immediate?: boolean } = {}) {
  if (!activeLenis) {
    target.scrollIntoView({ block: "start" });
    return;
  }
  const margin = Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
  // An absolute position from the browser's own scroll value, not the element:
  // Lenis resolves elements against its internal scroll, which is stale while
  // ScrollTrigger measures the page (it scrolls to 0 and back).
  const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - margin);
  // force: the menu sheet may still hold its scroll lock for a frame.
  activeLenis.scrollTo(top, { immediate, force: true, duration: 1.2 });
}

/** Smooth-scrolls same-page #links through Lenis; everything else is left to the browser. */
export function handleAnchorClick(event: MouseEvent) {
  if (!activeLenis || event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
  const hash = link?.getAttribute("href");
  if (!hash || hash.length < 2) return;
  const target = document.getElementById(decodeURIComponent(hash.slice(1)));
  if (!target) return;

  event.preventDefault();
  window.history.pushState(null, "", hash);
  scrollToTarget(target);
  target.focus({ preventScroll: true });
}
