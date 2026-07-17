"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useSiteSettings } from "@/lib/site-settings-context";
import { useConfirm } from "@/components/ConfirmDialog";
import { titleCase } from "@/lib/format";
import BrandMark from "@/components/BrandMark";
import { IconGrid, IconUsers, IconUser, IconSettings, IconSun, IconMoon, IconLogout, IconClose } from "@/components/Icons";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", roles: ["super_admin", "admin", "editor"], icon: IconGrid },
  { href: "/dashboard/users", label: "Users", roles: ["super_admin", "admin"], icon: IconUsers },
  { href: "/dashboard/account", label: "My Account", roles: ["super_admin", "admin", "editor"], icon: IconUser },
  { href: "/dashboard/settings", label: "Settings", roles: ["super_admin"], icon: IconSettings },
];

export default function Sidebar({ onNavigate, onClose }: { onNavigate?: () => void; onClose?: () => void }) {
  const { user, logout, setTheme } = useAuth();
  const { settings } = useSiteSettings();
  const confirm = useConfirm();
  const pathname = usePathname();
  const router = useRouter();

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
      className="sidebar flex h-full w-64 shrink-0 flex-col justify-between bg-sidebar px-3 py-5 text-white"
    >
      <div className="flex flex-col gap-1">
        <div className="sidebar__brand mb-6 flex items-center justify-between px-2">
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

        {NAV_ITEMS.filter((item) => !user || item.roles.includes(user.role)).map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`sidebar__link flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-sidebar-active text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon width={18} height={18} />
              {titleCase(item.label)}
            </Link>
          );
        })}
      </div>

      <div className="sidebar__footer flex flex-col gap-3 border-t border-white/15 pt-4">
        <button
          type="button"
          id="sidebar-theme-toggle"
          title={user?.themePreference === "dark" ? "Switch To Light Theme" : "Switch To Dark Theme"}
          onClick={handleToggleTheme}
          className="sidebar__theme-toggle flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white"
        >
          {user?.themePreference === "dark" ? <IconSun width={18} height={18} /> : <IconMoon width={18} height={18} />}
          {user?.themePreference === "dark" ? "Light Theme" : "Dark Theme"}
        </button>

        {user && (
          <div className="sidebar__user flex items-center gap-2 px-2">
            <span
              id="sidebar-user-avatar"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary-600 text-sm font-bold text-primary-900"
            >
              {user.fullName.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="sidebar__user-name truncate text-[15px] font-semibold leading-tight text-white">
                {user.fullName}
              </p>
              <p className="sidebar__user-role truncate text-[13px] font-normal leading-tight text-white/65">
                {titleCase(user.role)}
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          id="sidebar-logout"
          title="Log Out"
          onClick={handleLogout}
          className="sidebar__logout flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white"
        >
          <IconLogout width={18} height={18} />
          Log Out
        </button>
      </div>
    </nav>
  );
}
