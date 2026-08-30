import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get("url")

  if (!imageUrl) {
    return new NextResponse("Missing url parameter", { status: 400 })
  }

  // Security check: only allow images from srmist.edu.in
  try {
    const parsed = new URL(imageUrl)
    if (!parsed.hostname.endsWith("srmist.edu.in")) {
      return new NextResponse("Invalid image source", { status: 403 })
    }
  } catch {
    return new NextResponse("Malformed URL", { status: 400 })
  }

  try {
    const res = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Referer": "https://www.srmist.edu.in/faculty/",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "Sec-Fetch-Dest": "image",
        "Sec-Fetch-Mode": "no-cors",
        "Sec-Fetch-Site": "same-origin",
      },
    })

    if (!res.ok) {
      return new NextResponse("Failed to fetch image", { status: res.status })
    }

    const contentType = res.headers.get("content-type") || "image/jpeg"
    const imageBuffer = await res.arrayBuffer()

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=604800, s-maxage=2592000, stale-while-revalidate=86400, immutable",
        "Access-Control-Allow-Origin": "*",
        "Cross-Origin-Resource-Policy": "cross-origin",
      },
    })
  } catch (err) {
    console.error("[image-proxy] Fetch error:", err)
    return new NextResponse("Internal server error", { status: 500 })
  }
}

