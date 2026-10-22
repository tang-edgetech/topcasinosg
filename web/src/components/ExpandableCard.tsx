"use client";

import { useState, type ReactNode } from "react";

// One Figma "+" card (Bonuses You Can Claim / Trusted Payment Methods /
// Game Strategy / RTP Trackers): a tinted header with icon + title, then
// the description - clamped to two lines on desktop and hidden entirely on
// mobile until opened (the mobile design shows header rows only).
export default function ExpandableCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`expandable-card flex flex-col overflow-hidden rounded-lg border border-primary-100 bg-white ${open ? "is-open" : ""}`}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="expandable-card__header flex w-full cursor-pointer items-center gap-3 bg-surface-muted px-4 py-3 text-left"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center">{icon}</span>
        <span className="flex-1 text-base font-semibold text-primary-glow">{title}</span>
        <span aria-hidden="true" className="text-xl leading-none text-primary-glow md:hidden">
          {open ? "−" : "+"}
        </span>
      </button>
      {text && (
        <div className={`expandable-card__body items-start gap-3 px-4 py-3 ${open ? "flex" : "hidden md:flex"}`}>
          <p className={`flex-1 text-sm whitespace-pre-line text-primary-900 ${open ? "" : "line-clamp-2"}`}>{text}</p>
          <button
            type="button"
            aria-label={open ? `Collapse ${title}` : `Expand ${title}`}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="hidden shrink-0 cursor-pointer text-xl leading-none text-primary-glow md:block"
          >
            {open ? "−" : "+"}
          </button>
        </div>
      )}
    </div>
  );
}
