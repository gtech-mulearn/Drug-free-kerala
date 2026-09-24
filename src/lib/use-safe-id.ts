import { useId } from "react";

/**
 * useId() made safe for SVG references: `url(#id)` breaks on the colons and
 * guillemets React puts in its ids. Works in Server Components too.
 */
export function useSafeId(prefix: string): string {
  return `${prefix}-${useId().replace(/[^\w-]/g, "")}`;
}
