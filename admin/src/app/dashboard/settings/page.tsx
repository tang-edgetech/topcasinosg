"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useSiteSettings } from "@/lib/site-settings-context";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import MediaPicker from "@/components/media/MediaPicker";
import IconButton from "@/components/IconButton";
import { IconUpload, IconPhoto } from "@/components/Icons";
import type { MediaDTO } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";

function assetUrl(url: string) {
  return url.startsWith("http") ? url : `${API_URL}${url}`;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { settings, refresh } = useSiteSettings();
  const confirm = useConfirm();

  const [siteUrl, setSiteUrl] = useState("");
  const [siteTitle, setSiteTitle] = useState("");
  const [seoIndex, setSeoIndex] = useState(false);
  const [seoFollow, setSeoFollow] = useState(false);
  const [timezone, setTimezone] = useState("+08:00");
  const [language, setLanguage] = useState("en");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState("");
  const [mediaPickerField, setMediaPickerField] = useState<"logo" | "favicon" | null>(null);

  useEffect(() => {
    if (!settings) return;
    setSiteUrl(settings.siteUrl);
    setSiteTitle(settings.siteTitle);
    setSeoIndex(settings.seoIndex);
    setSeoFollow(settings.seoFollow);
    setTimezone(settings.timezone);
    setLanguage(settings.language);
  }, [settings]);

  if (!user) return null;

  if (user.role !== "super_admin") {
    return (
      <section id="settings-page" className="settings-page">
        <p className="text-text-muted dark:text-text-muted-dark">You don&apos;t have access to this section.</p>
      </section>
    );
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    const ok = await confirm({
      title: "Save Site Settings",
      message: "This updates global settings for the whole site. Continue?",
      confirmLabel: "Save",
    });
    if (!ok) return;

    setError("");
    setSuccess(false);
    setSubmitting(true);
    try {
      await api.put("/api/admin/settings/site", { siteUrl, siteTitle, seoIndex, seoFollow, timezone, language });
      await refresh();
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save settings.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpload(field: "logo" | "favicon", file: File) {
    setUploadError("");
    const ok = await confirm({
      title: field === "logo" ? "Change Logo" : "Change Favicon",
      message: `Replace the current ${field} with "${file.name}"?`,
      confirmLabel: "Upload",
    });
    if (!ok) return;

    const form = new FormData();
    form.append(field, file);
    try {
      const path = field === "logo" ? "/api/admin/settings/site/logo" : "/api/admin/settings/site/favicon";
      await api.upload(path, form);
      await refresh();
    } catch (err) {
      setUploadError(err instanceof ApiError ? err.message : `Could not upload ${field}.`);
    }
  }

  async function handleSelectFromLibrary(field: "logo" | "favicon", media: MediaDTO) {
    setUploadError("");
    const ok = await confirm({
      title: field === "logo" ? "Change Logo" : "Change Favicon",
      message: `Use "${media.title || media.originalFilename}" as the site ${field}?`,
      confirmLabel: "Use This File",
    });
    if (!ok) return;

    try {
      const path = field === "logo" ? "/api/admin/settings/site/logo" : "/api/admin/settings/site/favicon";
      await api.put(path, { url: media.url });
      await refresh();
    } catch (err) {
      setUploadError(err instanceof ApiError ? err.message : `Could not set ${field}.`);
    }
  }

  return (
    <section id="settings-page" className="settings-page flex flex-col gap-10">
      <h1 className="text-2xl font-bold text-text dark:text-text-dark">Settings</h1>

      <div id="settings-branding" className="settings-branding max-w-lg">
        <h2 className="mb-4 text-lg font-bold text-text dark:text-text-dark">Logo &amp; Favicon</h2>
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-8 items-center">
              {settings?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={assetUrl(settings.logoUrl)} alt="Logo" className="h-8 w-auto max-w-[160px] object-contain" />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary-600 text-sm font-bold text-primary-900">
                  {(settings?.siteTitle || "Top Casino SG").charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-text-muted dark:text-text-muted-dark">Logo</p>
            <div className="flex items-center gap-2">
              <IconButton
                id="settings-logo-upload-button"
                title="Upload New Logo"
                onClick={() => logoInputRef.current?.click()}
                icon={<IconUpload width={14} height={14} />}
                variant="muted"
              />
              <IconButton
                id="settings-logo-media-library-button"
                title="Choose Logo From Media Library"
                onClick={() => setMediaPickerField("logo")}
                icon={<IconPhoto width={14} height={14} />}
                variant="muted"
              />
            </div>
            <input
              ref={logoInputRef}
              id="settings-logo-input"
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp,image/x-icon"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload("logo", file);
              }}
            />
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-8 items-center">
              {settings?.faviconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={assetUrl(settings.faviconUrl)} alt="Favicon" width={32} height={32} className="h-8 w-8 rounded object-contain" />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded bg-surface-muted text-xs text-text-muted dark:bg-surface-muted-dark dark:text-text-muted-dark">
                  —
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-text-muted dark:text-text-muted-dark">Favicon</p>
            <div className="flex items-center gap-2">
              <IconButton
                id="settings-favicon-upload-button"
                title="Upload New Favicon"
                onClick={() => faviconInputRef.current?.click()}
                icon={<IconUpload width={14} height={14} />}
                variant="muted"
              />
              <IconButton
                id="settings-favicon-media-library-button"
                title="Choose Favicon From Media Library"
                onClick={() => setMediaPickerField("favicon")}
                icon={<IconPhoto width={14} height={14} />}
                variant="muted"
              />
            </div>
            <input
              ref={faviconInputRef}
              id="settings-favicon-input"
              type="file"
              accept="image/png,image/x-icon,image/jpeg"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload("favicon", file);
              }}
            />
          </div>
        </div>
        {uploadError && <p className="form-error mt-2 text-sm text-danger">{uploadError}</p>}
        <p className="mt-2 text-xs text-text-muted dark:text-text-muted-dark">
          Leave empty to keep using the first-letter badge shown above.
        </p>
      </div>

      <MediaPicker
        open={mediaPickerField !== null}
        onClose={() => setMediaPickerField(null)}
        onSelect={(media) => {
          if (mediaPickerField) handleSelectFromLibrary(mediaPickerField, media);
          setMediaPickerField(null);
        }}
      />

      <form id="settings-site-form" className="settings-site-form flex max-w-lg flex-col gap-4" onSubmit={handleSubmit}>
        <h2 className="text-lg font-bold text-text dark:text-text-dark">Site</h2>

        <div className="form-field flex flex-col gap-1">
          <label htmlFor="settings-site-title" className="text-sm font-medium text-text dark:text-text-dark">
            Site Title
          </label>
          <input
            id="settings-site-title"
            required
            value={siteTitle}
            onChange={(e) => setSiteTitle(e.target.value)}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary-500 dark:border-border-dark dark:bg-surface-dark dark:text-text-dark"
          />
        </div>

        <div className="form-field flex flex-col gap-1">
          <label htmlFor="settings-site-url" className="text-sm font-medium text-text dark:text-text-dark">
            Site URL
          </label>
          <input
            id="settings-site-url"
            type="url"
            required
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary-500 dark:border-border-dark dark:bg-surface-dark dark:text-text-dark"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="form-field flex flex-col gap-1">
            <label htmlFor="settings-timezone" className="text-sm font-medium text-text dark:text-text-dark">
              Timezone
            </label>
            <select
              id="settings-timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary-500 dark:border-border-dark dark:bg-surface-dark dark:text-text-dark"
            >
              <option value="+08:00">UTC +8:00 (Singapore)</option>
              <option value="+00:00">UTC +0:00</option>
              <option value="+01:00">UTC +1:00</option>
              <option value="+05:30">UTC +5:30</option>
              <option value="+09:00">UTC +9:00</option>
            </select>
          </div>
          <div className="form-field flex flex-col gap-1">
            <label htmlFor="settings-language" className="text-sm font-medium text-text dark:text-text-dark">
              Language
            </label>
            <select
              id="settings-language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary-500 dark:border-border-dark dark:bg-surface-dark dark:text-text-dark"
            >
              <option value="en">English</option>
              <option value="cn">Chinese</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-text dark:text-text-dark">
            <input
              id="settings-seo-index"
              type="checkbox"
              checked={seoIndex}
              onChange={(e) => setSeoIndex(e.target.checked)}
              className="h-4 w-4 cursor-pointer"
            />
            Allow Search Engines To Index This Site
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-text dark:text-text-dark">
            <input
              id="settings-seo-follow"
              type="checkbox"
              checked={seoFollow}
              onChange={(e) => setSeoFollow(e.target.checked)}
              className="h-4 w-4 cursor-pointer"
            />
            Allow Search Engines To Follow Links
          </label>
        </div>

        {error && <p className="form-error text-sm text-danger">{error}</p>}
        {success && <p className="text-sm text-success">Settings saved.</p>}
        <button
          type="submit"
          disabled={submitting}
          className="btn btn--primary cursor-pointer self-start rounded-md bg-primary-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save Settings"}
        </button>
      </form>

      <TwoFactorSettings />
    </section>
  );
}

function TwoFactorSettings() {
  const { settings, refresh } = useSiteSettings();
  const confirm = useConfirm();
  const [error, setError] = useState("");

  async function handleToggle() {
    const next = !settings?.twoFactorEnabled;
    const ok = await confirm({
      title: next ? "Enable Two-Factor Authentication" : "Disable Two-Factor Authentication",
      message: next
        ? "Every admin user will be required to set up an authenticator app on next login (production only)."
        : "Admin users will no longer be required to use two-factor authentication.",
      confirmLabel: next ? "Enable" : "Disable",
      danger: !next,
    });
    if (!ok) return;

    setError("");
    try {
      await api.put("/api/admin/settings/2fa", { enabled: next });
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update 2FA setting.");
    }
  }

  return (
    <div id="two-factor-settings" className="two-factor-settings max-w-lg">
      <h2 className="mb-1 text-lg font-bold text-text dark:text-text-dark">Two-Factor Authentication</h2>
      <p className="mb-4 text-sm text-text-muted dark:text-text-muted-dark">
        When enabled, every admin user must set up an authenticator app. Force-disabled outside of production
        regardless of this setting.
      </p>
      <label className="two-factor-settings__toggle flex cursor-pointer items-center gap-3">
        <input
          id="two-factor-toggle"
          type="checkbox"
          checked={settings?.twoFactorEnabled ?? false}
          onChange={handleToggle}
          className="h-4 w-4 cursor-pointer"
        />
        <span className="text-sm font-medium text-text dark:text-text-dark">
          Require 2FA For All Admin Users {settings?.twoFactorEnabled ? "(On)" : "(Off)"}
        </span>
      </label>
      {error && <p className="form-error mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
