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
import ListToolbar from "@/components/content/ListToolbar";
import { useListView } from "@/lib/useListView";
import { statusFilter, regionFilter, presenceFilter } from "@/lib/listFilters";
import BulkActionBar from "@/components/content/BulkActionBar";
import { runBulkAction, bulkResultMessage } from "@/lib/bulk";
import { FETCH_ALL_PAGE_SIZE } from "@/lib/pagination";
import PageHeading from "@/components/PageHeading";

export default function GuidesPage() {
  const { user } = useAuth();
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const router = useRouter();
  const [guides, setGuides] = useState<GuideDTO[]>([]);
  const [regions, setRegions] = useState<RegionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  async function load() {
    setLoading(true);
    try {
      const [guideData, regionData] = await Promise.all([
        api.get<{ guides: GuideDTO[] | null; total: number }>(`/api/admin/guides?pageSize=${FETCH_ALL_PAGE_SIZE}`),
        api.get<{ regions: RegionDTO[] | null }>("/api/admin/regions"),
      ]);
      setGuides(guideData.guides ?? []);
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
  }, []);

  const { filtered, pagination, toolbar } = useListView<GuideDTO>({
    storageKey: "guides",
    items: guides,
    searchText: (g) => `${g.title} ${g.slug}`,
    filters: [
        statusFilter<GuideDTO>(),
        regionFilter<GuideDTO>(regions, (g) => (g.regionId ? [g.regionId] : []), true),
        presenceFilter<GuideDTO>("cover", "Cover: any", ["Has cover", "Missing cover"], (g) => Boolean(g.coverMediaId)),
      ],
  });

  if (!user) return null;

  const selectedGuides = guides.filter((g) => selectedRowKeys.includes(g.id));

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

  async function handleBulkStatus(status: "published" | "draft") {
    const ok = await confirm({
      title: status === "published" ? "Publish Guides" : "Set Guides to Draft",
      message: `${status === "published" ? "Publish" : "Set to draft"} ${selectedGuides.length} guide(s)?`,
      confirmLabel: status === "published" ? "Publish" : "Set to Draft",
    });
    if (!ok) return;
    const { succeeded, failed } = await runBulkAction(selectedGuides, (g) =>
      api.put(`/api/admin/guides/${g.id}/status`, { status, publishAt: null })
    );
    message[failed > 0 ? "warning" : "success"](bulkResultMessage(succeeded, failed, "updated"));
    setSelectedRowKeys([]);
    load();
  }

  async function handleBulkDelete() {
    const ok = await confirm({
      title: "Delete Guides",
      message: `Delete ${selectedGuides.length} guide(s)? This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    const { succeeded, failed } = await runBulkAction(selectedGuides, (g) => api.del(`/api/admin/guides/${g.id}`));
    message[failed > 0 ? "warning" : "success"](bulkResultMessage(succeeded, failed, "deleted"));
    setSelectedRowKeys([]);
    load();
  }

  return (
    <section id="guides-page" className="guides-page flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <PageHeading title="Guides" help="guides" />
        <IconButton id="guides-add-button" title="Add Guide" onClick={() => router.push("/dashboard/guides/new")} icon={<IconPlus />} />
      </div>

      <div className="flex items-center gap-3">
        <ListToolbar id="guides-toolbar" searchPlaceholder="Search guides by title or slug" {...toolbar} />
      </div>

      <BulkActionBar
        count={selectedRowKeys.length}
        onClear={() => setSelectedRowKeys([])}
        actions={[
          { id: "guides-bulk-publish", label: "Publish", onClick: () => handleBulkStatus("published") },
          { id: "guides-bulk-draft", label: "Set to Draft", onClick: () => handleBulkStatus("draft") },
          { id: "guides-bulk-delete", label: "Delete", onClick: handleBulkDelete, danger: true },
        ]}
      />

      <Table
        id="guides-table"
        rowKey="id"
        loading={loading}
        dataSource={filtered}
        pagination={pagination}
        rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
        columns={[
          { title: "Title", dataIndex: "title", key: "title", sorter: (a, b) => a.title.localeCompare(b.title) },
          { title: "Slug", dataIndex: "slug", key: "slug" },
          { title: "Region", key: "region", render: (_, g) => regionName(g.regionId) },
          {
            title: "Status",
            key: "status",
            render: (_, g) => <StatusBadge status={g.status} />,
            sorter: (a, b) => a.status.localeCompare(b.status),
          },
          {
            title: "Actions",
            key: "actions",
            render: (_, g) => (
              <div className="flex items-center gap-2">
                {g.status !== "published" && (
                  <PublishControl
                    id={`guide-${g.id}-publish`}
                    status={g.status}
                    publishAt={g.publishAt}
                    onSave={(status, publishAt) => handleSetStatus(g, status, publishAt)}
                  />
                )}
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
