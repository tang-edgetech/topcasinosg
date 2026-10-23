"use client";

import { useMemo, useState } from "react";
import type { TablePaginationConfig } from "antd";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "./pagination";

export interface ListFilterOption {
  value: string;
  label: string;
}

export interface ListFilterDef<T> {
  key: string;
  placeholder: string;
  options: ListFilterOption[];
  match: (item: T, value: string) => boolean;
  width?: string;
}

export interface ListViewState {
  search: string;
  values: Record<string, string | undefined>;
}

const PAGE_SIZE_STORAGE_PREFIX = "admin.pageSize.";

function readPageSize(storageKey: string): number {
  try {
    const stored = Number(window.localStorage.getItem(PAGE_SIZE_STORAGE_PREFIX + storageKey));
    return PAGE_SIZE_OPTIONS.includes(String(stored)) ? stored : DEFAULT_PAGE_SIZE;
  } catch {
    return DEFAULT_PAGE_SIZE;
  }
}

function writePageSize(storageKey: string, size: number) {
  try {
    window.localStorage.setItem(PAGE_SIZE_STORAGE_PREFIX + storageKey, String(size));
  } catch {}
}

const normalize = (text: string) => text.toLowerCase().normalize("NFKD");

// Client-side search + dropdown filters + controlled pagination for an admin
// list whose whole dataset is already loaded (see FETCH_ALL_PAGE_SIZE).
// Changing a filter jumps back to page 1; the chosen page size is remembered
// per list in localStorage.
export function useListView<T>({
  storageKey,
  items,
  searchText,
  filters = [],
}: {
  storageKey: string;
  items: T[];
  searchText: (item: T) => string;
  filters?: ListFilterDef<T>[];
}) {
  const [state, setState] = useState<ListViewState>({ search: "", values: {} });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => (typeof window === "undefined" ? DEFAULT_PAGE_SIZE : readPageSize(storageKey)));

  const filtered = useMemo(() => {
    const query = normalize(state.search.trim());
    return items.filter((item) => {
      if (query && !normalize(searchText(item)).includes(query)) return false;
      return filters.every((f) => {
        const value = state.values[f.key];
        return value === undefined || value === "" || f.match(item, value);
      });
    });
    // filters/searchText are recreated each render by callers; items + state drive the result.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, state]);

  const activeCount = (state.search.trim() ? 1 : 0) + Object.values(state.values).filter((v) => v !== undefined && v !== "").length;
  const lastPage = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, lastPage);

  const pagination: TablePaginationConfig = {
    current: currentPage,
    pageSize,
    total: filtered.length,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    showSizeChanger: true,
    showTotal: (total, [from, to]) => (total === 0 ? "No results" : `${from}–${to} of ${total}`),
    onChange: (nextPage, nextSize) => {
      if (nextSize !== pageSize) {
        setPageSize(nextSize);
        writePageSize(storageKey, nextSize);
        setPage(1);
      } else {
        setPage(nextPage);
      }
    },
  };

  return {
    filtered,
    pagination,
    pageRows: filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    toolbar: {
      search: state.search,
      values: state.values,
      filters,
      shown: filtered.length,
      total: items.length,
      activeCount,
      onSearch: (search: string) => {
        setState((s) => ({ ...s, search }));
        setPage(1);
      },
      onFilter: (key: string, value: string | undefined) => {
        setState((s) => ({ ...s, values: { ...s.values, [key]: value } }));
        setPage(1);
      },
      onClear: () => {
        setState({ search: "", values: {} });
        setPage(1);
      },
    },
  };
}
