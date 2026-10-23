export interface PaymentBadge {
  name: string;
  icon: string | null;
}

// A casino's accepted payment methods: the Payment Method record's icon
// when one is uploaded (matched by name), otherwise a small text chip.
export default function PaymentMethodBadges({ badges, max }: { badges: PaymentBadge[]; max?: number }) {
  const shown = max ? badges.slice(0, max) : badges;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {shown.map((badge) =>
        badge.icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            loading="lazy"
            decoding="async"
            key={badge.name}
            src={badge.icon}
            alt={badge.name}
            title={badge.name}
            className="h-8 w-8 rounded object-contain"
          />
        ) : (
          <span key={badge.name} className="rounded border border-primary-100 bg-surface-muted px-2 py-1 text-xs text-primary-600">
            {badge.name}
          </span>
        )
      )}
      {max && badges.length > max && <span className="text-xs text-primary-500">+{badges.length - max}</span>}
    </div>
  );
}
