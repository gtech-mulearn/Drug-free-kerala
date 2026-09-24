"use client";

import { BookOpen, Play, type LucideIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, type CSSProperties } from "react";
import { DESKTOP_QUERY } from "@/components/motion/constants";
import type { TimelinePin } from "@/components/motion/engine";
import { loadMotionEngine, motionWelcome } from "@/components/motion/load-engine";
import { Heading } from "@/components/ui/heading";
import type { JourneyMilestone } from "../content";

/** A milestone plus what its card opens: a film, or a photo such as a press page. */
export type TimelineEntry = JourneyMilestone & { kind: "video" | "image" };

const ACTIONS: Record<TimelineEntry["kind"], { label: string; srPrefix: string; Icon: LucideIcon }> = {
  video: { label: "Watch highlights", srPrefix: "Play video", Icon: Play },
  image: { label: "Read the story", srPrefix: "Read the story", Icon: BookOpen },
};

type JourneyTimelineProps = {
  milestones: readonly TimelineEntry[];
  onOpen: (milestone: TimelineEntry) => void;
};

/**
 * Divi's dotted timeline. On desktop (with motion) it pins while the line
 * draws itself and each year lights up in turn; elsewhere it is drawn and
 * visible from the start (vertical on small screens).
 */
export function JourneyTimeline({ milestones, onOpen }: JourneyTimelineProps) {
  const root = useRef<HTMLDivElement>(null);
  const pin = useRef<TimelinePin | null>(null);

  useEffect(() => {
    const element = root.current;
    // Pinning is for large screens; elsewhere the timeline is drawn from the start.
    if (!element || !motionWelcome() || !window.matchMedia(DESKTOP_QUERY).matches) return;
    let cancelled = false;
    loadMotionEngine()
      .then((engine) => {
        if (cancelled) return;
        // Pinning moves the timeline into a wrapper, which drops focus from
        // anything inside it. Keyboard focus may have arrived while the engine
        // was loading: restore it and skip past the reveal.
        const focused = element.contains(document.activeElement) ? document.activeElement : null;
        pin.current = engine.timelinePin(element, milestones.length);
        if (focused instanceof HTMLElement) {
          focused.focus({ preventScroll: true });
          pin.current.revealAll();
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      pin.current?.dispose();
      pin.current = null;
    };
  }, [milestones.length]);

  /** Keyboard users skip the scrubbed reveal: every year shows at rest. */
  function revealForFocus() {
    pin.current?.revealAll();
  }

  return (
    <div ref={root} onFocus={revealForFocus} className="relative mt-20 lg:mt-28">
      <span aria-hidden="true" className="absolute top-2 left-0 hidden h-px w-full bg-foreground/15 lg:block" />
      <span
        aria-hidden="true"
        data-timeline-line
        className="absolute top-2 left-0 hidden h-px w-full origin-left bg-highlight lg:block"
      />

      <ol
        // One column per milestone on desktop, however many there are.
        style={{ "--milestones": milestones.length } as CSSProperties}
        className="relative grid gap-14 border-l border-foreground/15 pl-8 lg:grid-cols-[repeat(var(--milestones),minmax(0,1fr))] lg:gap-10 lg:border-l-0 lg:pl-0"
      >
        {milestones.map((milestone) => {
          const { label, srPrefix, Icon } = ACTIONS[milestone.kind];
          return (
            <li key={milestone.itemId} data-timeline-node className="relative">
              <span
                aria-hidden="true"
                className="absolute top-0 -left-10 grid size-4 place-items-center rounded-full border border-foreground/30 bg-background lg:static"
              >
                <span data-timeline-dot className="size-2 rounded-full bg-highlight" />
              </span>

              <div data-timeline-body className="flex flex-col gap-4 lg:mt-8">
                <p className="font-poster text-6xl leading-none text-highlight">{milestone.year}</p>
                {/* Two lines reserved on desktop, so every thumbnail in the row lines up. */}
                <Heading as="h3" size="subtitle" className="lg:min-h-[2lh]">
                  {milestone.title}
                </Heading>
                <button
                  type="button"
                  onClick={() => onOpen(milestone)}
                  aria-haspopup="dialog"
                  className="group relative mt-2 aspect-video w-full max-w-md overflow-hidden rounded-tile bg-muted outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                >
                  <Image
                    src={milestone.still}
                    alt=""
                    fill
                    placeholder="blur"
                    sizes="(min-width: 1024px) 30vw, 90vw"
                    className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
                  />
                  <span aria-hidden="true" className="absolute inset-0 bg-overlay/30 transition-colors duration-500 group-hover:bg-overlay/10" />
                  <span
                    aria-hidden="true"
                    className="absolute bottom-3 left-3 inline-flex h-9 items-center gap-2 rounded-full bg-background/85 px-3.5 text-sm font-medium backdrop-blur-sm"
                  >
                    <Icon className={milestone.kind === "video" ? "size-3.5 fill-current" : "size-3.5"} /> {label}
                  </span>
                  <span className="sr-only">
                    {srPrefix}: {milestone.title}
                  </span>
                </button>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
