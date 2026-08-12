import { field, itemIndexes, mediaUrl, sectionClassName, type PageSection } from "@/lib/pages";

export default function ImageGallerySection({ section }: { section: PageSection }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const items = itemIndexes(section.fields);

  return (
    <section id={section.customId || undefined} className={sectionClassName("section--image-gallery", section)}>
      <div className="section-container flex flex-col gap-8 py-16">
        {heading && (
          <div className="section-row">
            <div className="section-col">
              <h2 className="section-heading text-center text-2xl font-bold text-primary-900">{heading}</h2>
            </div>
          </div>
        )}
        <div className="section-row grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((itemIndex) => {
            const image = mediaUrl(field(section.fields, itemIndex, "image")?.mediaUrl);
            const caption = field(section.fields, itemIndex, "caption")?.textValue ?? "";
            if (!image) return null;
            return (
              <figure key={itemIndex} className="gallery-item section-col flex flex-col gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt={caption} className="aspect-square w-full rounded-lg object-cover" />
                {caption && <figcaption className="text-center text-xs text-primary-500">{caption}</figcaption>}
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
