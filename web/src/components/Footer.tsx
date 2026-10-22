import Link from "next/link";
import { getSiteSettings } from "@/lib/site-settings";
import { mediaUrl } from "@/lib/pages";

/**
 * Footer — Figma "Comp / Footer" (desktop, node 31:9901) and its mobile
 * variant (node 263:11020).
 *
 * The link columns are admin-editable (admin's /dashboard/navigation, backed
 * by GET /api/menus?location=footer); a column marked "dynamic_casinos" lists
 * live casinos instead. The brand block (description, address, email,
 * social links) comes from Site Settings, so editors change it without code.
 * Certification badges are static assets in /public/certifications.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";

interface CasinoApiCasino {
  slug: string;
  name: string;
}

async function getFooterCasinos(): Promise<CasinoApiCasino[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/casinos?pageSize=100`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const body = (await res.json()) as { data?: { casinos?: CasinoApiCasino[] } };
    return Array.isArray(body.data?.casinos) ? body.data.casinos : [];
  } catch {
    // Public API may be unreachable during static generation — degrade to
    // an empty list rather than failing the whole page/build.
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

async function getFooterMenu(): Promise<MenuNode[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/menus?location=footer`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const body = (await res.json()) as { data?: { items?: MenuNode[] } };
    return Array.isArray(body.data?.items) ? body.data.items : [];
  } catch {
    return [];
  }
}

const CERTIFICATIONS = [
  { name: "TRUSTe Certified Privacy", src: "/certifications/truste.webp", width: 91 },
  { name: "DMCA Protected", src: "/certifications/dmca.webp", width: 80 },
  { name: "Norton Secured", src: "/certifications/norton.webp", width: 47 },
  { name: "Sucuri Security", src: "/certifications/sucuri.webp", width: 72 },
  { name: "Cloudflare", src: "/certifications/cloudflare.webp", width: 75 },
];

const linkClassName = "cursor-pointer text-base text-white/90 transition-colors hover:text-secondary-500";

export default async function Footer() {
  const [casinos, columns, settings] = await Promise.all([getFooterCasinos(), getFooterMenu(), getSiteSettings()]);
  const currentYear = new Date().getFullYear();
  const logo = mediaUrl(settings.logoUrl);
  const hasSocial = Boolean(settings.facebookUrl || settings.skypeUrl);

  return (
    <footer id="site-footer" className="site-footer bg-gradient-to-r from-primary-900 to-primary-glow text-white">
      <div className="mx-auto w-full max-w-[1470px] px-[25px] pt-10">
        <div className="flex flex-col gap-8 min-[1200px]:flex-row min-[1200px]:gap-10">
          <nav aria-label="Footer" className="grid flex-1 grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 min-[1200px]:flex min-[1200px]:justify-between">
            {columns.map((column) => {
              const isCasinos = column.sourceType === "dynamic_casinos";
              const links = isCasinos
                ? casinos.map((c) => ({ label: c.name, href: `/casinos/${c.slug}` }))
                : column.children.map((c) => ({ label: c.label, href: c.href ?? "#" }));
              return (
                <div key={column.id} className="site-footer__column flex flex-col gap-3">
                  <h3 className="text-base font-bold text-secondary-500">{column.label}</h3>
                  <ul className={isCasinos ? "grid grid-flow-col grid-rows-7 gap-x-8 gap-y-1" : "flex flex-col gap-1"}>
                    {links.map((link) => (
                      <li key={link.href + link.label}>
                        <Link href={link.href} className={linkClassName}>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </nav>

          <div className="site-footer__brand flex flex-col gap-4 border-t border-white/30 pt-8 min-[1200px]:max-w-[435px] min-[1200px]:border-t-0 min-[1200px]:border-l min-[1200px]:pt-0 min-[1200px]:pl-10">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt={settings.siteTitle} loading="lazy" decoding="async" className="h-9 w-auto self-start" />
            ) : (
              <span className="text-2xl font-bold">{settings.siteTitle}</span>
            )}
            {settings.footerDescription && <p className="text-base text-white/90">{settings.footerDescription}</p>}
            <div className="flex items-stretch gap-4">
              <div className="flex flex-1 flex-col gap-2 text-base text-white/90">
                {settings.contactAddress && (
                  <p className="flex items-start gap-2">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true">
                      <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
                    </svg>
                    <span>{settings.contactAddress}</span>
                  </p>
                )}
                {settings.contactEmail && (
                  <a href={`mailto:${settings.contactEmail}`} className="flex items-center gap-2 hover:text-secondary-500">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5 shrink-0" aria-hidden="true">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="m3 7 9 6 9-6" />
                    </svg>
                    <span>{settings.contactEmail}</span>
                  </a>
                )}
              </div>
              {hasSocial && (
                <div className="flex flex-col gap-2 border-l border-white/30 pl-4">
                  {settings.facebookUrl && (
                    <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-white hover:text-secondary-500">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden="true">
                        <path d="M12 2a10 10 0 0 0-1.56 19.88v-7H7.9V12h2.54V9.8c0-2.5 1.5-3.9 3.78-3.9 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.88h-2.34v7A10 10 0 0 0 12 2Z" />
                      </svg>
                    </a>
                  )}
                  {settings.skypeUrl && (
                    <a href={settings.skypeUrl} target="_blank" rel="noopener noreferrer" aria-label="Skype" className="text-white hover:text-secondary-500">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden="true">
                        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm.2 15.3c-2.9 0-4.3-1.4-4.3-2.5 0-.6.4-1 1-1 1.4 0 1 2 3.3 2 1.2 0 1.8-.6 1.8-1.3 0-.4-.2-.9-1.1-1.1l-2.6-.7c-2.1-.5-2.5-1.7-2.5-2.7 0-2.3 2.1-3.1 4.1-3.1 1.8 0 4 1 4 2.4 0 .6-.5.9-1.1.9-1.2 0-1-1.6-3.2-1.6-1.1 0-1.7.5-1.7 1.2s.9.9 1.6 1.1l1.9.4c2.1.5 2.6 1.7 2.6 2.8 0 1.8-1.4 3.2-4.4 3.2Z" />
                      </svg>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="site-footer__bottom mt-10 flex flex-col gap-4 rounded-t-[20px] bg-white px-5 py-5 text-sm text-primary-900 min-[1200px]:flex-row-reverse min-[1200px]:items-center min-[1200px]:justify-between min-[1200px]:px-8 min-[1200px]:py-4 min-[1200px]:text-base">
          <div className="flex flex-col gap-3 min-[1200px]:flex-row min-[1200px]:items-center min-[1200px]:gap-5">
            <p>
              <strong className="font-semibold">topcasinosg.com.sg</strong> is certified by:
            </p>
            <ul className="flex flex-wrap items-center gap-x-4 gap-y-3">
              {CERTIFICATIONS.map((cert) => (
                <li key={cert.name}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cert.src} alt={cert.name} width={cert.width} height={25} loading="lazy" decoding="async" className="h-[25px] w-auto" />
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-1 border-t border-primary-100 pt-3 text-xs min-[1200px]:flex-row min-[1200px]:gap-0 min-[1200px]:border-t-0 min-[1200px]:pt-0 min-[1200px]:text-base">
            <p>Copyright &copy; {currentYear} topcasinosg.com.sg</p>
            <span aria-hidden="true" className="mx-7 hidden w-px self-stretch bg-primary-100 min-[1200px]:block" />
            <p>Powered by topcasinosg.com.sg</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
