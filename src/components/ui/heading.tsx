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
      counter: "text-counter font-semibold tracking-tight tabular-nums",
      display: "text-display font-bold tracking-tight",
      headline: "text-headline font-medium tracking-tight",
      title: "text-title font-bold",
      subtitle: "text-xl font-semibold",
    },
    align: {
      start: "text-start",
      center: "text-center",
    },
  },
  defaultVariants: { size: "headline" },
});

type HeadingElement = "h1" | "h2" | "h3" | "h4" | "p" | "div";

export type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> &
  VariantProps<typeof headingVariants> & { as?: HeadingElement };

export function Heading({ as: Tag = "h2", size, align, className, ...props }: HeadingProps) {
  return (
    <Tag data-slot="heading" className={cn(headingVariants({ size, align }), className)} {...props} />
  );
}
