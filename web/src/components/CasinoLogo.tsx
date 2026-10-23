import { mediaUrl } from "@/lib/pages";

// A casino's (or provider's/license's) logo, or the neutral checkerboard
// placeholder the design uses until one is uploaded. One component so every
// card, table row and logo grid shows the same fallback. className sets the
// box size, e.g. "h-8 w-16".
export default function CasinoLogo({ src, name, className = "h-8 w-16" }: { src: string | null | undefined; name: string; className?: string }) {
  const url = mediaUrl(src);
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img loading="lazy" decoding="async" src={url} alt={name} title={name} className={`${className} object-contain`} />;
  }
  return (
    <span
      role="img"
      aria-label={name}
      title={name}
      className={`${className} inline-block shrink-0 rounded bg-[repeating-conic-gradient(#e5e7eb_0%_25%,transparent_0%_50%)] bg-[length:10px_10px]`}
    />
  );
}
