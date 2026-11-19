"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, Switch, App as AntApp } from "antd";
import { useAuth } from "@/lib/auth-context";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import type { RedirectDTO } from "@/lib/types";
import IconButton from "@/components/IconButton";
import { IconEdit, IconPlus, IconTrash } from "@/components/Icons";
import BulkActionBar from "@/components/content/BulkActionBar";
import { runBulkAction, bulkResultMessage } from "@/lib/bulk";
import ListToolbar from "@/components/content/ListToolbar";
import { useListView } from "@/lib/useListView";
import PageHeading from "@/components/PageHeading";

// Admin > Redirects: old or unwanted addresses of the website sent on to new
// ones (applied by web/src/proxy.ts).
export default function RedirectsPage() {
  const { user } = useAuth();
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const router = useRouter();
  const [redirects, setRedirects] = useState<RedirectDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // State is set only in the request's callbacks, so the first load can run
  // from an effect.
  function fetchList() {
    return api
      .get<{ redirects: RedirectDTO[] | null }>("/api/admin/redirects")
      .then((data) => setRedirects(data.redirects ?? []))
      .catch((err) => message.error(err instanceof ApiError ? err.message : "Could not load redirects."))
      .finally(() => setLoading(false));
  }

  function load() {
    setLoading(true);
    fetchList();
  }

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { filtered, pagination, toolbar } = useListView<RedirectDTO>({
    storageKey: "redirects",
    items: redirects,
    searchText: (item) => `${item.fromPath} ${item.toUrl} ${item.note}`,
  });

  if (!user) return null;
  const canManage = user.role === "super_admin" || user.role === "admin";
  const selected = redirects.filter((r) => selectedRowKeys.includes(r.id));

  function body(r: RedirectDTO, active: boolean) {
    return { fromPath: r.fromPath, toUrl: r.toUrl, statusCode: r.statusCode, active, note: r.note };
  }

  async function setActive(r: RedirectDTO, active: boolean) {
    try {
      await api.put(`/api/admin/redirects/${r.id}`, body(r, active));
      message.success(active ? "Redirect on." : "Redirect off.");
      load();
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not change the redirect.");
    }
  }

  async function handleDelete(r: RedirectDTO) {
    const ok = await confirm({
      title: "Delete Redirect",
      message: `Delete the redirect from ${r.fromPath}? Visitors to that address will see its own page (or "not found") again. This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    try {
      await api.del(`/api/admin/redirects/${r.id}`);
      message.success("Deleted.");
      load();
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not delete the redirect.");
    }
  }

  async function handleBulk(action: "on" | "off" | "delete") {
    if (action === "delete") {
      const ok = await confirm({
        title: "Delete Redirects",
        message: `Delete ${selected.length} redirect(s)? This cannot be undone.`,
        confirmLabel: "Delete",
        danger: true,
      });
      if (!ok) return;
    }
    const { succeeded, failed } = await runBulkAction(selected, (r) =>
      action === "delete" ? api.del(`/api/admin/redirects/${r.id}`) : api.put(`/api/admin/redirects/${r.id}`, body(r, action === "on")),
    );
    message[failed > 0 ? "warning" : "success"](
      bulkResultMessage(succeeded, failed, action === "delete" ? "deleted" : action === "on" ? "switched on" : "switched off"),
    );
    setSelectedRowKeys([]);
    load();
  }

  return (
    <section id="redirects-page" className="redirects-page flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <PageHeading title="Redirects" help="redirects" />
        {canManage && (
          <IconButton id="redirects-add-button" title="Add Redirect" onClick={() => router.push("/dashboard/redirects/new")} icon={<IconPlus />} />
        )}
      </div>

      <ListToolbar id="redirects-toolbar" searchPlaceholder="Search addresses or notes" {...toolbar} />

      <BulkActionBar
        count={selectedRowKeys.length}
        onClear={() => setSelectedRowKeys([])}
        actions={
          canManage
            ? [
                { id: "redirects-bulk-on", label: "Switch On", onClick: () => handleBulk("on") },
                { id: "redirects-bulk-off", label: "Switch Off", onClick: () => handleBulk("off") },
                { id: "redirects-bulk-delete", label: "Delete", onClick: () => handleBulk("delete"), danger: true },
              ]
            : []
        }
      />

      <Table
        id="redirects-table"
        rowKey="id"
        loading={loading}
        dataSource={filtered}
        pagination={pagination}
        rowSelection={canManage ? { selectedRowKeys, onChange: setSelectedRowKeys } : undefined}
        locale={{ emptyText: "No redirects yet." }}
        columns={[
          {
            title: "Old Address",
            dataIndex: "fromPath",
            key: "fromPath",
            sorter: (a, b) => a.fromPath.localeCompare(b.fromPath),
            render: (v: string) => <code className="text-sm">{v}</code>,
          },
          {
            title: "New Address",
            dataIndex: "toUrl",
            key: "toUrl",
            render: (v: string) => <code className="text-sm break-all">{v}</code>,
          },
          {
            title: "Type",
            dataIndex: "statusCode",
            key: "statusCode",
            render: (v: number) => (v === 302 ? "302 Temporary" : "301 Permanent"),
          },
          {
            title: "On",
            dataIndex: "active",
            key: "active",
            render: (_: boolean, r: RedirectDTO) => (
              <Switch
                id={`redirect-${r.id}-active`}
                size="small"
                checked={r.active}
                disabled={!canManage}
                onChange={(on) => setActive(r, on)}
                aria-label={`Redirect from ${r.fromPath} on`}
              />
            ),
          },
          { title: "Note", dataIndex: "note", key: "note" },
          ...(canManage
            ? [
                {
                  title: "Actions",
                  key: "actions",
                  render: (_: unknown, r: RedirectDTO) => (
                    <div className="flex gap-2">
                      <IconButton id={`redirect-${r.id}-edit`} title="Edit Redirect" href={`/dashboard/redirects/${r.id}`} icon={<IconEdit />} variant="muted" />
                      <IconButton id={`redirect-${r.id}-delete`} title="Delete Redirect" onClick={() => handleDelete(r)} icon={<IconTrash />} variant="danger" />
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
