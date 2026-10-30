"use client";

import { useCallback, useEffect, useState } from "react";
import { App as AntApp } from "antd";
import { api, ApiError } from "@/lib/api";
import type { SnippetDTO } from "@/lib/types";

// Loads one kind of snippet for a Snippets tab; reload after a change.
export function useSnippets(kind: SnippetDTO["kind"]) {
  const { message } = AntApp.useApp();
  const [snippets, setSnippets] = useState<SnippetDTO[] | null>(null);

  const reload = useCallback(
    () =>
      api.get<{ snippets: SnippetDTO[] | null }>("/api/admin/snippets").then(
        (data) => setSnippets((data.snippets ?? []).filter((s) => s.kind === kind)),
        (err) => message.error(err instanceof ApiError ? err.message : "Could not load snippets."),
      ),
    [kind, message],
  );

  useEffect(() => {
    let cancelled = false;
    api.get<{ snippets: SnippetDTO[] | null }>("/api/admin/snippets").then(
      (data) => !cancelled && setSnippets((data.snippets ?? []).filter((s) => s.kind === kind)),
      (err) => !cancelled && message.error(err instanceof ApiError ? err.message : "Could not load snippets."),
    );
    return () => {
      cancelled = true;
    };
  }, [kind, message]);

  return { snippets, reload };
}

// Loads one snippet for its edit route. null = loading, false = not found
// (deleted, or a bad id in the URL).
export function useSnippet(id: string) {
  const { message } = AntApp.useApp();
  const [snippet, setSnippet] = useState<SnippetDTO | false | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.get<{ snippet: SnippetDTO }>(`/api/admin/snippets/${encodeURIComponent(id)}`).then(
      (data) => !cancelled && setSnippet(data.snippet),
      (err) => {
        if (cancelled) return;
        setSnippet(false);
        if (!(err instanceof ApiError && (err.status === 404 || err.status === 400))) {
          message.error(err instanceof ApiError ? err.message : "Could not load snippet.");
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [id, message]);

  return snippet;
}
