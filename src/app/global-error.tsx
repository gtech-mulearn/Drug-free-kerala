"use client";

import { Button } from "@/components/ui/button";
import { poppins } from "@/lib/fonts";
import "./globals.css";

/** Replaces the root layout when it fails, so it renders its own <html>. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="theme-inverse grid min-h-svh place-items-center bg-background px-gutter text-foreground">
        <main className="flex max-w-md flex-col items-center gap-6 text-center">
          <h1 className="text-headline font-medium">Something went wrong</h1>
          <p className="text-muted-foreground">Drug Free Kerala couldn&apos;t load. Please try again.</p>
          <Button size="lg" onClick={reset}>
            Try again
          </Button>
        </main>
      </body>
    </html>
  );
}
