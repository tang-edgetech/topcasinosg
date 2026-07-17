"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "./api";
import { applyTheme, type Theme } from "./theme";
import type { AdminUserDTO } from "./types";

interface AuthContextValue {
  user: AdminUserDTO | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  setTheme: (theme: Theme) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUserDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await api.get<{ user: AdminUserDTO }>("/api/admin/auth/me");
      setUser(data.user);
      applyTheme(data.user.themePreference);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await api.post("/api/admin/auth/logout");
    setUser(null);
  }, []);

  const setTheme = useCallback(async (theme: Theme) => {
    applyTheme(theme);
    setUser((prev) => (prev ? { ...prev, themePreference: theme } : prev));
    await api.put("/api/admin/account/theme", { theme });
  }, []);

  return <AuthContext.Provider value={{ user, loading, refresh, logout, setTheme }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
