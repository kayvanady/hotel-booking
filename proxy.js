
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function proxy(req) {
  const accessToken = req.cookies.get("accessToken")?.value;
  const pathname = req.nextUrl.pathname;

  
  if (
    pathname === "/auth/login" ||
    pathname === "/auth/register"
  ) {
    if (!accessToken) {
      return NextResponse.next();
    }

    try {
      const payload = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET
      );

      if (payload.role === "admin") {
        return NextResponse.redirect(
          new URL("/admin/dashboard", req.url)
        );
      }

      if (payload.role === "user") {
        return NextResponse.redirect(
          new URL("/user/profile", req.url)
        );
      }

      return NextResponse.next();
    } catch {
      return NextResponse.next();
    }
  }

 
  if (!accessToken) {
    return NextResponse.redirect(
      new URL("/auth/login", req.url)
    );
  }

  try {
    const payload = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );

   
    if (
      pathname.startsWith("/admin") &&
      payload.role !== "admin"
    ) {
      return NextResponse.redirect(
        new URL("/user/profile", req.url)
      );
    }

    
    if (
      pathname.startsWith("/user") &&
      payload.role !== "user"
    ) {
      return NextResponse.redirect(
        new URL("/admin/dashboard", req.url)
      );
    }

    return NextResponse.next();
  } catch (err) {
    console.error("JWT verification error:", err.message);

    return NextResponse.redirect(
      new URL("/auth/login", req.url)
    );
  }
}

export const config = {
  matcher: [
    "/user/:path*",
    "/admin/:path*",
    "/auth/:path*",
  ],
};
