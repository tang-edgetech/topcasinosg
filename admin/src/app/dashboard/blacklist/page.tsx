"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, App as AntApp } from "antd";
import { useAuth } from "@/lib/auth-context";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import type { BlacklistEntryDTO, RegionDTO } from "@/lib/types";
import IconButton from "@/components/IconButton";
import { IconEdit, IconPlus, IconTrash } from "@/components/Icons";
import StatusBadge from "@/components/content/StatusBadge";
import PublishControl from "@/components/content/PublishControl";
import StatusFilter, { type StatusFilterValue } from "@/components/content/StatusFilter";
import BulkActionBar from "@/components/content/BulkActionBar";
import { runBulkAction, bulkResultMessage } from "@/lib/bulk";
import { CLIENT_TABLE_PAGINATION, FETCH_ALL_PAGE_SIZE } from "@/lib/pagination";

export default function BlacklistPage() {
  const { user } = useAuth();
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const router = useRouter();
  const [entries, setEntries] = useState<BlacklistEntryDTO[]>([]);
  const [regions, setRegions] = useState<RegionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("all");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  async function load() {
    setLoading(true);
    try {
      const [entryData, regionData] = await Promise.all([
        api.get<{ blacklistEntries: BlacklistEntryDTO[] | null; total: number }>(
          `/api/admin/blacklist?pageSize=${FETCH_ALL_PAGE_SIZE}`
        ),
        api.get<{ regions: RegionDTO[] | null }>("/api/admin/regions"),
      ]);
      setEntries(entryData.blacklistEntries ?? []);
      setRegions(regionData.regions ?? []);
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not load blacklist entries.");
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

  const regionName = (id: number | null) => (id === null ? "Global" : regions.find((r) => r.id === id)?.name ?? id);

  async function handleSetStatus(entry: BlacklistEntryDTO, status: string, publishAt: string | null) {
    await api.put(`/api/admin/blacklist/${entry.id}/status`, { status, publishAt });
    message.success("Publish settings updated.");
    load();
  }

  async function handleDelete(entry: BlacklistEntryDTO) {
    const ok = await confirm({
      title: "Delete Blacklist Entry",
      message: `Delete "${entry.name}"? This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    try {
      await api.del(`/api/admin/blacklist/${entry.id}`);
      message.success("Deleted.");
      load();
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not delete blacklist entry.");
    }
  }

  async function handleBulkStatus(status: "published" | "draft") {
    const ok = await confirm({
      title: status === "published" ? "Publish Blacklist Entries" : "Set Blacklist Entries to Draft",
      message: `${status === "published" ? "Publish" : "Set to draft"} ${selectedEntries.length} entry(ies)?`,
      confirmLabel: status === "published" ? "Publish" : "Set to Draft",
    });
    if (!ok) return;
    const { succeeded, failed } = await runBulkAction(selectedEntries, (e) =>
      api.put(`/api/admin/blacklist/${e.id}/status`, { status, publishAt: null })
    );
    message[failed > 0 ? "warning" : "success"](bulkResultMessage(succeeded, failed, "updated"));
    setSelectedRowKeys([]);
    load();
  }

  async function handleBulkDelete() {
    const ok = await confirm({
      title: "Delete Blacklist Entries",
      message: `Delete ${selectedEntries.length} entry(ies)? This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    const { succeeded, failed } = await runBulkAction(selectedEntries, (e) => api.del(`/api/admin/blacklist/${e.id}`));
    message[failed > 0 ? "warning" : "success"](bulkResultMessage(succeeded, failed, "deleted"));
    setSelectedRowKeys([]);
    load();
  }

  return (
    <section id="blacklist-page" className="blacklist-page flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text dark:text-text-dark">Blacklist</h1>
        <IconButton
          id="blacklist-add-button"
          title="Add Blacklist Entry"
          onClick={() => router.push("/dashboard/blacklist/new")}
          icon={<IconPlus />}
        />
      </div>

      <div className="flex items-center gap-3">
        <StatusFilter id="blacklist-status-filter" value={statusFilter} onChange={setStatusFilter} />
      </div>

      <BulkActionBar
        count={selectedRowKeys.length}
        onClear={() => setSelectedRowKeys([])}
        actions={[
          { id: "blacklist-bulk-publish", label: "Publish", onClick: () => handleBulkStatus("published") },
          { id: "blacklist-bulk-draft", label: "Set to Draft", onClick: () => handleBulkStatus("draft") },
          { id: "blacklist-bulk-delete", label: "Delete", onClick: handleBulkDelete, danger: true },
        ]}
      />

      <Table
        id="blacklist-table"
        rowKey="id"
        loading={loading}
        dataSource={filtered}
        pagination={CLIENT_TABLE_PAGINATION}
        rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
        columns={[
          { title: "Name", dataIndex: "name", key: "name", sorter: (a, b) => a.name.localeCompare(b.name) },
          { title: "Reason", dataIndex: "reason", key: "reason" },
          { title: "Region", key: "region", render: (_, e) => regionName(e.regionId) },
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
                    id={`blacklist-${e.id}-publish`}
                    status={e.status}
                    publishAt={e.publishAt}
                    onSave={(status, publishAt) => handleSetStatus(e, status, publishAt)}
                  />
                )}
                <IconButton
                  id={`blacklist-${e.id}-edit`}
                  title="Edit Blacklist Entry"
                  onClick={() => router.push(`/dashboard/blacklist/${e.id}`)}
                  icon={<IconEdit />}
                  variant="muted"
                />
                <IconButton
                  id={`blacklist-${e.id}-delete`}
                  title="Delete Blacklist Entry"
                  onClick={() => handleDelete(e)}
                  icon={<IconTrash />}
                  variant="danger"
                />
              </div>
            ),
          },
        ]}
      />
    </section>
  );
}
