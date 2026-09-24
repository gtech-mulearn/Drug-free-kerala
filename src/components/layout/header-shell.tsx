"use client";

import { useSyncExternalStore, type ReactNode } from "react";

const subscribe = (onChange: () => void) => {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
};

/** Fixed header that turns solid once the page scrolls past the top. */
export function HeaderShell({ children }: { children: ReactNode }) {
  const scrolled = useSyncExternalStore(
    subscribe,
    () => window.scrollY > 24,
    () => false,
  );

  return (
    <header
      data-scrolled={scrolled}
      className="theme-inverse fixed inset-x-0 top-0 z-40 bg-transparent text-foreground transition-[background-color,backdrop-filter] duration-300 ease-standard data-[scrolled=true]:bg-background/80 data-[scrolled=true]:backdrop-blur-md"
    >
      {children}
    </header>
  );
}
