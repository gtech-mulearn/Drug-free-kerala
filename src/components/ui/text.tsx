import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

/** Body copy. Without `tone`, colour is inherited from the themed surface. */
export const textVariants = cva("text-pretty", {
  variants: {
    size: {
      /** A large opening sentence ("A powerful alliance between…"). */
      statement: "text-statement font-medium tracking-display",
      lead: "text-lg leading-relaxed",
      body: "text-base leading-relaxed",
      sm: "text-sm leading-normal",
      xs: "text-xs leading-normal",
    },
    tone: {
      muted: "text-muted-foreground",
      primary: "text-primary",
      destructive: "text-destructive",
    },
    weight: {
      light: "font-light",
      regular: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
    },
    align: {
      start: "text-start",
      center: "text-center",
    },
  },
  defaultVariants: { size: "body" },
});

type TextElement = "p" | "span" | "div" | "li" | "address" | "small";

export type TextProps = React.HTMLAttributes<HTMLElement> &
  VariantProps<typeof textVariants> & { as?: TextElement };

export function Text({ as: Tag = "p", size, tone, weight, align, className, ...props }: TextProps) {
  return (
    <Tag
      data-slot="text"
      className={cn(textVariants({ size, tone, weight, align }), className)}
      {...props}
    />
  );
}
