import { field, itemIndexes, sectionClassName, sectionBgStyle, type PageSection } from "@/lib/pages";
import type { CSSProperties } from "react";

// Figma "Trust Factors" / "Safety Tips" / "Your Role" pattern: a single
// tinted callout box, split into a left label column (italic serif heading
// + a short subtext line) and a right column of checkmarked items - not the
// generic centered icon-box-group look these three were seeded with before.
// layout "stacked" is the Bonuses hub's "How We Choose the Best ... Bonuses"
// variant: same tinted box, but a full-width section-style heading and
// subtext above the checklist instead of a side label column.
export default function ChecklistCalloutSection({ section }: { section: PageSection }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const subtext = field(section.fields, 0, "subtext")?.textValue ?? "";
  const stacked = field(section.fields, 0, "layout")?.textValue === "stacked";
  const items = itemIndexes(section.fields);
  const { hasBleedBg, style: bgStyle } = sectionBgStyle(section.fields);

  const checklist = (
    <ul className="checklist-callout__items flex flex-1 flex-col gap-2">
      {items.map((itemIndex) => {
        const text = field(section.fields, itemIndex, "text")?.textValue ?? "";
        if (!text) return null;
        return (
          <li key={itemIndex} className="flex items-start gap-2 text-sm text-primary-700">
            <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0">
              <path
                fillRule="evenodd"
                d="M16.704 5.29a1 1 0 010 1.42l-7.25 7.25a1 1 0 01-1.42 0l-3.25-3.25a1 1 0 111.42-1.42l2.54 2.54 6.54-6.54a1 1 0 011.42 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>{text}</span>
          </li>
        );
      })}
    </ul>
  );

  return (
    <section
      id={section.customId || undefined}
      className={sectionClassName(hasBleedBg ? "section--checklist-callout section--bg" : "section--checklist-callout", section)}
      style={bgStyle as CSSProperties}
    >
      <div className="section-container relative z-10 pt-0 pb-[3.125rem]">
        <div className="section-row">
          {stacked ? (
            <div className="checklist-callout checklist-callout--stacked section-col flex flex-col gap-2 rounded-lg p-5">
              {heading && <h2 className="checklist-callout__heading text-2xl font-bold">{heading}</h2>}
              {subtext && <p className="text-sm text-primary-600">{subtext}</p>}
              {checklist}
            </div>
          ) : (
            <div className="checklist-callout section-col flex flex-col gap-4 rounded-lg p-5 sm:flex-row sm:items-start sm:gap-8">
              <div className="checklist-callout__label flex shrink-0 flex-col gap-1 sm:w-48">
                {heading && <h3 className="font-serif text-xl font-bold italic">{heading}</h3>}
                {subtext && <p className="text-sm text-primary-600">{subtext}</p>}
              </div>
              {checklist}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
