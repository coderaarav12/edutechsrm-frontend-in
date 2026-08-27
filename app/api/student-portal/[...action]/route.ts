import { type NextRequest, NextResponse } from "next/server"

const PORTAL_BACKEND_URL =
  process.env.STUDENT_PORTAL_BACKEND_URL ||
  process.env.NEXT_PUBLIC_STUDENT_PORTAL_BACKEND_URL ||
  "http://127.0.0.1:8787"

export async function GET(request: NextRequest) {
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
  const url = new URL(request.url)
  const path = url.pathname.replace(/^\/api\/student-portal/, "/api")
  const targetUrl = new URL(`${PORTAL_BACKEND_URL.replace(/\/$/, "")}${path}`)

  try {
    const body = await request.text()
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
