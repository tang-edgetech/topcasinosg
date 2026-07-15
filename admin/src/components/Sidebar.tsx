"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", roles: ["super_admin", "admin", "editor"] },
  { href: "/dashboard/users", label: "Users", roles: ["super_admin", "admin"] },
  { href: "/dashboard/account", label: "My account", roles: ["super_admin", "admin", "editor"] },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace("/");
  }

  return (
    <nav id="dashboard-sidebar" className="sidebar flex w-60 shrink-0 flex-col justify-between border-r border-primary-100 bg-white px-4 py-6">
      <div className="flex flex-col gap-1">
        <div className="sidebar__brand px-2 pb-6 text-lg font-bold text-primary-900">Top Casino SG</div>
        {NAV_ITEMS.filter((item) => !user || item.roles.includes(user.role)).map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar__link rounded-md px-3 py-2 text-sm font-medium ${
                active ? "bg-primary-50 text-primary-900" : "text-primary-500 hover:bg-primary-50 hover:text-primary-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="sidebar__footer flex flex-col gap-2 border-t border-primary-100 pt-4">
        {user && (
          <div className="sidebar__user px-2 text-xs text-primary-500">
            <p className="font-medium text-primary-900">{user.fullName}</p>
            <p className="capitalize">{user.role.replace("_", " ")}</p>
          </div>
        )}
        <button
          type="button"
          id="sidebar-logout"
          onClick={handleLogout}
          className="sidebar__logout rounded-md px-3 py-2 text-left text-sm font-medium text-danger hover:bg-primary-50"
        >
          Log out
        </button>
      </div>
    </nav>
  );
}