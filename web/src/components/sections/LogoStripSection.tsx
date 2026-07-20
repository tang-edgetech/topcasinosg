import { field, itemIndexes, mediaUrl, sectionClassName, type PageSection } from "@/lib/pages";

export default function LogoStripSection({ section }: { section: PageSection }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const items = itemIndexes(section.fields);

  return (
    <section id={section.customId || undefined} className={sectionClassName("section--logo-strip", section)}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-14">
        {heading && <h2 className="text-center text-xl font-bold text-primary-900">{heading}</h2>}
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {items.map((itemIndex) => {
            const logo = mediaUrl(field(section.fields, itemIndex, "logo")?.mediaUrl);
            const name = field(section.fields, itemIndex, "name")?.textValue ?? "";
            const url = field(section.fields, itemIndex, "url")?.textValue;

            // Dummy/placeholder partners often have no uploaded artwork yet —
            // fall back to a text badge instead of a broken <img>.
            const content = logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt={name} title={name} className="h-10 w-auto grayscale transition-all hover:grayscale-0" />
            ) : (
              <span className="logo-strip__fallback rounded-md bg-surface-muted px-4 py-2 text-sm font-semibold text-primary-700">
                {name}
              </span>
            );

            return url ? (
              <a key={itemIndex} href={url} target="_blank" rel="noopener noreferrer" className="logo-strip__item">
                {content}
              </a>
            ) : (
              <div key={itemIndex} className="logo-strip__item">
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
