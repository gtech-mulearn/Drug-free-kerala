import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { YouTubeEmbed } from "./youtube-embed";

describe("YouTubeEmbed", () => {
  it("loads nothing from YouTube until the visitor presses play", async () => {
    const user = userEvent.setup();
    const { container } = render(<YouTubeEmbed videoId="hR5dDT7omLM" title="Campaign film" />);
    expect(container.querySelector("iframe")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Play video: Campaign film" }));

    const player = screen.getByTitle("Campaign film");
    expect(player).toHaveAttribute("src", expect.stringMatching(/^https:\/\/www\.youtube-nocookie\.com\/embed\/hR5dDT7omLM\?autoplay=1/));
  });
});
