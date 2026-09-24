import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PledgeCounter, POLL_INTERVAL_MS } from "./pledge-counter";

const fetchMock = vi.fn<typeof fetch>();
const total = () => screen.getByTestId("pledge-total");

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.useRealTimers();
});

async function tick() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS);
  });
}

describe("PledgeCounter", () => {
  it("shows the server-rendered total immediately, formatted for India", () => {
    render(<PledgeCounter initialTotal={125886} />);
    expect(total()).toHaveTextContent("1,25,886");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows a dash when the total is unavailable", () => {
    render(<PledgeCounter initialTotal={null} />);
    expect(total()).toHaveTextContent("—");
  });

  it("refreshes from the cached API every 30 seconds", async () => {
    fetchMock.mockResolvedValue(Response.json({ total: 6000 }));
    render(<PledgeCounter initialTotal={5886} />);

    await tick();

    expect(fetchMock).toHaveBeenCalledWith("/api/pledges/total", { cache: "no-store" });
    expect(total()).toHaveTextContent("6,000");
  });

  it("keeps the last total when a refresh fails", async () => {
    fetchMock.mockResolvedValue(new Response("unavailable", { status: 503 }));
    render(<PledgeCounter initialTotal={5886} />);
    await tick();
    expect(total()).toHaveTextContent("5,886");
  });

  it("does not poll while the tab is hidden", async () => {
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    render(<PledgeCounter initialTotal={5886} />);
    await tick();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
