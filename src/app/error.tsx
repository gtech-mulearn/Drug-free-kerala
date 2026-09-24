"use client";

import { DoveMark } from "@/components/brand/dove-mark";
import { Button } from "@/components/ui/button";
import { Grain } from "@/components/ui/grain";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="theme-inverse relative isolate grid min-h-svh place-items-center overflow-hidden bg-aurora px-gutter text-foreground">
      <Grain />
      <div className="flex max-w-md flex-col items-center gap-6 text-center">
        <DoveMark className="h-16 w-auto" />
        <Heading as="h1" size="headline">
          Something went wrong
        </Heading>
        <Text tone="muted">An unexpected error stopped this page from loading. Please try again.</Text>
        <Button size="lg" arrow onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  );
}
