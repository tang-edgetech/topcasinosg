"use client";

import { Button, Input, Select } from "antd";
import type { ListFilterDef } from "@/lib/useListView";

// Search box + dropdown filters + "Clear filters" + result count above an
// admin list. Pair with useListView, which owns the state.
export default function ListToolbar<T>({
  id,
  searchPlaceholder,
  search,
  values,
  filters,
  shown,
  total,
  activeCount,
  onSearch,
  onFilter,
  onClear,
}: {
  id: string;
  searchPlaceholder: string;
  search: string;
  values: Record<string, string | undefined>;
  filters: ListFilterDef<T>[];
  shown: number;
  total: number;
  activeCount: number;
  onSearch: (value: string) => void;
  onFilter: (key: string, value: string | undefined) => void;
  onClear: () => void;
}) {
  return (
    <div id={id} className="list-toolbar flex flex-wrap items-center gap-3">
      <Input.Search
        id={`${id}-search`}
        allowClear
        value={search}
        placeholder={searchPlaceholder}
        onChange={(e) => onSearch(e.target.value)}
        className="w-full sm:w-64"
      />
      {filters.map((f) => (
        <Select
          key={f.key}
          id={`${id}-${f.key}`}
          allowClear
          showSearch={f.options.length > 8}
          optionFilterProp="label"
          value={values[f.key]}
          placeholder={f.placeholder}
          options={f.options}
          onChange={(v) => onFilter(f.key, v)}
          className={f.width ?? "w-40"}
        />
      ))}
      {activeCount > 0 && (
        <Button id={`${id}-clear`} type="link" onClick={onClear} className="px-1">
          Clear filters
        </Button>
      )}
      <span className="ml-auto text-sm text-text-muted dark:text-text-muted-dark">
        {activeCount > 0 ? `Showing ${shown} of ${total}` : `${total} total`}
      </span>
    </div>
  );
}
