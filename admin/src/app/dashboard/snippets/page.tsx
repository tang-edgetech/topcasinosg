"use client";

import HeaderFooterPanel from "./HeaderFooterPanel";
import { useSnippets } from "./useSnippets";

// Snippets → Header & Footer (/dashboard/snippets). The Code tab is
// /dashboard/snippets/code.
export default function HeaderFooterSnippetsPage() {
  const { snippets, reload } = useSnippets("global");
  if (!snippets) return <p className="text-text-muted dark:text-text-muted-dark">Loading…</p>;
  return <HeaderFooterPanel snippets={snippets} onReload={reload} />;
}
