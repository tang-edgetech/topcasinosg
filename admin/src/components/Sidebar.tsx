"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useSiteSettings } from "@/lib/site-settings-context";
import { useConfirm } from "@/components/ConfirmDialog";
import { titleCase } from "@/lib/format";
import BrandMark from "@/components/BrandMark";
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
} from "@/components/Icons";

// One color scheme for every clickable sidebar item, main nav or footer:
// white by default, theme yellow on hover, and yellow+bold+highlighted when
// it's the active route. `#sidebar-theme-toggle` (an action, not a route)
// only ever uses the hover half of this — there's no "active" state for it.
const SIDEBAR_ITEM_BASE =
  "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white! transition-colors hover:font-bold! hover:text-yellow-400!";
const SIDEBAR_ITEM_ACTIVE = "bg-sidebar-active font-bold! text-yellow-400!";

// A nav entry is either a direct link (`href`) or an expandable group
// (`children` — a flat array of links, one level deep; add more entries to
// a group's `children` to grow it, no structural changes needed elsewhere).
interface NavLink {
  href: string;
  label: string;
  roles: string[];
  icon: (props: { width?: number; height?: number; className?: string }) => React.ReactElement;
}
interface NavGroup {
  label: string;
  roles: string[];
  icon: NavLink["icon"];
  children: NavLink[];
}
type NavEntry = NavLink | NavGroup;

function isNavGroup(entry: NavEntry): entry is NavGroup {
  return "children" in entry;
}

const NAV_ITEMS: NavEntry[] = [
  { href: "/dashboard", label: "Overview", roles: ["super_admin", "admin", "editor"], icon: IconGrid },
  { href: "/dashboard/pages", label: "Pages", roles: ["super_admin", "admin", "editor"], icon: IconLayout },
  { href: "/dashboard/regions", label: "Regions", roles: ["super_admin", "admin"], icon: IconGlobe },
  { href: "/dashboard/casinos", label: "Casinos", roles: ["super_admin", "admin", "editor"], icon: IconTag },
  {
    href: "/dashboard/game-providers",
    label: "Game Providers",
    roles: ["super_admin", "admin"],
    icon: IconDice,
  },
  {
    href: "/dashboard/licenses",
    label: "Licenses",
    roles: ["super_admin", "admin"],
    icon: IconCertificate,
  },
  { href: "/dashboard/bonuses", label: "Bonuses", roles: ["super_admin", "admin", "editor"], icon: IconGift },
  {
    href: "/dashboard/payment-methods",
    label: "Payment Methods",
    roles: ["super_admin", "admin", "editor"],
    icon: IconCreditCard,
  },
  { href: "/dashboard/rtp", label: "RTP", roles: ["super_admin", "admin", "editor"], icon: IconPercent },
  { href: "/dashboard/guides", label: "Guides", roles: ["super_admin", "admin", "editor"], icon: IconBook },
  { href: "/dashboard/blacklist", label: "Blacklist", roles: ["super_admin", "admin", "editor"], icon: IconBan },
  { href: "/dashboard/news", label: "News", roles: ["super_admin", "admin", "editor"], icon: IconNewspaper },
  { href: "/dashboard/media", label: "Media Library", roles: ["super_admin", "admin", "editor"], icon: IconPhoto },
  { href: "/dashboard/users", label: "Users", roles: ["super_admin", "admin"], icon: IconUsers },
  {
    label: "Menu",
    roles: ["super_admin", "admin"],
    icon: IconMenu,
    children: [
      { href: "/dashboard/navigation", label: "Navigation", roles: ["super_admin", "admin"], icon: IconMenu },
      { href: "/dashboard/sidebar", label: "Sidebar", roles: ["super_admin", "admin"], icon: IconList },
    ],
  },
  { href: "/dashboard/snippets", label: "Snippets", roles: ["super_admin"], icon: IconCode },
];

export default function Sidebar({ onNavigate, onClose }: { onNavigate?: () => void; onClose?: () => void }) {
  const { user, logout, setTheme } = useAuth();
  const { settings } = useSiteSettings();
  const confirm = useConfirm();
  const pathname = usePathname();
  const router = useRouter();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  function isLinkActive(href: string) {
    return href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  }

  function toggleGroup(label: string) {
    setExpandedGroups((prev) => {
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
        {NAV_ITEMS.filter((item) => !user || item.roles.includes(user.role)).map((item) => {
          const Icon = item.icon;

          if (isNavGroup(item)) {
            const children = item.children.filter((c) => !user || c.roles.includes(user.role));
            if (children.length === 0) return null;
            const hasActiveChild = children.some((c) => isLinkActive(c.href));
            const expanded = expandedGroups.has(item.label) || hasActiveChild;
            return (
              <div key={item.label} className="sidebar__group flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => toggleGroup(item.label)}
                  aria-expanded={expanded}
                  className={`sidebar__group-toggle ${SIDEBAR_ITEM_BASE} w-full ${hasActiveChild ? SIDEBAR_ITEM_ACTIVE : ""}`}
                >
                  <Icon width={18} height={18} />
                  <span className="flex-1 text-left">{item.label}</span>
                  <IconChevronDown width={14} height={14} className={`shrink-0 transition-transform ${expanded ? "" : "-rotate-90"}`} />
                </button>
                {expanded && (
                  <div className="sidebar__group-children flex flex-col gap-1 pl-6">
                    {children.map((child) => {
                      const ChildIcon = child.icon;
                      const active = isLinkActive(child.href);
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={onNavigate}
                          className={`sidebar__link ${SIDEBAR_ITEM_BASE} ${active ? SIDEBAR_ITEM_ACTIVE : ""}`}
                        >
                          <ChildIcon width={16} height={16} />
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // Overview ("/dashboard") only matches exactly, or every other
          // item would also light it up. Every other item also matches
          // its own sub-routes (e.g. /dashboard/casinos/new, /dashboard/casinos/123)
          // so the parent stays highlighted while creating/editing.
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
        })}
      </div>

      <div className="sidebar__footer flex shrink-0 flex-col gap-3 border-t border-white/15 pt-4">
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

        {user?.role === "super_admin" && (
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
