"use client";

import Link from "next/link";
import ComponentForm from "../ComponentForm";

// Components → Add (/dashboard/components/new).
export default function NewComponentPage() {
  return (
    <div id="component-new-page" className="flex flex-col gap-4">
      <Link href="/dashboard/components" className="w-fit text-sm font-medium text-primary-600 hover:text-primary-900 dark:text-text-muted-dark">
        ← Back to Components
      </Link>
      <h2 className="text-lg font-bold text-text dark:text-text-dark">Add Component</h2>
      <ComponentForm target={null} />
    </div>
  );
}
