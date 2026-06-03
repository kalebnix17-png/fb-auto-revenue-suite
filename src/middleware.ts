import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Admin-only routes
    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/posts/:path*",
    "/api/leads/:path*",
    "/api/facebook/:path*",
    "/api/ai/:path*",
    "/api/stripe/:path*",
    "/api/analytics/:path*",
    "/api/admin/:path*",
    "/api/notifications/:path*",
  ],
};
