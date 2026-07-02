import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_SRM_BACKEND_URL || process.env.SRM_BACKEND_URL || process.env.BACKEND_URL

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const token = request.headers.get("x-access-token")
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!BACKEND_URL) return NextResponse.json({ error: "Backend not configured" }, { status: 503 })

  const backendUrl = BACKEND_URL.replace(/\/$/, "")
  const photoUrl = `${backendUrl}/api/photo`

  try {
    const response = await fetch(photoUrl, {
      method: "GET",
      headers: { Accept: "image/webp,image/avif,image/*,*/*;q=0.8", "x-access-token": token },
    })

    if (!response.ok) {
      const text = await response.text().catch(() => "")
      return NextResponse.json({ error: "Photo not found", backendStatus: response.status, detail: text.slice(0, 200) }, { status: response.status })
    }

    const arrayBuffer = await response.arrayBuffer()

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "private, max-age=3600",
        "Content-Length": String(arrayBuffer.byteLength),
      },
    })
  } catch (err) {
    console.error("[photo-route] Error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to fetch photo" }, { status: 500 })
  }
}

export async function DELETE() {
  return NextResponse.json({ success: true })
}
