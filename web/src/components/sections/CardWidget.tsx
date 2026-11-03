import Link from "next/link";
import { buttonClassName, field, mediaUrl, sectionClassName, type PageSection } from "@/lib/pages";
import { sanitizeRichText } from "@/lib/sanitize-html";
import { WIDGET_CONTAINER } from "@/lib/widgets";
import SectionTag from "./SectionTag";

// Card widget: an image with a title, text and a button, in a white bordered
// card; the image on top, or on the left from tablet up.
export default function CardWidget({ section }: { section: PageSection }) {
  const text = (key: string) => field(section.fields, 0, key)?.textValue ?? "";
  const image = mediaUrl(field(section.fields, 0, "image")?.mediaUrl);
  const button = field(section.fields, 0, "button");
  const title = text("title");
  const body = text("body");
  const left = text("imagePosition") === "left";
  const centered = text("align") === "center";
  if (!image && !title && !body) return null;

  return (
    <SectionTag section={section} id={section.customId || undefined} className={sectionClassName("section--card", section)}>
      <div className={WIDGET_CONTAINER}>
        <div
          className={`widget-card flex h-full overflow-hidden rounded-lg border border-primary-100 bg-white ${
            left ? "flex-col sm:flex-row" : "flex-col"
          }`}
        >
          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={text("alt")}
              loading="lazy"
              decoding="async"
              className={`object-cover ${left ? "h-48 w-full sm:h-auto sm:w-2/5" : "aspect-[16/9] w-full"}`}
            />
          )}
          <div className={`flex flex-1 flex-col gap-3 p-5 ${centered ? "items-center text-center" : ""}`}>
            {title && <h3 className="text-xl font-bold text-primary-900">{title}</h3>}
            {body && <div className="rich-text-content text-base text-primary-600" dangerouslySetInnerHTML={{ __html: sanitizeRichText(body) }} />}
            {button?.textValue && button.urlValue && (
              <Link href={button.urlValue} className={`mt-auto ${buttonClassName(text("buttonStyle"))}`}>
                {button.textValue}
              </Link>
            )}
          </div>
        </div>
      </div>
    </SectionTag>
  );
}
