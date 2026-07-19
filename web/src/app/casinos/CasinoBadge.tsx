/**
 * Placeholder brand badge for a casino card/header.
 *
 * CasinoDTO only carries `logoMediaId` (a bare id, no join to the media
 * table), so there's no URL to build a real logo image from here. Falls
 * back to a colored initial-letter badge — same visual idea as
 * admin/src/components/BrandMark.tsx's no-logo fallback.
 */
export default function CasinoBadge({ name, size = 40 }: { name: string; size?: number }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <span
      className="casino-badge flex shrink-0 items-center justify-center rounded-md bg-secondary-600 font-bold text-primary-900"
      style={{ width: size, height: size, fontSize: size * 0.45 }}
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}
