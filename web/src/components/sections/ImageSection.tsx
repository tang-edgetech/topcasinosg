import Link from "next/link";
import { field, mediaUrl, sectionClassName, type PageSection } from "@/lib/pages";
import { mediaSizeClassName, mediaAlignClassName } from "./mediaLayout";

// Basic image: optional link, caption, size preset (full / 800 / 560 /
// 360px), alignment and rounded corners. Meant for Containers (beside text in
// a grid column) but works on its own too.
export default function ImageSection({ section }: { section: PageSection }) {
  const text = (key: string) => field(section.fields, 0, key)?.textValue ?? "";
  const src = mediaUrl(field(section.fields, 0, "image")?.mediaUrl);
  if (!src) return null;

  const caption = text("caption");
  const linkUrl = text("linkUrl");
  const rounded = text("rounded") !== "no";
  const align = text("align");
  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img loading="lazy" decoding="async" src={src} alt={text("alt")} className={`block h-auto w-full ${rounded ? "rounded-lg" : ""}`} />
  );

  return (
    <section id={section.customId || undefined} className={sectionClassName("section--image", section)}>
      <div className="section-container py-[3.125rem]">
        <div className="section-row">
          <figure className={`image-block section-col flex w-full flex-col gap-2 ${mediaSizeClassName(text("size"))} ${mediaAlignClassName(align)}`}>
            {linkUrl ? (
              <Link href={linkUrl} className="block cursor-pointer transition-opacity hover:opacity-90">
                {image}
              </Link>
            ) : (
              image
            )}
            {caption && <figcaption className={`tone-text text-sm ${align === "center" ? "text-center" : align === "right" ? "text-right" : ""}`}>{caption}</figcaption>}
          </figure>
        </div>
      </div>
    </section>
  );
}
