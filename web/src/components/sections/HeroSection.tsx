import Link from "next/link";
import { field, mediaUrl, sectionClassName, buttonClassName, type PageSection } from "@/lib/pages";

export default function HeroSection({ section }: { section: PageSection }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const subheading = field(section.fields, 0, "subheading")?.textValue ?? "";
  const image = mediaUrl(field(section.fields, 0, "image")?.mediaUrl);
  const button = field(section.fields, 0, "button");
  const buttonStyle = field(section.fields, 0, "buttonStyle")?.textValue;

  const sectionClasses = [sectionClassName("section--hero", section), "relative", image && "has-hero-image"]
    .filter(Boolean)
    .join(" ");

  return (
    <section id={section.customId || undefined} className={sectionClasses}>
      {/* section > container > row > column(s), matching the same nesting
          every section follows. Columns default to grid's stretch alignment
          (no items-center override) so the image column gets a real,
          non-zero height to position against — see .hero__image-col below. */}
      <div className="section-container py-20">
        <div className="section-row grid gap-6 lg:grid-cols-2 lg:gap-10">
          <div className="section-col flex flex-col items-start gap-6">
            {heading && <h1 className="section-heading text-4xl font-bold tracking-tight text-white sm:text-5xl">{heading}</h1>}
            {subheading && <p className="max-w-2xl text-lg text-primary-100">{subheading}</p>}
            {button?.textValue && button.urlValue && (
              <Link href={button.urlValue} className={buttonClassName(buttonStyle)}>
                {button.textValue}
              </Link>
            )}
          </div>
          {image && (
            // This column is the relative item: it stretches to the row's
            // height (grid's default align-items) purely so the next layer
            // down has a real box to position against.
            <div className="hero__image-col section-col relative hidden lg:block">
              {/* Wraps the image and is the one actually pulled up by half
                  its own height — the standard "half in, half out" overlap
                  idiom — so it hangs 50% into whichever section follows.
                  The section must never clip overflow for this to show. */}
              <div className="hero__image-float pointer-events-none absolute inset-x-0 top-full z-10 -translate-y-1/2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt={heading} className="h-auto w-full rounded-xl object-cover shadow-xl" />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
