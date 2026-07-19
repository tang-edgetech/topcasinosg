"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import type { AdminUserDTO } from "@/lib/types";
import { canManage } from "@/lib/roles";
import EditUserForm from "../EditUserForm";

export default function EditUserPage() {
  const { user: actor } = useAuth();
  const params = useParams<{ id: string }>();
  const [target, setTarget] = useState<AdminUserDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<{ users: AdminUserDTO[] | null }>("/api/admin/users")
      .then((data) => {
        setTarget(data.users?.find((u) => String(u.id) === params.id) ?? null);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load user."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (!actor) return null;

  if (actor.role === "editor") {
    return (
      <section id="user-edit-page" className="user-edit-page">
        <p className="text-text-muted dark:text-text-muted-dark">You don&apos;t have access to this section.</p>
      </section>
    );
  }

  return (
    <section id="user-edit-page" className="user-edit-page flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/users" className="text-sm font-medium text-primary-600 hover:text-primary-900">
          ← Back to Users
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-text dark:text-text-dark">Edit User</h1>
      {loading ? (
        <p className="text-text-muted dark:text-text-muted-dark">Loading…</p>
      ) : error ? (
        <p className="form-error text-sm text-danger">{error}</p>
      ) : !target ? (
        <p className="text-text-muted dark:text-text-muted-dark">User not found.</p>
      ) : target.id === actor.id ? (
        <p className="text-text-muted dark:text-text-muted-dark">
          You can&apos;t edit your own account here — use{" "}
          <Link href="/dashboard/account" className="font-medium text-primary-600 hover:text-primary-900">
            My Account
          </Link>{" "}
          instead.
        </p>
      ) : !canManage(actor, target) ? (
        <p className="text-text-muted dark:text-text-muted-dark">Not Manageable</p>
      ) : (
        <EditUserForm target={target} />
      )}
    </section>
  );
}
