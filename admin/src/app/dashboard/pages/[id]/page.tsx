"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { App as AntApp, Tabs } from "antd";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import type { PageDTO, PageSectionDTO } from "@/lib/types";
import PageMetaForm from "../PageMetaForm";
import PageSEOForm from "../PageSEOForm";
import SectionBuilder from "../SectionBuilder";

export default function EditPagePage() {
  const { user } = useAuth();
  const { message } = AntApp.useApp();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const pageId = Number(params.id);
  const [page, setPage] = useState<PageDTO | null>(null);
  const [sections, setSections] = useState<PageSectionDTO[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await api.get<{ page: PageDTO; sections: PageSectionDTO[] | null }>(`/api/admin/pages/${pageId}`);
        setPage(data.page);
        setSections(data.sections ?? []);
      } catch (err) {
        message.error(err instanceof ApiError ? err.message : "Could not load page.");
        router.push("/dashboard/pages");
      } finally {
        setLoading(false);
      }
    }
    if (Number.isFinite(pageId)) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId]);

  if (!user) return null;
  if (loading || !page || sections === null) {
    return (
      <section id="page-edit-page" className="page-edit-page flex flex-col gap-6">
        <p className="text-sm text-text-muted dark:text-text-muted-dark">Loading…</p>
      </section>
    );
  }

  return (
    <section id="page-edit-page" className="page-edit-page flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/dashboard/pages")}
          className="cursor-pointer text-sm font-medium text-primary-600 hover:text-primary-900"
        >
          ← Back to Pages
        </button>
      </div>
      <h1 className="text-2xl font-bold text-text dark:text-text-dark">Edit Page: {page.title}</h1>

      <Tabs
        defaultActiveKey="content"
        items={[
          {
            key: "content",
            label: "Content",
            children: <SectionBuilder pageId={page.id} initialSections={sections} />,
          },
          {
            key: "details",
            label: "Page Details",
            children: <PageMetaForm target={page} onSaved={(updated) => setPage(updated)} />,
          },
          {
            key: "seo",
            label: "SEO",
            children: <PageSEOForm page={page} onSaved={(updated) => setPage(updated)} />,
          },
        ]}
      />
    </section>
  );
}
