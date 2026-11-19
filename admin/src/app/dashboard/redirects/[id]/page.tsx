"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { App as AntApp } from "antd";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import type { RedirectDTO } from "@/lib/types";
import RedirectForm from "../RedirectForm";

export default function EditRedirectPage() {
  const { user } = useAuth();
  const { message } = AntApp.useApp();
  const params = useParams<{ id: string }>();
  const [redirect, setRedirect] = useState<RedirectDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ redirect: RedirectDTO }>(`/api/admin/redirects/${params.id}`)
      .then((data) => setRedirect(data.redirect))
      .catch((err) => {
        if (!(err instanceof ApiError && err.status === 404)) {
          message.error(err instanceof ApiError ? err.message : "Could not load the redirect.");
        }
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (!user) return null;

  if (user.role === "editor") {
    return (
      <section id="redirect-edit-page" className="redirect-edit-page">
        <p className="text-text-muted dark:text-text-muted-dark">You don&apos;t have access to this section.</p>
      </section>
    );
  }

  return (
    <section id="redirect-edit-page" className="redirect-edit-page flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/redirects" className="text-sm font-medium text-primary-600 hover:text-primary-900">
          ← Back to Redirects
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-text dark:text-text-dark">Edit Redirect</h1>
      {loading ? (
        <p className="text-text-muted dark:text-text-muted-dark">Loading…</p>
      ) : redirect ? (
        <RedirectForm target={redirect} />
      ) : (
        <p className="text-text-muted dark:text-text-muted-dark">Redirect not found.</p>
      )}
    </section>
  );
}
