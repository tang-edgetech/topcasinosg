"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { App as AntApp } from "antd";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import type { BlacklistEntryDTO } from "@/lib/types";
import BlacklistEntryForm from "../BlacklistEntryForm";

export default function EditBlacklistEntryPage() {
  const { user } = useAuth();
  const { message } = AntApp.useApp();
  const params = useParams<{ id: string }>();
  const [entry, setEntry] = useState<BlacklistEntryDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ blacklistEntry: BlacklistEntryDTO }>(`/api/admin/blacklist/${params.id}`)
      .then((data) => setEntry(data.blacklistEntry))
      .catch((err) => message.error(err instanceof ApiError ? err.message : "Could not load blacklist entry."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (!user) return null;

  return (
    <section id="blacklist-edit-page" className="blacklist-edit-page flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/blacklist" className="text-sm font-medium text-primary-600 hover:text-primary-900">
          ← Back to Blacklist
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-text dark:text-text-dark">Edit Blacklist Entry</h1>
      {loading ? (
        <p className="text-text-muted dark:text-text-muted-dark">Loading…</p>
      ) : entry ? (
        <BlacklistEntryForm target={entry} />
      ) : (
        <p className="text-text-muted dark:text-text-muted-dark">Blacklist entry not found.</p>
      )}
    </section>
  );
}
