import StarRating from "./StarRating";

// How a rating is drawn: the default stars, the gold ingots (Chinese "yuan
// bao", web/public/rating/ingot-*.png), or the editor's own full / half /
// empty images. Set per block (card blocks' ratingIcon field, see
// lib/cardStyle.ts).
export interface RatingIconStyle {
  icon: "stars" | "ingot" | "custom";
  full?: string | null;
  half?: string | null;
  empty?: string | null;
}

export const STARS: RatingIconStyle = { icon: "stars" };

const COUNT = 5;
const INGOT = { full: "/rating/ingot-full.png", half: "/rating/ingot-half.png", empty: "/rating/ingot-empty.png" };

// rating is out of 5. Image icons round to the nearest half: 4.8 shows five
// full icons, 4.5 four and a half.
export default function RatingIcons({ rating, style = STARS, size = "h-3.5 w-3.5" }: { rating: number; style?: RatingIconStyle; size?: string }) {
  if (style.icon === "stars") return <StarRating rating={rating} size={size} />;
  const images = style.icon === "custom"
    ? { full: style.full || INGOT.full, half: style.half || style.full || INGOT.half, empty: style.empty || INGOT.empty }
    : INGOT;
  const halves = Math.round(Math.max(0, Math.min(COUNT, rating)) * 2);
  return (
    <div className="rating-icons flex gap-0.5" aria-label={`${rating.toFixed(1)} out of ${COUNT}`}>
      {Array.from({ length: COUNT }, (_, i) => {
        const left = halves - i * 2;
        const src = left >= 2 ? images.full : left === 1 ? images.half : images.empty;
        // eslint-disable-next-line @next/next/no-img-element
        return <img key={i} src={src} alt="" aria-hidden="true" className={`${size} object-contain`} />;
      })}
    </div>
  );
}
