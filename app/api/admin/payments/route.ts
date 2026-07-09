import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_SRM_BACKEND_URL || process.env.SRM_BACKEND_URL || process.env.BACKEND_URL

export async function GET(request: NextRequest) {
  if (!BACKEND_URL) return NextResponse.json({ success: false, error: "Backend not configured" }, { status: 503 })

  const adminToken = request.headers.get("x-admin-token")
  if (!adminToken) {
    return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
  }

  try {
    const response = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/admin/payments`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-admin-token": adminToken,
      },
    })
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch payments" }, { status: 500 })
  }
}
