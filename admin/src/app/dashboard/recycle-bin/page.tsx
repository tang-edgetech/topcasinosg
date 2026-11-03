"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { App as AntApp } from "antd";
import { api, ApiError } from "@/lib/api";
import { useConfirm } from "@/components/ConfirmDialog";
import PageHeading from "@/components/PageHeading";
import type { RecycleBinItemDTO } from "@/lib/types";

dayjs.extend(relativeTime);

const MUTED_CLASS = "text-sm text-text-muted dark:text-text-muted-dark";
const SECONDARY_BUTTON_CLASS =
  "btn cursor-pointer rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-text dark:border-border-dark dark:text-text-dark disabled:cursor-not-allowed disabled:opacity-60";
const DANGER_BUTTON_CLASS =
  "btn cursor-pointer rounded-md border border-danger px-3 py-1.5 text-xs font-semibold text-danger disabled:cursor-not-allowed disabled:opacity-60";

// Each binned item's admin area: its name and where it's edited.
const ITEM_TYPES: Record<string, { label: string; href: (id: number) => string }> = {
  pages: { label: "Page", href: (id) => `/dashboard/pages/${id}` },
  news: { label: "News", href: (id) => `/dashboard/news/${id}` },
  casinos: { label: "Casino", href: (id) => `/dashboard/casinos/${id}` },
  bonuses: { label: "Bonus", href: (id) => `/dashboard/bonuses/${id}` },
  "payment-methods": { label: "Payment Method", href: (id) => `/dashboard/payment-methods/${id}` },
  rtp: { label: "RTP Entry", href: (id) => `/dashboard/rtp/${id}` },
  guides: { label: "Guide", href: (id) => `/dashboard/guides/${id}` },
  blacklist: { label: "Blacklist", href: (id) => `/dashboard/blacklist/${id}` },
  snippets: { label: "Snippet", href: (id) => `/dashboard/snippets/code/${id}` },
};

// Recycle Bin: what Direct API keys deleted, kept off the site for 30 days
// so it can be restored. Data: /api/admin/recycle-bin.
export default function RecycleBinPage() {
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const [items, setItems] = useState<RecycleBinItemDTO[] | null>(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  function load() {
    return api.get<{ items: RecycleBinItemDTO[] }>("/api/admin/recycle-bin").then(
      (data) => setItems(data.items ?? []),
      (err) => setError(err instanceof ApiError ? err.message : "Could not load the Recycle Bin."),
    );
  }

  useEffect(() => {
    load();
  }, []);

  async function handleRestore(item: RecycleBinItemDTO) {
    setBusyId(item.id);
    try {
      await api.post(`/api/admin/recycle-bin/${item.id}/restore`, {});
      message.success(`"${item.label}" restored.`);
      await load();
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not restore it.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDeleteNow(item: RecycleBinItemDTO) {
    const ok = await confirm({
      title: "Delete for Good",
      message: `Delete "${item.label}" for good? This can't be undone.`,
      confirmLabel: "Delete Now",
      danger: true,
    });
    if (!ok) return;
    setBusyId(item.id);
    try {
      await api.post(`/api/admin/recycle-bin/${item.id}/delete`, {});
      message.success(`"${item.label}" deleted.`);
      await load();
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not delete it.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section id="recycle-bin-page" className="flex flex-col gap-6">
      <PageHeading title="Recycle Bin" help="recycleBin" />
      <p className={`${MUTED_CLASS} max-w-3xl`}>
        What a Direct API key (usually an AI assistant) has deleted. Each item is already off the website, and is deleted for good after
        30 days. Restore puts it back exactly as it was.
      </p>

      {error && <p className="form-error text-sm text-danger">{error}</p>}

      {!items ? (
        <p className={MUTED_CLASS}>Loading…</p>
      ) : items.length === 0 ? (
        <p className={MUTED_CLASS}>The Recycle Bin is empty.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border dark:border-border-dark">
          <table id="recycle-bin-table" className="w-full text-left text-sm">
            <thead className="bg-surface-muted text-xs text-text-muted uppercase dark:bg-surface-muted-dark dark:text-text-muted-dark">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Item</th>
                <th className="px-4 py-2.5 font-semibold">Type</th>
                <th className="px-4 py-2.5 font-semibold">Was</th>
                <th className="px-4 py-2.5 font-semibold">Deleted</th>
                <th className="px-4 py-2.5 font-semibold">Gone for good</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-border-dark">
              {items.map((item) => {
                const type = ITEM_TYPES[item.itemType];
                return (
                  <tr key={item.id} id={`recycle-bin-item-${item.id}`}>
                    <td className="px-4 py-3 font-medium text-text dark:text-text-dark">
                      {type ? (
                        <Link href={type.href(item.itemId)} className="cursor-pointer hover:underline">
                          {item.label || `#${item.itemId}`}
                        </Link>
                      ) : (
                        item.label || `#${item.itemId}`
                      )}
                    </td>
                    <td className="px-4 py-3 text-text dark:text-text-dark">{type?.label ?? item.itemType}</td>
                    <td className="px-4 py-3 text-text-muted capitalize dark:text-text-muted-dark">{item.previousStatus || "—"}</td>
                    <td className="px-4 py-3 text-text-muted dark:text-text-muted-dark">
                      {dayjs(item.deletedAt).fromNow()}
                      {item.apiKeyName && ` by key "${item.apiKeyName}"`}
                    </td>
                    <td className="px-4 py-3 text-text-muted dark:text-text-muted-dark">{dayjs(item.deleteAfter).format("D MMM YYYY")}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          id={`recycle-bin-item-${item.id}-restore`}
                          onClick={() => handleRestore(item)}
                          disabled={busyId !== null}
                          className={SECONDARY_BUTTON_CLASS}
                        >
                          Restore
                        </button>
                        <button
                          type="button"
                          id={`recycle-bin-item-${item.id}-delete`}
                          onClick={() => handleDeleteNow(item)}
                          disabled={busyId !== null}
                          className={DANGER_BUTTON_CLASS}
                        >
                          Delete Now
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
