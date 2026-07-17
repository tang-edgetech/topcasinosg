export type Theme = "light" | "dark";

const STORAGE_KEY = "topcasinosg-theme";

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // localStorage can throw in private-browsing/blocked-storage contexts —
    // the class toggle above already took effect, which is what matters.
  }
}

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
