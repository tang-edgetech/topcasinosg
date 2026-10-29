"use client";

import { useEffect, useState } from "react";
import { App as AntApp } from "antd";
import { api, ApiError } from "@/lib/api";
import type { PageDTO } from "@/lib/types";

// The pages a code snippet's "Page" conditions can pick from.
export function usePages() {
  const { message } = AntApp.useApp();
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

  return pages;
}
