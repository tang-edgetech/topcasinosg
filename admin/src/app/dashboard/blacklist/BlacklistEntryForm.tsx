"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, InputNumber, Select, App as AntApp } from "antd";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import type { BlacklistEntryDTO, MediaDTO, RegionDTO } from "@/lib/types";
import MediaField from "@/components/media/MediaField";
import RichTextEditor from "@/components/content/RichTextEditor";

const { TextArea } = Input;

function mediaUrl(url: string) {
  return url.startsWith("http") ? url : `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090"}${url}`;
}

export default function BlacklistEntryForm({
  target,
  regions,
}: {
  target: BlacklistEntryDTO | null;
  regions: RegionDTO[];
}) {
  const router = useRouter();
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [logoMediaId, setLogoMediaId] = useState<number | null>(target?.logoMediaId ?? null);
  const [logoUrl, setLogoUrl] = useState<string | null>(target?.logoUrl ? mediaUrl(target.logoUrl) : null);

  async function handleFinish(values: {
    name: string;
    reason: string;
    reasons?: string[];
    rating?: number | null;
    details: string;
    regionId?: number;
  }) {
    const ok = await confirm({
      title: target ? "Save Changes" : "Add Blacklist Entry",
      message: target ? `Update "${values.name}"?` : `Create blacklist entry "${values.name}"?`,
    });
    if (!ok) return;

    setSubmitting(true);
    const body = {
      name: values.name,
      reason: values.reason,
      reasons: values.reasons ?? [],
      rating: values.rating ?? null,
      logoMediaId,
      details: values.details,
      regionId: values.regionId ?? null,
    };
    try {
      if (target) {
        await api.put(`/api/admin/blacklist/${target.id}`, body);
      } else {
        await api.post("/api/admin/blacklist", body);
      }
      router.push("/dashboard/blacklist");
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not save blacklist entry.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div id="blacklist-form" className="blacklist-form flex max-w-2xl flex-col gap-6">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          name: target?.name ?? "",
          reason: target?.reason ?? "",
          reasons: target?.reasons ?? [],
          rating: target?.rating ?? undefined,
          details: target?.details ?? "",
          regionId: target?.regionId ?? undefined,
        }}
      >
        <div className="mb-4 flex flex-col gap-2">
          <label className="text-sm font-medium text-text dark:text-text-dark">Logo</label>
          <MediaField
            url={logoUrl}
            alt="Logo"
            onSelect={(media: MediaDTO) => {
              setLogoMediaId(media.id);
              setLogoUrl(mediaUrl(media.url));
            }}
            onRemove={() => {
              setLogoMediaId(null);
              setLogoUrl(null);
            }}
          />
        </div>

        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input placeholder="Operator or site name" />
        </Form.Item>
        <Form.Item name="reason" label="Reason" rules={[{ required: true }]}>
          <TextArea rows={2} placeholder="Short summary of why this operator is blacklisted" />
        </Form.Item>
        <Form.Item name="reasons" label="Reasons (Card List)" extra="Short labels shown on the region page's blacklist slider cards.">
          <Select mode="tags" placeholder="Payment Issues, No Licensing, Rigged Games..." />
        </Form.Item>
        <Form.Item name="rating" label="Rating (0-10)">
          <InputNumber min={0} max={10} step={0.1} precision={1} className="w-full" placeholder="1.6" />
        </Form.Item>
        <Form.Item
          name="regionId"
          label="Region"
          extra="Leave blank for a global entry shown on the site-wide /blacklist index."
        >
          <Select allowClear placeholder="Global" options={regions.map((r) => ({ value: r.id, label: r.name }))} />
        </Form.Item>
        <Form.Item name="details" label="Details" rules={[{ required: true }]}>
          <RichTextEditor id="blacklist-form-details" value="" onChange={() => {}} />
        </Form.Item>

        <div className="flex gap-3">
          <button
            type="button"
            id="blacklist-form-cancel"
            onClick={() => router.push("/dashboard/blacklist")}
            className="btn cursor-pointer rounded-md border border-border px-4 py-2 text-sm font-semibold text-text hover:bg-surface-muted dark:border-border-dark dark:text-text-dark dark:hover:bg-surface-muted-dark"
          >
            Cancel
          </button>
          <button
            type="submit"
            id="blacklist-form-submit"
            disabled={submitting}
            className="btn btn--primary cursor-pointer rounded-md bg-primary-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Save"}
          </button>
        </div>
      </Form>
    </div>
  );
}
