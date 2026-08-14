"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { App as AntApp } from "antd";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import type { RegionDTO } from "@/lib/types";
import BlacklistEntryForm from "../BlacklistEntryForm";

export default function NewBlacklistEntryPage() {
  const { user } = useAuth();
  const { message } = AntApp.useApp();
  const [regions, setRegions] = useState<RegionDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ regions: RegionDTO[] | null }>("/api/admin/regions")
      .then((data) => setRegions(data.regions ?? []))
      .catch((err) => message.error(err instanceof ApiError ? err.message : "Could not load regions."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return null;

  return (
    <section id="blacklist-new-page" className="blacklist-new-page flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/blacklist" className="text-sm font-medium text-primary-600 hover:text-primary-900">
          ← Back to Blacklist
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-text dark:text-text-dark">Add Blacklist Entry</h1>
      {!loading && <BlacklistEntryForm target={null} regions={regions} />}
    </section>
  );
}
