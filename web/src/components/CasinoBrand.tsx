import Link from "next/link";
import CasinoLogo from "./CasinoLogo";

// Logo + name linking to the casino's review page — the "Brand" cell of
// every casino and bonus table and card. layout "stack" puts the name under
// the logo (table cells), "row" beside it (cards, lists).
export default function CasinoBrand({
  casino,
  layout = "stack",
  logoClassName = "h-8 w-16",
}: {
  casino: { slug: string; name: string; logoUrl: string | null };
  layout?: "stack" | "row";
  logoClassName?: string;
}) {
  return (
    <Link
      href={`/casinos/${casino.slug}`}
      className={`flex cursor-pointer items-center text-primary-900 hover:text-secondary-700 ${layout === "stack" ? "flex-col gap-1 text-center" : "gap-3"}`}
    >
      <CasinoLogo src={casino.logoUrl} name={casino.name} className={logoClassName} />
      <span className={layout === "stack" ? "text-xs" : "text-sm font-semibold"}>{casino.name}</span>
    </Link>
  );
}
