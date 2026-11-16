"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import type { ComponentDTO } from "@/lib/types";
import ComponentForm from "../ComponentForm";

// Components → Edit (/dashboard/components/{id}).
export default function EditComponentPage() {
  const params = useParams<{ id: string }>();
  // undefined while loading, null when it doesn't exist.
  const [component, setComponent] = useState<ComponentDTO | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    api.get<{ component: ComponentDTO }>(`/api/admin/components/${params.id}`).then(
      (data) => !cancelled && setComponent(data.component),
      () => !cancelled && setComponent(null),
    );
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  return (
    <div id="component-edit-page" className="flex flex-col gap-4">
      <Link href="/dashboard/components" className="w-fit text-sm font-medium text-primary-600 hover:text-primary-900 dark:text-text-muted-dark">
        ← Back to Components
      </Link>
      <h2 className="text-lg font-bold text-text dark:text-text-dark">Edit Component{component ? `: ${component.name}` : ""}</h2>
      {component === undefined ? (
        <p className="text-text-muted dark:text-text-muted-dark">Loading…</p>
      ) : component ? (
        <ComponentForm key={component.id} target={component} />
      ) : (
        <p className="text-text-muted dark:text-text-muted-dark">This component doesn&apos;t exist or was deleted.</p>
      )}
    </div>
  );
}
