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
import { DEFAULT_PAGE_SIZE, tablePagination } from "@/lib/pagination";

export default function PaymentMethodsPage() {
  const { user } = useAuth();
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodDTO[]>([]);
  const [regions, setRegions] = useState<RegionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [total, setTotal] = useState(0);

  async function load() {
    setLoading(true);
    try {
      const [paymentMethodData, regionData] = await Promise.all([
        api.get<{ paymentMethods: PaymentMethodDTO[] | null; total: number }>(
          `/api/admin/payment-methods?page=${page}&pageSize=${pageSize}`
        ),
        api.get<{ regions: RegionDTO[] | null }>("/api/admin/regions"),
      ]);
      setPaymentMethods(paymentMethodData.paymentMethods ?? []);
      setTotal(paymentMethodData.total);
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
  }, [page, pageSize]);

  if (!user) return null;

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

      <Table
        id="payment-methods-table"
        rowKey="id"
        loading={loading}
        dataSource={paymentMethods}
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
          { title: "Region", key: "region", render: (_, pm) => regionName(pm.regionId) },
          { title: "Status", key: "status", render: (_, pm) => <StatusBadge status={pm.status} /> },
          {
            title: "Schedule",
            key: "schedule",
            render: (_, pm) => (
              <PublishControl
                id={`payment-method-${pm.id}-publish`}
                status={pm.status}
                publishAt={pm.publishAt}
                onSave={(status, publishAt) => handleSetStatus(pm, status, publishAt)}
              />
            ),
          },
          {
            title: "Actions",
            key: "actions",
            render: (_, pm) => (
              <div className="flex gap-2">
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
