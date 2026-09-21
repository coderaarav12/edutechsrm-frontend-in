import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_SRM_BACKEND_URL || process.env.SRM_BACKEND_URL || process.env.BACKEND_URL
const PORTAL_BACKEND_URL =
  process.env.STUDENT_PORTAL_BACKEND_URL ||
  process.env.NEXT_PUBLIC_STUDENT_PORTAL_BACKEND_URL ||
  "http://127.0.0.1:8787"

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-access-token")

  if (token && BACKEND_URL) {
    try {
      await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "x-access-token": token,
        },
      })
    } catch {
      // Clear the local session even if the backend logout call fails.
    }
  }

  const portalSessionId = request.cookies.get("srm_session_id")?.value
  if (portalSessionId) {
    try {
      await fetch(`${PORTAL_BACKEND_URL.replace(/\/$/, "")}/api/logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Cookie: `srm_session_id=${encodeURIComponent(portalSessionId)}`,
        },
        body: JSON.stringify({ sessionId: portalSessionId }),
      })
    } catch {
      // Local logout should still continue if portal logout fails.
    }
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set({
    name: "srm-token",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  })
  response.cookies.set({
    name: "srm_session_id",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  })
  return response
}
