import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_SRM_BACKEND_URL || process.env.SRM_BACKEND_URL || process.env.BACKEND_URL

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
  return response
}
