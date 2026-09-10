"use client";

import { createContext, useContext, useEffect, useMemo, useState, type HTMLAttributes } from "react";
import { useRouter } from "next/navigation";
import { Table, App as AntApp } from "antd";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DraggableSyntheticListeners } from "@dnd-kit/core";
import { useAuth } from "@/lib/auth-context";
import { useSiteSettings } from "@/lib/site-settings-context";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import type { PageDTO } from "@/lib/types";
import IconButton from "@/components/IconButton";
import { IconEdit, IconExternalLink, IconCopy, IconPlus, IconTrash, IconGripVertical } from "@/components/Icons";
import StatusBadge from "@/components/content/StatusBadge";
import PublishControl from "@/components/content/PublishControl";
import StatusFilter, { type StatusFilterValue } from "@/components/content/StatusFilter";
import BulkActionBar from "@/components/content/BulkActionBar";
import { runBulkAction, bulkResultMessage } from "@/lib/bulk";

// NEXT_PUBLIC_WEB_URL points at this environment's actual web app (e.g. the
// local dev server on :4000), so links open the site you're actually running
// against. The admin-configured Site URL setting is the production domain
// (used for SEO/sitemaps) — only used here as a fallback when no per-environment
// override is set, i.e. in production itself.
const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL;

// Bonus-type-per-region pages aren't served at their path — they're served
// by the bespoke /{region}/bonuses/{type} route (web/src/app/[region]/
// bonuses/[type]/page.tsx), which looks a page up by the computed slug
// "{region}-bonuses-{type}" (e.g. "th-bonuses-welcome"). The slug is only
// ever a lookup key for that route, never a literal URL path segment, so it
// has to be decomposed back into /region/bonuses/type here rather than
// appended directly after the domain — these pages are also kept as root
// pages (no parent) precisely so their slug alone still means this.
const REGION_BONUS_TYPE_SLUG = /^([a-z]{2,3})-bonuses-([a-z_]+)$/;

function pagePublicUrl(base: string, page: PageDTO) {
  const root = base.replace(/\/+$/, "");
  if (page.slug === "home") return `${root}/`;

  const match = page.slug.match(REGION_BONUS_TYPE_SLUG);
  if (match) {
    const [, region, bonusType] = match;
    return `${root}/${region}/bonuses/${bonusType}`;
  }

  return `${root}/${page.path}`;
}

// The tree is always shown fully expanded (no collapse control) - this
// just computes each page's parent/child relationships and depth from the
// flat parentId list, then flattenTree below renders it as a flat list
// with depth-based indentation (see the Title column's render). Each level
// is sorted by sortOrder (the admin's drag-and-drop position), ties broken
// by id.
interface PageTreeRow extends PageDTO {
  children?: PageTreeRow[];
  // depth is 0 for a root page, +1 per level.
  depth: number;
}

function bySortOrder(a: { sortOrder: number; id: number }, b: { sortOrder: number; id: number }) {
  return a.sortOrder - b.sortOrder || a.id - b.id;
}

function buildPageTree(pages: PageDTO[]): PageTreeRow[] {
  const byId = new Map<number, PageTreeRow>(pages.map((p) => [p.id, { ...p, depth: 0 }]));
  const roots: PageTreeRow[] = [];
  for (const page of byId.values()) {
    if (page.parentId != null && byId.has(page.parentId)) {
      const parent = byId.get(page.parentId)!;
      (parent.children ??= []).push(page);
    } else {
      roots.push(page);
    }
  }
  const sortRecursive = (nodes: PageTreeRow[], depth: number) => {
    nodes.sort(bySortOrder);
    for (const n of nodes) {
      n.depth = depth;
      if (n.children) sortRecursive(n.children, depth + 1);
    }
  };
  sortRecursive(roots, 0);
  return roots;
}

// Strips `children` off each row before returning - antd's Table treats
// any record with a non-empty `children` array as an expandable tree node
// regardless of whether the array you hand it as `dataSource` is already
// flat, which would otherwise render every non-leaf page's descendants
// twice (once nested under it, once as their own flattened rows).
function flattenTree(tree: PageTreeRow[]): PageTreeRow[] {
  const out: PageTreeRow[] = [];
  const walk = (nodes: PageTreeRow[]) => {
    for (const { children, ...rest } of nodes) {
      out.push(rest as PageTreeRow);
      if (children) walk(children);
    }
  };
  walk(tree);
  return out;
}

// dnd-kit's row wrapper (components.body.row) owns the sortable hook, but
// the actual grab handle lives in a separate table cell a few columns over —
// this context is how the handle cell reaches back into its own row's
// listeners/ref without every column needing to know about drag-and-drop.
const DragHandleContext = createContext<{
  setActivatorNodeRef?: (element: HTMLElement | null) => void;
  listeners?: DraggableSyntheticListeners;
  dragDisabled?: boolean;
}>({});

// Dragging while a status filter hides some siblings would reorder against
// only the visible subset, not the real sibling list handleDragEnd computes
// from — simplest correct behavior is to require "All Statuses" before
// letting drag-and-drop run at all, rather than reconciling a partial view.
function DragHandle() {
  const { setActivatorNodeRef, listeners, dragDisabled } = useContext(DragHandleContext);
  if (dragDisabled) {
    return (
      <span
        className="flex cursor-not-allowed rounded p-1 text-text-muted/40 dark:text-text-muted-dark/40"
        title="Clear the status filter to reorder pages"
      >
        <IconGripVertical width={14} height={14} />
      </span>
    );
  }
  return (
    <button
      type="button"
      ref={setActivatorNodeRef}
      {...listeners}
      className="cursor-grab touch-none rounded p-1 text-text-muted hover:bg-surface-muted hover:text-text active:cursor-grabbing dark:text-text-muted-dark dark:hover:bg-surface-muted-dark dark:hover:text-text-dark"
      title="Drag to reorder"
    >
      <IconGripVertical width={14} height={14} />
    </button>
  );
}

// A bound closure (see PagesPage's `useMemo`) rather than a fixed component,
// so `dragDisabled` (whether a status filter is currently narrowing the
// visible sibling set) is baked in without needing to route it through
// antd's `components.body.row` prop plumbing, which doesn't pass extras.
function makeDraggableRow(dragDisabled: boolean) {
  return function DraggableRow(props: HTMLAttributes<HTMLTableRowElement> & { "data-row-key": number }) {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
      id: props["data-row-key"],
      disabled: dragDisabled,
    });
    const style: React.CSSProperties = {
      ...props.style,
      transform: CSS.Translate.toString(transform),
      transition,
      ...(isDragging ? { position: "relative", zIndex: 10, background: "var(--color-surface)" } : {}),
    };
    const contextValue = useMemo(
      () => ({ setActivatorNodeRef, listeners, dragDisabled }),
      [setActivatorNodeRef, listeners, dragDisabled]
    );
    return (
      <DragHandleContext.Provider value={contextValue}>
        <tr {...props} ref={setNodeRef} style={style} {...attributes} />
      </DragHandleContext.Provider>
    );
  };
}

export default function PagesPage() {
  const { user } = useAuth();
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const router = useRouter();
  const { settings } = useSiteSettings();
  const [pages, setPages] = useState<PageDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("all");
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  async function load() {
    setLoading(true);
    try {
      const data = await api.get<{ pages: PageDTO[] | null }>("/api/admin/pages");
      setPages(data.pages ?? []);
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not load pages.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return null;
  const canManage = user.role === "super_admin" || user.role === "admin";

  // Filtering happens on the flat list before the tree is (re)built, so a
  // child page matching the filter still shows even if its parent doesn't -
  // it just surfaces as a top-level row for that view, same as any tree
  // filtered down to a subset of its nodes.
  const filteredPages = statusFilter === "all" ? pages : pages.filter((p) => p.status === statusFilter);
  const tree = buildPageTree(filteredPages);
  const flatRows = flattenTree(tree);
  const selectedPages = pages.filter((p) => selectedRowKeys.includes(p.id));
  const draggableRow = useMemo(() => makeDraggableRow(statusFilter !== "all"), [statusFilter]);

  async function handleSetStatus(page: PageDTO, status: string, publishAt: string | null) {
    await api.put(`/api/admin/pages/${page.id}/status`, { status, publishAt });
    message.success("Publish settings updated.");
    load();
  }

  async function handleCopyLink(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      message.success("Link copied.");
    } catch {
      message.error("Could not copy link.");
    }
  }

  async function handleDelete(page: PageDTO) {
    if (page.slug === "home") {
      message.error("The Homepage can't be deleted.");
      return;
    }
    if (pages.some((p) => p.parentId === page.id)) {
      message.error("Delete or move this page's child pages first.");
      return;
    }
    const ok = await confirm({
      title: "Delete Page",
      message: `Delete "${page.title}"? This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    try {
      await api.del(`/api/admin/pages/${page.id}`);
      message.success("Deleted.");
      load();
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not delete page.");
    }
  }

  async function handleBulkStatus(status: "published" | "draft") {
    const ok = await confirm({
      title: status === "published" ? "Publish Pages" : "Set Pages to Draft",
      message: `${status === "published" ? "Publish" : "Set to draft"} ${selectedPages.length} page(s)?`,
      confirmLabel: status === "published" ? "Publish" : "Set to Draft",
    });
    if (!ok) return;
    const { succeeded, failed } = await runBulkAction(selectedPages, (p) =>
      api.put(`/api/admin/pages/${p.id}/status`, { status, publishAt: null })
    );
    message[failed > 0 ? "warning" : "success"](bulkResultMessage(succeeded, failed, "page(s) updated"));
    setSelectedRowKeys([]);
    load();
  }

  async function handleBulkDelete() {
    const deletable = selectedPages.filter((p) => p.slug !== "home");
    if (deletable.length === 0) {
      message.error("The Homepage can't be deleted.");
      return;
    }
    const ok = await confirm({
      title: "Delete Pages",
      message: `Delete ${deletable.length} page(s)? This cannot be undone. A page with child pages outside this selection will be skipped.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;

    // Deepest paths first, so a parent+child selected together delete in
    // the only order the database's FK will actually allow.
    const ordered = [...deletable].sort((a, b) => b.path.split("/").length - a.path.split("/").length);
    const { succeeded, failed } = await runBulkAction(ordered, (p) => api.del(`/api/admin/pages/${p.id}`));
    message[failed > 0 ? "warning" : "success"](bulkResultMessage(succeeded, failed, "page(s) deleted"));
    setSelectedRowKeys([]);
    load();
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activePage = pages.find((p) => p.id === active.id);
    const overPage = pages.find((p) => p.id === over.id);
    if (!activePage || !overPage) return;

    if ((activePage.parentId ?? null) !== (overPage.parentId ?? null)) {
      message.error("Pages can only be reordered within the same parent — move it in the editor first to change its parent.");
      return;
    }

    const parentId = activePage.parentId ?? null;
    const siblings = pages.filter((p) => (p.parentId ?? null) === parentId).sort(bySortOrder);
    const oldIndex = siblings.findIndex((p) => p.id === activePage.id);
    const newIndex = siblings.findIndex((p) => p.id === overPage.id);
    const reordered = arrayMove(siblings, oldIndex, newIndex);
    const orderedIds = reordered.map((p) => p.id);

    setPages((prev) =>
      prev.map((p) => {
        const idx = orderedIds.indexOf(p.id);
        return idx === -1 ? p : { ...p, sortOrder: idx };
      })
    );

    api.put("/api/admin/pages/reorder", { parentId, pageIds: orderedIds }).catch(() => {
      message.error("Could not save the new order.");
      load();
    });
  }

  return (
    <section id="pages-page" className="pages-page flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text dark:text-text-dark">Pages</h1>
        <IconButton id="pages-add-button" title="Add Page" onClick={() => router.push("/dashboard/pages/new")} icon={<IconPlus />} />
      </div>

      <div className="flex items-center gap-3">
        <StatusFilter id="pages-status-filter" value={statusFilter} onChange={setStatusFilter} />
        {statusFilter !== "all" && (
          <span className="text-xs text-text-muted dark:text-text-muted-dark">Drag-to-reorder is disabled while a status filter is active.</span>
        )}
      </div>

      <BulkActionBar
        count={selectedRowKeys.length}
        onClear={() => setSelectedRowKeys([])}
        actions={[
          { id: "pages-bulk-publish", label: "Publish", onClick: () => handleBulkStatus("published") },
          { id: "pages-bulk-draft", label: "Set to Draft", onClick: () => handleBulkStatus("draft") },
          ...(canManage ? [{ id: "pages-bulk-delete", label: "Delete", onClick: handleBulkDelete, danger: true }] : []),
        ]}
      />

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={flatRows.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          <Table
            id="pages-table"
            rowKey="id"
            loading={loading}
            dataSource={flatRows}
            pagination={false}
            components={{ body: { row: draggableRow } }}
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
            }}
            columns={[
              { title: "", key: "drag", width: 32, render: () => <DragHandle /> },
              {
                title: "Title",
                dataIndex: "title",
                key: "title",
                sorter: (a, b) => a.title.localeCompare(b.title),
                render: (_, p) => {
                  const base = WEB_URL || settings?.siteUrl;
                  const url = base ? pagePublicUrl(base, p) : null;
                  return (
                    <div className="flex items-center gap-2" style={p.depth > 0 ? { paddingLeft: p.depth * 20 } : undefined}>
                      {p.depth > 0 && (
                        <span
                          aria-hidden="true"
                          className="pages-tree__connector -ml-2 h-4 w-3 shrink-0 border-b border-l border-border dark:border-border-dark"
                        />
                      )}
                      <span className="text-text dark:text-text-dark">{p.title}</span>
                      <IconButton
                        id={`page-${p.id}-open`}
                        title={url ? "Open in New Tab" : "Set a Site URL in Settings first"}
                        onClick={() => url && window.open(url, "_blank", "noopener,noreferrer")}
                        icon={<IconExternalLink />}
                        variant="muted"
                        disabled={!url}
                      />
                      <IconButton
                        id={`page-${p.id}-copy-link`}
                        title={url ? "Copy Link" : "Set a Site URL in Settings first"}
                        onClick={() => url && handleCopyLink(url)}
                        icon={<IconCopy />}
                        variant="muted"
                        disabled={!url}
                      />
                    </div>
                  );
                },
              },
              { title: "Slug", dataIndex: "slug", key: "slug" },
              {
                title: "URL Path",
                key: "path",
                render: (_, p) => <code className="text-xs text-text-muted dark:text-text-muted-dark">/{p.path}</code>,
              },
              {
                title: "Status",
                key: "status",
                render: (_, p) => <StatusBadge status={p.status} />,
                sorter: (a, b) => a.status.localeCompare(b.status),
              },
              {
                title: "Actions",
                key: "actions",
                render: (_, p) => (
                  <div className="flex items-center gap-2">
                    {p.status !== "published" && (
                      <PublishControl
                        id={`page-${p.id}-publish`}
                        status={p.status}
                        publishAt={p.publishAt}
                        onSave={(status, publishAt) => handleSetStatus(p, status, publishAt)}
                      />
                    )}
                    <IconButton
                      id={`page-${p.id}-edit`}
                      title="Edit Page"
                      onClick={() => router.push(`/dashboard/pages/${p.id}`)}
                      icon={<IconEdit />}
                      variant="muted"
                    />
                    {canManage && (
                      <IconButton
                        id={`page-${p.id}-delete`}
                        title={pages.some((c) => c.parentId === p.id) ? "Delete or move child pages first" : "Delete Page"}
                        onClick={() => handleDelete(p)}
                        icon={<IconTrash />}
                        variant="danger"
                        disabled={p.slug === "home" || pages.some((c) => c.parentId === p.id)}
                      />
                    )}
                  </div>
                ),
              },
            ]}
          />
        </SortableContext>
      </DndContext>
    </section>
  );
}
