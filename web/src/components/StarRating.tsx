const STAR_COUNT = 5;
const STAR_PATH = "M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z";

// Five stars with fractional fill; `rating` is out of 5 (callers showing a
// /10 score pass score / 2). The per-star fill width is the one inline style
// here because it's data-driven, not a fixed design value.
export default function StarRating({ rating, size = "h-4 w-4" }: { rating: number; size?: string }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating.toFixed(1)} out of ${STAR_COUNT}`}>
      {Array.from({ length: STAR_COUNT }, (_, i) => {
        const fill = Math.max(0, Math.min(1, rating - i));
        return (
          <span key={i} className={`relative inline-block ${size}`}>
            <svg viewBox="0 0 20 20" className={`absolute inset-0 ${size} text-primary-100`} fill="currentColor" aria-hidden="true">
              <path d={STAR_PATH} />
            </svg>
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <svg viewBox="0 0 20 20" className={`${size} text-star`} fill="currentColor" aria-hidden="true">
                <path d={STAR_PATH} />
              </svg>
            </span>
          </span>
        );
      })}
    </div>
  );
}
