import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("keeps a custom type-scale size alongside a text colour", () => {
    expect(cn("text-display", "text-foreground")).toBe("text-display text-foreground");
    expect(cn("text-headline font-bold", "text-muted-foreground")).toBe(
      "text-headline font-bold text-muted-foreground",
    );
  });

  it("lets later classes override earlier ones within the same scale", () => {
    expect(cn("text-foreground", "text-muted-foreground")).toBe("text-muted-foreground");
    expect(cn("text-display", "text-title")).toBe("text-title");
    expect(cn("rounded-card", "rounded-md")).toBe("rounded-md");
    expect(cn("py-section", "py-4")).toBe("py-4");
    expect(cn("shadow-card", "shadow-raised")).toBe("shadow-raised");
    expect(cn("px-gutter", "px-2")).toBe("px-2");
  });

  it("knows the revamp's scales", () => {
    expect(cn("text-hero", "text-foreground")).toBe("text-hero text-foreground");
    expect(cn("text-poster", "text-highlight")).toBe("text-poster text-highlight");
    expect(cn("rounded-panel", "rounded-tile")).toBe("rounded-tile");
    expect(cn("font-poster", "font-semibold")).toBe("font-poster font-semibold");
    expect(cn("font-poster", "font-sans")).toBe("font-sans");
    expect(cn("tracking-display", "tracking-tight")).toBe("tracking-tight");
    expect(cn("ease-out-expo", "ease-standard")).toBe("ease-standard");
  });

  it("drops falsy values", () => {
    expect(cn("bg-card", false, undefined, null, "text-card-foreground")).toBe(
      "bg-card text-card-foreground",
    );
  });
});
