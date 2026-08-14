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
import { DEFAULT_PAGE_SIZE, tablePagination } from "@/lib/pagination";

export default function BlacklistPage() {
  const { user } = useAuth();
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const router = useRouter();
  const [entries, setEntries] = useState<BlacklistEntryDTO[]>([]);
  const [regions, setRegions] = useState<RegionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [total, setTotal] = useState(0);

  async function load() {
    setLoading(true);
    try {
      const [entryData, regionData] = await Promise.all([
        api.get<{ blacklistEntries: BlacklistEntryDTO[] | null; total: number }>(
          `/api/admin/blacklist?page=${page}&pageSize=${pageSize}`
        ),
        api.get<{ regions: RegionDTO[] | null }>("/api/admin/regions"),
      ]);
      setEntries(entryData.blacklistEntries ?? []);
      setTotal(entryData.total);
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
  }, [page, pageSize]);

  if (!user) return null;

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

      <Table
        id="blacklist-table"
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
          { title: "Name", dataIndex: "name", key: "name" },
          { title: "Reason", dataIndex: "reason", key: "reason" },
          { title: "Region", key: "region", render: (_, e) => regionName(e.regionId) },
          { title: "Status", key: "status", render: (_, e) => <StatusBadge status={e.status} /> },
          {
            title: "Schedule",
            key: "schedule",
            render: (_, e) => (
              <PublishControl
                id={`blacklist-${e.id}-publish`}
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
