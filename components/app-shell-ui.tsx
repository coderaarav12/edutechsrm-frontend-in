"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAdminControl } from "@/lib/admin-control"
import { useOptionalTheme } from "@/lib/theme-context"
import { ShieldCheck, AlertTriangle } from "lucide-react"

// ── Signing in loader ────────────────────────────────────────────────────────
const SIGNING_IN_MESSAGES = [
  "Connecting to SRM Academia",
  "Pulling your attendance and timetable",
  "Loading marks and course data",
  "Setting up your workspace",
]

function useIsPosterTheme() {
  const themeContext = useOptionalTheme()
  const [isPoster, setIsPoster] = useState(false)

  useEffect(() => {
    const check = () => {
      const mode = themeContext?.theme?.mode
      if (mode === "poster") return true
      if (typeof document !== "undefined") {
        const dt = document.documentElement.getAttribute("data-theme")
        const lm = document.documentElement.getAttribute("data-landing-mode")
        if (dt === "poster" || lm === "poster") return true
      }
      try {
        const stored = localStorage.getItem("edutechsrm_theme") || localStorage.getItem("edutechsrm-landing-mode")
        if (stored && stored.includes("poster")) return true
      } catch {}
      return false
    }

    setIsPoster(check())
    const handler = () => setIsPoster(check())
    window.addEventListener("storage", handler)
    window.addEventListener("edutechsrm:theme-updated", handler)
    window.addEventListener("landing-mode-change", handler)
    return () => {
      window.removeEventListener("storage", handler)
      window.removeEventListener("edutechsrm:theme-updated", handler)
      window.removeEventListener("landing-mode-change", handler)
    }
  }, [themeContext?.theme?.mode])

  return isPoster
}

export function LoginSyncScreen({ variant }: { variant?: "login" | "reload" | "sync" }) {
  const [messageIndex, setMessageIndex] = useState(0)
  const isPoster = useIsPosterTheme()

  useEffect(() => {
    const timer = window.setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % SIGNING_IN_MESSAGES.length)
    }, 2000)
    return () => window.clearInterval(timer)
  }, [])

  const title = variant === "reload" ? "Welcome back" : variant === "sync" ? "Syncing" : "Signing you in"

  if (isPoster) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          background: "#f7f5f0",
          backgroundImage:
            "linear-gradient(to right, rgba(17, 17, 17, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(17, 17, 17, 0.05) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="w-[92vw] max-w-md bg-white border-[2.5px] border-[#111111] rounded-[28px] p-7 sm:p-9 text-center shadow-[8px_8px_0px_#111111] relative"
        >
          {/* Top header strip */}
          <div className="flex items-center justify-between gap-2 mb-6 pb-4 border-b border-[#111111]/15">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#111111] bg-[#f7f5f0] px-2.5 py-1 rounded-md border border-[#111111] shadow-[1.5px_1.5px_0px_#111111]">
              SYS // ENGINE
            </span>
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-[#111111] px-2.5 py-1 rounded-md shadow-[1.5px_1.5px_0px_#111111]">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
              <span className="text-[10px] font-mono font-bold text-emerald-800">CONNECTING</span>
            </div>
          </div>

          {/* Center poster emblem */}
          <div className="relative w-18 h-18 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-[#f7f5f0] border-2 border-[#111111] shadow-[4px_4px_0px_#111111] flex items-center justify-center my-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
              className="absolute inset-1 rounded-xl border border-dashed border-[#111111]/30 pointer-events-none"
            />
            <img
              src="/favicon.svg"
              alt="edutechsrm"
              className="w-10 h-10 sm:w-12 sm:h-12 relative z-10 drop-shadow-sm"
            />
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-[#111111] mt-4 mb-2">
            {title}
          </h1>

          {/* Dynamic rotating message in a monospace well */}
          <div className="w-full my-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={messageIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16 }}
                className="inline-flex items-center gap-2 bg-[#f7f5f0] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] rounded-xl px-4 py-2"
              >
                <span className="text-xs font-mono font-bold text-[#111111]">
                  {SIGNING_IN_MESSAGES[messageIndex]}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Neo-brutalist Progress bar */}
          <div className="w-full max-w-xs mx-auto mt-2">
            <div className="h-3.5 rounded-full border-2 border-[#111111] bg-[#f7f5f0] shadow-[2px_2px_0px_#111111] overflow-hidden p-[2px]">
              <motion.div
                className="h-full rounded-full origin-left bg-[#111111]"
                animate={{ scaleX: [0.15, 0.65, 0.9, 0.4] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </div>

          {/* Bottom technical footer */}
          <p className="text-[10px] font-mono font-bold text-[#666666] tracking-wider uppercase text-center mt-6 pt-4 border-t border-[#111111]/15">
            SRMIST KTR • ACADEMIA DIRECT LINK • 2026
          </p>
        </motion.div>
      </div>
    )
  }

  // Dark mode render
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        background: "#09090b",
        backgroundImage:
          "radial-gradient(circle at 50% 35%, rgba(52,211,153,0.12), transparent 55%), radial-gradient(circle at 20% 80%, rgba(56,189,248,0.06), transparent 45%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="w-[92vw] max-w-md bg-zinc-900/85 backdrop-blur-xl border border-zinc-800/90 rounded-[28px] p-7 sm:p-9 text-center shadow-[0_24px_70px_rgba(0,0,0,0.7)] relative overflow-hidden"
      >
        {/* Top header strip */}
        <div className="flex items-center justify-between gap-2 mb-6 pb-4 border-b border-zinc-800/80">
          <span className="text-[10px] font-mono font-semibold tracking-wider text-zinc-400 bg-zinc-800/70 px-2.5 py-1 rounded-md border border-zinc-700/50">
            SYS // ENCRYPTED LINK
          </span>
          <div className="flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-emerald-400">ONLINE</span>
          </div>
        </div>

        {/* Center glowing emblem */}
        <div className="relative w-18 h-18 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-zinc-800/70 border border-zinc-700/60 shadow-[0_0_35px_rgba(52,211,153,0.18)] flex items-center justify-center my-3">
          <img
            src="/favicon.svg"
            alt="edutechsrm"
            className="w-10 h-10 sm:w-12 sm:h-12 relative z-10 drop-shadow"
            style={{ filter: "brightness(1.15)" }}
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-zinc-100 mt-4 mb-2">
          {title}
        </h1>

        {/* Dynamic rotating message */}
        <div className="w-full my-4">
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16 }}
              className="text-xs text-zinc-400 font-mono"
            >
              {SIGNING_IN_MESSAGES[messageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Sleek Progress bar */}
        <div className="w-full max-w-xs mx-auto mt-2">
          <div className="h-1.5 rounded-full overflow-hidden bg-zinc-800/90 border border-zinc-700/50">
            <motion.div
              className="h-full rounded-full origin-left bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]"
              animate={{ scaleX: [0.15, 0.65, 0.9, 0.4] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>

        {/* Bottom technical footer */}
        <p className="text-[10px] font-mono text-zinc-500 tracking-wider uppercase text-center mt-6 pt-4 border-t border-zinc-800/80">
          TLS 1.3 SECURED • DIRECT SRM ACADEMIA SESSION
        </p>
      </motion.div>
    </div>
  )
}

// ── Update overlay ──────────────────────────────────────────────────────────
export function UpdateOverlay() {
  const { isApplyingUpdate } = useAdminControl()
  const [progress, setProgress] = useState(0)
  const isPoster = useIsPosterTheme()

  useEffect(() => {
    if (!isApplyingUpdate) return
    const id = window.setInterval(() => {
      setProgress((prev) => Math.min(prev + Math.random() * 18, 92))
    }, 200)
    return () => window.clearInterval(id)
  }, [isApplyingUpdate])

  return (
    <AnimatePresence>
      {isApplyingUpdate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            background: isPoster ? "#f7f5f0" : "#09090b",
            backgroundImage: isPoster
              ? "linear-gradient(to right, rgba(17, 17, 17, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(17, 17, 17, 0.05) 1px, transparent 1px)"
              : undefined,
            backgroundSize: isPoster ? "24px 24px" : undefined,
          }}
        >
          <div
            className={
              isPoster
                ? "w-[92vw] max-w-md bg-white border-[2.5px] border-[#111111] rounded-[28px] p-7 sm:p-9 text-center shadow-[8px_8px_0px_#111111]"
                : "w-[92vw] max-w-md bg-zinc-900/85 backdrop-blur-xl border border-zinc-800/90 rounded-[28px] p-7 sm:p-9 text-center shadow-[0_24px_70px_rgba(0,0,0,0.7)]"
            }
          >
            <img
              src="/favicon.svg"
              alt="edutechsrm"
              className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-4"
              style={{ filter: isPoster ? "none" : "brightness(1.1)" }}
            />
            <h1
              className={
                isPoster
                  ? "text-2xl sm:text-3xl font-black font-display tracking-tight text-[#111111]"
                  : "text-2xl sm:text-3xl font-black font-display tracking-tight text-zinc-100"
              }
            >
              Loading the latest build
            </h1>
            <p
              className={
                isPoster
                  ? "text-xs text-[#555555] font-mono mt-2 mb-6"
                  : "text-xs text-zinc-500 mt-2 mb-6"
              }
            >
              A new release was detected. Updating automatically.
            </p>
            <div className="w-full max-w-xs mx-auto">
              <div className="flex items-center justify-between mb-2">
                <span className={isPoster ? "text-xs font-mono font-bold text-[#111111]" : "text-xs text-zinc-500"}>
                  Updating
                </span>
                <span className={isPoster ? "text-xs font-mono font-bold text-[#111111]" : "text-xs tabular-nums text-zinc-400"}>
                  {Math.round(progress)}%
                </span>
              </div>
              <div
                className={
                  isPoster
                    ? "h-3 rounded-full border-2 border-[#111111] bg-[#f7f5f0] shadow-[2px_2px_0px_#111111] overflow-hidden p-[2px]"
                    : "h-1.5 rounded-full overflow-hidden bg-zinc-800/90 border border-zinc-700/50"
                }
              >
                <motion.div
                  className={isPoster ? "h-full rounded-full bg-[#111111]" : "h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400"}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Data unavailable screen ─────────────────────────────────────────────────
export function DataUnavailableScreen({ onSignOut }: { onSignOut: () => void }) {
  const isPoster = useIsPosterTheme()

  if (isPoster) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          background: "#f7f5f0",
          backgroundImage:
            "linear-gradient(to right, rgba(17, 17, 17, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(17, 17, 17, 0.05) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          zIndex: 9999,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-sm mx-5 text-center bg-white border-[2.5px] border-[#111111] rounded-[28px] p-7 shadow-[8px_8px_0px_#111111]"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-[#fee2e2] border-2 border-[#111111] shadow-[3px_3px_0px_#111111] text-[#991b1b]">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <span className="text-[10px] font-mono font-bold text-[#991b1b] bg-[#fee2e2] border border-[#111111] px-2.5 py-0.5 rounded-full shadow-[1.5px_1.5px_0px_#111111]">
            CONNECTION INTERRUPTED
          </span>
          <h1 className="text-2xl font-black tracking-tight text-[#111111] mt-3 mb-2">Data unavailable</h1>
          <p className="text-xs text-[#555555] mb-6 leading-relaxed">
            Your dashboard data could not be loaded. This may be due to a network issue or a temporary server outage. Please try signing in again.
          </p>
          <button
            onClick={onSignOut}
            className="w-full py-3.5 rounded-xl text-sm font-black border-2 border-[#111111] bg-[#111111] text-white shadow-[3px_3px_0px_#111111] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
          >
            Sign in again
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: "#09090b",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 22% 18%, rgba(52,211,153,0.13), transparent 38%), radial-gradient(circle at 78% 22%, rgba(34,211,238,0.09), transparent 32%), radial-gradient(circle at 50% 80%, rgba(167,139,250,0.06), transparent 30%)",
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-sm mx-5 text-center"
      >
        <div
          className="w-20 h-20 mx-auto mb-6 rounded-[26px] flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(52,211,153,0.15), rgba(16,185,129,0.08))",
            border: "1px solid rgba(52,211,153,0.2)",
          }}
        >
          <svg className="w-10 h-10" style={{ color: "#34d399" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            <path d="M9 10a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V10z" />
            <path d="M12 8v-1" />
            <path d="M12 17v-1" />
          </svg>
        </div>
        <h1 className="text-[26px] font-black tracking-tight leading-[1.15] mb-1.5" style={{ color: "#f4f4f5" }}>
          Data unavailable
        </h1>
        <p className="text-sm mb-7" style={{ color: "#71717a" }}>
          Your dashboard data could not be loaded. This may be due to a network issue or a temporary server outage. Please try signing in again.
        </p>
        <button
          onClick={onSignOut}
          className="w-full py-3.5 rounded-xl text-sm font-extrabold"
          style={{ background: "linear-gradient(135deg, #34d399, #10b981)", color: "#08120d" }}
        >
          Sign in again
        </button>
      </motion.div>
    </div>
  )
}

