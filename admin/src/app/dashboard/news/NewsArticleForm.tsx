"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, App as AntApp } from "antd";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import type { NewsArticleDTO, MediaDTO } from "@/lib/types";
import { IconPhoto } from "@/components/Icons";
import MediaPicker from "@/components/media/MediaPicker";
import RichTextEditor from "@/components/content/RichTextEditor";

const { TextArea } = Input;

function mediaUrl(url: string) {
  return url.startsWith("http") ? url : `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090"}${url}`;
}

export default function NewsArticleForm({ target }: { target: NewsArticleDTO | null }) {
  const router = useRouter();
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [coverMediaId, setCoverMediaId] = useState<number | null>(target?.coverMediaId ?? null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  async function handleFinish(values: { title: string; slug: string; excerpt: string; content: string }) {
    const ok = await confirm({
      title: target ? "Save Changes" : "Add News Article",
      message: target ? `Update "${values.title}"?` : `Create news article "${values.title}"?`,
    });
    if (!ok) return;

    setSubmitting(true);
    const body = { ...values, coverMediaId };
    try {
      if (target) {
        await api.put(`/api/admin/news/${target.id}`, body);
      } else {
        await api.post("/api/admin/news", body);
      }
      router.push("/dashboard/news");
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not save news article.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div id="news-article-form" className="news-article-form flex max-w-2xl flex-col gap-6">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          title: target?.title ?? "",
          slug: target?.slug ?? "",
          excerpt: target?.excerpt ?? "",
          content: target?.content ?? "",
        }}
      >
        <div className="mb-4 flex flex-col gap-2">
          <label className="text-sm font-medium text-text dark:text-text-dark">Cover Image</label>
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-md bg-surface-muted dark:bg-surface-muted-dark">
              {coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverUrl} alt="Cover" className="h-full w-full object-cover" />
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

        <Form.Item name="title" label="Title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="slug" label="Slug" rules={[{ required: true, pattern: /^[a-z0-9-]+$/, message: "Lowercase letters, numbers, hyphens only" }]}>
          <Input placeholder="how-to-choose-a-safe-online-casino" />
        </Form.Item>
        <Form.Item name="excerpt" label="Excerpt">
          <TextArea rows={2} maxLength={500} showCount />
        </Form.Item>
        <Form.Item name="content" label="Content">
          <RichTextEditor id="news-article-form-content" value="" onChange={() => {}} />
        </Form.Item>

        <div className="flex gap-3">
          <button
            type="button"
            id="news-article-form-cancel"
            onClick={() => router.push("/dashboard/news")}
            className="btn cursor-pointer rounded-md border border-border px-4 py-2 text-sm font-semibold text-text hover:bg-surface-muted dark:border-border-dark dark:text-text-dark dark:hover:bg-surface-muted-dark"
          >
            Cancel
          </button>
          <button
            type="submit"
            id="news-article-form-submit"
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
          setCoverMediaId(media.id);
          setCoverUrl(mediaUrl(media.url));
        }}
      />
    </div>
  );
}
