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

  it("drops falsy values", () => {
    expect(cn("bg-card", false, undefined, null, "text-card-foreground")).toBe(
      "bg-card text-card-foreground",
    );
  });
});
