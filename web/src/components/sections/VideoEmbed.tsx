"use client";

import { useState } from "react";

export interface VideoSource {
  provider: "youtube" | "vimeo";
  id: string;
}

// Click-to-play facade: a YouTube thumbnail (or a plain dark panel for
// Vimeo) with a play button, swapped for the real player on click.
export default function VideoEmbed({ source, title }: { source: VideoSource; title: string }) {
  const [playing, setPlaying] = useState(false);
  const embedUrl =
    source.provider === "youtube"
      ? `https://www.youtube-nocookie.com/embed/${source.id}?autoplay=1&rel=0`
      : `https://player.vimeo.com/video/${source.id}?autoplay=1`;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-primary-900">
      {playing ? (
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} aria-label={`Play video: ${title}`} className="group absolute inset-0 cursor-pointer">
          {source.provider === "youtube" && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`https://i.ytimg.com/vi/${source.id}/hqdefault.jpg`}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <span className="absolute top-1/2 left-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-danger text-white shadow-lg transition-transform group-hover:scale-110">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="ml-1 h-7 w-7" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
