"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { App as AntApp } from "antd";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import type { GuideDTO, RegionDTO } from "@/lib/types";
import GuideForm from "../GuideForm";

export default function EditGuidePage() {
  const { user } = useAuth();
  const { message } = AntApp.useApp();
  const params = useParams<{ id: string }>();
  const [guide, setGuide] = useState<GuideDTO | null>(null);
  const [regions, setRegions] = useState<RegionDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ guide: GuideDTO }>(`/api/admin/guides/${params.id}`),
      api.get<{ regions: RegionDTO[] | null }>("/api/admin/regions"),
    ])
      .then(([guideData, regionData]) => {
        setGuide(guideData.guide);
        setRegions(regionData.regions ?? []);
      })
      .catch((err) => message.error(err instanceof ApiError ? err.message : "Could not load guide."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (!user) return null;

  return (
    <section id="guide-edit-page" className="guide-edit-page flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/guides" className="text-sm font-medium text-primary-600 hover:text-primary-900">
          ← Back to Guides
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-text dark:text-text-dark">Edit Guide</h1>
      {loading ? (
        <p className="text-text-muted dark:text-text-muted-dark">Loading…</p>
      ) : guide ? (
        <GuideForm target={guide} regions={regions} />
      ) : (
        <p className="text-text-muted dark:text-text-muted-dark">Guide not found.</p>
      )}
    </section>
  );
}
