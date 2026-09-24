import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge must know the custom theme scales from src/styles/theme.css.
 * Without this it treats `text-display` (a size) as a colour and silently
 * drops it when merged with `text-foreground`.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["counter", "display", "headline", "title"],
      radius: ["card", "section"],
      shadow: ["card", "raised"],
      spacing: ["gutter", "section", "header"],
      container: ["content"],
      ease: ["standard", "emphasized"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
