"use client";

import { Play } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const youtubeThumbnail = (videoId: string) => `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

export const youtubeEmbedUrl = (videoId: string) =>
  `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0&modestbranding=1`;

/**
 * Click-to-load YouTube player. Nothing from YouTube loads (no script, no
 * cookies) until the visitor presses play; the privacy-enhanced domain is
 * used after that.
 */
export function YouTubeEmbed({
  videoId,
  title,
  sizes = "(min-width: 768px) 60vw, 100vw",
  className,
}: {
  videoId: string;
  title: string;
  sizes?: string;
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className={cn("relative aspect-video w-full overflow-hidden rounded-xl bg-muted", className)}>
      {playing ? (
        <iframe
          src={youtubeEmbedUrl(videoId)}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 size-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 size-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-inset"
        >
          <Image
            src={youtubeThumbnail(videoId)}
            alt=""
            fill
            sizes={sizes}
            className="object-cover transition-transform duration-500 ease-standard group-hover:scale-105"
          />
          <span aria-hidden="true" className="absolute inset-0 bg-overlay/20 transition-colors group-hover:bg-overlay/35" />
          <span
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-card text-card-foreground shadow-raised transition-transform duration-300 ease-standard group-hover:scale-110 sm:size-20"
          >
            <Play className="size-7 translate-x-0.5 fill-current sm:size-8" />
          </span>
          <span className="sr-only">Play video: {title}</span>
        </button>
      )}
    </div>
  );
}
