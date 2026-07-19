"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "topcasinosg-theme";

// Inlined into a beforeInteractive <Script> in the root layout so the correct
// theme applies before first paint, instead of flashing light then dark.
export const themeInitScript = `
(function () {
  try {
    var t = localStorage.getItem('${STORAGE_KEY}');
    if (t === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

interface ThemeContextValue {
  theme: Theme;
  // Local-only: toggles the .dark class + localStorage + re-renders antd's
  // ConfigProvider. auth-context's setTheme wraps this and additionally
  // persists to the DB — this layer has no idea a database exists.
  setLocalTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Starts "light" to match SSR output; the effect below syncs it from
  // localStorage on mount. The beforeInteractive script already applied the
  // correct class to <html> before this ever renders, so there's no visible
  // flash even though this piece of React state briefly lags by one tick.
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "dark" || stored === "light") setThemeState(stored);
    } catch {
      // ignore
    }
  }, []);

  function setLocalTheme(next: Theme) {
    setThemeState(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage can throw in private-browsing/blocked-storage contexts —
      // the class toggle above already took effect, which is what matters.
    }
  }

  return <ThemeContext.Provider value={{ theme, setLocalTheme }}>{children}</ThemeContext.Provider>;
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }
  return ctx;
}
