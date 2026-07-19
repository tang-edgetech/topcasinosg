"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Select, App as AntApp } from "antd";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import type { PaymentMethodDTO, RegionDTO, MediaDTO } from "@/lib/types";
import { IconPhoto } from "@/components/Icons";
import MediaPicker from "@/components/media/MediaPicker";

const { TextArea } = Input;

function mediaUrl(url: string) {
  return url.startsWith("http") ? url : `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090"}${url}`;
}

export default function PaymentMethodForm({ target, regions }: { target: PaymentMethodDTO | null; regions: RegionDTO[] }) {
  const router = useRouter();
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [iconMediaId, setIconMediaId] = useState<number | null>(target?.iconMediaId ?? null);
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  async function handleFinish(values: { regionId: number; name: string; description: string }) {
    const ok = await confirm({
      title: target ? "Save Changes" : "Add Payment Method",
      message: target ? `Update "${values.name}"?` : `Create payment method "${values.name}"?`,
    });
    if (!ok) return;

    setSubmitting(true);
    const body = { ...values, iconMediaId };
    try {
      if (target) {
        await api.put(`/api/admin/payment-methods/${target.id}`, body);
      } else {
        await api.post("/api/admin/payment-methods", body);
      }
      router.push("/dashboard/payment-methods");
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not save payment method.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div id="payment-method-form" className="payment-method-form flex max-w-2xl flex-col gap-6">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          regionId: target?.regionId,
          name: target?.name ?? "",
          description: target?.description ?? "",
        }}
      >
        <div className="mb-4 flex flex-col gap-2">
          <label className="text-sm font-medium text-text dark:text-text-dark">Icon</label>
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-md bg-surface-muted dark:bg-surface-muted-dark">
              {iconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={iconUrl} alt="Icon" className="h-full w-full object-cover" />
              ) : (
                <IconPhoto width={22} height={22} className="text-primary-400" />
              )}
            </div>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="cursor-pointer text-sm font-medium text-primary-600 hover:text-primary-900"
            >
              Choose From Media Library
            </button>
          </div>
        </div>

        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input placeholder="Visa, PayNow, Bank Transfer..." />
        </Form.Item>
        <Form.Item name="regionId" label="Region" rules={[{ required: true }]}>
          <Select options={regions.map((r) => ({ value: r.id, label: r.name }))} />
        </Form.Item>
        <Form.Item name="description" label="Description" rules={[{ required: true }]}>
          <TextArea rows={4} />
        </Form.Item>

        <div className="flex gap-3">
          <button
            type="button"
            id="payment-method-form-cancel"
            onClick={() => router.push("/dashboard/payment-methods")}
            className="btn cursor-pointer rounded-md border border-border px-4 py-2 text-sm font-semibold text-text hover:bg-surface-muted dark:border-border-dark dark:text-text-dark dark:hover:bg-surface-muted-dark"
          >
            Cancel
          </button>
          <button
            type="submit"
            id="payment-method-form-submit"
            disabled={submitting}
            className="btn btn--primary cursor-pointer rounded-md bg-primary-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Save"}
          </button>
        </div>
      </Form>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(media: MediaDTO) => {
          setIconMediaId(media.id);
          setIconUrl(mediaUrl(media.url));
        }}
      />
    </div>
  );
}
