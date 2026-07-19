"use client";

import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import BlacklistEntryForm from "../BlacklistEntryForm";

export default function NewBlacklistEntryPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <section id="blacklist-new-page" className="blacklist-new-page flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/blacklist" className="text-sm font-medium text-primary-600 hover:text-primary-900">
          ← Back to Blacklist
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-text dark:text-text-dark">Add Blacklist Entry</h1>
      <BlacklistEntryForm target={null} />
    </section>
  );
}
