import { afterEach, describe, expect, it } from "vitest";
import { onFocusIn, revealEverything } from "./effects";

afterEach(() => {
  document.removeEventListener("focusin", onFocusIn);
  document.body.innerHTML = "";
});

describe("onFocusIn", () => {
  it("reveals every unrevealed entrance around a focused element", () => {
    document.body.innerHTML = `
      <section data-reveal>
        <div data-split><button type="button">Watch</button></div>
      </section>`;
    document.addEventListener("focusin", onFocusIn);

    document.querySelector("button")!.focus();

    for (const element of document.querySelectorAll<HTMLElement>("[data-reveal], [data-split]")) {
      expect(element).toHaveAttribute("data-revealed");
      expect(element.style.opacity).toBe("1");
    }
  });

  it("ignores focus outside entrance targets", () => {
    document.body.innerHTML = `<div data-reveal></div><button type="button">Menu</button>`;
    document.addEventListener("focusin", onFocusIn);
    document.querySelector("button")!.focus();
    expect(document.querySelector("[data-reveal]")).not.toHaveAttribute("data-revealed");
  });
});

describe("revealEverything", () => {
  it("puts every entrance target at rest", () => {
    document.body.innerHTML = `<p data-reveal></p><h2 data-split></h2><div data-clip></div><span data-count></span>`;
    revealEverything();
    expect(document.querySelectorAll("[data-revealed]")).toHaveLength(4);
  });
});
