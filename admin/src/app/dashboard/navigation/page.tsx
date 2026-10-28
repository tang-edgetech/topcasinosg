"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import PageHeading from "@/components/PageHeading";
import MenuEditor from "./MenuEditor";

// The header mega-menu. The footer's link columns are edited on the Footer page.
export default function NavigationPage() {
  const { user } = useAuth();
  if (!user) return null;

  if (user.role !== "super_admin" && user.role !== "admin") {
    return (
      <section id="navigation-page" className="navigation-page">
        <p className="text-text-muted dark:text-text-muted-dark">You don&apos;t have access to this section.</p>
      </section>
    );
  }

  return (
    <section id="navigation-page" className="navigation-page flex flex-col gap-6">
      <PageHeading title="Navigation" help="navigation" />
      <MenuEditor location="header" />
      <p className="text-sm text-text-muted dark:text-text-muted-dark">
        The footer&apos;s link columns are now on the{" "}
        <Link href="/dashboard/footer" className="font-semibold text-primary-600 underline dark:text-primary-300">
          Footer
        </Link>{" "}
        page.
      </p>
    </section>
  );
}