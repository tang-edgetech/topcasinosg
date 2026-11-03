import Link from "next/link";
import { field, sectionClassName, type PageSection } from "@/lib/pages";
import { ICON_SIZE, JUSTIFY, WIDGET_COLOR, WIDGET_CONTAINER } from "@/lib/widgets";
import SectionTag from "./SectionTag";
import WidgetIcon from "./WidgetIcon";

// Icon widget: one built-in icon in a size and brand colour, optionally a
// link. Without a colour it follows the text colour around it.
export default function IconWidget({ section }: { section: PageSection }) {
  const text = (key: string) => field(section.fields, 0, key)?.textValue ?? "";
  const url = text("url");
  const icon = (
    <WidgetIcon name={text("icon") || "star"} className={`${ICON_SIZE[text("size")] ?? ICON_SIZE.m} ${WIDGET_COLOR[text("color")] ?? "tone-heading"}`} />
  );

  return (
    <SectionTag section={section} id={section.customId || undefined} className={sectionClassName("section--icon", section)}>
      <div className={`${WIDGET_CONTAINER} flex ${JUSTIFY[text("align")] ?? JUSTIFY.center}`}>
        {url ? (
          <Link href={url} aria-label={text("label") || "Open link"}>
            {icon}
          </Link>
        ) : (
          icon
        )}
      </div>
    </SectionTag>
  );
}
