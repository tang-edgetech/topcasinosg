import type { CSSProperties, ReactNode } from "react";
import { sectionClassName, sectionBgStyle, type PageSection } from "@/lib/pages";
import { sanitizeRichText } from "@/lib/sanitize-html";
import SectionTag from "./SectionTag";

// The wrapper every page section repeats: canonical class + editor classes,
// optional bleed background (bgType/bgFrom/bgTo fields), custom id, and the
// .section-container with the standard vertical rhythm.
export function SectionShell({
  section,
  name,
  children,
  bgDefaults,
  containerClassName = "flex flex-col gap-5",
}: {
  section: PageSection;
  name: string;
  children: ReactNode;
  bgDefaults?: { bgType?: string; bgFrom?: string; bgTo?: string };
  containerClassName?: string;
}) {
  const { hasBleedBg, style } = sectionBgStyle(section.fields, bgDefaults);
  return (
    <SectionTag section={section}
      id={section.customId || undefined}
      className={sectionClassName(hasBleedBg ? `section--${name} section--bg` : `section--${name}`, section)}
      style={style as CSSProperties}
    >
      <div className={`section-container relative z-10 py-[3.125rem] ${containerClassName}`}>{children}</div>
    </SectionTag>
  );
}

// Heading + intro at the top of a section. Renders nothing when both are empty.
export function SectionHeader({ heading, intro, centered = false }: { heading?: string; intro?: string; centered?: boolean }) {
  if (!heading && !intro) return null;
  return (
    <div className="section-row">
      <div className={`section-col flex flex-col gap-2 ${centered ? "items-center text-center" : ""}`}>
        {heading && <h2 className="section-heading text-2xl font-bold text-primary-900 sm:text-3xl">{heading}</h2>}
        {intro && <RichText html={intro} className="text-sm leading-relaxed text-primary-600" />}
      </div>
    </div>
  );
}

export function RichText({ html, className = "" }: { html: string; className?: string }) {
  if (!html) return null;
  return <div className={`rich-text-content ${className}`} dangerouslySetInnerHTML={{ __html: sanitizeRichText(html) }} />;
}
