"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import PageMetaForm from "../PageMetaForm";

export default function NewPagePage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <section id="page-new-page" className="page-new-page flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/pages" className="text-sm font-medium text-primary-600 hover:text-primary-900">
          ← Back to Pages
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-text dark:text-text-dark">Add Page</h1>
      <PageMetaForm target={null} />
    </section>
  );
}
