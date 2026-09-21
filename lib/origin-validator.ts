export function validateOrigin(request: Request): boolean {
  const origin = request.headers.get("origin")
  const referer = request.headers.get("referer")

  // If no browser origin or referer is present, verify authorized native mobile client
  if (!origin && !referer) {
    const platform = request.headers.get("x-client-platform")
    const app = request.headers.get("x-client-app")
    if (platform === "android" && app === "edutechsrm-mobile") {
      return true
    }
    return false
  }

  try {
    const url = origin || referer || ""
    const hostname = new URL(url).hostname.toLowerCase()

    // Always allow localhost for local development
    if (hostname === "localhost" || hostname === "127.0.0.1") return true

    // Production and standard domain
    if (hostname === "edutechsrm.in" || hostname.endsWith(".edutechsrm.in")) {
      return true
    }

    // Cloudflare Pages preview/staging deployments
    if (hostname.endsWith(".pages.dev")) {
      return true
    }

    return false
  } catch {
    return false
  }
}
