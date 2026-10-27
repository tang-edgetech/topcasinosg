"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import type { ContainerPanel } from "./ContainerSection";

// A Container's "tabs" layout: one component visible at a time. Every panel
// stays in the HTML (hidden ones get the hidden attribute) so all content is
// crawlable; arrow keys, Home and End move between tabs.
export default function ContainerTabs({ panels, align }: { panels: ContainerPanel[]; align: "start" | "center" }) {
  const [active, setActive] = useState(0);
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function focusTab(index: number) {
    const next = (index + panels.length) % panels.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const moves: Record<string, number> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: panels.length - 1 };
    if (!(e.key in moves)) return;
    e.preventDefault();
    focusTab(moves[e.key]);
  }

  return (
    <div className="container-tabs flex flex-col">
      <div role="tablist" className={`container-tabs__list tone-line ${align === "center" ? "justify-center" : "justify-start"}`}>
        {panels.map((panel, index) => (
          <button
            key={panel.id}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            type="button"
            role="tab"
            id={`${baseId}-tab-${index}`}
            aria-selected={index === active}
            aria-controls={`${baseId}-panel-${index}`}
            tabIndex={index === active ? 0 : -1}
            onClick={() => setActive(index)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={`container-tabs__tab ${index === active ? "container-tabs__tab--active" : ""} ${panel.visibility}`}
          >
            {panel.title}
          </button>
        ))}
      </div>
      {panels.map((panel, index) => (
        <div
          key={panel.id}
          role="tabpanel"
          id={`${baseId}-panel-${index}`}
          aria-labelledby={`${baseId}-tab-${index}`}
          hidden={index !== active}
          className="container-panel container-tabs__panel"
        >
          {panel.content}
        </div>
      ))}
    </div>
  );
}
