"use client";

import { useEffect, useState } from "react";
import { App as AntApp, Button, DatePicker, Drawer, Dropdown, Select, Table, Tag } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import type { AuditActorDTO, AuditLogDTO } from "@/lib/types";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";
import { titleCase } from "@/lib/format";
import PageHeading from "@/components/PageHeading";
import { activityDebugReport, activityToCSV, activityToJSON, downloadText, formatClientAddress, isFailedActivity } from "@/lib/activityExport";

const ACTIVITY_PAGE_SIZE_OPTIONS = ["10", "20", "50", "75", "100"];
const DATE_TIME_FORMAT = "D MMM YYYY, h:mm A";
const EXPORT_PAGE_SIZE = 100;
const MAX_EXPORT_ENTRIES = 5000;

const OUTCOME_FILTERS = [
  { value: "error", label: "Errors only" },
];

const SECTION_LABELS: Record<string, string> = {
  pages: "Pages",
  casinos: "Casinos",
  bonuses: "Bonuses",
  "payment-methods": "Payment Methods",
  rtp: "RTP",
  guides: "Guides",
  blacklist: "Blacklist",
  news: "News",
  media: "Media Library",
  regions: "Regions",
  "game-providers": "Game Providers",
  licenses: "Licenses",
  users: "Users",
  "menu-items": "Navigation",
  sidebar: "Sidebar",
  snippets: "Snippets",
  settings: "Site Settings",
  exports: "Export",
  imports: "Import",
  account: "My Account",
  auth: "Sign-in",
};

const ACTION_LABELS: Record<string, string> = {
  create: "Created",
  update: "Updated",
  delete: "Deleted",
  status: "Changed status",
  active: "Turned on/off",
  seo: "Updated SEO",
  sections: "Edited sections",
  snippets: "Edited custom code",
  "reset-password": "Reset password",
  "reset-otp": "Reset 2FA",
  login: "Signed in",
  login_failed: "Failed sign-in",
  logout: "Signed out",
  download: "Downloaded",
  preview: "Previewed",
};

const ACTION_FILTERS = ["create", "update", "delete", "status", "login", "login_failed", "logout"];

function sectionLabel(entityType: string): string {
  const [root, ...rest] = entityType.split("/");
  const label = SECTION_LABELS[root] ?? titleCase(root.replace(/-/g, " "));
  return rest.length > 0 ? `${label} · ${rest.join(" / ")}` : label;
}

function actionLabel(action: string): string {
  return ACTION_LABELS[action] ?? titleCase(action.replace(/[-_/]/g, " "));
}

function fieldLabel(path: string): string {
  return path
    .split(".")
    .map((part) => titleCase(part.replace(/([a-z])([A-Z])/g, "$1 $2")))
    .join(" › ");
}

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value) && value.every((item) => typeof item !== "object" || item === null)) {
    return value.length > 0 ? value.join(", ") : "—";
  }
  return JSON.stringify(value, null, 2);
}

interface ActivityFilters {
  actorId?: string;
  entityType?: string;
  action?: string;
  outcome?: string;
  range?: [Dayjs, Dayjs] | null;
}

function describeFilters(filters: ActivityFilters, actors: AuditActorDTO[]): string {
  const parts: string[] = [];
  if (filters.actorId) parts.push(`user: ${actors.find((a) => String(a.id) === filters.actorId)?.name ?? filters.actorId}`);
  if (filters.entityType) parts.push(`section: ${SECTION_LABELS[filters.entityType] ?? filters.entityType}`);
  if (filters.action) parts.push(`action: ${actionLabel(filters.action)}`);
  if (filters.outcome === "error") parts.push("errors only");
  if (filters.range) parts.push(`dates: ${filters.range[0].format("YYYY-MM-DD")} to ${filters.range[1].format("YYYY-MM-DD")}`);
  return parts.join(", ");
}

function buildQuery(filters: ActivityFilters, page: number, pageSize: number): string {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (filters.actorId) params.set("actorId", filters.actorId);
  if (filters.entityType) params.set("entityType", filters.entityType);
  if (filters.action) params.set("action", filters.action);
  if (filters.outcome) params.set("outcome", filters.outcome);
  if (filters.range) {
    params.set("from", filters.range[0].startOf("day").toISOString());
    params.set("to", filters.range[1].add(1, "day").startOf("day").toISOString());
  }
  return params.toString();
}

export default function ActivityPage() {
  const { user } = useAuth();
  const { message } = AntApp.useApp();
  const [logs, setLogs] = useState<AuditLogDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [loadedQuery, setLoadedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [filters, setFilters] = useState<ActivityFilters>({});
  const [actors, setActors] = useState<AuditActorDTO[]>([]);
  const [selected, setSelected] = useState<AuditLogDTO | null>(null);
  const [checked, setChecked] = useState<Map<number, AuditLogDTO>>(new Map());
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    api
      .get<{ actors: AuditActorDTO[] | null }>("/api/admin/activity/actors")
      .then((data) => setActors(data.actors ?? []))
      .catch(() => setActors([]));
  }, []);

  const query = buildQuery(filters, page, pageSize);
  const loading = loadedQuery !== query;

  useEffect(() => {
    let cancelled = false;
    api
      .get<{ logs: AuditLogDTO[] | null; total: number }>(`/api/admin/activity?${query}`)
      .then((data) => {
        if (cancelled) return;
        setLogs(data.logs ?? []);
        setTotal(data.total);
      })
      .catch((err) => {
        if (!cancelled) message.error(err instanceof ApiError ? err.message : "Could not load activity.");
      })
      .finally(() => {
        if (!cancelled) setLoadedQuery(query);
      });
    return () => {
      cancelled = true;
    };
  }, [query, message]);

  if (!user) return null;

  const isEditor = user.role === "editor";
  const hasFilters = Boolean(filters.actorId || filters.entityType || filters.action || filters.outcome || filters.range);
  const exportScope = checked.size > 0 ? `${checked.size} selected` : `all ${total} matching`;

  function updateFilters(next: Partial<ActivityFilters>) {
    setFilters((current) => ({ ...current, ...next }));
    setPage(1);
  }

  async function loadExportRows(): Promise<AuditLogDTO[]> {
    if (checked.size > 0) return [...checked.values()].sort((a, b) => b.id - a.id);
    const rows: AuditLogDTO[] = [];
    for (let nextPage = 1; rows.length < Math.min(total, MAX_EXPORT_ENTRIES); nextPage++) {
      const data = await api.get<{ logs: AuditLogDTO[] | null; total: number }>(
        `/api/admin/activity?${buildQuery(filters, nextPage, EXPORT_PAGE_SIZE)}`,
      );
      const batch = data.logs ?? [];
      rows.push(...batch);
      if (batch.length < EXPORT_PAGE_SIZE) break;
    }
    return rows.slice(0, MAX_EXPORT_ENTRIES);
  }

  async function withExportRows(run: (rows: AuditLogDTO[]) => Promise<void> | void) {
    setExporting(true);
    try {
      const rows = await loadExportRows();
      if (rows.length === 0) {
        message.info("Nothing to export.");
        return;
      }
      await run(rows);
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not export activity.");
    } finally {
      setExporting(false);
    }
  }

  function exportFile(format: "json" | "csv") {
    return withExportRows((rows) => {
      const stamp = dayjs().format("YYYYMMDD-HHmmss");
      if (format === "json") downloadText(`activity-${stamp}.json`, activityToJSON(rows), "application/json");
      else downloadText(`activity-${stamp}.csv`, activityToCSV(rows), "text/csv;charset=utf-8");
      message.success(`Exported ${rows.length} entr${rows.length === 1 ? "y" : "ies"}.`);
    });
  }

  async function copyReport(rows?: AuditLogDTO[]) {
    const copy = async (list: AuditLogDTO[]) => {
      await navigator.clipboard.writeText(
        activityDebugReport(list, { site: window.location.origin, filters: rows ? "single entry" : describeFilters(filters, actors) }),
      );
      message.success(`Copied ${list.length} entr${list.length === 1 ? "y" : "ies"} — paste into Claude to debug.`);
    };
    if (rows) {
      try {
        await copy(rows);
      } catch {
        message.error("Could not copy to the clipboard.");
      }
      return;
    }
    await withExportRows(copy);
  }

  function toggleChecked(keys: React.Key[], rowsOnPage: AuditLogDTO[]) {
    setChecked((current) => {
      const next = new Map(current);
      for (const log of logs) next.delete(log.id);
      for (const log of rowsOnPage) if (keys.includes(log.id)) next.set(log.id, log);
      return next;
    });
  }

  const changeRows = selected
    ? Object.entries(selected.changes ?? {})
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([field, change]) => ({ field, from: change.from, to: change.to, hasFrom: "from" in change, hasTo: "to" in change }))
    : [];

  return (
    <section id="activity-page" className="activity-page flex flex-col gap-6">
      <PageHeading title="Activity Log" help="activity" />

      <div id="activity-filters" className="activity-filters flex flex-wrap items-center gap-3">
        {!isEditor && (
          <Select
            id="activity-filter-user"
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder="All users"
            className="min-w-44"
            value={filters.actorId}
            onChange={(value) => updateFilters({ actorId: value })}
            options={actors.map((actor) => ({ value: String(actor.id), label: actor.name }))}
          />
        )}
        <Select
          id="activity-filter-section"
          allowClear
          placeholder="All sections"
          className="min-w-44"
          value={filters.entityType}
          onChange={(value) => updateFilters({ entityType: value })}
          options={Object.entries(SECTION_LABELS).map(([value, label]) => ({ value, label }))}
        />
        <Select
          id="activity-filter-action"
          allowClear
          placeholder="All actions"
          className="min-w-40"
          value={filters.action}
          onChange={(value) => updateFilters({ action: value })}
          options={ACTION_FILTERS.map((value) => ({ value, label: ACTION_LABELS[value] }))}
        />
        <Select
          id="activity-filter-outcome"
          allowClear
          placeholder="All outcomes"
          className="min-w-36"
          value={filters.outcome}
          onChange={(value) => updateFilters({ outcome: value })}
          options={OUTCOME_FILTERS}
        />
        <DatePicker.RangePicker
          id="activity-filter-dates"
          value={filters.range ?? null}
          onChange={(range) => updateFilters({ range: range && range[0] && range[1] ? [range[0], range[1]] : null })}
          disabledDate={(date) => date.isAfter(dayjs(), "day")}
        />
        {hasFilters && (
          <Button id="activity-filters-clear" onClick={() => updateFilters({ actorId: undefined, entityType: undefined, action: undefined, outcome: undefined, range: null })}>
            Clear filters
          </Button>
        )}
      </div>

      <div id="activity-toolbar" className="activity-toolbar flex flex-wrap items-center gap-3">
        <span className="text-sm text-text-muted dark:text-text-muted-dark">
          {checked.size > 0 ? `${checked.size} selected` : "Select entries, or export everything that matches the filters."}
        </span>
        {checked.size > 0 && (
          <Button id="activity-selection-clear" type="link" className="px-0" onClick={() => setChecked(new Map())}>
            Clear selection
          </Button>
        )}
        <div className="ml-auto flex flex-wrap gap-2">
          <Dropdown
            trigger={["click"]}
            disabled={exporting || total === 0}
            menu={{
              items: [
                { key: "json", label: `JSON (${exportScope})` },
                { key: "csv", label: `CSV (${exportScope})` },
              ],
              onClick: ({ key }) => exportFile(key as "json" | "csv"),
            }}
          >
            <Button id="activity-export" loading={exporting}>Export</Button>
          </Dropdown>
          <Button id="activity-copy" type="primary" disabled={exporting || total === 0} onClick={() => copyReport()}>
            Copy for debugging ({exportScope})
          </Button>
        </div>
      </div>

      <Table
        id="activity-table"
        rowKey="id"
        loading={loading}
        dataSource={logs}
        onRow={(log) => ({ onClick: () => setSelected(log), className: `cursor-pointer${isFailedActivity(log) ? " activity-row--failed" : ""}` })}
        rowSelection={{
          selectedRowKeys: logs.filter((log) => checked.has(log.id)).map((log) => log.id),
          onChange: (keys) => toggleChecked(keys, logs),
          columnWidth: 40,
        }}
        pagination={{
          current: page,
          pageSize,
          total,
          pageSizeOptions: ACTIVITY_PAGE_SIZE_OPTIONS,
          showSizeChanger: true,
          showTotal: (count) => `${count} total`,
          onChange: (nextPage, nextPageSize) => {
            setPage(nextPageSize === pageSize ? nextPage : 1);
            setPageSize(nextPageSize);
          },
        }}
        columns={[
          {
            title: "When",
            key: "when",
            width: 190,
            render: (_, log) => <span className="whitespace-nowrap">{dayjs(log.createdAt).format(DATE_TIME_FORMAT)}</span>,
          },
          {
            title: "User",
            key: "user",
            render: (_, log) =>
              log.actorName ? (
                <div>
                  <p className="text-[15px] font-semibold leading-tight text-text dark:text-text-dark">{log.actorName}</p>
                  <p className="text-[13px] leading-tight text-text-muted dark:text-text-muted-dark">{titleCase(log.actorRole)}</p>
                </div>
              ) : (
                <span className="text-text-muted dark:text-text-muted-dark">Unknown</span>
              ),
          },
          {
            title: "Action",
            key: "action",
            render: (_, log) => (
              <span className="flex flex-wrap items-center gap-1.5">
                <span className={isFailedActivity(log) || log.action === "delete" ? "font-medium text-danger" : ""}>
                  {actionLabel(log.action)}
                </span>
                {isFailedActivity(log) && (
                  <Tag color="error" className="m-0" title={log.error}>
                    {log.action === "login_failed" ? "Failed" : `Error ${log.statusCode}`}
                  </Tag>
                )}
              </span>
            ),
          },
          { title: "Section", key: "section", render: (_, log) => sectionLabel(log.entityType) },
          {
            title: "Record",
            key: "record",
            render: (_, log) => (
              <span>
                {log.entityLabel || "—"}
                {log.entityId !== null && <span className="ml-1 text-text-muted dark:text-text-muted-dark">#{log.entityId}</span>}
              </span>
            ),
          },
          { title: "IP Address", key: "ip", render: (_, log) => <span className="whitespace-nowrap">{formatClientAddress(log) || "—"}</span> },
        ]}
      />

      <Drawer
        open={selected !== null}
        onClose={() => setSelected(null)}
        title="Activity Details"
        size={560}
        extra={selected && <Button id="activity-details-copy" onClick={() => copyReport([selected])}>Copy for debugging</Button>}
      >
        {selected && (
          <div id="activity-details" className="flex flex-col gap-5 text-sm text-text dark:text-text-dark">
            <dl className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-2">
              <dt className="text-text-muted dark:text-text-muted-dark">When</dt>
              <dd>{dayjs(selected.createdAt).format(DATE_TIME_FORMAT)}</dd>
              <dt className="text-text-muted dark:text-text-muted-dark">User</dt>
              <dd>{selected.actorName ? `${selected.actorName} (${titleCase(selected.actorRole)})` : "Unknown"}</dd>
              <dt className="text-text-muted dark:text-text-muted-dark">Action</dt>
              <dd>{actionLabel(selected.action)}</dd>
              <dt className="text-text-muted dark:text-text-muted-dark">Section</dt>
              <dd>{sectionLabel(selected.entityType)}</dd>
              <dt className="text-text-muted dark:text-text-muted-dark">Record</dt>
              <dd>
                {selected.entityLabel || "—"}
                {selected.entityId !== null && ` #${selected.entityId}`}
              </dd>
              {selected.method && (
                <>
                  <dt className="text-text-muted dark:text-text-muted-dark">Request</dt>
                  <dd className="break-all font-mono text-[12px]">{selected.method} {selected.path}</dd>
                </>
              )}
              {selected.statusCode > 0 && (
                <>
                  <dt className="text-text-muted dark:text-text-muted-dark">Result</dt>
                  <dd className={isFailedActivity(selected) ? "font-medium text-danger" : "text-success"}>
                    {isFailedActivity(selected) ? `Failed (${selected.statusCode})` : `Succeeded (${selected.statusCode})`}
                  </dd>
                </>
              )}
              {selected.error && (
                <>
                  <dt className="text-text-muted dark:text-text-muted-dark">Error</dt>
                  <dd className="break-words text-danger">{selected.error}</dd>
                </>
              )}
              <dt className="text-text-muted dark:text-text-muted-dark">IP Address</dt>
              <dd>{formatClientAddress(selected) || "—"}</dd>
              <dt className="text-text-muted dark:text-text-muted-dark">Browser</dt>
              <dd className="break-words">{selected.userAgent || "—"}</dd>
            </dl>

            <div className="flex flex-col gap-2">
              <h3 className="text-base font-semibold">{isFailedActivity(selected) ? "Submitted" : "Changes"}</h3>
              {changeRows.length === 0 ? (
                <p className="text-text-muted dark:text-text-muted-dark">No field changes recorded for this action.</p>
              ) : (
                <table id="activity-changes" className="activity-changes w-full table-fixed border-collapse text-[13px]">
                  <thead>
                    <tr className="border-b border-border text-left dark:border-border-dark">
                      <th className="w-1/4 py-2 pr-2 font-semibold">Field</th>
                      <th className="py-2 pr-2 font-semibold">Before</th>
                      <th className="py-2 font-semibold">After</th>
                    </tr>
                  </thead>
                  <tbody>
                    {changeRows.map((row) => (
                      <tr key={row.field} className="border-b border-border align-top dark:border-border-dark">
                        <td className="py-2 pr-2 font-medium">{fieldLabel(row.field)}</td>
                        <td className="py-2 pr-2 text-danger">
                          <pre className="whitespace-pre-wrap break-words font-sans">{row.hasFrom ? displayValue(row.from) : "—"}</pre>
                        </td>
                        <td className="py-2 text-success">
                          <pre className="whitespace-pre-wrap break-words font-sans">{row.hasTo ? displayValue(row.to) : "—"}</pre>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </section>
  );
}
