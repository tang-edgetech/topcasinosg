"use client";

import { useState } from "react";

// Generic expand/collapse item — shared by IconBoxGroupSection's "dropdown"
// display mode and FaqSection, so the two features stay behaviorally
// identical instead of each growing their own toggle logic.
export default function AccordionItem({
  header,
  children,
  className,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={["accordion-item", open ? "is-active" : "", className].filter(Boolean).join(" ")}>
      <button
        type="button"
        className="accordion-item__header flex w-full cursor-pointer items-center justify-between gap-3 text-left"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {header}
        <span aria-hidden="true" className={`accordion-item__chevron shrink-0 transition-transform ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>
      {open && <div className="accordion-item__body">{children}</div>}
    </div>
  );
}
