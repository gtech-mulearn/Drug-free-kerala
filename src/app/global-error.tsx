"use client";

import { DoveMark } from "@/components/brand/dove-mark";
import { Button } from "@/components/ui/button";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

/** Replaces the root layout when it fails, so it renders its own <html>. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en" className={fontVariables}>
      <body className="theme-inverse grid min-h-svh place-items-center bg-aurora px-gutter text-foreground">
        <main className="flex max-w-md flex-col items-center gap-6 text-center">
          <DoveMark className="h-16 w-auto" />
          <h1 className="text-headline font-medium tracking-display">Something went wrong</h1>
          <p className="text-muted-foreground">Drug Free Kerala couldn&apos;t load. Please try again.</p>
          <Button size="lg" arrow onClick={reset}>
            Try again
          </Button>
        </main>
      </body>
    </html>
  );
}
