import { mediaUrl } from "./lib";

interface LogoGridItem {
  id: number;
  name: string;
  logoUrl: string | null;
}

// Shared by the Game Providers and Licences sections on /casinos/[slug] —
// both are managed logo lists with the exact same card shape.
export default function LogoGrid({
  id,
  heading,
  items,
}: {
  id: string;
  heading: string;
  items: LogoGridItem[];
}) {
  if (items.length === 0) return null;

  return (
    <section id={id} className="flex flex-col gap-3">
      <h2 className="text-xl font-bold text-primary-900">{heading}</h2>
      <div className="flex flex-wrap items-center gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex h-12 w-24 items-center justify-center rounded-md border border-primary-100 bg-surface-muted p-2"
            title={item.name}
          >
            {item.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaUrl(item.logoUrl)} alt={item.name} className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="text-xs font-medium text-primary-500">{item.name}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
