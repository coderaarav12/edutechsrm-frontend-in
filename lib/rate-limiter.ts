export interface RateLimitEntry {
  count: number
  time: number
}

const STORE = new Map<string, RateLimitEntry>()

function pruneExpired(window: number) {
  const now = Date.now()
  for (const [key, entry] of STORE) {
    if (now - entry.time > window) STORE.delete(key)
  }
}

export function rateLimit(
  ip: string,
  maxAttempts: number,
  windowMs: number,
): { allowed: boolean; remaining: number } {
  pruneExpired(windowMs)
  const entry = STORE.get(ip)
  if (!entry) {
    STORE.set(ip, { count: 1, time: Date.now() })
    return { allowed: true, remaining: maxAttempts - 1 }
  }
  entry.count++
  if (entry.count > maxAttempts) {
    return { allowed: false, remaining: 0 }
  }
  return { allowed: true, remaining: maxAttempts - entry.count }
}

export function getClientIP(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  )
}
