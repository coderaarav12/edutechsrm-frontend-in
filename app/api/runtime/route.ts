import { NextResponse } from "next/server"
import { APP_RUNTIME_VERSION } from "@/lib/runtime-version"

const BACKEND_URL = process.env.NEXT_PUBLIC_SRM_BACKEND_URL || process.env.SRM_BACKEND_URL || process.env.BACKEND_URL

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  if (!BACKEND_URL) {
    return NextResponse.json({
      version: APP_RUNTIME_VERSION,
      maintenance: { enabled: false, message: "", updatedAt: null },
    }, {
      status: 200,
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" },
    })
  }

  try {
    const response = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/maintenance`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    })

    const maintenance = await response.json()
    return NextResponse.json({
      version: APP_RUNTIME_VERSION,
      maintenance,
    }, {
      status: 200,
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" },
    })
  } catch {
    return NextResponse.json({
      version: APP_RUNTIME_VERSION,
      maintenance: { enabled: false, message: "", updatedAt: null },
    }, {
      status: 200,
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" },
    })
  }
}
