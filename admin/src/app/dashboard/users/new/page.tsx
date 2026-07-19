"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import AddUserForm from "../AddUserForm";

export default function NewUserPage() {
  const { user: actor } = useAuth();
  if (!actor) return null;

  if (actor.role === "editor") {
    return (
      <section id="user-new-page" className="user-new-page">
        <p className="text-text-muted dark:text-text-muted-dark">You don&apos;t have access to this section.</p>
      </section>
    );
  }

  return (
    <section id="user-new-page" className="user-new-page flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/users" className="text-sm font-medium text-primary-600 hover:text-primary-900">
          ← Back to Users
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-text dark:text-text-dark">Add User</h1>
      <AddUserForm actor={actor} />
    </section>
  );
}
