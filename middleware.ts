import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static assets and API routes ignore auth redirects
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Update session cookies if Supabase is active
  const { supabaseResponse } = await updateSession(request);

  // Read role and user from cookies
  const roleCookie = request.cookies.get("campusone_role")?.value;
  const userCookie = request.cookies.get("campusone_user_id")?.value;

  const isPublicRoute =
    pathname === "/login" ||
    pathname === "/forgot-password" ||
    pathname === "/unauthorized";

  // Root route redirect logic
  if (pathname === "/") {
    if (roleCookie === "student") {
      return NextResponse.redirect(new URL("/student/dashboard", request.url));
    }
    if (roleCookie === "faculty") {
      return NextResponse.redirect(new URL("/faculty/dashboard", request.url));
    }
    if (roleCookie === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Allow public routes (login, forgot-password, unauthorized) without redirect loops
  if (isPublicRoute) {
    return supabaseResponse;
  }

  // Guard Student routes
  if (pathname.startsWith("/student")) {
    if (!userCookie || !roleCookie) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (roleCookie !== "student") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // Guard Faculty routes
  if (pathname.startsWith("/faculty")) {
    if (!userCookie || !roleCookie) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (roleCookie !== "faculty") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // Guard Admin routes
  if (pathname.startsWith("/admin")) {
    if (!userCookie || !roleCookie) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (roleCookie !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
