import { field, itemIndexes, mediaUrl, sectionClassName, type PageSection } from "@/lib/pages";

// "Expert Team Behind the Reviews" — purely admin-authored (photo/name/
// title/quote per member), mirrors LogoStripSection's item shape.
export default function TeamGridSection({ section }: { section: PageSection }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const items = itemIndexes(section.fields);

  if (items.length === 0) return null;

  return (
    <section id={section.customId || undefined} className={sectionClassName("section--team-grid", section)}>
      <div className="section-container flex flex-col gap-10 py-16">
        {heading && (
          <div className="section-row">
            <div className="section-col text-center">
              <h2 className="section-heading text-2xl font-bold text-primary-900">{heading}</h2>
            </div>
          </div>
        )}
        <div className="section-row grid grid-cols-2 gap-6 sm:grid-cols-4">
          {items.map((itemIndex) => {
            const photo = mediaUrl(field(section.fields, itemIndex, "photo")?.mediaUrl);
            const name = field(section.fields, itemIndex, "name")?.textValue ?? "";
            const title = field(section.fields, itemIndex, "title")?.textValue ?? "";
            const quote = field(section.fields, itemIndex, "quote")?.textValue ?? "";

            return (
              <div key={itemIndex} className="team-member section-col flex flex-col items-center gap-2 text-center">
                <div className="h-24 w-24 overflow-hidden rounded-full bg-surface-muted">
                  {photo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo} alt={name} className="h-full w-full object-cover" />
                  )}
                </div>
                {name && <h3 className="text-base font-semibold text-primary-900">{name}</h3>}
                {title && <p className="text-xs text-primary-500">{title}</p>}
                {quote && <p className="text-sm text-primary-600 italic">&ldquo;{quote}&rdquo;</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
