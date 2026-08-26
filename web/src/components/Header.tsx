"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import HeaderLogo from "./HeaderLogo";
import MegaMenu, { type MegaMenuColumn, type MegaMenuLink } from "./MegaMenu";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";

type RegionDTO = {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
};

type CasinoDTO = {
  id: number;
  slug: string;
  name: string;
};

// Mirrors api/internal/handler/menu_item_handler.go's MenuNodeDTO — the
// header's tabs/columns/links are all admin-editable now (see
// /dashboard/navigation), not hardcoded here.
type MenuNode = {
  id: number;
  label: string;
  href: string | null;
  sourceType: "static" | "dynamic_regions" | "dynamic_casinos";
  children: MenuNode[];
};

type NavTab = {
  id: string;
  label: string;
  columns: MegaMenuColumn[];
  footerLink?: MegaMenuLink;
};

// Turns one fetched header tab (a MenuNode with no href) into the shape
// MegaMenu already renders: children with an href become a single trailing
// "view all" style link, children without an href become columns whose
// links are either their own static children or a live regions/casinos
// fetch when the column's sourceType says so.
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

function ChevronDownIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={`site-header__chevron h-3.5 w-3.5 shrink-0 text-secondary-600 transition-transform duration-150 ${className}`}
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.19l3.71-3.96a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="site-header__hamburger-icon h-6 w-6"
    >
      {open ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
      )}
    </svg>
  );
}

/**
 * Public site header: gradient bar, logo, and a nav where each tab opens a
 * white mega-menu flyout on hover (desktop, >=1024px) or expands as an
 * accordion inside a slide-down panel behind a hamburger button (mobile).
 *
 * The whole tab/column/link tree is admin-editable (see
 * admin's /dashboard/navigation, backed by GET /api/menus?location=header)
 * rather than hardcoded here. A column can also be marked "dynamic" in the
 * admin UI, in which case its links are populated from a live regions or
 * casinos fetch instead of admin-typed static links — see tabToNavTab.
 * All three fetches are client-side on mount, so a clean production build
 * never depends on the API being reachable at build time.
 */
export default function Header() {
  const [regions, setRegions] = useState<RegionDTO[]>([]);
  const [casinos, setCasinos] = useState<CasinoDTO[]>([]);
  const [menuTabs, setMenuTabs] = useState<MenuNode[]>([]);
  const [openTab, setOpenTab] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_URL}/api/regions`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("failed to load regions"))))
      .then((body: { data?: { regions?: RegionDTO[] } }) => {
        if (cancelled) return;
        const active = (body.data?.regions ?? []).filter((r) => r.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
        setRegions(active);
      })
      .catch(() => {
        if (!cancelled) setRegions([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_URL}/api/casinos`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("failed to load casinos"))))
      .then((body: { data?: { casinos?: CasinoDTO[] } }) => {
        if (!cancelled) setCasinos(body.data?.casinos ?? []);
      })
      .catch(() => {
        if (!cancelled) setCasinos([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_URL}/api/menus?location=header`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("failed to load header menu"))))
      .then((body: { data?: { items?: MenuNode[] } }) => {
        if (!cancelled) setMenuTabs(body.data?.items ?? []);
      })
      .catch(() => {
        if (!cancelled) setMenuTabs([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const closeMenus = () => {
    setOpenTab(null);
    setMobileOpen(false);
    setMobileAccordion(null);
  };

  const navTabs: NavTab[] = menuTabs.map((tab) => tabToNavTab(tab, regions, casinos));

  return (
    <header
      id="site-header"
      className="site-header relative z-50 w-full bg-gradient-to-r from-primary-900 to-primary-glow"
    >
      <div className="site-header__bar page-container flex items-center justify-between gap-4 py-3">
        <Link
          href="/"
          className="site-header__logo-link flex cursor-pointer items-center gap-2"
          onClick={closeMenus}
          title="Top Casino SG home"
        >
          <HeaderLogo />
        </Link>

        {/* Desktop nav — hover mega-menus, >=1024px */}
        <nav id="site-header-nav" className="site-header__nav hidden items-center gap-1 lg:flex" aria-label="Primary">
          {navTabs.map((tab) => (
            <div
              key={tab.id}
              id={`site-header-tab-${tab.id}`}
              className="site-header__tab-wrapper relative"
              onMouseEnter={() => setOpenTab(tab.id)}
              onMouseLeave={() => setOpenTab((current) => (current === tab.id ? null : current))}
            >
              <button
                type="button"
                className="site-header__tab flex cursor-pointer items-center gap-1 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap text-white transition-colors hover:bg-white/10"
                aria-haspopup="true"
                aria-expanded={openTab === tab.id}
                title={tab.label}
              >
                {tab.label}
                <ChevronDownIcon className={openTab === tab.id ? "rotate-180" : ""} />
              </button>

              {openTab === tab.id && (
                <MegaMenu columns={tab.columns} footerLink={tab.footerLink} onNavigate={closeMenus} />
              )}
            </div>
          ))}
        </nav>

        {/* Hamburger — <1024px */}
        <button
          type="button"
          id="site-header-hamburger"
          title={mobileOpen ? "Close menu" : "Open menu"}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="site-header-mobile-nav"
          className="site-header__hamburger flex cursor-pointer items-center justify-center rounded-md p-2 text-white lg:hidden"
          onClick={() => setMobileOpen((value) => !value)}
        >
          <HamburgerIcon open={mobileOpen} />
        </button>
      </div>

      {/* Mobile nav panel — tap-to-expand accordion sections */}
      {mobileOpen && (
        <div
          id="site-header-mobile-nav"
          className="site-header__mobile-nav max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-white/10 bg-primary-900 lg:hidden"
        >
          <ul className="site-header__mobile-list flex flex-col divide-y divide-white/10">
            {navTabs.map((tab) => {
              const expanded = mobileAccordion === tab.id;
              return (
                <li key={tab.id} id={`site-header-mobile-item-${tab.id}`} className="site-header__mobile-item">
                  <button
                    type="button"
                    className="site-header__mobile-tab flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left text-sm font-medium text-white"
                    onClick={() => setMobileAccordion((current) => (current === tab.id ? null : tab.id))}
                    aria-expanded={expanded}
                    title={tab.label}
                  >
                    {tab.label}
                    <ChevronDownIcon className={expanded ? "rotate-180" : ""} />
                  </button>

                  {expanded && (
                    <div className="site-header__mobile-panel bg-white px-4 py-3">
                      {tab.columns.map((column) => (
                        <div key={column.heading} className="site-header__mobile-column mb-3 last:mb-0">
                          <div className="mb-1 text-xs font-semibold tracking-wide text-primary-900 uppercase">
                            {column.heading}
                          </div>
                          <ul className="flex flex-col gap-1.5">
                            {column.links.length === 0 ? (
                              <li className="text-xs text-primary-500">Coming soon</li>
                            ) : (
                              column.links.map((link) => (
                                <li key={`${tab.id}-${column.heading}-${link.href}`}>
                                  <Link
                                    href={link.href}
                                    onClick={closeMenus}
                                    className="site-header__mobile-link cursor-pointer text-sm text-primary-600 hover:text-primary-900"
                                  >
                                    {link.label}
                                  </Link>
                                </li>
                              ))
                            )}
                          </ul>
                        </div>
                      ))}

                      {tab.footerLink && (
                        <Link
                          href={tab.footerLink.href}
                          onClick={closeMenus}
                          className="site-header__mobile-footer-link mt-2 inline-block cursor-pointer text-sm font-semibold text-primary-900"
                        >
                          {tab.footerLink.label}
                        </Link>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </header>
  );
}
