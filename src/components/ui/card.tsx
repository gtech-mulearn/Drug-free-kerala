import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

export const cardVariants = cva("relative overflow-hidden rounded-card", {
  variants: {
    tone: {
      default: "bg-card text-card-foreground shadow-card",
      accent: "bg-accent text-accent-foreground",
      inverse: "theme-inverse bg-card text-card-foreground",
    },
    padding: {
      none: "",
      md: "p-6",
      lg: "p-8 sm:p-12",
    },
    interactive: {
      true: "transition-[box-shadow,translate] duration-300 ease-standard hover:-translate-y-0.5 hover:shadow-raised focus-within:shadow-raised",
      false: "",
    },
  },
  defaultVariants: { tone: "default", padding: "md", interactive: false },
});

export type CardProps = React.ComponentProps<"div"> & VariantProps<typeof cardVariants>;

export function Card({ tone, padding, interactive, className, ...props }: CardProps) {
  return (
    <div data-slot="card" className={cn(cardVariants({ tone, padding, interactive }), className)} {...props} />
  );
}
