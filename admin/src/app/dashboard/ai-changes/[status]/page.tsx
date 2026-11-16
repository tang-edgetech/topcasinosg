import { notFound } from "next/navigation";
import AIChangesView from "../AIChangesView";
import { isAIChangeTab } from "../tabs";

// /dashboard/ai-changes/{pending|approved|rejected|withdrawn|all}: one route
// per AI Changes tab. key resets paging and the open change between tabs.
export default async function AIChangesTabPage({ params }: { params: Promise<{ status: string }> }) {
  const { status } = await params;
  if (!isAIChangeTab(status)) notFound();
  return <AIChangesView key={status} tab={status} />;
}
