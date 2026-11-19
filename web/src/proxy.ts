import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { findRedirect } from "@/lib/redirects";

// Runs before every page of the site.
//
// 1. Admin > Redirects: an old or unwanted address (built-in pages such as
//    /guides included) is sent on to its new one. The query string is kept
//    unless the new address has its own.
// 2. Stamps the current request's pathname onto a header so Server
//    Components (layout.tsx in particular, which App Router doesn't hand a
//    pathname to directly) can read it via headers() — needed so Code
//    snippets' URL/Page targeting conditions can be evaluated against the
//    real request on every route, not just the Homepage. Mirrors
//    admin/src/proxy.ts's location.
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname !== "/" && !pathname.startsWith("/api/") && !pathname.startsWith("/preview")) {
    const redirect = await findRedirect(pathname);
    if (redirect) {
      const target = new URL(redirect.to, request.nextUrl);
      if (!target.search && search) target.search = search;
      return NextResponse.redirect(target, redirect.status);
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|assets/images|favicon.ico|robots.txt|sitemap.xml).*)"],
};
