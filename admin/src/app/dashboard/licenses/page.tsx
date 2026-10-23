"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, App as AntApp } from "antd";
import { useAuth } from "@/lib/auth-context";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import type { LicenseDTO } from "@/lib/types";
import IconButton from "@/components/IconButton";
import { IconEdit, IconPlus, IconTrash, IconCertificate } from "@/components/Icons";
import BulkActionBar from "@/components/content/BulkActionBar";
import { runBulkAction, bulkResultMessage } from "@/lib/bulk";
import ListToolbar from "@/components/content/ListToolbar";
import { useListView } from "@/lib/useListView";
import PageHeading from "@/components/PageHeading";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";

function mediaUrl(url: string) {
  return url.startsWith("http") ? url : `${API_URL}${url}`;
}

export default function LicensesPage() {
  const { user } = useAuth();
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const router = useRouter();
  const [licenses, setLicenses] = useState<LicenseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  async function load() {
    setLoading(true);
    try {
      const data = await api.get<{ licenses: LicenseDTO[] | null }>("/api/admin/licenses");
      setLicenses(data.licenses ?? []);
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not load licenses.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { filtered, pagination, toolbar } = useListView<LicenseDTO>({
    storageKey: "licenses",
    items: licenses,
    searchText: (item) => item.name,
  });

  if (!user) return null;
  const canManage = user.role === "super_admin" || user.role === "admin";
  const selectedLicenses = licenses.filter((l) => selectedRowKeys.includes(l.id));

  async function handleDelete(license: LicenseDTO) {
    const ok = await confirm({
      title: "Delete License",
      message: `Delete "${license.name}"? Casinos holding it will no longer show it. This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    try {
      await api.del(`/api/admin/licenses/${license.id}`);
      message.success("Deleted.");
      load();
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not delete license.");
    }
  }

  async function handleBulkDelete() {
    const ok = await confirm({
      title: "Delete Licenses",
      message: `Delete ${selectedLicenses.length} license(s)? Casinos holding them will no longer show them. This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    const { succeeded, failed } = await runBulkAction(selectedLicenses, (l) => api.del(`/api/admin/licenses/${l.id}`));
    message[failed > 0 ? "warning" : "success"](bulkResultMessage(succeeded, failed, "deleted"));
    setSelectedRowKeys([]);
    load();
  }

  return (
    <section id="licenses-page" className="licenses-page flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <PageHeading title="Licenses" help="licenses" />
        {canManage && (
          <IconButton
            id="licenses-add-button"
            title="Add License"
            onClick={() => router.push("/dashboard/licenses/new")}
            icon={<IconPlus />}
          />
        )}
      </div>

      <ListToolbar id="licenses-toolbar" searchPlaceholder="Search licenses" {...toolbar} />

      <BulkActionBar
        count={selectedRowKeys.length}
        onClear={() => setSelectedRowKeys([])}
        actions={[...(canManage ? [{ id: "licenses-bulk-delete", label: "Delete", onClick: handleBulkDelete, danger: true }] : [])]}
      />

      <Table
        id="licenses-table"
        rowKey="id"
        loading={loading}
        dataSource={filtered}
        pagination={pagination}
        rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
        columns={[
          {
            title: "Logo",
            key: "logo",
            render: (_, license) => (
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-md border border-border bg-surface-muted dark:border-border-dark dark:bg-surface-muted-dark">
                {license.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaUrl(license.logoUrl)} alt={`${license.name} logo`} className="h-full w-full object-cover" />
                ) : (
                  <IconCertificate width={16} height={16} className="text-primary-400" />
                )}
              </div>
            ),
          },
          { title: "Name", dataIndex: "name", key: "name", sorter: (a, b) => a.name.localeCompare(b.name) },
          { title: "Sort Order", dataIndex: "sortOrder", key: "sortOrder" },
          ...(canManage
            ? [
                {
                  title: "Actions",
                  key: "actions",
                  render: (_: unknown, license: LicenseDTO) => (
                    <div className="flex gap-2">
                      <IconButton
                        id={`license-${license.id}-edit`}
                        title="Edit License"
                        onClick={() => router.push(`/dashboard/licenses/${license.id}`)}
                        icon={<IconEdit />}
                        variant="muted"
                      />
                      <IconButton
                        id={`license-${license.id}-delete`}
                        title="Delete License"
                        onClick={() => handleDelete(license)}
                        icon={<IconTrash />}
                        variant="danger"
                      />
                    </div>
                  ),
                },
              ]
            : []),
        ]}
      />
    </section>
  );
}
