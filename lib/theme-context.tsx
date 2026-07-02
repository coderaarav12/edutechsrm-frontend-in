"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"

const THEME_KEY = "edutechsrm_theme"
const THEME_EVENT = "edutechsrm:theme-updated"

export interface PresetBackground {
  id: string
  name: string
  css: string
  preview: string
  theme: "dark" | "light"
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
  { id: "white", name: "White", css: "#ffffff", preview: "#ffffff", theme: "light" },
  { id: "off-white", name: "Off White", css: "#f8f8f6", preview: "#f8f8f6", theme: "light" },
  { id: "warm-white", name: "Warm White", css: "#f5f0eb", preview: "#f5f0eb", theme: "light" },
  { id: "cool-white", name: "Cool White", css: "#f0f4f8", preview: "#f0f4f8", theme: "light" },
  { id: "soft-ivory", name: "Soft Ivory", css: "#faf8f0", preview: "#faf8f0", theme: "light" },
  { id: "light-gray", name: "Light Gray", css: "#e8e8ea", preview: "#e8e8ea", theme: "light" },
  { id: "light-pearl", name: "Light Pearl", css: "#f0ece8", preview: "#f0ece8", theme: "light" },
  { id: "light-lavender", name: "Light Lavender", css: "linear-gradient(180deg, #f0ecf8 0%, #f8f6fa 100%)", preview: "#f0ecf8", theme: "light" },
  { id: "light-sky", name: "Light Sky", css: "linear-gradient(180deg, #e8f4fc 0%, #f4f8fa 100%)", preview: "#e8f4fc", theme: "light" },
  { id: "light-mint", name: "Light Mint", css: "linear-gradient(180deg, #eaf5ee 0%, #f4f8f5 100%)", preview: "#eaf5ee", theme: "light" },
  { id: "light-rose", name: "Light Rose", css: "linear-gradient(180deg, #fceef0 0%, #faf4f5 100%)", preview: "#fceef0", theme: "light" },
  { id: "light-amber", name: "Light Amber", css: "linear-gradient(180deg, #fcf4e8 0%, #faf6f0 100%)", preview: "#fcf4e8", theme: "light" },
]

export type ThemeMode = "dark" | "light" | "black" | "custom"

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
  mode: "dark",
  presetId: "default",
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
  const preset = PRESETS.find((p) => p.id === theme.presetId)
  if (preset) return preset.css
  return "#09090b"
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
      html.style.setProperty("--color-white", "#000000")
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
  } else {
    html.removeAttribute("data-theme")
    html.setAttribute("data-theme", theme.mode)
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
    html.style.removeProperty("--element-bg")
    html.style.removeProperty("--element-bg-hover")
    html.style.removeProperty("--card-bg-hover")
    html.style.removeProperty("--selection-bg")
    html.style.removeProperty("--selection-color")
    html.style.removeProperty("--filter-group-bg")
    html.style.removeProperty("--filter-active-bg")
    html.style.removeProperty("--input-bg")
    html.style.removeProperty("--progress-track")
    html.style.removeProperty("--color-white")
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
    if (theme.presetId !== "default") {
      const preset = PRESETS.find(p => p.id === theme.presetId)
      if (preset) html.style.setProperty("--page-bg", preset.css)
    } else {
      html.style.removeProperty("--page-bg")
    }
  }

  if (theme.customImage) {
    body.style.background = `url(${JSON.stringify(theme.customImage)}) center / cover fixed`
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
    sync({ ...theme, mode, presetId: "default", customImage: null })
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
