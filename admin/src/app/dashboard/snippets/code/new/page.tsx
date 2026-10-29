"use client";

import Link from "next/link";
import CodeSnippetForm from "../CodeSnippetForm";
import { usePages } from "../usePages";

// Snippets → Code → Add (/dashboard/snippets/code/new).
export default function NewCodeSnippetPage() {
  const pages = usePages();

  return (
    <div id="code-snippet-new-page" className="code-snippet-new-page flex flex-col gap-4">
      <Link href="/dashboard/snippets/code" className="w-fit text-sm font-medium text-primary-600 hover:text-primary-900 dark:text-text-muted-dark">
        ← Back to Code Snippets
      </Link>
      <h2 className="text-lg font-bold text-text dark:text-text-dark">Add Code Snippet</h2>
      {pages ? <CodeSnippetForm target={null} pages={pages} /> : <p className="text-text-muted dark:text-text-muted-dark">Loading…</p>}
    </div>
  );
}
