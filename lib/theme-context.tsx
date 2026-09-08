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
    const raw = localStorage.getItem(THEME_KEY)
    if (!raw) return DEFAULT_THEME
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
  } catch {
    return DEFAULT_THEME
  }
}

function writeTheme(theme: ThemeState) {
  localStorage.setItem(THEME_KEY, JSON.stringify(theme))
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
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null
}

function isLightColor(hex: string) {
  const rgb = hexToRgb(hex)
  if (!rgb) return false
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
  return luminance > 0.5
}

export function applyThemeGlobally(theme: ThemeState) {
  const html = document.documentElement
  const body = document.body
  if (!html || !body) return

  const modeAttr = theme.mode === "custom" ? "custom" : theme.mode
  html.setAttribute("data-theme", modeAttr)
  body.setAttribute("data-theme", modeAttr)

  if (theme.mode === "poster") {
    html.setAttribute("data-landing-mode", "poster")
    body.setAttribute("data-landing-mode", "poster")
    try {
      localStorage.setItem("edutechsrm-landing-mode", "poster")
      localStorage.setItem("edutechsrm_landing_mode", "poster")
    } catch {}
  } else if (theme.mode === "dark" || theme.mode === "black") {
    html.setAttribute("data-landing-mode", "night")
    body.setAttribute("data-landing-mode", "night")
    try {
      localStorage.setItem("edutechsrm-landing-mode", "night")
      localStorage.setItem("edutechsrm_landing_mode", "night")
    } catch {}
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

    if (isLightColor(cc.pageBg)) {
      html.style.setProperty("--color-zinc-950", "#fafafa")
      html.style.setProperty("--color-zinc-900", "#f4f4f5")
      html.style.setProperty("--color-zinc-800", "#e4e4e7")
      html.style.setProperty("--color-zinc-700", "#d4d4d8")
      html.style.setProperty("--color-zinc-600", "#a1a1aa")
      html.style.setProperty("--color-zinc-500", "#71717a")
      html.style.setProperty("--color-zinc-400", "#52525b")
      html.style.setProperty("--color-zinc-300", "#3f3f46")
      html.style.setProperty("--color-zinc-200", "#27272a")
      html.style.setProperty("--color-zinc-100", "#18181b")
      html.style.setProperty("--color-zinc-50", "#09090b")
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
    html.style.setProperty("--color-zinc-950", "#f7f5f0")
    html.style.setProperty("--color-zinc-900", "#ffffff")
    html.style.setProperty("--color-zinc-800", "#eae7e0")
    html.style.setProperty("--color-zinc-700", "#dad5cb")
    html.style.setProperty("--color-zinc-600", "#71717a")
    html.style.setProperty("--color-zinc-500", "#52525b")
    html.style.setProperty("--color-zinc-400", "#3f3f46")
    html.style.setProperty("--color-zinc-300", "#27272a")
    html.style.setProperty("--color-zinc-200", "#18181b")
    html.style.setProperty("--color-zinc-100", "#111111")
    html.style.setProperty("--color-zinc-50", "#000000")
    html.style.setProperty("--color-background", "#f7f5f0")
    html.style.setProperty("--color-foreground", "#111111")
  } else {
    html.removeAttribute("data-theme")
    html.setAttribute("data-theme", theme.mode)
    // Remove ALL custom properties that poster or custom modes may have set
    html.style.removeProperty("--card-bg")
    html.style.removeProperty("--card-solid")
    html.style.removeProperty("--text-primary")
    html.style.removeProperty("--accent")
    html.style.removeProperty("--accent-bg")
    html.style.removeProperty("--accent-border")
    html.style.removeProperty("--page-bg")
    html.style.removeProperty("--elevated-bg")
    html.style.removeProperty("--text-secondary")
    html.style.removeProperty("--text-muted")
    html.style.removeProperty("--text-subtle")
    html.style.removeProperty("--text-faint")
    html.style.removeProperty("--border-color")
    html.style.removeProperty("--border-medium")
    html.style.removeProperty("--element-bg")
    html.style.removeProperty("--element-bg-hover")
    html.style.removeProperty("--card-bg-hover")
    html.style.removeProperty("--selection-bg")
    html.style.removeProperty("--selection-color")
    html.style.removeProperty("--filter-group-bg")
    html.style.removeProperty("--filter-active-bg")
    html.style.removeProperty("--filter-active-text")
    html.style.removeProperty("--filter-inactive-text")
    html.style.removeProperty("--input-bg")
    html.style.removeProperty("--progress-track")
    html.style.removeProperty("--color-zinc-950")
    html.style.removeProperty("--color-zinc-900")
    html.style.removeProperty("--color-zinc-800")
    html.style.removeProperty("--color-zinc-700")
    html.style.removeProperty("--color-zinc-600")
    html.style.removeProperty("--color-zinc-500")
    html.style.removeProperty("--color-zinc-400")
    html.style.removeProperty("--color-zinc-300")
    html.style.removeProperty("--color-zinc-200")
    html.style.removeProperty("--color-zinc-100")
    html.style.removeProperty("--color-zinc-50")
    html.style.removeProperty("--color-background")
    html.style.removeProperty("--color-foreground")
    html.style.removeProperty("--input-text")
    html.style.removeProperty("--input-border")
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
  } else if (theme.mode !== "custom" && theme.presetId !== "default") {
    const preset = PRESETS.find(p => p.id === theme.presetId)
    if (preset && (preset.css.includes("url(") || preset.css.includes("gradient"))) {
      body.style.background = preset.css
    } else {
      body.style.background = ""
    }
  } else {
    body.style.background = ""
  }
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeState>(DEFAULT_THEME)

  useEffect(() => {
    const saved = readTheme()
    setTheme(saved)
    applyThemeGlobally(saved)
    const handler = () => {
      const updated = readTheme()
      setTheme(updated)
      applyThemeGlobally(updated)
    }
    window.addEventListener("storage", handler)
    window.addEventListener(THEME_EVENT, handler)
    return () => {
      window.removeEventListener("storage", handler)
      window.removeEventListener(THEME_EVENT, handler)
    }
  }, [])

  const sync = useCallback((next: ThemeState) => {
    setTheme(next)
    writeTheme(next)
    applyThemeGlobally(next)
  }, [])

  const setMode = useCallback((mode: ThemeMode) => {
    const defaultPreset = mode === "poster" ? "poster-cardstock" : "default"
    sync({ ...theme, mode, presetId: defaultPreset, customImage: null })
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("landing-mode-change", { detail: mode === "poster" ? "poster" : "night" }))
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
