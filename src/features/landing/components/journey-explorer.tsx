"use client";

import Image from "next/image";
import { useState } from "react";
import { Marquee } from "@/components/motion/marquee";
import { Heading } from "@/components/ui/heading";
import type { JourneyItem, JourneyMilestone } from "../content";
import { JourneyLightbox } from "./journey-lightbox";
import { JourneyTimeline, type TimelineEntry } from "./journey-timeline";

type Photo = Extract<JourneyItem, { type: "image" }>;

type JourneyExplorerProps = {
  items: readonly JourneyItem[];
  timeline: readonly JourneyMilestone[];
};

/** The timeline films and the press strip, sharing one lightbox over every journey item. */
export function JourneyExplorer({ items, timeline }: JourneyExplorerProps) {
  const [index, setIndex] = useState<number | null>(null);
  const open = (id: string) => setIndex(items.findIndex((item) => item.id === id));
  const photos = items.filter((item): item is Photo => item.type === "image");
  // Milestones whose item is missing are dropped rather than shown as dead buttons.
  const entries: TimelineEntry[] = timeline.flatMap((milestone) => {
    const item = items.find((candidate) => candidate.id === milestone.itemId);
    return item ? [{ ...milestone, kind: item.type }] : [];
  });

  return (
    <>
      <JourneyTimeline milestones={entries} onOpen={(milestone) => open(milestone.itemId)} />

      <div className="mt-24 flex flex-col gap-6 lg:mt-32">
        <Heading as="h3" size="title">
          In the press
        </Heading>
        <Marquee
          label="press clippings"
          // Full bleed: the strip runs edge to edge (the section clips overflow).
          viewportClassName="relative left-1/2 w-screen -translate-x-1/2 px-gutter"
          items={photos}
          getKey={(photo) => photo.id}
          renderItem={(photo) => (
            <button
              type="button"
              onClick={() => open(photo.id)}
              aria-haspopup="dialog"
              className="group relative block h-64 w-48 overflow-hidden rounded-tile bg-muted outline-none focus-visible:ring-[3px] focus-visible:ring-ring sm:h-72 sm:w-56"
            >
              <Image
                src={photo.image}
                alt=""
                fill
                sizes="224px"
                className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
              />
              <span className="sr-only">View photo: {photo.alt}</span>
            </button>
          )}
        />
      </div>

      <JourneyLightbox items={items} index={index} onIndexChange={setIndex} />
    </>
  );
}
