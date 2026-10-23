"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Alert } from "antd";
import { api } from "@/lib/api";
import type { PageDTO, RegionDTO } from "@/lib/types";
import { REGION_PLACEHOLDERS, isRegionTemplatePath, templatePathFor } from "@/lib/regionTemplate";

function PlaceholderList() {
  return (
    <ul className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 text-xs sm:grid-cols-2">
      {REGION_PLACEHOLDERS.map((p) => (
        <li key={p.token}>
          <code className="rounded bg-surface-muted px-1 py-0.5 font-semibold dark:bg-surface-muted-dark">{p.token}</code> {p.meaning} (e.g.{" "}
          {p.example})
        </li>
      ))}
    </ul>
  );
}

export default function RegionTemplateNotice({ page, sectionCount }: { page: PageDTO; sectionCount: number }) {
  const [regions, setRegions] = useState<RegionDTO[]>([]);
  const [template, setTemplate] = useState<PageDTO | null>(null);
  const isTemplate = isRegionTemplatePath(page.path);

  useEffect(() => {
    if (isTemplate) return;
    let cancelled = false;
    (async () => {
      const regionData = await api.get<{ regions: RegionDTO[] | null }>("/api/admin/regions");
      const list = regionData.regions ?? [];
      const templatePath = templatePathFor(
        page.path,
        list.map((r) => r.code)
      );
      if (!templatePath) return;
      const pageData = await api.get<{ pages: PageDTO[] | null }>("/api/admin/pages");
      if (cancelled) return;
      setRegions(list);
      setTemplate((pageData.pages ?? []).find((p) => p.path === templatePath) ?? null);
    })().catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isTemplate, page.path]);

  if (isTemplate) {
    return (
      <Alert
        type="info"
        showIcon
        title="Shared region page"
        description={
          <div className="text-sm">
            Every region shows this page unless it has its own version. Write the copy once with these placeholders and each region fills
            in its own values (set them under Regions). Leave a live block&apos;s region empty so it follows the page&apos;s region.
            <PlaceholderList />
          </div>
        }
      />
    );
  }

  if (!template) return null;
  const regionName = regions.find((r) => r.code === page.path.split("/")[0])?.name ?? page.path.split("/")[0];
  const templateLink = (
    <Link href={`/dashboard/pages/${template.id}`} className="font-semibold text-primary-600 hover:text-primary-900">
      shared {template.title} page
    </Link>
  );

  return sectionCount === 0 ? (
    <Alert
      type="info"
      showIcon
      title={`${regionName} shows the shared page`}
      description={
        <div className="text-sm">
          This page has no sections, so visitors see the {templateLink} with {regionName}&apos;s details filled in. Edit that page to change every
          region at once, or add sections here to give {regionName} its own version.
        </div>
      }
    />
  ) : (
    <Alert
      type="warning"
      showIcon
      title={`${regionName} has its own version`}
      description={
        <div className="text-sm">
          These sections replace the {templateLink} for {regionName} only, so changes to the shared page won&apos;t show here. Remove every
          section to go back to the shared page. Placeholders such as {"{region}"} work here too.
        </div>
      }
    />
  );
}
