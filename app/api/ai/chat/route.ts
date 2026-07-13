import { NextResponse } from "next/server"
import { rateLimit, getClientIP } from "@/lib/rate-limiter"

const AI_BACKEND_URL = process.env.NEXT_PUBLIC_AI_BACKEND_URL

const DAILY_AI_LIMIT = 15
const AI_RATE_WINDOW_MS = 24 * 60 * 60 * 1000

export const dynamic = "force-dynamic"
export const revalidate = 0

const API_HEADERS = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": "default-src 'none'",
  "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_SITE_URL || "https://edutechsrm.in",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-access-token",
  "Access-Control-Max-Age": "86400",
} as const

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: API_HEADERS })
}

export async function POST(req: Request) {
  const token = req.headers.get("x-access-token")
  if (!token || token.trim().length === 0) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401, headers: API_HEADERS })
  }

  const { allowed } = rateLimit(`ai:${token}`, DAILY_AI_LIMIT, AI_RATE_WINDOW_MS)
  if (!allowed) {
    return NextResponse.json(
      { error: "Daily AI limit reached. Try again tomorrow." },
      { status: 429, headers: { ...API_HEADERS, "Retry-After": String(Math.ceil(AI_RATE_WINDOW_MS / 1000)) } },
    )
  }

  try {
    const body = await req.json()

    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400, headers: API_HEADERS })
    }

    if (body.max_tokens && (typeof body.max_tokens !== "number" || body.max_tokens > 2000)) {
      body.max_tokens = 600
    }
    if (body.temperature && (typeof body.temperature !== "number" || body.temperature < 0 || body.temperature > 2)) {
      body.temperature = 0.3
    }

    const upstream = await fetch(`${AI_BACKEND_URL!.replace(/\/$/, "")}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    })

    const text = await upstream.text()
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        ...API_HEADERS,
        "Content-Type": upstream.headers.get("content-type") || "application/json",
      },
    })
  } catch {
    return NextResponse.json({ error: "Failed to reach AI backend" }, { status: 500, headers: API_HEADERS })
  }
}
