import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { mockMatchMedia, motionWelcome } from "@/test/match-media";
import { Marquee } from "./marquee";

const ITEMS = ["Clipping one", "Clipping two", "Clipping three"];

function renderMarquee() {
  return render(
    <Marquee
      label="press clippings"
      items={ITEMS}
      getKey={(item) => item}
      renderItem={(item) => <button type="button">{item}</button>}
    />,
  );
}

describe("Marquee", () => {
  it("is a static, scrollable row when motion is reduced", () => {
    const { container } = renderMarquee();
    expect(container.querySelectorAll("ul")).toHaveLength(1);
    expect(screen.getAllByRole("listitem")).toHaveLength(ITEMS.length);
    expect(screen.queryByRole("button", { name: "Pause press clippings" })).toBeNull();
  });

  it("duplicates items for the loop, hiding the copies from assistive tech and the keyboard", () => {
    mockMatchMedia(motionWelcome);
    const { container } = renderMarquee();

    const [original, copy] = container.querySelectorAll("ul");
    expect(original).not.toHaveAttribute("aria-hidden");
    expect(copy).toHaveAttribute("aria-hidden", "true");
    expect(copy).toHaveAttribute("inert");
    expect(screen.getAllByRole("button", { name: "Clipping one" })).toHaveLength(1);
  });

  it("can be paused", async () => {
    mockMatchMedia(motionWelcome);
    const user = userEvent.setup();
    renderMarquee();

    const toggle = screen.getByRole("button", { name: "Pause press clippings" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
  });

  it("names the region", () => {
    renderMarquee();
    expect(screen.getByRole("group", { name: "press clippings" })).toBeInTheDocument();
  });
});
