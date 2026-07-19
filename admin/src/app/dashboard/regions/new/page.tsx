"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import RegionForm from "../RegionForm";

export default function NewRegionPage() {
  const { user } = useAuth();
  if (!user) return null;

  if (user.role === "editor") {
    return (
      <section id="region-new-page" className="region-new-page">
        <p className="text-text-muted dark:text-text-muted-dark">You don&apos;t have access to this section.</p>
      </section>
    );
  }

  return (
    <section id="region-new-page" className="region-new-page flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/regions" className="text-sm font-medium text-primary-600 hover:text-primary-900">
          ← Back to Regions
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-text dark:text-text-dark">Add Region</h1>
      <RegionForm target={null} />
    </section>
  );
}
