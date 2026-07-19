import Link from "next/link";
import { getGuides } from "../_lib/api";

export default async function RegionGuidesPage({
  params,
}: {
  params: Promise<{ region: string }>;
}) {
  const { region } = await params;
  const guides = await getGuides(region);

  if (guides.length === 0) {
    return (
      <div id="region-guides-page" className="region-guides">
        <h2 className="mb-4 text-xl font-semibold text-primary-900">Guides</h2>
        <p className="region-guides__empty text-sm text-primary-500">
          No guides available for this region yet.
        </p>
      </div>
    );
  }

  return (
    <div id="region-guides-page" className="region-guides flex flex-col gap-6">
      <h2 className="text-xl font-semibold text-primary-900">Guides</h2>

      <div className="region-guides__grid grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {guides.map((guide) => (
          <Link
            key={guide.id}
            href={`/guides/${guide.slug}`}
            className="region-guide-card flex cursor-pointer flex-col gap-2 rounded-lg border border-primary-100 bg-surface-muted p-6 transition-colors hover:border-secondary-600"
          >
            <h3 className="region-guide-card__title text-base font-semibold text-primary-900">
              {guide.title}
            </h3>
            <p className="region-guide-card__excerpt text-sm text-primary-600">{guide.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
