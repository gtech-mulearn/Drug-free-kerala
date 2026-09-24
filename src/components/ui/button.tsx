import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRight } from "lucide-react";
import { Slot } from "radix-ui";
import type * as React from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  [
    "group/button inline-flex shrink-0 select-none items-center justify-center gap-2.5 whitespace-nowrap rounded-full font-medium",
    "transition-[color,background-color,border-color,box-shadow,scale] duration-300 ease-standard active:scale-[0.98]",
    "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60",
    "disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        /** The call to action: a forest pill on light surfaces, mint on .theme-inverse. */
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        outline: "border border-primary/60 bg-transparent text-foreground hover:border-primary hover:bg-primary/10",
        ghost: "text-foreground hover:bg-foreground/10",
        link: "rounded-md text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-13 px-6 text-base",
        xl: "h-15 px-8 text-base",
        icon: "size-11",
        "icon-sm": "size-9",
      },
      /** Brightaid-style round arrow badge at the end of the pill. */
      arrow: { true: "", false: "" },
    },
    compoundVariants: [
      { variant: "link", className: "h-auto px-0" },
      { variant: ["primary", "secondary", "outline", "ghost"], arrow: true, className: "pr-1.5" },
    ],
    defaultVariants: { variant: "primary", size: "md", arrow: false },
  },
);

type Variant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;
type Size = NonNullable<VariantProps<typeof buttonVariants>["size"]>;

/** The badge inverts the pill: light on a solid pill, solid on an outline one. */
const BADGE_TONE: Record<Exclude<Variant, "link">, string> = {
  primary: "bg-primary-foreground text-primary",
  secondary: "bg-primary text-primary-foreground",
  outline: "bg-primary text-primary-foreground",
  ghost: "bg-primary text-primary-foreground",
};

const BADGE_SIZE: Record<Size, string> = {
  sm: "size-6",
  md: "size-8",
  lg: "size-10",
  xl: "size-12",
  icon: "size-8",
  "icon-sm": "size-6",
};

/** Two arrows: on hover the first slides out and the second slides in. */
function ArrowBadge({ variant, size }: { variant: Variant; size: Size }) {
  if (variant === "link") {
    return (
      <ArrowRight
        aria-hidden="true"
        className="transition-transform duration-300 ease-out-expo group-hover/button:translate-x-1"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={cn("relative grid shrink-0 place-items-center overflow-hidden rounded-full", BADGE_TONE[variant], BADGE_SIZE[size])}
    >
      <ArrowRight className="transition-transform duration-500 ease-out-expo group-hover/button:translate-x-[180%]" />
      <ArrowRight className="absolute -translate-x-[180%] transition-transform duration-500 ease-out-expo group-hover/button:translate-x-0" />
    </span>
  );
}

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    /** Render the child element (e.g. a link) with button styling. */
    asChild?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  arrow = false,
  asChild = false,
  type,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  const shared = {
    "data-slot": "button",
    // Default to type="button" so buttons never submit a form by accident.
    type: asChild ? undefined : (type ?? "button"),
    className: cn(buttonVariants({ variant, size, arrow }), className),
    ...props,
  };

  if (!arrow) return <Comp {...shared}>{children}</Comp>;

  // Slottable must be a direct child of Slot (no fragment) so that, with
  // asChild, the badge is placed inside the child element.
  return (
    <Comp {...shared}>
      <Slot.Slottable>{children}</Slot.Slottable>
      <ArrowBadge variant={variant ?? "primary"} size={size ?? "md"} />
    </Comp>
  );
}
