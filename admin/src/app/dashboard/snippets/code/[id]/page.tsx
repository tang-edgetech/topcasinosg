"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import CodeSnippetForm from "../CodeSnippetForm";
import { useSnippet } from "../../useSnippets";
import { usePages } from "../usePages";

// Snippets → Code → Edit (/dashboard/snippets/code/{id}).
export default function EditCodeSnippetPage() {
  const params = useParams<{ id: string }>();
  const snippet = useSnippet(params.id);
  const pages = usePages();
  const target = snippet && snippet.kind === "code" ? snippet : null;

  return (
    <div id="code-snippet-edit-page" className="code-snippet-edit-page flex flex-col gap-4">
      <Link href="/dashboard/snippets/code" className="w-fit text-sm font-medium text-primary-600 hover:text-primary-900 dark:text-text-muted-dark">
        ← Back to Code Snippets
      </Link>
      <h2 className="text-lg font-bold text-text dark:text-text-dark">Edit Code Snippet{target ? `: ${target.name}` : ""}</h2>
      {snippet === null || !pages ? (
        <p className="text-text-muted dark:text-text-muted-dark">Loading…</p>
      ) : target ? (
        <CodeSnippetForm key={target.id} target={target} pages={pages} />
      ) : (
        <p className="text-text-muted dark:text-text-muted-dark">This code snippet doesn&apos;t exist or was deleted.</p>
      )}
    </div>
  );
}
