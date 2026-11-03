import { field, mediaUrl, sectionClassName, type PageSection } from "@/lib/pages";
import { WIDGET_CONTAINER } from "@/lib/widgets";
import StarRating from "@/components/StarRating";
import SectionTag from "./SectionTag";

// Testimonial widget: a quote with the person's name, role and photo, and
// optionally their star rating, e.g. a player review.
export default function TestimonialWidget({ section }: { section: PageSection }) {
  const text = (key: string) => field(section.fields, 0, key)?.textValue ?? "";
  const quote = text("quote");
  if (!quote) return null;
  const photo = mediaUrl(field(section.fields, 0, "photo")?.mediaUrl);
  const rating = parseFloat(text("rating"));
  const centered = text("align") === "center";

  return (
    <SectionTag section={section} id={section.customId || undefined} className={sectionClassName("section--testimonial", section)}>
      <div className={WIDGET_CONTAINER}>
        <figure className={`widget-testimonial flex flex-col gap-4 ${centered ? "items-center text-center" : ""}`}>
          <span aria-hidden="true" className="font-serif text-6xl leading-none text-secondary-600">
            &ldquo;
          </span>
          <blockquote className="tone-heading -mt-6 text-lg leading-relaxed whitespace-pre-line">{quote}</blockquote>
          {rating > 0 && <StarRating rating={Math.min(5, rating)} />}
          <figcaption className="flex items-center gap-3">
            {photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt="" loading="lazy" decoding="async" className="h-12 w-12 rounded-full object-cover" />
            )}
            <span className="flex flex-col text-left">
              {text("name") && <span className="tone-heading font-bold">{text("name")}</span>}
              {text("role") && <span className="tone-text text-sm">{text("role")}</span>}
            </span>
          </figcaption>
        </figure>
      </div>
    </SectionTag>
  );
}
