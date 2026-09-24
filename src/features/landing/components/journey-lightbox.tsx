"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRef, type KeyboardEvent } from "react";
import { youtubeEmbedUrl } from "@/components/media/youtube-embed";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { JourneyItem } from "../content";

export const journeyLabel = (item: JourneyItem) => (item.type === "video" ? item.title : item.alt);

type JourneyLightboxProps = {
  items: readonly JourneyItem[];
  /** The open item, or null when closed. */
  index: number | null;
  onIndexChange: (index: number | null) => void;
};

/** Photos and films in one accessible lightbox; arrow keys browse while it is open. */
export function JourneyLightbox({ items, index, onIndexChange }: JourneyLightboxProps) {
  const current = index === null ? null : items[index];
  const content = useRef<HTMLDivElement>(null);

  const step = (delta: number) => {
    if (index !== null) onIndexChange((index + delta + items.length) % items.length);
  };

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "ArrowRight") step(1);
    if (event.key === "ArrowLeft") step(-1);
  }

  return (
    <Dialog open={current != null} onOpenChange={(open) => !open && onIndexChange(null)}>
      <DialogContent
        ref={content}
        onKeyDown={onKeyDown}
        // Focus the lightbox, not the first tabbable element: inside a video's
        // iframe, key presses never reach the arrow-key handler.
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          content.current?.focus();
        }}
        className="theme-inverse gap-0 overflow-hidden p-0 outline-none sm:max-w-5xl sm:p-0"
      >
        {current != null && index !== null ? (
          <>
            <DialogTitle className="sr-only">{journeyLabel(current)}</DialogTitle>
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
  );
}
