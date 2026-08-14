"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface RegionTab {
  label: string;
  suffix: string;
}

const TABS: RegionTab[] = [
  { label: "Overview", suffix: "" },
  { label: "Reviews", suffix: "/reviews" },
  { label: "Bonuses", suffix: "/bonuses" },
  { label: "Payment Methods", suffix: "/payment-methods" },
  { label: "RTP", suffix: "/rtp" },
  { label: "Guides", suffix: "/guides" },
  { label: "Blacklist", suffix: "/blacklist" },
];

/**
 * Region sub-nav rendered once by `[region]/layout.tsx` above `{children}`.
 * Client component only so it can highlight the active tab via `usePathname`.
 */
export default function RegionTabs({ regionCode }: { regionCode: string }) {
  const pathname = usePathname();

  return (
    <nav id="region-tabs" className="region-tabs flex flex-wrap gap-2" aria-label="Region sections">
      {TABS.map((tab) => {
        const href = `/${regionCode}${tab.suffix}`;
        const isActive = pathname === href;

        return (
          <Link
            key={tab.suffix}
            href={href}
            className={`region-tabs__link cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary-900 text-white"
                : "bg-white text-primary-600 hover:bg-primary-100"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
