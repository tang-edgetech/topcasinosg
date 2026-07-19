import Link from "next/link";

export type MegaMenuLink = {
  label: string;
  href: string;
};

export type MegaMenuColumn = {
  heading: string;
  links: MegaMenuLink[];
};

type MegaMenuProps = {
  columns: MegaMenuColumn[];
  footerLink?: MegaMenuLink;
  onNavigate?: () => void;
};

/**
 * White flyout panel shown under a desktop nav tab on hover. Rendered inside
 * Header.tsx (a Client Component), so this stays a plain presentational
 * component — no "use client" needed since it holds no state of its own.
 */
export default function MegaMenu({ columns, footerLink, onNavigate }: MegaMenuProps) {
  return (
    <div
      className="mega-menu absolute left-0 top-full z-50 mt-2 min-w-64 rounded-lg border border-primary-100 bg-white p-5 shadow-xl"
      role="menu"
    >
      <div className="mega-menu__columns flex flex-wrap gap-8">
        {columns.map((column) => (
          <div key={column.heading} className="mega-menu__column flex min-w-40 flex-col gap-2">
            <span className="mega-menu__heading text-xs font-semibold tracking-wide text-primary-900 uppercase">
              {column.heading}
            </span>
            <ul className="mega-menu__link-list flex flex-col gap-1.5">
              {column.links.length === 0 ? (
                <li className="mega-menu__empty text-xs text-primary-500">Coming soon</li>
              ) : (
                column.links.map((link) => (
                  <li key={`${column.heading}-${link.href}`}>
                    <Link
                      href={link.href}
                      onClick={onNavigate}
                      className="mega-menu__link cursor-pointer text-sm text-primary-600 transition-colors hover:text-primary-900"
                      role="menuitem"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        ))}
      </div>

      {footerLink && (
        <div className="mega-menu__footer mt-4 border-t border-primary-100 pt-3">
          <Link
            href={footerLink.href}
            onClick={onNavigate}
            className="mega-menu__footer-link cursor-pointer text-sm font-semibold text-primary-900 hover:text-primary-600"
          >
            {footerLink.label}
          </Link>
        </div>
      )}
    </div>
  );
}
