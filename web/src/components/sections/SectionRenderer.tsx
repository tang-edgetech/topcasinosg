import { field, type PageSection } from "@/lib/pages";
import { sanitizeRichText } from "@/lib/sanitize-html";
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
import CasinoComparisonTableSection from "./CasinoComparisonTableSection";
import EventHighlightsSection from "./EventHighlightsSection";
import IntroductionSectionBlock from "./IntroductionSectionBlock";
import CasinoListTableSection from "./CasinoListTableSection";
import GameCasinoFinderSection from "./GameCasinoFinderSection";
import ComparisonTableSection from "./ComparisonTableSection";
import NumberedStepsSection from "./NumberedStepsSection";
import FeatureCardsSection from "./FeatureCardsSection";
import ChecklistCalloutSection from "./ChecklistCalloutSection";
import GameRtpCarouselSection from "./GameRtpCarouselSection";
import HighlightPanelSection from "./HighlightPanelSection";
import LinkCardGridSection from "./LinkCardGridSection";
import TopBonusPicksSection from "./TopBonusPicksSection";
import ExpandableCardGridSection from "./ExpandableCardGridSection";
import ReviewColumnsSection from "./ReviewColumnsSection";
import CtaLinkListSection from "./CtaLinkListSection";
import InfoCardColumnsSection from "./InfoCardColumnsSection";

// Dispatches each section to its block-type component. Every instance of a
// given blockType gets the same canonical CSS class (see sectionClassName /
// shared/theme/sections.css) regardless of which page it's on — the admin's
// optional customClass/customId only ever layers on top, it never replaces
// the canonical look. regionCode is the page's own region (region routes
// pass it) — live-data sections fall back to it when their own Region
// field is left blank, so editors don't have to repeat it per section.
export default function SectionRenderer({ sections, regionCode }: { sections: PageSection[]; regionCode?: string }) {
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
            return (
              <BonusCalculatorSection
                key={section.id}
                section={section}
                introHtml={sanitizeRichText(field(section.fields, 0, "intro")?.textValue ?? "")}
              />
            );
          case "bonus_listing_table":
            return <BonusListingTableSection key={section.id} section={section} regionCode={regionCode} />;
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
          case "casino_comparison_table":
            return <CasinoComparisonTableSection key={section.id} section={section} />;
          case "event_highlights":
            return <EventHighlightsSection key={section.id} section={section} />;
          case "introduction_section":
            return <IntroductionSectionBlock key={section.id} section={section} />;
          case "comparison_table":
            return <ComparisonTableSection key={section.id} section={section} regionCode={regionCode} />;
          case "numbered_steps":
            return <NumberedStepsSection key={section.id} section={section} />;
          case "feature_cards":
            return <FeatureCardsSection key={section.id} section={section} />;
          case "checklist_callout":
            return <ChecklistCalloutSection key={section.id} section={section} />;
          case "game_rtp_carousel":
            return <GameRtpCarouselSection key={section.id} section={section} regionCode={regionCode} />;
          case "highlight_panel":
            return <HighlightPanelSection key={section.id} section={section} />;
          case "link_card_grid":
            return <LinkCardGridSection key={section.id} section={section} />;
          case "top_bonus_picks":
            return <TopBonusPicksSection key={section.id} section={section} regionCode={regionCode} />;
          case "expandable_card_grid":
            return <ExpandableCardGridSection key={section.id} section={section} />;
          case "review_columns":
            return <ReviewColumnsSection key={section.id} section={section} />;
          case "cta_link_list":
            return <CtaLinkListSection key={section.id} section={section} />;
          case "casino_list_table":
            return <CasinoListTableSection key={section.id} section={section} regionCode={regionCode} />;
          case "game_casino_finder":
            return <GameCasinoFinderSection key={section.id} section={section} regionCode={regionCode} />;
          case "info_card_columns":
            return <InfoCardColumnsSection key={section.id} section={section} />;
          default:
            return null;
        }
      })}
    </>
  );
}
