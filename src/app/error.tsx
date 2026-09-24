"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="theme-inverse grid min-h-svh place-items-center bg-background px-gutter text-foreground">
      <div className="flex max-w-md flex-col items-center gap-6 text-center">
        <Heading as="h1" size="headline">
          Something went wrong
        </Heading>
        <Text tone="muted">An unexpected error stopped this page from loading. Please try again.</Text>
        <Button size="lg" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  );
}
