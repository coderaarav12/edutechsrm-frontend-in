import { type NextRequest, NextResponse } from "next/server"
import { validateOrigin } from "@/lib/origin-validator"

const BACKEND_URL = process.env.NEXT_PUBLIC_SRM_BACKEND_URL || process.env.SRM_BACKEND_URL || process.env.BACKEND_URL

export async function POST(request: NextRequest) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
  }
  const token = request.headers.get("x-admin-token")
  if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!BACKEND_URL) return NextResponse.json({ success: false, error: "Backend not configured" }, { status: 503 })

  try {
    const body = await request.json().catch(() => ({}))
    const response = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/admin/announcements`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-admin-token": token,
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch {
    return NextResponse.json({ success: false, error: "Failed to post announcement" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
  }
  const token = request.headers.get("x-admin-token")
  if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!BACKEND_URL) return NextResponse.json({ success: false, error: "Backend not configured" }, { status: 503 })

  try {
    const body = await request.json().catch(() => ({}))
    const response = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/admin/announcements`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-admin-token": token,
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch {
    return NextResponse.json({ success: false, error: "Failed to delete announcement" }, { status: 500 })
  }
}
