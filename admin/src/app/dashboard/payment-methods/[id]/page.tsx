"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { App as AntApp } from "antd";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import type { PaymentMethodDTO, RegionDTO } from "@/lib/types";
import PaymentMethodForm from "../PaymentMethodForm";

export default function EditPaymentMethodPage() {
  const { user } = useAuth();
  const { message } = AntApp.useApp();
  const params = useParams<{ id: string }>();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodDTO | null>(null);
  const [regions, setRegions] = useState<RegionDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ paymentMethod: PaymentMethodDTO }>(`/api/admin/payment-methods/${params.id}`),
      api.get<{ regions: RegionDTO[] | null }>("/api/admin/regions"),
    ])
      .then(([paymentMethodData, regionData]) => {
        setPaymentMethod(paymentMethodData.paymentMethod);
        setRegions(regionData.regions ?? []);
      })
      .catch((err) => message.error(err instanceof ApiError ? err.message : "Could not load payment method."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (!user) return null;

  return (
    <section id="payment-method-edit-page" className="payment-method-edit-page flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/payment-methods" className="text-sm font-medium text-primary-600 hover:text-primary-900">
          ← Back to Payment Methods
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-text dark:text-text-dark">Edit Payment Method</h1>
      {loading ? (
        <p className="text-text-muted dark:text-text-muted-dark">Loading…</p>
      ) : paymentMethod ? (
        <PaymentMethodForm target={paymentMethod} regions={regions} />
      ) : (
        <p className="text-text-muted dark:text-text-muted-dark">Payment method not found.</p>
      )}
    </section>
  );
}
