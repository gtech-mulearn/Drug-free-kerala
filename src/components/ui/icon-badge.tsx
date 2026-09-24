import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

/** A decorative circular icon container (hidden from assistive technology). */
export const iconBadgeVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-full [&_svg]:shrink-0",
  {
    variants: {
      tone: {
        card: "bg-card text-card-foreground shadow-card",
        subtle: "bg-foreground/10 text-foreground",
        accent: "bg-accent text-primary",
        destructive: "bg-destructive/10 text-destructive",
      },
      size: {
        sm: "size-10 [&_svg]:size-5",
        md: "size-12 [&_svg]:size-6",
        lg: "size-16 [&_svg]:size-8",
      },
    },
    defaultVariants: { tone: "card", size: "md" },
  },
);

export type IconBadgeProps = React.ComponentProps<"span"> & VariantProps<typeof iconBadgeVariants>;

export function IconBadge({ tone, size, className, ...props }: IconBadgeProps) {
  return (
    <span
      aria-hidden="true"
      data-slot="icon-badge"
      className={cn(iconBadgeVariants({ tone, size }), className)}
      {...props}
    />
  );
}
