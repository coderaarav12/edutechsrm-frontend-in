import { type NextRequest, NextResponse } from "next/server"
import { validateOrigin } from "@/lib/origin-validator"
import { rateLimit, getClientIP } from "@/lib/rate-limiter"

const BACKEND_URL = process.env.NEXT_PUBLIC_SRM_BACKEND_URL || process.env.SRM_BACKEND_URL || process.env.BACKEND_URL

export async function POST(request: NextRequest) {
  if (!BACKEND_URL) {
    return NextResponse.json({ success: false, error: "Backend not configured" }, { status: 503 })
  }

  if (!validateOrigin(request)) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
  }

  const ip = getClientIP(request)
  const { allowed } = rateLimit(ip, 5, 15 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json(
      { success: false, error: "Too many login attempts. Try again in 15 minutes." },
      { status: 429, headers: { "Retry-After": "900" } },
    )
  }

  try {
    const text = await request.text()
    if (text.length > 10_000) {
      return NextResponse.json({ success: false, error: "Request too large" }, { status: 413 })
    }
    const body = JSON.parse(text) as { username?: string; password?: string } | null
    if (!body?.username || !body?.password) {
      return NextResponse.json({ success: false, error: "Username and password are required" }, { status: 400 })
    }

    const response = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json() as { success?: boolean; error?: string; token?: string }
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Admin login failed" },
      { status: 500 },
    )
  }
}
