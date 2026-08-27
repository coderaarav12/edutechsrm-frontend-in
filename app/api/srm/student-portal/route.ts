import { type NextRequest, NextResponse } from "next/server"
import { validateOrigin } from "@/lib/origin-validator"

const STUDENT_PORTAL_BACKEND_URL = (process.env.STUDENT_PORTAL_BACKEND_URL || "http://127.0.0.1:8787").replace(/\/$/, "")

function normalizeAttendance(data: any): unknown[] {
  if (Array.isArray(data?.attendance)) return data.attendance
  if (Array.isArray(data?.attendanceOutput?.attendance)) return data.attendanceOutput.attendance
  if (Array.isArray(data?.attendanceOutput?.rows)) return data.attendanceOutput.rows
  if (Array.isArray(data?.result?.attendance)) return data.result.attendance
  if (Array.isArray(data?.data?.attendance)) return data.data.attendance
  return []
}

export async function GET(request: NextRequest) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
  }

  const backendUrl = new URL(`${STUDENT_PORTAL_BACKEND_URL}/api/captcha`)
  const sessionId = request.nextUrl.searchParams.get("sessionId")
  const refresh = request.nextUrl.searchParams.get("refresh")
  if (sessionId) backendUrl.searchParams.set("sessionId", sessionId)
  if (refresh) backendUrl.searchParams.set("refresh", refresh)

  try {
    const captchaResponse = await fetch(backendUrl.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    })

    const captchaData = (await captchaResponse.json().catch(() => ({}))) as any
    if (!captchaResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: captchaData?.error || "Failed to load the captcha from the student portal scraper.",
        },
        { status: captchaResponse.status },
      )
    }

    return NextResponse.json({
      success: true,
      ready: Boolean(captchaData?.ready),
      sessionId: captchaData?.sessionId || undefined,
      captchaImage: captchaData?.captchaImage || captchaData?.captchaDataUrl || undefined,
      captchaDataUrl: captchaData?.captchaDataUrl || captchaData?.captchaImage || undefined,
      loginUrl: captchaData?.loginUrl || undefined,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to load the captcha." },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
  }

  let body: { username?: string; password?: string; captcha?: string; sessionId?: string; netId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 })
  }

  const netId = String(body.netId ?? body.username ?? "").trim()
  const password = String(body.password ?? "")
  const captcha = String(body.captcha ?? "").trim()

  if (!netId || !password || !captcha) {
    return NextResponse.json(
      { success: false, error: "NetID, password, and captcha are required." },
      { status: 400 },
    )
  }

  try {
    const loginResponse = await fetch(`${STUDENT_PORTAL_BACKEND_URL}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        netId,
        password,
        captcha,
        sessionId: String(body.sessionId ?? "").trim() || undefined,
      }),
    })

    const loginData = (await loginResponse.json().catch(() => ({}))) as any
    if (!loginResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: loginData?.error || loginData?.detail || "Student portal login failed.",
          requiresCaptcha: Boolean(loginData?.requiresCaptcha),
          sessionId: loginData?.sessionId || body.sessionId,
          captchaImage: loginData?.captchaImage || loginData?.captchaDataUrl,
          captchaDataUrl: loginData?.captchaDataUrl || loginData?.captchaImage,
        },
        { status: loginResponse.status },
      )
    }

    return NextResponse.json({
      success: true,
      attendance: loginData.attendance || [],
      attendanceOutput: loginData.attendanceOutput || undefined,
      message: loginData.message || "Attendance fetched from the student portal scraper.",
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Student portal login failed" },
      { status: 500 },
    )
  }
}
