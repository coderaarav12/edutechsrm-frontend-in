"use client"

import { useState, useEffect, useCallback, type ReactNode } from "react"
import { readCachedPhoto, fetchAndCachePhoto } from "@/lib/photo-cache"

export function ProfileAvatar({ name, token, fallback }: { name?: string; token?: string | null; fallback: ReactNode }) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)

  const setFromCache = useCallback((dataUrl: string) => {
    fetch(dataUrl).then(r => r.blob()).then(blob => {
      setPhotoUrl(URL.createObjectURL(blob))
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!token) return

    const cached = readCachedPhoto(token)
    if (cached) { setFromCache(cached); return }

    let cancelled = false
    fetch("/api/srm/photo", { headers: { "x-access-token": token } })
      .then((r) => (r.ok ? r.blob() : Promise.reject()))
      .then(async (blob) => {
        if (!cancelled) {
          const url = URL.createObjectURL(blob)
          setPhotoUrl(url)
          const reader = new FileReader()
          reader.onloadend = () => {
            if (reader.result && typeof reader.result === "string") {
              try { localStorage.setItem("edutechsrm_photo_cache_v1", JSON.stringify({ data: reader.result, token, timestamp: new Date().toISOString() })) } catch {}
            }
          }
          reader.readAsDataURL(blob)
        }
      })
      .catch(() => {
        if (!cancelled) {
          const cached = readCachedPhoto(token)
          if (cached) setFromCache(cached)
        }
      })
    return () => { cancelled = true }
  }, [token, setFromCache])

  if (photoUrl) {
    return <img src={photoUrl} alt={name || "Profile"} className="w-full h-full object-cover" />
  }

  return <div className="w-full h-full flex items-center justify-center">{fallback}</div>
}
