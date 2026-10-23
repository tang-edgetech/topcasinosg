import Link from "next/link";
import type { ReactNode } from "react";

// Every outbound casino/affiliate link: opens in a new tab with the same rel
// everywhere (sponsored, no referrer leak), falling back to the casino's
// review page when no affiliate URL is set. Pass className for the style.
export default function VisitSiteLink({
  href,
  fallbackHref,
  className,
  children = "Visit Site",
}: {
  href: string | null | undefined;
  fallbackHref: string;
  className: string;
  children?: ReactNode;
}) {
  const external = Boolean(href);
  return (
    <Link
      href={href || fallbackHref}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer sponsored" : undefined}
      className={className}
    >
      {children}
    </Link>
  );
}
