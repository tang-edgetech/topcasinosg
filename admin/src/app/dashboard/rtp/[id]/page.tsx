"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { App as AntApp } from "antd";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import type { RTPEntryDTO, RegionDTO, CasinoDTO } from "@/lib/types";
import RTPEntryForm from "../RTPEntryForm";

export default function EditRTPEntryPage() {
  const { user } = useAuth();
  const { message } = AntApp.useApp();
  const params = useParams<{ id: string }>();
  const [entry, setEntry] = useState<RTPEntryDTO | null>(null);
  const [regions, setRegions] = useState<RegionDTO[]>([]);
  const [casinos, setCasinos] = useState<CasinoDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ rtpEntry: RTPEntryDTO }>(`/api/admin/rtp/${params.id}`),
      api.get<{ regions: RegionDTO[] | null }>("/api/admin/regions"),
      api.get<{ casinos: CasinoDTO[] | null }>("/api/admin/casinos?pageSize=100"),
    ])
      .then(([entryData, regionData, casinoData]) => {
        setEntry(entryData.rtpEntry);
        setRegions(regionData.regions ?? []);
        setCasinos(casinoData.casinos ?? []);
      })
      .catch((err) => message.error(err instanceof ApiError ? err.message : "Could not load RTP entry."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (!user) return null;

  return (
    <section id="rtp-edit-page" className="rtp-edit-page flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/rtp" className="text-sm font-medium text-primary-600 hover:text-primary-900">
          ← Back to RTP Entries
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-text dark:text-text-dark">Edit RTP Entry</h1>
      {loading ? (
        <p className="text-text-muted dark:text-text-muted-dark">Loading…</p>
      ) : entry ? (
        <RTPEntryForm target={entry} regions={regions} casinos={casinos} />
      ) : (
        <p className="text-text-muted dark:text-text-muted-dark">RTP entry not found.</p>
      )}
    </section>
  );
}
