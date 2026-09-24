import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach } from "vitest";
import { mockMatchMedia } from "./match-media";

// GSAP's ScrollTrigger calls matchMedia when it registers (at import time),
// so the stub must exist before test files load, and again for every test
// (unstubGlobals restores globals after each one).
mockMatchMedia();

beforeEach(() => {
  mockMatchMedia();
});

afterEach(() => {
  cleanup();
});
