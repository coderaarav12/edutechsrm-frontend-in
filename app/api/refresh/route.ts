import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_SRM_BACKEND_URL || process.env.SRM_BACKEND_URL || process.env.BACKEND_URL

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-access-token")
  if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!BACKEND_URL) {
    return NextResponse.json({ success: false, error: "Backend not configured" }, { status: 503 })
  }

  try {
    const response = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/refresh`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "x-access-token": token,
      },
    })

    const data = await response.json() as { success?: boolean; token?: string; error?: string }
    const nextResponse = NextResponse.json(data, { status: response.status })

    if (response.ok && data?.success && typeof data?.token === "string" && data.token.trim()) {
      nextResponse.cookies.set({
        name: "srm-token",
        value: data.token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      })
    }

    return nextResponse
  } catch {
    return NextResponse.json({ success: false, error: "Refresh failed" }, { status: 500 })
  }
}
