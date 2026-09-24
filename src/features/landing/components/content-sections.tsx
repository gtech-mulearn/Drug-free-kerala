import { CircleAlert, HandHeart, Megaphone, type LucideIcon } from "lucide-react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { IconBadge } from "@/components/ui/icon-badge";
import { Container, Section, SectionHeader } from "@/components/ui/layout";
import { Text } from "@/components/ui/text";
import { YouTubeEmbed } from "@/components/media/youtube-embed";
import { about, initiatives, pillars, whoWeAre } from "../content";

export function AboutSection() {
  return (
    <Section id="about" tabIndex={-1} aria-labelledby="about-title" className="outline-none">
      <Container className="grid items-center gap-10 md:grid-cols-5">
        <div className="reveal flex flex-col gap-6 md:col-span-2">
          <Heading id="about-title" size="headline">
            <span className="block">{about.title.light}</span>
            <strong>{about.title.bold}</strong> {about.title.suffix}
          </Heading>
          <Text tone="muted" weight="medium">
            {about.body}
          </Text>
        </div>
        <div className="reveal md:col-span-3">
          <YouTubeEmbed videoId={about.video.id} title={about.video.title} />
        </div>
      </Container>
    </Section>
  );
}

export function WhoWeAreSection() {
  return (
    <Section aria-labelledby="who-title" className="pt-0">
      <Container>
        <SectionHeader
          titleId="who-title"
          title={
            <>
              Who <strong>we are</strong>
            </>
          }
        />
        <ul className="grid gap-5 md:grid-cols-2">
          {whoWeAre.map((text) => (
            <li key={text} className="reveal">
              <Card padding="lg" interactive className="group flex h-full items-center">
                <Text align="center" className="relative z-10 pb-6">
                  {text}
                </Text>
                <span
                  aria-hidden="true"
                  className="absolute bottom-0 left-0 size-16 origin-bottom-left rounded-tr-full bg-brand transition-transform duration-500 ease-standard group-hover:scale-150"
                />
              </Card>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

const PILLAR_ICONS: Record<(typeof pillars.items)[number]["icon"], LucideIcon> = {
  alert: CircleAlert,
  awareness: Megaphone,
  action: HandHeart,
};

export function PillarsSection() {
  return (
    <Section tone="brand" aria-labelledby="pillars-title">
      <Container size="narrow">
        <SectionHeader
          titleId="pillars-title"
          title={
            <>
              Our <strong>Three Pillars</strong>
            </>
          }
          description={pillars.description}
        />
        <ol className="flex flex-col gap-6">
          {pillars.items.map((pillar) => {
            const Icon = PILLAR_ICONS[pillar.icon];
            return (
              <li key={pillar.title} className="reveal">
                <Card tone="accent" interactive className="flex items-center gap-5 sm:gap-8 sm:p-8">
                  <IconBadge tone="card" size="lg">
                    <Icon />
                  </IconBadge>
                  <div className="flex flex-1 flex-col gap-1 md:flex-row md:items-center md:justify-between md:gap-8">
                    <Heading as="h3" size="title">
                      {pillar.title}
                    </Heading>
                    <Text size="lead" weight="medium" className="md:max-w-md">
                      {pillar.description}
                    </Text>
                  </div>
                </Card>
              </li>
            );
          })}
        </ol>
      </Container>
    </Section>
  );
}

export function InitiativesSection() {
  return (
    <Section id="initiatives" tabIndex={-1} tone="surface" aria-labelledby="initiatives-title" className="outline-none">
      <Container>
        <SectionHeader
          titleId="initiatives-title"
          title={
            <>
              Key <strong>Initiatives</strong>
            </>
          }
          description={initiatives.description}
        />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {initiatives.items.map((item, index) => {
            const titleId = `initiative-${index}`;
            return (
              <li key={item.title} className="reveal">
                {/* Focusable so keyboard and touch users can reveal the description too. */}
                <article
                  tabIndex={0}
                  aria-labelledby={titleId}
                  className="group theme-inverse relative flex aspect-4/5 flex-col justify-end overflow-hidden rounded-card bg-background text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring sm:aspect-3/4 lg:aspect-3/5"
                >
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    placeholder="blur"
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-standard group-hover:scale-110 group-focus-visible:scale-110"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-linear-to-t from-overlay/90 via-overlay/50 to-transparent"
                  />
                  <div className="relative flex flex-col gap-3 p-5">
                    <Heading as="h3" id={titleId} size="subtitle">
                      {item.title}
                    </Heading>
                    <span
                      aria-hidden="true"
                      className="h-0.5 w-0 rounded-full bg-brand transition-[width] duration-500 ease-standard group-hover:w-14 group-focus-visible:w-14 pointer-coarse:w-14"
                    />
                    <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-standard group-hover:grid-rows-[1fr] group-focus-visible:grid-rows-[1fr] pointer-coarse:grid-rows-[1fr]">
                      <Text size="sm" weight="light" className="overflow-hidden">
                        {item.description}
                      </Text>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
