import { waitFor } from "@testing-library/react";
import Lenis from "lenis";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockMatchMedia, motionReduced, motionWelcome } from "@/test/match-media";
import * as effects from "./effects";
import { startMotion } from "./engine";
import { getActiveLenis } from "./scroll";

const lenisInstance = vi.hoisted(() => ({
  on: vi.fn(),
  raf: vi.fn(),
  destroy: vi.fn(),
  stop: vi.fn(),
  start: vi.fn(),
  scrollTo: vi.fn(),
}));

vi.mock("lenis", () => ({
  default: vi.fn(function Lenis() {
    return lenisInstance;
  }),
}));

vi.mock("./effects", () => ({
  initReveals: vi.fn(),
  initSplits: vi.fn(),
  initClips: vi.fn(),
  initParallax: vi.fn(),
  initHeroFrame: vi.fn(),
  initWarm: vi.fn(),
  initSpy: vi.fn(),
  initRise: vi.fn(),
  onFocusIn: vi.fn(),
  revealEverything: vi.fn(),
}));

const motion = () => document.documentElement.dataset.motion;
const startedAt = (ms: number) => vi.spyOn(performance, "now").mockReturnValue(ms);

let stop: (() => void) | undefined;

beforeEach(() => {
  delete document.documentElement.dataset.motion;
});

afterEach(() => {
  stop?.();
  stop = undefined;
  vi.restoreAllMocks();
  document.body.removeAttribute("data-scroll-locked");
});

describe("startMotion", () => {
  it("stays static and never starts Lenis under reduced motion", () => {
    mockMatchMedia(motionReduced);
    stop = startMotion();
    expect(motion()).toBe("static");
    expect(Lenis).not.toHaveBeenCalled();
    expect(effects.initReveals).not.toHaveBeenCalled();
  });

  it("starts smooth scrolling and every effect when motion is welcome", () => {
    mockMatchMedia(motionWelcome);
    startedAt(600);
    stop = startMotion();

    expect(motion()).toBe("ready");
    expect(Lenis).toHaveBeenCalledOnce();
    expect(getActiveLenis()).toBe(lenisInstance);
    for (const init of [effects.initReveals, effects.initSplits, effects.initClips, effects.initParallax, effects.initRise]) {
      expect(init).toHaveBeenCalledOnce();
    }
  });

  it("skips entrances when it starts after the CSS failsafe has shown the page", () => {
    mockMatchMedia(motionWelcome);
    startedAt(4000);
    stop = startMotion();

    expect(motion()).toBe("static");
    expect(effects.initReveals).not.toHaveBeenCalled();
    expect(effects.initSplits).not.toHaveBeenCalled();
    expect(effects.initParallax).toHaveBeenCalledOnce();
  });

  it("falls back to static, with everything visible, if an effect throws", () => {
    mockMatchMedia(motionWelcome);
    startedAt(600);
    vi.mocked(effects.initSplits).mockImplementationOnce(() => {
      throw new Error("split failed");
    });
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    stop = startMotion();

    expect(motion()).toBe("static");
    expect(effects.revealEverything).toHaveBeenCalledOnce();
    expect(error).toHaveBeenCalled();
  });

  it("pauses smooth scrolling while a dialog locks the page", async () => {
    mockMatchMedia(motionWelcome);
    startedAt(600);
    stop = startMotion();

    document.body.setAttribute("data-scroll-locked", "1");
    await waitFor(() => expect(lenisInstance.stop).toHaveBeenCalled());

    document.body.removeAttribute("data-scroll-locked");
    await waitFor(() => expect(lenisInstance.start).toHaveBeenCalled());
  });

  it("tears down when stopped", () => {
    mockMatchMedia(motionWelcome);
    startedAt(600);
    startMotion()();
    expect(lenisInstance.destroy).toHaveBeenCalled();
    expect(getActiveLenis()).toBeNull();
  });
});
