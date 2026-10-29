import type { SnippetConditionDTO, CodeType, ConditionOperator, PageDTO } from "@/lib/types";

// Shared by the Code snippets list (CodePanel) and its add/edit form
// (code/CodeSnippetForm).

export const CODE_TYPE_LABELS: Record<CodeType, string> = {
  html: "HTML",
  css: "CSS",
  js: "JavaScript",
  universal: "Universal (mixed HTML/CSS/JS)",
};

export const PAGE_OPERATOR_OPTIONS: { value: ConditionOperator; label: string }[] = [
  { value: "is", label: "is" },
  { value: "is_not", label: "is not" },
];

export const URL_OPERATOR_OPTIONS: { value: ConditionOperator; label: string }[] = [
  { value: "is", label: "is" },
  { value: "is_not", label: "is not" },
  { value: "contains", label: "contains" },
  { value: "not_contains", label: "does not contain" },
];

export type ConditionRow = Omit<SnippetConditionDTO, "id" | "sortOrder" | "groupIndex">;

export function blankCondition(): ConditionRow {
  return { field: "url", operator: "contains", pageId: null, value: "" };
}

// Conditions as AND groups, from the API's flat list (groupIndex). Groups
// are renumbered 0.. in order, so gaps from removed groups don't matter.
export function toGroups(conditions: SnippetConditionDTO[]): ConditionRow[][] {
  const byGroup = new Map<number, ConditionRow[]>();
  const sorted = [...conditions].sort((a, b) => a.groupIndex - b.groupIndex || a.sortOrder - b.sortOrder);
  for (const { groupIndex, field, operator, pageId, value } of sorted) {
    byGroup.set(groupIndex, [...(byGroup.get(groupIndex) ?? []), { field, operator, pageId, value }]);
  }
  return [...byGroup.values()];
}

// One-line summary for the table, e.g. "URL contains /sg AND URL does not
// contain /review OR Page is Homepage".
export function describeConditions(conditions: SnippetConditionDTO[], pages: PageDTO[]): string {
  return toGroups(conditions)
    .map((group) =>
      group
        .map((c) => {
          const op = (c.field === "page" ? PAGE_OPERATOR_OPTIONS : URL_OPERATOR_OPTIONS).find((o) => o.value === c.operator)?.label ?? c.operator;
          const target = c.field === "page" ? (pages.find((p) => p.id === c.pageId)?.title ?? "(deleted page)") : c.value;
          return `${c.field === "page" ? "Page" : "URL"} ${op} ${target}`;
        })
        .join(" AND "),
    )
    .join(" OR ");
}
