"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"

const THEME_KEY = "edutechsrm_theme"
const THEME_EVENT = "edutechsrm:theme-updated"

export interface PresetBackground {
  id: string
  name: string
  css: string
  preview: string
  theme: "dark" | "poster"
}

export const PRESETS: PresetBackground[] = [
  { id: "default", name: "Default", css: "#09090b", preview: "#09090b", theme: "dark" },
  { id: "charcoal", name: "Charcoal", css: "#0c0c0f", preview: "#0c0c0f", theme: "dark" },
  { id: "slate", name: "Slate", css: "#111118", preview: "#111118", theme: "dark" },
  { id: "emerald-glow", name: "Emerald Glow", css: "radial-gradient(ellipse at 50% 0%, rgba(52,211,153,0.15), transparent 65%), #09090b", preview: "#09090b", theme: "dark" },
  { id: "sky-glow", name: "Sky Glow", css: "radial-gradient(ellipse at 50% 0%, rgba(56,189,248,0.12), transparent 65%), #09090b", preview: "#09090b", theme: "dark" },
  { id: "purple-glow", name: "Purple Glow", css: "radial-gradient(ellipse at 50% 0%, rgba(168,85,247,0.12), transparent 65%), #09090b", preview: "#09090b", theme: "dark" },
  { id: "amber-glow", name: "Amber Glow", css: "radial-gradient(ellipse at 50% 0%, rgba(251,191,36,0.12), transparent 65%), #09090b", preview: "#09090b", theme: "dark" },
  { id: "rose-glow", name: "Rose Glow", css: "radial-gradient(ellipse at 50% 0%, rgba(244,63,94,0.12), transparent 65%), #09090b", preview: "#09090b", theme: "dark" },
  { id: "dark-forest", name: "Dark Forest", css: "linear-gradient(180deg, #0a1a0f 0%, #09090b 50%, #09090b 100%)", preview: "#0a1a0f", theme: "dark" },
  { id: "deep-ocean", name: "Deep Ocean", css: "linear-gradient(180deg, #0a1628 0%, #09090b 50%, #09090b 100%)", preview: "#0a1628", theme: "dark" },
  { id: "midnight", name: "Midnight", css: "linear-gradient(180deg, #1a0a2e 0%, #09090b 50%, #09090b 100%)", preview: "#1a0a2e", theme: "dark" },
  { id: "warm-ember", name: "Warm Ember", css: "linear-gradient(180deg, #2e1a0a 0%, #09090b 50%, #09090b 100%)", preview: "#2e1a0a", theme: "dark" },
  { id: "dots", name: "Dots Pattern", css: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='rgba(255,255,255,0.03)'/%3E%3C/svg%3E\") #09090b", preview: "#09090b", theme: "dark" },
  { id: "grid", name: "Grid Pattern", css: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='rgba(255,255,255,0.02)' stroke-width='1'/%3E%3C/svg%3E\") #09090b", preview: "#09090b", theme: "dark" },
  { id: "poster-cardstock", name: "Ivory Cardstock", css: "#f7f5f0", preview: "#f7f5f0", theme: "poster" },
  { id: "poster-grid", name: "Drafting Grid", css: "linear-gradient(to right, rgba(17, 17, 17, 0.04) 1px, transparent 1px) 0 0 / 24px 24px, linear-gradient(to bottom, rgba(17, 17, 17, 0.04) 1px, transparent 1px) 0 0 / 24px 24px, #f7f5f0", preview: "#f7f5f0", theme: "poster" },
  { id: "poster-newsprint", name: "Tactile Newsprint", css: "#f4f1ea", preview: "#f4f1ea", theme: "poster" },
  { id: "poster-parchment", name: "Warm Parchment", css: "#fbf8f2", preview: "#fbf8f2", theme: "poster" },
  { id: "poster-dots", name: "Dot Matrix Paper", css: "radial-gradient(circle, rgba(17, 17, 17, 0.08) 1px, transparent 1px) 0 0 / 16px 16px, #f7f5f0", preview: "#f7f5f0", theme: "poster" },
  { id: "poster-manila", name: "Warm Manila", css: "#f5efe4", preview: "#f5efe4", theme: "poster" },
  { id: "poster-swiss", name: "Swiss Minimal", css: "#faf8f5", preview: "#faf8f5", theme: "poster" },
  { id: "poster-architect", name: "Architect Linen", css: "#eeece6", preview: "#eeece6", theme: "poster" },
  { id: "poster-graph", name: "Graph Paper", css: "linear-gradient(to right, rgba(17, 17, 17, 0.05) 1px, transparent 1px) 0 0 / 16px 16px, linear-gradient(to bottom, rgba(17, 17, 17, 0.05) 1px, transparent 1px) 0 0 / 16px 16px, #f7f5f0", preview: "#f7f5f0", theme: "poster" },
]

export type ThemeMode = "dark" | "poster" | "black" | "custom"

export interface CustomColors {
  pageBg: string
  cardBg: string
  textPrimary: string
  accent: string
}

export interface ThemeState {
  mode: ThemeMode
  presetId: string
  customImage: string | null
  customColors: CustomColors
}

const DEFAULT_CUSTOM: CustomColors = {
  pageBg: "#09090b",
  cardBg: "#18181b",
  textPrimary: "#f4f4f5",
  accent: "#34d399",
}

const DEFAULT_THEME: ThemeState = {
  mode: "poster",
  presetId: "poster-cardstock",
  customImage: null,
  customColors: DEFAULT_CUSTOM,
}

interface ThemeContextType {
  theme: ThemeState
  setMode: (mode: ThemeMode) => void
  setPreset: (id: string) => void
  setCustomImage: (dataUrl: string) => void
  setCustomColors: (colors: CustomColors) => void
  resetTheme: () => void
  currentBackgroundCss: string
}

function readTheme(): ThemeState {
  if (typeof window === "undefined") return DEFAULT_THEME
  try {
    const raw = localStorage.getItem(THEME_KEY) || localStorage.getItem("edutechsrm-theme")
    if (raw) {
      const parsed = JSON.parse(raw)
      // Migrate legacy 'light' mode to 'poster'
      if (parsed.mode === "light") {
        parsed.mode = "poster"
        if (!parsed.presetId || parsed.presetId === "default") {
          parsed.presetId = "poster-cardstock"
        }
      }
      return {
        ...DEFAULT_THEME,
        ...parsed,
        customColors: { ...DEFAULT_CUSTOM, ...(parsed.customColors || {}) },
      }
    }
    const landingMode = localStorage.getItem("edutechsrm-landing-mode") || localStorage.getItem("edutechsrm_landing_mode")
    if (landingMode === "night" || landingMode === "dark") {
      return {
        ...DEFAULT_THEME,
        mode: "dark",
        presetId: "default",
      }
    }
    return DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

function writeTheme(theme: ThemeState) {
  const landingMode = theme.mode === "poster" ? "poster" : "night"
  try {
    localStorage.setItem(THEME_KEY, JSON.stringify(theme))
    localStorage.setItem("edutechsrm-theme", JSON.stringify(theme))
    localStorage.setItem("edutechsrm-landing-mode", landingMode)
    localStorage.setItem("edutechsrm_landing_mode", landingMode)
  } catch {}
  window.dispatchEvent(new Event(THEME_EVENT))
}

function resolveBackgroundCss(theme: ThemeState): string {
  if (theme.customImage) {
    return `url(${JSON.stringify(theme.customImage)}) center/cover no-repeat fixed, var(--page-bg, #09090b)`
  }
  if (theme.mode === "custom") {
    return "var(--page-bg, #09090b)"
  }
  if (theme.mode === "poster" && (!theme.presetId || theme.presetId === "default")) {
    return "#f7f5f0"
  }
  const preset = PRESETS.find((p) => p.id === theme.presetId)
  if (preset) return preset.css
  return theme.mode === "poster" ? "#f7f5f0" : "#09090b"
}

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "")
  if (clean.length === 3) {
    return {
      r: Number.parseInt(clean[0] + clean[0], 16),
      g: Number.parseInt(clean[1] + clean[1], 16),
      b: Number.parseInt(clean[2] + clean[2], 16),
    }
  }
  return {
    r: Number.parseInt(clean.slice(0, 2), 16),
    g: Number.parseInt(clean.slice(2, 4), 16),
    b: Number.parseInt(clean.slice(4, 6), 16),
  }
}

function isLightColor(hex: string) {
  const { r, g, b } = hexToRgb(hex)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6
}

const ALL_THEME_PROPERTIES = [
  "--page-bg", "--card-bg", "--card-solid", "--elevated-bg", "--card-bg-hover",
  "--text-primary", "--text-secondary", "--text-muted", "--text-subtle", "--text-faint",
  "--accent", "--accent-bg", "--accent-border",
  "--border-color", "--border-medium",
  "--element-bg", "--element-bg-hover",
  "--selection-bg", "--selection-color",
  "--filter-group-bg", "--filter-group-border", "--filter-active-bg", "--filter-active-text", "--filter-inactive-text",
  "--input-bg", "--input-text", "--input-border",
  "--progress-track",
  "--color-zinc-950", "--color-zinc-900", "--color-zinc-800", "--color-zinc-700",
  "--color-zinc-600", "--color-zinc-500", "--color-zinc-400", "--color-zinc-300",
  "--color-zinc-200", "--color-zinc-100", "--color-zinc-50",
  "--color-background", "--color-foreground",
  "--color-card", "--color-card-foreground",
  "--color-popover", "--color-popover-foreground",
  "--color-secondary", "--color-secondary-foreground",
  "--color-muted-foreground", "--color-border", "--color-input",
  "--color-sidebar", "--color-sidebar-foreground", "--color-sidebar-accent",
  "--color-sidebar-accent-foreground", "--color-sidebar-border",
]

export function applyThemeGlobally(theme: ThemeState) {
  const html = document.documentElement
  const body = document.body
  if (!html || !body) return

  // Strictly skip overriding when on Admin console or when data-admin is set
  if (
    html.hasAttribute("data-admin") ||
    body.hasAttribute("data-admin") ||
    (typeof window !== "undefined" && window.location.pathname.startsWith("/admin"))
  ) {
    return
  }

  if (theme.mode === "custom") {
    const cc = theme.customColors
    html.style.setProperty("--page-bg", cc.pageBg)
    html.style.setProperty("--card-bg", `${cc.cardBg}99`)
    html.style.setProperty("--card-solid", cc.cardBg)
    html.style.setProperty("--text-primary", cc.textPrimary)
    html.style.setProperty("--accent", cc.accent)
    html.style.setProperty("--accent-bg", `${cc.accent}1a`)
    html.style.setProperty("--accent-border", `${cc.accent}33`)

    // Ensure native zinc scale is never polluted
    for (const prop of [
      "--color-zinc-950", "--color-zinc-900", "--color-zinc-800", "--color-zinc-700",
      "--color-zinc-600", "--color-zinc-500", "--color-zinc-400", "--color-zinc-300",
      "--color-zinc-200", "--color-zinc-100", "--color-zinc-50",
    ]) {
      html.style.removeProperty(prop)
    }

    if (isLightColor(cc.pageBg)) {
      html.style.setProperty("--card-bg", `${cc.cardBg}cc`)
      html.style.setProperty("--elevated-bg", `${cc.cardBg}fa`)
      html.style.setProperty("--text-secondary", "#18181b")
      html.style.setProperty("--text-muted", "#3f3f46")
      html.style.setProperty("--text-subtle", "#71717a")
      html.style.setProperty("--text-faint", "#a1a1aa")
      html.style.setProperty("--border-color", "rgba(0,0,0,0.06)")
      html.style.setProperty("--element-bg", "rgba(0,0,0,0.03)")
      html.style.setProperty("--element-bg-hover", "rgba(0,0,0,0.06)")
    } else {
      html.style.setProperty("--text-secondary", "#d4d4d8")
      html.style.setProperty("--text-muted", "#a1a1aa")
      html.style.setProperty("--text-subtle", "#71717a")
      html.style.setProperty("--text-faint", "#52525b")
      html.style.setProperty("--border-color", "rgba(255,255,255,0.05)")
      html.style.setProperty("--element-bg", "rgba(255,255,255,0.03)")
      html.style.setProperty("--element-bg-hover", "rgba(255,255,255,0.06)")
      html.style.setProperty("--elevated-bg", `${cc.cardBg}fa`)
    }
    html.style.setProperty("--card-bg-hover", `${cc.cardBg}cc`)
    html.style.setProperty("--selection-bg", `${cc.accent}47`)
    html.style.setProperty("--selection-color", cc.textPrimary)
    html.style.setProperty("--filter-group-bg", cc.cardBg)
    html.style.setProperty("--filter-active-bg", `${cc.cardBg}80`)
    html.style.setProperty("--input-bg", cc.pageBg)
    html.style.setProperty("--progress-track", cc.pageBg)
  } else if (theme.mode === "poster") {
    html.removeAttribute("data-theme")
    html.setAttribute("data-theme", "poster")
    body.removeAttribute("data-theme")
    body.setAttribute("data-theme", "poster")
    html.setAttribute("data-landing-mode", "poster")
    body.setAttribute("data-landing-mode", "poster")

    const activePreset = PRESETS.find(p => p.id === theme.presetId)
    const pageBg = activePreset?.css || "#f7f5f0"

    html.style.setProperty("--page-bg", pageBg)
    html.style.setProperty("--card-bg", "#ffffff")
    html.style.setProperty("--card-solid", "#ffffff")
    html.style.setProperty("--elevated-bg", "#ffffff")
    html.style.setProperty("--card-bg-hover", "#fcfbfa")
    html.style.setProperty("--text-primary", "#111111")
    html.style.setProperty("--text-secondary", "#27272a")
    html.style.setProperty("--text-muted", "#52525b")
    html.style.setProperty("--text-subtle", "#71717a")
    html.style.setProperty("--text-faint", "#a1a1aa")
    html.style.setProperty("--accent", "#10b981")
    html.style.setProperty("--accent-bg", "rgba(16, 185, 129, 0.1)")
    html.style.setProperty("--accent-border", "rgba(16, 185, 129, 0.25)")
    html.style.setProperty("--border-color", "rgba(17, 17, 17, 0.15)")
    html.style.setProperty("--border-medium", "#111111")
    html.style.setProperty("--element-bg", "rgba(17, 17, 17, 0.04)")
    html.style.setProperty("--element-bg-hover", "rgba(17, 17, 17, 0.08)")
    html.style.setProperty("--selection-bg", "rgba(16, 185, 129, 0.2)")
    html.style.setProperty("--selection-color", "#111111")
    html.style.setProperty("--filter-group-bg", "#ffffff")
    html.style.setProperty("--filter-active-bg", "#111111")
    html.style.setProperty("--filter-active-text", "#ffffff")
    html.style.setProperty("--filter-inactive-text", "#52525b")
    html.style.setProperty("--input-bg", "#ffffff")
    html.style.setProperty("--progress-track", "#e5e2da")
    html.style.setProperty("--color-background", "#f7f5f0")
    html.style.setProperty("--color-foreground", "#111111")

    // Clean up any previously set zinc scale overrides so Tailwind's native zinc palette stays intact
    for (const prop of [
      "--color-zinc-950", "--color-zinc-900", "--color-zinc-800", "--color-zinc-700",
      "--color-zinc-600", "--color-zinc-500", "--color-zinc-400", "--color-zinc-300",
      "--color-zinc-200", "--color-zinc-100", "--color-zinc-50",
    ]) {
      html.style.removeProperty(prop)
    }
  } else {
    // Dark mode (or black)
    html.removeAttribute("data-theme")
    html.setAttribute("data-theme", theme.mode)
    body.removeAttribute("data-theme")
    body.setAttribute("data-theme", theme.mode)
    html.setAttribute("data-landing-mode", "night")
    body.setAttribute("data-landing-mode", "night")

    // Remove ALL custom properties that poster or custom modes may have set
    for (const prop of ALL_THEME_PROPERTIES) {
      html.style.removeProperty(prop)
    }

    if (theme.presetId !== "default") {
      const preset = PRESETS.find(p => p.id === theme.presetId)
      if (preset) html.style.setProperty("--page-bg", preset.css)
    } else {
      html.style.removeProperty("--page-bg")
    }
  }

  if (theme.customImage) {
    body.style.background = `url(${JSON.stringify(theme.customImage)}) center / cover fixed`
  } else if (theme.mode === "poster") {
    const preset = PRESETS.find(p => p.id === theme.presetId)
    body.style.background = preset?.css || "#f7f5f0"
    body.style.backgroundColor = "#f7f5f0"
  } else if (theme.mode !== "custom" && theme.presetId !== "default") {
    const preset = PRESETS.find(p => p.id === theme.presetId)
    if (preset && (preset.css.includes("url(") || preset.css.includes("gradient"))) {
      body.style.background = preset.css
    } else {
      body.style.background = ""
      body.style.backgroundColor = ""
    }
  } else {
    body.style.background = ""
    body.style.backgroundColor = ""
  }
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeState>(DEFAULT_THEME)

  const sync = useCallback((next: ThemeState) => {
    setTheme(next)
    writeTheme(next)
    applyThemeGlobally(next)
  }, [])

  useEffect(() => {
    const saved = readTheme()
    setTheme(saved)
    applyThemeGlobally(saved)
    const handler = () => {
      const updated = readTheme()
      setTheme(updated)
      applyThemeGlobally(updated)
    }
    const onLandingModeChange = (e: Event) => {
      const customEvent = e as CustomEvent<any>
      const detail = customEvent.detail
      const modeName = typeof detail === "string" ? detail : detail?.mode
      if (modeName === "poster") {
        setTheme(prev => {
          if (prev.mode === "poster") return prev
          const next: ThemeState = { ...prev, mode: "poster", presetId: "poster-cardstock", customImage: null }
          writeTheme(next)
          applyThemeGlobally(next)
          return next
        })
      } else if (modeName === "night" || modeName === "dark") {
        setTheme(prev => {
          if (prev.mode === "dark") return prev
          const next: ThemeState = { ...prev, mode: "dark", presetId: "default", customImage: null }
          writeTheme(next)
          applyThemeGlobally(next)
          return next
        })
      }
    }
    window.addEventListener("storage", handler)
    window.addEventListener(THEME_EVENT, handler)
    window.addEventListener("landing-mode-change", onLandingModeChange)
    return () => {
      window.removeEventListener("storage", handler)
      window.removeEventListener(THEME_EVENT, handler)
      window.removeEventListener("landing-mode-change", onLandingModeChange)
    }
  }, [])

  const setMode = useCallback((mode: ThemeMode) => {
    const defaultPreset = mode === "poster" ? "poster-cardstock" : "default"
    const landingMode = mode === "poster" ? "poster" : "night"
    const next: ThemeState = { ...theme, mode, presetId: defaultPreset, customImage: null }
    sync(next)
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("landing-mode-change", { detail: { mode: landingMode } }))
    }
  }, [theme, sync])

  const setPreset = useCallback((id: string) => {
    sync({ ...theme, presetId: id, customImage: null })
  }, [theme, sync])

  const setCustomImage = useCallback((dataUrl: string) => {
    sync({ ...theme, customImage: dataUrl || null, presetId: dataUrl ? "default" : theme.presetId })
  }, [theme, sync])

  const setCustomColors = useCallback((customColors: CustomColors) => {
    sync({ ...theme, mode: "custom", customColors })
  }, [theme, sync])

  const resetTheme = useCallback(() => {
    sync(DEFAULT_THEME)
  }, [sync])

  const currentBackgroundCss = resolveBackgroundCss(theme)

  return (
    <ThemeContext.Provider value={{ theme, setMode, setPreset, setCustomImage, setCustomColors, resetTheme, currentBackgroundCss }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
  return ctx
}

export function useOptionalTheme() {
  return useContext(ThemeContext)
}

export function useIsPosterTheme(): boolean {
  const ctx = useContext(ThemeContext)
  const [isPoster, setIsPoster] = useState(false)

  useEffect(() => {
    const check = () => {
      if (ctx?.theme?.mode === "poster") return true
      if (typeof document !== "undefined") {
        const dt = document.documentElement.getAttribute("data-theme")
        const lm = document.documentElement.getAttribute("data-landing-mode")
        if (dt === "poster" || lm === "poster") return true
      }
      try {
        const raw = localStorage.getItem(THEME_KEY) || localStorage.getItem("edutechsrm_theme") || localStorage.getItem("edutechsrm-landing-mode")
        if (raw && raw.includes("poster")) return true
      } catch {}
      return false
    }

    setIsPoster(check())
    const handler = () => setIsPoster(check())
    window.addEventListener("storage", handler)
    window.addEventListener(THEME_EVENT, handler)
    window.addEventListener("landing-mode-change", handler)
    return () => {
      window.removeEventListener("storage", handler)
      window.removeEventListener(THEME_EVENT, handler)
      window.removeEventListener("landing-mode-change", handler)
    }
  }, [ctx?.theme?.mode])

  return isPoster
}


