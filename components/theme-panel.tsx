"use client"

import { useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Upload, Palette, Check, RotateCcw, Moon, Sun, Contrast, Sliders } from "lucide-react"
import { PRESETS, useTheme, type ThemeMode, type CustomColors } from "@/lib/theme-context"

interface ThemePanelProps {
  open: boolean
  onClose: () => void
}

const MODES: { id: ThemeMode; label: string; icon: typeof Moon }[] = [
  { id: "dark", label: "Dark", icon: Moon },
  { id: "light", label: "Light", icon: Sun },
  { id: "black", label: "Black", icon: Contrast },
  { id: "custom", label: "Custom", icon: Sliders },
]

const COLOR_SLOTS: { key: keyof CustomColors; label: string; desc: string }[] = [
  { key: "pageBg", label: "Background", desc: "Page background" },
  { key: "cardBg", label: "Card", desc: "Card & container" },
  { key: "textPrimary", label: "Text", desc: "Primary text" },
  { key: "accent", label: "Accent", desc: "Highlight color" },
]

export function ThemePanel({ open, onClose }: ThemePanelProps) {
  const { theme, setMode, setPreset, setCustomImage, setCustomColors, resetTheme } = useTheme()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setUploadError(null)
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image must be under 5MB")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCustomImage(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleColorChange = (key: keyof CustomColors, value: string) => {
    setCustomColors({ ...theme.customColors, [key]: value })
  }

  const isUsingPreset = theme.mode !== "custom" && !theme.customImage

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="relative w-full max-w-lg rounded-2xl border overflow-hidden"
            style={{
              background: "var(--elevated-bg, rgba(24,24,27,0.98))",
              borderColor: "var(--border-medium, rgba(255,255,255,0.08))",
              boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
            }}
          >
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border-color, rgba(255,255,255,0.05))" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--accent-bg, rgba(52,211,153,0.1))", border: "1px solid var(--accent-border, rgba(52,211,153,0.15))" }}>
                  <Palette className="w-4 h-4" style={{ color: "var(--accent-theme, #34d399)" }} />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Themes</p>
                  <p className="text-[10px]" style={{ color: "var(--text-subtle)" }}>Customize your look</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all" style={{ color: "var(--text-subtle)" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.background = "var(--element-bg-hover, rgba(255,255,255,0.05))" }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-subtle)"; e.currentTarget.style.background = "" }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: "75vh" }}>
              {/* Mode selector */}
              <div className="px-5 pt-5 pb-3">
                <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-subtle)" }}>Mode</p>
                <div className="grid grid-cols-4 gap-2">
                  {MODES.map((m) => {
                    const active = theme.mode === m.id
                    const Icon = m.icon
                    return (
                      <button
                        key={m.id}
                        onClick={() => setMode(m.id)}
                        className="flex flex-col items-center gap-1.5 rounded-xl py-3 px-2 transition-all"
                        style={{
                          background: active ? "var(--accent-bg, rgba(52,211,153,0.1))" : "var(--element-bg, rgba(255,255,255,0.03))",
                          border: active ? "1px solid var(--accent-border, rgba(52,211,153,0.2))" : "1px solid var(--border-color, rgba(255,255,255,0.05))",
                        }}
                      >
                        <Icon className="w-4 h-4" style={{ color: active ? "var(--accent-theme, #34d399)" : "var(--text-subtle)" }} />
                        <span className="text-[10px] font-bold" style={{ color: active ? "var(--accent-theme, #34d399)" : "var(--text-muted)" }}>{m.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Gallery presets */}
              {(theme.mode === "dark" || theme.mode === "light" || theme.mode === "black") && (
                <div className="px-5 pb-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-subtle)" }}>Gallery Backgrounds</p>
                  <div className="grid grid-cols-4 gap-2.5">
                    {PRESETS.filter(p => p.theme === theme.mode).map((preset) => {
                      const active = theme.presetId === preset.id && !theme.customImage
                      return (
                        <button
                          key={preset.id}
                          onClick={() => setPreset(preset.id)}
                          className="group relative rounded-xl overflow-hidden aspect-[4/3] transition-all"
                          style={{
                            outline: active ? "2px solid var(--accent-theme, #34d399)" : "1px solid var(--border-color, rgba(255,255,255,0.06))",
                            outlineOffset: active ? -2 : 0,
                          }}
                        >
                          <div className="absolute inset-0" style={{ background: preset.preview }} />
                          {active && (
                            <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/60 to-transparent">
                              <p className="text-[8px] font-semibold truncate leading-tight" style={{ color: "var(--text-muted)" }}>{preset.name}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Custom mode color pickers */}
              {theme.mode === "custom" && (
                <div className="px-5 pb-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-subtle)" }}>Custom Colors</p>
                  <div className="space-y-3">
                    {COLOR_SLOTS.map((slot) => (
                      <div key={slot.key} className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "var(--element-bg, rgba(255,255,255,0.03))", border: "1px solid var(--border-color, rgba(255,255,255,0.05))" }}>
                        <div className="relative shrink-0">
                          <input
                            type="color"
                            value={theme.customColors[slot.key]}
                            onChange={(e) => handleColorChange(slot.key, e.target.value)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div className="w-9 h-9 rounded-lg border-2" style={{ background: theme.customColors[slot.key], borderColor: "var(--border-medium, rgba(255,255,255,0.1))" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{slot.label}</p>
                          <p className="text-[9px]" style={{ color: "var(--text-subtle)" }}>{slot.desc}</p>
                        </div>
                        <span className="text-[10px] font-mono font-medium" style={{ color: "var(--text-subtle)" }}>{theme.customColors[slot.key]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Upload (always available) */}
              <div className="px-5 pb-5">
                <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-subtle)" }}>Upload Background</p>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-3 rounded-xl px-4 py-4 border-2 border-dashed transition-all"
                  style={{ borderColor: "var(--border-medium, rgba(255,255,255,0.08))", background: "color-mix(in srgb, var(--element-bg, rgba(255,255,255,0.02)), transparent 50%)" }}
                >
                  <Upload className="w-5 h-5" style={{ color: "var(--text-subtle)" }} />
                  <div className="text-left">
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Upload an image</p>
                    <p className="text-[10px]" style={{ color: "var(--text-faint)" }}>JPG, PNG, WebP &middot; Max 5MB</p>
                  </div>
                </button>
                {uploadError && <p className="mt-2 text-[11px] font-medium" style={{ color: "#f87171" }}>{uploadError}</p>}
                {theme.customImage && (
                  <div className="mt-3 flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "var(--element-bg, rgba(255,255,255,0.03))", border: "1px solid var(--border-color, rgba(255,255,255,0.05))" }}>
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                      <img src={theme.customImage} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>Custom background</p>
                      <p className="text-[10px]" style={{ color: "var(--text-subtle)" }}>Tap to replace</p>
                    </div>
                    <button onClick={() => setCustomImage("")} className="text-[10px] font-bold transition-colors shrink-0" style={{ color: "#f87171" }}
                      onMouseEnter={(e) => e.currentTarget.style.color = "#fca5a5"}
                      onMouseLeave={(e) => e.currentTarget.style.color = "#f87171"}>
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: "1px solid var(--border-color, rgba(255,255,255,0.05))" }}>
              <p className="text-[10px]" style={{ color: "var(--text-faint)" }}>Saved automatically</p>
              <button onClick={() => { resetTheme(); onClose() }} className="flex items-center gap-1.5 text-[10px] font-bold transition-colors" style={{ color: "var(--text-subtle)" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"}
                onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-subtle)"}>
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
