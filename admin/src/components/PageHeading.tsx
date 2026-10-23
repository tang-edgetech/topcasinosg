"use client";

import { useState } from "react";
import { Drawer } from "antd";
import { ADMIN_HELP, type AdminHelpKey } from "@/lib/adminHelp";

// A screen's <h1> plus an "i" button that opens a short guide to that screen
// (what it controls on the website, how to use it, tips). Guide text lives in
// lib/adminHelp.tsx so it can be edited in one place.
export default function PageHeading({ title, help }: { title: string; help: AdminHelpKey }) {
  const [open, setOpen] = useState(false);
  const guide = ADMIN_HELP[help];

  return (
    <div className="flex items-center gap-2">
      <h1 className="text-2xl font-bold text-text dark:text-text-dark">{title}</h1>
      <button
        type="button"
        id={`${help}-help-button`}
        aria-label={`How to use ${title}`}
        title={`How to use ${title}`}
        onClick={() => setOpen(true)}
        className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-primary-300 text-xs font-bold text-primary-600 hover:border-primary-600 hover:bg-primary-50 dark:border-border-dark dark:text-text-muted-dark dark:hover:bg-surface-muted-dark"
      >
        i
      </button>
      <Drawer open={open} onClose={() => setOpen(false)} title={`How to use ${title}`} width={440}>
        <div className="flex flex-col gap-5 text-sm leading-relaxed text-text dark:text-text-dark">
          <p>{guide.summary}</p>
          {guide.sections.map((section) => (
            <section key={section.heading} className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold">{section.heading}</h2>
              <ul className="flex list-disc flex-col gap-1 pl-5 text-text-muted dark:text-text-muted-dark">
                {section.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Drawer>
    </div>
  );
}
