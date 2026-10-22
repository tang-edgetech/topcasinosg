import type { CSSProperties } from "react";
import Link from "next/link";
import { field, itemIndexes, sectionClassName, sectionBgStyle, type PageSection } from "@/lib/pages";
import { sanitizeRichText } from "@/lib/sanitize-html";

// Figma "Ready to Win? Start Playing Smart in Thai Casinos": a heading,
// short intro, and a stacked list of link buttons - outlined on desktop,
// filled navy gradient with a gold arrow on mobile (per the two frames).
export default function CtaLinkListSection({ section }: { section: PageSection }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const intro = field(section.fields, 0, "intro")?.textValue ?? "";
  const links = itemIndexes(section.fields)
    .map((itemIndex) => ({
      itemIndex,
      label: field(section.fields, itemIndex, "label")?.textValue ?? "",
      url: field(section.fields, itemIndex, "url")?.textValue ?? "",
    }))
    .filter((link) => link.label && link.url);
  const { hasBleedBg, style: bgStyle } = sectionBgStyle(section.fields);

  return (
    <section
      id={section.customId || undefined}
      className={sectionClassName(hasBleedBg ? "section--cta-link-list section--bg" : "section--cta-link-list", section)}
      style={bgStyle as CSSProperties}
    >
      <div className="section-container relative z-10 flex flex-col gap-4 py-[3.125rem]">
        <div className="section-row">
          <div className="section-col flex flex-col gap-1">
            {heading && <h2 className="section-heading text-2xl font-bold text-primary-900">{heading}</h2>}
            {intro && (
              <div className="rich-text-content text-sm text-primary-600" dangerouslySetInnerHTML={{ __html: sanitizeRichText(intro) }} />
            )}
          </div>
        </div>
        <div className="section-row">
          <ul className="section-col flex w-full flex-col gap-3 md:max-w-[400px]">
            {links.map((link) => (
              <li key={link.itemIndex}>
                <Link
                  href={link.url}
                  className="cta-link flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-gradient-to-r from-primary-900 to-primary-glow px-4 py-3 text-sm text-white md:border md:border-primary-200 md:bg-none md:bg-white md:text-primary-600 md:hover:border-primary-900 md:hover:text-primary-900"
                >
                  {link.label}
                  <span aria-hidden="true" className="text-xs text-secondary-600 md:hidden">
                    ▶
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
