"use client";

import { useEffect, useState } from "react";
import { App as AntApp } from "antd";
import { api, ApiError } from "@/lib/api";
import type { PageDTO } from "@/lib/types";
import CodePanel from "../CodePanel";
import { useSnippets } from "../useSnippets";

// Snippets → Code (/dashboard/snippets/code): typed snippets that can target
// pages or URLs, so this tab also loads the pages to pick from.
export default function CodeSnippetsPage() {
  const { message } = AntApp.useApp();
  const { snippets, reload } = useSnippets("code");
  const [pages, setPages] = useState<PageDTO[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.get<{ pages: PageDTO[] | null }>("/api/admin/pages").then(
      (data) => !cancelled && setPages(data.pages ?? []),
      (err) => !cancelled && message.error(err instanceof ApiError ? err.message : "Could not load pages."),
    );
    return () => {
      cancelled = true;
    };
  }, [message]);

  if (!snippets || !pages) return <p className="text-text-muted dark:text-text-muted-dark">Loading…</p>;
  return <CodePanel snippets={snippets} pages={pages} onReload={reload} />;
}
