import { type NextRequest, NextResponse } from "next/server"
import { validateOrigin } from "@/lib/origin-validator"

const BACKEND_URL = process.env.NEXT_PUBLIC_SRM_BACKEND_URL || process.env.SRM_BACKEND_URL || process.env.BACKEND_URL

export async function POST(request: NextRequest) {
  if (!BACKEND_URL) return NextResponse.json({ success: false, error: "Backend not configured" }, { status: 503 })

  if (!validateOrigin(request)) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
  }

  try {
    const text = await request.text()
    if (text.length > 100_000) {
      return NextResponse.json({ success: false, error: "Request too large" }, { status: 413 })
    }
    const body = JSON.parse(text)
    const response = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch {
    return NextResponse.json({ success: false, error: "Failed to submit feedback" }, { status: 500 })
  }
}
