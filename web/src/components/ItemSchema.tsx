import JsonLd from "./JsonLd";
import { getSeoMeta, type SeoEntityType } from "@/lib/seo";

// The SEO tab's Schema box for this page, casino, guide, news article or
// bonus: its own schema.org JSON-LD, printed as written (the API checked it
// is valid). Added next to any schema the site makes by itself. The SEO
// request is the same one the page's <head> already made, so it costs
// nothing extra.
export default async function ItemSchema({ type, id }: { type: SeoEntityType; id: number | undefined }) {
  const seo = await getSeoMeta(type, id);
  if (!seo?.schemaJson) return null;
  let data: Record<string, unknown> | Record<string, unknown>[];
  try {
    data = JSON.parse(seo.schemaJson);
  } catch {
    return null;
  }
  return <JsonLd data={data} />;
}
