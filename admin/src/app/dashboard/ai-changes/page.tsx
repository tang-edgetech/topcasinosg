import { redirect } from "next/navigation";

// The sidebar links here; each tab has its own route (see [status]/page.tsx).
export default function AIChangesPage() {
  redirect("/dashboard/ai-changes/pending");
}
