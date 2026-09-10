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
import StatusFilter, { type StatusFilterValue } from "@/components/content/StatusFilter";
import BulkActionBar from "@/components/content/BulkActionBar";
import { runBulkAction, bulkResultMessage } from "@/lib/bulk";
import { CLIENT_TABLE_PAGINATION, FETCH_ALL_PAGE_SIZE } from "@/lib/pagination";

export default function RTPEntriesPage() {
  const { user } = useAuth();
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const router = useRouter();
  const [entries, setEntries] = useState<RTPEntryDTO[]>([]);
  const [regions, setRegions] = useState<RegionDTO[]>([]);
  const [casinos, setCasinos] = useState<CasinoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("all");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  async function load() {
    setLoading(true);
    try {
      const [entryData, regionData, casinoData] = await Promise.all([
        api.get<{ rtpEntries: RTPEntryDTO[] | null; total: number }>(`/api/admin/rtp?pageSize=${FETCH_ALL_PAGE_SIZE}`),
        api.get<{ regions: RegionDTO[] | null }>("/api/admin/regions"),
        api.get<{ casinos: CasinoDTO[] | null }>("/api/admin/casinos?pageSize=100"),
      ]);
      setEntries(entryData.rtpEntries ?? []);
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
  }, []);

  if (!user) return null;

  const filtered = statusFilter === "all" ? entries : entries.filter((e) => e.status === statusFilter);
  const selectedEntries = entries.filter((e) => selectedRowKeys.includes(e.id));

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

  async function handleBulkStatus(status: "published" | "draft") {
    const ok = await confirm({
      title: status === "published" ? "Publish RTP Entries" : "Set RTP Entries to Draft",
      message: `${status === "published" ? "Publish" : "Set to draft"} ${selectedEntries.length} RTP entry(ies)?`,
      confirmLabel: status === "published" ? "Publish" : "Set to Draft",
    });
    if (!ok) return;
    const { succeeded, failed } = await runBulkAction(selectedEntries, (e) =>
      api.put(`/api/admin/rtp/${e.id}/status`, { status, publishAt: null })
    );
    message[failed > 0 ? "warning" : "success"](bulkResultMessage(succeeded, failed, "updated"));
    setSelectedRowKeys([]);
    load();
  }

  async function handleBulkDelete() {
    const ok = await confirm({
      title: "Delete RTP Entries",
      message: `Delete ${selectedEntries.length} RTP entry(ies)? This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    const { succeeded, failed } = await runBulkAction(selectedEntries, (e) => api.del(`/api/admin/rtp/${e.id}`));
    message[failed > 0 ? "warning" : "success"](bulkResultMessage(succeeded, failed, "deleted"));
    setSelectedRowKeys([]);
    load();
  }

  return (
    <section id="rtp-page" className="rtp-page flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text dark:text-text-dark">RTP Entries</h1>
        <IconButton id="rtp-add-button" title="Add RTP Entry" onClick={() => router.push("/dashboard/rtp/new")} icon={<IconPlus />} />
      </div>

      <div className="flex items-center gap-3">
        <StatusFilter id="rtp-status-filter" value={statusFilter} onChange={setStatusFilter} />
      </div>

      <BulkActionBar
        count={selectedRowKeys.length}
        onClear={() => setSelectedRowKeys([])}
        actions={[
          { id: "rtp-bulk-publish", label: "Publish", onClick: () => handleBulkStatus("published") },
          { id: "rtp-bulk-draft", label: "Set to Draft", onClick: () => handleBulkStatus("draft") },
          { id: "rtp-bulk-delete", label: "Delete", onClick: handleBulkDelete, danger: true },
        ]}
      />

      <Table
        id="rtp-table"
        rowKey="id"
        loading={loading}
        dataSource={filtered}
        pagination={CLIENT_TABLE_PAGINATION}
        rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
        columns={[
          { title: "Game Name", dataIndex: "gameName", key: "gameName", sorter: (a, b) => a.gameName.localeCompare(b.gameName) },
          { title: "Category", key: "category", render: (_, e) => titleCase(e.category) },
          { title: "Region", key: "region", render: (_, e) => regionName(e.regionId) },
          { title: "Casino", key: "casino", render: (_, e) => casinoName(e.casinoId) },
          { title: "RTP %", key: "rtpPercentage", render: (_, e) => `${e.rtpPercentage.toFixed(2)}%` },
          {
            title: "Status",
            key: "status",
            render: (_, e) => <StatusBadge status={e.status} />,
            sorter: (a, b) => a.status.localeCompare(b.status),
          },
          {
            title: "Actions",
            key: "actions",
            render: (_, e) => (
              <div className="flex items-center gap-2">
                {e.status !== "published" && (
                  <PublishControl
                    id={`rtp-${e.id}-publish`}
                    status={e.status}
                    publishAt={e.publishAt}
                    onSave={(status, publishAt) => handleSetStatus(e, status, publishAt)}
                  />
                )}
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
