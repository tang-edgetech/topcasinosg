// Colour and rating-icon settings for the casino cards in Top Bonus Picks and
// Top Casinos By Region (BonusPickCard). Stored on the block (itemIndex 0);
// admin: BlockFields.tsx CardStyleFields; API docs: block_docs.go
// cardStyleFields. Colours are a theme token name ("secondary-50") or #hex;
// an empty one keeps the card's built-in colour, which differs between the
// highlighted #1 card and the rest.
import type { RatingIconStyle } from "@/components/RatingIcons";
import { field, mediaUrl, type PageSectionField } from "./pages";
import { cssColor } from "./sectionStyle";

export interface CardStyle {
  cardBg?: string;
  cardBorder?: string;
  ribbon?: string;
  offerBg?: string;
  offerText?: string;
  footerBg?: string;
  ctaBg?: string;
  ctaText?: string;
  rating: RatingIconStyle;
}

export function cardStyle(fields: PageSectionField[]): CardStyle {
  const text = (key: string) => field(fields, 0, key)?.textValue ?? "";
  const image = (key: string) => mediaUrl(field(fields, 0, key)?.mediaUrl);
  const icon = text("ratingIcon");
  return {
    cardBg: cssColor(text("cardBg")),
    cardBorder: cssColor(text("cardBorder")),
    ribbon: cssColor(text("ribbonColor")),
    offerBg: cssColor(text("offerBg")),
    offerText: cssColor(text("offerText")),
    footerBg: cssColor(text("footerBg")),
    ctaBg: cssColor(text("ctaBg")),
    ctaText: cssColor(text("ctaText")),
    rating:
      icon === "ingot" || icon === "custom"
        ? { icon, full: image("ratingFull"), half: image("ratingHalf"), empty: image("ratingEmpty") }
        : { icon: "stars" },
  };
}
