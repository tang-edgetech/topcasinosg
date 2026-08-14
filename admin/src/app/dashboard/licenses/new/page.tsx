"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import LicenseForm from "../LicenseForm";

export default function NewLicensePage() {
  const { user } = useAuth();
  if (!user) return null;

  if (user.role === "editor") {
    return (
      <section id="license-new-page" className="license-new-page">
        <p className="text-text-muted dark:text-text-muted-dark">You don&apos;t have access to this section.</p>
      </section>
    );
  }

  return (
    <section id="license-new-page" className="license-new-page flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/licenses" className="text-sm font-medium text-primary-600 hover:text-primary-900">
          ← Back to Licenses
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-text dark:text-text-dark">Add License</h1>
      <LicenseForm target={null} />
    </section>
  );
}
