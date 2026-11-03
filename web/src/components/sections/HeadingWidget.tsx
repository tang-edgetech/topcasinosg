import Link from "next/link";
import { field, sectionClassName, type PageSection } from "@/lib/pages";
import { HEADING_SIZE, TEXT_ALIGN, WIDGET_CONTAINER } from "@/lib/widgets";
import SectionTag from "./SectionTag";

const TAGS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
type HeadingTag = (typeof TAGS)[number];

// Heading widget: one heading, its HTML level (h1-h6, for SEO) separate from
// its size, optionally a link. Colour follows the text colour around it.
export default function HeadingWidget({ section }: { section: PageSection }) {
  const text = (key: string) => field(section.fields, 0, key)?.textValue ?? "";
  const heading = text("heading");
  if (!heading) return null;
  const Tag: HeadingTag = TAGS.includes(text("tag") as HeadingTag) ? (text("tag") as HeadingTag) : "h2";
  const url = text("url");
  const className = `widget-heading section-heading tone-heading font-bold ${HEADING_SIZE[text("size")] ?? HEADING_SIZE.l} ${
    TEXT_ALIGN[text("align")] ?? TEXT_ALIGN.left
  }`;

  return (
    <SectionTag section={section} id={section.customId || undefined} className={sectionClassName("section--heading", section)}>
      <div className={WIDGET_CONTAINER}>
        <Tag className={className}>
          {url ? (
            <Link href={url} className="hover:underline">
              {heading}
            </Link>
          ) : (
            heading
          )}
        </Tag>
      </div>
    </SectionTag>
  );
}
