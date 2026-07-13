import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { rateLimit, getClientIP } from "@/lib/rate-limiter"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const url = request.nextUrl.clone()

  // Gate: visiting /portal-g7k2 sets the cookie and redirects to /admin
  if (pathname === "/portal-g7k2") {
    const ip = getClientIP(request)
    const { allowed } = rateLimit(ip, 10, 60 * 60 * 1000)
    if (!allowed) {
      return new NextResponse(null, { status: 429 })
    }

    const dest = new URL("/admin", url)
    const response = NextResponse.redirect(dest)
    response.headers.set(
      "Set-Cookie",
      "admin_access=1; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=7200"
    )
    return response
  }

  // Protect /admin from unauthorized access
  if (pathname.startsWith("/admin")) {
    const cookie = request.cookies.get("admin_access")
    if (cookie?.value !== "1") {
      return new NextResponse(null, { status: 404 })
    }
  }

  // Protect AI chat endpoint — require auth token
  if (pathname === "/api/ai/chat") {
    const token = request.headers.get("x-access-token")
    if (!token || token.trim().length === 0) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const ip = getClientIP(request)
    const { allowed } = rateLimit(`middleware:ai:${ip}`, 30, 60 * 1000)
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin{/:path}?", "/portal-g7k2", "/api/ai/chat"],
}
