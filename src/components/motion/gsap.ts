import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

/*
 * Import GSAP from here so the plugins are registered exactly once. Only the
 * lazily loaded engine (engine.ts, effects.ts) may import this module;
 * components go through loadMotionEngine() so GSAP stays out of the first load.
 */
gsap.registerPlugin(ScrollTrigger, SplitText);

export { gsap, ScrollTrigger, SplitText };
