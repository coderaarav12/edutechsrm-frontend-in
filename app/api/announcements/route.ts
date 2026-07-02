import { NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_SRM_BACKEND_URL || process.env.SRM_BACKEND_URL || process.env.BACKEND_URL
const V2_ANNOUNCEMENT_CUTOFF = "2026-05-20"

export async function GET() {
  if (!BACKEND_URL) {
    return NextResponse.json({ success: false, announcements: [] }, { status: 503 })
  }

  try {
    const response = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/announcements`, {
      headers: { Accept: "application/json" },
    })

    const data = await response.json()
    if (Array.isArray(data?.announcements)) {
      data.announcements = data.announcements.filter((item: any) => (
        item && typeof item.date === "string" && item.date >= V2_ANNOUNCEMENT_CUTOFF
      ))
    }
    return NextResponse.json(data, { status: response.status })
  } catch {
    return NextResponse.json({ success: false, announcements: [] }, { status: 500 })
  }
}
