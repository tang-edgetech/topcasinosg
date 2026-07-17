"use client";

import { useSiteSettings } from "@/lib/site-settings-context";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";

export default function BrandMark({ size = 32 }: { size?: number }) {
  const { settings } = useSiteSettings();
  const title = settings?.siteTitle || "Top Casino SG";
  const initial = title.charAt(0).toUpperCase();

  if (settings?.logoUrl) {
    const src = settings.logoUrl.startsWith("http") ? settings.logoUrl : `${API_URL}${settings.logoUrl}`;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={title}
        style={{ width: size, height: size }}
        className="brand-mark rounded-md object-cover"
      />
    );
  }

  return (
    <span
      id="brand-mark-fallback"
      className="brand-mark flex items-center justify-center rounded-md bg-secondary-600 font-bold text-primary-900"
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      {initial}
    </span>
  );
}
