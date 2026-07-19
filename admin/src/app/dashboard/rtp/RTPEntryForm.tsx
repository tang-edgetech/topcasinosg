"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, InputNumber, Select, App as AntApp } from "antd";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import { titleCase } from "@/lib/format";
import type { RTPEntryDTO, RTPCategory, RegionDTO, CasinoDTO } from "@/lib/types";

const RTP_CATEGORIES: RTPCategory[] = ["slot", "table", "live", "other"];

export default function RTPEntryForm({
  target,
  regions,
  casinos,
}: {
  target: RTPEntryDTO | null;
  regions: RegionDTO[];
  casinos: CasinoDTO[];
}) {
  const router = useRouter();
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  async function handleFinish(values: {
    regionId: number;
    casinoId?: number;
    gameName: string;
    category: RTPCategory;
    rtpPercentage: number;
  }) {
    const ok = await confirm({
      title: target ? "Save Changes" : "Add RTP Entry",
      message: target ? `Update "${values.gameName}"?` : `Create RTP entry "${values.gameName}"?`,
    });
    if (!ok) return;

    setSubmitting(true);
    const body = {
      regionId: values.regionId,
      casinoId: values.casinoId ?? null,
      gameName: values.gameName,
      category: values.category,
      rtpPercentage: values.rtpPercentage,
    };
    try {
      if (target) {
        await api.put(`/api/admin/rtp/${target.id}`, body);
      } else {
        await api.post("/api/admin/rtp", body);
      }
      router.push("/dashboard/rtp");
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not save RTP entry.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div id="rtp-form" className="rtp-form flex max-w-2xl flex-col gap-6">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          regionId: target?.regionId,
          casinoId: target?.casinoId ?? undefined,
          gameName: target?.gameName ?? "",
          category: target?.category ?? "slot",
          rtpPercentage: target?.rtpPercentage ?? 96,
        }}
      >
        <Form.Item name="gameName" label="Game Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="category" label="Category" rules={[{ required: true }]}>
          <Select options={RTP_CATEGORIES.map((c) => ({ value: c, label: titleCase(c) }))} />
        </Form.Item>
        <Form.Item name="regionId" label="Region" rules={[{ required: true }]}>
          <Select options={regions.map((r) => ({ value: r.id, label: r.name }))} />
        </Form.Item>
        <Form.Item name="casinoId" label="Casino (Optional)">
          <Select allowClear options={casinos.map((c) => ({ value: c.id, label: c.name }))} />
        </Form.Item>
        <Form.Item name="rtpPercentage" label="RTP %" rules={[{ required: true }]}>
          <InputNumber className="w-full" min={0} max={100} step={0.01} precision={2} />
        </Form.Item>

        <div className="flex gap-3">
          <button
            type="button"
            id="rtp-form-cancel"
            onClick={() => router.push("/dashboard/rtp")}
            className="btn cursor-pointer rounded-md border border-border px-4 py-2 text-sm font-semibold text-text hover:bg-surface-muted dark:border-border-dark dark:text-text-dark dark:hover:bg-surface-muted-dark"
          >
            Cancel
          </button>
          <button
            type="submit"
            id="rtp-form-submit"
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
