import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_SRM_BACKEND_URL || process.env.SRM_BACKEND_URL || process.env.BACKEND_URL

export async function GET(request: NextRequest) {
  const token = request.headers.get("x-admin-token")
  if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!BACKEND_URL) return NextResponse.json({ success: false, error: "Backend not configured" }, { status: 503 })

  try {
    const response = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/admin/status`, {
      headers: {
        Accept: "application/json",
        "x-admin-token": token,
      },
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch admin status" }, { status: 500 })
  }
}
