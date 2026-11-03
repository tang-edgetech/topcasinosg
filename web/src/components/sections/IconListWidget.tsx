import Link from "next/link";
import { field, itemIndexes, sectionClassName, type PageSection } from "@/lib/pages";
import { TEXT_SIZE, WIDGET_COLOR, WIDGET_CONTAINER } from "@/lib/widgets";
import SectionTag from "./SectionTag";
import WidgetIcon from "./WidgetIcon";

// Icon List widget: short lines, each with an icon (a check by default) and
// optionally a link, one under another or side by side.
export default function IconListWidget({ section }: { section: PageSection }) {
  const text = (itemIndex: number, key: string) => field(section.fields, itemIndex, key)?.textValue ?? "";
  const items = itemIndexes(section.fields).filter((i) => text(i, "text"));
  if (items.length === 0) return null;
  const inline = text(0, "layout") === "inline";
  const iconColor = WIDGET_COLOR[text(0, "color")] ?? WIDGET_COLOR.success;

  return (
    <SectionTag section={section} id={section.customId || undefined} className={sectionClassName("section--icon-list", section)}>
      <div className={WIDGET_CONTAINER}>
        <ul
          className={`widget-icon-list tone-text flex ${inline ? "flex-row flex-wrap gap-x-6 gap-y-2" : "flex-col gap-2.5"} ${
            TEXT_SIZE[text(0, "size")] ?? TEXT_SIZE.m
          }`}
        >
          {items.map((i) => (
            <li key={i} className="flex items-start gap-2.5">
              <WidgetIcon name={text(i, "icon") || "check"} className={`mt-0.5 h-5 w-5 ${iconColor}`} />
              {text(i, "url") ? (
                <Link href={text(i, "url")} className="hover:underline">
                  {text(i, "text")}
                </Link>
              ) : (
                <span>{text(i, "text")}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </SectionTag>
  );
}
