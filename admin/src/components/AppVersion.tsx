"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { APP_BUILD_DATE, APP_COMMIT, APP_VERSION, isDevVersion } from "@/lib/version";

function formatBuildDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// Build version for the login page and sidebar footer. When a deploy has
// left the API on a different release than this admin build, it says so.
export default function AppVersion({ className = "" }: { className?: string }) {
  const [apiVersion, setApiVersion] = useState("");

  useEffect(() => {
    api
      .get<{ version: string }>("/health")
      .then((health) => setApiVersion(health.version))
      .catch(() => setApiVersion(""));
  }, []);

  const buildDate = formatBuildDate(APP_BUILD_DATE);
  const mismatch = apiVersion !== "" && !isDevVersion(apiVersion) && !isDevVersion(APP_VERSION) && apiVersion !== APP_VERSION;
  const details = [APP_COMMIT && `Commit ${APP_COMMIT}`, apiVersion && `API ${apiVersion}`].filter(Boolean).join(" · ");

  return (
    <p id="app-version" title={details} className={`app-version text-xs ${className}`}>
      {APP_VERSION}
      {buildDate && ` · ${buildDate}`}
      {mismatch && <span className="app-version__mismatch ml-1 text-secondary-600">(API {apiVersion})</span>}
    </p>
  );
}
