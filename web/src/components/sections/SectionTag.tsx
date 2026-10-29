import type { HTMLAttributes } from "react";
import type { PageSection } from "@/lib/pages";

// The root element of every page section: a <section> at the top level of the
// page, or a <div> when it is placed inside a Container (section.nested), so
// the HTML never has a <section> inside a <section>. Classes and styling are
// the same either way.
export default function SectionTag({ section, ...props }: { section: PageSection } & HTMLAttributes<HTMLElement>) {
  const Tag = section.nested ? "div" : "section";
  return <Tag {...props} />;
}
