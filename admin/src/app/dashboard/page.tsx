"use client";

import { useAuth } from "@/lib/auth-context";

export default function DashboardOverviewPage() {
  const { user } = useAuth();

  return (
    <section id="dashboard-overview" className="dashboard-overview flex flex-col gap-2">
      <h1 className="text-2xl font-bold text-primary-900">Welcome{user ? `, ${user.fullName}` : ""}</h1>
      <p className="text-primary-500">Pick a section from the sidebar to get started.</p>
    </section>
  );
}