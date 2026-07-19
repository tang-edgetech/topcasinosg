"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Select, DatePicker, App as AntApp } from "antd";
import dayjs from "dayjs";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import { titleCase } from "@/lib/format";
import type { BonusDTO, BonusType, RegionDTO, CasinoDTO } from "@/lib/types";

const { TextArea } = Input;

const BONUS_TYPES: BonusType[] = ["welcome", "no_deposit", "free_spins", "cashback", "loyalty_vip", "deposit"];

export default function BonusForm({
  target,
  regions,
  casinos,
}: {
  target: BonusDTO | null;
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
    bonusType: BonusType;
    title: string;
    terms: string;
    code?: string;
    validRange?: [dayjs.Dayjs, dayjs.Dayjs];
  }) {
    const ok = await confirm({
      title: target ? "Save Changes" : "Add Bonus",
      message: target ? `Update "${values.title}"?` : `Create bonus "${values.title}"?`,
    });
    if (!ok) return;

    setSubmitting(true);
    const body = {
      regionId: values.regionId,
      casinoId: values.casinoId ?? null,
      bonusType: values.bonusType,
      title: values.title,
      terms: values.terms,
      code: values.code ?? null,
      validFrom: values.validRange?.[0]?.toISOString() ?? null,
      validUntil: values.validRange?.[1]?.toISOString() ?? null,
    };
    try {
      if (target) {
        await api.put(`/api/admin/bonuses/${target.id}`, body);
        message.success("Saved.");
      } else {
        await api.post("/api/admin/bonuses", body);
        message.success("Bonus created.");
      }
      router.push("/dashboard/bonuses");
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not save bonus.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div id="bonus-form" className="bonus-form flex max-w-2xl flex-col gap-6">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          regionId: target?.regionId,
          casinoId: target?.casinoId ?? undefined,
          bonusType: target?.bonusType ?? "welcome",
          title: target?.title ?? "",
          terms: target?.terms ?? "",
          code: target?.code ?? "",
          validRange:
            target?.validFrom && target?.validUntil ? [dayjs(target.validFrom), dayjs(target.validUntil)] : undefined,
        }}
      >
        <Form.Item name="title" label="Title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="bonusType" label="Bonus Type" rules={[{ required: true }]}>
          <Select options={BONUS_TYPES.map((t) => ({ value: t, label: titleCase(t) }))} />
        </Form.Item>
        <Form.Item name="regionId" label="Region" rules={[{ required: true }]}>
          <Select options={regions.map((r) => ({ value: r.id, label: r.name }))} />
        </Form.Item>
        <Form.Item name="casinoId" label="Casino (Optional)">
          <Select allowClear options={casinos.map((c) => ({ value: c.id, label: c.name }))} />
        </Form.Item>
        <Form.Item name="terms" label="Terms" rules={[{ required: true }]}>
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item name="code" label="Bonus Code">
          <Input placeholder="WELCOME100" />
        </Form.Item>
        <Form.Item name="validRange" label="Valid Period">
          <DatePicker.RangePicker className="w-full" />
        </Form.Item>

        <div className="flex gap-3">
          <button
            type="button"
            id="bonus-form-cancel"
            onClick={() => router.push("/dashboard/bonuses")}
            className="btn cursor-pointer rounded-md border border-border px-4 py-2 text-sm font-semibold text-text hover:bg-surface-muted dark:border-border-dark dark:text-text-dark dark:hover:bg-surface-muted-dark"
          >
            Cancel
          </button>
          <button
            type="submit"
            id="bonus-form-submit"
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
