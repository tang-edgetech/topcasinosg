import { field, itemIndexes, sectionBgColorValue, type PageSection } from "@/lib/pages";
import IntroductionSection from "@/components/IntroductionSection";

export default function IntroductionSectionBlock({ section }: { section: PageSection }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const highlightText = field(section.fields, 0, "highlightText")?.textValue ?? "";
  const subheading = field(section.fields, 0, "subheading")?.textValue ?? "";
  const paragraph = field(section.fields, 0, "paragraph")?.textValue ?? "";
  const bgFrom = sectionBgColorValue(field(section.fields, 0, "bgFrom")?.textValue || "primary-900");
  const bgTo = sectionBgColorValue(field(section.fields, 0, "bgTo")?.textValue || "primary-glow");

  const pageMenu = itemIndexes(section.fields)
    .map((itemIndex) => ({
      label: field(section.fields, itemIndex, "label")?.textValue ?? "",
      url: field(section.fields, itemIndex, "url")?.textValue ?? "",
    }))
    .filter((item) => item.label && item.url);

  return (
    <IntroductionSection
      heading={heading}
      highlightText={highlightText}
      subheading={subheading}
      paragraph={paragraph}
      bgFrom={bgFrom}
      bgTo={bgTo}
      pageMenu={pageMenu}
    />
  );
}
