import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Allows importing shared/theme/tokens.css, which lives outside this app's
  // own directory in the monorepo root.
  turbopack: {
    root: path.join(__dirname, ".."),
  },
};

export default nextConfig;
