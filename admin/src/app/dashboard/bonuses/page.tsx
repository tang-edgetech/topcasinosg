"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, App as AntApp } from "antd";
import { useAuth } from "@/lib/auth-context";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import { titleCase } from "@/lib/format";
import type { BonusDTO, RegionDTO, CasinoDTO } from "@/lib/types";
import IconButton from "@/components/IconButton";
import { IconEdit, IconPlus, IconTrash } from "@/components/Icons";
import StatusBadge from "@/components/content/StatusBadge";
import PublishControl from "@/components/content/PublishControl";
import { DEFAULT_PAGE_SIZE, tablePagination } from "@/lib/pagination";

export default function BonusesPage() {
  const { user } = useAuth();
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const router = useRouter();
  const [bonuses, setBonuses] = useState<BonusDTO[]>([]);
  const [regions, setRegions] = useState<RegionDTO[]>([]);
  const [casinos, setCasinos] = useState<CasinoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [total, setTotal] = useState(0);

  async function load() {
    setLoading(true);
    try {
      const [bonusData, regionData, casinoData] = await Promise.all([
        api.get<{ bonuses: BonusDTO[] | null; total: number }>(`/api/admin/bonuses?page=${page}&pageSize=${pageSize}`),
        api.get<{ regions: RegionDTO[] | null }>("/api/admin/regions"),
        api.get<{ casinos: CasinoDTO[] | null }>("/api/admin/casinos?pageSize=100"),
      ]);
      setBonuses(bonusData.bonuses ?? []);
      setTotal(bonusData.total);
      setRegions(regionData.regions ?? []);
      setCasinos(casinoData.casinos ?? []);
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not load bonuses.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  if (!user) return null;

  const regionName = (id: number) => regions.find((r) => r.id === id)?.name ?? id;
  const casinoName = (id: number | null) => (id ? casinos.find((c) => c.id === id)?.name ?? id : "—");

  async function handleSetStatus(bonus: BonusDTO, status: string, publishAt: string | null) {
    await api.put(`/api/admin/bonuses/${bonus.id}/status`, { status, publishAt });
    message.success("Publish settings updated.");
    load();
  }

  async function handleDelete(bonus: BonusDTO) {
    const ok = await confirm({
      title: "Delete Bonus",
      message: `Delete "${bonus.title}"? This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    try {
      await api.del(`/api/admin/bonuses/${bonus.id}`);
      message.success("Deleted.");
      load();
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not delete bonus.");
    }
  }

  return (
    <section id="bonuses-page" className="bonuses-page flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text dark:text-text-dark">Bonuses</h1>
        <IconButton id="bonuses-add-button" title="Add Bonus" onClick={() => router.push("/dashboard/bonuses/new")} icon={<IconPlus />} />
      </div>

      <Table
        id="bonuses-table"
        rowKey="id"
        loading={loading}
        dataSource={bonuses}
        pagination={tablePagination(page, pageSize, total, (p, ps) => {
          if (ps !== pageSize) {
            setPageSize(ps);
            setPage(1);
          } else {
            setPage(p);
          }
        })}
        columns={[
          { title: "Title", dataIndex: "title", key: "title" },
          { title: "Type", key: "type", render: (_, b) => titleCase(b.bonusType) },
          { title: "Region", key: "region", render: (_, b) => regionName(b.regionId) },
          { title: "Casino", key: "casino", render: (_, b) => casinoName(b.casinoId) },
          { title: "Code", dataIndex: "code", key: "code" },
          { title: "Status", key: "status", render: (_, b) => <StatusBadge status={b.status} /> },
          {
            title: "Schedule",
            key: "schedule",
            render: (_, b) => (
              <PublishControl
                id={`bonus-${b.id}-publish`}
                status={b.status}
                publishAt={b.publishAt}
                onSave={(status, publishAt) => handleSetStatus(b, status, publishAt)}
              />
            ),
          },
          {
            title: "Actions",
            key: "actions",
            render: (_, b) => (
              <div className="flex gap-2">
                <IconButton
                  id={`bonus-${b.id}-edit`}
                  title="Edit Bonus"
                  onClick={() => router.push(`/dashboard/bonuses/${b.id}`)}
                  icon={<IconEdit />}
                  variant="muted"
                />
                <IconButton id={`bonus-${b.id}-delete`} title="Delete Bonus" onClick={() => handleDelete(b)} icon={<IconTrash />} variant="danger" />
              </div>
            ),
          },
        ]}
      />
    </section>
  );
}
