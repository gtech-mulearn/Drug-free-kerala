import Lenis from "lenis";
import { DURATION, EASE, isLate, MOTION_QUERY, REDUCED_QUERY } from "./constants";
import * as effects from "./effects";
import { gsap, ScrollTrigger } from "./gsap";
import { markRevealed, REVEALED } from "./reveal-state";
import { getActiveLenis, handleAnchorClick, isLenisPrevented, scrollToTarget, setActiveLenis } from "./scroll";

/*
 * The motion engine: everything that touches GSAP or Lenis. Loaded lazily
 * (load-engine.ts) after the first paint. Every function returns its own
 * cleanup.
 */

type Dispose = () => void;

/**
 * Site-wide motion: Lenis smooth scrolling plus the data-* effects, recorded
 * on <html data-motion> for src/styles/motion.css:
 *   "ready"   entrances animate from their CSS start states
 *   "static"  reduced motion, a late start or a failure: everything at rest
 */
export function startMotion(): Dispose {
  const root = document.documentElement;
  const mm = gsap.matchMedia();

  mm.add(REDUCED_QUERY, () => {
    root.dataset.motion = "static";
  });

  mm.add(MOTION_QUERY, () => {
    const cleanup: Dispose[] = [];
    try {
      const lenis = new Lenis({ autoRaf: false, prevent: isLenisPrevented });
      const raf = (time: number) => lenis.raf(time * 1000);
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      setActiveLenis(lenis);
      cleanup.push(() => {
        gsap.ticker.remove(raf);
        setActiveLenis(null);
        lenis.destroy();
      });

      // Radix sets data-scroll-locked on <body> while a dialog or sheet is open.
      const lockObserver = new MutationObserver(() => {
        if (document.body.hasAttribute("data-scroll-locked")) lenis.stop();
        else lenis.start();
      });
      lockObserver.observe(document.body, { attributes: true, attributeFilter: ["data-scroll-locked"] });
      cleanup.push(() => lockObserver.disconnect());

      document.addEventListener("click", handleAnchorClick);
      document.addEventListener("focusin", effects.onFocusIn);
      cleanup.push(() => {
        document.removeEventListener("click", handleAnchorClick);
        document.removeEventListener("focusin", effects.onFocusIn);
      });

      // On a late start (slow device or network) the CSS failsafe has
      // already shown the page: don't hide anything again.
      const late = isLate();
      root.dataset.motion = late ? "static" : "ready";
      if (!late) {
        effects.initReveals();
        effects.initSplits();
        effects.initClips();
      }
      effects.initParallax();
      effects.initHeroFrame();
      effects.initWarm();
      effects.initSpy();
      effects.initRise();

      void document.fonts?.ready.then(() => {
        ScrollTrigger.refresh();
        scrollToHash();
      });
    } catch (error) {
      console.error("[motion] disabled after an error", error);
      root.dataset.motion = "static";
      effects.revealEverything();
    }
    return () => cleanup.forEach((dispose) => dispose());
  });

  return () => mm.revert();
}

/** Deep links (/#journey) land correctly once pinned sections have been measured. */
function scrollToHash() {
  const id = decodeURIComponent(window.location.hash.slice(1));
  // #pledge opens the pledge dialog instead (PledgeDialogProvider).
  if (!id || id === "pledge") return;
  const target = document.getElementById(id);
  if (target) scrollToTarget(target, { immediate: true });
}

/**
 * Counts `text` (the element's own text node, still owned by React) up from
 * 0 the first time the element scrolls into view.
 */
export function countUp(
  element: HTMLElement,
  text: Text,
  target: number,
  format: (value: number) => string,
  latest: () => number | null,
): Dispose {
  if (element.hasAttribute(REVEALED) || isLate()) {
    markRevealed(element);
    return () => {};
  }
  const settle = () => {
    text.nodeValue = format(latest() ?? target);
  };
  const counter = { value: 0 };
  text.nodeValue = format(0);

  const trigger = ScrollTrigger.create({
    trigger: element,
    start: "top 90%",
    once: true,
    onEnter: () => {
      gsap.to(element, { opacity: 1, y: 0, duration: 0.6, ease: EASE.enter });
      gsap.to(counter, {
        value: target,
        duration: DURATION.count,
        ease: EASE.enter,
        onUpdate: () => {
          text.nodeValue = format(Math.round(counter.value));
        },
        onComplete: () => {
          settle();
          markRevealed(element);
        },
      });
    },
  });
  return () => {
    trigger.kill();
    gsap.killTweensOf([element, counter]);
    settle();
  };
}

/**
 * Endless leftward drift for a marquee track holding its list twice; faster
 * while the page scrolls. `held` pauses it (hover, focus, button, off-screen).
 */
export function marqueeLoop(track: HTMLElement, speed: number, held: () => boolean): Dispose {
  let x = 0;
  const tick = (_time: number, deltaMs: number) => {
    if (held()) return;
    // The track holds the list twice; wrapping at half its width is seamless.
    const loop = track.scrollWidth / 2;
    if (loop === 0) return;
    const boost = 1 + Math.min(Math.abs(getActiveLenis()?.velocity ?? 0) / 12, 4);
    x = gsap.utils.wrap(-loop, 0, x - (speed * boost * deltaMs) / 1000);
    gsap.set(track, { x });
  };
  gsap.ticker.add(tick);
  return () => {
    gsap.ticker.remove(tick);
    gsap.set(track, { clearProps: "transform" });
  };
}

/** Drifts a ribbon's textPath along its curve as the ribbon crosses the screen. */
export function ribbonDrift(svg: SVGSVGElement): Dispose {
  const textPath = svg.querySelector("textPath");
  if (!textPath) return () => {};
  const tween = gsap.fromTo(
    textPath,
    { attr: { startOffset: "0%" } },
    {
      attr: { startOffset: "-45%" },
      ease: "none",
      scrollTrigger: { trigger: svg, start: "top bottom", end: "bottom top", scrub: 0.5 },
    },
  );
  return () => {
    tween.scrollTrigger?.kill();
    tween.revert();
  };
}

export type TimelinePin = { dispose: Dispose; revealAll: () => void };

/**
 * Pins the journey timeline while its line draws and each node lights up in
 * turn (desktop only). revealAll() shows everything at rest for keyboard
 * users (data-timeline-revealed, see motion.css) without scrolling the page.
 */
export function timelinePin(root: HTMLElement, steps: number): TimelinePin {
  const timeline = gsap.timeline({
    scrollTrigger: { trigger: root, start: "top 22%", end: "+=720", pin: true, scrub: 0.6 },
  });
  timeline.fromTo(
    root.querySelector("[data-timeline-line]"),
    { scaleX: 0 },
    { scaleX: 1, ease: "none", duration: steps },
  );
  root.querySelectorAll<HTMLElement>("[data-timeline-node]").forEach((node, index) => {
    timeline
      .fromTo(
        node.querySelector("[data-timeline-dot]"),
        { scale: 0 },
        { scale: 1, duration: 0.3, ease: EASE.settle },
        index + 0.15,
      )
      .fromTo(
        node.querySelector("[data-timeline-body]"),
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.6, ease: EASE.settle },
        index + 0.2,
      );
  });

  return {
    dispose: () => {
      timeline.scrollTrigger?.kill();
      timeline.revert();
    },
    revealAll: () => {
      root.setAttribute("data-timeline-revealed", "");
    },
  };
}
