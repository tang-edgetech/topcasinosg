import Link from "next/link";
import { field, sectionClassName, type PageSection } from "@/lib/pages";
import { sanitizeRichText } from "@/lib/sanitize-html";
import { ICON_SIZE, WIDGET_COLOR, WIDGET_CONTAINER } from "@/lib/widgets";
import SectionTag from "./SectionTag";
import WidgetIcon from "./WidgetIcon";

// Icon Box widget: an icon with a title and text, the icon above them or to
// their left; the title can link somewhere.
export default function IconBoxWidget({ section }: { section: PageSection }) {
  const text = (key: string) => field(section.fields, 0, key)?.textValue ?? "";
  const title = text("title");
  const body = text("body");
  const url = text("url");
  const left = text("position") === "left";
  const centered = !left && text("align") === "center";

  return (
    <SectionTag section={section} id={section.customId || undefined} className={sectionClassName("section--icon-box", section)}>
      <div className={`${WIDGET_CONTAINER} flex gap-4 ${left ? "flex-row items-start" : "flex-col"} ${centered ? "items-center text-center" : ""}`}>
        <WidgetIcon
          name={text("icon") || "star"}
          className={`${ICON_SIZE[text("size")] ?? ICON_SIZE.m} ${WIDGET_COLOR[text("color")] ?? WIDGET_COLOR.secondary}`}
        />
        <div className="flex min-w-0 flex-col gap-2">
          {title && (
            <h3 className="widget-icon-box__title tone-heading text-xl font-bold">
              {url ? (
                <Link href={url} className="hover:underline">
                  {title}
                </Link>
              ) : (
                title
              )}
            </h3>
          )}
          {body && <div className="rich-text-content tone-text text-base" dangerouslySetInnerHTML={{ __html: sanitizeRichText(body) }} />}
        </div>
      </div>
    </SectionTag>
  );
}
