"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";

type SiteSettingsBrand = {
  siteTitle: string;
  logoUrl: string | null;
};

/**
 * Small brand mark for the public site header. Fetches the public,
 * unauthenticated `/api/admin/settings/site` endpoint once on mount and
 * renders the uploaded logo, falling back to a bold text wordmark.
 *
 * Deliberately not a context provider (unlike admin's site-settings-context) —
 * this is the only place on the public site that needs this data.
 */
export default function HeaderLogo() {
  const [brand, setBrand] = useState<SiteSettingsBrand | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_URL}/api/admin/settings/site`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("failed to load site settings"))))
      .then((body: { data?: { siteTitle?: string; logoUrl?: string | null } }) => {
        if (cancelled) return;
        setBrand({
          siteTitle: body.data?.siteTitle || "Top Casino SG",
          logoUrl: body.data?.logoUrl ?? null,
        });
      })
      .catch(() => {
        if (!cancelled) setBrand(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const title = brand?.siteTitle || "Top Casino SG";

  if (brand?.logoUrl) {
    const src = brand.logoUrl.startsWith("http") ? brand.logoUrl : `${API_URL}${brand.logoUrl}`;
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote/uploaded logo, dimensions unknown ahead of time
      <img
        id="site-header-logo-img"
        src={src}
        alt={title}
        className="site-header__logo h-8 w-auto object-contain"
      />
    );
  }

  return (
    <span id="site-header-logo-text" className="site-header__logo-text text-lg font-bold text-white">
      Top Casino SG
    </span>
  );
}
