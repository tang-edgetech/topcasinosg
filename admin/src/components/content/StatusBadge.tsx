import { titleCase } from "@/lib/format";
import type { ContentStatus } from "@/lib/types";

const STYLES: Record<ContentStatus, string> = {
  draft: "bg-surface-muted text-text-muted dark:bg-surface-muted-dark dark:text-text-muted-dark",
  scheduled: "bg-secondary-100 text-secondary-900",
  published: "bg-success-subtle text-success",
};

export default function StatusBadge({ status }: { status: ContentStatus }) {
  return (
    <span className={`status-badge rounded-full px-2 py-0.5 text-xs font-medium ${STYLES[status]}`}>
      {titleCase(status)}
    </span>
  );
}
