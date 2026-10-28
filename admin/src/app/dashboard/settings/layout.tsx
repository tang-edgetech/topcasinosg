"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { isStaff } from "@/lib/roles";
import PageHeading from "@/components/PageHeading";

// Each tab is its own route so it can be linked to and bookmarked. Add new
// tabs (e.g. Extra) here and as a sibling folder.
const SETTINGS_TABS = [
  { href: "/dashboard/settings/general", label: "General" },
  { href: "/dashboard/settings/security", label: "Security" },
  { href: "/dashboard/settings/log", label: "Log" },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  if (!isStaff(user)) {
    return (
      <section id="settings-page" className="settings-page">
        <p className="text-text-muted dark:text-text-muted-dark">You don&apos;t have access to this section.</p>
      </section>
    );
  }

  return (
    <div id="settings-page" className="flex flex-col gap-6">
      <PageHeading title="Settings" help="settings" />
      <nav id="settings-tabs" className="settings-tabs flex gap-1 border-b border-border dark:border-border-dark" aria-label="Settings sections">
        {SETTINGS_TABS.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`settings-tabs__tab -mb-px border-b-2 px-4 py-2 text-sm font-semibold ${
                active
                  ? "border-primary-600 text-primary-700 dark:border-secondary-500 dark:text-text-dark"
                  : "border-transparent text-text-muted hover:text-text dark:text-text-muted-dark dark:hover:text-text-dark"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
