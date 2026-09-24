import { ArrowRight } from "lucide-react";
import { YouTubeEmbed } from "@/components/media/youtube-embed";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { Container, Section } from "@/components/ui/layout";
import { Tag } from "@/components/ui/tag";
import { Text } from "@/components/ui/text";
import { PledgeDialogTrigger } from "@/features/pledge/components/pledge-dialog-trigger";
import { about, whoWeAre } from "../content";

/** Brightaid's "Who we are" split: a wash panel with the film, prose beside it. */
export function AboutSection() {
  return (
    <Section id="about" tabIndex={-1} aria-labelledby="about-title" className="outline-none">
      <Container className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
        <div className="rounded-panel bg-surface-wash p-5 text-surface-wash-foreground sm:p-8 lg:col-span-7">
          <Eyebrow data-reveal>{about.eyebrow}</Eyebrow>
          <Heading id="about-title" size="display" data-split className="mt-6">
            {about.title.before} <span className="text-highlight">{about.title.highlight}</span> {about.title.after}
          </Heading>
          <div data-clip className="mt-8 overflow-hidden rounded-tile">
            <div data-clip-media>
              <YouTubeEmbed videoId={about.video.id} title={about.video.title} className="rounded-none" />
            </div>
          </div>
          <ul aria-label="What we do" className="mt-6 flex flex-wrap gap-2">
            {about.tags.map((tag) => (
              <li key={tag} data-reveal>
                <Tag>{tag}</Tag>
              </li>
            ))}
          </ul>
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
