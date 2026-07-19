"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { App as AntApp } from "antd";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import type { RegionDTO } from "@/lib/types";
import RegionForm from "../RegionForm";

export default function EditRegionPage() {
  const { user } = useAuth();
  const { message } = AntApp.useApp();
  const params = useParams<{ id: string }>();
  const [region, setRegion] = useState<RegionDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ regions: RegionDTO[] | null }>("/api/admin/regions")
      .then((data) => {
        setRegion(data.regions?.find((r) => String(r.id) === params.id) ?? null);
      })
      .catch((err) => message.error(err instanceof ApiError ? err.message : "Could not load region."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (!user) return null;

  if (user.role === "editor") {
    return (
      <section id="region-edit-page" className="region-edit-page">
        <p className="text-text-muted dark:text-text-muted-dark">You don&apos;t have access to this section.</p>
      </section>
    );
  }

  return (
    <section id="region-edit-page" className="region-edit-page flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/regions" className="text-sm font-medium text-primary-600 hover:text-primary-900">
          ← Back to Regions
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-text dark:text-text-dark">Edit Region</h1>
      {loading ? (
        <p className="text-text-muted dark:text-text-muted-dark">Loading…</p>
      ) : region ? (
        <RegionForm target={region} />
      ) : (
        <p className="text-text-muted dark:text-text-muted-dark">Region not found.</p>
      )}
    </section>
  );
}
