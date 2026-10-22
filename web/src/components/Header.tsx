import HeaderNav, { type NavTab } from "./HeaderNav";
import type { MegaMenuColumn, MegaMenuLink } from "./MegaMenu";
import { getSiteSettings } from "@/lib/site-settings";
import { mediaUrl } from "@/lib/pages";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";
const REVALIDATE_SECONDS = 60;

type RegionDTO = { id: number; code: string; name: string; isActive: boolean; sortOrder: number };
type CasinoDTO = { id: number; slug: string; name: string };

// Mirrors api/internal/handler/menu_item_handler.go's MenuNodeDTO — the
// header's tabs/columns/links are admin-editable (see /dashboard/navigation).
type MenuNode = {
  id: number;
  label: string;
  href: string | null;
  sourceType: "static" | "dynamic_regions" | "dynamic_casinos";
  children: MenuNode[];
};

async function fetchData<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) return null;
    return ((await res.json()) as { data?: T }).data ?? null;
  } catch {
    // API briefly unreachable — render the header without that data rather
    // than failing the page.
    return null;
  }
}

// Turns one header tab (a MenuNode with no href) into the shape MegaMenu
// renders: children with an href become a trailing "view all" link,
// children without one become columns whose links are their own static
// children or live regions/casinos when the column's sourceType says so.
function tabToNavTab(tab: MenuNode, regions: RegionDTO[], casinos: CasinoDTO[]): NavTab {
  const columns: MegaMenuColumn[] = [];
  let footerLink: MegaMenuLink | undefined;

  for (const child of tab.children) {
    if (child.href) {
      if (!footerLink) footerLink = { label: child.label, href: child.href };
      continue;
    }
    const links: MegaMenuLink[] =
      child.sourceType === "dynamic_regions"
        ? regions.map((r) => ({ label: r.name, href: `/${r.code}` }))
        : child.sourceType === "dynamic_casinos"
          ? casinos.map((c) => ({ label: c.name, href: `/casinos/${c.slug}` }))
          : child.children.map((link) => ({ label: link.label, href: link.href ?? "#" }));
    columns.push({ heading: child.label, links });
  }

  return { id: String(tab.id), label: tab.label, columns, footerLink };
}

/**
 * Public site header. Menu, regions, casinos and logo are fetched on the
 * server (deduped/cached by Next for REVALIDATE_SECONDS), so the nav is in
 * the initial HTML for SEO and there's no client-side fetch waterfall on
 * every page view; HeaderNav only handles hover/hamburger state.
 */
export default async function Header() {
  const [regionsData, casinosData, menuData, settings] = await Promise.all([
    fetchData<{ regions?: RegionDTO[] }>("/api/regions"),
    fetchData<{ casinos?: CasinoDTO[] }>("/api/casinos"),
    fetchData<{ items?: MenuNode[] }>("/api/menus?location=header"),
    getSiteSettings(),
  ]);

  const regions = (regionsData?.regions ?? []).filter((r) => r.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  const casinos = casinosData?.casinos ?? [];
  const navTabs = (menuData?.items ?? []).map((tab) => tabToNavTab(tab, regions, casinos));
  const logoSrc = mediaUrl(settings.logoUrl);

  const logo = logoSrc ? (
    // eslint-disable-next-line @next/next/no-img-element -- uploaded logo, dimensions unknown ahead of time
    <img id="site-header-logo-img" src={logoSrc} alt={settings.siteTitle} className="site-header__logo h-9 w-auto object-contain" />
  ) : (
    <span id="site-header-logo-text" className="site-header__logo-text text-lg font-bold text-white">
      {settings.siteTitle}
    </span>
  );

  return <HeaderNav navTabs={navTabs} logo={logo} />;
}
