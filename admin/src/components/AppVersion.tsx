import { APP_BUILD_DATE, APP_VERSION } from "@/lib/version";

function formatBuildDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// Plain release number (v1.0.3) for the login page and sidebar; the release
// date only appears on hover.
export default function AppVersion({ className = "" }: { className?: string }) {
  const buildDate = formatBuildDate(APP_BUILD_DATE);
  return (
    <p
      id="app-version"
      title={buildDate ? `Released ${buildDate}` : undefined}
      className={`app-version cursor-default text-[10px] underline decoration-dotted underline-offset-2 ${className}`}
    >
      {APP_VERSION}
    </p>
  );
}
