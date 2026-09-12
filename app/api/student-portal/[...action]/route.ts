import { type NextRequest, NextResponse } from "next/server"
import { validateOrigin } from "@/lib/origin-validator"

const PORTAL_BACKEND_URL =
  process.env.STUDENT_PORTAL_BACKEND_URL ||
  process.env.NEXT_PUBLIC_STUDENT_PORTAL_BACKEND_URL ||
  "http://127.0.0.1:8787"

function isAuthorizedRequest(request: NextRequest): boolean {
  if (validateOrigin(request)) return true
  const platform = request.headers.get("x-client-platform")
  const app = request.headers.get("x-client-app")
  if (platform === "android" && app === "edutechsrm-mobile") return true
  return false
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedRequest(request)) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
  }

  const url = new URL(request.url)
  const path = url.pathname.replace(/^\/api\/student-portal/, "/api")
  const targetUrl = new URL(`${PORTAL_BACKEND_URL.replace(/\/$/, "")}${path}`)
  url.searchParams.forEach((v, k) => targetUrl.searchParams.set(k, v))

  try {
    const res = await fetch(targetUrl.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    })
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Student Portal backend unreachable" },
      { status: 502 }
    )
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorizedRequest(request)) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await request.text()
    if (body.length > 50_000) {
      return NextResponse.json({ success: false, error: "Request too large" }, { status: 413 })
    }

    const url = new URL(request.url)
    const path = url.pathname.replace(/^\/api\/student-portal/, "/api")
    const targetUrl = new URL(`${PORTAL_BACKEND_URL.replace(/\/$/, "")}${path}`)

    const res = await fetch(targetUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body,
      cache: "no-store",
    })
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Student Portal backend unreachable" },
      { status: 502 }
    )
  }
}
