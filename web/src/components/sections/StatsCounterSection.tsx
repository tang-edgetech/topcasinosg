import { field, itemIndexes, sectionClassName, type PageSection } from "@/lib/pages";
import CountUpNumber from "./CountUpNumber";

export default function StatsCounterSection({ section }: { section: PageSection }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const items = itemIndexes(section.fields);

  return (
    <section id={section.customId || undefined} className={sectionClassName("section--stats-counter", section)}>
      <div className="section-container flex flex-col gap-10 py-16">
        {heading && (
          <div className="section-row">
            <div className="section-col">
              <h2 className="section-heading text-center text-2xl font-bold text-primary-900">{heading}</h2>
            </div>
          </div>
        )}
        <div className="section-row grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((itemIndex) => {
            const prefix = field(section.fields, itemIndex, "prefix")?.textValue ?? "";
            const number = field(section.fields, itemIndex, "number")?.textValue ?? "0";
            const suffix = field(section.fields, itemIndex, "suffix")?.textValue ?? "";
            const title = field(section.fields, itemIndex, "title")?.textValue ?? "";
            const content = field(section.fields, itemIndex, "content")?.textValue ?? "";
            return (
              <div key={itemIndex} className="stats-counter-item section-col flex flex-col items-center gap-2 text-center">
                <span className="text-3xl font-bold text-primary-900 sm:text-4xl">
                  <CountUpNumber value={number} prefix={prefix} suffix={suffix} />
                </span>
                {title && <span className="text-sm font-semibold text-primary-700">{title}</span>}
                {content && <span className="text-xs text-primary-500">{content}</span>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
