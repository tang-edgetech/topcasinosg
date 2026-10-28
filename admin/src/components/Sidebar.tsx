"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useSiteSettings } from "@/lib/site-settings-context";
import { useConfirm } from "@/components/ConfirmDialog";
import { titleCase } from "@/lib/format";
import { isStaff } from "@/lib/roles";
import BrandMark from "@/components/BrandMark";
import AppVersion from "@/components/AppVersion";
import {
  IconGrid,
  IconUsers,
  IconSettings,
  IconSun,
  IconMoon,
  IconLogout,
  IconClose,
  IconPhoto,
  IconGlobe,
  IconTag,
  IconGift,
  IconCreditCard,
  IconPercent,
  IconBook,
  IconBan,
  IconNewspaper,
  IconMenu,
  IconLayout,
  IconCode,
  IconDice,
  IconCertificate,
  IconList,
  IconEdit,
  IconChevronDown,
  IconHistory,
  IconTransfer,
  IconCopy,
  IconLayoutBottom,
} from "@/components/Icons";

// One color scheme for every clickable sidebar item, main nav or footer:
// white by default, theme yellow on hover, and yellow+bold+highlighted when
// it's the active route. `#sidebar-theme-toggle` (an action, not a route)
// only ever uses the hover half of this — there's no "active" state for it.
const SIDEBAR_ITEM_BASE =
  "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white! transition-colors hover:font-bold! hover:text-yellow-400!";
const SIDEBAR_ITEM_ACTIVE = "bg-sidebar-active font-bold! text-yellow-400!";

// The nav is a list of sections: an optional heading over a flat list of
// links. A labelled section's heading collapses it; the section holding the
// current page always stays open. Links a role can't use are hidden, and a
// section with none left disappears.
interface NavLink {
  href: string;
  label: string;
  roles: string[];
  icon: (props: { width?: number; height?: number; className?: string }) => React.ReactElement;
}
interface NavSection {
  label: string | null;
  items: NavLink[];
}

const ALL_ROLES = ["super_admin", "admin", "editor"];
const STAFF_ROLES = ["super_admin", "admin"];

const NAV_SECTIONS: NavSection[] = [
  {
    label: null,
    items: [{ href: "/dashboard", label: "Overview", roles: ALL_ROLES, icon: IconGrid }],
  },
  {
    label: "Content",
    items: [
      { href: "/dashboard/pages", label: "Pages", roles: ALL_ROLES, icon: IconLayout },
      { href: "/dashboard/global-sections", label: "Global Sections", roles: ALL_ROLES, icon: IconCopy },
      { href: "/dashboard/guides", label: "Guides", roles: ALL_ROLES, icon: IconBook },
      { href: "/dashboard/news", label: "News", roles: ALL_ROLES, icon: IconNewspaper },
      { href: "/dashboard/media", label: "Media Library", roles: ALL_ROLES, icon: IconPhoto },
    ],
  },
  {
    label: "Casino Directory",
    items: [
      { href: "/dashboard/casinos", label: "Casinos", roles: ALL_ROLES, icon: IconTag },
      { href: "/dashboard/bonuses", label: "Bonuses", roles: ALL_ROLES, icon: IconGift },
      { href: "/dashboard/payment-methods", label: "Payment Methods", roles: ALL_ROLES, icon: IconCreditCard },
      { href: "/dashboard/rtp", label: "RTP", roles: ALL_ROLES, icon: IconPercent },
      { href: "/dashboard/blacklist", label: "Blacklist", roles: ALL_ROLES, icon: IconBan },
    ],
  },
  {
    label: "Reference Data",
    items: [
      { href: "/dashboard/regions", label: "Regions", roles: STAFF_ROLES, icon: IconGlobe },
      { href: "/dashboard/game-providers", label: "Game Providers", roles: STAFF_ROLES, icon: IconDice },
      { href: "/dashboard/licenses", label: "Licenses", roles: STAFF_ROLES, icon: IconCertificate },
    ],
  },
  {
    label: "Site Layout",
    items: [
      { href: "/dashboard/navigation", label: "Navigation", roles: STAFF_ROLES, icon: IconMenu },
      { href: "/dashboard/sidebar", label: "Sidebar", roles: STAFF_ROLES, icon: IconList },
      { href: "/dashboard/footer", label: "Footer", roles: STAFF_ROLES, icon: IconLayoutBottom },
      { href: "/dashboard/snippets", label: "Snippets", roles: STAFF_ROLES, icon: IconCode },
    ],
  },
  {
    label: "Administration",
    items: [
      { href: "/dashboard/users", label: "Users", roles: STAFF_ROLES, icon: IconUsers },
      { href: "/dashboard/transfer", label: "Export / Import", roles: STAFF_ROLES, icon: IconTransfer },
      { href: "/dashboard/activity", label: "Activity Log", roles: ALL_ROLES, icon: IconHistory },
    ],
  },
];

export default function Sidebar({ onNavigate, onClose }: { onNavigate?: () => void; onClose?: () => void }) {
  const { user, logout, setTheme } = useAuth();
  const { settings } = useSiteSettings();
  const confirm = useConfirm();
  const pathname = usePathname();
  const router = useRouter();
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  function isLinkActive(href: string) {
    return href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  }

  function toggleSection(label: string) {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  async function handleLogout() {
    const ok = await confirm({
      title: "Log Out",
      message: "You'll need to sign in again to access the dashboard.",
      confirmLabel: "Log Out",
      danger: true,
    });
    if (!ok) return;
    await logout();
    router.replace("/");
  }

  function handleToggleTheme() {
    setTheme(user?.themePreference === "dark" ? "light" : "dark");
  }

  return (
    <nav
      id="dashboard-sidebar"
      className="sidebar sticky top-0 flex h-full max-h-screen w-64 shrink-0 flex-col bg-sidebar px-3 py-5 text-white"
    >
      <div className="sidebar__brand mb-6 flex shrink-0 items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <BrandMark size={30} />
          <span className="text-base font-bold tracking-tight">{settings?.siteTitle || "Top Casino SG"}</span>
          <AppVersion className="self-end pb-0.5 text-white/50" />
        </div>
        {onClose && (
          <button
            type="button"
            id="sidebar-close"
            title="Close Menu"
            onClick={onClose}
            className="cursor-pointer rounded-md p-1 text-white/70 hover:bg-white/10 hover:text-white"
          >
            <IconClose width={18} height={18} />
          </button>
        )}
      </div>

      <div className="nav-wrapper flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
        {NAV_SECTIONS.map((section) => {
          const items = section.items.filter((item) => !user || item.roles.includes(user.role));
          if (items.length === 0) return null;
          const hasActiveItem = items.some((item) => isLinkActive(item.href));
          const open = !section.label || hasActiveItem || !collapsedSections.has(section.label);

          // Overview ("/dashboard") only matches exactly, or every other
          // item would also light it up. Every other item also matches
          // its own sub-routes (e.g. /dashboard/casinos/new, /dashboard/casinos/123)
          // so the parent stays highlighted while creating/editing.
          const links = items.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`sidebar__link ${SIDEBAR_ITEM_BASE} ${active ? SIDEBAR_ITEM_ACTIVE : ""}`}
              >
                <Icon width={18} height={18} />
                {item.label}
              </Link>
            );
          });

          if (!section.label) {
            return (
              <div key="main" className="sidebar__section flex flex-col gap-1">
                {links}
              </div>
            );
          }
          return (
            <div key={section.label} className="sidebar__section mt-3 flex flex-col gap-1">
              <button
                type="button"
                onClick={() => toggleSection(section.label as string)}
                aria-expanded={open}
                className="sidebar__section-toggle flex cursor-pointer items-center justify-between rounded-md px-3 pb-1 text-[11px] font-semibold tracking-wider text-white/60 uppercase transition-colors hover:text-yellow-400"
              >
                <span>{section.label}</span>
                <IconChevronDown width={12} height={12} className={`shrink-0 transition-transform ${open ? "" : "-rotate-90"}`} />
              </button>
              {open && links}
            </div>
          );
        })}
      </div>

      <div className="sidebar__footer flex shrink-0 flex-col gap-0 border-t border-white/15 pt-4">
        <button
          type="button"
          id="sidebar-theme-toggle"
          title={user?.themePreference === "dark" ? "Switch To Light Theme" : "Switch To Dark Theme"}
          onClick={handleToggleTheme}
          className={`sidebar__theme-toggle ${SIDEBAR_ITEM_BASE}`}
        >
          {user?.themePreference === "dark" ? <IconSun width={18} height={18} /> : <IconMoon width={18} height={18} />}
          {user?.themePreference === "dark" ? "Light Theme" : "Dark Theme"}
        </button>

        {user && isStaff(user) && (
          <Link
            href="/dashboard/settings"
            onClick={onNavigate}
            className={`sidebar__settings-link ${SIDEBAR_ITEM_BASE} ${
              pathname === "/dashboard/settings" || pathname.startsWith("/dashboard/settings/") ? SIDEBAR_ITEM_ACTIVE : ""
            }`}
          >
            <IconSettings width={18} height={18} />
            Settings
          </Link>
        )}

        {user && (
          <Link
            href="/dashboard/account"
            onClick={onNavigate}
            id="sidebar-user-link"
            className="sidebar__user flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/10"
          >
            <span
              id="sidebar-user-avatar"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary-600 text-sm font-bold text-primary-900"
            >
              {user.fullName.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="sidebar__user-name truncate text-[15px] font-semibold leading-tight text-white">
                {user.fullName}
              </p>
              <p className="sidebar__user-role truncate text-[13px] font-normal leading-tight text-white/65">
                {titleCase(user.role)}
              </p>
            </div>
            <IconEdit width={14} height={14} className="shrink-0 text-white/50" />
          </Link>
        )}

        <button type="button" id="sidebar-logout" title="Log Out" onClick={handleLogout} className={`sidebar__logout ${SIDEBAR_ITEM_BASE}`}>
          <IconLogout width={18} height={18} />
          Log Out
        </button>
      </div>
    </nav>
  );
}
