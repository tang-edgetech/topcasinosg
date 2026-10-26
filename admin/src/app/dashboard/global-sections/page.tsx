"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input, Modal, Table, App as AntApp } from "antd";
import { useAuth } from "@/lib/auth-context";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import type { GlobalSectionDTO } from "@/lib/types";
import IconButton from "@/components/IconButton";
import { IconEdit, IconPlus, IconTrash } from "@/components/Icons";
import PageHeading from "@/components/PageHeading";
import dayjs from "dayjs";

// Reusable sections edited once and placed on many pages with the "Global
// Section" component (or "Save as Global Section" in the page editor).
export default function GlobalSectionsPage() {
  const { user } = useAuth();
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const router = useRouter();
  const [globals, setGlobals] = useState<GlobalSectionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await api.get<{ globalSections: GlobalSectionDTO[] }>("/api/admin/global-sections");
      setGlobals(data.globalSections ?? []);
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not load global sections.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return null;

  async function handleCreate() {
    setCreating(true);
    try {
      const data = await api.post<{ globalSection: GlobalSectionDTO }>("/api/admin/global-sections", { name, sections: [] });
      message.success("Global section created.");
      router.push(`/dashboard/global-sections/${data.globalSection.id}`);
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not create the global section.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(global: GlobalSectionDTO) {
    const ok = await confirm({
      title: "Delete Global Section",
      message: `Delete "${global.name}"? This can't be undone.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    try {
      await api.del(`/api/admin/global-sections/${global.id}`);
      message.success("Global section deleted.");
      load();
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not delete the global section.");
    }
  }

  return (
    <section id="global-sections-page" className="global-sections-page flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <PageHeading title="Global Sections" help="globalSections" />
        <IconButton
          id="global-sections-add-button"
          title="Add Global Section"
          onClick={() => {
            setName("");
            setCreateOpen(true);
          }}
          icon={<IconPlus />}
        />
      </div>

      <Table<GlobalSectionDTO>
        rowKey="id"
        loading={loading}
        dataSource={globals}
        pagination={false}
        locale={{ emptyText: "No global sections yet — create one here, or use “Save as Global Section” on a section in the page editor." }}
        columns={[
          {
            title: "Name",
            dataIndex: "name",
            render: (value: string, record) => (
              <Link href={`/dashboard/global-sections/${record.id}`} className="font-medium text-primary-700 hover:underline">
                {value}
              </Link>
            ),
          },
          {
            title: "Used on",
            dataIndex: "usageCount",
            width: 140,
            render: (count: number) => (count === 0 ? "Not used yet" : `${count} page${count === 1 ? "" : "s"}`),
          },
          {
            title: "Last updated",
            dataIndex: "updatedAt",
            width: 200,
            render: (value: string) => dayjs(value).format("D MMM YYYY, HH:mm"),
          },
          {
            title: "",
            key: "actions",
            width: 100,
            render: (_, record) => (
              <div className="flex justify-end gap-1">
                <IconButton
                  id={`global-section-${record.id}-edit`}
                  title="Edit"
                  onClick={() => router.push(`/dashboard/global-sections/${record.id}`)}
                  icon={<IconEdit />}
                  variant="muted"
                />
                <IconButton
                  id={`global-section-${record.id}-delete`}
                  title={record.usageCount > 0 ? "Remove it from every page before deleting" : "Delete"}
                  onClick={() => handleDelete(record)}
                  icon={<IconTrash />}
                  variant="danger"
                  disabled={record.usageCount > 0}
                />
              </div>
            ),
          },
        ]}
      />

      <Modal
        open={createOpen}
        title="New Global Section"
        okText="Create"
        onOk={handleCreate}
        okButtonProps={{ disabled: !name.trim(), loading: creating }}
        onCancel={() => setCreateOpen(false)}
        destroyOnHidden
      >
        <div className="flex flex-col gap-1 pt-2">
          <label htmlFor="global-section-name" className="text-xs font-semibold tracking-wide text-text-muted uppercase">
            Name (only shown in the backoffice)
          </label>
          <Input
            id="global-section-name"
            autoFocus
            value={name}
            placeholder="e.g. Responsible Gaming band"
            onChange={(e) => setName(e.target.value)}
            onPressEnter={() => name.trim() && handleCreate()}
          />
        </div>
      </Modal>
    </section>
  );
}
