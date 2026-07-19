"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { App as AntApp } from "antd";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import type { RegionDTO } from "@/lib/types";
import GuideForm from "../GuideForm";

export default function NewGuidePage() {
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
    <section id="guide-new-page" className="guide-new-page flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/guides" className="text-sm font-medium text-primary-600 hover:text-primary-900">
          ← Back to Guides
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-text dark:text-text-dark">Add Guide</h1>
      {!loading && <GuideForm target={null} regions={regions} />}
    </section>
  );
}
