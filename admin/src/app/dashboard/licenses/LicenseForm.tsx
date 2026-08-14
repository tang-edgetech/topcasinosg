"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { App as AntApp } from "antd";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import type { LicenseDTO, MediaDTO } from "@/lib/types";
import { IconCertificate } from "@/components/Icons";
import MediaPicker from "@/components/media/MediaPicker";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";

function mediaUrl(url: string) {
  return url.startsWith("http") ? url : `${API_URL}${url}`;
}

export default function LicenseForm({ target }: { target: LicenseDTO | null }) {
  const router = useRouter();
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const [name, setName] = useState(target?.name ?? "");
  const [sortOrder, setSortOrder] = useState(target?.sortOrder ?? 0);
  const [logoMediaId, setLogoMediaId] = useState<number | null>(target?.logoMediaId ?? null);
  const [logoUrl, setLogoUrl] = useState<string | null>(target?.logoUrl ?? null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setError("");
    const ok = await confirm({
      title: target ? "Save Changes" : "Add License",
      message: target ? `Update "${target.name}"?` : `Create license "${name}"?`,
    });
    if (!ok) return;

    setSubmitting(true);
    try {
      if (target) {
        await api.put(`/api/admin/licenses/${target.id}`, { name, logoMediaId, sortOrder });
        message.success("Saved.");
      } else {
        await api.post("/api/admin/licenses", { name, logoMediaId, sortOrder });
        message.success("License created.");
      }
      router.push("/dashboard/licenses");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save license.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div id="license-form" className="license-form flex max-w-sm flex-col gap-4">
      <form id="license-form-form" className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-text dark:text-text-dark">Logo</label>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-md border border-border bg-surface-muted dark:border-border-dark dark:bg-surface-muted-dark">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                <IconCertificate width={20} height={20} className="text-primary-400" />
              )}
            </div>
            <button
              type="button"
              id="license-form-logo-button"
              onClick={() => setPickerOpen(true)}
              className="cursor-pointer text-sm font-medium text-primary-600 hover:text-primary-900"
            >
              Choose From Media Library
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="license-form-name" className="text-sm font-medium text-text dark:text-text-dark">
            Name
          </label>
          <input
            id="license-form-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary-500 dark:border-border-dark dark:bg-surface-dark dark:text-text-dark"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="license-form-sort-order" className="text-sm font-medium text-text dark:text-text-dark">
            Sort Order
          </label>
          <input
            id="license-form-sort-order"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary-500 dark:border-border-dark dark:bg-surface-dark dark:text-text-dark"
          />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            id="license-form-cancel"
            onClick={() => router.push("/dashboard/licenses")}
            className="cursor-pointer rounded-md px-4 py-2 text-sm font-medium text-text-muted dark:text-text-muted-dark"
          >
            Cancel
          </button>
          <button
            type="submit"
            id="license-form-submit"
            disabled={submitting}
            className="btn btn--primary cursor-pointer rounded-md bg-primary-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Save"}
          </button>
        </div>
      </form>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(media: MediaDTO) => {
          setLogoMediaId(media.id);
          setLogoUrl(mediaUrl(media.url));
        }}
      />
    </div>
  );
}
