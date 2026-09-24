import { render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockMatchMedia, motionReduced, motionWelcome } from "@/test/match-media";
import type * as loadEngineModule from "./load-engine";
import { loadMotionEngine } from "./load-engine";
import { MotionRuntime } from "./motion-runtime";

const engine = vi.hoisted(() => ({ startMotion: vi.fn() }));

vi.mock("./load-engine", async (importOriginal) => ({
  ...(await importOriginal<typeof loadEngineModule>()),
  loadMotionEngine: vi.fn(),
}));

const motion = () => document.documentElement.dataset.motion;

beforeEach(() => {
  delete document.documentElement.dataset.motion;
  vi.mocked(loadMotionEngine).mockResolvedValue(engine as never);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("MotionRuntime", () => {
  it("never downloads the engine under reduced motion", () => {
    mockMatchMedia(motionReduced);
    render(<MotionRuntime />);
    expect(motion()).toBe("static");
    expect(loadMotionEngine).not.toHaveBeenCalled();
  });

  it("loads the engine and starts motion when it is welcome", async () => {
    mockMatchMedia(motionWelcome);
    render(<MotionRuntime />);
    await waitFor(() => expect(engine.startMotion).toHaveBeenCalledOnce());
  });

  it("stops motion on unmount", async () => {
    const stop = vi.fn();
    engine.startMotion.mockReturnValueOnce(stop);
    mockMatchMedia(motionWelcome);
    const { unmount } = render(<MotionRuntime />);
    await waitFor(() => expect(engine.startMotion).toHaveBeenCalled());
    unmount();
    expect(stop).toHaveBeenCalled();
  });

  it("falls back to static when the engine can't be loaded", async () => {
    vi.mocked(loadMotionEngine).mockRejectedValueOnce(new Error("offline"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockMatchMedia(motionWelcome);
    render(<MotionRuntime />);
    await waitFor(() => expect(motion()).toBe("static"));
  });
});
