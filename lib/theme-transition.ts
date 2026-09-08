"use client"

interface ThemeTransitionOptions {
  nextMode: "poster" | "night"
  coords?: { x: number; y: number }
  applyTheme: () => void
}

/**
 * Executes a hardware-accelerated circular wave transition across the screen
 * originating from the user's touch or click coordinates.
 *
 * Uses the native document.startViewTransition API driven by CSS @keyframes themeCircleReveal.
 * Gracefully falls back to instant/smooth transition on unsupported or reduced-motion browsers.
 */
export function performThemeTransition({
  coords,
  applyTheme,
}: ThemeTransitionOptions) {
  if (typeof window === "undefined") {
    applyTheme()
    return
  }

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const doc = document as any

  if (prefersReduced || !doc.startViewTransition || typeof doc.startViewTransition !== "function") {
    applyTheme()
    return
  }

  const vw = window.innerWidth
  const vh = window.innerHeight

  // Use provided touch/click coordinates or default to center/bottom
  const x = coords?.x && coords.x >= 0 && coords.x <= vw ? coords.x : vw / 2
  const y = coords?.y && coords.y >= 0 && coords.y <= vh ? coords.y : vh > 600 ? vh - 60 : vh / 2

  document.documentElement.style.setProperty("--theme-x", `${Math.round(x)}px`)
  document.documentElement.style.setProperty("--theme-y", `${Math.round(y)}px`)

  try {
    doc.startViewTransition(() => {
      applyTheme()
    })
  } catch {
    applyTheme()
  }
}
