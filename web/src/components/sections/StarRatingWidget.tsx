import { field, sectionClassName, type PageSection } from "@/lib/pages";
import { JUSTIFY, WIDGET_CONTAINER } from "@/lib/widgets";
import StarRating from "@/components/StarRating";
import SectionTag from "./SectionTag";

const SIZE: Record<string, string> = { s: "h-4 w-4", m: "h-6 w-6", l: "h-8 w-8" };

// Star Rating widget: 0-5 stars (halves allowed) with the score and an
// optional label next to them, e.g. "4.5 / 5 Overall rating".
export default function StarRatingWidget({ section }: { section: PageSection }) {
  const text = (key: string) => field(section.fields, 0, key)?.textValue ?? "";
  const rating = Math.max(0, Math.min(5, parseFloat(text("rating")) || 0));

  return (
    <SectionTag section={section} id={section.customId || undefined} className={sectionClassName("section--star-rating", section)}>
      <div className={`${WIDGET_CONTAINER} flex flex-wrap items-center gap-3 ${JUSTIFY[text("align")] ?? JUSTIFY.left}`}>
        <StarRating rating={rating} size={SIZE[text("size")] ?? SIZE.m} />
        {text("showScore") !== "no" && <span className="tone-heading font-bold tabular-nums">{rating.toFixed(1)} / 5</span>}
        {text("label") && <span className="tone-text text-sm">{text("label")}</span>}
      </div>
    </SectionTag>
  );
}
