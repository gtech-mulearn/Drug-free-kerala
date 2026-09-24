import Link from "next/link";
import { DoveMark } from "@/components/brand/dove-mark";
import { Button } from "@/components/ui/button";
import { Grain } from "@/components/ui/grain";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

export default function NotFound() {
  return (
    <main className="theme-inverse relative isolate grid min-h-svh place-items-center overflow-hidden bg-aurora px-gutter text-foreground">
      <Grain />
      <div className="flex flex-col items-center gap-6 text-center">
        <DoveMark className="h-20 w-auto" />
        <Heading as="h1" size="poster">
          404
        </Heading>
        <Text size="lead" tone="muted">
          This page doesn&apos;t exist.
        </Text>
        <Button asChild size="lg" arrow>
          <Link href="/">Back to Drug Free Kerala</Link>
        </Button>
      </div>
    </main>
  );
}
