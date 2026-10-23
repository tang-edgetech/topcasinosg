import type { CSSProperties } from "react";
import { field, itemIndexes, sectionClassName, sectionBgStyle, type PageSection } from "@/lib/pages";
import { getSiteStats, type SiteStat } from "@/app/[region]/_lib/api";
import CountUpNumber from "./CountUpNumber";

const LIVE_SOURCES: SiteStat[] = ["casinos", "blacklist", "regions", "guides"];

// Figma Home "Our Track Record": tinted number tiles. A tile's number is
// either typed by the editor or, with a live source picked, counted from the
// site's records (casinos, blacklisted operators, regions, guides); a typed
// number always overrides the live count, e.g. "50" with suffix "+".
export default async function StatsCounterSection({ section }: { section: PageSection }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const items = itemIndexes(section.fields);
  const { hasBleedBg, style: bgStyle } = sectionBgStyle(section.fields);

  const sources = items.map((i) => field(section.fields, i, "source")?.textValue ?? "");
  const stats = sources.some((s) => LIVE_SOURCES.includes(s as SiteStat)) ? await getSiteStats() : null;

  return (
    <section
      id={section.customId || undefined}
      className={sectionClassName(hasBleedBg ? "section--stats-counter section--bg" : "section--stats-counter", section)}
      style={bgStyle as CSSProperties}
    >
      <div className="section-container relative z-10 flex flex-col gap-6 py-[3.125rem]">
        {heading && (
          <div className="section-row">
            <div className="section-col">
              <h2 className="section-heading text-center text-3xl font-bold text-primary-900">{heading}</h2>
            </div>
          </div>
        )}
        <div className="stats-counter__track section-row flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 lg:grid lg:grid-cols-5 lg:overflow-visible">
          {items.map((itemIndex, i) => {
            const prefix = field(section.fields, itemIndex, "prefix")?.textValue ?? "";
            const typed = field(section.fields, itemIndex, "number")?.textValue ?? "";
            const suffix = field(section.fields, itemIndex, "suffix")?.textValue ?? "";
            const title = field(section.fields, itemIndex, "title")?.textValue ?? "";
            const content = field(section.fields, itemIndex, "content")?.textValue ?? "";
            const source = sources[i] as SiteStat;
            const number = typed || (stats && LIVE_SOURCES.includes(source) ? String(stats[source]) : "0");
            return (
              <div
                key={itemIndex}
                className="stats-counter-item section-col flex w-[180px] shrink-0 snap-start flex-col items-center gap-1 rounded-lg bg-surface-muted px-4 py-5 text-center lg:w-auto"
              >
                <span className="text-3xl font-bold text-primary-glow">
                  <CountUpNumber value={number} prefix={prefix} suffix={suffix} />
                </span>
                {title && <span className="text-sm text-primary-600">{title}</span>}
                {content && <span className="text-xs text-primary-400">{content}</span>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
