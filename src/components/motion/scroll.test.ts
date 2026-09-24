import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { handleAnchorClick, isLenisPrevented, scrollToTarget, setActiveLenis } from "./scroll";

const lenis = { scrollTo: vi.fn() };

function mount() {
  document.body.innerHTML = `
    <nav><a href="#about">About</a><a href="#missing">Missing</a></nav>
    <section id="about" tabindex="-1"></section>`;
  return {
    link: document.querySelector<HTMLAnchorElement>('a[href="#about"]')!,
    section: document.getElementById("about")!,
  };
}

beforeEach(() => {
  document.addEventListener("click", handleAnchorClick);
  // jsdom doesn't implement scroll-margin; the header offset comes from CSS.
  vi.spyOn(window, "getComputedStyle").mockReturnValue({ scrollMarginTop: "80px" } as CSSStyleDeclaration);
});

afterEach(() => {
  document.removeEventListener("click", handleAnchorClick);
  setActiveLenis(null);
  document.body.innerHTML = "";
  window.history.replaceState(null, "", "/");
  vi.restoreAllMocks();
});

describe("scrollToTarget", () => {
  it("scrolls through Lenis to an absolute position that clears the header", () => {
    const { section } = mount();
    setActiveLenis(lenis as never);
    vi.spyOn(section, "getBoundingClientRect").mockReturnValue({ top: 1000 } as DOMRect);
    vi.spyOn(window, "scrollY", "get").mockReturnValue(500);

    scrollToTarget(section);

    // 1000 (box) + 500 (page scroll) − 80 (scroll-margin-top). A number, not the
    // element: Lenis resolves elements against its own scroll value, which can
    // be stale while ScrollTrigger measures the page.
    expect(lenis.scrollTo).toHaveBeenCalledWith(1420, { immediate: false, force: true, duration: 1.2 });
  });

  it("falls back to native scrolling when Lenis is off", () => {
    const { section } = mount();
    section.scrollIntoView = vi.fn();
    scrollToTarget(section);
    expect(section.scrollIntoView).toHaveBeenCalledWith({ block: "start" });
  });
});

describe("handleAnchorClick", () => {
  it("routes same-page links through Lenis, updates the URL and moves focus", () => {
    const { link, section } = mount();
    setActiveLenis(lenis as never);

    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    link.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(lenis.scrollTo).toHaveBeenCalledWith(expect.any(Number), expect.objectContaining({ force: true }));
    expect(window.location.hash).toBe("#about");
    expect(document.activeElement).toBe(section);
  });

  it("leaves modified clicks and unknown targets to the browser", () => {
    mount();
    setActiveLenis(lenis as never);
    const click = (selector: string, init: MouseEventInit = {}) => {
      const event = new MouseEvent("click", { bubbles: true, cancelable: true, ...init });
      document.querySelector(selector)!.dispatchEvent(event);
      return event.defaultPrevented;
    };

    expect(click('a[href="#about"]', { metaKey: true })).toBe(false);
    expect(click('a[href="#missing"]')).toBe(false);
    expect(lenis.scrollTo).not.toHaveBeenCalled();
  });

  it("does nothing when Lenis is off (reduced motion)", () => {
    const { link } = mount();
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    link.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });
});

describe("isLenisPrevented", () => {
  it("lets dialogs and opted-out nodes scroll natively", () => {
    const dialog = document.createElement("div");
    dialog.setAttribute("role", "dialog");
    const optedOut = document.createElement("div");
    optedOut.setAttribute("data-lenis-prevent", "");

    expect(isLenisPrevented(dialog)).toBe(true);
    expect(isLenisPrevented(optedOut)).toBe(true);
    expect(isLenisPrevented(document.createElement("section"))).toBe(false);
  });
});
