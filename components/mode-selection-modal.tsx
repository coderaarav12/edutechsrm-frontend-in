"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Moon, Check, X, ArrowRight } from "lucide-react"

interface ModeSelectionModalProps {
  isOpen: boolean
  currentMode: "poster" | "night"
  onSelectMode: (mode: "poster" | "night", coords?: { x: number; y: number }) => void
  onConfirm: () => void
  onClose: () => void
}

export function ModeSelectionModal({
  isOpen,
  currentMode,
  onSelectMode,
  onConfirm,
  onClose,
}: ModeSelectionModalProps) {
  const isPoster = currentMode === "poster"

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9990] flex items-center justify-center p-3.5 sm:p-6 overflow-y-auto select-none">
          {/* Subtle translucent backdrop so user can see live website change underneath */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/45 backdrop-blur-[6px] transition-colors"
          />

          {/* Modal Container */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="theme-modal-title"
            data-mode-modal="true"
            initial={{ opacity: 0, scale: 0.93, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className={`relative w-full max-w-[540px] rounded-3xl p-5 sm:p-7 z-10 transition-all duration-300 ${
              isPoster
                ? "bg-[#f7f5f0] text-[#111111] border-[2.5px] border-[#111111] shadow-[7px_7px_0px_#111111]"
                : "bg-[#0b1017] text-white border border-white/15 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),0_0_30px_rgba(52,211,153,0.12)]"
            }`}
          >
            {/* Top Close Button */}
            <button
              onClick={onClose}
              className={`absolute top-4 right-4 sm:top-5 sm:right-5 h-8 w-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                isPoster
                  ? "bg-black/5 hover:bg-black/10 text-[#111111]"
                  : "bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
              }`}
              aria-label="Close theme selection"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header Badge */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest font-bold ${
                  isPoster
                    ? "bg-transparent text-[#111111] border-[1.5px] border-[#111111]"
                    : "bg-emerald-400/10 text-emerald-400 border border-emerald-400/25"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Experience Mode
              </span>
            </div>

            {/* Title */}
            <h2
              id="theme-modal-title"
              className={`text-xl sm:text-2xl font-black font-display tracking-tight leading-tight ${
                isPoster ? "text-[#111111]" : "text-white"
              }`}
            >
              Choose your reading vibe.
            </h2>

            <p
              className={`mt-1 text-xs sm:text-sm leading-relaxed ${
                isPoster ? "text-zinc-700" : "text-zinc-400"
              }`}
            >
              Do you prefer tactile <strong className={isPoster ? "text-[#111111]" : "text-white"}>Paper Mode</strong> or sleek <strong className={isPoster ? "text-[#111111]" : "text-white"}>Dark Mode</strong>? Tap either mode below to preview it live right now.
            </p>

            {/* Side-by-Side Interactive Mode Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 mt-4 sm:mt-5">
              {/* Paper / Poster Mode Option */}
              <button
                type="button"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  onSelectMode("poster", {
                    x: Math.round(rect.left + rect.width / 2),
                    y: Math.round(rect.top + rect.height / 2),
                  })
                }}
                className={`relative flex flex-col text-left p-3.5 sm:p-4 rounded-2xl transition-all cursor-pointer select-none ${
                  isPoster
                    ? "bg-[#fffdf8] border-[2.5px] border-[#111111] shadow-[4px_4px_0px_#111111] -translate-y-0.5"
                    : "bg-[#f7f5f0]/10 hover:bg-[#f7f5f0]/20 border border-white/10 opacity-70 hover:opacity-100"
                }`}
              >
                {/* Visual miniature mockup */}
                <div className="w-full h-20 rounded-xl bg-[#f7f5f0] border-2 border-[#111111] p-2.5 flex flex-col justify-between overflow-hidden shadow-xs relative">
                  {/* Miniature tape */}
                  <div className="absolute -top-1.5 left-6 w-10 h-2.5 bg-amber-400/30 border border-black/30 rounded-xs rotate-[-3deg]" />
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-mono font-bold text-[#111111] bg-white px-1 py-0.5 rounded border border-[#111111]">DO 4</span>
                    <span className="text-[8px] font-mono font-bold text-rose-600">74.2%</span>
                  </div>
                  <div className="font-display font-black text-xs text-[#111111] leading-none">
                    COLLEGE IS <span className="font-serif italic text-rose-600">CHAOTIC.</span>
                  </div>
                  <div className="text-[7.5px] font-mono text-zinc-600 flex items-center justify-between">
                    <span>Ivory Cardstock</span>
                    <span className="font-bold text-emerald-700">Tactile ✓</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className={`h-4 w-4 ${isPoster ? "text-amber-600" : "text-amber-400"}`} />
                    <span className={`font-bold text-xs sm:text-sm ${isPoster ? "text-[#111111]" : "text-white"}`}>
                      Paper Mode
                    </span>
                  </div>
                  {isPoster && (
                    <span className="inline-flex items-center gap-1 text-[9.5px] font-mono font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded-full">
                      <Check className="h-3 w-3 stroke-[3]" /> Active
                    </span>
                  )}
                </div>

                <p className={`text-[11px] leading-tight mt-1 ${isPoster ? "text-zinc-600" : "text-zinc-400"}`}>
                  Warm ivory cardstock, ink-black text &amp; brutalist poster aesthetics.
                </p>
              </button>

              {/* Dark / Night Mode Option */}
              <button
                type="button"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  onSelectMode("night", {
                    x: Math.round(rect.left + rect.width / 2),
                    y: Math.round(rect.top + rect.height / 2),
                  })
                }}
                className={`relative flex flex-col text-left p-3.5 sm:p-4 rounded-2xl transition-all cursor-pointer select-none ${
                  !isPoster
                    ? "bg-[#05080e] border-[2px] border-emerald-400/80 shadow-[0_0_20px_rgba(52,211,153,0.22)] -translate-y-0.5"
                    : "bg-black/5 hover:bg-black/10 border border-[#111111]/20 opacity-70 hover:opacity-100"
                }`}
              >
                {/* Visual miniature mockup */}
                <div className="w-full h-20 rounded-xl bg-[#080c13] border border-white/15 p-2.5 flex flex-col justify-between overflow-hidden shadow-xs relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-mono font-bold text-emerald-400 bg-emerald-500/15 px-1 py-0.5 rounded border border-emerald-500/30">DO 4</span>
                    <span className="text-[8px] font-mono font-bold text-rose-400">74.2%</span>
                  </div>
                  <div className="font-display font-black text-xs text-white leading-none">
                    COLLEGE IS <span className="font-serif italic text-rose-400">CHAOTIC.</span>
                  </div>
                  <div className="text-[7.5px] font-mono text-zinc-400 flex items-center justify-between">
                    <span>Obsidian Night</span>
                    <span className="font-bold text-emerald-400">Low-Glare ✓</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Moon className={`h-4 w-4 ${!isPoster ? "text-emerald-400" : "text-sky-600"}`} />
                    <span className={`font-bold text-xs sm:text-sm ${isPoster ? "text-[#111111]" : "text-white"}`}>
                      Dark Mode
                    </span>
                  </div>
                  {!isPoster && (
                    <span className="inline-flex items-center gap-1 text-[9.5px] font-mono font-black text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 px-1.5 py-0.5 rounded-full">
                      <Check className="h-3 w-3 stroke-[3]" /> Active
                    </span>
                  )}
                </div>

                <p className={`text-[11px] leading-tight mt-1 ${isPoster ? "text-zinc-600" : "text-zinc-400"}`}>
                  Deep space obsidian, glowing neon accents &amp; comfortable contrast.
                </p>
              </button>
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 sm:mt-6 pt-3.5 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <span className={`text-[11px] font-mono leading-tight ${isPoster ? "text-zinc-600" : "text-zinc-400"}`}>
                Switch anytime via the bottom right button.
              </span>

              <button
                type="button"
                onClick={onConfirm}
                className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  isPoster
                    ? "bg-[#111111] text-[#f7f5f0] hover:bg-zinc-800 border-2 border-[#111111] shadow-[3px_3px_0px_#8b7355] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                    : "bg-gradient-to-r from-emerald-400 to-teal-400 text-zinc-950 hover:brightness-110 shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                }`}
              >
                <span>Continue with {isPoster ? "Paper Mode" : "Dark Mode"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
