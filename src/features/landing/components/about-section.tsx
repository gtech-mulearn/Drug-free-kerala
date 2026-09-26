import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { Container, Section } from "@/components/ui/layout";
import { Text } from "@/components/ui/text";
import { PledgeDialogTrigger } from "@/features/pledge/components/pledge-dialog-trigger";
import { about, whoWeAre } from "../content";
import { BreakingFreeMark } from "./breaking-free-mark";

/**
 * Brightaid's "Who we are" split: a wash panel with the title, a numbered
 * index of what we do and the logo's dove rising out of its cage; prose beside it.
 */
export function AboutSection() {
  return (
    <Section id="about" tabIndex={-1} aria-labelledby="about-title" className="outline-none">
      <Container className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
        <div className="flex flex-col overflow-hidden rounded-panel bg-surface-wash p-5 pb-0 text-surface-wash-foreground sm:p-8 sm:pb-0 lg:col-span-7">
          <Eyebrow data-reveal>{about.eyebrow}</Eyebrow>
          <Heading id="about-title" size="display" data-split className="mt-6">
            {about.title.before} <span className="text-highlight">{about.title.highlight}</span> {about.title.after}
          </Heading>
          <div className="mt-10 grid grid-cols-[1fr_30%] items-end gap-5 sm:grid-cols-[1fr_36%] sm:gap-10">
            <ol aria-label={about.focus.label} className="pb-5 sm:pb-8">
              {about.focus.items.map((item, index) => (
                <li
                  key={item}
                  data-reveal
                  className="flex items-baseline gap-4 border-t border-current/15 py-3 last:border-b sm:gap-5"
                >
                  <span aria-hidden="true" className="w-6 shrink-0 font-poster text-2xl text-highlight tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-lg font-medium tracking-tight sm:text-xl">{item}</span>
                </li>
              ))}
            </ol>
            <BreakingFreeMark className="w-full" />
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-5">
          <Text size="statement" data-split>
            {about.body}
          </Text>
          {whoWeAre.map((paragraph) => (
            <Text key={paragraph} tone="muted" data-reveal>
              {paragraph}
            </Text>
          ))}
          <div data-reveal className="flex flex-wrap items-center gap-x-7 gap-y-4 pt-2">
            <PledgeDialogTrigger size="lg" arrow>
              Take the pledge
            </PledgeDialogTrigger>
            <Button asChild variant="link" className="text-foreground">
              <a href="#initiatives">
                Our initiatives <ArrowRight aria-hidden="true" />
              </a>
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
