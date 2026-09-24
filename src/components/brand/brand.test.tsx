import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DoveMark } from "./dove-mark";
import { Logo, Wordmark } from "./logo";

/** Every url(#id) fill in `root` must point at a gradient defined in `root`. */
function brokenGradientRefs(root: Element): string[] {
  const defined = new Set([...root.querySelectorAll("linearGradient")].map((gradient) => gradient.id));
  return [...root.querySelectorAll("[fill^='url(#']")]
    .map((node) => node.getAttribute("fill")?.slice(5, -1) ?? "")
    .filter((id) => !defined.has(id));
}

describe("Logo", () => {
  it("is one image named Drug Free Kerala", () => {
    render(<Logo />);
    expect(screen.getByRole("img", { name: "Drug Free Kerala" })).toBeInTheDocument();
  });

  it("can be hidden when a parent already names it", () => {
    const { container } = render(<Logo decorative />);
    expect(screen.queryByRole("img")).toBeNull();
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("gives every copy its own gradient ids", () => {
    const { container } = render(
      <>
        <Logo />
        <Logo />
        <Wordmark />
        <DoveMark />
      </>,
    );
    const ids = [...container.querySelectorAll("linearGradient")].map((gradient) => gradient.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(brokenGradientRefs(container)).toEqual([]);
  });
});

describe("DoveMark", () => {
  it("is decorative", () => {
    const { container } = render(<DoveMark />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("uses currentColor in the solid tone and adds the cage on request", () => {
    const { container } = render(<DoveMark tone="solid" cage />);
    expect(container.querySelector("path")).toHaveAttribute("fill", "currentColor");
    expect(container.querySelectorAll("rect")).toHaveLength(7);
    expect(container.querySelector("linearGradient")).toBeNull();
  });
});
