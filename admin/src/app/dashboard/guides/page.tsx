"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, App as AntApp } from "antd";
import { useAuth } from "@/lib/auth-context";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import type { GuideDTO, RegionDTO } from "@/lib/types";
import IconButton from "@/components/IconButton";
import { IconEdit, IconPlus, IconTrash } from "@/components/Icons";
import StatusBadge from "@/components/content/StatusBadge";
import PublishControl from "@/components/content/PublishControl";
import { DEFAULT_PAGE_SIZE, tablePagination } from "@/lib/pagination";

export default function GuidesPage() {
  const { user } = useAuth();
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const router = useRouter();
  const [guides, setGuides] = useState<GuideDTO[]>([]);
  const [regions, setRegions] = useState<RegionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [total, setTotal] = useState(0);

  async function load() {
    setLoading(true);
    try {
      const [guideData, regionData] = await Promise.all([
        api.get<{ guides: GuideDTO[] | null; total: number }>(`/api/admin/guides?page=${page}&pageSize=${pageSize}`),
        api.get<{ regions: RegionDTO[] | null }>("/api/admin/regions"),
      ]);
      setGuides(guideData.guides ?? []);
      setTotal(guideData.total);
      setRegions(regionData.regions ?? []);
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not load guides.");
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

  async function handleSetStatus(guide: GuideDTO, status: string, publishAt: string | null) {
    await api.put(`/api/admin/guides/${guide.id}/status`, { status, publishAt });
    message.success("Publish settings updated.");
    load();
  }

  async function handleDelete(guide: GuideDTO) {
    const ok = await confirm({
      title: "Delete Guide",
      message: `Delete "${guide.title}"? This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    try {
      await api.del(`/api/admin/guides/${guide.id}`);
      message.success("Deleted.");
      load();
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not delete guide.");
    }
  }

  return (
    <section id="guides-page" className="guides-page flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text dark:text-text-dark">Guides</h1>
        <IconButton id="guides-add-button" title="Add Guide" onClick={() => router.push("/dashboard/guides/new")} icon={<IconPlus />} />
      </div>

      <Table
        id="guides-table"
        rowKey="id"
        loading={loading}
        dataSource={guides}
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
          { title: "Slug", dataIndex: "slug", key: "slug" },
          { title: "Region", key: "region", render: (_, g) => regionName(g.regionId) },
          { title: "Status", key: "status", render: (_, g) => <StatusBadge status={g.status} /> },
          {
            title: "Schedule",
            key: "schedule",
            render: (_, g) => (
              <PublishControl
                id={`guide-${g.id}-publish`}
                status={g.status}
                publishAt={g.publishAt}
                onSave={(status, publishAt) => handleSetStatus(g, status, publishAt)}
              />
            ),
          },
          {
            title: "Actions",
            key: "actions",
            render: (_, g) => (
              <div className="flex gap-2">
                <IconButton
                  id={`guide-${g.id}-edit`}
                  title="Edit Guide"
                  onClick={() => router.push(`/dashboard/guides/${g.id}`)}
                  icon={<IconEdit />}
                  variant="muted"
                />
                <IconButton id={`guide-${g.id}-delete`} title="Delete Guide" onClick={() => handleDelete(g)} icon={<IconTrash />} variant="danger" />
              </div>
            ),
          },
        ]}
      />
    </section>
  );
}
