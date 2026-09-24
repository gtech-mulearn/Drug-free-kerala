import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { mockMatchMedia, motionWelcome } from "@/test/match-media";
import { LogoLoop, type LogoItem } from "./logo-loop";

const LOGOS: LogoItem[] = [
  { key: "a", title: "Alpha", node: <span>Alpha</span> },
  { key: "b", title: "Beta", node: <span>Beta</span> },
];

describe("LogoLoop", () => {
  it("is a labelled region", () => {
    render(<LogoLoop logos={LOGOS} ariaLabel="Our partners" />);
    expect(screen.getByRole("region", { name: "Our partners" })).toBeInTheDocument();
  });

  it("shows one still row, without a pause button, when motion is reduced", () => {
    render(<LogoLoop logos={LOGOS} ariaLabel="Our partners" />);
    expect(screen.getAllByRole("list")).toHaveLength(1);
    expect(screen.getAllByRole("listitem")).toHaveLength(LOGOS.length);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("loops copies that assistive tech and the keyboard skip", () => {
    mockMatchMedia(motionWelcome);
    const { container } = render(<LogoLoop logos={LOGOS} ariaLabel="Our partners" />);

    const lists = container.querySelectorAll("ul");
    expect(lists.length).toBeGreaterThanOrEqual(2);
    expect(lists[0]).not.toHaveAttribute("aria-hidden");
    for (const copy of [...lists].slice(1)) {
      expect(copy).toHaveAttribute("aria-hidden", "true");
      expect(copy).toHaveAttribute("inert");
    }
    expect(within(screen.getByRole("region")).getAllByText("Alpha", { selector: "ul:not([aria-hidden]) span" })).toHaveLength(1);
  });

  it("has no pause button; hovering slows it to a stop instead", () => {
    mockMatchMedia(motionWelcome);
    render(<LogoLoop logos={LOGOS} ariaLabel="Our partners" />);
    expect(screen.queryByRole("button")).toBeNull();
  });
});
