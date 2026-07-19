"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { App as AntApp } from "antd";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import type { BonusDTO, RegionDTO, CasinoDTO } from "@/lib/types";
import BonusForm from "../BonusForm";

export default function EditBonusPage() {
  const { user } = useAuth();
  const { message } = AntApp.useApp();
  const params = useParams<{ id: string }>();
  const [bonus, setBonus] = useState<BonusDTO | null>(null);
  const [regions, setRegions] = useState<RegionDTO[]>([]);
  const [casinos, setCasinos] = useState<CasinoDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ bonus: BonusDTO }>(`/api/admin/bonuses/${params.id}`),
      api.get<{ regions: RegionDTO[] | null }>("/api/admin/regions"),
      api.get<{ casinos: CasinoDTO[] | null }>("/api/admin/casinos?pageSize=100"),
    ])
      .then(([bonusData, regionData, casinoData]) => {
        setBonus(bonusData.bonus);
        setRegions(regionData.regions ?? []);
        setCasinos(casinoData.casinos ?? []);
      })
      .catch((err) => message.error(err instanceof ApiError ? err.message : "Could not load bonus."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (!user) return null;

  return (
    <section id="bonus-edit-page" className="bonus-edit-page flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/bonuses" className="text-sm font-medium text-primary-600 hover:text-primary-900">
          ← Back to Bonuses
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-text dark:text-text-dark">Edit Bonus</h1>
      {loading ? (
        <p className="text-text-muted dark:text-text-muted-dark">Loading…</p>
      ) : bonus ? (
        <BonusForm target={bonus} regions={regions} casinos={casinos} />
      ) : (
        <p className="text-text-muted dark:text-text-muted-dark">Bonus not found.</p>
      )}
    </section>
  );
}
