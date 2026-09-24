import { cn } from "@/lib/utils";

/**
 * Film-grain texture (an inline SVG noise tile, see `bg-grain` in
 * globals.css). Sits behind content inside an isolated parent (Section and
 * Tile are); pass `className="z-0"` to lay it over a photo instead.
 */
export function Grain({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      data-slot="grain"
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 bg-grain opacity-(--grain-opacity) mix-blend-overlay",
        className,
      )}
    />
  );
}
