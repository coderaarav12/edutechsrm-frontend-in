import { type NextRequest, NextResponse } from "next/server"
import { validateOrigin } from "@/lib/origin-validator"

const BACKEND_URL = process.env.NEXT_PUBLIC_SRM_BACKEND_URL || process.env.SRM_BACKEND_URL || process.env.BACKEND_URL
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY || "1x0000000000000000000000000000000AA"

const FAILED_ATTEMPTS = new Map<string, { count: number; time: number }>()
const MAX_FAILED = 3
const ATTEMPT_TTL = 15 * 60 * 1000

function pruneExpired() {
  const now = Date.now()
  for (const [ip, entry] of FAILED_ATTEMPTS) {
    if (now - entry.time > ATTEMPT_TTL) FAILED_ATTEMPTS.delete(ip)
  }
}

function getClientIP(request: NextRequest): string {
  return request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
}

async function verifyTurnstileToken(token: string): Promise<boolean | "error"> {
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: TURNSTILE_SECRET, response: token }),
    })
    if (!res.ok) return "error"
    const data = await res.json() as { success: boolean }
    return data.success === true
  } catch {
    return "error"
  }
}

function isValidSRMEmail(email: string): boolean {
  const srmRegex = /^[a-zA-Z]{2}\d{4,}@srmist\.edu\.in$/
  return srmRegex.test(email)
}

function publicLoginError(status = 500) {
  return NextResponse.json(
    {
      success: false,
      error: "Login is temporarily unavailable. Please try again in a moment.",
    },
    { status },
  )
}

export async function POST(request: NextRequest) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
  }

  const ip = getClientIP(request)

  try {
    if (!BACKEND_URL) {
      return publicLoginError(503)
    }

    let body: { email?: string; password?: string; captchaAnswer?: string; cdigest?: string; turnstileToken?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 })
    }

    const { email, password, captchaAnswer, cdigest, turnstileToken } = body

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 })
    }

    const rawEmail = email.trim().toLowerCase()
    const username = rawEmail.includes("@") ? rawEmail : `${rawEmail}@srmist.edu.in`

    if (!isValidSRMEmail(username)) {
      return NextResponse.json({
        success: false,
        error: "Please enter a valid SRM email ID (e.g. ab1234@srmist.edu.in)",
        hint: "Use the format: first 2 letters of your name + your 4+ digit registration number @srmist.edu.in",
      }, { status: 400 })
    }

    pruneExpired()
    const failedCount = FAILED_ATTEMPTS.get(ip)?.count || 0
    if (failedCount >= MAX_FAILED) {
      if (!turnstileToken) {
        return NextResponse.json(
          { success: false, requiresTurnstile: true, error: "Complete the bot check below to continue." },
          { status: 403 },
        )
      }
      const result = await verifyTurnstileToken(turnstileToken)
      if (result === false) {
        return NextResponse.json({ success: false, error: "Bot verification failed. Please try again." }, { status: 403 })
      }
      if (result === "error") {
        console.warn("[login] Turnstile verify endpoint unreachable — allowing login to proceed")
      }
    }

    const resolvedUrl = `${BACKEND_URL.replace(/\/$/, "")}/api/login`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 120000)

    let loginResponse
    try {
      loginResponse = await fetch(resolvedUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ username, password, captchaAnswer, cdigest }),
        signal: controller.signal,
      })
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      if (fetchError.name === "AbortError") {
        return NextResponse.json(
          { success: false, error: "Request timed out. SRM portal may be slow, please try again." },
          { status: 504 },
        )
      }
      return publicLoginError(503)
    }

    clearTimeout(timeoutId)

    let responseText
    try {
      responseText = await loginResponse.text()
    } catch {
      return NextResponse.json({ success: false, error: "Failed to read server response" }, { status: 500 })
    }

    let data: any
    try {
      data = JSON.parse(responseText)
    } catch {
      return publicLoginError(500)
    }

    if (!loginResponse.ok) {
      if (data.requiresCaptcha) {
        return NextResponse.json({
          success: false,
          requiresCaptcha: true,
          captchaImage: data.captchaImage,
          cdigest: data.cdigest,
          error: data.detail || data.error || "SRM Academia requires CAPTCHA verification.",
        }, { status: 409 })
      }

      if (loginResponse.status === 429) {
        return NextResponse.json(
          {
            success: false,
            error: data.detail || data.error || "Server is busy. Please wait 20-30 seconds and try again.",
            backendStatus: 429,
          },
          { status: 429 },
        )
      }

      if (loginResponse.status >= 500) {
        return publicLoginError(502)
      }

      FAILED_ATTEMPTS.set(ip, { count: failedCount + 1, time: Date.now() })

      return NextResponse.json(
        {
          success: false,
          error: data.detail || data.error || data.message || "Authentication failed",
          backendStatus: loginResponse.status,
        },
        { status: loginResponse.status },
      )
    }

    const isAuthenticated = data.authenticated || data.success || data.isAuthenticated || (loginResponse.ok && data.token)

    if (!isAuthenticated) {
      FAILED_ATTEMPTS.set(ip, { count: failedCount + 1, time: Date.now() })
      return NextResponse.json(
        { success: false, error: data.detail || data.message || "Authentication failed" },
        { status: 401 },
      )
    }

    const token = data.token || data.accessToken || data.access_token || data.lookup?.digest

    if (!token || (typeof token === 'string' && token.trim() === '')) {
      return NextResponse.json(
        { success: false, error: "Login did not complete successfully. Please try again." },
        { status: 401 },
      )
    }

    FAILED_ATTEMPTS.delete(ip)

    const response = NextResponse.json({
      success: true,
      token,
      message: "Connected to SRM Academia",
      isAuthenticated: true,
    })

    response.cookies.set({
      name: "srm-token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    })

    return response
  } catch (error) {
    return publicLoginError(500)
  }
}
