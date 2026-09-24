import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("defaults to type=button", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("type", "button");
  });

  it("adds a decorative arrow badge without changing the accessible name", () => {
    render(<Button arrow>Take the pledge</Button>);
    const button = screen.getByRole("button", { name: "Take the pledge" });
    const badge = button.querySelector('[aria-hidden="true"]');
    expect(badge).not.toBeNull();
    expect(badge?.querySelectorAll("svg")).toHaveLength(2);
  });

  it("keeps a single link element when combined with asChild", () => {
    render(
      <Button asChild arrow>
        <a href="#initiatives">Our initiatives</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Our initiatives" });
    expect(link).toHaveAttribute("href", "#initiatives");
    expect(link.querySelector("svg")).not.toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("renders a plain inline arrow for link buttons", () => {
    render(
      <Button variant="link" arrow>
        Find my certificate
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Find my certificate" });
    expect(button.querySelectorAll("svg")).toHaveLength(1);
  });
});
