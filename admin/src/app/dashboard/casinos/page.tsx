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
import StatusFilter, { type StatusFilterValue } from "@/components/content/StatusFilter";
import BulkActionBar from "@/components/content/BulkActionBar";
import { runBulkAction, bulkResultMessage } from "@/lib/bulk";
import { CLIENT_TABLE_PAGINATION, FETCH_ALL_PAGE_SIZE } from "@/lib/pagination";

export default function CasinosPage() {
  const { user } = useAuth();
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const router = useRouter();
  const [casinos, setCasinos] = useState<CasinoDTO[]>([]);
  const [regions, setRegions] = useState<RegionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("all");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  async function load() {
    setLoading(true);
    try {
      const [casinoData, regionData] = await Promise.all([
        api.get<{ casinos: CasinoDTO[] | null; total: number }>(`/api/admin/casinos?pageSize=${FETCH_ALL_PAGE_SIZE}`),
        api.get<{ regions: RegionDTO[] | null }>("/api/admin/regions"),
      ]);
      setCasinos(casinoData.casinos ?? []);
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
  }, []);

  if (!user) return null;

  const filtered = statusFilter === "all" ? casinos : casinos.filter((c) => c.status === statusFilter);
  const selectedCasinos = casinos.filter((c) => selectedRowKeys.includes(c.id));

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

  async function handleBulkStatus(status: "published" | "draft") {
    const ok = await confirm({
      title: status === "published" ? "Publish Casinos" : "Set Casinos to Draft",
      message: `${status === "published" ? "Publish" : "Set to draft"} ${selectedCasinos.length} casino(s)?`,
      confirmLabel: status === "published" ? "Publish" : "Set to Draft",
    });
    if (!ok) return;
    const { succeeded, failed } = await runBulkAction(selectedCasinos, (c) =>
      api.put(`/api/admin/casinos/${c.id}/status`, { status, publishAt: null })
    );
    message[failed > 0 ? "warning" : "success"](bulkResultMessage(succeeded, failed, "updated"));
    setSelectedRowKeys([]);
    load();
  }

  async function handleBulkDelete() {
    const ok = await confirm({
      title: "Delete Casinos",
      message: `Delete ${selectedCasinos.length} casino(s)? This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    const { succeeded, failed } = await runBulkAction(selectedCasinos, (c) => api.del(`/api/admin/casinos/${c.id}`));
    message[failed > 0 ? "warning" : "success"](bulkResultMessage(succeeded, failed, "deleted"));
    setSelectedRowKeys([]);
    load();
  }

  const regionName = (id: number) => regions.find((r) => r.id === id)?.name ?? id;

  return (
    <section id="casinos-page" className="casinos-page flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text dark:text-text-dark">Casinos</h1>
        <IconButton id="casinos-add-button" title="Add Casino" onClick={() => router.push("/dashboard/casinos/new")} icon={<IconPlus />} />
      </div>

      <div className="flex items-center gap-3">
        <StatusFilter id="casinos-status-filter" value={statusFilter} onChange={setStatusFilter} />
      </div>

      <BulkActionBar
        count={selectedRowKeys.length}
        onClear={() => setSelectedRowKeys([])}
        actions={[
          { id: "casinos-bulk-publish", label: "Publish", onClick: () => handleBulkStatus("published") },
          { id: "casinos-bulk-draft", label: "Set to Draft", onClick: () => handleBulkStatus("draft") },
          { id: "casinos-bulk-delete", label: "Delete", onClick: handleBulkDelete, danger: true },
        ]}
      />

      <Table
        id="casinos-table"
        rowKey="id"
        loading={loading}
        dataSource={filtered}
        pagination={CLIENT_TABLE_PAGINATION}
        rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
        columns={[
          { title: "Name", dataIndex: "name", key: "name", sorter: (a, b) => a.name.localeCompare(b.name) },
          { title: "Slug", dataIndex: "slug", key: "slug" },
          { title: "Rating", dataIndex: "rating", key: "rating", sorter: (a, b) => a.rating - b.rating },
          {
            title: "Regions",
            key: "regions",
            render: (_, c) => (c.regionIds ?? []).map(regionName).join(", "),
          },
          {
            title: "Status",
            key: "status",
            render: (_, c) => <StatusBadge status={c.status} />,
            sorter: (a, b) => a.status.localeCompare(b.status),
          },
          {
            title: "Actions",
            key: "actions",
            render: (_, c) => (
              <div className="flex items-center gap-2">
                {c.status !== "published" && (
                  <PublishControl
                    id={`casino-${c.id}-publish`}
                    status={c.status}
                    publishAt={c.publishAt}
                    onSave={(status, publishAt) => handleSetStatus(c, status, publishAt)}
                  />
                )}
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
