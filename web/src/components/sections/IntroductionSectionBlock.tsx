import { field, itemIndexes, type PageSection } from "@/lib/pages";
import IntroductionSection from "@/components/IntroductionSection";

export default function IntroductionSectionBlock({ section }: { section: PageSection }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const highlightText = field(section.fields, 0, "highlightText")?.textValue ?? "";
  const subheading = field(section.fields, 0, "subheading")?.textValue ?? "";
  const paragraph = field(section.fields, 0, "paragraph")?.textValue ?? "";
  const theme = (field(section.fields, 0, "theme")?.textValue || "blue") as "blue" | "red";

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
      theme={theme}
      pageMenu={pageMenu}
    />
  );
}
