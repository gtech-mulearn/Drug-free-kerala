import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HeroPledgeCount, PosterCounter } from "./live-pledge-total";
import { POLL_INTERVAL_MS, resetPledgeTotalStore } from "./pledge-total-store";

const fetchMock = vi.fn<typeof fetch>();
const heroTotal = () => screen.getByTestId("pledge-total");

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  resetPledgeTotalStore();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

async function tick() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS);
  });
}

describe("live pledge total", () => {
  it("shows the server-rendered total immediately, formatted for India", () => {
    render(<HeroPledgeCount initialTotal={125886} />);
    expect(heroTotal()).toHaveTextContent("1,25,886");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows a dash when the total is unavailable", () => {
    render(<HeroPledgeCount initialTotal={null} />);
    expect(heroTotal()).toHaveTextContent("—");
  });

  it("refreshes from the cached API every 30 seconds", async () => {
    fetchMock.mockResolvedValue(Response.json({ total: 6000 }));
    render(<HeroPledgeCount initialTotal={5886} />);

    await tick();

    expect(fetchMock).toHaveBeenCalledWith("/api/pledges/total", { cache: "no-store" });
    expect(heroTotal()).toHaveTextContent("6,000");
  });

  it("keeps the last total when a refresh fails", async () => {
    fetchMock.mockResolvedValue(new Response("unavailable", { status: 503 }));
    render(<HeroPledgeCount initialTotal={5886} />);
    await tick();
    expect(heroTotal()).toHaveTextContent("5,886");
  });

  it("does not poll while the tab is hidden", async () => {
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    render(<HeroPledgeCount initialTotal={5886} />);
    await tick();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("runs one poll for every display on the page", async () => {
    fetchMock.mockResolvedValue(Response.json({ total: 6000 }));
    render(
      <>
        <HeroPledgeCount initialTotal={5886} />
        <PosterCounter initialTotal={5886} />
      </>,
    );

    await tick();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(heroTotal()).toHaveTextContent("6,000");
    expect(screen.getByTestId("pledge-total-poster")).toHaveTextContent("6,000 pledges");
  });

  it("stops polling once no display is mounted", async () => {
    fetchMock.mockResolvedValue(Response.json({ total: 6000 }));
    const { unmount } = render(<HeroPledgeCount initialTotal={5886} />);
    unmount();
    await tick();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
