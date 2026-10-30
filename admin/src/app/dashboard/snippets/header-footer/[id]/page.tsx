"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import HeaderFooterForm from "../HeaderFooterForm";
import { useSnippet } from "../../useSnippets";

// Snippets → Header & Footer → Edit (/dashboard/snippets/header-footer/{id}).
export default function EditHeaderFooterSnippetPage() {
  const params = useParams<{ id: string }>();
  const snippet = useSnippet(params.id);
  const target = snippet && snippet.kind === "global" ? snippet : null;

  return (
    <div id="header-footer-edit-page" className="header-footer-edit-page flex flex-col gap-4">
      <Link href="/dashboard/snippets" className="w-fit text-sm font-medium text-primary-600 hover:text-primary-900 dark:text-text-muted-dark">
        ← Back to Header &amp; Footer
      </Link>
      <h2 className="text-lg font-bold text-text dark:text-text-dark">Edit Snippet{target ? `: ${target.name}` : ""}</h2>
      {snippet === null ? (
        <p className="text-text-muted dark:text-text-muted-dark">Loading…</p>
      ) : target ? (
        <HeaderFooterForm key={target.id} target={target} />
      ) : (
        <p className="text-text-muted dark:text-text-muted-dark">This snippet doesn&apos;t exist or was deleted.</p>
      )}
    </div>
  );
}
