import { type NextRequest, NextResponse } from "next/server"
import { FINDER_CSV } from "@/lib/finder-data"

const RATE_LIMIT = 60
const WINDOW_MS = 60_000
const hits = new Map<string, { count: number; resetAt: number }>()
const verifiedTokens = new Map<string, { ok: boolean; expiresAt: number }>()

const BACKEND_URL = process.env.NEXT_PUBLIC_SRM_BACKEND_URL || process.env.SRM_BACKEND_URL || process.env.BACKEND_URL

function prune() {
  const now = Date.now()
  for (const [key, val] of hits) {
    if (val.resetAt <= now) hits.delete(key)
  }
  for (const [key, val] of verifiedTokens) {
    if (val.expiresAt <= now) verifiedTokens.delete(key)
  }
}

function getClientIP(request: NextRequest): string {
  return request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1"
}

function parseCSV(csv: string) {
  const lines = csv.trim().split("\n")
  if (lines.length < 2) return []
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""))
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const values: string[] = []
    let current = ""
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') inQuotes = !inQuotes
      else if (ch === "," && !inQuotes) { values.push(current.trim().replace(/^"|"$/g, "")); current = "" }
      else current += ch
    }
    values.push(current.trim().replace(/^"|"$/g, ""))
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => { obj[h] = values[i] || "" })
    return obj
  }).filter(r => r["Faculty Name"]?.trim())
}

async function verifyToken(token: string): Promise<boolean> {
  const cached = verifiedTokens.get(token)
  if (cached && cached.expiresAt > Date.now()) return cached.ok
  if (!BACKEND_URL) return false
  try {
    const res = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/user`, {
      headers: { "x-access-token": token },
      signal: AbortSignal.timeout(5000),
    })
    const ok = res.ok
    verifiedTokens.set(token, { ok, expiresAt: Date.now() + 300_000 })
    return ok
  } catch {
    verifiedTokens.set(token, { ok: false, expiresAt: Date.now() + 60_000 })
    return false
  }
}

export async function GET(request: NextRequest) {
  const token = request.headers.get("x-access-token")
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!(await verifyToken(token))) return NextResponse.json({ error: "Invalid session" }, { status: 401 })

  prune()
  const ip = getClientIP(request)
  const now = Date.now()
  const entry = hits.get(ip)
  if (entry && entry.count >= RATE_LIMIT && entry.resetAt > now) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)) } })
  }
  if (!entry || entry.resetAt <= now) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS })
  } else {
    entry.count++
  }

  try {
    const rows = parseCSV(FINDER_CSV)
    const faculty = rows.map((r, i) => ({
      id: `faculty-${i}`,
      facultyId: (r["Faculty Id."] || r["Faculty Id"] || `FAC${String(i).padStart(4, "0")}`).trim(),
      name: r["Faculty Name"].trim(),
      designation: (r["Designation"] || "Faculty").trim(),
      department: (r["Department"] || "NWC").trim(),
      staffRoom: (r["Staff Room"] || "Not Assigned").trim(),
    }))

    const { searchParams } = new URL(request.url)
    const dept = searchParams.get("department")
    const q = searchParams.get("q")?.toLowerCase()
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "8")))

    let filtered = faculty
    if (dept) filtered = filtered.filter(f => f.department.toLowerCase() === dept.toLowerCase())
    if (q) filtered = filtered.filter(f => f.name.toLowerCase().includes(q) || f.facultyId.toLowerCase().includes(q))

    const departments = [...new Set(faculty.map(f => f.department).filter(Boolean))].sort()
    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const start = (page - 1) * limit
    const items = filtered.slice(start, start + limit)

    return NextResponse.json({ faculty: items, total, page, totalPages, departments })
  } catch (err) {
    console.error("[finder] Error:", err)
    return NextResponse.json({ error: "Failed to load faculty data" }, { status: 500 })
  }
}
