import Image from "next/image";
import { connection } from "next/server";
import { Suspense } from "react";
import heroBackground from "@/assets/images/hero-background.png";
import { Heading } from "@/components/ui/heading";
import { Container, Section } from "@/components/ui/layout";
import { Text } from "@/components/ui/text";
import { PledgeDialogTrigger } from "@/features/pledge/components/pledge-dialog-trigger";
import { UpstreamError } from "@/server/mulearn/client";
import { getPledgeTotal } from "@/server/pledge-service";
import { hero } from "../content";
import { PledgeCounter } from "./pledge-counter";

/** Streams in after the shell so a slow API never delays the page. */
export async function PledgeTotal() {
  // Request-time data: never fetch it during `next build`.
  await connection();
  const total = await getPledgeTotal().catch((error: unknown) => {
    console.error("[hero] pledge total unavailable", error instanceof UpstreamError ? error.toLog() : error);
    return null;
  });
  return <PledgeCounter initialTotal={total} />;
}

export function HeroSection() {
  return (
    <Section
      id="top"
      tabIndex={-1}
      tone="inverse"
      spacing="none"
      aria-labelledby="hero-title"
      className="flex min-h-svh items-center overflow-hidden pt-header outline-none"
    >
      <Image
        src={heroBackground}
        alt=""
        fill
        priority
        placeholder="blur"
        sizes="100vw"
        className="-z-20 object-cover"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-overlay/45" />

      <Container className="flex flex-col items-center gap-10 py-16">
        <div className="flex w-full flex-col items-center justify-center gap-10 md:flex-row">
          <Suspense fallback={<PledgeCounter initialTotal={null} />}>
            <PledgeTotal />
          </Suspense>
          <Heading as="h1" id="hero-title" size="display" className="text-center md:w-1/2 md:text-start">
            {hero.lines.map((line) => (
              <span key={`${line.text ?? ""}${line.highlight ?? ""}`} className="block">
                {line.text}
                {line.highlight ? <span className="text-primary">{line.highlight}</span> : null}
              </span>
            ))}
          </Heading>
        </div>

        <Text weight="medium" align="center" className="max-w-3xl">
          {hero.lead}
        </Text>

        <div className="flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
          <PledgeDialogTrigger size="xl" className="w-full sm:w-auto">
            Take the Pledge
          </PledgeDialogTrigger>
          <PledgeDialogTrigger dialog="lookup" variant="outline" size="xl" className="w-full sm:w-auto">
            Find my certificate
          </PledgeDialogTrigger>
        </div>
      </Container>
    </Section>
  );
}
