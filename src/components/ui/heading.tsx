import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Visual size is independent of document level: pick `as` for the outline
 * (h1 → h2 → h3) and `size` for the look. Colour is inherited from the
 * nearest themed surface.
 */
export const headingVariants = cva("text-balance", {
  variants: {
    size: {
      hero: "text-hero font-normal tracking-display",
      display: "text-display font-medium tracking-display",
      headline: "text-headline font-medium tracking-display",
      title: "text-title font-semibold tracking-tight",
      subtitle: "text-xl font-semibold tracking-tight",
      /** Bebas Neue numerals: the hero card count. */
      counter: "font-poster text-counter tabular-nums",
      /** Bebas Neue numerals at poster size: the pledge band count. */
      poster: "font-poster text-poster tabular-nums",
    },
    /** Bold uppercase section titles ("OUR THREE PILLARS"). */
    caps: {
      true: "font-bold uppercase tracking-tight",
      false: "",
    },
    align: {
      start: "text-start",
      center: "text-center",
    },
  },
  defaultVariants: { size: "headline", caps: false },
});

type HeadingElement = "h1" | "h2" | "h3" | "h4" | "p" | "div";

export type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> &
  VariantProps<typeof headingVariants> & { as?: HeadingElement };

export function Heading({ as: Tag = "h2", size, caps, align, className, ...props }: HeadingProps) {
  return (
    <Tag data-slot="heading" className={cn(headingVariants({ size, caps, align }), className)} {...props} />
  );
}
