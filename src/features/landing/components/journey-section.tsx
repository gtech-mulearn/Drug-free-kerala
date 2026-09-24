import { DoveMark } from "@/components/brand/dove-mark";
import { CurvedRibbon } from "@/components/motion/curved-ribbon";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Grain } from "@/components/ui/grain";
import { Heading } from "@/components/ui/heading";
import { Container, Section } from "@/components/ui/layout";
import { Text } from "@/components/ui/text";
import { hero, journey } from "../content";
import { DoveFrame } from "./dove-frame";
import { JourneyExplorer } from "./journey-explorer";

/** Divi's "Timeline & History" band: ribbon, dove-masked portrait, dotted timeline, press strip. */
export function JourneySection() {
  return (
    <Section
      id="journey"
      tabIndex={-1}
      tone="inverse"
      aria-labelledby="journey-title"
      className="overflow-hidden outline-none"
    >
      <Grain />
      <Container>
        <header className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <Eyebrow data-reveal>{journey.eyebrow}</Eyebrow>
          <Heading id="journey-title" size="display" data-split>
            {journey.title}
          </Heading>
        </header>

        <CurvedRibbon lines={hero.ribbon} className="my-6 sm:-my-2 lg:-my-10" />

        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div data-clip className="mx-auto w-full max-w-xs sm:max-w-sm lg:col-span-5 lg:col-start-2 lg:max-w-none">
            <DoveFrame
              image={journey.centerpiece.image}
              alt={journey.centerpiece.alt}
              sizes="(min-width: 1024px) 36vw, 24rem"
            />
          </div>
          <div data-reveal className="rounded-tile bg-brand p-6 text-brand-foreground sm:p-8 lg:col-span-4 lg:col-start-8">
            <DoveMark tone="solid" className="h-10 w-auto" />
            <Text className="mt-5">{journey.description}</Text>
          </div>
        </div>

        <JourneyExplorer items={journey.items} timeline={journey.timeline} />
      </Container>
    </Section>
  );
}
