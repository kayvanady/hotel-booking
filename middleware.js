import { NextResponse } from "next/server";
import jtw from "jsonwebtoken";
export const runtime = "nodejs";

export function middleware(req) {
  const accessToken = req.cookies.get("accessToken")?.value;
  const pathname = req.nextUrl.pathname;

  if (pathname === "/auth/login" || pathname === "/auth/register") {
    if (accessToken) {
      try {
        const payload = jtw.verify(
          accessToken,
          process.env.ACCESS_TOKEN_SECRET,
        );
        const redirectTo =
          payload.role == "user" ? "/user/profile" : "/admin/dashboard";

        return NextResponse.redirect(new URL(redirectTo, req.url));
      } catch {
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  if (!accessToken) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }
  try {
    jtw.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    return NextResponse.next();
  } catch (err) {
    console.error("JWT verify error:", err.message);
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }
}

export const config = {
  matcher: ["/user/:path*", "/admin/:path*", "/auth/:path*"],
};
