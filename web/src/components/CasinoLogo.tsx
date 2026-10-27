import { mediaUrl } from "@/lib/pages";
import { ImagePlaceholder } from "./Thumbnail";

// A casino's (or provider's/license's) logo, or the site's placeholder image
// until one is uploaded. One component so every card, table row and logo
// grid shows the same fallback. className sets the box size, e.g. "h-8 w-16".
export default function CasinoLogo({ src, name, className = "h-8 w-16" }: { src: string | null | undefined; name: string; className?: string }) {
  const url = mediaUrl(src);
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img loading="lazy" decoding="async" src={url} alt={name} title={name} className={`${className} object-contain`} />;
  }
  return <ImagePlaceholder label={name} className={`${className} rounded`} />;
}
