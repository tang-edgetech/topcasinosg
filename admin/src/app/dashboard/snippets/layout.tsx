"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { isStaff } from "@/lib/roles";
import PageHeading from "@/components/PageHeading";

// Each tab is its own route so it can be linked to and bookmarked, like
// Settings.
const SNIPPET_TABS = [
  { href: "/dashboard/snippets", label: "Header & Footer" },
  { href: "/dashboard/snippets/code", label: "Code" },
];

export default function SnippetsLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  if (!isStaff(user)) {
    return (
      <section id="snippets-page" className="snippets-page">
        <p className="text-text-muted dark:text-text-muted-dark">You don&apos;t have access to this section.</p>
      </section>
    );
  }

  return (
    <section id="snippets-page" className="snippets-page flex flex-col gap-6">
      <div>
        <PageHeading title="Snippets" help="snippets" />
        <p className="mt-1 text-sm text-text-muted dark:text-text-muted-dark">
          Raw HTML/JavaScript injected into the site — analytics, tracking pixels, chat widgets, etc.
        </p>
      </div>
      <nav id="snippets-tabs" className="snippets-tabs flex gap-1 border-b border-border dark:border-border-dark" aria-label="Snippet types">
        {SNIPPET_TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`snippets-tabs__tab -mb-px border-b-2 px-4 py-2 text-sm font-semibold ${
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
    </section>
  );
}
