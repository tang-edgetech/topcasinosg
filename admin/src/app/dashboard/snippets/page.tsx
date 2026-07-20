"use client";

import { useEffect, useState } from "react";
import { Tabs, App as AntApp } from "antd";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import type { SnippetDTO, PageDTO } from "@/lib/types";
import HeaderFooterPanel from "./HeaderFooterPanel";
import CodePanel from "./CodePanel";

export default function SnippetsPage() {
  const { user } = useAuth();
  const { message } = AntApp.useApp();
  const [snippets, setSnippets] = useState<SnippetDTO[]>([]);
  const [pages, setPages] = useState<PageDTO[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [snippetData, pageData] = await Promise.all([
        api.get<{ snippets: SnippetDTO[] | null }>("/api/admin/snippets"),
        api.get<{ pages: PageDTO[] | null }>("/api/admin/pages"),
      ]);
      setSnippets(snippetData.snippets ?? []);
      setPages(pageData.pages ?? []);
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not load snippets.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return null;

  if (user.role !== "super_admin") {
    return (
      <section id="snippets-page" className="snippets-page">
        <p className="text-text-muted dark:text-text-muted-dark">You don&apos;t have access to this section.</p>
      </section>
    );
  }

  const headerFooterSnippets = snippets.filter((s) => s.kind === "global");
  const codeSnippets = snippets.filter((s) => s.kind === "code");

  return (
    <section id="snippets-page" className="snippets-page flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text dark:text-text-dark">Snippets</h1>
        <p className="mt-1 text-sm text-text-muted dark:text-text-muted-dark">
          Raw HTML/JavaScript injected into the site — analytics, tracking pixels, chat widgets, etc.
        </p>
      </div>

      {loading ? (
        <p className="text-text-muted dark:text-text-muted-dark">Loading…</p>
      ) : (
        <Tabs
          defaultActiveKey="header-footer"
          items={[
            {
              key: "header-footer",
              label: "Header & Footer",
              children: <HeaderFooterPanel snippets={headerFooterSnippets} onReload={load} />,
            },
            {
              key: "code",
              label: "Code",
              children: <CodePanel snippets={codeSnippets} pages={pages} onReload={load} />,
            },
          ]}
        />
      )}
    </section>
  );
}
