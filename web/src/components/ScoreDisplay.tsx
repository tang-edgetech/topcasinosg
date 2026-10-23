import StarRating from "./StarRating";

// A casino score shown out of 10 ("9.2/10") with stars underneath.
// Casino.rating is stored out of 5, so callers pass it as-is and this
// doubles it; outOf10 is for values already on a 10-point scale (blacklist).
export default function ScoreDisplay({
  rating,
  outOf10 = false,
  stars = true,
  size = "md",
  className = "text-primary-900",
}: {
  rating: number;
  outOf10?: boolean;
  stars?: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  const score = Math.min(outOf10 ? rating : rating * 2, 10);
  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <p>
        <span className={size === "sm" ? "text-sm font-bold" : "text-2xl font-bold"}>{score.toFixed(1)}</span>
        <span className="text-xs">/10</span>
      </p>
      {stars && <StarRating rating={score / 2} size="h-3.5 w-3.5" />}
    </div>
  );
}
