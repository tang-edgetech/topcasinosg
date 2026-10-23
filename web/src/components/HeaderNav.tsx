"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import MegaMenu, { type MegaMenuColumn, type MegaMenuLink } from "./MegaMenu";

export type NavTab = {
  id: string;
  label: string;
  columns: MegaMenuColumn[];
  footerLink?: MegaMenuLink;
};

// Figma "Comp / Header": solid gold triangle after each tab label.
function CaretIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 10 8"
      fill="currentColor"
      className={`site-header__caret h-2 w-2.5 shrink-0 text-secondary-500 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
    >
      <path d="M0 0h10L5 8z" />
    </svg>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="site-header__hamburger-icon h-6 w-6">
      {open ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
      )}
    </svg>
  );
}

/**
 * Interactive half of the site header: hover mega-menus on desktop
 * (>=1024px) and a hamburger-toggled accordion panel on mobile. The tab tree
 * and logo are resolved on the server (see Header.tsx) and passed in, so the
 * nav links are in the initial HTML and this component only holds UI state.
 */
export default function HeaderNav({ navTabs, logo }: { navTabs: NavTab[]; logo: ReactNode }) {
  const [openTab, setOpenTab] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);

  const closeMenus = () => {
    setOpenTab(null);
    setMobileOpen(false);
    setMobileAccordion(null);
  };

  return (
    <header id="site-header" className="site-header relative z-50 w-full bg-gradient-to-r from-primary-900 to-primary-glow">
      <div className="site-header__bar page-container flex items-center justify-between gap-4 py-3">
        <Link href="/" className="site-header__logo-link flex cursor-pointer items-center gap-2" onClick={closeMenus} title="Home">
          {logo}
        </Link>

        <nav id="site-header-nav" className="site-header__nav hidden items-center gap-1 lg:flex" aria-label="Primary">
          {navTabs.map((tab, index) => (
            <div
              key={tab.id}
              id={`site-header-tab-${tab.id}`}
              className="site-header__tab-wrapper relative"
              onMouseEnter={() => setOpenTab(tab.id)}
              onMouseLeave={() => setOpenTab((current) => (current === tab.id ? null : current))}
            >
              <button
                type="button"
                className="site-header__tab flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-base whitespace-nowrap text-white transition-colors hover:bg-white/10"
                aria-haspopup="true"
                aria-expanded={openTab === tab.id}
                onFocus={() => setOpenTab(tab.id)}
              >
                {tab.label}
                <CaretIcon open={openTab === tab.id} />
              </button>

              {openTab === tab.id && (
                <MegaMenu
                  columns={tab.columns}
                  footerLink={tab.footerLink}
                  onNavigate={closeMenus}
                  alignRight={index === navTabs.length - 1}
                />
              )}
            </div>
          ))}
        </nav>

        <button
          type="button"
          id="site-header-hamburger"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="site-header-mobile-nav"
          className="site-header__hamburger flex cursor-pointer items-center justify-center rounded-md p-2 text-white lg:hidden"
          onClick={() => setMobileOpen((value) => !value)}
        >
          <HamburgerIcon open={mobileOpen} />
        </button>
      </div>

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
                  >
                    {tab.label}
                    <CaretIcon open={expanded} />
                  </button>

                  {expanded && (
                    <div className="site-header__mobile-panel bg-white px-4 py-3">
                      {tab.columns.map((column) => (
                        <div key={column.heading} className="site-header__mobile-column mb-3 last:mb-0">
                          <div className="mb-1 text-xs font-semibold tracking-wide text-primary-900 uppercase">{column.heading}</div>
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
