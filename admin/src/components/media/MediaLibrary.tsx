"use client";

import { useCallback, useEffect, useState } from "react";
import { Upload, Segmented, Pagination, Drawer, Input, App as AntApp } from "antd";
import type { UploadProps } from "antd";

// antd doesn't re-export the customRequest option type from its public
// entrypoint — derive it from UploadProps instead of reaching into
// @rc-component/upload's internal path, which can shift between versions.
type UploadRequestOption = Parameters<NonNullable<UploadProps["customRequest"]>>[0];
import { api, ApiError } from "@/lib/api";
import { formatFileSize } from "@/lib/format";
import { useConfirm } from "@/components/ConfirmDialog";
import IconButton from "@/components/IconButton";
import { IconUpload, IconPhoto, IconFile, IconMusicNote, IconFilm, IconTrash, IconCopy } from "@/components/Icons";
import type { MediaDTO, MediaKind } from "@/lib/types";

const { TextArea } = Input;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";
const PAGE_SIZE = 24;

const KIND_FILTERS: { label: string; value: MediaKind | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Images", value: "image" },
  { label: "Documents", value: "document" },
  { label: "Audio", value: "audio" },
  { label: "Video", value: "video" },
];

function kindIcon(kind: MediaKind, size = 28) {
  switch (kind) {
    case "image":
      return <IconPhoto width={size} height={size} />;
    case "audio":
      return <IconMusicNote width={size} height={size} />;
    case "video":
      return <IconFilm width={size} height={size} />;
    default:
      return <IconFile width={size} height={size} />;
  }
}

function mediaUrl(media: MediaDTO) {
  return media.url.startsWith("http") ? media.url : `${API_URL}${media.url}`;
}

interface MediaLibraryProps {
  selectable?: boolean;
  onSelect?: (media: MediaDTO) => void;
}

export default function MediaLibrary({ selectable = false, onSelect }: MediaLibraryProps) {
  const { message } = AntApp.useApp();
  const [items, setItems] = useState<MediaDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [kind, setKind] = useState<MediaKind | "all">("all");
  const [loading, setLoading] = useState(true);
  const [detailItem, setDetailItem] = useState<MediaDTO | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
      if (kind !== "all") query.set("kind", kind);
      const data = await api.get<{ media: MediaDTO[] | null; total: number }>(`/api/admin/media?${query}`);
      setItems(data.media ?? []);
      setTotal(data.total);
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not load media.");
    } finally {
      setLoading(false);
    }
  }, [page, kind, message]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleUpload(options: UploadRequestOption) {
    const form = new FormData();
    form.append("file", options.file as Blob);
    try {
      await api.upload("/api/admin/media", form);
      options.onSuccess?.({});
      message.success("Uploaded.");
      setPage(1);
      setKind("all");
      load();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Upload failed.";
      options.onError?.(new Error(msg));
      message.error(msg);
    }
  }

  const uploadProps: UploadProps = {
    multiple: true,
    showUploadList: false,
    customRequest: handleUpload,
  };

  function handleItemClick(item: MediaDTO) {
    if (selectable) {
      onSelect?.(item);
      return;
    }
    setDetailItem(item);
  }

  return (
    <div id="media-library" className="media-library flex flex-col gap-6">
      <Upload.Dragger id="media-library-dragger" {...uploadProps} className="media-library__dragger">
        <p className="flex justify-center text-primary-500">
          <IconUpload width={28} height={28} />
        </p>
        <p className="mt-2 text-sm font-medium text-text dark:text-text-dark">
          Click or drag files here to upload
        </p>
        <p className="text-xs text-text-muted dark:text-text-muted-dark">
          Images, documents, audio, video — up to 200MB per file
        </p>
      </Upload.Dragger>

      <Segmented
        id="media-library-kind-filter"
        value={kind}
        onChange={(v) => {
          setKind(v as MediaKind | "all");
          setPage(1);
        }}
        options={KIND_FILTERS}
      />

      {loading ? (
        <p className="text-text-muted dark:text-text-muted-dark">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-text-muted dark:text-text-muted-dark">No files yet.</p>
      ) : (
        <div className="media-library__grid grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {items.map((item) => (
            <div
              key={item.id}
              id={`media-item-${item.id}`}
              className="media-item group relative flex cursor-pointer flex-col overflow-hidden rounded-lg border border-border bg-surface hover:border-primary-500 dark:border-border-dark dark:bg-surface-dark"
              onClick={() => handleItemClick(item)}
            >
              <div className="media-item__thumb flex h-24 items-center justify-center bg-surface-muted text-primary-400 dark:bg-surface-muted-dark">
                {item.kind === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaUrl(item)} alt={item.altText || item.originalFilename} className="h-full w-full object-cover" />
                ) : (
                  kindIcon(item.kind)
                )}
              </div>
              <div className="media-item__meta flex flex-col gap-0.5 p-2">
                <p className="truncate text-xs font-medium text-text dark:text-text-dark" title={item.title || item.originalFilename}>
                  {item.title || item.originalFilename}
                </p>
                <p className="text-[11px] text-text-muted dark:text-text-muted-dark">{formatFileSize(item.fileSize)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {total > PAGE_SIZE && (
        <Pagination current={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} showSizeChanger={false} />
      )}

      <MediaDetailDrawer
        item={detailItem}
        onClose={() => setDetailItem(null)}
        onSaved={(updated) => {
          setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
          setDetailItem(updated);
        }}
        onDeleted={(id) => {
          setItems((prev) => prev.filter((i) => i.id !== id));
          setDetailItem(null);
          load();
        }}
      />
    </div>
  );
}

function MediaDetailDrawer({
  item,
  onClose,
  onSaved,
  onDeleted,
}: {
  item: MediaDTO | null;
  onClose: () => void;
  onSaved: (updated: MediaDTO) => void;
  onDeleted: (id: number) => void;
}) {
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const [title, setTitle] = useState("");
  const [altText, setAltText] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setAltText(item.altText);
      setDescription(item.description);
    }
  }, [item]);

  if (!item) return null;

  async function handleCopyLink() {
    if (!item) return;
    try {
      await navigator.clipboard.writeText(mediaUrl(item));
      message.success("Link copied.");
    } catch {
      message.error("Could not copy link.");
    }
  }

  async function handleSave() {
    if (!item) return;
    setSaving(true);
    try {
      await api.put(`/api/admin/media/${item.id}`, { title, altText, description });
      message.success("Saved.");
      onSaved({ ...item, title, altText, description });
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not save changes.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!item) return;
    const ok = await confirm({
      title: "Delete File",
      message: `Delete "${item.title || item.originalFilename}"? This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    try {
      await api.del(`/api/admin/media/${item.id}`);
      message.success("Deleted.");
      onDeleted(item.id);
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not delete file.");
    }
  }

  return (
    <Drawer
      title="Media Details"
      open={!!item}
      onClose={onClose}
      size={380}
      extra={
        <IconButton id="media-detail-delete" title="Delete File" variant="danger" onClick={handleDelete} icon={<IconTrash />} />
      }
    >
      <div id="media-detail-panel" className="flex flex-col gap-5">
        <div className="flex h-40 items-center justify-center overflow-hidden rounded-md bg-surface-muted text-primary-400 dark:bg-surface-muted-dark">
          {item.kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mediaUrl(item)} alt={item.altText || item.originalFilename} className="h-full w-full object-contain" />
          ) : (
            kindIcon(item.kind, 48)
          )}
        </div>

        <div className="flex flex-col gap-1 text-xs text-text-muted dark:text-text-muted-dark">
          <p>{item.originalFilename}</p>
          <p>
            {formatFileSize(item.fileSize)} · {item.mimeType}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="media-detail-url" className="text-sm font-medium text-text dark:text-text-dark">
            Link
          </label>
          <div className="flex gap-2">
            <input
              id="media-detail-url"
              readOnly
              value={mediaUrl(item)}
              className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-xs text-text outline-none dark:border-border-dark dark:bg-surface-dark dark:text-text-dark"
            />
            <IconButton id="media-detail-copy-link" title="Copy Link" onClick={handleCopyLink} icon={<IconCopy />} variant="muted" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="media-detail-title" className="text-sm font-medium text-text dark:text-text-dark">
            Title
          </label>
          <Input id="media-detail-title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="media-detail-alt-text" className="text-sm font-medium text-text dark:text-text-dark">
            Alt Text
          </label>
          <Input id="media-detail-alt-text" value={altText} onChange={(e) => setAltText(e.target.value)} placeholder="Describes the image for SEO/accessibility" />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="media-detail-description" className="text-sm font-medium text-text dark:text-text-dark">
            Description
          </label>
          <TextArea id="media-detail-description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <button
          type="button"
          id="media-detail-save"
          onClick={handleSave}
          disabled={saving}
          className="btn btn--primary cursor-pointer rounded-md bg-primary-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </Drawer>
  );
}
