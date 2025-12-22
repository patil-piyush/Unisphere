import { NextRequest, NextResponse } from "next/server"

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/auth/login",
  "/auth/register",
  "/admin-login",
  "/club-admin-login",
]

const AUTH_COOKIE_NAME = "token"

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 1) Allow all public routes (logins, landing, etc.)
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next()
  }

  // 2) For everything else, require auth
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value

  if (!token) {
    const loginUrl = new URL("/login", req.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// Apply middleware to all app routes
export const config = {
  matcher: ["/:path*"],
}
