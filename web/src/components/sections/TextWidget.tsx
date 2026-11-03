import { field, sectionClassName, type PageSection } from "@/lib/pages";
import { sanitizeRichText } from "@/lib/sanitize-html";
import { TEXT_ALIGN, TEXT_SIZE, WIDGET_CONTAINER } from "@/lib/widgets";
import SectionTag from "./SectionTag";

// Text widget: formatted text (paragraphs, lists, links, bold) with no
// heading of its own, in a size and alignment.
export default function TextWidget({ section }: { section: PageSection }) {
  const text = (key: string) => field(section.fields, 0, key)?.textValue ?? "";
  const body = text("body");
  if (!body) return null;

  return (
    <SectionTag section={section} id={section.customId || undefined} className={sectionClassName("section--text", section)}>
      <div className={WIDGET_CONTAINER}>
        <div
          className={`widget-text rich-text-content tone-text ${TEXT_SIZE[text("size")] ?? TEXT_SIZE.m} ${TEXT_ALIGN[text("align")] ?? TEXT_ALIGN.left}`}
          dangerouslySetInnerHTML={{ __html: sanitizeRichText(body) }}
        />
      </div>
    </SectionTag>
  );
}
