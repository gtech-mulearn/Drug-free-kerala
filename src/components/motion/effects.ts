import { DURATION, EASE, ENTRANCE_SELECTOR, STAGGER } from "./constants";
import { gsap, ScrollTrigger, SplitText } from "./gsap";
import { markRevealed, REVEALED } from "./reveal-state";

/*
 * One initializer per motion attribute. Sections are Server Components that
 * only mark elements; MotionRuntime calls these inside a gsap.matchMedia()
 * context, so everything they create is reverted if the visitor switches to
 * reduced motion.
 *
 * Entrances (reveal, split, clip) start from CSS states in
 * src/styles/motion.css and set data-revealed when done (reveal-state.ts), so
 * a later revert never hides them again.
 */

/** Entrance targets that haven't finished yet. */
function pending(selector: string): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>(`${selector}:not([${REVEALED}])`));
}

/** data-reveal: fade and rise 24 px; siblings entering together stagger. */
export function initReveals() {
  const targets = pending("[data-reveal]");
  if (targets.length === 0) return;
  ScrollTrigger.batch(targets, {
    start: "top 88%",
    once: true,
    onEnter: (batch) => {
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: DURATION.enter,
        ease: EASE.enter,
        stagger: STAGGER,
        overwrite: true,
        onComplete: () => batch.forEach(markRevealed),
      });
    },
  });
}

/**
 * data-split: lines rise out of masks. Lines are re-split on resize; after
 * the first play they stay at rest instead of animating again.
 */
export function initSplits() {
  for (const element of pending("[data-split]")) {
    let played = false;
    SplitText.create(element, {
      type: "lines",
      mask: "lines",
      linesClass: "split-line",
      autoSplit: true,
      // Lines are plain wrappers around whole words, so the text still reads
      // naturally; no aria rewriting needed.
      aria: "none",
      onSplit(self) {
        gsap.set(element, { opacity: 1 });
        if (played || element.hasAttribute(REVEALED)) return;
        return gsap.from(self.lines, {
          yPercent: 105,
          duration: DURATION.enter,
          ease: EASE.enter,
          stagger: STAGGER,
          scrollTrigger: { trigger: element, start: "top 88%", once: true },
          onComplete: () => {
            played = true;
            markRevealed(element);
          },
        });
      },
    });
  }
}

/** data-clip: a media frame opens upward while [data-clip-media] settles from 115 %. */
export function initClips() {
  for (const element of pending("[data-clip]")) {
    const media = element.querySelector<HTMLElement>("[data-clip-media]");
    const timeline = gsap.timeline({
      scrollTrigger: { trigger: element, start: "top 85%", once: true },
      onComplete: () => {
        markRevealed(element);
        gsap.set(element, { clearProps: "clipPath" });
      },
    });
    timeline.fromTo(
      element,
      { clipPath: "inset(100% 0% 0% 0%)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration: DURATION.media, ease: EASE.enter },
    );
    if (media) {
      timeline.fromTo(media, { scale: 1.15 }, { scale: 1, duration: DURATION.media, ease: EASE.enter }, 0);
    }
  }
}

/** data-parallax="6": the element drifts ±6 % of its height while its parent crosses the screen. */
export function initParallax() {
  for (const element of gsap.utils.toArray<HTMLElement>("[data-parallax]")) {
    const amount = Number(element.dataset.parallax) || 6;
    gsap.fromTo(
      element,
      { yPercent: -amount },
      {
        yPercent: amount,
        ease: "none",
        scrollTrigger: { trigger: element.parentElement ?? element, start: "top bottom", end: "bottom top", scrub: true },
      },
    );
  }
}

/** data-hero-frame: the hero photo opens to full bleed as the page scrolls (see .hero-frame). */
export function initHeroFrame() {
  const frame = document.querySelector<HTMLElement>("[data-hero-frame]");
  if (!frame) return;
  gsap.fromTo(
    frame,
    { "--frame-open": 0 },
    {
      "--frame-open": 1,
      ease: "none",
      scrollTrigger: {
        start: 0,
        end: () => frame.getBoundingClientRect().top + window.scrollY,
        scrub: true,
        invalidateOnRefresh: true,
      },
    },
  );
}

/** data-warm: the entry's duotone layer fades out while it crosses the middle of the screen. */
export function initWarm() {
  for (const element of gsap.utils.toArray<HTMLElement>("[data-warm]")) {
    const layer = element.querySelector<HTMLElement>("[data-warm-layer]");
    if (!layer) continue;
    gsap.fromTo(
      layer,
      { opacity: 1 },
      {
        opacity: 0,
        duration: 0.8,
        ease: EASE.settle,
        scrollTrigger: { trigger: element, start: "top 70%", end: "bottom 30%", toggleActions: "play reverse play reverse" },
      },
    );
  }
}

/** data-spy="x" gets data-active while data-spy-target="x" crosses the middle of the screen. */
export function initSpy() {
  for (const target of gsap.utils.toArray<HTMLElement>("[data-spy-target]")) {
    const marker = document.querySelector(`[data-spy="${CSS.escape(target.dataset.spyTarget ?? "")}"]`);
    if (!marker) continue;
    ScrollTrigger.create({
      trigger: target,
      start: "top center",
      end: "bottom center",
      onToggle: (self) => marker.toggleAttribute("data-active", self.isActive),
    });
  }
}

/** data-rise: rises out of its parent's mask as the parent reaches the bottom of the page. */
export function initRise() {
  for (const element of gsap.utils.toArray<HTMLElement>("[data-rise]")) {
    gsap.fromTo(
      element,
      { yPercent: 100 },
      {
        yPercent: 0,
        ease: "none",
        scrollTrigger: { trigger: element.parentElement ?? element, start: "top bottom", end: "bottom bottom", scrub: 0.6 },
      },
    );
  }
}

/** Shows an entrance target immediately, in its final state. */
export function revealNow(element: HTMLElement) {
  if (element.hasAttribute(REVEALED)) return;
  markRevealed(element);
  const lines = Array.from(element.querySelectorAll<HTMLElement>(".split-line"));
  gsap.killTweensOf([element, ...lines]);
  if (lines.length > 0) gsap.set(lines, { yPercent: 0 });
  gsap.set(element, { opacity: 1, y: 0, clearProps: "clipPath" });
}

/** Keyboard focus must never land inside content that hasn't animated in yet. */
export function onFocusIn(event: FocusEvent) {
  let node = event.target instanceof Element ? event.target.closest<HTMLElement>(ENTRANCE_SELECTOR) : null;
  while (node) {
    revealNow(node);
    node = node.parentElement?.closest<HTMLElement>(ENTRANCE_SELECTOR) ?? null;
  }
}

/** Puts every entrance at rest (initialization failed half-way). */
export function revealEverything() {
  document.querySelectorAll<HTMLElement>(ENTRANCE_SELECTOR).forEach(revealNow);
}
