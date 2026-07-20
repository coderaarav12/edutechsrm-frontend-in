import { NextResponse } from "next/server"
import { NOTES_DATA } from "@/lib/notes-data"

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function GET() {
  return NextResponse.json(
    { success: true, semesters: NOTES_DATA },
    {
      headers: {
        ...CORS_HEADERS,
        "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
      },
    },
  )
}
