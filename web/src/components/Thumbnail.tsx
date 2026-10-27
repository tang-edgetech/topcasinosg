import { mediaUrl } from "@/lib/pages";

// The temporary image shown wherever an image hasn't been chosen or uploaded
// yet (casino logos, covers, card images): a muted box with a picture icon,
// sized by className like the image it stands in for.
export function ImagePlaceholder({ className = "", label }: { className?: string; label?: string }) {
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      title={label}
      className={`image-placeholder flex shrink-0 items-center justify-center overflow-hidden bg-surface-muted text-primary-300 ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="aspect-square h-1/2 max-h-12 min-h-3">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 19.5h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
        />
      </svg>
    </span>
  );
}

// An uploaded image (a media path or full URL), or the placeholder in the
// same box when there is none. className sizes both; imgClassName adds
// image-only classes such as object-contain.
export default function Thumbnail({
  src,
  alt = "",
  className = "",
  imgClassName = "object-cover",
  label,
}: {
  src: string | null | undefined;
  alt?: string;
  className?: string;
  imgClassName?: string;
  // Accessible name for the placeholder (e.g. a casino's name); without one
  // it is decorative.
  label?: string;
}) {
  const url = mediaUrl(src);
  if (!url) return <ImagePlaceholder className={className} label={label} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img loading="lazy" decoding="async" src={url} alt={alt} title={label} className={`${className} ${imgClassName}`} />;
}
