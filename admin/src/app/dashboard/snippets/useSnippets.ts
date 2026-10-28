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
