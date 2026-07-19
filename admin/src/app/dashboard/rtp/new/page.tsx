"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { App as AntApp } from "antd";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import type { RegionDTO, CasinoDTO } from "@/lib/types";
import RTPEntryForm from "../RTPEntryForm";

export default function NewRTPEntryPage() {
  const { user } = useAuth();
  const { message } = AntApp.useApp();
  const [regions, setRegions] = useState<RegionDTO[]>([]);
  const [casinos, setCasinos] = useState<CasinoDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ regions: RegionDTO[] | null }>("/api/admin/regions"),
      api.get<{ casinos: CasinoDTO[] | null }>("/api/admin/casinos?pageSize=100"),
    ])
      .then(([regionData, casinoData]) => {
        setRegions(regionData.regions ?? []);
        setCasinos(casinoData.casinos ?? []);
      })
      .catch((err) => message.error(err instanceof ApiError ? err.message : "Could not load lookup data."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return null;

  return (
    <section id="rtp-new-page" className="rtp-new-page flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/rtp" className="text-sm font-medium text-primary-600 hover:text-primary-900">
          ← Back to RTP Entries
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-text dark:text-text-dark">Add RTP Entry</h1>
      {!loading && <RTPEntryForm target={null} regions={regions} casinos={casinos} />}
    </section>
  );
}
