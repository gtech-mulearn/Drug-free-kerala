import Image from "next/image";
import { Suspense, type CSSProperties } from "react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Grain } from "@/components/ui/grain";
import { Heading } from "@/components/ui/heading";
import { Container, Section } from "@/components/ui/layout";
import { Text } from "@/components/ui/text";
import { PledgeDialogTrigger } from "@/features/pledge/components/pledge-dialog-trigger";
import { hero } from "../content";
import { loadInitialPledgeTotal } from "../lib/initial-pledge-total";
import { HeroPledgeCount } from "./live-pledge-total";

/** Stagger index for the CSS intro (src/styles/motion.css). */
const line = (index: number) => ({ "--line": index }) as CSSProperties;

/** Streams in after the shell so a slow API never delays the page. */
export async function HeroPledgeTotal() {
  return <HeroPledgeCount initialTotal={await loadInitialPledgeTotal()} />;
}

/**
 * Brightaid-style hero: headline left, lead and actions right, then the
 * marathon photo in a rounded frame that opens to full bleed on scroll. The
 * photo is visible from the first frame (it is the LCP element); it only
 * settles from a slight zoom.
 */
export function HeroSection() {
  return (
    <Section
      id="top"
      tabIndex={-1}
      tone="inverse"
      spacing="none"
      aria-labelledby="hero-title"
      className="overflow-hidden pt-header pb-gutter outline-none"
    >
      <Grain />

      <Container className="grid gap-8 pt-10 pb-10 sm:pt-16 lg:grid-cols-12 lg:items-end lg:gap-12 lg:pt-20 lg:pb-14">
        <div className="flex flex-col items-start gap-6 lg:col-span-7">
          <Eyebrow className="intro-fade text-highlight" style={line(0)}>
            {hero.campaign}
          </Eyebrow>
          <Heading as="h1" id="hero-title" size="hero">
            {hero.title.map((text, index) => (
              <span key={text} className="block overflow-hidden pb-[0.08em]">
                <span className="intro-line block" style={line(index)}>
                  {text}
                </span>
              </span>
            ))}
          </Heading>
        </div>

        <div className="flex flex-col gap-7 lg:col-span-4 lg:col-start-9 lg:pb-3">
          <Text size="lead" tone="muted" className="intro-fade max-w-md" style={line(1)}>
            {hero.lead.map((part) =>
              typeof part === "string" ? (
                part
              ) : (
                <strong key={part.strong} className="font-medium text-foreground">
                  {part.strong}
                </strong>
              ),
            )}
          </Text>
          <div className="intro-fade flex flex-wrap items-center gap-x-7 gap-y-4" style={line(2)}>
            <PledgeDialogTrigger size="lg" arrow>
              Take the pledge
            </PledgeDialogTrigger>
            <PledgeDialogTrigger dialog="lookup" variant="link">
              Find my certificate
            </PledgeDialogTrigger>
          </div>
        </div>
      </Container>

      <div data-hero-frame className="hero-frame relative h-[min(72svh,46rem)] min-h-104">
        <div className="absolute inset-0 overflow-hidden">
          <div data-parallax="6" className="absolute inset-x-0 inset-y-[-8%]">
            <div className="intro-settle absolute inset-0">
              <Image
                src={hero.image}
                alt={hero.imageAlt}
                fill
                preload
                fetchPriority="high"
                loading="eager"
                placeholder="blur"
                // Film grain and the gradient hide JPEG artefacts; lighter bytes speed up LCP.
                quality={55}
                sizes="100vw"
                className="object-cover object-[center_35%]"
              />
            </div>
          </div>
          <Grain className="z-0" />
          <span aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-overlay/75 via-overlay/10 to-transparent" />
        </div>

        <Container className="relative flex h-full items-end pb-7 sm:pb-10">
          <Suspense fallback={<HeroPledgeCount initialTotal={null} />}>
            <HeroPledgeTotal />
          </Suspense>
        </Container>
      </div>
    </Section>
  );
}
