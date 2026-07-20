import type { CSSProperties } from "react";
import Link from "next/link";
import {
  field,
  itemIndexes,
  mediaUrl,
  sectionClassName,
  columnsClassName,
  colorThemeValue,
  buttonClassName,
  type PageSection,
} from "@/lib/pages";
import { sanitizeRichText } from "@/lib/sanitize-html";
import AccordionItem from "@/components/Accordion";

// Flexible per admin/src/app/dashboard/pages/BlockFields.tsx's IconBoxGroupFields:
// - displayMode "default" (vertical or horizontal layout) or "dropdown" (accordion)
// - normal/hover/active colors resolved to CSS custom properties (see
//   shared/theme/sections.css's .icon-box rules) rather than combinatorial classes
// - an optional per-item CTA button, styled via the same buttonClassName as
//   Hero/CTA buttons
export default function IconBoxGroupSection({ section }: { section: PageSection }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const displayMode = field(section.fields, 0, "displayMode")?.textValue || "default";
  const layout = field(section.fields, 0, "layout")?.textValue || "vertical";
  const columns = field(section.fields, 0, "columns")?.textValue;
  const colorNormal = field(section.fields, 0, "colorNormal")?.textValue;
  const colorHover = field(section.fields, 0, "colorHover")?.textValue;
  const colorActive = field(section.fields, 0, "colorActive")?.textValue;
  const items = itemIndexes(section.fields);

  const colorStyle = {
    "--iconbox-color-normal": colorThemeValue(colorNormal),
    "--iconbox-color-hover": colorThemeValue(colorHover),
    "--iconbox-color-active": colorThemeValue(colorActive),
  } as CSSProperties;

  return (
    <section id={section.customId || undefined} className={sectionClassName("section--icon-box-group", section)}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-16">
        {heading && <h2 className="text-center text-2xl font-bold text-primary-900">{heading}</h2>}
        <div className={`grid gap-8 ${columnsClassName(columns)}`} style={colorStyle}>
          {items.map((itemIndex) => {
            const icon = mediaUrl(field(section.fields, itemIndex, "icon")?.mediaUrl);
            const boxHeading = field(section.fields, itemIndex, "heading")?.textValue ?? "";
            const boxText = field(section.fields, itemIndex, "text")?.textValue ?? "";
            const button = field(section.fields, itemIndex, "button");
            const buttonStyle = field(section.fields, itemIndex, "buttonStyle")?.textValue;

            const iconEl = icon && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={icon} alt="" className="h-14 w-14 shrink-0 object-contain" />
            );
            const bodyEl = boxText && (
              <div
                className="icon-box__text rich-text-content text-sm"
                dangerouslySetInnerHTML={{ __html: sanitizeRichText(boxText) }}
              />
            );
            const buttonEl = button?.textValue && button.urlValue && (
              <Link href={button.urlValue} className={buttonClassName(buttonStyle)}>
                {button.textValue}
              </Link>
            );

            if (displayMode === "dropdown") {
              return (
                <AccordionItem
                  key={itemIndex}
                  className="icon-box icon-box--dropdown rounded-lg border border-primary-100 p-4"
                  header={
                    <div className="flex items-center gap-3">
                      {iconEl}
                      {boxHeading && <h3 className="icon-box__heading text-lg font-semibold">{boxHeading}</h3>}
                    </div>
                  }
                >
                  <div className="flex flex-col items-start gap-3 pt-3">
                    {bodyEl}
                    {buttonEl}
                  </div>
                </AccordionItem>
              );
            }

            const isHorizontal = layout === "horizontal";
            return (
              <div
                key={itemIndex}
                className={`icon-box ${isHorizontal ? "icon-box--horizontal flex-row text-left" : "icon-box--vertical flex-col text-center"} flex items-center gap-4`}
              >
                {iconEl}
                <div className={`flex flex-col gap-2 ${isHorizontal ? "items-start" : "items-center"}`}>
                  {boxHeading && <h3 className="icon-box__heading text-lg font-semibold">{boxHeading}</h3>}
                  {bodyEl}
                  {buttonEl}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
