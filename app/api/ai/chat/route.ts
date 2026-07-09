import { NextResponse } from "next/server"

// Server-side proxy to avoid CORS and to ensure the correct backend URL is used
// regardless of client-side env inlining.
const AI_BACKEND_URL = process.env.NEXT_PUBLIC_AI_BACKEND_URL

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Log the system prompt for debugging (truncated to first 500 chars for readability)
    if (body.system_prompt) {
      console.log("[AI Chat] System prompt length:", body.system_prompt.length)
      console.log("[AI Chat] System prompt preview:", body.system_prompt.slice(0, 500))
    }
    console.log("[AI Chat] Messages:", JSON.stringify(body.messages))

    const upstream = await fetch(`${AI_BACKEND_URL.replace(/\/$/, "")}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    })

    const text = await upstream.text()
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "application/json",
        "Cache-Control": "no-store",
      },
    })
  } catch (err) {
    console.error("[AI Chat] Error:", err)
    return NextResponse.json({ error: "Failed to reach AI backend" }, { status: 500 })
  }
}
