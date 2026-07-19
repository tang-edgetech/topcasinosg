"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, Switch, App as AntApp } from "antd";
import { useAuth } from "@/lib/auth-context";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import type { RegionDTO } from "@/lib/types";
import IconButton from "@/components/IconButton";
import { IconEdit, IconPlus, IconGlobe } from "@/components/Icons";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "@/lib/pagination";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";

function mediaUrl(url: string) {
  return url.startsWith("http") ? url : `${API_URL}${url}`;
}

export default function RegionsPage() {
  const { user } = useAuth();
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const router = useRouter();
  const [regions, setRegions] = useState<RegionDTO[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await api.get<{ regions: RegionDTO[] | null }>("/api/admin/regions");
      setRegions(data.regions ?? []);
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not load regions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return null;
  const canManage = user.role === "super_admin" || user.role === "admin";

  async function handleToggleActive(region: RegionDTO) {
    const next = !region.isActive;
    const ok = await confirm({
      title: next ? "Activate Region" : "Deactivate Region",
      message: next
        ? `${region.name} will appear on the public site again.`
        : `${region.name} will be hidden from the public site. Its existing content is kept, not deleted.`,
      confirmLabel: next ? "Activate" : "Deactivate",
      danger: !next,
    });
    if (!ok) return;
    try {
      await api.put(`/api/admin/regions/${region.id}/active`, { active: next });
      load();
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not update region.");
    }
  }

  return (
    <section id="regions-page" className="regions-page flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text dark:text-text-dark">Regions</h1>
        {canManage && (
          <IconButton id="regions-add-button" title="Add Region" onClick={() => router.push("/dashboard/regions/new")} icon={<IconPlus />} />
        )}
      </div>

      <Table
        id="regions-table"
        rowKey="id"
        loading={loading}
        dataSource={regions}
        pagination={{
          defaultPageSize: DEFAULT_PAGE_SIZE,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          showSizeChanger: true,
          showTotal: (t) => `${t} total`,
        }}
        columns={[
          {
            title: "Flag",
            key: "flag",
            render: (_, region) => (
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-md border border-border bg-surface-muted dark:border-border-dark dark:bg-surface-muted-dark">
                {region.flagUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaUrl(region.flagUrl)} alt={`${region.name} flag`} className="h-full w-full object-cover" />
                ) : (
                  <IconGlobe width={16} height={16} className="text-primary-400" />
                )}
              </div>
            ),
          },
          { title: "Code", dataIndex: "code", key: "code" },
          { title: "Name", dataIndex: "name", key: "name" },
          { title: "Sort Order", dataIndex: "sortOrder", key: "sortOrder" },
          {
            title: "Active",
            key: "active",
            render: (_, region) =>
              canManage ? (
                <Switch checked={region.isActive} onChange={() => handleToggleActive(region)} />
              ) : (
                <span>{region.isActive ? "Yes" : "No"}</span>
              ),
          },
          ...(canManage
            ? [
                {
                  title: "Actions",
                  key: "actions",
                  render: (_: unknown, region: RegionDTO) => (
                    <IconButton
                      id={`region-${region.id}-edit`}
                      title="Edit Region"
                      onClick={() => router.push(`/dashboard/regions/${region.id}`)}
                      icon={<IconEdit />}
                      variant="muted"
                    />
                  ),
                },
              ]
            : []),
        ]}
      />
    </section>
  );
}
