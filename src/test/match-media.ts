import { vi } from "vitest";

/**
 * jsdom has no matchMedia, and the motion code relies on it. `matches` decides
 * which queries match; the default matches nothing (so no motion runs).
 *
 *   mockMatchMedia((query) => query.includes("no-preference"))  // motion on
 */
export function mockMatchMedia(matches: (query: string) => boolean = () => false) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: matches(query),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(() => false),
    })),
  );
}

export const motionWelcome = (query: string) => query.includes("prefers-reduced-motion: no-preference");
export const motionReduced = (query: string) => query.includes("prefers-reduced-motion: reduce");
