import type * as React from "react";
import { cn } from "@/lib/utils";

/** Pill label above a heading ("Who we are"). Inherits colour from its surface. */
export function Eyebrow({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="eyebrow"
      className={cn(
        "inline-flex h-8 w-fit items-center rounded-full border border-current/25 px-4 text-sm font-medium",
        className,
      )}
      {...props}
    />
  );
}
