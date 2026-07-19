import Link from "next/link";

/**
 * Footer — Figma "Comp / Footer" (node 31:9901).
 *
 * The column/link tree is admin-editable (see admin's /dashboard/navigation,
 * backed by GET /api/menus?location=footer) rather than hardcoded here. A
 * column marked "dynamic_casinos" in the admin UI has its links replaced
 * with a live casino list instead of admin-typed static links.
 *
 * Rendered as an async Server Component (no "use client") since it only
 * needs one-shot reads on each request and has no client-side interactivity.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";

interface CasinoApiCasino {
  slug: string;
  name: string;
}

interface CasinoApiListResponse {
  data?: {
    casinos?: CasinoApiCasino[];
    total?: number;
  };
}

async function getFooterCasinos(): Promise<CasinoApiCasino[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/casinos?pageSize=100`, {
      // Casino list can change (new reviews, delistings) — keep this short-lived
      // rather than baking it into the static build forever.
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return [];
    }

    const body = (await res.json()) as CasinoApiListResponse;
    return Array.isArray(body.data?.casinos) ? body.data.casinos : [];
  } catch {
    // Public API may be unreachable during static generation (e.g. local build
    // with the Go API not running) — degrade to an empty list rather than
    // failing the whole page/build.
    return [];
  }
}

// Mirrors api/internal/handler/menu_item_handler.go's MenuNodeDTO.
interface MenuNode {
  id: number;
  label: string;
  href: string | null;
  sourceType: "static" | "dynamic_regions" | "dynamic_casinos";
  children: MenuNode[];
}

interface MenuListResponse {
  data?: {
    items?: MenuNode[];
  };
}

async function getFooterMenu(): Promise<MenuNode[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/menus?location=footer`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const body = (await res.json()) as MenuListResponse;
    return Array.isArray(body.data?.items) ? body.data.items : [];
  } catch {
    return [];
  }
}

function slugifyClassName(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface FooterLink {
  label: string;
  href: string;
}

const linkClassName =
  "cursor-pointer text-sm text-primary-100 transition-colors hover:text-secondary-600 hover:underline";

function FooterLinkList({ links }: { links: FooterLink[] }) {
  if (links.length === 0) return null;
  return (
    <ul className="flex flex-col gap-2">
      {links.map((link) => (
        <li key={link.href + link.label}>
          <Link href={link.href} className={linkClassName}>
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default async function Footer() {
  const [casinos, columns] = await Promise.all([getFooterCasinos(), getFooterMenu()]);
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="site-footer"
      className="site-footer bg-gradient-to-r from-primary-900 to-primary-glow text-white"
    >
      <div className="site-footer__main mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 py-16 lg:flex-row lg:gap-8">
        <div className="site-footer__brand flex flex-col gap-4 lg:max-w-xs">
          <span className="site-footer__wordmark text-2xl font-bold text-white">
            Top Casino<span className="text-secondary-600">SG</span>
          </span>
          <p className="site-footer__blurb text-sm text-primary-100">
            Your Review Website for Top 10 Online Casinos, gathering best Singapore Casino,
            award-winning games, attractive casino bonuses with top security. Play today!
          </p>
          <address className="site-footer__address not-italic text-sm text-primary-100">
            Blk 520 Serangoon North Ave 4, 02-180 550520
          </address>
          <Link
            href="mailto:topcasinosingapore@gmail.com"
            className="site-footer__email cursor-pointer text-sm text-primary-100 transition-colors hover:text-secondary-600 hover:underline"
          >
            topcasinosingapore@gmail.com
          </Link>
        </div>

        <div className="site-footer__columns grid flex-1 grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {columns.map((column) => (
            <div key={column.id} className={`site-footer__column site-footer__column--${slugifyClassName(column.label)}`}>
              <h3 className="mb-4 text-sm font-bold text-white">{column.label}</h3>
              {column.sourceType === "dynamic_casinos" ? (
                <FooterLinkList links={casinos.map((casino) => ({ label: casino.name, href: `/casinos/${casino.slug}` }))} />
              ) : (
                <FooterLinkList links={column.children.map((link) => ({ label: link.label, href: link.href ?? "#" }))} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="site-footer__bottom-bar border-t border-white/20">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-primary-100 sm:flex-row">
          <p className="site-footer__copyright">
            Copyright &copy; {currentYear} topcasinosg.com.sg
          </p>
          <p className="site-footer__powered-by">Powered by topcasinosg.com.sg</p>
        </div>
      </div>
    </footer>
  );
}
