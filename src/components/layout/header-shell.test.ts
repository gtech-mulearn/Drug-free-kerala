import { describe, expect, it } from "vitest";
import { nextHeaderState } from "./header-shell";

const shown = { solid: true, hidden: false };
const hidden = { solid: true, hidden: true };

describe("nextHeaderState", () => {
  it("is transparent and visible at the top of the page", () => {
    expect(nextHeaderState(0, 0, { solid: false, hidden: false })).toEqual({ solid: false, hidden: false });
  });

  it("turns solid as soon as the page scrolls", () => {
    expect(nextHeaderState(0, 120, { solid: false, hidden: false })).toEqual(shown);
  });

  it("never hides near the top, even when scrolling down", () => {
    expect(nextHeaderState(200, 400, shown)).toEqual(shown);
  });

  it("hides when scrolling down the page and returns when scrolling up", () => {
    expect(nextHeaderState(900, 1000, shown)).toEqual(hidden);
    expect(nextHeaderState(1000, 950, hidden)).toEqual(shown);
  });

  it("ignores tiny jitters", () => {
    expect(nextHeaderState(1000, 1003, hidden)).toEqual(hidden);
    expect(nextHeaderState(1000, 997, shown)).toEqual(shown);
  });
});
