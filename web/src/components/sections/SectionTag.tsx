import type { HTMLAttributes } from "react";
import type { PageSection } from "@/lib/pages";
import { sectionBox } from "@/lib/sectionStyle";

// The root element of every page section: a <section> at the top level of the
// page, or a <div> when it is placed inside a Container (section.nested), so
// the HTML never has a <section> inside a <section>. Classes and styling are
// the same either way. It also applies the section's Style tab settings
// (padding, margin, background, font, border: lib/sectionStyle.ts), on top
// of the component's own classes and style.
export default function SectionTag({ section, className, style, ...props }: { section: PageSection } & HTMLAttributes<HTMLElement>) {
  const Tag = section.nested ? "div" : "section";
  const box = sectionBox(section.fields, section.blockType);
  return (
    <Tag
      {...props}
      className={box.className ? [className, box.className].filter(Boolean).join(" ") : className}
      style={Object.keys(box.style).length ? { ...style, ...box.style } : style}
    />
  );
}
