"use client";

import { useEffect, useState } from "react";
import { Checkbox, Collapse, Input, Select, App as AntApp } from "antd";
import { api, ApiError } from "@/lib/api";
import { useSiteSettings } from "@/lib/site-settings-context";
import MediaPicker from "@/components/media/MediaPicker";
import type { SeoEntityType, SeoMetaDTO } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";
const TITLE_LIMIT = 60;
const DESCRIPTION_LIMIT = 160;
const { TextArea } = Input;

const EMPTY_SEO: SeoMetaDTO = {
  metaTitle: "",
  metaDescription: "",
  keywords: "",
  ogTitle: "",
  ogDescription: "",
  ogImageMediaId: null,
  ogImageUrl: null,
  canonicalUrl: "",
  robotsNoindex: false,
  robotsNofollow: false,
  articleAuthor: "",
};

function assetUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.startsWith("http") ? url : `${API_URL}${url}`;
}

function plain(text: string | undefined, max: number): string {
  const value = (text ?? "")
    .replaceAll("{year}", String(new Date().getFullYear()))
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return value.length > max ? `${value.slice(0, max - 1).trim()}…` : value;
}

export interface SeoDefaults {
  title: string;
  description?: string;
  image?: string | null;
  path: string;
}

// "SEO & Social Sharing" for one item (page, casino, guide, news article,
// bonus), saved on its own (GET/PUT /api/admin/seo/{type}/{id}). Every field
// is optional: empty ones use the defaults the public site builds from the
// item itself, shown as placeholders and in the Google / share previews.
// Pages keep their meta title/description in the SEO tab's form above, so
// showMetaFields is off for them; article adds the author field.
export default function SeoPanel({
  entityType,
  entityId,
  defaults,
  showMetaFields = true,
  article = false,
}: {
  entityType: SeoEntityType;
  entityId: number;
  defaults: SeoDefaults;
  showMetaFields?: boolean;
  article?: boolean;
}) {
  const { message } = AntApp.useApp();
  const { settings } = useSiteSettings();
  const [seo, setSeo] = useState<SeoMetaDTO>(EMPTY_SEO);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .get<{ seo: SeoMetaDTO }>(`/api/admin/seo/${entityType}/${entityId}`)
      .then((data) => !cancelled && setSeo({ ...EMPTY_SEO, ...data.seo }))
      .catch((err) => !cancelled && message.error(err instanceof ApiError ? err.message : "Could not load SEO settings."))
      .finally(() => !cancelled && setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, [entityType, entityId, message]);

  function set<K extends keyof SeoMetaDTO>(key: K, value: SeoMetaDTO[K]) {
    setSeo((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    try {
      const data = await api.put<{ seo: SeoMetaDTO }>(`/api/admin/seo/${entityType}/${entityId}`, seo);
      setSeo({ ...EMPTY_SEO, ...data.seo });
      message.success("SEO & sharing settings saved.");
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not save SEO settings.");
    } finally {
      setSaving(false);
    }
  }

  const siteUrl = (settings?.siteUrl || "").replace(/\/+$/, "");
  const shownUrl = seo.canonicalUrl || `${siteUrl}${defaults.path}`;
  const title = seo.metaTitle || defaults.title;
  const description = seo.metaDescription || plain(defaults.description, DESCRIPTION_LIMIT);
  const shareTitle = seo.ogTitle || title;
  const shareDescription = seo.ogDescription || description;
  const shareImage = assetUrl(seo.ogImageUrl || defaults.image || settings?.ogImageUrl || settings?.logoUrl);
  const domain = siteUrl.replace(/^https?:\/\//, "");
  const keywords = seo.keywords
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  return (
    <section id={`seo-panel-${entityType}`} className="seo-panel flex max-w-4xl flex-col gap-5 rounded-lg border border-border p-5 dark:border-border-dark">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-text dark:text-text-dark">SEO &amp; Social Sharing</h2>
          <p className="mt-1 text-sm text-text-muted dark:text-text-muted-dark">
            All optional — leave a field empty to use what the site builds from this {entityType === "news" ? "article" : entityType}.
          </p>
        </div>
        <button
          type="button"
          id={`seo-panel-${entityType}-save`}
          onClick={save}
          disabled={!loaded || saving}
          className="btn btn--primary cursor-pointer rounded-md bg-primary-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save SEO & Sharing"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="seo-panel__google flex flex-col gap-1 rounded-md bg-surface-muted p-4 dark:bg-surface-muted-dark">
          <span className="text-xs font-semibold tracking-wide text-text-muted uppercase dark:text-text-muted-dark">Google preview</span>
          <span className="truncate text-xs text-[#202124] dark:text-text-dark">{shownUrl}</span>
          <span className="line-clamp-2 text-lg leading-snug text-[#1a0dab] dark:text-primary-300">{plain(title, 70) || "—"}</span>
          <span className="line-clamp-2 text-sm text-[#4d5156] dark:text-text-muted-dark">{description || "No description yet."}</span>
          {(seo.robotsNoindex || settings?.seoIndex === false) && (
            <span className="mt-1 text-xs font-semibold text-danger">Hidden from search results (noindex)</span>
          )}
        </div>
        <div className="seo-panel__share flex flex-col gap-1 rounded-md bg-surface-muted p-4 dark:bg-surface-muted-dark">
          <span className="text-xs font-semibold tracking-wide text-text-muted uppercase dark:text-text-muted-dark">Share preview</span>
          <div className="overflow-hidden rounded-md border border-border bg-surface dark:border-border-dark dark:bg-surface-dark">
            <div className="flex aspect-[1.91/1] items-center justify-center bg-primary-50 dark:bg-surface-muted-dark">
              {shareImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={shareImage} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs text-text-muted">No image</span>
              )}
            </div>
            <div className="flex flex-col gap-0.5 px-3 py-2">
              <span className="text-[11px] tracking-wide text-text-muted uppercase">{domain || "your site"}</span>
              <span className="line-clamp-1 text-sm font-semibold text-text dark:text-text-dark">{plain(shareTitle, 90) || "—"}</span>
              <span className="line-clamp-1 text-xs text-text-muted dark:text-text-muted-dark">{shareDescription}</span>
            </div>
          </div>
        </div>
      </div>

      {showMetaFields && (
        <div className="grid grid-cols-1 gap-4">
          <Field label="Meta title" hint={`Shown as the search result title. Aim for ${TITLE_LIMIT} characters or fewer.`}>
            <Input
              id={`seo-${entityType}-meta-title`}
              value={seo.metaTitle}
              placeholder={defaults.title}
              maxLength={255}
              showCount={{ formatter: ({ count }) => `${count} / ${TITLE_LIMIT}` }}
              onChange={(e) => set("metaTitle", e.target.value)}
            />
          </Field>
          <Field label="Meta description" hint={`Shown under the title in search results. Aim for ${DESCRIPTION_LIMIT} characters or fewer.`}>
            <TextArea
              id={`seo-${entityType}-meta-description`}
              rows={2}
              value={seo.metaDescription}
              placeholder={plain(defaults.description, DESCRIPTION_LIMIT)}
              maxLength={500}
              showCount={{ formatter: ({ count }) => `${count} / ${DESCRIPTION_LIMIT}` }}
              onChange={(e) => set("metaDescription", e.target.value)}
            />
          </Field>
        </div>
      )}

      <Field label="Keywords" hint={article ? "Also used as the article's tags. Press Enter or comma after each." : "Press Enter or comma after each."}>
        <Select
          id={`seo-${entityType}-keywords`}
          mode="tags"
          tokenSeparators={[","]}
          open={false}
          suffixIcon={null}
          placeholder="e.g. online casino singapore, fast payout"
          value={keywords}
          onChange={(values: string[]) => set("keywords", values.map((v) => v.replace(/,/g, " ").trim()).filter(Boolean).join(", "))}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_220px]">
        <div className="flex flex-col gap-4">
          <Field label="Share title" hint="Title on Facebook, X, WhatsApp… when it differs from the meta title.">
            <Input id={`seo-${entityType}-og-title`} value={seo.ogTitle} placeholder={title} maxLength={255} onChange={(e) => set("ogTitle", e.target.value)} />
          </Field>
          <Field label="Share description">
            <TextArea
              id={`seo-${entityType}-og-description`}
              rows={2}
              value={seo.ogDescription}
              placeholder={description}
              maxLength={500}
              onChange={(e) => set("ogDescription", e.target.value)}
            />
          </Field>
        </div>
        <Field label="Share image" hint="1200 × 630 px works everywhere.">
          <div className="flex flex-col items-start gap-2">
            <button
              type="button"
              id={`seo-${entityType}-og-image-choose`}
              onClick={() => setPickerOpen(true)}
              className="cursor-pointer rounded-md border border-primary-300 px-3 py-1.5 text-sm font-medium text-primary-700 hover:bg-primary-50"
            >
              {seo.ogImageMediaId ? "Change Image" : "Choose Image"}
            </button>
            {seo.ogImageMediaId && (
              <button
                type="button"
                id={`seo-${entityType}-og-image-remove`}
                onClick={() => setSeo((prev) => ({ ...prev, ogImageMediaId: null, ogImageUrl: null }))}
                className="cursor-pointer text-sm text-danger hover:underline"
              >
                Use default image
              </button>
            )}
          </div>
        </Field>
      </div>

      <Collapse
        size="small"
        items={[
          {
            key: "advanced",
            label: "Advanced: canonical URL, search engine visibility" + (article ? ", author" : ""),
            children: (
              <div className="flex flex-col gap-4">
                <Field label="Canonical URL" hint="Only if this content's main copy lives at another address. A full URL or a path like /guides/my-guide.">
                  <Input
                    id={`seo-${entityType}-canonical`}
                    value={seo.canonicalUrl}
                    placeholder={`${siteUrl}${defaults.path}`}
                    maxLength={500}
                    onChange={(e) => set("canonicalUrl", e.target.value)}
                  />
                </Field>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  <Checkbox id={`seo-${entityType}-noindex`} checked={seo.robotsNoindex} onChange={(e) => set("robotsNoindex", e.target.checked)}>
                    Hide from search results (noindex)
                  </Checkbox>
                  <Checkbox id={`seo-${entityType}-nofollow`} checked={seo.robotsNofollow} onChange={(e) => set("robotsNofollow", e.target.checked)}>
                    Don&apos;t follow links on it (nofollow)
                  </Checkbox>
                </div>
                {article && (
                  <Field label="Author" hint="Shown to search engines as the article's author. Empty = the site name.">
                    <Input
                      id={`seo-${entityType}-author`}
                      value={seo.articleAuthor}
                      placeholder={settings?.siteTitle}
                      maxLength={150}
                      onChange={(e) => set("articleAuthor", e.target.value)}
                    />
                  </Field>
                )}
              </div>
            ),
          },
        ]}
      />

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(media) => {
          setSeo((prev) => ({ ...prev, ogImageMediaId: media.id, ogImageUrl: media.url }));
          setPickerOpen(false);
        }}
      />
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-text dark:text-text-dark">{label}</span>
      {children}
      {hint && <span className="text-xs text-text-muted dark:text-text-muted-dark">{hint}</span>}
    </div>
  );
}
