import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Optimistic check only: absence of the cookie redirects to login immediately
// without a network round-trip. The real authorization decision is made by
// the Go API on every request (see internal/middleware/auth.go) — this is a
// UX shortcut, not the security boundary.
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has("access_token");
  if (!hasSession) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/dashboard/:path*",
};