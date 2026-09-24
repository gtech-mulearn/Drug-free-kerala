import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";
import { Heading } from "./heading";
import { Text } from "./text";

/* ── Container ─────────────────────────────────────────────────────────── */

export const containerVariants = cva("mx-auto w-full px-gutter", {
  variants: {
    size: {
      content: "max-w-content",
      narrow: "max-w-4xl",
      full: "max-w-none",
    },
  },
  defaultVariants: { size: "content" },
});

export type ContainerProps = React.ComponentProps<"div"> & VariantProps<typeof containerVariants>;

export function Container({ size, className, ...props }: ContainerProps) {
  return <div data-slot="container" className={cn(containerVariants({ size }), className)} {...props} />;
}

/* ── Section ───────────────────────────────────────────────────────────── */

/**
 * A full-width page band. `tone` picks the surface; `inverse` applies the dark
 * theme to everything inside it (buttons, text, borders re-theme automatically).
 */
export const sectionVariants = cva("relative isolate w-full", {
  variants: {
    tone: {
      default: "bg-background text-foreground",
      surface: "bg-card text-card-foreground",
      wash: "bg-surface-wash text-surface-wash-foreground",
      inverse: "theme-inverse bg-background text-foreground",
    },
    spacing: {
      default: "py-section",
      compact: "py-10",
      none: "",
    },
  },
  defaultVariants: { tone: "default", spacing: "default" },
});

export type SectionProps = React.ComponentProps<"section"> & VariantProps<typeof sectionVariants>;

export function Section({ tone, spacing, className, ...props }: SectionProps) {
  return (
    <section data-slot="section" className={cn(sectionVariants({ tone, spacing }), className)} {...props} />
  );
}

/* ── SectionHeader ─────────────────────────────────────────────────────── */

export type SectionHeaderProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "start" | "center";
  /** id for the heading, so the section can use aria-labelledby. */
  titleId?: string;
  className?: string;
};

export function SectionHeader({ title, description, align = "center", titleId, className }: SectionHeaderProps) {
  return (
    <header
      data-reveal
      className={cn(
        "mb-10 flex flex-col gap-4 md:mb-12",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      <Heading id={titleId} size="headline" align={align}>
        {title}
      </Heading>
      {description ? (
        <Text weight="medium" tone="muted" className="max-w-3xl">
          {description}
        </Text>
      ) : null}
    </header>
  );
}
