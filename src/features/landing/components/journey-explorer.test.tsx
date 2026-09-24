import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { journey } from "../content";
import { JourneyExplorer } from "./journey-explorer";

const photos = journey.items.filter((item) => item.type === "image");
const kindOf = (itemId: string) => journey.items.find((item) => item.id === itemId)?.type;

function renderExplorer() {
  const user = userEvent.setup();
  render(<JourneyExplorer items={journey.items} timeline={journey.timeline} />);
  return user;
}

describe("JourneyExplorer", () => {
  it("links every milestone to a journey item", () => {
    for (const milestone of journey.timeline) {
      expect(kindOf(milestone.itemId), milestone.itemId).toBeDefined();
    }
  });

  it("offers each milestone's film or story, and a button per press photo", () => {
    renderExplorer();
    for (const milestone of journey.timeline) {
      const name = kindOf(milestone.itemId) === "video" ? `Play video: ${milestone.title}` : `Read the story: ${milestone.title}`;
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    }
    expect(screen.getAllByRole("button", { name: /^View photo:/ })).toHaveLength(photos.length);
  });

  it("opens a press-page milestone as a readable photo", async () => {
    const user = renderExplorer();
    await user.click(screen.getByRole("button", { name: "Read the story: Operation Thunder" }));
    expect(within(screen.getByRole("dialog")).getByRole("img", { name: /Mighty Operation Thunder/ })).toBeInTheDocument();
  });

  it("opens the milestone's video in a lightbox that arrow keys browse and Escape closes", async () => {
    const user = renderExplorer();

    await user.click(screen.getByRole("button", { name: "Play video: GTech Marathon 2023" }));
    expect(within(screen.getByRole("dialog")).getByTitle("GTech Marathon 2023")).toHaveAttribute(
      "src",
      expect.stringContaining("https://www.youtube-nocookie.com/embed/ZV2Q_06d2Tk"),
    );

    await user.keyboard("{ArrowRight}");
    expect(within(screen.getByRole("dialog")).getByRole("img", { name: /every panchayat/ })).toBeInTheDocument();

    await user.keyboard("{ArrowLeft}{ArrowLeft}{ArrowLeft}");
    expect(
      within(screen.getByRole("dialog")).getByText(`${journey.items.length} / ${journey.items.length}`),
    ).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens press photos in the same lightbox", async () => {
    const user = renderExplorer();
    await user.click(screen.getByRole("button", { name: /View photo: Dignitaries launching/ }));
    expect(within(screen.getByRole("dialog")).getByRole("img", { name: /Dignitaries launching/ })).toBeInTheDocument();
  });

  it("does not hijack arrow keys while the lightbox is closed", async () => {
    const user = renderExplorer();
    await user.keyboard("{ArrowRight}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
