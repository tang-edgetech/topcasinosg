import type { PageSection } from "@/lib/pages";
import HeroSection from "./HeroSection";
import RichTextSection from "./RichTextSection";
import IconBoxGroupSection from "./IconBoxGroupSection";
import ImageGallerySection from "./ImageGallerySection";
import CTASection from "./CTASection";
import LogoStripSection from "./LogoStripSection";
import StatsCounterSection from "./StatsCounterSection";
import FaqSection from "./FaqSection";
import BonusCalculatorSection from "./BonusCalculatorSection";
import BonusListingTableSection from "./BonusListingTableSection";
import TeamGridSection from "./TeamGridSection";
import TopCasinosByRegionSection from "./TopCasinosByRegionSection";
import BlacklistPreviewSection from "./BlacklistPreviewSection";
import ContentCarouselSection from "./ContentCarouselSection";
import RegionExplorerSection from "./RegionExplorerSection";

// Dispatches each section to its block-type component. Every instance of a
// given blockType gets the same canonical CSS class (see sectionClassName /
// shared/theme/sections.css) regardless of which page it's on — the admin's
// optional customClass/customId only ever layers on top, it never replaces
// the canonical look.
export default function SectionRenderer({ sections }: { sections: PageSection[] }) {
  const ordered = sections.slice().sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      {ordered.map((section) => {
        switch (section.blockType) {
          case "hero":
            return <HeroSection key={section.id} section={section} />;
          case "rich_text":
            return <RichTextSection key={section.id} section={section} />;
          case "icon_box_group":
            return <IconBoxGroupSection key={section.id} section={section} />;
          case "image_gallery":
            return <ImageGallerySection key={section.id} section={section} />;
          case "cta":
            return <CTASection key={section.id} section={section} />;
          case "logo_strip":
            return <LogoStripSection key={section.id} section={section} />;
          case "stats_counter":
            return <StatsCounterSection key={section.id} section={section} />;
          case "faq":
            return <FaqSection key={section.id} section={section} />;
          case "bonus_calculator":
            return <BonusCalculatorSection key={section.id} section={section} />;
          case "bonus_listing_table":
            return <BonusListingTableSection key={section.id} section={section} />;
          case "team_grid":
            return <TeamGridSection key={section.id} section={section} />;
          case "top_casinos_by_region":
            return <TopCasinosByRegionSection key={section.id} section={section} />;
          case "blacklist_preview":
            return <BlacklistPreviewSection key={section.id} section={section} />;
          case "content_carousel":
            return <ContentCarouselSection key={section.id} section={section} />;
          case "region_explorer":
            return <RegionExplorerSection key={section.id} section={section} />;
          default:
            return null;
        }
      })}
    </>
  );
}
