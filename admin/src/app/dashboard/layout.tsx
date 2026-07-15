"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import Sidebar from "@/components/Sidebar";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div id="dashboard-loading" className="flex flex-1 items-center justify-center">
        <p className="text-primary-500">Loading…</p>
      </div>
    );
  }

  return (
    <div id="dashboard-shell" className="flex min-h-screen flex-1">
      <Sidebar />
      <main id="dashboard-main" className="dashboard-main flex-1 px-8 py-8">
        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardShell>{children}</DashboardShell>
    </AuthProvider>
  );
}