import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

/** Small pill chip for keywords ("Peer mentoring", "Skill-building"). */
export const tagVariants = cva("inline-flex h-7 w-fit items-center rounded-full px-3 text-xs font-medium", {
  variants: {
    tone: {
      outline: "border border-current/25",
      solid: "bg-foreground text-background",
      brand: "bg-brand text-brand-foreground",
    },
  },
  defaultVariants: { tone: "outline" },
});

export type TagProps = React.ComponentProps<"span"> & VariantProps<typeof tagVariants>;

export function Tag({ tone, className, ...props }: TagProps) {
  return <span data-slot="tag" className={cn(tagVariants({ tone }), className)} {...props} />;
}
