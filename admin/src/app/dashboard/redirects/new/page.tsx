"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import RedirectForm from "../RedirectForm";

export default function NewRedirectPage() {
  const { user } = useAuth();
  if (!user) return null;

  if (user.role === "editor") {
    return (
      <section id="redirect-new-page" className="redirect-new-page">
        <p className="text-text-muted dark:text-text-muted-dark">You don&apos;t have access to this section.</p>
      </section>
    );
  }

  return (
    <section id="redirect-new-page" className="redirect-new-page flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/redirects" className="text-sm font-medium text-primary-600 hover:text-primary-900">
          ← Back to Redirects
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-text dark:text-text-dark">Add Redirect</h1>
      <RedirectForm target={null} />
    </section>
  );
}
