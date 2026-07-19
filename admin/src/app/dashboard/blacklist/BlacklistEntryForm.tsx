"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, App as AntApp } from "antd";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import type { BlacklistEntryDTO } from "@/lib/types";
import RichTextEditor from "@/components/content/RichTextEditor";

const { TextArea } = Input;

export default function BlacklistEntryForm({ target }: { target: BlacklistEntryDTO | null }) {
  const router = useRouter();
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  async function handleFinish(values: { name: string; reason: string; details: string }) {
    const ok = await confirm({
      title: target ? "Save Changes" : "Add Blacklist Entry",
      message: target ? `Update "${values.name}"?` : `Create blacklist entry "${values.name}"?`,
    });
    if (!ok) return;

    setSubmitting(true);
    const body = {
      name: values.name,
      reason: values.reason,
      details: values.details,
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
          details: target?.details ?? "",
        }}
      >
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input placeholder="Operator or site name" />
        </Form.Item>
        <Form.Item name="reason" label="Reason" rules={[{ required: true }]}>
          <TextArea rows={2} placeholder="Short summary of why this operator is blacklisted" />
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
