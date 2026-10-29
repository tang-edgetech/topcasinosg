"use client";

import CodePanel from "../CodePanel";
import { useSnippets } from "../useSnippets";
import { usePages } from "./usePages";

// Snippets → Code (/dashboard/snippets/code): typed snippets that can target
// pages or URLs, so this tab also loads the pages to pick from.
export default function CodeSnippetsPage() {
  const { snippets, reload } = useSnippets("code");
  const pages = usePages();

  if (!snippets || !pages) return <p className="text-text-muted dark:text-text-muted-dark">Loading…</p>;
  return <CodePanel snippets={snippets} pages={pages} onReload={reload} />;
}
