import { afterEach, describe, expect, it, vi } from "vitest";
import { FAILSAFE_MS, isLate } from "./constants";
import { whenPreloaded } from "./load-engine";

const root = document.documentElement;

afterEach(() => {
  root.removeAttribute("data-preloading");
  delete root.dataset.preloadedAt;
  vi.restoreAllMocks();
});

describe("whenPreloaded", () => {
  it("resolves at once when there is no loader", async () => {
    await expect(whenPreloaded()).resolves.toBeUndefined();
  });

  it("waits for the loader to finish", async () => {
    root.setAttribute("data-preloading", "");
    let done = false;
    const waiting = whenPreloaded().then(() => {
      done = true;
    });

    await Promise.resolve();
    expect(done).toBe(false);

    root.removeAttribute("data-preloading");
    await waiting;
    expect(done).toBe(true);
  });
});

describe("isLate", () => {
  it("counts from page start when there was no loader", () => {
    vi.spyOn(performance, "now").mockReturnValue(FAILSAFE_MS + 1);
    expect(isLate()).toBe(true);
  });

  it("counts from the moment the loader finished", () => {
    root.dataset.preloadedAt = "4000";
    vi.spyOn(performance, "now").mockReturnValue(4000 + FAILSAFE_MS - 1);
    expect(isLate()).toBe(false);
    vi.spyOn(performance, "now").mockReturnValue(4000 + FAILSAFE_MS + 1);
    expect(isLate()).toBe(true);
  });
});
