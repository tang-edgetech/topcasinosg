"use client";

import { useEffect, useState } from "react";
import { App as AntApp, Button, Input, Switch, Table } from "antd";
import { api, ApiError } from "@/lib/api";
import { useSiteSettings } from "@/lib/site-settings-context";
import { useListView } from "@/lib/useListView";
import ListToolbar from "@/components/content/ListToolbar";
import BulkActionBar from "@/components/content/BulkActionBar";
import { SITEMAP_REASONS, SITEMAP_TONE_CLASSES, SITEMAP_TYPES, sitemapTypeLabel } from "@/lib/sitemap";
import type { SitemapItemDTO, SitemapMode, SitemapSettingsDTO, SitemapType } from "@/lib/types";

const CARD_CLASS = "flex flex-col gap-4 rounded-lg border border-border p-4 dark:border-border-dark";
const HEADING_CLASS = "text-lg font-bold text-text dark:text-text-dark";
const MUTED_CLASS = "text-sm text-text-muted dark:text-text-muted-dark";
const { TextArea } = Input;

interface Overview {
  settings: SitemapSettingsDTO;
  siteNoindex: boolean;
  items: SitemapItemDTO[];
}

const rowKey = (i: SitemapItemDTO) => `${i.entityType}:${i.entityId}`;

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// Settings > Sitemap (Super Admin and Admin): the website's /sitemap.xml is
// built from published content (web/src/app/sitemap.xml/route.ts). Here: the
// whole sitemap on or off, which content types are listed by default, each
// page or item's own include/exclude (also in its SEO tab), and extra
// addresses. api/internal/service/sitemap_service.go decides what is listed.
export default function SitemapSettingsPage() {
  const { message } = AntApp.useApp();
  const { settings: site } = useSiteSettings();
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [types, setTypes] = useState<SitemapType[]>([]);
  const [extra, setExtra] = useState("");
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<React.Key[]>([]);
  const [busyRow, setBusyRow] = useState<string | null>(null);

  function apply(next: Overview) {
    setData(next);
    setEnabled(next.settings.enabled);
    setTypes(next.settings.types);
    setExtra(next.settings.extraUrls.join("\n"));
  }

  function load() {
    return api.get<Overview>("/api/admin/sitemap").then(apply, (err) =>
      setError(err instanceof ApiError ? err.message : "Could not load the sitemap."),
    );
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { filtered, pagination, toolbar } = useListView<SitemapItemDTO>({
    storageKey: "sitemap",
    items: data?.items ?? [],
    searchText: (i) => `${i.name} ${i.path}`,
    filters: [
      {
        key: "type",
        placeholder: "All types",
        options: SITEMAP_TYPES.map((t) => ({ value: t.value, label: t.label })),
        match: (i, v) => i.entityType === v,
      },
      {
        key: "status",
        placeholder: "Listed or not",
        options: [
          { value: "listed", label: "Listed" },
          { value: "not", label: "Not listed" },
          { value: "excluded", label: "Excluded by you" },
        ],
        match: (i, v) => (v === "listed" ? i.listed : v === "not" ? !i.listed : i.mode === "exclude"),
      },
    ],
  });

  if (error) return <p className="text-sm text-danger">{error}</p>;
  if (!data) return null;

  const siteUrl = (site?.siteUrl || "").replace(/\/+$/, "");
  const sitemapUrl = `${siteUrl || ""}/sitemap.xml`;
  const listedCount = data.items.filter((i) => i.listed).length;
  const extraLines = extra.split("\n").map((l) => l.trim()).filter(Boolean);
  const dirty =
    enabled !== data.settings.enabled ||
    types.join(",") !== data.settings.types.join(",") ||
    extraLines.join("\n") !== data.settings.extraUrls.join("\n");

  function toggleType(type: SitemapType, on: boolean) {
    setTypes((prev) => SITEMAP_TYPES.map((t) => t.value).filter((t) => (t === type ? on : prev.includes(t))));
  }

  async function saveSettings() {
    setSaving(true);
    try {
      await api.put("/api/admin/sitemap/settings", { enabled, types, extraUrls: extraLines });
      await load();
      message.success("Sitemap settings saved.");
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not save the sitemap settings.");
    } finally {
      setSaving(false);
    }
  }

  async function setModes(items: SitemapItemDTO[], mode: SitemapMode) {
    try {
      await api.put("/api/admin/sitemap/items", {
        items: items.map((i) => ({ entityType: i.entityType, entityId: i.entityId, mode })),
      });
      await load();
      return true;
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not save the change.");
      return false;
    }
  }

  // The row switch: on = listed. When the type's default already gives
  // that, the item's own choice goes back to "default".
  async function toggleRow(item: SitemapItemDTO, on: boolean) {
    const typeOn = data!.settings.types.includes(item.entityType);
    const mode: SitemapMode = on ? (typeOn ? "default" : "include") : typeOn ? "exclude" : "default";
    setBusyRow(rowKey(item));
    await setModes([item], mode);
    setBusyRow(null);
  }

  async function bulk(mode: SitemapMode) {
    const items = data!.items.filter((i) => selected.includes(rowKey(i)));
    if (await setModes(items, mode)) {
      message.success(`${items.length} item(s) updated.`);
      setSelected([]);
    }
  }

  return (
    <section id="sitemap-settings-page" className="sitemap-settings-page flex flex-col gap-4">
      <div className={CARD_CLASS}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 className={HEADING_CLASS}>Sitemap</h2>
            <p className={MUTED_CLASS}>
              Built automatically from published content at{" "}
              <a id="sitemap-open-link" href={sitemapUrl} target="_blank" rel="noopener noreferrer" className="font-mono underline">
                {sitemapUrl}
              </a>
              . Changes show there straight away; nothing to upload.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-text dark:text-text-dark">
              Sitemap on
              <Switch id="sitemap-enabled" checked={enabled} onChange={setEnabled} />
            </label>
            <Button id="sitemap-save" type="primary" onClick={saveSettings} loading={saving} disabled={!dirty}>
              Save
            </Button>
          </div>
        </div>

        {data.siteNoindex && (
          <p id="sitemap-site-noindex" className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
            The whole website is hidden from search engines (Settings › General), so the sitemap is empty until that is switched back.
          </p>
        )}
        {!data.settings.enabled && (
          <p id="sitemap-off-note" className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
            The sitemap is off: {sitemapUrl} shows “not found”.
          </p>
        )}

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-text dark:text-text-dark">Content types</span>
          <span className={MUTED_CLASS}>The default for every page or item of that type. Any single one can still be included or excluded below.</span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {SITEMAP_TYPES.map((t) => (
              <label
                key={t.value}
                className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm dark:border-border-dark"
              >
                <span>
                  {t.label} <span className="text-text-muted">{data.items.filter((i) => i.entityType === t.value).length}</span>
                </span>
                <Switch id={`sitemap-type-${t.value}`} size="small" checked={types.includes(t.value)} onChange={(on) => toggleType(t.value, on)} />
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="sitemap-extra-urls" className="text-sm font-semibold text-text dark:text-text-dark">
            Extra addresses
          </label>
          <TextArea
            id="sitemap-extra-urls"
            rows={3}
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            placeholder={`/promotions/cny-2027\n${siteUrl || "https://topcasinosg.com.sg"}/tools/odds`}
            spellCheck={false}
            className="font-mono text-xs"
          />
          <span className={MUTED_CLASS}>
            One per line, for addresses the site doesn&apos;t build itself: a path starting with /, or a full address on this website.
          </span>
        </div>
      </div>

      <div className={CARD_CLASS}>
        <div className="flex flex-col gap-1">
          <h2 className={HEADING_CLASS}>Pages and items</h2>
          <p className={MUTED_CLASS}>
            {listedCount} of {data.items.length} published pages and items are listed. The switch is the same setting as the Sitemap box in each
            one&apos;s SEO tab. Changes save at once.
          </p>
        </div>
        <ListToolbar id="sitemap-toolbar" searchPlaceholder="Search by name or address" {...toolbar} />
        <BulkActionBar
          count={selected.length}
          onClear={() => setSelected([])}
          actions={[
            { id: "sitemap-bulk-include", label: "Always include", onClick: () => bulk("include") },
            { id: "sitemap-bulk-exclude", label: "Exclude", onClick: () => bulk("exclude"), danger: true },
            { id: "sitemap-bulk-default", label: "Use the default", onClick: () => bulk("default") },
          ]}
        />
        <Table
          id="sitemap-items-table"
          rowKey={rowKey}
          dataSource={filtered}
          pagination={pagination}
          size="middle"
          scroll={{ x: 760 }}
          rowSelection={{ selectedRowKeys: selected, onChange: setSelected }}
          rowClassName={(i) => (i.listed ? "" : "opacity-60")}
          columns={[
            { title: "Name", dataIndex: "name", key: "name", sorter: (a, b) => a.name.localeCompare(b.name) },
            {
              title: "Address",
              dataIndex: "path",
              key: "path",
              sorter: (a, b) => a.path.localeCompare(b.path),
              render: (v: string) => <code className="text-xs break-all">{v}</code>,
            },
            { title: "Type", key: "type", render: (_: unknown, i: SitemapItemDTO) => sitemapTypeLabel(i.entityType, true) },
            {
              title: "Last updated",
              dataIndex: "updatedAt",
              key: "updatedAt",
              sorter: (a, b) => (a.updatedAt ?? "").localeCompare(b.updatedAt ?? ""),
              render: (v: string | null) => <span className="whitespace-nowrap">{formatDate(v)}</span>,
            },
            {
              title: "Status",
              key: "status",
              render: (_: unknown, i: SitemapItemDTO) => {
                const r = SITEMAP_REASONS[i.reason];
                return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${SITEMAP_TONE_CLASSES[r.tone]}`}>{r.label}</span>;
              },
            },
            {
              title: "In sitemap",
              key: "listed",
              render: (_: unknown, i: SitemapItemDTO) =>
                i.reason === "noindex" || i.reason === "redirected" ? (
                  <span className="text-xs text-text-muted">{i.reason === "noindex" ? "Set in its SEO tab" : "See Redirects"}</span>
                ) : (
                  <Switch
                    id={`sitemap-item-${i.entityType}-${i.entityId}`}
                    size="small"
                    checked={i.listed}
                    loading={busyRow === rowKey(i)}
                    onChange={(on) => toggleRow(i, on)}
                    aria-label={`List ${i.path} in the sitemap`}
                  />
                ),
            },
          ]}
        />
      </div>
    </section>
  );
}
