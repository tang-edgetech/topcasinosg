import { field, sectionClassName, type PageSection } from "@/lib/pages";
import { mediaSizeClassName, mediaAlignClassName } from "./mediaLayout";
import VideoEmbed, { type VideoSource } from "./VideoEmbed";

const YOUTUBE_PATTERNS = [
  /youtube\.com\/watch\?(?:.*&)?v=([\w-]{11})/,
  /youtu\.be\/([\w-]{11})/,
  /youtube\.com\/(?:embed|shorts|live)\/([\w-]{11})/,
];
const VIMEO_PATTERN = /vimeo\.com\/(?:video\/)?(\d+)/;

function parseVideoUrl(url: string): VideoSource | null {
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern);
    if (match) return { provider: "youtube", id: match[1] };
  }
  const vimeo = url.match(VIMEO_PATTERN);
  return vimeo ? { provider: "vimeo", id: vimeo[1] } : null;
}

// YouTube or Vimeo video at 16:9 with an optional caption. Only a thumbnail
// loads with the page; the player loads on click (VideoEmbed), so a page
// with videos stays light.
export default function VideoSection({ section }: { section: PageSection }) {
  const text = (key: string) => field(section.fields, 0, key)?.textValue ?? "";
  const source = parseVideoUrl(text("url"));
  if (!source) return null;

  const caption = text("caption");
  const align = text("align");

  return (
    <section id={section.customId || undefined} className={sectionClassName("section--video", section)}>
      <div className="section-container py-[3.125rem]">
        <div className="section-row">
          <figure className={`video-block section-col flex w-full flex-col gap-2 ${mediaSizeClassName(text("size"))} ${mediaAlignClassName(align)}`}>
            <VideoEmbed source={source} title={text("title") || caption || "Video"} />
            {caption && <figcaption className={`tone-text text-sm ${align === "center" ? "text-center" : align === "right" ? "text-right" : ""}`}>{caption}</figcaption>}
          </figure>
        </div>
      </div>
    </section>
  );
}
