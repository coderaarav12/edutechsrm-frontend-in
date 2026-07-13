import { NextResponse } from "next/server"
import { rateLimit, getClientIP } from "@/lib/rate-limiter"

const AI_BACKEND_URL = process.env.NEXT_PUBLIC_AI_BACKEND_URL

const DAILY_AI_LIMIT = 15
const AI_RATE_WINDOW_MS = 24 * 60 * 60 * 1000

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function POST(req: Request) {
  const ip = getClientIP(req)

  const token = req.headers.get("x-access-token")
  if (!token || token.trim().length === 0) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  const { allowed, remaining } = rateLimit(`ai:${token}`, DAILY_AI_LIMIT, AI_RATE_WINDOW_MS)
  if (!allowed) {
    return NextResponse.json(
      { error: "Daily AI limit reached. Try again tomorrow." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(AI_RATE_WINDOW_MS / 1000)) } },
    )
  }

  try {
    const body = await req.json()

    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 })
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
        "Content-Type": upstream.headers.get("content-type") || "application/json",
        "Cache-Control": "no-store",
      },
    })
  } catch {
    return NextResponse.json({ error: "Failed to reach AI backend" }, { status: 500 })
  }
}
