// The AI Changes tabs. Each is its own route, /dashboard/ai-changes/<slug>
// ([status]/page.tsx), so it can be linked to and bookmarked. "all" asks the
// API for every status.
export const AI_CHANGE_TABS = [
  { slug: "pending", label: "Waiting for Review" },
  { slug: "approved", label: "Approved" },
  { slug: "rejected", label: "Rejected" },
  { slug: "withdrawn", label: "Withdrawn" },
  { slug: "all", label: "All" },
] as const;

export type AIChangeTab = (typeof AI_CHANGE_TABS)[number]["slug"];

export function isAIChangeTab(value: string | undefined): value is AIChangeTab {
  return AI_CHANGE_TABS.some((tab) => tab.slug === value);
}
