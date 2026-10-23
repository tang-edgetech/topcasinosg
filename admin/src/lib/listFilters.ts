import { titleCase } from "./format";
import type { ContentStatus, RegionDTO } from "./types";
import type { ListFilterDef } from "./useListView";

const STATUSES: ContentStatus[] = ["draft", "scheduled", "published"];

// Ready-made filters shared by several list pages (see useListView).
export function statusFilter<T extends { status: ContentStatus }>(): ListFilterDef<T> {
  return {
    key: "status",
    placeholder: "All statuses",
    options: STATUSES.map((s) => ({ value: s, label: titleCase(s) })),
    match: (item, value) => item.status === value,
  };
}

export const GLOBAL_REGION = "global";

// regionIdsOf returns the item's region ids ([] = global / no region).
// withGlobal adds a "Global (no region)" option for content types where a
// missing region means "every region" (Guides, Blacklist).
export function regionFilter<T>(regions: RegionDTO[], regionIdsOf: (item: T) => number[], withGlobal = false): ListFilterDef<T> {
  return {
    key: "region",
    placeholder: "All regions",
    options: [
      ...(withGlobal ? [{ value: GLOBAL_REGION, label: "Global (no region)" }] : []),
      ...regions.map((r) => ({ value: String(r.id), label: r.name })),
    ],
    match: (item, value) => {
      const ids = regionIdsOf(item);
      return value === GLOBAL_REGION ? ids.length === 0 : ids.includes(Number(value));
    },
  };
}

export function optionFilter<T>(key: string, placeholder: string, options: { value: string; label: string }[], valueOf: (item: T) => string | null | undefined): ListFilterDef<T> {
  return { key, placeholder, options, match: (item, value) => (valueOf(item) ?? "") === value };
}

// ["no_deposit", ...] -> [{ value: "no_deposit", label: "No Deposit" }, ...]
export function titledOptions(values: readonly string[]): { value: string; label: string }[] {
  return values.map((value) => ({ value, label: titleCase(value) }));
}

export function presenceFilter<T>(key: string, placeholder: string, labels: [string, string], has: (item: T) => boolean): ListFilterDef<T> {
  return {
    key,
    placeholder,
    options: [
      { value: "yes", label: labels[0] },
      { value: "no", label: labels[1] },
    ],
    match: (item, value) => has(item) === (value === "yes"),
  };
}
