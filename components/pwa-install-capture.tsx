"use client"

import { useEffect } from "react"

// Capture `beforeinstallprompt` on every route so the install prompt
// can render on pages like `/login` as well.
export function PwaInstallCapture() {
  useEffect(() => {
    const handlePrompt = (e: Event) => {
      e.preventDefault()
      ;(window as any).__deferredPrompt = e
    }

    window.addEventListener("beforeinstallprompt", handlePrompt)
    return () => window.removeEventListener("beforeinstallprompt", handlePrompt)
  }, [])

  return null
}
