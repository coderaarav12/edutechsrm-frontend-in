import { type NextRequest, NextResponse } from "next/server"

const AI_BACKEND_URL = process.env.NEXT_PUBLIC_AI_BACKEND_URL

export async function GET(request: NextRequest) {
  const token = request.headers.get("x-admin-token")
  if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

  try {
    const response = await fetch(`${AI_BACKEND_URL.replace(/\/$/, "")}/api/check-keys`, {
      headers: { Accept: "application/json" },
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch {
    return NextResponse.json({ success: false, error: "Failed to check API keys" }, { status: 500 })
  }
}
