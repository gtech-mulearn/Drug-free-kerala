/**
 * Entrances mark themselves done with data-revealed; src/styles/motion.css
 * never applies a start state to a revealed element. No GSAP here, so any
 * component can import it without pulling in the motion engine.
 */
export const REVEALED = "data-revealed";

export function markRevealed(element: Element) {
  element.setAttribute(REVEALED, "");
}
