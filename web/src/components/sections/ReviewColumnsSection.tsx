import type { CSSProperties } from "react";
import { field, itemIndexes, mediaUrl, sectionClassName, sectionBgStyle, type PageSection } from "@/lib/pages";
import SwipeRow from "@/components/SwipeRow";
import SectionTag from "./SectionTag";

interface Review {
  itemIndex: number;
  name: string;
  timeAgo: string;
  quote: string;
  avatar: string | null;
}

// Figma "Real Reviews from Thai Players": admin-authored player quotes in
// two groups - "Positive Feedback Highlights" (green cards, 2 columns) and
// "Common Complaints & How They Were Resolved" (red cards, 1 column). Each
// item's `column` field ("positive" | "complaint") picks its group. On
// mobile each group becomes a swipeable row.
export default function ReviewColumnsSection({ section }: { section: PageSection }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const positiveLabel = field(section.fields, 0, "positiveLabel")?.textValue || "Positive Feedback Highlights";
  const complaintLabel = field(section.fields, 0, "complaintLabel")?.textValue || "Common Complaints & How They Were Resolved";
  const { hasBleedBg, style: bgStyle } = sectionBgStyle(section.fields, { bgType: "color", bgFrom: "surface-muted" });

  const positive: Review[] = [];
  const complaints: Review[] = [];
  for (const itemIndex of itemIndexes(section.fields)) {
    const review: Review = {
      itemIndex,
      name: field(section.fields, itemIndex, "name")?.textValue ?? "",
      timeAgo: field(section.fields, itemIndex, "timeAgo")?.textValue ?? "",
      quote: field(section.fields, itemIndex, "quote")?.textValue ?? "",
      avatar: mediaUrl(field(section.fields, itemIndex, "avatar")?.mediaUrl),
    };
    if (!review.quote) continue;
    (field(section.fields, itemIndex, "column")?.textValue === "complaint" ? complaints : positive).push(review);
  }

  if (positive.length === 0 && complaints.length === 0) return null;

  return (
    <SectionTag section={section}
      id={section.customId || undefined}
      className={sectionClassName(hasBleedBg ? "section--review-columns section--bg" : "section--review-columns", section)}
      style={bgStyle as CSSProperties}
    >
      <div className="section-container relative z-10 flex flex-col gap-6 py-[3.125rem]">
        {heading && (
          <div className="section-row">
            <h2 className="section-heading section-col text-3xl font-bold text-primary-900">{heading}</h2>
          </div>
        )}
        <div className="section-row grid grid-cols-1 gap-6 md:grid-cols-3">
          {positive.length > 0 && (
            <ReviewGroup label={positiveLabel} tone="positive" reviews={positive} className="md:col-span-2" gridColumns={2} />
          )}
          {complaints.length > 0 && <ReviewGroup label={complaintLabel} tone="complaint" reviews={complaints} gridColumns={1} />}
        </div>
      </div>
    </SectionTag>
  );
}

function ReviewGroup({
  label,
  tone,
  reviews,
  className = "",
  gridColumns,
}: {
  label: string;
  tone: "positive" | "complaint";
  reviews: Review[];
  className?: string;
  gridColumns: number;
}) {
  const positive = tone === "positive";
  return (
    <div className={`review-group flex min-w-0 flex-col gap-3 ${className}`}>
      <h3 className="flex items-start gap-2 text-base font-semibold text-primary-900">
        <span aria-hidden="true" className={`text-xl leading-none ${positive ? "text-success" : "text-danger"}`}>
          {positive ? "✓" : "✕"}
        </span>
        <span>{label}</span>
      </h3>
      <SwipeRow label={label} className="review-group__track w-full pb-1" slideClassName="w-[70%]" gap={12} gridFrom="md" gridColumns={gridColumns}>
        {reviews.map((review) => (
          <article
            key={review.itemIndex}
            className="review-card flex flex-col overflow-hidden rounded-lg border border-primary-100 bg-white"
          >
            <div className="flex items-center gap-3 px-3 py-3">
              {review.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={review.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <span aria-hidden="true" className="h-9 w-9 shrink-0 rounded-full bg-primary-50" />
              )}
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold text-primary-900">{review.name}</span>
                {review.timeAgo && <span className="text-xs text-primary-500">{review.timeAgo}</span>}
              </div>
            </div>
            <p className={`flex-1 px-3 py-3 text-sm ${positive ? "bg-success-subtle text-success" : "bg-danger/10 text-danger"}`}>
              {review.quote}
            </p>
          </article>
        ))}
      </SwipeRow>
    </div>
  );
}
