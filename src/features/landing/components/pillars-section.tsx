import { CircleAlert, HandHeart, Megaphone, type LucideIcon } from "lucide-react";
import Image from "next/image";
import { DoveMark } from "@/components/brand/dove-mark";
import { Heading } from "@/components/ui/heading";
import { Container, Section } from "@/components/ui/layout";
import { Text } from "@/components/ui/text";
import { Tile, type TileProps } from "@/components/ui/tile";
import { pillars } from "../content";

const PILLAR_ICONS: Record<(typeof pillars.items)[number]["icon"], LucideIcon> = {
  alert: CircleAlert,
  awareness: Megaphone,
  action: HandHeart,
};

/** Light → mint → forest, like the "system performance" tile row. */
const PILLAR_TONES: ReadonlyArray<NonNullable<TileProps["tone"]>> = ["light", "brand", "forest"];

/** The lime grid's tile row: a photo tile, then one tile per pillar. */
export function PillarsSection() {
  return (
    <Section aria-labelledby="pillars-title" className="pt-0">
      <Container>
        <div className="mb-10 grid gap-5 lg:mb-14 lg:grid-cols-12 lg:items-end">
          <Heading id="pillars-title" size="display" caps data-split className="lg:col-span-7">
            {pillars.title}
          </Heading>
          <Text tone="muted" data-reveal className="max-w-md lg:col-span-4 lg:col-start-9">
            {pillars.description}
          </Text>
        </div>

        <div className="grid gap-3 lg:grid-cols-4">
          <Tile tone="photo" aria-hidden="true" data-reveal className="min-h-64 max-lg:order-last lg:min-h-104">
            <Image
              src={pillars.image}
              alt=""
              fill
              placeholder="blur"
              sizes="(min-width: 1024px) 25vw, 100vw"
              className="-z-10 object-cover"
            />
            <span className="absolute inset-0 -z-10 bg-linear-to-t from-overlay/60 via-transparent to-transparent" />
            <DoveMark tone="solid" className="mt-auto h-16 w-auto self-start text-brand" />
          </Tile>

          <ol className="grid gap-3 md:grid-cols-3 lg:col-span-3">
            {pillars.items.map((pillar, index) => {
              const Icon = PILLAR_ICONS[pillar.icon];
              return (
                <li key={pillar.title} data-reveal>
                  <Tile tone={PILLAR_TONES[index]} className="h-full min-h-64 lg:min-h-104">
                    <div className="flex items-start justify-between gap-4">
                      <Heading  size="title" data-split className="font-semibold">
                        {pillar.title}
                      </Heading>
                      <Icon aria-hidden="true" className="mt-1 size-6 shrink-0" />
                    </div>
                    <Text size="sm" className="max-w-60">
                      {pillar.description}
                    </Text>
                  </Tile>
                </li>
              );
            })}
          </ol>
        </div>
      </Container>
    </Section>
  );
}
