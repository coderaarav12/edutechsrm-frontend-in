"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Bot, Check, ChevronDown, Contrast, ExternalLink, Github, Heart, Megaphone,
  Moon, Palette, RotateCcw, Sliders, Sparkles, Upload, X, MessageSquareText,
} from "lucide-react"
import { PRESETS, useTheme, useIsPosterTheme, type ThemeMode, type CustomColors } from "@/lib/theme-context"
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
  const isPoster = useIsPosterTheme()
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
          <h2 className={`font-bold text-[10px] uppercase tracking-widest mb-1 ${isPoster ? "text-zinc-600 font-mono" : "text-zinc-500"}`}>Customize</h2>
          <h1 className={`text-3xl font-bold tracking-tight font-display ${isPoster ? "text-[#111111]" : "text-zinc-100"}`}>App Settings</h1>
          <p className={`text-[11px] mt-1 flex items-center gap-1.5 ${isPoster ? "text-zinc-600 font-medium" : "text-zinc-500"}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Personalize your app experience and preferences
          </p>
        </div>
      </motion.div>

      {/* Quick actions row */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {/* Feedback card */}
        <button onClick={() => onNavigate?.("feedback")}
          className={`group relative rounded-2xl border overflow-hidden p-5 transition-all text-left cursor-pointer ${
            isPoster
              ? "bg-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111] hover:bg-[#f4f1ea] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_#111111]"
              : "bg-zinc-900/40 hover:bg-zinc-900/60 border-white/10"
          }`}
          style={{ borderColor: isPoster ? undefined : "rgba(255,255,255,0.08)" }}>
          <div className="relative flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isPoster ? "bg-blue-50 border-2 border-[#111111]" : "bg-blue-500/10 border border-blue-500/20"
            }`}>
              <MessageSquareText style={{ width: 18, height: 18, color: isPoster ? "#2563eb" : "#3b82f6" }} />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className={`text-sm font-bold ${isPoster ? "text-[#111111]" : "text-zinc-100"}`}>Send Feedback</p>
              <p className={`text-[11px] mt-0.5 ${isPoster ? "text-zinc-600 font-medium" : "text-zinc-500"}`}>Help us improve the app</p>
            </div>
            <ExternalLink style={{ width: 14, height: 14, color: isPoster ? "#111111" : "rgba(255,255,255,0.4)" }} className="shrink-0 mt-0.5" />
          </div>
        </button>

        {/* Theme stats card */}
        <div className={`rounded-2xl border overflow-hidden p-5 ${
          isPoster
            ? "bg-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111]"
            : "bg-zinc-900/40 border-white/10"
        }`}
        style={{ borderColor: isPoster ? undefined : "rgba(255,255,255,0.08)" }}>
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isPoster ? "bg-emerald-50 border-2 border-[#111111]" : "bg-emerald-500/10 border border-emerald-500/20"
            }`}>
              <Palette style={{ width: 18, height: 18, color: isPoster ? "#059669" : "#34d399" }} />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className={`text-sm font-bold ${isPoster ? "text-[#111111]" : "text-zinc-100"}`}>Theme Settings</p>
              <p className={`text-[11px] mt-0.5 ${isPoster ? "text-zinc-600 font-medium" : "text-zinc-500"}`}>
                Current: <span className={`capitalize font-bold ${isPoster ? "text-emerald-700 font-mono" : "text-emerald-400"}`}>{theme.mode}</span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sections container */}
      <div className="space-y-6">
        {/* ── Theme (collapsible) ── */}
        <motion.div ref={themeRef} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className={`rounded-2xl border overflow-hidden ${
            isPoster
              ? "bg-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111]"
              : "surface-card border-white/10"
          }`}
          style={{
            background: isPoster ? "#ffffff" : "var(--card-bg, rgba(24,24,27,0.4))",
            borderColor: isPoster ? "#111111" : "var(--border-color, rgba(255,255,255,0.08))",
          }}
        >
          <button onClick={() => setThemeOpen(o => !o)}
            className={`w-full px-5 py-4 flex items-center gap-3 text-left transition-all cursor-pointer ${
              isPoster ? "hover:bg-[#f4f1ea]" : "hover:bg-zinc-900/30"
            }`}
            style={{
              borderBottom: themeOpen
                ? isPoster
                  ? "2px solid #111111"
                  : "1px solid var(--border-color, rgba(255,255,255,0.08))"
                : "none"
            }}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isPoster ? "bg-emerald-50 border-2 border-[#111111]" : ""
            }`}
              style={{
                background: isPoster ? undefined : "var(--accent-bg, rgba(52,211,153,0.1))",
                border: isPoster ? undefined : "1px solid var(--accent-border, rgba(52,211,153,0.2))"
              }}>
              <Palette style={{ width: 18, height: 18, color: isPoster ? "#059669" : "var(--accent-theme, #34d399)" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold ${isPoster ? "text-[#111111]" : ""}`} style={{ color: isPoster ? "#111111" : "var(--text-primary, #f4f4f5)" }}>Theme & Visuals</p>
              <p className={`text-[11px] ${isPoster ? "text-zinc-600 font-medium" : "text-zinc-500"}`}>Mode, brutalist paper textures, background gradients & custom palette</p>
            </div>
            <motion.div animate={{ rotate: themeOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
              <ChevronDown style={{ width: 18, height: 18, color: isPoster ? "#111111" : "var(--text-subtle, rgba(255,255,255,0.5))" }} />
            </motion.div>
          </button>

          <AnimatePresence initial={false}>
            {themeOpen && (
              <motion.div key="theme-content" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                <div className={`p-5 space-y-6 ${isPoster ? "bg-zinc-50/40" : ""}`}
                  style={{ borderTop: isPoster ? "none" : "1px solid var(--border-color, rgba(255,255,255,0.08))" }}>
                  {/* Mode selector */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${isPoster ? "text-zinc-700 font-mono" : "text-zinc-500"}`}>Visual Aesthetic Mode</p>
                      <span className={`text-[10px] font-mono ${isPoster ? "text-zinc-600 font-bold" : "text-zinc-500"}`}>4 distinct styles</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {MODES.map((m) => {
                        const active = theme.mode === m.id
                        const Icon = m.icon
                        return (
                          <button key={m.id} onClick={() => setMode(m.id)}
                            className={`flex flex-col items-center justify-center text-center gap-1.5 rounded-xl py-3 px-2 transition-all group relative cursor-pointer ${
                              isPoster
                                ? active
                                  ? "bg-[#111111] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111]"
                                  : "bg-white text-zinc-800 border-2 border-[#111111]/30 hover:border-[#111111]"
                                : ""
                            }`}
                            style={{
                              background: isPoster ? undefined : active ? "var(--accent-bg, rgba(52,211,153,0.1))" : "var(--element-bg, rgba(255,255,255,0.02))",
                              border: isPoster ? undefined : active ? "1.5px solid var(--accent-theme, #34d399)" : "1px solid var(--border-color, rgba(255,255,255,0.08))",
                            }}
                          >
                            {m.badge && (
                              <span className="absolute top-1.5 right-1.5 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full"
                                style={{
                                  background: isPoster
                                    ? active ? "#ffffff" : "rgba(17,17,17,0.08)"
                                    : active ? "var(--accent-theme, #34d399)" : "rgba(255,255,255,0.06)",
                                  color: isPoster
                                    ? active ? "#111111" : "#4b5563"
                                    : active ? (theme.mode === "poster" ? "#ffffff" : "#09090b") : "var(--text-subtle, #71717a)",
                                }}>
                                {m.badge}
                              </span>
                            )}
                            <Icon style={{
                              width: 18,
                              height: 18,
                              color: isPoster
                                ? active ? "#ffffff" : "#111111"
                                : active ? "var(--accent-theme, #34d399)" : "var(--text-subtle, rgba(255,255,255,0.5))"
                            }} />
                            <div>
                              <p className="text-xs font-bold leading-tight" style={{
                                color: isPoster
                                  ? active ? "#ffffff" : "#111111"
                                  : active ? "var(--accent-theme, #34d399)" : "var(--text-primary, #f4f4f5)"
                              }}>{m.label}</p>
                              <p className={`text-[9px] leading-tight mt-0.5 ${
                                isPoster
                                  ? active ? "text-zinc-300" : "text-zinc-600"
                                  : "text-zinc-500"
                              }`}>{m.desc}</p>
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
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${isPoster ? "text-zinc-700 font-mono" : "text-zinc-500"}`}>
                          {theme.mode === "poster" ? "Poster Paper & Cardstock Presets" : "Background Presets"}
                        </p>
                        <span className={`text-[10px] font-mono ${isPoster ? "text-zinc-600 font-bold" : "text-zinc-500"}`}>
                          {theme.mode === "poster" ? "Tactile Swiss brutalist textures" : "Curated ambient gradients"}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                        {PRESETS.filter(p => p.theme === (theme.mode === "poster" ? "poster" : "dark")).map((preset) => {
                          const active = theme.presetId === preset.id && !theme.customImage
                          return (
                            <button key={preset.id} onClick={() => setPreset(preset.id)}
                              className={`group relative rounded-xl overflow-hidden aspect-[4/3] transition-all cursor-pointer ${
                                isPoster ? "border-2 border-[#111111]" : ""
                              }`}
                              style={{
                                outline: active
                                  ? isPoster ? "3px solid #111111" : "2px solid var(--accent-theme, #34d399)"
                                  : isPoster ? undefined : "1px solid var(--border-color, rgba(255,255,255,0.08))",
                                outlineOffset: active ? -2 : 0,
                                boxShadow: isPoster && active ? "2px 2px 0px #111111" : undefined,
                              }}
                            >
                              <div className="absolute inset-0" style={{ background: preset.preview }} />
                              {active && (
                                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                                  style={{ background: isPoster ? "#111111" : "var(--accent-theme, #34d399)" }}>
                                  <Check className="w-2.5 h-2.5 text-white" />
                                </div>
                              )}
                              <div className="absolute bottom-0 left-0 right-0 p-1.5"
                                style={{
                                  background: theme.mode === "poster" 
                                    ? "rgba(247, 245, 240, 0.95)" 
                                    : "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                                  borderTop: theme.mode === "poster" ? "1px solid rgba(17,17,17,0.15)" : "none",
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
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${isPoster ? "text-zinc-700 font-mono" : "text-zinc-500"}`}>Custom Color Palette</p>
                        <span className={`text-[10px] font-mono ${isPoster ? "text-zinc-600 font-bold" : "text-zinc-500"}`}>Fine-tune UI tokens</span>
                      </div>
                      <div className="space-y-3">
                        {COLOR_SLOTS.map((slot) => (
                          <div key={slot.key} className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
                            isPoster ? "bg-white border-2 border-[#111111]/30" : ""
                          }`} 
                            style={{
                              background: isPoster ? undefined : "var(--element-bg, rgba(255,255,255,0.02))",
                              border: isPoster ? undefined : "1px solid var(--border-color, rgba(255,255,255,0.08))"
                            }}>
                            <div className="relative shrink-0">
                              <input type="color" value={theme.customColors[slot.key]}
                                onChange={(e) => handleColorChange(slot.key, e.target.value)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                              <div className="w-9 h-9 rounded-lg border-2" style={{ background: theme.customColors[slot.key], borderColor: isPoster ? "#111111" : "var(--border-medium, rgba(255,255,255,0.15))" }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold" style={{ color: isPoster ? "#111111" : "var(--text-primary, #f4f4f5)" }}>{slot.label}</p>
                              <p className={`text-[9px] ${isPoster ? "text-zinc-600" : "text-zinc-500"}`}>{slot.desc}</p>
                            </div>
                            <span className={`text-[10px] font-mono font-medium ${isPoster ? "text-zinc-700" : "text-zinc-500"}`}>{theme.customColors[slot.key]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${isPoster ? "text-zinc-700 font-mono" : "text-zinc-500"}`}>Dashboard Wallpaper</p>
                      <span className={`text-[10px] font-mono ${isPoster ? "text-zinc-600 font-bold" : "text-zinc-500"}`}>Custom background layer</span>
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()}
                      className={`w-full flex items-center justify-center gap-3 rounded-xl px-4 py-4 border-2 border-dashed transition-all cursor-pointer ${
                        isPoster
                          ? "border-[#111111]/30 bg-white hover:border-[#111111] hover:bg-[#f4f1ea]"
                          : "border-white/10 bg-white/[0.02] hover:border-emerald-500/40"
                      }`}
                      style={{ 
                        borderColor: isPoster ? undefined : "var(--border-color, rgba(255,255,255,0.1))", 
                        background: isPoster ? undefined : "var(--element-bg, rgba(255,255,255,0.02))" 
                      }}>
                      <Upload style={{ width: 18, height: 18, color: isPoster ? "#111111" : "var(--text-subtle, rgba(255,255,255,0.5))" }} />
                      <div className="text-left">
                        <p className="text-sm font-semibold" style={{ color: isPoster ? "#111111" : "var(--text-primary, #f4f4f5)" }}>Upload Custom Wallpaper</p>
                        <p className={`text-[10px] ${isPoster ? "text-zinc-600 font-medium" : "text-zinc-500"}`}>JPG, PNG, WebP • Max 5MB (Fills entire viewport)</p>
                      </div>
                    </button>
                    {uploadError && <p className="mt-2 text-[11px] font-medium text-red-500">{uploadError}</p>}
                    {theme.customImage && (
                      <div className={`mt-3 flex items-center gap-3 rounded-xl px-4 py-3 ${
                        isPoster ? "bg-white border-2 border-[#111111]/30" : ""
                      }`} 
                        style={{ background: isPoster ? undefined : "var(--element-bg, rgba(255,255,255,0.02))", border: isPoster ? undefined : "1px solid var(--border-color, rgba(255,255,255,0.08))" }}>
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border" style={{ borderColor: isPoster ? "#111111" : "var(--border-color, rgba(255,255,255,0.1))" }}>
                          <img src={theme.customImage} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate" style={{ color: isPoster ? "#111111" : "var(--text-primary, #f4f4f5)" }}>Custom wallpaper active</p>
                          <p className={`text-[10px] ${isPoster ? "text-zinc-600" : "text-zinc-500"}`}>Click to change or replace file</p>
                        </div>
                        <button onClick={() => setCustomImage("")}
                          className="text-[10px] font-bold transition-colors shrink-0 text-red-500 hover:text-red-600 cursor-pointer">
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Reset */}
                  <div className={`flex items-center justify-between pt-4 ${
                    isPoster ? "border-t border-[#111111]/15" : ""
                  }`} style={{ borderTop: isPoster ? undefined : "1px solid var(--border-color, rgba(255,255,255,0.08))" }}>
                    <p className={`text-[11px] ${isPoster ? "text-zinc-600 font-medium" : "text-zinc-500"}`}>Reset all theme customizations back to default</p>
                    <button onClick={resetTheme}
                      className={`flex items-center gap-1.5 text-[10px] font-bold transition-colors cursor-pointer ${
                        isPoster ? "text-zinc-700 hover:text-[#111111]" : "text-zinc-500 hover:text-emerald-400"
                      }`}
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
          className={`rounded-2xl border overflow-hidden ${
            isPoster
              ? "bg-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111]"
              : "border-white/10"
          }`}
          style={{
            background: isPoster ? "#ffffff" : "rgba(24,24,27,0.4)",
            borderColor: isPoster ? "#111111" : "rgba(255,255,255,0.08)"
          }}
        >
          <button onClick={() => { sessionStorage.setItem("ai_context", "settings"); onNavigate?.("ai") }}
            className={`w-full px-5 py-4 flex items-center gap-3 text-left transition-all cursor-pointer ${
              isPoster ? "hover:bg-[#f4f1ea]" : "hover:bg-zinc-900/30"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isPoster ? "bg-violet-50 border-2 border-[#111111]" : "bg-violet-500/10"
            }`} style={{ border: isPoster ? undefined : "1px solid rgba(167,139,250,0.2)" }}>
              <Bot style={{ width: 18, height: 18, color: isPoster ? "#7c3aed" : "#a78bfa" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold ${isPoster ? "text-[#111111]" : "text-zinc-100"}`}>AI Assistant</p>
              <p className={`text-[11px] ${isPoster ? "text-zinc-600 font-medium" : "text-zinc-500"}`}>Ask anything about your academics</p>
            </div>
            <motion.div className="shrink-0">
              <div className={`flex items-center gap-1 text-[10px] font-bold ${isPoster ? "text-violet-700" : "text-violet-400"}`}>
                Open
                <ExternalLink style={{ width: 12, height: 12 }} />
              </div>
            </motion.div>
          </button>
        </motion.div>
        {/* ── About Developer ── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className={`rounded-2xl border overflow-hidden ${
            isPoster
              ? "bg-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111]"
              : "border-white/10"
          }`}
          style={{
            background: isPoster ? "#ffffff" : "rgba(24,24,27,0.4)",
            borderColor: isPoster ? "#111111" : "rgba(255,255,255,0.08)"
          }}
        >
          <div className={`px-5 py-4 ${isPoster ? "border-b-2 border-[#111111] bg-[#faf8f4]" : ""}`}
            style={{ borderBottom: isPoster ? undefined : "1px solid rgba(255,255,255,0.08)" }}>
            <p className={`text-sm font-bold ${isPoster ? "text-[#111111]" : "text-zinc-100"}`}>About the Developer</p>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <img src="/aarav_goel.jpg" alt="Aarav Goel" className={`w-10 h-10 rounded-xl shrink-0 object-cover ${
                isPoster ? "border-2 border-[#111111]" : ""
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-base font-bold ${isPoster ? "text-[#111111]" : "text-zinc-100"}`}>Aarav Goel</p>
                  <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-lg ${
                    isPoster
                      ? "text-amber-900 bg-amber-100 border border-amber-400 font-bold"
                      : "text-amber-500 bg-amber-500/10"
                  }`} style={{ border: isPoster ? undefined : "1px solid rgba(251,191,36,0.2)" }}>Developer</span>
                </div>
                <p className={`text-[11px] ${isPoster ? "text-zinc-600 font-medium" : "text-zinc-500"}`}>CSE AIML • 2nd Year • SRM IST</p>
              </div>
            </div>
            <p className={`text-xs mb-4 ${isPoster ? "text-zinc-700 font-medium" : "text-zinc-400"}`}>
              Built edutechsrm to make student life easier. Found a bug or have a suggestion? Reach out!
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <a href="mailto:admin@edutechsrm.in"
                className={`flex items-center gap-1.5 text-[10px] font-bold rounded-lg px-3 py-2 transition-all cursor-pointer ${
                  isPoster
                    ? "bg-emerald-50 text-emerald-800 border-2 border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-emerald-100 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                    : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                }`}>
                <ExternalLink style={{ width: 12, height: 12 }} />
                Email
              </a>
              <a href="https://github.com/coderaarav12" target="_blank" rel="noopener noreferrer"
                className={`flex items-center gap-1.5 text-[10px] font-bold rounded-lg px-3 py-2 transition-all cursor-pointer ${
                  isPoster
                    ? "bg-white text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-[#f4f1ea] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                    : "bg-zinc-900/50 hover:bg-zinc-900/80 text-zinc-400 border border-white/10"
                }`}>
                <Github className={`w-3.5 h-3.5 ${isPoster ? "text-[#111111]" : ""}`} />
                GitHub
              </a>
              <button onClick={handleSupportClick}
                className={`flex items-center gap-1.5 text-[10px] font-bold rounded-lg px-3 py-2 transition-all cursor-pointer ${
                  isPoster
                    ? "bg-pink-50 text-pink-700 border-2 border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-pink-100 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                    : "bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/20"
                }`}>
                <Heart style={{ width: 12, height: 12 }} />
                Support
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Repository ── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          className={`rounded-2xl border overflow-hidden ${
            isPoster
              ? "bg-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111]"
              : "border-white/10"
          }`}
          style={{
            background: isPoster ? "#ffffff" : "rgba(24,24,27,0.4)",
            borderColor: isPoster ? "#111111" : "rgba(255,255,255,0.08)"
          }}
        >
          <div className={`px-5 py-4 ${isPoster ? "border-b-2 border-[#111111] bg-[#faf8f4]" : ""}`}
            style={{ borderBottom: isPoster ? undefined : "1px solid rgba(255,255,255,0.08)" }}>
            <p className={`text-sm font-bold ${isPoster ? "text-[#111111]" : "text-zinc-100"}`}>Repository</p>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isPoster ? "bg-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111]" : "bg-white/[0.06] border border-white/10"
              }`}>
                <Github className={`w-5 h-5 ${isPoster ? "text-[#111111]" : "text-zinc-400"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-base font-bold ${isPoster ? "text-[#111111]" : "text-zinc-100"}`}>edutechsrm-frontend-in</p>
                <p className={`text-[11px] ${isPoster ? "text-zinc-600 font-mono" : "text-zinc-500"}`}>Public — MIT License</p>
              </div>
            </div>
            <p className={`text-xs mb-4 ${isPoster ? "text-zinc-700 font-medium" : "text-zinc-400"}`}>
              This project is open source. Contribute, report issues, or explore the codebase.
            </p>
            <a href="https://github.com/coderaarav12/edutechsrm-frontend-in" target="_blank" rel="noopener noreferrer"
              className={`flex items-center justify-center gap-2 text-xs font-bold rounded-xl px-4 py-2.5 transition-all w-full cursor-pointer ${
                isPoster
                  ? "bg-[#111111] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-[#27272a] hover:text-white active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                  : "bg-zinc-900/50 hover:bg-zinc-900/80 text-zinc-300 border border-white/10"
              }`}>
              <Github className={`w-3.5 h-3.5 ${isPoster ? "text-white" : ""}`} />
              View on GitHub
            </a>
          </div>
        </motion.div>

        {/* ── Quick Links ── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className={`rounded-2xl border overflow-hidden ${
            isPoster
              ? "bg-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111]"
              : "border-white/10"
          }`}
          style={{
            background: isPoster ? "#ffffff" : "rgba(24,24,27,0.4)",
            borderColor: isPoster ? "#111111" : "rgba(255,255,255,0.08)"
          }}
        >
          <div className={`px-5 py-4 ${isPoster ? "border-b-2 border-[#111111] bg-[#faf8f4]" : ""}`}
            style={{ borderBottom: isPoster ? undefined : "1px solid rgba(255,255,255,0.08)" }}>
            <p className={`text-sm font-bold ${isPoster ? "text-[#111111]" : "text-zinc-100"}`}>Quick Links</p>
          </div>
          <div className="p-2 space-y-1">
            <button onClick={() => onNavigate?.("updates")}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all w-full text-left cursor-pointer ${
                isPoster ? "hover:bg-[#f4f1ea] text-zinc-800" : "hover:bg-zinc-900/30 text-zinc-400"
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isPoster ? "bg-amber-50 border-2 border-[#111111] shadow-[1px_1px_0px_#111111]" : "bg-amber-500/10 border border-amber-500/20"
              }`}>
                <Megaphone style={{ width: 14, height: 14, color: isPoster ? "#d97706" : "#fbbf24" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${isPoster ? "text-[#111111]" : "text-zinc-100"}`}>Updates</p>
                <p className={`text-[10px] ${isPoster ? "text-zinc-600 font-medium" : "text-zinc-600"}`}>Latest news, releases & announcements</p>
              </div>
            </button>
            <a href="https://instagram.com/edutechsrm" target="_blank" rel="noopener noreferrer"
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all cursor-pointer ${
                isPoster ? "hover:bg-[#f4f1ea] text-zinc-800" : "hover:bg-zinc-900/30 text-zinc-400"
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isPoster ? "bg-pink-50 border-2 border-[#111111] shadow-[1px_1px_0px_#111111]" : "bg-pink-500/10 border border-pink-500/20"
              }`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={isPoster ? "text-pink-600" : "text-pink-500"}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${isPoster ? "text-[#111111]" : "text-zinc-100"}`}>Instagram</p>
                <p className={`text-[10px] ${isPoster ? "text-zinc-600 font-medium" : "text-zinc-600"}`}>Follow for updates</p>
              </div>
              <ExternalLink style={{ width: 12, height: 12, color: isPoster ? "#111111" : "rgba(255,255,255,0.3)" }} />
            </a>
            <a href="https://linkedin.com/company/edutechsrm" target="_blank" rel="noopener noreferrer"
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all cursor-pointer ${
                isPoster ? "hover:bg-[#f4f1ea] text-zinc-800" : "hover:bg-zinc-900/30 text-zinc-400"
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isPoster ? "bg-blue-50 border-2 border-[#111111] shadow-[1px_1px_0px_#111111]" : "bg-blue-500/10 border border-blue-500/20"
              }`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={isPoster ? "text-blue-600" : "text-blue-500"}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${isPoster ? "text-[#111111]" : "text-zinc-100"}`}>LinkedIn</p>
                <p className={`text-[10px] ${isPoster ? "text-zinc-600 font-medium" : "text-zinc-600"}`}>Connect with us</p>
              </div>
              <ExternalLink style={{ width: 12, height: 12, color: isPoster ? "#111111" : "rgba(255,255,255,0.3)" }} />
            </a>
          </div>
        </motion.div>

        {/* ── QR Code ── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
          className={`rounded-2xl border overflow-hidden ${
            isPoster
              ? "bg-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111]"
              : "border-white/10"
          }`}
          style={{
            background: isPoster ? "#ffffff" : "rgba(24,24,27,0.4)",
            borderColor: isPoster ? "#111111" : "rgba(255,255,255,0.08)"
          }}
        >
          <div className={`px-5 py-4 ${isPoster ? "border-b-2 border-[#111111] bg-[#faf8f4]" : ""}`}
            style={{ borderBottom: isPoster ? undefined : "1px solid rgba(255,255,255,0.08)" }}>
            <p className={`text-sm font-bold ${isPoster ? "text-[#111111]" : "text-zinc-100"}`}>Share edutechsrm</p>
          </div>
          <div className="flex flex-col items-center py-5 px-5">
            <div className={isPoster ? "p-3 bg-white rounded-xl border-2 border-[#111111] shadow-[2px_2px_0px_#111111]" : ""}>
              <QrCode />
            </div>
            <p className={`text-[10px] mt-3 text-center ${isPoster ? "text-zinc-700 font-medium" : "text-zinc-500"}`}>
              Scan to open edutechsrm on your phone
            </p>
          </div>
        </motion.div>

        {/* ── Support ── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}
          className={`rounded-2xl border overflow-hidden ${
            isPoster
              ? "bg-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111]"
              : "border-white/10"
          }`}
          style={{
            background: isPoster ? "#ffffff" : "rgba(24,24,27,0.4)",
            borderColor: isPoster ? "#111111" : "rgba(255,255,255,0.08)"
          }}
        >
          <button onClick={handleSupportClick} className={`w-full p-5 flex items-center gap-4 text-left transition-all cursor-pointer ${
            isPoster ? "hover:bg-pink-50/40" : "hover:bg-white/[0.02]"
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isPoster ? "bg-pink-50 border-2 border-[#111111]" : "bg-purple-500/10 border border-purple-500/20"
            }`} style={{ background: isPoster ? undefined : "rgba(167,139,250,0.1)", border: isPoster ? undefined : "1px solid rgba(167,139,250,0.2)" }}>
              <Heart className="w-4 h-4" style={{ color: isPoster ? "#db2777" : "#a78bfa" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold ${isPoster ? "text-[#111111]" : ""}`} style={{ color: isPoster ? "#111111" : "#a78bfa" }}>Support edutechsrm</p>
              <p className={`text-[10px] mt-0.5 ${isPoster ? "text-zinc-600 font-medium" : "text-zinc-500"}`}>Help cover domain & Cloudflare costs</p>
            </div>
          </button>
        </motion.div>
      </div>

      <SupportModal isOpen={isSupportOpen} onClose={closeSupport} />
    </div>
  )
}
