"use client";

import { useAuth } from "@/lib/auth-context";
import { isStaff } from "@/lib/roles";
import PageHeading from "@/components/PageHeading";

// Components: making and changing them is for Super Admins and Admins (the
// API enforces the same); editors place them on pages from the page builder.
export default function ComponentsLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <section id="components-page" className="components-page flex flex-col gap-6">
      <div>
        <PageHeading title="Components" help="components" />
        <p className="mt-1 text-sm text-text-muted dark:text-text-muted-dark">
          Your own page elements in HTML, CSS and JavaScript, made once and placed on any page with the Component block.
        </p>
      </div>
      {isStaff(user) ? children : <p className="text-text-muted dark:text-text-muted-dark">You don&apos;t have access to this section.</p>}
    </section>
  );
}
