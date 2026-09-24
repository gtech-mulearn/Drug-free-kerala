import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

export default function NotFound() {
  return (
    <main className="theme-inverse grid min-h-svh place-items-center bg-background px-gutter text-foreground">
      <div className="flex flex-col items-center gap-6 text-center">
        <Heading as="h1" size="counter">
          404
        </Heading>
        <Text size="lead">This page doesn&apos;t exist.</Text>
        <Button asChild size="lg">
          <Link href="/">Back to Drug Free Kerala</Link>
        </Button>
      </div>
    </main>
  );
}
