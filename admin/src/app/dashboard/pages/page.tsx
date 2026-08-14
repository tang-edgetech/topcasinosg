"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, App as AntApp } from "antd";
import { useAuth } from "@/lib/auth-context";
import { useSiteSettings } from "@/lib/site-settings-context";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import type { PageDTO } from "@/lib/types";
import IconButton from "@/components/IconButton";
import { IconEdit, IconExternalLink, IconCopy, IconPlus, IconTrash } from "@/components/Icons";
import StatusBadge from "@/components/content/StatusBadge";
import PublishControl from "@/components/content/PublishControl";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "@/lib/pagination";

// NEXT_PUBLIC_WEB_URL points at this environment's actual web app (e.g. the
// local dev server on :4000), so links open the site you're actually running
// against. The admin-configured Site URL setting is the production domain
// (used for SEO/sitemaps) — only used here as a fallback when no per-environment
// override is set, i.e. in production itself.
const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL;

// Bonus-type-per-region pages aren't served at /{slug} — they're served by
// the bespoke /{region}/bonuses/{type} route (web/src/app/[region]/bonuses/
// [type]/page.tsx), which looks a page up by the computed slug
// "{region}-bonuses-{type}" (e.g. "th-bonuses-welcome"). The slug is only
// ever a lookup key for that route, never a literal URL path segment, so it
// has to be decomposed back into /region/bonuses/type here rather than
// appended directly after the domain.
const REGION_BONUS_TYPE_SLUG = /^([a-z]{2,3})-bonuses-([a-z_]+)$/;

function pagePublicUrl(base: string, page: PageDTO) {
  const root = base.replace(/\/+$/, "");
  if (page.slug === "home") return `${root}/`;

  const match = page.slug.match(REGION_BONUS_TYPE_SLUG);
  if (match) {
    const [, region, bonusType] = match;
    return `${root}/${region}/bonuses/${bonusType}`;
  }

  return `${root}/${page.slug}`;
}

export default function PagesPage() {
  const { user } = useAuth();
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const router = useRouter();
  const { settings } = useSiteSettings();
  const [pages, setPages] = useState<PageDTO[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <section id="pages-page" className="pages-page flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text dark:text-text-dark">Pages</h1>
        <IconButton id="pages-add-button" title="Add Page" onClick={() => router.push("/dashboard/pages/new")} icon={<IconPlus />} />
      </div>

      <Table
        id="pages-table"
        rowKey="id"
        loading={loading}
        dataSource={pages}
        pagination={{
          defaultPageSize: DEFAULT_PAGE_SIZE,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          showSizeChanger: true,
          showTotal: (t) => `${t} total`,
        }}
        columns={[
          {
            title: "Title",
            dataIndex: "title",
            key: "title",
            render: (_, p) => {
              const base = WEB_URL || settings?.siteUrl;
              const url = base ? pagePublicUrl(base, p) : null;
              return (
                <div className="flex items-center gap-2">
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
          { title: "Status", key: "status", render: (_, p) => <StatusBadge status={p.status} /> },
          {
            title: "Schedule",
            key: "schedule",
            render: (_, p) => (
              <PublishControl
                id={`page-${p.id}-publish`}
                status={p.status}
                publishAt={p.publishAt}
                onSave={(status, publishAt) => handleSetStatus(p, status, publishAt)}
              />
            ),
          },
          {
            title: "Actions",
            key: "actions",
            render: (_, p) => (
              <div className="flex gap-2">
                <IconButton
                  id={`page-${p.id}-edit`}
                  title="Edit Page"
                  onClick={() => router.push(`/dashboard/pages/${p.id}`)}
                  icon={<IconEdit />}
                  variant="muted"
                />
                <IconButton
                  id={`page-${p.id}-delete`}
                  title="Delete Page"
                  onClick={() => handleDelete(p)}
                  icon={<IconTrash />}
                  variant="danger"
                  disabled={p.slug === "home"}
                />
              </div>
            ),
          },
        ]}
      />
    </section>
  );
}
