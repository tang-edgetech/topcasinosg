"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { ConfirmProvider } from "@/components/ConfirmDialog";
import { useIsDesktop } from "@/lib/use-is-desktop";
import Sidebar from "@/components/Sidebar";
import { IconMenu } from "@/components/Icons";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const isDesktop = useIsDesktop(1200);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (isDesktop) setSidebarOpen(false);
  }, [isDesktop]);

  if (loading || !user) {
    return (
      <div id="dashboard-loading" className="flex flex-1 items-center justify-center">
        <p className="text-text-muted dark:text-text-muted-dark">Loading…</p>
      </div>
    );
  }

  const showSidebar = isDesktop || sidebarOpen;

  return (
    <div id="dashboard-shell" className="flex min-h-screen flex-1">
      {showSidebar && (
        <>
          {!isDesktop && (
            <div
              id="sidebar-backdrop"
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-primary-900/40"
            />
          )}
          <div className={isDesktop ? "" : "fixed inset-y-0 left-0 z-50"}>
            <Sidebar onNavigate={() => !isDesktop && setSidebarOpen(false)} onClose={!isDesktop ? () => setSidebarOpen(false) : undefined} />
          </div>
        </>
      )}

      <div className="flex flex-1 flex-col">
        {!isDesktop && (
          <div className="dashboard-topbar flex items-center border-b border-border bg-surface px-4 py-3 dark:border-border-dark dark:bg-surface-dark">
            <button
              type="button"
              id="sidebar-hamburger"
              title="Open Menu"
              onClick={() => setSidebarOpen(true)}
              className="cursor-pointer rounded-md p-2 text-text hover:bg-surface-muted dark:text-text-dark dark:hover:bg-surface-muted-dark"
            >
              <IconMenu width={20} height={20} />
            </button>
          </div>
        )}
        <main id="dashboard-main" className="dashboard-main flex-1 bg-surface px-8 py-8 dark:bg-surface-dark">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ConfirmProvider>
        <DashboardShell>{children}</DashboardShell>
      </ConfirmProvider>
    </AuthProvider>
  );
}
