import { field, mediaUrl, sectionClassName, type PageSection } from "@/lib/pages";
import { sanitizeRichText } from "@/lib/sanitize-html";

export default function RichTextSection({ section }: { section: PageSection }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const body = field(section.fields, 0, "body")?.textValue ?? "";
  const image = mediaUrl(field(section.fields, 0, "image")?.mediaUrl);

  const textCol = (
    <div className="section-col flex w-full flex-col gap-4">
      {heading && <h2 className="section-heading text-2xl font-bold text-primary-900">{heading}</h2>}
      {body && (
        <div
          className="rich-text-content text-base leading-relaxed text-primary-600"
          dangerouslySetInnerHTML={{ __html: sanitizeRichText(body) }}
        />
      )}
    </div>
  );

  return (
    <section id={section.customId || undefined} className={sectionClassName("section--rich-text", section)}>
      <div className="section-container py-16">
        {image ? (
          <div className="section-row grid grid-cols-1 items-center gap-8 md:grid-cols-2">
            {textCol}
            <div className="section-col">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="" className="mx-auto w-full max-w-md rounded-lg object-contain" />
            </div>
          </div>
        ) : (
          <div className="section-row flex flex-col">
            <div className="mx-auto w-full max-w-3xl">{textCol}</div>
          </div>
        )}
      </div>
    </section>
  );
}
