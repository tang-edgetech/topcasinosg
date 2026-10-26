import type { NextConfig } from "next";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = path.join(__dirname, "..");

function git(args: string): string {
  try {
    return execSync(`git ${args}`, { cwd: repoRoot, stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return "";
  }
}

// CI passes the release tag it just created as APP_VERSION. A local build
// shows the latest tag of the current VERSION series.
function resolveAppVersion(): string {
  if (process.env.APP_VERSION) return process.env.APP_VERSION;
  const series = readFileSync(path.join(repoRoot, "VERSION"), "utf8").trim();
  const latestTag = git(`tag --list "v${series}.*" --sort=-v:refname`).split("\n")[0];
  return latestTag || `v${series}.0`;
}

const nextConfig: NextConfig = {
  // Allows importing shared/theme/tokens.css, which lives outside this app's
  // own directory in the monorepo root.
  turbopack: {
    root: repoRoot,
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: resolveAppVersion(),
    NEXT_PUBLIC_APP_BUILD_DATE: process.env.APP_BUILD_DATE || new Date().toISOString().slice(0, 10),
  },
};

export default nextConfig;
