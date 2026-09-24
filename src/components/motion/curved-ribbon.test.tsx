import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CurvedRibbon } from "./curved-ribbon";

const LINES = ["United against addiction", "For us, for good"];

describe("CurvedRibbon", () => {
  it("reads its slogans once to assistive tech and hides the decorative loop", () => {
    const { container } = render(<CurvedRibbon lines={LINES} />);
    expect(screen.getByText("United against addiction. For us, for good.")).toHaveClass("sr-only");
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("points its text at its own path", () => {
    const { container } = render(
      <>
        <CurvedRibbon lines={LINES} />
        <CurvedRibbon lines={LINES} />
      </>,
    );
    const paths = [...container.querySelectorAll("path[id]")].map((path) => path.id);
    const refs = [...container.querySelectorAll("textPath")].map((node) => node.getAttribute("href")?.slice(1));
    expect(new Set(paths).size).toBe(2);
    expect(refs).toEqual(paths);
  });
});
