"use client";

import Link from "next/link";
import HeaderFooterForm from "../HeaderFooterForm";

// Snippets → Header & Footer → Add (/dashboard/snippets/header-footer/new).
export default function NewHeaderFooterSnippetPage() {
  return (
    <div id="header-footer-new-page" className="header-footer-new-page flex flex-col gap-4">
      <Link href="/dashboard/snippets" className="w-fit text-sm font-medium text-primary-600 hover:text-primary-900 dark:text-text-muted-dark">
        ← Back to Header &amp; Footer
      </Link>
      <h2 className="text-lg font-bold text-text dark:text-text-dark">Add Snippet</h2>
      <HeaderFooterForm target={null} />
    </div>
  );
}
