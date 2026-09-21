import { type NextRequest, NextResponse } from "next/server"
import { validateOrigin } from "@/lib/origin-validator"
import {
  decryptRequestPayload,
  applySecurityHeaders,
  sanitizeErrorMessage,
  stripInternalSecrets,
} from "@/lib/security"

const PORTAL_BACKEND_URL =
  process.env.STUDENT_PORTAL_BACKEND_URL ||
  process.env.NEXT_PUBLIC_STUDENT_PORTAL_BACKEND_URL ||
  "http://127.0.0.1:8787"

function copyBackendCookie(response: NextResponse, backendResponse: Response) {
  const setCookie = backendResponse.headers.get("set-cookie")
  if (setCookie) {
    response.headers.set("set-cookie", setCookie)
  }
}

function portalHeaders(request: NextRequest, contentType = false): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
  }
  const cookie = request.headers.get("cookie")
  if (cookie) headers.Cookie = cookie
  if (contentType) headers["Content-Type"] = "application/json"
  return headers
}

export async function GET(request: NextRequest) {
  if (!validateOrigin(request)) {
    return applySecurityHeaders(NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 }))
  }

  const url = new URL(request.url)
  const path = url.pathname.replace(/^\/api\/student-portal/, "/api")
  const targetUrl = new URL(`${PORTAL_BACKEND_URL.replace(/\/$/, "")}${path}`)
  url.searchParams.forEach((v, k) => targetUrl.searchParams.set(k, v))

  try {
    const res = await fetch(targetUrl.toString(), {
      method: "GET",
      headers: portalHeaders(request),
      cache: "no-store",
    })
    const rawData = await res.json().catch(() => ({}))
    const sanitizedData = stripInternalSecrets(rawData)
    const response = applySecurityHeaders(NextResponse.json(sanitizedData, { status: res.status }))
    copyBackendCookie(response, res)
    return response
  } catch (err: any) {
    return applySecurityHeaders(
      NextResponse.json(
        { success: false, error: sanitizeErrorMessage(err?.message, "Student Portal backend unreachable") },
        { status: 502 }
      )
    )
  }
}

export async function POST(request: NextRequest) {
  if (!validateOrigin(request)) {
    return applySecurityHeaders(NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 }))
  }

  try {
    const rawText = await request.text()
    if (rawText.length > 50_000) {
      return applySecurityHeaders(NextResponse.json({ success: false, error: "Request too large" }, { status: 413 }))
    }

    let outgoingBody = rawText

    // In-memory decryption if payload is an encrypted blob
    try {
      let parsed: any = null
      try {
        parsed = JSON.parse(rawText)
      } catch {
        // Not a JSON string; pass through as text
      }

      if (parsed && typeof parsed === "object") {
        const decrypted = decryptRequestPayload(parsed)
        outgoingBody = typeof decrypted === "string" ? decrypted : JSON.stringify(decrypted)
      }
    } catch (decryptErr: any) {
      return applySecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: sanitizeErrorMessage(decryptErr?.message, "Invalid or expired payload"),
          },
          { status: 400 }
        )
      )
    }

    const url = new URL(request.url)
    const path = url.pathname.replace(/^\/api\/student-portal/, "/api")
    const targetUrl = new URL(`${PORTAL_BACKEND_URL.replace(/\/$/, "")}${path}`)

    const res = await fetch(targetUrl.toString(), {
      method: "POST",
      headers: portalHeaders(request, true),
      body: outgoingBody,
      cache: "no-store",
    })
    const rawData = await res.json().catch(() => ({}))
    const sanitizedData = stripInternalSecrets(rawData)
    const response = applySecurityHeaders(NextResponse.json(sanitizedData, { status: res.status }))
    copyBackendCookie(response, res)
    return response
  } catch (err: any) {
    return applySecurityHeaders(
      NextResponse.json(
        { success: false, error: sanitizeErrorMessage(err?.message, "Student Portal backend unreachable") },
        { status: 502 }
      )
    )
  }
}
