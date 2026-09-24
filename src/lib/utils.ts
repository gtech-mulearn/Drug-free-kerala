import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge must know the custom theme scales from src/styles/theme.css.
 * Without this it treats `text-display` (a size) as a colour and silently
 * drops it when merged with `text-foreground`.
 *
 * Component installers (`shadcn init`) overwrite this file with a plain
 * `cn`; src/lib/utils.test.ts fails if that happens.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["hero", "display", "headline", "title", "statement", "counter", "poster"],
      font: ["poster"],
      tracking: ["display"],
      radius: ["card", "panel", "tile"],
      shadow: ["card", "raised"],
      spacing: ["gutter", "section", "header"],
      container: ["content"],
      ease: ["standard", "emphasized", "out-expo"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
