import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronSession } from "iron-session";

const sessionOptions = {
  password: process.env.SESSION_SECRET || "complex_password_at_least_32_characters_long",
  cookieName: "admin_session",
};

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // iron-session works with Request/Response in Edge context
  const session = await getIronSession<{ isLoggedIn?: boolean }>(req, res, sessionOptions);

  const { pathname } = req.nextUrl;

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  const isApi = pathname.startsWith("/api/admin");
  const isAuthEndpoint = pathname.startsWith("/api/admin/auth/login");

  if (!session.isLoggedIn && !isAuthEndpoint) {
    if (isApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  if (session.isLoggedIn && pathname === "/login") {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/", "/admin/:path*", "/api/admin/:path*", "/login"],
};
