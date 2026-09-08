"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Bot, Check, ChevronDown, Contrast, ExternalLink, Heart, Megaphone,
  Moon, Palette, RotateCcw, Sliders, Sparkles, Upload, X, MessageSquareText,
} from "lucide-react"
import { PRESETS, useTheme, type ThemeMode, type CustomColors } from "@/lib/theme-context"
import { SupportModal } from "./support-modal"
import { useSupport } from "@/lib/use-support"
import { QrCode } from "./qr-code"

type TabType = "dashboard" | "timetable" | "attendance" | "courses" | "marks" | "calendar" | "gradex" | "about" | "planner" | "notes" | "updates" | "feedback" | "settings" | "ai"

const MODES: { id: ThemeMode; label: string; desc: string; icon: typeof Moon; badge?: string }[] = [
  { id: "dark", label: "Dark", desc: "Cyberpunk Obsidian", icon: Moon, badge: "Default" },
  { id: "poster", label: "Poster", desc: "Swiss Brutalist Paper", icon: Sparkles, badge: "Tactile" },
  { id: "black", label: "Black", desc: "Pure 0-nit OLED", icon: Contrast, badge: "OLED" },
  { id: "custom", label: "Custom", desc: "Studio Palette", icon: Sliders, badge: "Custom" },
]

const COLOR_SLOTS: { key: keyof CustomColors; label: string; desc: string }[] = [
  { key: "pageBg", label: "Background", desc: "Page background" },
  { key: "cardBg", label: "Card", desc: "Card & container" },
  { key: "textPrimary", label: "Text", desc: "Primary text" },
  { key: "accent", label: "Accent", desc: "Highlight color" },
]

interface SettingsSectionProps {
  onNavigate?: (tab: TabType) => void
}

export function SettingsSection({ onNavigate }: SettingsSectionProps) {
  const { theme, setMode, setPreset, setCustomImage, setCustomColors, resetTheme } = useTheme()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { isSupportOpen, handleSupportClick, closeSupport } = useSupport()
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [themeOpen, setThemeOpen] = useState(false)

  const themeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      if (localStorage.getItem("edutechsrm_open_theme") === "1") {
        localStorage.removeItem("edutechsrm_open_theme")
        setThemeOpen(true)
        setTimeout(() => themeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 300)
      }
    } catch {}
  }, [])



  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setUploadError(null)
    if (!file) return
    if (!file.type.startsWith("image/")) { setUploadError("Please select an image file"); return }
    if (file.size > 5 * 1024 * 1024) { setUploadError("Image must be under 5MB"); return }
    const reader = new FileReader()
    reader.onload = () => { if (typeof reader.result === "string") setCustomImage(reader.result) }
    reader.readAsDataURL(file)
  }

  const handleColorChange = (key: keyof CustomColors, value: string) => {
    setCustomColors({ ...theme.customColors, [key]: value })
  }

  return (
    <div className="min-h-full pt-[3.75rem] pb-20 px-3 sm:px-4 lg:px-8 lg:pb-8 w-full">
      {/* Header - matching feedback page style */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-1">Customize</h2>
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight font-display">App Settings</h1>
          <p className="text-[11px] mt-1 text-zinc-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Personalize your app experience and preferences
          </p>
        </div>
      </motion.div>

      {/* Quick actions row */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {/* Feedback card */}
        <button onClick={() => onNavigate?.("feedback")}
          className="group relative rounded-2xl border overflow-hidden p-5 bg-zinc-900/40 hover:bg-zinc-900/60 transition-all"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" 
            style={{
              background: "linear-gradient(135deg, rgba(52,211,153,0.05), rgba(16,185,129,0.03))",
            }} />
          <div className="relative flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-500/10" style={{ border: "1px solid rgba(59,130,246,0.2)" }}>
              <MessageSquareText style={{ width: 18, height: 18, color: "#3b82f6" }} />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-bold text-zinc-100">Send Feedback</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">Help us improve the app</p>
            </div>
            <ExternalLink style={{ width: 14, height: 14, color: "rgba(255,255,255,0.4)" }} className="shrink-0" />
          </div>
        </button>

        {/* Theme stats card */}
        <div className="rounded-2xl border overflow-hidden p-5 bg-zinc-900/40"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-500/10" style={{ border: "1px solid rgba(52,211,153,0.2)" }}>
              <Palette style={{ width: 18, height: 18, color: "#34d399" }} />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-bold text-zinc-100">Theme Settings</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">Current: <span className="text-emerald-400 capitalize">{theme.mode}</span></p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sections container */}
      <div className="space-y-6">
        {/* ── Theme (collapsible) ── */}
        <motion.div ref={themeRef} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border overflow-hidden surface-card"
          style={{ background: "var(--card-bg, rgba(24,24,27,0.4))", borderColor: "var(--border-color, rgba(255,255,255,0.08))" }}
        >
          <button onClick={() => setThemeOpen(o => !o)}
            className="w-full px-5 py-4 flex items-center gap-3 text-left transition-all hover:bg-zinc-900/30"
            style={{ borderBottom: themeOpen ? "1px solid var(--border-color, rgba(255,255,255,0.08))" : "none" }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "var(--accent-bg, rgba(52,211,153,0.1))", border: "1px solid var(--accent-border, rgba(52,211,153,0.2))" }}>
              <Palette style={{ width: 18, height: 18, color: "var(--accent-theme, #34d399)" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold" style={{ color: "var(--text-primary, #f4f4f5)" }}>Theme & Visuals</p>
              <p className="text-[11px] text-zinc-500">Mode, brutalist paper textures, background gradients & custom palette</p>
            </div>
            <motion.div animate={{ rotate: themeOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
              <ChevronDown style={{ width: 18, height: 18, color: "var(--text-subtle, rgba(255,255,255,0.5))" }} />
            </motion.div>
          </button>

          <AnimatePresence initial={false}>
            {themeOpen && (
              <motion.div key="theme-content" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                <div className="p-5 space-y-6" style={{ borderTop: "1px solid var(--border-color, rgba(255,255,255,0.08))" }}>
                  {/* Mode selector */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Visual Aesthetic Mode</p>
                      <span className="text-[10px] font-mono text-zinc-500">4 distinct styles</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {MODES.map((m) => {
                        const active = theme.mode === m.id
                        const Icon = m.icon
                        return (
                          <button key={m.id} onClick={() => setMode(m.id)}
                            className="flex flex-col items-center justify-center text-center gap-1.5 rounded-xl py-3 px-2 transition-all group relative cursor-pointer"
                            style={{
                              background: active ? "var(--accent-bg, rgba(52,211,153,0.1))" : "var(--element-bg, rgba(255,255,255,0.02))",
                              border: active ? "1.5px solid var(--accent-theme, #34d399)" : "1px solid var(--border-color, rgba(255,255,255,0.08))",
                            }}
                          >
                            {m.badge && (
                              <span className="absolute top-1.5 right-1.5 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full"
                                style={{
                                  background: active ? "var(--accent-theme, #34d399)" : "rgba(255,255,255,0.06)",
                                  color: active ? (theme.mode === "poster" ? "#ffffff" : "#09090b") : "var(--text-subtle, #71717a)",
                                }}>
                                {m.badge}
                              </span>
                            )}
                            <Icon style={{ width: 18, height: 18, color: active ? "var(--accent-theme, #34d399)" : "var(--text-subtle, rgba(255,255,255,0.5))" }} />
                            <div>
                              <p className="text-xs font-bold leading-tight" style={{ color: active ? "var(--accent-theme, #34d399)" : "var(--text-primary, #f4f4f5)" }}>{m.label}</p>
                              <p className="text-[9px] text-zinc-500 leading-tight mt-0.5">{m.desc}</p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Presets gallery */}
                  {(theme.mode === "dark" || theme.mode === "poster" || theme.mode === "black") && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                          {theme.mode === "poster" ? "Poster Paper & Cardstock Presets" : "Background Presets"}
                        </p>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {theme.mode === "poster" ? "Tactile Swiss brutalist textures" : "Curated ambient gradients"}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                        {PRESETS.filter(p => p.theme === (theme.mode === "poster" ? "poster" : "dark")).map((preset) => {
                          const active = theme.presetId === preset.id && !theme.customImage
                          return (
                            <button key={preset.id} onClick={() => setPreset(preset.id)}
                              className="group relative rounded-xl overflow-hidden aspect-[4/3] transition-all cursor-pointer"
                              style={{
                                outline: active ? "2px solid var(--accent-theme, #34d399)" : "1px solid var(--border-color, rgba(255,255,255,0.08))",
                                outlineOffset: active ? -2 : 0,
                              }}
                            >
                              <div className="absolute inset-0" style={{ background: preset.preview }} />
                              {active && (
                                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                                  style={{ background: "var(--accent-theme, #34d399)" }}>
                                  <Check className="w-2.5 h-2.5 text-black" />
                                </div>
                              )}
                              <div className="absolute bottom-0 left-0 right-0 p-1.5"
                                style={{
                                  background: theme.mode === "poster" 
                                    ? "rgba(247, 245, 240, 0.88)" 
                                    : "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                                  borderTop: theme.mode === "poster" ? "1px solid rgba(17,17,17,0.08)" : "none",
                                }}>
                                <p className="text-[8px] font-semibold truncate leading-tight"
                                  style={{ color: theme.mode === "poster" ? "#111111" : "#e4e4e7" }}>
                                  {preset.name}
                                </p>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Custom mode colors */}
                  {theme.mode === "custom" && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Custom Color Palette</p>
                        <span className="text-[10px] text-zinc-500 font-mono">Fine-tune UI tokens</span>
                      </div>
                      <div className="space-y-3">
                        {COLOR_SLOTS.map((slot) => (
                          <div key={slot.key} className="flex items-center gap-3 rounded-xl px-4 py-3" 
                            style={{ background: "var(--element-bg, rgba(255,255,255,0.02))", border: "1px solid var(--border-color, rgba(255,255,255,0.08))" }}>
                            <div className="relative shrink-0">
                              <input type="color" value={theme.customColors[slot.key]}
                                onChange={(e) => handleColorChange(slot.key, e.target.value)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                              <div className="w-9 h-9 rounded-lg border-2" style={{ background: theme.customColors[slot.key], borderColor: "var(--border-medium, rgba(255,255,255,0.15))" }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold" style={{ color: "var(--text-primary, #f4f4f5)" }}>{slot.label}</p>
                              <p className="text-[9px] text-zinc-500">{slot.desc}</p>
                            </div>
                            <span className="text-[10px] font-mono font-medium text-zinc-500">{theme.customColors[slot.key]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Dashboard Wallpaper</p>
                      <span className="text-[10px] text-zinc-500 font-mono">Custom background layer</span>
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-3 rounded-xl px-4 py-4 border-2 border-dashed transition-all cursor-pointer hover:border-emerald-500/40"
                      style={{ 
                        borderColor: "var(--border-color, rgba(255,255,255,0.1))", 
                        background: "var(--element-bg, rgba(255,255,255,0.02))" 
                      }}>
                      <Upload style={{ width: 18, height: 18, color: "var(--text-subtle, rgba(255,255,255,0.5))" }} />
                      <div className="text-left">
                        <p className="text-sm font-semibold" style={{ color: "var(--text-primary, #f4f4f5)" }}>Upload Custom Wallpaper</p>
                        <p className="text-[10px] text-zinc-500">JPG, PNG, WebP • Max 5MB (Fills entire viewport)</p>
                      </div>
                    </button>
                    {uploadError && <p className="mt-2 text-[11px] font-medium text-red-400">{uploadError}</p>}
                    {theme.customImage && (
                      <div className="mt-3 flex items-center gap-3 rounded-xl px-4 py-3" 
                        style={{ background: "var(--element-bg, rgba(255,255,255,0.02))", border: "1px solid var(--border-color, rgba(255,255,255,0.08))" }}>
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border" style={{ borderColor: "var(--border-color, rgba(255,255,255,0.1))" }}>
                          <img src={theme.customImage} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary, #f4f4f5)" }}>Custom wallpaper active</p>
                          <p className="text-[10px] text-zinc-500">Click to change or replace file</p>
                        </div>
                        <button onClick={() => setCustomImage("")}
                          className="text-[10px] font-bold transition-colors shrink-0 text-red-400 hover:text-red-300">
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Reset */}
                  <div className="flex items-center justify-between pt-4" style={{ borderTop: "1px solid var(--border-color, rgba(255,255,255,0.08))" }}>
                    <p className="text-[11px] text-zinc-500">Reset all theme customizations back to default</p>
                    <button onClick={resetTheme}
                      className="flex items-center gap-1.5 text-[10px] font-bold transition-colors text-zinc-500 hover:text-emerald-400 cursor-pointer"
                    >
                      <RotateCcw style={{ width: 12, height: 12 }} />
                      Reset to Default
                    </button>
                  </div>
        </div>
      </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        {/* ── AI Assistant ── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
          className="rounded-2xl border overflow-hidden"
          style={{ background: "rgba(24,24,27,0.4)", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <button onClick={() => { sessionStorage.setItem("ai_context", "settings"); onNavigate?.("ai") }}
            className="w-full px-5 py-4 flex items-center gap-3 text-left transition-all hover:bg-zinc-900/30"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-violet-500/10" style={{ border: "1px solid rgba(167,139,250,0.2)" }}>
              <Bot style={{ width: 18, height: 18, color: "#a78bfa" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-zinc-100">AI Assistant</p>
              <p className="text-[11px] text-zinc-500">Ask anything about your academics</p>
            </div>
            <motion.div className="shrink-0">
              <div className="flex items-center gap-1 text-[10px] font-bold text-violet-400">
                Open
                <ExternalLink style={{ width: 12, height: 12 }} />
              </div>
            </motion.div>
          </button>
        </motion.div>
        {/* ── About Developer ── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl border overflow-hidden"
          style={{ background: "rgba(24,24,27,0.4)", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-sm font-bold text-zinc-100">About the Developer</p>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <img src="/aarav_goel.jpg" alt="Aarav Goel" className="w-10 h-10 rounded-xl shrink-0 object-cover" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-base font-bold text-zinc-100">Aarav Goel</p>
                  <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-lg text-amber-500 bg-amber-500/10" style={{ border: "1px solid rgba(251,191,36,0.2)" }}>Developer</span>
                </div>
                <p className="text-[11px] text-zinc-600">CSE AIML • 2nd Year • SRM IST</p>
              </div>
            </div>
            <p className="text-xs text-zinc-400 mb-4">Built edutechsrm to make student life easier. Found a bug or have a suggestion? Reach out!</p>
            <div className="flex items-center gap-2 flex-wrap">
              <a href="mailto:admin@edutechsrm.in"
                className="flex items-center gap-1.5 text-[10px] font-bold rounded-lg px-3 py-2 transition-all bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400" style={{ border: "1px solid rgba(52,211,153,0.2)" }}>
                <ExternalLink style={{ width: 12, height: 12 }} />
                Email
              </a>
              <a href="https://github.com/coderaarav12" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[10px] font-bold rounded-lg px-3 py-2 transition-all bg-zinc-900/50 hover:bg-zinc-900/80 text-zinc-400" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                GitHub
              </a>
              <button onClick={handleSupportClick}
                className="flex items-center gap-1.5 text-[10px] font-bold rounded-lg px-3 py-2 transition-all bg-pink-500/10 hover:bg-pink-500/20 text-pink-400" style={{ border: "1px solid rgba(244,114,182,0.2)" }}>
                <Heart style={{ width: 12, height: 12 }} />
                Support
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Repository ── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          className="rounded-2xl border overflow-hidden"
          style={{ background: "rgba(24,24,27,0.4)", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-sm font-bold text-zinc-100">Repository</p>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-zinc-400"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-zinc-100">edutechsrm-frontend-in</p>
                <p className="text-[11px] text-zinc-500">Public — MIT License</p>
              </div>
            </div>
            <p className="text-xs text-zinc-400 mb-4">
              This project is open source. Contribute, report issues, or explore the codebase.
            </p>
            <a href="https://github.com/coderaarav12/edutechsrm-frontend-in" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-[10px] font-bold rounded-lg px-3 py-2.5 transition-all bg-zinc-900/50 hover:bg-zinc-900/80 text-zinc-400 w-full" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
              <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              View on GitHub
            </a>
          </div>
        </motion.div>

        {/* ── Quick Links ── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl border overflow-hidden"
          style={{ background: "rgba(24,24,27,0.4)", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-sm font-bold text-zinc-100">Quick Links</p>
          </div>
          <div className="p-2 space-y-1">
            <button onClick={() => onNavigate?.("updates")}
              className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all hover:bg-zinc-900/30 text-zinc-400 w-full text-left"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-amber-500/10" style={{ border: "1px solid rgba(251,191,36,0.1)" }}>
                <Megaphone style={{ width: 14, height: 14, color: "#fbbf24" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-100">Updates</p>
                <p className="text-[10px] text-zinc-600">Latest news, releases & announcements</p>
              </div>
            </button>
            <a href="https://instagram.com/edutechsrm" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all hover:bg-zinc-900/30 text-zinc-400"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-pink-500/10" style={{ border: "1px solid rgba(236,72,153,0.2)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-pink-500"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-100">Instagram</p>
                <p className="text-[10px] text-zinc-600">Follow for updates</p>
              </div>
              <ExternalLink style={{ width: 12, height: 12, color: "rgba(255,255,255,0.3)" }} />
            </a>
            <a href="https://linkedin.com/company/edutechsrm" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all hover:bg-zinc-900/30 text-zinc-400"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-blue-500/10" style={{ border: "1px solid rgba(59,130,246,0.2)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-100">LinkedIn</p>
                <p className="text-[10px] text-zinc-600">Connect with us</p>
              </div>
              <ExternalLink style={{ width: 12, height: 12, color: "rgba(255,255,255,0.3)" }} />
            </a>
          </div>
        </motion.div>

        {/* ── QR Code ── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
          className="rounded-2xl border overflow-hidden"
          style={{ background: "rgba(24,24,27,0.4)", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-sm font-bold text-zinc-100">Share edutechsrm</p>
          </div>
          <div className="flex flex-col items-center py-5 px-5">
            <QrCode />
            <p className="text-[10px] text-zinc-500 mt-3 text-center">Scan to open edutechsrm on your phone</p>
          </div>
        </motion.div>

        {/* ── Support ── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}
          className="rounded-2xl border overflow-hidden"
          style={{ background: "rgba(24,24,27,0.4)", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <button onClick={handleSupportClick} className="w-full p-5 flex items-center gap-4 text-left transition-all hover:bg-white/[0.02]">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)" }}>
              <Heart className="w-4 h-4" style={{ color: "#a78bfa" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold" style={{ color: "#a78bfa" }}>Support edutechsrm</p>
              <p className="text-[10px] mt-0.5 text-zinc-500">Help cover domain & Cloudflare costs</p>
            </div>
          </button>
        </motion.div>
      </div>

      <SupportModal isOpen={isSupportOpen} onClose={closeSupport} />
    </div>
  )
}
