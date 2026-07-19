"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { App as AntApp } from "antd";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import type { CasinoDTO, RegionDTO } from "@/lib/types";
import CasinoForm from "../CasinoForm";

export default function EditCasinoPage() {
  const { user } = useAuth();
  const { message } = AntApp.useApp();
  const params = useParams<{ id: string }>();
  const [casino, setCasino] = useState<CasinoDTO | null>(null);
  const [regions, setRegions] = useState<RegionDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ casino: CasinoDTO }>(`/api/admin/casinos/${params.id}`),
      api.get<{ regions: RegionDTO[] | null }>("/api/admin/regions"),
    ])
      .then(([casinoData, regionData]) => {
        setCasino(casinoData.casino);
        setRegions(regionData.regions ?? []);
      })
      .catch((err) => message.error(err instanceof ApiError ? err.message : "Could not load casino."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (!user) return null;

  return (
    <section id="casino-edit-page" className="casino-edit-page flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/casinos" className="text-sm font-medium text-primary-600 hover:text-primary-900">
          ← Back to Casinos
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-text dark:text-text-dark">Edit Casino</h1>
      {loading ? (
        <p className="text-text-muted dark:text-text-muted-dark">Loading…</p>
      ) : casino ? (
        <CasinoForm target={casino} regions={regions} />
      ) : (
        <p className="text-text-muted dark:text-text-muted-dark">Casino not found.</p>
      )}
    </section>
  );
}
