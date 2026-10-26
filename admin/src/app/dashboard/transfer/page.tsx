"use client";

import { useEffect, useMemo, useState } from "react";
import { Alert, App as AntApp, Button, Input, Radio, Table, Tree, Upload } from "antd";
import type { DataNode } from "antd/es/tree";
import dayjs from "dayjs";
import { api, ApiError } from "@/lib/api";
import type { TransferCatalogGroup, TransferMode, TransferReport, TransferTableReport } from "@/lib/types";
import { useConfirm } from "@/components/ConfirmDialog";
import PageHeading from "@/components/PageHeading";
import { IconUpload } from "@/components/Icons";

const DATE_TIME_FORMAT = "D MMM YYYY, h:mm A";
const GROUP_KEY_PREFIX = "group:";
const ITEM_KEY_SEPARATOR = "::";
const TREE_HEIGHT = 420;

// Child rows (a casino's regions, a page's sections) travel with their
// parent, so the summary lists only what an editor recognises.
const TABLE_LABELS: Record<string, string> = {
  pages: "Pages",
  casinos: "Casinos",
  bonuses: "Bonuses",
  payment_methods: "Payment Methods",
  rtp_entries: "RTP Entries",
  guides: "Guides",
  blacklist_entries: "Blacklist",
  news_articles: "News",
  regions: "Regions",
  game_providers: "Game Providers",
  licenses: "Licenses",
  media: "Media Library",
  menu_items: "Navigation items",
  sidebar_sections: "Sidebar",
  site_snippets: "Snippets",
  site_settings: "Site Settings",
};

interface SummaryRow extends TransferTableReport {
  key: string;
  label: string;
}

function itemKey(group: string, id: string) {
  return `${group}${ITEM_KEY_SEPARATOR}${id}`;
}

function summaryRows(report: TransferReport): SummaryRow[] {
  const rows: SummaryRow[] = Object.entries(TABLE_LABELS)
    .filter(([table]) => report.tables[table])
    .map(([table, label]) => ({ key: table, label, ...report.tables[table] }));
  if (report.files > 0) {
    rows.push({ key: "files", label: "Uploaded files", created: report.files, updated: 0, linked: 0, deleted: 0 });
  }
  return rows;
}

function exportFilename(whole: boolean) {
  const host = window.location.hostname.replace(/[^a-z0-9.-]/gi, "");
  return `backoffice-${host}-${whole ? "full" : "items"}-${dayjs().format("YYYYMMDD-HHmm")}.zip`;
}

function ReportTable({ report }: { report: TransferReport }) {
  const count = (value: number) => (value > 0 ? <span className="font-semibold">{value}</span> : <span className="text-text-muted dark:text-text-muted-dark">—</span>);
  return (
    <Table<SummaryRow>
      id="transfer-report-table"
      size="small"
      pagination={false}
      dataSource={summaryRows(report)}
      locale={{ emptyText: "Nothing to change — this backoffice already matches the file." }}
      columns={[
        { title: "Section", dataIndex: "label", key: "label" },
        { title: "New", key: "created", align: "right", render: (_, row) => count(row.created) },
        { title: "Updated", key: "updated", align: "right", render: (_, row) => count(row.updated) },
        { title: "Kept as is", key: "linked", align: "right", render: (_, row) => count(row.linked) },
        { title: "Removed", key: "deleted", align: "right", render: (_, row) => count(row.deleted) },
      ]}
    />
  );
}

export default function TransferPage() {
  const { message } = AntApp.useApp();
  const confirm = useConfirm();

  const [groups, setGroups] = useState<TransferCatalogGroup[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [whole, setWhole] = useState(true);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<TransferMode>("merge");
  const [preview, setPreview] = useState<TransferReport | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<TransferReport | null>(null);

  useEffect(() => {
    api
      .get<{ groups: TransferCatalogGroup[] }>("/api/admin/exports/catalog")
      .then((data) => setGroups(data.groups))
      .catch((err) => message.error(err instanceof ApiError ? err.message : "Could not load the export list."))
      .finally(() => setCatalogLoading(false));
  }, [message]);

  const term = search.trim().toLowerCase();
  const treeData = useMemo<DataNode[]>(
    () =>
      groups
        .map((group) => {
          const items = group.items.filter(
            (item) => !term || item.label.toLowerCase().includes(term) || item.detail.toLowerCase().includes(term),
          );
          return {
            key: `${GROUP_KEY_PREFIX}${group.key}`,
            title: (
              <span className="font-semibold">
                {group.label} <span className="font-normal text-text-muted dark:text-text-muted-dark">({items.length})</span>
              </span>
            ),
            disabled: items.length === 0,
            children: items.map((item) => ({
              key: itemKey(group.key, item.id),
              title: (
                <span>
                  {item.label || "(untitled)"}
                  {item.detail && <span className="ml-2 text-xs text-text-muted dark:text-text-muted-dark">{item.detail}</span>}
                </span>
              ),
            })),
          };
        })
        .filter((node) => !term || node.children.length > 0),
    [groups, term],
  );

  const visibleItemKeys = useMemo(
    () => new Set(treeData.flatMap((node) => (node.children ?? []).map((child) => String(child.key)))),
    [treeData],
  );

  function handleCheck(keys: React.Key[] | { checked: React.Key[] }) {
    const list = Array.isArray(keys) ? keys : keys.checked;
    const next = new Set([...checked].filter((key) => !visibleItemKeys.has(key)));
    list.map(String).filter((key) => !key.startsWith(GROUP_KEY_PREFIX)).forEach((key) => next.add(key));
    setChecked(next);
  }

  async function handleExport() {
    const items: Record<string, string[]> = {};
    checked.forEach((key) => {
      const [group, id] = key.split(ITEM_KEY_SEPARATOR);
      (items[group] ??= []).push(id);
    });
    if (!whole && checked.size === 0) {
      message.error("Tick at least one item to export.");
      return;
    }

    setExporting(true);
    try {
      const blob = await api.download("/api/admin/exports/download", { whole, items });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = exportFilename(whole);
      link.click();
      URL.revokeObjectURL(url);
      message.success("Export downloaded.");
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not build the export.");
    } finally {
      setExporting(false);
    }
  }

  function importForm(target: File, importMode: TransferMode) {
    const form = new FormData();
    form.append("file", target);
    form.append("mode", importMode);
    return form;
  }

  async function runPreview(target: File, importMode: TransferMode) {
    setPreviewing(true);
    setPreview(null);
    setResult(null);
    try {
      const report = await api.upload<TransferReport>("/api/admin/imports/preview", importForm(target, importMode));
      setPreview(report);
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not read this file.");
      setFile(null);
    } finally {
      setPreviewing(false);
    }
  }

  function handleFile(target: File) {
    setFile(target);
    setMode("merge");
    runPreview(target, "merge");
    return false;
  }

  function handleModeChange(next: TransferMode) {
    setMode(next);
    if (file) runPreview(file, next);
  }

  async function handleImport() {
    if (!file || !preview) return;
    const ok = await confirm(
      mode === "replace"
        ? {
            title: "Replace all content?",
            message:
              "Every page, casino, bonus, menu and other content item on this backoffice will be deleted and replaced with the file. Users and the activity log are kept. This can't be undone.",
            confirmLabel: "Replace everything",
            danger: true,
          }
        : {
            title: "Import this file?",
            message: "New items will be added and matching items updated with the file's version. Nothing will be deleted.",
            confirmLabel: "Import",
          },
    );
    if (!ok) return;

    setImporting(true);
    try {
      const report = await api.upload<TransferReport>("/api/admin/imports", importForm(file, mode));
      setResult(report);
      setPreview(null);
      setFile(null);
      message.success("Import finished.");
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Import failed — nothing was changed.");
    } finally {
      setImporting(false);
    }
  }

  const source = preview ?? result;

  return (
    <div className="flex flex-col gap-6">
      <PageHeading title="Export / Import" help="transfer" />

      <div className="grid gap-6 xl:grid-cols-2">
        <section id="transfer-export" className="flex flex-col gap-4 rounded-lg border border-border p-5 dark:border-border-dark">
          <div>
            <h2 className="text-lg font-bold text-text dark:text-text-dark">Export</h2>
            <p className="text-sm text-text-muted dark:text-text-muted-dark">Download a .zip to import into another backoffice.</p>
          </div>

          <Radio.Group id="transfer-export-scope" value={whole} onChange={(e) => setWhole(e.target.value)}>
            <div className="flex flex-col gap-2">
              <Radio value={true}>
                <span className="font-semibold">Whole backoffice</span>
                <span className="ml-2 text-text-muted dark:text-text-muted-dark">all content, settings and uploaded files</span>
              </Radio>
              <Radio value={false}>
                <span className="font-semibold">Choose items</span>
                <span className="ml-2 text-text-muted dark:text-text-muted-dark">only what you tick</span>
              </Radio>
            </div>
          </Radio.Group>

          {!whole && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Input.Search
                  id="transfer-export-search"
                  allowClear
                  placeholder="Search items"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <span className="whitespace-nowrap text-sm text-text-muted dark:text-text-muted-dark">{checked.size} selected</span>
                {checked.size > 0 && (
                  <Button id="transfer-export-clear" size="small" onClick={() => setChecked(new Set())}>
                    Clear
                  </Button>
                )}
              </div>
              <div id="transfer-export-tree" className="rounded-md border border-border p-2 dark:border-border-dark">
                <Tree
                  checkable
                  selectable={false}
                  height={TREE_HEIGHT}
                  treeData={treeData}
                  checkedKeys={[...checked].filter((key) => visibleItemKeys.has(key))}
                  onCheck={handleCheck}
                />
                {catalogLoading && <p className="p-2 text-sm text-text-muted">Loading…</p>}
              </div>
              <p className="text-xs text-text-muted dark:text-text-muted-dark">
                What the ticked items need — a bonus&apos;s casino and region, a page&apos;s parent, images — is included automatically.
              </p>
            </div>
          )}

          <div>
            <Button id="transfer-export-download" type="primary" loading={exporting} onClick={handleExport}>
              Download export
            </Button>
          </div>
        </section>

        <section id="transfer-import" className="flex flex-col gap-4 rounded-lg border border-border p-5 dark:border-border-dark">
          <div>
            <h2 className="text-lg font-bold text-text dark:text-text-dark">Import</h2>
            <p className="text-sm text-text-muted dark:text-text-muted-dark">Load an export .zip into this backoffice. You&apos;ll see a preview first.</p>
          </div>

          <Upload.Dragger
            id="transfer-import-file"
            accept=".zip,application/zip"
            multiple={false}
            showUploadList={false}
            beforeUpload={handleFile}
            disabled={previewing || importing}
          >
            <div className="flex flex-col items-center gap-1 py-2">
              <IconUpload className="h-7 w-7 text-primary-500" />
              <p className="font-semibold text-text dark:text-text-dark">{file ? file.name : "Drop an export .zip here, or click to choose"}</p>
              <p className="text-xs text-text-muted dark:text-text-muted-dark">Up to 1 GB · through Cloudflare, 100 MB</p>
            </div>
          </Upload.Dragger>

          {source && (
            <p id="transfer-import-source" className="text-sm text-text-muted dark:text-text-muted-dark">
              From <span className="font-semibold text-text dark:text-text-dark">{source.source || "unknown"}</span>
              {" · "}
              {dayjs(source.exportedAt).format(DATE_TIME_FORMAT)}
              {" · "}
              {source.appVersion}
              {" · "}
              {source.whole ? "whole backoffice" : "selected items"}
            </p>
          )}

          {(preview || previewing) && (
            <>
              <Radio.Group id="transfer-import-mode" value={mode} onChange={(e) => handleModeChange(e.target.value)} disabled={previewing}>
                <div className="flex flex-col gap-2">
                  <Radio value="merge">
                    <span className="font-semibold">Merge</span>
                    <span className="ml-2 text-text-muted dark:text-text-muted-dark">add new, update matching, delete nothing</span>
                  </Radio>
                  <Radio value="replace" disabled={!preview?.whole}>
                    <span className="font-semibold">Replace everything</span>
                    <span className="ml-2 text-text-muted dark:text-text-muted-dark">
                      {preview && !preview.whole ? "needs a whole-backoffice export" : "wipe this backoffice's content, then load the file"}
                    </span>
                  </Radio>
                </div>
              </Radio.Group>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-text dark:text-text-dark">Preview — nothing has changed yet</h3>
                {previewing ? <p className="text-sm text-text-muted">Checking the file…</p> : preview && <ReportTable report={preview} />}
              </div>

              {preview && preview.warnings.length > 0 && (
                <Alert type="warning" showIcon title="Heads up" description={<ul className="list-disc pl-5">{preview.warnings.map((w) => <li key={w}>{w}</li>)}</ul>} />
              )}

              <div className="flex gap-2">
                <Button
                  id="transfer-import-run"
                  type="primary"
                  danger={mode === "replace"}
                  loading={importing}
                  disabled={!preview || previewing}
                  onClick={handleImport}
                >
                  {mode === "replace" ? "Replace everything" : "Import"}
                </Button>
                <Button id="transfer-import-cancel" disabled={importing} onClick={() => { setFile(null); setPreview(null); }}>
                  Cancel
                </Button>
              </div>
            </>
          )}

          {result && (
            <div id="transfer-import-result" className="flex flex-col gap-2">
              <Alert type="success" showIcon title={`Imported ${result.name}`} />
              <ReportTable report={result} />
              {result.warnings.length > 0 && (
                <Alert type="warning" showIcon title="Heads up" description={<ul className="list-disc pl-5">{result.warnings.map((w) => <li key={w}>{w}</li>)}</ul>} />
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
