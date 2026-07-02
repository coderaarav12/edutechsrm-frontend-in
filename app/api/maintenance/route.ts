import { NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_SRM_BACKEND_URL || process.env.SRM_BACKEND_URL || process.env.BACKEND_URL

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  if (!BACKEND_URL) return NextResponse.json({ enabled: false, message: "", updatedAt: null }, { status: 200 })

  try {
    const response = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/maintenance`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    })

    const data = await response.json()
    return NextResponse.json(data, {
      status: response.status,
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" },
    })
  } catch {
    return NextResponse.json(
      { enabled: false, message: "", updatedAt: null },
      { status: 200, headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" } },
    )
  }
}
