import Link from "next/link";
import { buttonClassName, field, itemIndexes, sectionClassName, type PageSection } from "@/lib/pages";

const JUSTIFY_CLASSES: Record<string, string> = { left: "justify-start", center: "justify-center", right: "justify-end" };

// One or more buttons in a row (Figma CTA styles: primary / secondary /
// outline / white), each optionally opening in a new tab.
export default function ButtonGroupSection({ section }: { section: PageSection }) {
  const buttons = itemIndexes(section.fields)
    .map((itemIndex) => ({
      key: itemIndex,
      button: field(section.fields, itemIndex, "button"),
      style: field(section.fields, itemIndex, "buttonStyle")?.textValue,
      newTab: field(section.fields, itemIndex, "newTab")?.textValue === "yes",
    }))
    .filter(({ button }) => button?.textValue && button.urlValue);
  if (buttons.length === 0) return null;

  const align = field(section.fields, 0, "align")?.textValue ?? "left";

  return (
    <section id={section.customId || undefined} className={sectionClassName("section--button-group", section)}>
      <div className="section-container py-[3.125rem]">
        <div className="section-row">
          <div className={`button-group section-col flex flex-wrap gap-3 ${JUSTIFY_CLASSES[align] ?? JUSTIFY_CLASSES.left}`}>
            {buttons.map(({ key, button, style, newTab }) =>
              newTab ? (
                <a key={key} href={button!.urlValue} target="_blank" rel="noopener noreferrer" className={buttonClassName(style)}>
                  {button!.textValue}
                </a>
              ) : (
                <Link key={key} href={button!.urlValue} className={buttonClassName(style)}>
                  {button!.textValue}
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
