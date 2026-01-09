import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isProtectedRoute, AUTH_COOKIE_NAME } from "@/lib/proxy";

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if user has auth cookie
  const authToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  
  // 1. Protect Dashboard Routes
  if (isProtectedRoute(pathname)) {
    if (!authToken) {
      // Redirect to login if trying to access protected route without token
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  // 2. Redirect logged-in users away from Login page
  if (pathname === "/login" && authToken) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logo (public images)
     * - images (public images)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|logo|images).*)',
  ],
};
