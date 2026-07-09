"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAdminControl } from "@/lib/admin-control"

// ── Signing in loader ────────────────────────────────────────────────────────
const SIGNING_IN_MESSAGES = [
  "Connecting to SRM Academia",
  "Pulling your attendance and timetable",
  "Loading marks and course data",
  "Setting up your workspace",
]

export function LoginSyncScreen({ variant }: { variant?: "login" | "reload" | "sync" }) {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % SIGNING_IN_MESSAGES.length)
    }, 2000)
    return () => window.clearInterval(timer)
  }, [])

  const title = variant === "reload" ? "Welcome back" : variant === "sync" ? "Syncing" : "Signing you in"

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, background: "#09090b" }}>
      <div className="flex flex-col items-center gap-6">
        <img
          src="https://edutechsrm.in/favicon.svg"
          alt="edutechsrm"
          className="w-12 h-12 sm:w-14 sm:h-14"
          style={{ filter: "brightness(1.1)" }}
        />
        <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-zinc-100">
          {title}
        </h1>
        <div className="w-48 sm:w-56">
          <AnimatePresence mode="wait">
            <motion.p key={messageIndex} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.16 }}
              className="text-xs text-zinc-500 text-center mb-3">
              {SIGNING_IN_MESSAGES[messageIndex]}
            </motion.p>
          </AnimatePresence>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
            <motion.div className="h-full rounded-full origin-left"
              style={{ background: "#f4f4f5" }}
              animate={{ scaleX: [0.15, 0.6, 0.85, 0.4] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Update overlay ──────────────────────────────────────────────────────────
export function UpdateOverlay() {
  const { isApplyingUpdate } = useAdminControl()
  const [progress, setProgress] = useState(0)

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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 95, background: "#09090b" }}>
          <div className="flex flex-col items-center gap-6">
            <img
              src="https://edutechsrm.in/favicon.svg"
              alt="edutechsrm"
              className="w-12 h-12 sm:w-14 sm:h-14"
              style={{ filter: "brightness(1.1)" }}
            />
            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-zinc-100">
              Loading the latest build
            </h1>
            <p className="text-xs text-zinc-500 -mt-4">A new release was detected. Updating automatically.</p>
            <div className="w-48 sm:w-56">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-zinc-500">Updating</span>
                <span className="text-xs tabular-nums text-zinc-600">{Math.round(progress)}%</span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                <motion.div className="h-full rounded-full"
                  style={{ background: "#f4f4f5" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.2, ease: "easeOut" }} />
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
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "#09090b" }}>
      <div className="pointer-events-none absolute inset-0" style={{
        background: "radial-gradient(circle at 22% 18%, rgba(52,211,153,0.13), transparent 38%), radial-gradient(circle at 78% 22%, rgba(34,211,238,0.09), transparent 32%), radial-gradient(circle at 50% 80%, rgba(167,139,250,0.06), transparent 30%)",
      }} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-sm mx-5 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-[26px] flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, rgba(52,211,153,0.15), rgba(16,185,129,0.08))", border: "1px solid rgba(52,211,153,0.2)" }}>
          <svg className="w-10 h-10" style={{ color: "#34d399" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            <path d="M9 10a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V10z" />
            <path d="M12 8v-1" /><path d="M12 17v-1" />
          </svg>
        </div>
        <h1 className="text-[26px] font-black tracking-tight leading-[1.15] mb-1.5" style={{ color: "#f4f4f5" }}>Data unavailable</h1>
        <p className="text-sm mb-7" style={{ color: "#71717a" }}>Your dashboard data could not be loaded. This may be due to a network issue or a temporary server outage. Please try signing in again.</p>
        <button onClick={onSignOut}
          className="w-full py-3.5 rounded-xl text-sm font-extrabold"
          style={{ background: "linear-gradient(135deg, #34d399, #10b981)", color: "#08120d" }}>
          Sign in again
        </button>
      </motion.div>
    </div>
  )
}
