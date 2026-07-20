import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Stamps the current request's pathname onto a header so Server Components
// (layout.tsx in particular, which App Router doesn't hand a pathname to
// directly) can read it via headers() — needed so Code snippets' URL/Page
// targeting conditions can be evaluated against the real request on every
// route, not just the Homepage. Mirrors admin/src/proxy.ts's location.
export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
