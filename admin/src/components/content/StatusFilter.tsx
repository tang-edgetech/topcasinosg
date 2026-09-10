"use client";

import { Select } from "antd";
import { titleCase } from "@/lib/format";
import type { ContentStatus } from "@/lib/types";

export type StatusFilterValue = ContentStatus | "all";

const OPTIONS: { value: StatusFilterValue; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "draft", label: titleCase("draft") },
  { value: "scheduled", label: titleCase("scheduled") },
  { value: "published", label: titleCase("published") },
];

// Shared status filter dropdown for every list page with a draft/scheduled/
// published workflow (Pages, Casinos, Bonuses, Payment Methods, RTP, Guides,
// Blacklist, News) — filtering itself is a one-line `.filter()` in each page
// since the whole dataset is already loaded client-side (see
// admin/src/lib/pagination.ts's FETCH_ALL_PAGE_SIZE); this just standardizes
// the control's look everywhere it's used.
export default function StatusFilter({
  id,
  value,
  onChange,
}: {
  id: string;
  value: StatusFilterValue;
  onChange: (value: StatusFilterValue) => void;
}) {
  return (
    <Select id={id} value={value} onChange={onChange} options={OPTIONS} className="w-44" />
  );
}
