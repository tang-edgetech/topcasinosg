"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, App as AntApp } from "antd";
import { useAuth } from "@/lib/auth-context";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import type { CasinoDTO, RegionDTO } from "@/lib/types";
import IconButton from "@/components/IconButton";
import { IconEdit, IconPlus, IconTrash } from "@/components/Icons";
import StatusBadge from "@/components/content/StatusBadge";
import PublishControl from "@/components/content/PublishControl";
import { DEFAULT_PAGE_SIZE, tablePagination } from "@/lib/pagination";

export default function CasinosPage() {
  const { user } = useAuth();
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const router = useRouter();
  const [casinos, setCasinos] = useState<CasinoDTO[]>([]);
  const [regions, setRegions] = useState<RegionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [total, setTotal] = useState(0);

  async function load() {
    setLoading(true);
    try {
      const [casinoData, regionData] = await Promise.all([
        api.get<{ casinos: CasinoDTO[] | null; total: number }>(`/api/admin/casinos?page=${page}&pageSize=${pageSize}`),
        api.get<{ regions: RegionDTO[] | null }>("/api/admin/regions"),
      ]);
      setCasinos(casinoData.casinos ?? []);
      setTotal(casinoData.total);
      setRegions(regionData.regions ?? []);
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not load casinos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  if (!user) return null;

  async function handleSetStatus(casino: CasinoDTO, status: string, publishAt: string | null) {
    await api.put(`/api/admin/casinos/${casino.id}/status`, { status, publishAt });
    message.success("Publish settings updated.");
    load();
  }

  async function handleDelete(casino: CasinoDTO) {
    const ok = await confirm({
      title: "Delete Casino",
      message: `Delete "${casino.name}"? This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    try {
      await api.del(`/api/admin/casinos/${casino.id}`);
      message.success("Deleted.");
      load();
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not delete casino.");
    }
  }

  const regionName = (id: number) => regions.find((r) => r.id === id)?.name ?? id;

  return (
    <section id="casinos-page" className="casinos-page flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text dark:text-text-dark">Casinos</h1>
        <IconButton id="casinos-add-button" title="Add Casino" onClick={() => router.push("/dashboard/casinos/new")} icon={<IconPlus />} />
      </div>

      <Table
        id="casinos-table"
        rowKey="id"
        loading={loading}
        dataSource={casinos}
        pagination={tablePagination(page, pageSize, total, (p, ps) => {
          if (ps !== pageSize) {
            setPageSize(ps);
            setPage(1);
          } else {
            setPage(p);
          }
        })}
        columns={[
          { title: "Name", dataIndex: "name", key: "name" },
          { title: "Slug", dataIndex: "slug", key: "slug" },
          { title: "Rating", dataIndex: "rating", key: "rating" },
          {
            title: "Regions",
            key: "regions",
            render: (_, c) => (c.regionIds ?? []).map(regionName).join(", "),
          },
          { title: "Status", key: "status", render: (_, c) => <StatusBadge status={c.status} /> },
          {
            title: "Schedule",
            key: "schedule",
            render: (_, c) => (
              <PublishControl
                id={`casino-${c.id}-publish`}
                status={c.status}
                publishAt={c.publishAt}
                onSave={(status, publishAt) => handleSetStatus(c, status, publishAt)}
              />
            ),
          },
          {
            title: "Actions",
            key: "actions",
            render: (_, c) => (
              <div className="flex gap-2">
                <IconButton
                  id={`casino-${c.id}-edit`}
                  title="Edit Casino"
                  onClick={() => router.push(`/dashboard/casinos/${c.id}`)}
                  icon={<IconEdit />}
                  variant="muted"
                />
                <IconButton id={`casino-${c.id}-delete`} title="Delete Casino" onClick={() => handleDelete(c)} icon={<IconTrash />} variant="danger" />
              </div>
            ),
          },
        ]}
      />
    </section>
  );
}
