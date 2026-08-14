"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { App as AntApp } from "antd";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import type { LicenseDTO } from "@/lib/types";
import LicenseForm from "../LicenseForm";

export default function EditLicensePage() {
  const { user } = useAuth();
  const { message } = AntApp.useApp();
  const params = useParams<{ id: string }>();
  const [license, setLicense] = useState<LicenseDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ licenses: LicenseDTO[] | null }>("/api/admin/licenses")
      .then((data) => {
        setLicense(data.licenses?.find((l) => String(l.id) === params.id) ?? null);
      })
      .catch((err) => message.error(err instanceof ApiError ? err.message : "Could not load license."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (!user) return null;

  if (user.role === "editor") {
    return (
      <section id="license-edit-page" className="license-edit-page">
        <p className="text-text-muted dark:text-text-muted-dark">You don&apos;t have access to this section.</p>
      </section>
    );
  }

  return (
    <section id="license-edit-page" className="license-edit-page flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/licenses" className="text-sm font-medium text-primary-600 hover:text-primary-900">
          ← Back to Licenses
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-text dark:text-text-dark">Edit License</h1>
      {loading ? (
        <p className="text-text-muted dark:text-text-muted-dark">Loading…</p>
      ) : license ? (
        <LicenseForm target={license} />
      ) : (
        <p className="text-text-muted dark:text-text-muted-dark">License not found.</p>
      )}
    </section>
  );
}
