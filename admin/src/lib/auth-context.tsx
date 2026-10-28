"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, hasSessionCookie, PASSWORD_CHANGE_REQUIRED_EVENT, SESSION_ENDED_EVENT } from "./api";
import { useThemeContext, type Theme } from "./theme-context";
import { useIdleSession } from "./idle-session";
import type { AdminUserDTO } from "./types";

interface AuthContextValue {
  user: AdminUserDTO | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  setTheme: (theme: Theme) => Promise<void>;
  setFullName: (fullName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { setLocalTheme } = useThemeContext();
  const [user, setUser] = useState<AdminUserDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!hasSessionCookie()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await api.get<{ user: AdminUserDTO }>("/api/admin/auth/me");
      setUser(data.user);
      setLocalTheme(data.user.themePreference);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [setLocalTheme]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // The dashboard layout sends a signed-out user back to the sign-in page.
  useEffect(() => {
    const onSessionEnded = () => setUser(null);
    window.addEventListener(SESSION_ENDED_EVENT, onSessionEnded);
    return () => window.removeEventListener(SESSION_ENDED_EVENT, onSessionEnded);
  }, []);

  // Re-read the user when the API says they must change their password, so
  // the dashboard switches to the change-password screen.
  useEffect(() => {
    const onPasswordChangeRequired = () => {
      refresh();
    };
    window.addEventListener(PASSWORD_CHANGE_REQUIRED_EVENT, onPasswordChangeRequired);
    return () => window.removeEventListener(PASSWORD_CHANGE_REQUIRED_EVENT, onPasswordChangeRequired);
  }, [refresh]);

  const logout = useCallback(async () => {
    await api.post("/api/admin/auth/logout");
    setUser(null);
  }, []);

  const handleIdleTimeout = useCallback(async () => {
    // Best-effort: revoke the refresh token server-side too, not just the
    // local state, so the session can't be resumed from a stale cookie.
    await logout().catch(() => {});
    router.replace("/");
  }, [logout, router]);

  useIdleSession(!!user, handleIdleTimeout);

  const setTheme = useCallback(
    async (theme: Theme) => {
      setLocalTheme(theme);
      setUser((prev) => (prev ? { ...prev, themePreference: theme } : prev));
      await api.put("/api/admin/account/theme", { theme });
    },
    [setLocalTheme],
  );

  const setFullName = useCallback(async (fullName: string) => {
    await api.put("/api/admin/account/profile", { fullName });
    setUser((prev) => (prev ? { ...prev, fullName } : prev));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logout, setTheme, setFullName }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
