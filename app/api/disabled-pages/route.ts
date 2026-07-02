import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_SRM_BACKEND_URL || process.env.SRM_BACKEND_URL || process.env.BACKEND_URL

export async function GET(_request: NextRequest) {
  if (!BACKEND_URL) return NextResponse.json({ pages: [] }, { status: 200 })

  try {
    const response = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/disabled-pages`, {
      method: "GET",
      headers: { Accept: "application/json" },
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch {
    return NextResponse.json({ pages: [] }, { status: 200 })
  }
}
