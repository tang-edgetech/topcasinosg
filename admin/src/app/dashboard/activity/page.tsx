"use client";

import { useEffect, useState } from "react";
import { App as AntApp, Button, DatePicker, Drawer, Select, Table } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import type { AuditActorDTO, AuditLogDTO } from "@/lib/types";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";
import { titleCase } from "@/lib/format";
import PageHeading from "@/components/PageHeading";

const ACTIVITY_PAGE_SIZE_OPTIONS = ["10", "20", "50", "75", "100"];
const DATE_TIME_FORMAT = "D MMM YYYY, h:mm A";

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
  range?: [Dayjs, Dayjs] | null;
}

function buildQuery(filters: ActivityFilters, page: number, pageSize: number): string {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (filters.actorId) params.set("actorId", filters.actorId);
  if (filters.entityType) params.set("entityType", filters.entityType);
  if (filters.action) params.set("action", filters.action);
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
  const hasFilters = Boolean(filters.actorId || filters.entityType || filters.action || filters.range);

  function updateFilters(next: Partial<ActivityFilters>) {
    setFilters((current) => ({ ...current, ...next }));
    setPage(1);
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
        <DatePicker.RangePicker
          id="activity-filter-dates"
          value={filters.range ?? null}
          onChange={(range) => updateFilters({ range: range && range[0] && range[1] ? [range[0], range[1]] : null })}
          disabledDate={(date) => date.isAfter(dayjs(), "day")}
        />
        {hasFilters && (
          <Button id="activity-filters-clear" onClick={() => updateFilters({ actorId: undefined, entityType: undefined, action: undefined, range: null })}>
            Clear filters
          </Button>
        )}
      </div>

      <Table
        id="activity-table"
        rowKey="id"
        loading={loading}
        dataSource={logs}
        onRow={(log) => ({ onClick: () => setSelected(log), className: "cursor-pointer" })}
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
              <span className={log.action === "login_failed" || log.action === "delete" ? "font-medium text-danger" : ""}>
                {actionLabel(log.action)}
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
          { title: "IP Address", key: "ip", dataIndex: "ipAddress" },
        ]}
      />

      <Drawer open={selected !== null} onClose={() => setSelected(null)} title="Activity Details" size={560}>
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
              <dt className="text-text-muted dark:text-text-muted-dark">IP Address</dt>
              <dd>{selected.ipAddress || "—"}</dd>
              <dt className="text-text-muted dark:text-text-muted-dark">Browser</dt>
              <dd className="break-words">{selected.userAgent || "—"}</dd>
            </dl>

            <div className="flex flex-col gap-2">
              <h3 className="text-base font-semibold">Changes</h3>
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
