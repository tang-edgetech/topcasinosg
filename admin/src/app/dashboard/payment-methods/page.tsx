"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, App as AntApp } from "antd";
import { useAuth } from "@/lib/auth-context";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import type { PaymentMethodDTO, RegionDTO } from "@/lib/types";
import IconButton from "@/components/IconButton";
import { IconEdit, IconPlus, IconTrash } from "@/components/Icons";
import StatusBadge from "@/components/content/StatusBadge";
import PublishControl from "@/components/content/PublishControl";
import StatusFilter, { type StatusFilterValue } from "@/components/content/StatusFilter";
import BulkActionBar from "@/components/content/BulkActionBar";
import { runBulkAction, bulkResultMessage } from "@/lib/bulk";
import { CLIENT_TABLE_PAGINATION, FETCH_ALL_PAGE_SIZE } from "@/lib/pagination";

export default function PaymentMethodsPage() {
  const { user } = useAuth();
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodDTO[]>([]);
  const [regions, setRegions] = useState<RegionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("all");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  async function load() {
    setLoading(true);
    try {
      const [paymentMethodData, regionData] = await Promise.all([
        api.get<{ paymentMethods: PaymentMethodDTO[] | null; total: number }>(
          `/api/admin/payment-methods?pageSize=${FETCH_ALL_PAGE_SIZE}`
        ),
        api.get<{ regions: RegionDTO[] | null }>("/api/admin/regions"),
      ]);
      setPaymentMethods(paymentMethodData.paymentMethods ?? []);
      setRegions(regionData.regions ?? []);
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not load payment methods.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return null;

  const filtered = statusFilter === "all" ? paymentMethods : paymentMethods.filter((pm) => pm.status === statusFilter);
  const selectedPaymentMethods = paymentMethods.filter((pm) => selectedRowKeys.includes(pm.id));

  const regionName = (id: number) => regions.find((r) => r.id === id)?.name ?? id;

  async function handleSetStatus(paymentMethod: PaymentMethodDTO, status: string, publishAt: string | null) {
    await api.put(`/api/admin/payment-methods/${paymentMethod.id}/status`, { status, publishAt });
    message.success("Publish settings updated.");
    load();
  }

  async function handleDelete(paymentMethod: PaymentMethodDTO) {
    const ok = await confirm({
      title: "Delete Payment Method",
      message: `Delete "${paymentMethod.name}"? This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    try {
      await api.del(`/api/admin/payment-methods/${paymentMethod.id}`);
      message.success("Deleted.");
      load();
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not delete payment method.");
    }
  }

  async function handleBulkStatus(status: "published" | "draft") {
    const ok = await confirm({
      title: status === "published" ? "Publish Payment Methods" : "Set Payment Methods to Draft",
      message: `${status === "published" ? "Publish" : "Set to draft"} ${selectedPaymentMethods.length} payment method(s)?`,
      confirmLabel: status === "published" ? "Publish" : "Set to Draft",
    });
    if (!ok) return;
    const { succeeded, failed } = await runBulkAction(selectedPaymentMethods, (pm) =>
      api.put(`/api/admin/payment-methods/${pm.id}/status`, { status, publishAt: null })
    );
    message[failed > 0 ? "warning" : "success"](bulkResultMessage(succeeded, failed, "updated"));
    setSelectedRowKeys([]);
    load();
  }

  async function handleBulkDelete() {
    const ok = await confirm({
      title: "Delete Payment Methods",
      message: `Delete ${selectedPaymentMethods.length} payment method(s)? This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    const { succeeded, failed } = await runBulkAction(selectedPaymentMethods, (pm) => api.del(`/api/admin/payment-methods/${pm.id}`));
    message[failed > 0 ? "warning" : "success"](bulkResultMessage(succeeded, failed, "deleted"));
    setSelectedRowKeys([]);
    load();
  }

  return (
    <section id="payment-methods-page" className="payment-methods-page flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text dark:text-text-dark">Payment Methods</h1>
        <IconButton
          id="payment-methods-add-button"
          title="Add Payment Method"
          onClick={() => router.push("/dashboard/payment-methods/new")}
          icon={<IconPlus />}
        />
      </div>

      <div className="flex items-center gap-3">
        <StatusFilter id="payment-methods-status-filter" value={statusFilter} onChange={setStatusFilter} />
      </div>

      <BulkActionBar
        count={selectedRowKeys.length}
        onClear={() => setSelectedRowKeys([])}
        actions={[
          { id: "payment-methods-bulk-publish", label: "Publish", onClick: () => handleBulkStatus("published") },
          { id: "payment-methods-bulk-draft", label: "Set to Draft", onClick: () => handleBulkStatus("draft") },
          { id: "payment-methods-bulk-delete", label: "Delete", onClick: handleBulkDelete, danger: true },
        ]}
      />

      <Table
        id="payment-methods-table"
        rowKey="id"
        loading={loading}
        dataSource={filtered}
        pagination={CLIENT_TABLE_PAGINATION}
        rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
        columns={[
          { title: "Name", dataIndex: "name", key: "name", sorter: (a, b) => a.name.localeCompare(b.name) },
          { title: "Region", key: "region", render: (_, pm) => regionName(pm.regionId) },
          {
            title: "Status",
            key: "status",
            render: (_, pm) => <StatusBadge status={pm.status} />,
            sorter: (a, b) => a.status.localeCompare(b.status),
          },
          {
            title: "Actions",
            key: "actions",
            render: (_, pm) => (
              <div className="flex items-center gap-2">
                {pm.status !== "published" && (
                  <PublishControl
                    id={`payment-method-${pm.id}-publish`}
                    status={pm.status}
                    publishAt={pm.publishAt}
                    onSave={(status, publishAt) => handleSetStatus(pm, status, publishAt)}
                  />
                )}
                <IconButton
                  id={`payment-method-${pm.id}-edit`}
                  title="Edit Payment Method"
                  onClick={() => router.push(`/dashboard/payment-methods/${pm.id}`)}
                  icon={<IconEdit />}
                  variant="muted"
                />
                <IconButton
                  id={`payment-method-${pm.id}-delete`}
                  title="Delete Payment Method"
                  onClick={() => handleDelete(pm)}
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
