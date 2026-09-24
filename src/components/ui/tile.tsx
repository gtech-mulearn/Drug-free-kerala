import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Grid tile from the "system performance" layout: big content at the top,
 * small copy at the bottom. `forest` and `photo` re-theme their contents.
 */
export const tileVariants = cva(
  "relative isolate flex flex-col justify-between gap-10 overflow-hidden rounded-tile p-6 sm:p-7",
  {
    variants: {
      tone: {
        light: "bg-card text-card-foreground",
        brand: "bg-brand text-brand-foreground",
        forest: "theme-inverse bg-background text-foreground",
        photo: "theme-inverse bg-background text-foreground",
      },
    },
    defaultVariants: { tone: "light" },
  },
);

export type TileProps = React.ComponentProps<"div"> & VariantProps<typeof tileVariants>;

export function Tile({ tone, className, ...props }: TileProps) {
  return <div data-slot="tile" className={cn(tileVariants({ tone }), className)} {...props} />;
}
