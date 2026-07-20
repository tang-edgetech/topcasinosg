import Link from "next/link";
import { field, sectionClassName, buttonClassName, type PageSection } from "@/lib/pages";
import { sanitizeRichText } from "@/lib/sanitize-html";

export default function CTASection({ section }: { section: PageSection }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const body = field(section.fields, 0, "body")?.textValue ?? "";
  const button = field(section.fields, 0, "button");
  const buttonStyle = field(section.fields, 0, "buttonStyle")?.textValue;

  return (
    <section id={section.customId || undefined} className={sectionClassName("section--cta", section)}>
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-6 py-16 text-center">
        {heading && <h2 className="text-2xl font-bold text-white">{heading}</h2>}
        {body && (
          <div
            className="rich-text-content text-white/90"
            dangerouslySetInnerHTML={{ __html: sanitizeRichText(body) }}
          />
        )}
        {button?.textValue && button.urlValue && (
          <Link href={button.urlValue} className={buttonClassName(buttonStyle)}>
            {button.textValue}
          </Link>
        )}
      </div>
    </section>
  );
}
