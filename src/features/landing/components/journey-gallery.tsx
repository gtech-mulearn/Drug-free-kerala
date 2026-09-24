"use client";

import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import Image from "next/image";
import { useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { youtubeEmbedUrl, youtubeThumbnail } from "@/components/media/youtube-embed";
import { cn } from "@/lib/utils";
import type { JourneyItem, JourneyLayout } from "../content";

const LAYOUT: Record<JourneyLayout, string> = {
  standard: "",
  wide: "col-span-2",
  tall: "row-span-2",
};

const label = (item: JourneyItem) => (item.type === "video" ? item.title : item.alt);

/** Bento grid with an accessible lightbox (arrow keys browse while it is open). */
export function JourneyGallery({ items }: { items: JourneyItem[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const current = index === null ? null : items[index];

  const step = (delta: number) =>
    setIndex((value) => (value === null ? value : (value + delta + items.length) % items.length));

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "ArrowRight") step(1);
    if (event.key === "ArrowLeft") step(-1);
  }

  return (
    <>
      <ul className="grid auto-rows-50 grid-flow-dense grid-cols-2 gap-4 md:auto-rows-62 md:grid-cols-4 md:gap-6">
        {items.map((item, itemIndex) => (
          <li key={item.id} className={cn("reveal", LAYOUT[item.layout])}>
            <button
              type="button"
              onClick={() => setIndex(itemIndex)}
              aria-haspopup="dialog"
              className="group relative size-full overflow-hidden rounded-xl bg-muted outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              <Image
                src={item.type === "image" ? item.image : youtubeThumbnail(item.videoId)}
                alt=""
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                className="object-cover transition-transform duration-500 ease-standard group-hover:scale-105"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-overlay/25 transition-colors duration-300 group-hover:bg-overlay/45"
              />
              {item.type === "video" ? (
                <span
                  aria-hidden="true"
                  className="theme-inverse absolute top-1/2 left-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-background/60 text-foreground backdrop-blur-sm transition-transform duration-300 group-hover:scale-110"
                >
                  <Play className="size-5 translate-x-px fill-current" />
                </span>
              ) : null}
              <span
                aria-hidden="true"
                className="theme-inverse absolute inset-x-0 bottom-0 bg-linear-to-t from-overlay/80 to-transparent p-3 text-start text-sm font-medium text-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                <span className="line-clamp-2">{label(item)}</span>
              </span>
              <span className="sr-only">{item.type === "video" ? `Play video: ${item.title}` : `View photo: ${item.alt}`}</span>
            </button>
          </li>
        ))}
      </ul>

      <Dialog open={current !== null} onOpenChange={(open) => !open && setIndex(null)}>
        <DialogContent
          onKeyDown={onKeyDown}
          className="theme-inverse gap-0 overflow-hidden p-0 sm:max-w-5xl sm:p-0"
        >
          {current && index !== null ? (
            <>
              <DialogTitle className="sr-only">{label(current)}</DialogTitle>
              <DialogDescription className="sr-only">
                Item {index + 1} of {items.length}. Use the left and right arrow keys to browse.
              </DialogDescription>

              {current.type === "image" ? (
                <div className="relative h-[min(75svh,48rem)] w-full bg-background">
                  <Image src={current.image} alt={current.alt} fill sizes="90vw" className="object-contain" />
                </div>
              ) : (
                <div className="relative aspect-video w-full bg-background">
                  <iframe
                    key={current.videoId}
                    src={youtubeEmbedUrl(current.videoId)}
                    title={current.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    className="absolute inset-0 size-full border-0"
                  />
                </div>
              )}

              <div className="flex items-center justify-between gap-4 border-t px-4 py-3">
                <Button variant="ghost" size="sm" onClick={() => step(-1)}>
                  <ChevronLeft /> Previous
                </Button>
                <span className="text-sm text-muted-foreground tabular-nums" aria-hidden="true">
                  {index + 1} / {items.length}
                </span>
                <Button variant="ghost" size="sm" onClick={() => step(1)}>
                  Next <ChevronRight />
                </Button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
