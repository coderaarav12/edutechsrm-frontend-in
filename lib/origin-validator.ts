export function validateOrigin(request: Request): boolean {
  const origin = request.headers.get("origin")
  const referer = request.headers.get("referer")
  if (!origin && !referer) return false

  try {
    const url = origin || referer || ""
    const hostname = new URL(url).hostname.toLowerCase()

    // Always allow localhost for development
    if (hostname === "localhost" || hostname === "127.0.0.1") return true

    const isProd = process.env.NODE_ENV === "production"

    // Production: only the real domain
    if (isProd) {
      return hostname === "edutechsrm.in" || hostname.endsWith(".edutechsrm.in")
    }

    // Preview/staging: Cloudflare Pages previews
    return hostname.endsWith(".pages.dev")
  } catch {
    return false
  }
}
