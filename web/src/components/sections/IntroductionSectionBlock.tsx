import { field, itemIndexes, sectionBgColorValue, type PageSection } from "@/lib/pages";
import IntroductionSection, { type IntroductionPageMenuItem } from "@/components/IntroductionSection";

// fallbackPageMenu is the route's standard menu (e.g. the region page menu)
// used when the editor leaves the section's own Page Menu empty, so most
// pages never need a hand-maintained menu. An authored menu keeps its own
// order; the item linking to currentPath is highlighted.
export default function IntroductionSectionBlock({
  section,
  fallbackPageMenu = [],
  currentPath,
}: {
  section: PageSection;
  fallbackPageMenu?: IntroductionPageMenuItem[];
  currentPath?: string;
}) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const highlightText = field(section.fields, 0, "highlightText")?.textValue ?? "";
  const subheading = field(section.fields, 0, "subheading")?.textValue ?? "";
  const paragraph = field(section.fields, 0, "paragraph")?.textValue ?? "";
  const bgFrom = sectionBgColorValue(field(section.fields, 0, "bgFrom")?.textValue || "primary-900");
  const bgTo = sectionBgColorValue(field(section.fields, 0, "bgTo")?.textValue || "primary-glow");

  const authoredMenu = itemIndexes(section.fields)
    .map((itemIndex) => ({
      label: field(section.fields, itemIndex, "label")?.textValue ?? "",
      url: field(section.fields, itemIndex, "url")?.textValue ?? "",
    }))
    .filter((item) => item.label && item.url)
    .map((item) => ({ ...item, active: item.url === currentPath }));

  return (
    <IntroductionSection
      heading={heading}
      highlightText={highlightText}
      subheading={subheading}
      paragraph={paragraph}
      bgFrom={bgFrom}
      bgTo={bgTo}
      pageMenu={authoredMenu.length > 0 ? authoredMenu : fallbackPageMenu}
    />
  );
}
