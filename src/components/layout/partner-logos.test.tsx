import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PartnerLogos } from "./partner-logos";

describe("PartnerLogos", () => {
  it("names each partner", () => {
    render(<PartnerLogos />);
    expect(screen.getByRole("img", { name: "GTech" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "μLearn" })).toBeInTheDocument();
  });

  it("paints the artwork with currentColor through a mask, so it works on any surface", () => {
    const { container } = render(<PartnerLogos />);
    expect(container.querySelector("img")).toBeNull();
    const gtech = screen.getByRole("img", { name: "GTech" });
    expect(gtech.style.maskImage).toContain("logo-gtech");
    expect(gtech).toHaveClass("bg-current");
  });
});
