import { field, sectionClassName, type PageSection } from "@/lib/pages";
import { sanitizeRichText } from "@/lib/sanitize-html";

export default function RichTextSection({ section }: { section: PageSection }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const body = field(section.fields, 0, "body")?.textValue ?? "";

  return (
    <section id={section.customId || undefined} className={sectionClassName("section--rich-text", section)}>
      <div className="section-container py-16">
        <div className="section-row flex flex-col">
          <div className="section-col mx-auto flex w-full max-w-3xl flex-col gap-4">
            {heading && <h2 className="section-heading text-2xl font-bold text-primary-900">{heading}</h2>}
            {body && (
              <div
                className="rich-text-content text-base leading-relaxed text-primary-600"
                dangerouslySetInnerHTML={{ __html: sanitizeRichText(body) }}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
