const PHOTO_CACHE_KEY = "edutechsrm_photo_cache_v1"

interface PhotoCache {
  data: string
  token: string
  timestamp: string
}

export function readCachedPhoto(token?: string | null): string | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(PHOTO_CACHE_KEY)
    if (!raw) return null
    const cached = JSON.parse(raw) as PhotoCache
    if (token && cached.token !== token) return null
    return cached.data
  } catch {
    return null
  }
}

export function writeCachedPhoto(data: string, token: string) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(PHOTO_CACHE_KEY, JSON.stringify({ data, token, timestamp: new Date().toISOString() }))
  } catch {
    // best effort
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export async function fetchAndCachePhoto(token: string): Promise<string | null> {
  try {
    const response = await fetch("/api/srm/photo", { headers: { "x-access-token": token } })
    if (!response.ok) return null
    const blob = await response.blob()
    const dataUrl = await blobToBase64(blob)
    writeCachedPhoto(dataUrl, token)
    return dataUrl
  } catch {
    return null
  }
}
