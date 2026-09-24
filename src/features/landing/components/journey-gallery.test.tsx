import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { journey } from "../content";
import { JourneyGallery } from "./journey-gallery";

describe("JourneyGallery", () => {
  it("renders every item as a labelled button", () => {
    render(<JourneyGallery items={journey.items} />);
    expect(screen.getAllByRole("button")).toHaveLength(journey.items.length);
    expect(screen.getByRole("button", { name: "Play video: GTech Marathon 2023" })).toBeInTheDocument();
  });

  it("opens a lightbox that arrow keys browse and Escape closes", async () => {
    const user = userEvent.setup();
    render(<JourneyGallery items={journey.items} />);

    await user.click(screen.getByRole("button", { name: /View photo: Dignitaries launching/ }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("img", { name: /Dignitaries launching/ })).toBeInTheDocument();

    await user.keyboard("{ArrowRight}");
    expect(within(screen.getByRole("dialog")).getByTitle("GTech Marathon 2023")).toHaveAttribute(
      "src",
      expect.stringContaining("https://www.youtube-nocookie.com/embed/ZV2Q_06d2Tk"),
    );

    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(within(screen.getByRole("dialog")).getByText(`${journey.items.length} / ${journey.items.length}`)).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("does not hijack arrow keys while the lightbox is closed", async () => {
    const user = userEvent.setup();
    render(<JourneyGallery items={journey.items} />);
    await user.keyboard("{ArrowRight}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
