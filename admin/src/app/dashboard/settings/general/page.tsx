"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useSiteSettings } from "@/lib/site-settings-context";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import MediaPicker from "@/components/media/MediaPicker";
import IconButton from "@/components/IconButton";
import { IconUpload, IconPhoto } from "@/components/Icons";
import type { MediaDTO, PageTransition } from "@/lib/types";

// The preloader image types the API accepts (service.preloaderImageTypes).
const PRELOADER_IMAGE_TYPES = /.(jpe?g|png|webp|gif)$/i;
const PRELOADER_IMAGE_ACCEPT = ".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif";

const PAGE_TRANSITIONS: { value: PageTransition; label: string; hint: string }[] = [
  { value: "off", label: "Off", hint: "Pages swap instantly." },
  { value: "bar", label: "Loading bar", hint: "An orange bar runs across the top while the next page loads." },
  { value: "bar_fade", label: "Loading bar + fade", hint: "The bar, and the page fades softly into the next one." },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";

function assetUrl(url: string) {
  return url.startsWith("http") ? url : `${API_URL}${url}`;
}

export default function GeneralSettingsPage() {
  const { user } = useAuth();
  const { settings, refresh } = useSiteSettings();
  const confirm = useConfirm();

  const [siteUrl, setSiteUrl] = useState("");
  const [siteTitle, setSiteTitle] = useState("");
  const [seoIndex, setSeoIndex] = useState(false);
  const [seoFollow, setSeoFollow] = useState(false);
  const [timezone, setTimezone] = useState("+08:00");
  const [language, setLanguage] = useState("en");
  const [ogImageUrl, setOgImageUrl] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  // Page builder screen sizes (px): tablet and desktop start here.
  const [bpTablet, setBpTablet] = useState(768);
  const [bpDesktop, setBpDesktop] = useState(1200);
  const [pageTransition, setPageTransition] = useState<PageTransition>("off");
  // Seconds, 0-1.0, as typed; saved as ms.
  const [pageTransitionMin, setPageTransitionMin] = useState("0.3");
  const [preloader, setPreloader] = useState(false);
  const [preloaderImage, setPreloaderImage] = useState("");
  const [preloaderImageError, setPreloaderImageError] = useState("");
  const [preloaderUploading, setPreloaderUploading] = useState(false);
  const preloaderInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState("");
  const [mediaPickerField, setMediaPickerField] = useState<"logo" | "favicon" | "ogImage" | "preloader" | null>(null);

  useEffect(() => {
    if (!settings) return;
    setSiteUrl(settings.siteUrl);
    setSiteTitle(settings.siteTitle);
    setSeoIndex(settings.seoIndex);
    setSeoFollow(settings.seoFollow);
    setTimezone(settings.timezone);
    setLanguage(settings.language);
    setOgImageUrl(settings.ogImageUrl ?? "");
    setTwitterHandle(settings.twitterHandle ?? "");
    if (settings.breakpoints?.tablet) {
      setBpTablet(settings.breakpoints.tablet);
      setBpDesktop(settings.breakpoints.desktop);
    }
    setPageTransition(settings.pageTransition ?? "off");
    setPageTransitionMin(String((settings.pageTransitionMinMs ?? 300) / 1000));
    setPreloader(settings.preloader ?? false);
    setPreloaderImage(settings.preloaderImageUrl ?? "");
  }, [settings]);

  if (!user) return null;

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
      await api.put("/api/admin/settings/site", {
        siteUrl,
        siteTitle,
        seoIndex,
        seoFollow,
        timezone,
        language,
        ogImageUrl,
        twitterHandle,
        breakpoints: { tablet: bpTablet, desktop: bpDesktop },
        pageTransition,
        pageTransitionMinMs: Math.round(Math.min(1, Math.max(0, Number(pageTransitionMin) || 0)) * 1000),
        preloader,
        preloaderImageUrl: preloaderImage,
      });
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

  // The preloader image goes into the media library, then into the form;
  // Save Settings stores it.
  function choosePreloaderImage(url: string) {
    if (!PRELOADER_IMAGE_TYPES.test(url.split("?")[0])) {
      setPreloaderImageError("Use a JPG, PNG, WebP or GIF image.");
      return;
    }
    setPreloaderImageError("");
    setPreloaderImage(url);
  }

  async function uploadPreloaderImage(file: File) {
    if (!PRELOADER_IMAGE_TYPES.test(file.name)) {
      setPreloaderImageError("Use a JPG, PNG, WebP or GIF image.");
      return;
    }
    setPreloaderImageError("");
    setPreloaderUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const { media } = await api.upload<{ media: MediaDTO }>("/api/admin/media", form);
      choosePreloaderImage(media.url);
    } catch (err) {
      setPreloaderImageError(err instanceof ApiError ? err.message : "Could not upload the image.");
    } finally {
      setPreloaderUploading(false);
      if (preloaderInputRef.current) preloaderInputRef.current.value = "";
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
    <section id="settings-general" className="settings-page flex flex-col gap-10">

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
          if (mediaPickerField === "ogImage") setOgImageUrl(media.url);
          else if (mediaPickerField === "preloader") choosePreloaderImage(media.url);
          else if (mediaPickerField) handleSelectFromLibrary(mediaPickerField, media);
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

        <fieldset
          id="settings-seo-social"
          className="settings-seo-social mt-4 flex flex-col gap-4 rounded-md border border-border p-4 dark:border-border-dark"
        >
          <legend className="px-1 text-lg font-bold text-text dark:text-text-dark">SEO &amp; Social Sharing</legend>
          <p className="text-sm text-text-muted dark:text-text-muted-dark">
            Used when a page is shared on Facebook, X, WhatsApp, LinkedIn and the like. Each page, casino, guide, news article and
            bonus can set its own share image and text in its SEO section; these are the defaults.
          </p>
          <div className="form-field flex flex-col gap-2">
            <span className="text-sm font-medium text-text dark:text-text-dark">Default Share Image</span>
            <div className="flex items-center gap-4">
              <div className="flex h-[84px] w-40 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-surface-muted dark:border-border-dark dark:bg-surface-muted-dark">
                {ogImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={assetUrl(ogImageUrl)} alt="Default share image" className="h-full w-full object-cover" />
                ) : (
                  <span className="px-2 text-center text-xs text-text-muted dark:text-text-muted-dark">Site logo is used</span>
                )}
              </div>
              <div className="flex flex-col items-start gap-2">
                <button
                  type="button"
                  id="settings-og-image-choose"
                  onClick={() => setMediaPickerField("ogImage")}
                  className="cursor-pointer rounded-md border border-primary-300 px-3 py-1.5 text-sm font-medium text-primary-700 hover:bg-primary-50"
                >
                  {ogImageUrl ? "Change" : "Choose From Media Library"}
                </button>
                {ogImageUrl && (
                  <button type="button" id="settings-og-image-remove" onClick={() => setOgImageUrl("")} className="cursor-pointer text-sm text-danger hover:underline">
                    Remove
                  </button>
                )}
                <span className="text-xs text-text-muted dark:text-text-muted-dark">Best at 1200 × 630 px.</span>
              </div>
            </div>
          </div>
          <div className="form-field flex flex-col gap-1">
            <label htmlFor="settings-twitter-handle" className="text-sm font-medium text-text dark:text-text-dark">
              X (Twitter) Handle
            </label>
            <input
              id="settings-twitter-handle"
              placeholder="@topcasinosg"
              maxLength={16}
              value={twitterHandle}
              onChange={(e) => setTwitterHandle(e.target.value)}
              className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary-500 dark:border-border-dark dark:bg-surface-dark dark:text-text-dark"
            />
          </div>
        </fieldset>

        <fieldset
          id="settings-screen-sizes"
          className="settings-screen-sizes mt-4 flex flex-col gap-4 rounded-md border border-border p-4 dark:border-border-dark"
        >
          <legend className="px-1 text-lg font-bold text-text dark:text-text-dark">Screen Sizes</legend>
          <p className="text-sm text-text-muted dark:text-text-muted-dark">
            Where the page builder&apos;s Mobile, Tablet and Desktop settings switch over: per-device styles, Hide on, grid columns,
            carousel slides and when rows stack.
          </p>
          <div className="flex flex-wrap items-end gap-4">
            <div className="form-field flex flex-col gap-1">
              <label htmlFor="settings-bp-tablet" className="text-sm font-medium text-text dark:text-text-dark">
                Tablet from (px)
              </label>
              <input
                id="settings-bp-tablet"
                type="number"
                min={480}
                max={2460}
                required
                value={bpTablet}
                onChange={(e) => setBpTablet(Number(e.target.value))}
                className="w-28 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary-500 dark:border-border-dark dark:bg-surface-dark dark:text-text-dark"
              />
            </div>
            <div className="form-field flex flex-col gap-1">
              <label htmlFor="settings-bp-desktop" className="text-sm font-medium text-text dark:text-text-dark">
                Desktop from (px)
              </label>
              <input
                id="settings-bp-desktop"
                type="number"
                min={bpTablet + 100}
                max={2560}
                required
                value={bpDesktop}
                onChange={(e) => setBpDesktop(Number(e.target.value))}
                className="w-28 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary-500 dark:border-border-dark dark:bg-surface-dark dark:text-text-dark"
              />
            </div>
            <button
              type="button"
              id="settings-bp-reset"
              onClick={() => {
                setBpTablet(768);
                setBpDesktop(1200);
              }}
              className="cursor-pointer pb-2 text-sm text-primary-700 hover:underline dark:text-primary-300"
            >
              Reset to 768 / 1200
            </button>
          </div>
          <p id="settings-bp-summary" className="text-sm text-text dark:text-text-dark">
            Mobile: below {bpTablet}px · Tablet: {bpTablet}–{bpDesktop - 1}px · Desktop: {bpDesktop}px and up
          </p>
        </fieldset>

        <fieldset
          id="settings-page-transition"
          className="settings-page-transition mt-4 flex flex-col gap-3 rounded-md border border-border p-4 dark:border-border-dark"
        >
          <legend className="px-1 text-lg font-bold text-text dark:text-text-dark">Page Transition</legend>
          <p className="text-sm text-text-muted dark:text-text-muted-dark">
            What visitors see on the website when they go from one page to another. Visitors whose device asks for less motion
            don&apos;t get the fade.
          </p>
          {PAGE_TRANSITIONS.map((option) => (
            <label key={option.value} className="flex cursor-pointer items-start gap-2 text-sm text-text dark:text-text-dark">
              <input
                id={`settings-page-transition-${option.value}`}
                type="radio"
                name="pageTransition"
                value={option.value}
                checked={pageTransition === option.value}
                onChange={() => setPageTransition(option.value)}
                className="mt-0.5 h-4 w-4 cursor-pointer"
              />
              <span>
                <span className="font-medium">{option.label}</span>
                <span className="block text-xs text-text-muted dark:text-text-muted-dark">{option.hint}</span>
              </span>
            </label>
          ))}
          {pageTransition !== "off" && (
            <div className="form-field flex flex-col gap-1">
              <label htmlFor="settings-page-transition-min" className="text-sm font-medium text-text dark:text-text-dark">
                Show for at least (seconds)
              </label>
              <input
                id="settings-page-transition-min"
                type="number"
                min={0}
                max={1}
                step={0.1}
                required
                value={pageTransitionMin}
                onChange={(e) => setPageTransitionMin(e.target.value)}
                className="w-28 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary-500 dark:border-border-dark dark:bg-surface-dark dark:text-text-dark"
              />
              <span className="text-xs text-text-muted dark:text-text-muted-dark">
                0 to 1.0. Most pages open almost instantly, so the bar is held on screen this long to be seen. 0 shows it only when a
                page is slow.
              </span>
            </div>
          )}
          <p className="text-xs text-text-muted dark:text-text-muted-dark">The website picks up a change within a minute.</p>
        </fieldset>

        <fieldset
          id="settings-preloader"
          className="settings-preloader mt-4 flex flex-col gap-3 rounded-md border border-border p-4 dark:border-border-dark"
        >
          <legend className="px-1 text-lg font-bold text-text dark:text-text-dark">Preloader</legend>
          <label className="flex cursor-pointer items-start gap-2 text-sm text-text dark:text-text-dark">
            <input
              id="settings-preloader-on"
              type="checkbox"
              checked={preloader}
              onChange={(e) => setPreloader(e.target.checked)}
              className="mt-0.5 h-4 w-4 cursor-pointer"
            />
            <span>
              <span className="font-medium">Show a preloader on a visitor&apos;s first page</span>
              <span className="block text-xs text-text-muted dark:text-text-muted-dark">
                A white screen with an image and a loading bar, until the page has loaded. Only the first page opened in a browser
                window or tab; after that, moving between pages uses the Page Transition above.
              </span>
            </span>
          </label>
          <div className="form-field flex flex-col gap-2">
            <span className="text-sm font-medium text-text dark:text-text-dark">Preloader Image</span>
            <div className="flex items-center gap-4">
              <div className="flex h-[84px] w-40 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-white dark:border-border-dark">
                {preloaderImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={assetUrl(preloaderImage)} alt="Preloader image" className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="px-2 text-center text-xs text-text-muted">Site logo is used</span>
                )}
              </div>
              <div className="flex flex-col items-start gap-2">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    id="settings-preloader-image-upload"
                    disabled={preloaderUploading}
                    onClick={() => preloaderInputRef.current?.click()}
                    className="cursor-pointer rounded-md border border-primary-300 px-3 py-1.5 text-sm font-medium text-primary-700 hover:bg-primary-50 disabled:cursor-wait disabled:opacity-60"
                  >
                    {preloaderUploading ? "Uploading…" : "Upload Image"}
                  </button>
                  <button
                    type="button"
                    id="settings-preloader-image-choose"
                    onClick={() => setMediaPickerField("preloader")}
                    className="cursor-pointer rounded-md border border-primary-300 px-3 py-1.5 text-sm font-medium text-primary-700 hover:bg-primary-50"
                  >
                    Choose From Media Library
                  </button>
                </div>
                {preloaderImage && (
                  <button type="button" id="settings-preloader-image-remove" onClick={() => setPreloaderImage("")} className="cursor-pointer text-sm text-danger hover:underline">
                    Remove (use the site logo)
                  </button>
                )}
                <span className="text-xs text-text-muted dark:text-text-muted-dark">
                  JPG, PNG, WebP or GIF (animated GIFs play), up to 10 MB. Shown up to 220 × 120 px.
                </span>
              </div>
            </div>
            <input
              ref={preloaderInputRef}
              id="settings-preloader-image-input"
              type="file"
              accept={PRELOADER_IMAGE_ACCEPT}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadPreloaderImage(file);
              }}
            />
            {preloaderImageError && <p className="form-error text-sm text-danger">{preloaderImageError}</p>}
          </div>
        </fieldset>

        <p id="settings-footer-moved" className="mt-4 text-sm text-text-muted dark:text-text-muted-dark">
          The footer description, address, email and social links are now edited on the{" "}
          <Link href="/dashboard/footer" className="font-semibold text-primary-600 underline dark:text-primary-300">
            Footer
          </Link>{" "}
          page.
        </p>

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

    </section>
  );
}
