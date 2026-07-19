"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, App as AntApp } from "antd";
import { useAuth } from "@/lib/auth-context";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import { titleCase } from "@/lib/format";
import type { RegionDTO, CasinoDTO, RTPEntryDTO } from "@/lib/types";
import IconButton from "@/components/IconButton";
import { IconEdit, IconPlus, IconTrash } from "@/components/Icons";
import StatusBadge from "@/components/content/StatusBadge";
import PublishControl from "@/components/content/PublishControl";
import { DEFAULT_PAGE_SIZE, tablePagination } from "@/lib/pagination";

export default function RTPEntriesPage() {
  const { user } = useAuth();
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const router = useRouter();
  const [entries, setEntries] = useState<RTPEntryDTO[]>([]);
  const [regions, setRegions] = useState<RegionDTO[]>([]);
  const [casinos, setCasinos] = useState<CasinoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [total, setTotal] = useState(0);

  async function load() {
    setLoading(true);
    try {
      const [entryData, regionData, casinoData] = await Promise.all([
        api.get<{ rtpEntries: RTPEntryDTO[] | null; total: number }>(`/api/admin/rtp?page=${page}&pageSize=${pageSize}`),
        api.get<{ regions: RegionDTO[] | null }>("/api/admin/regions"),
        api.get<{ casinos: CasinoDTO[] | null }>("/api/admin/casinos?pageSize=100"),
      ]);
      setEntries(entryData.rtpEntries ?? []);
      setTotal(entryData.total);
      setRegions(regionData.regions ?? []);
      setCasinos(casinoData.casinos ?? []);
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not load RTP entries.");
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

  async function handleSetStatus(entry: RTPEntryDTO, status: string, publishAt: string | null) {
    await api.put(`/api/admin/rtp/${entry.id}/status`, { status, publishAt });
    message.success("Publish settings updated.");
    load();
  }

  async function handleDelete(entry: RTPEntryDTO) {
    const ok = await confirm({
      title: "Delete RTP Entry",
      message: `Delete "${entry.gameName}"? This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    try {
      await api.del(`/api/admin/rtp/${entry.id}`);
      message.success("Deleted.");
      load();
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not delete RTP entry.");
    }
  }

  return (
    <section id="rtp-page" className="rtp-page flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text dark:text-text-dark">RTP Entries</h1>
        <IconButton id="rtp-add-button" title="Add RTP Entry" onClick={() => router.push("/dashboard/rtp/new")} icon={<IconPlus />} />
      </div>

      <Table
        id="rtp-table"
        rowKey="id"
        loading={loading}
        dataSource={entries}
        pagination={tablePagination(page, pageSize, total, (p, ps) => {
          if (ps !== pageSize) {
            setPageSize(ps);
            setPage(1);
          } else {
            setPage(p);
          }
        })}
        columns={[
          { title: "Game Name", dataIndex: "gameName", key: "gameName" },
          { title: "Category", key: "category", render: (_, e) => titleCase(e.category) },
          { title: "Region", key: "region", render: (_, e) => regionName(e.regionId) },
          { title: "Casino", key: "casino", render: (_, e) => casinoName(e.casinoId) },
          { title: "RTP %", key: "rtpPercentage", render: (_, e) => `${e.rtpPercentage.toFixed(2)}%` },
          { title: "Status", key: "status", render: (_, e) => <StatusBadge status={e.status} /> },
          {
            title: "Schedule",
            key: "schedule",
            render: (_, e) => (
              <PublishControl
                id={`rtp-${e.id}-publish`}
                status={e.status}
                publishAt={e.publishAt}
                onSave={(status, publishAt) => handleSetStatus(e, status, publishAt)}
              />
            ),
          },
          {
            title: "Actions",
            key: "actions",
            render: (_, e) => (
              <div className="flex gap-2">
                <IconButton
                  id={`rtp-${e.id}-edit`}
                  title="Edit RTP Entry"
                  onClick={() => router.push(`/dashboard/rtp/${e.id}`)}
                  icon={<IconEdit />}
                  variant="muted"
                />
                <IconButton id={`rtp-${e.id}-delete`} title="Delete RTP Entry" onClick={() => handleDelete(e)} icon={<IconTrash />} variant="danger" />
              </div>
            ),
          },
        ]}
      />
    </section>
  );
}
