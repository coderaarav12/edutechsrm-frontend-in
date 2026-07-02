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
  const subtitle = variant === "reload" ? "Getting your data ready" : variant === "sync" ? "Updating your data" : "Please wait while we connect to SRM and load your data."

  return (
    <div className="fixed inset-0 overflow-hidden flex items-center justify-center" style={{ background: "#09090b" }}>
      <div className="pointer-events-none absolute inset-0" style={{
        background: "radial-gradient(circle at 22% 18%, rgba(52,211,153,0.13), transparent 38%), radial-gradient(circle at 78% 22%, rgba(34,211,238,0.09), transparent 32%), radial-gradient(circle at 50% 80%, rgba(167,139,250,0.06), transparent 30%)",
      }} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-sm mx-5 text-center">
        <motion.div animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="w-20 h-20 mx-auto mb-6 rounded-[26px] flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, rgba(52,211,153,0.15), rgba(16,185,129,0.08))", border: "1px solid rgba(52,211,153,0.2)", boxShadow: "0 0 40px rgba(52,211,153,0.08)" }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
            className="relative w-11 h-11">
            <div className="absolute inset-0 rounded-full" style={{ border: "2.5px solid rgba(52,211,153,0.12)", borderTopColor: "#34d399" }} />
            <div className="absolute inset-[6px] rounded-full" style={{ background: "rgba(52,211,153,0.18)", boxShadow: "0 0 20px rgba(52,211,153,0.2)" }} />
          </motion.div>
        </motion.div>
        <h1 className="text-[26px] font-black tracking-tight leading-[1.15] mb-1.5" style={{ color: "#f4f4f5" }}>{title}</h1>
        <p className="text-sm mb-7" style={{ color: "#71717a" }}>{subtitle}</p>
        <div className="rounded-[20px] border px-4 py-3.5" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
          <AnimatePresence mode="wait">
            <motion.p key={messageIndex} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.16 }}
              className="text-sm font-semibold" style={{ color: "#d4d4d8" }}>
              <span className="inline-block mr-2" style={{ color: "#34d399" }}>◆</span>
              {SIGNING_IN_MESSAGES[messageIndex]}
            </motion.p>
          </AnimatePresence>
          <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
            <motion.div className="h-full rounded-full origin-left"
              style={{ background: "linear-gradient(90deg, #34d399, #2dd4bf)" }}
              animate={{ scaleX: [0.15, 0.6, 0.85, 0.4] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }} />
          </div>
        </div>
        <p className="mt-5 text-[11px]" style={{ color: "#52525b" }}>edutechsrm v2.1 &middot; one moment</p>
      </motion.div>
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
          className="fixed inset-0 z-[95] flex items-center justify-center overflow-hidden"
          style={{ background: "#09090b" }}>
          <div className="pointer-events-none absolute inset-0" style={{
            background: "radial-gradient(circle at 22% 18%, rgba(52,211,153,0.13), transparent 38%), radial-gradient(circle at 78% 22%, rgba(34,211,238,0.09), transparent 32%), radial-gradient(circle at 50% 80%, rgba(167,139,250,0.06), transparent 30%)",
          }} />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-sm mx-5 text-center">
            <motion.div animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              className="w-20 h-20 mx-auto mb-6 rounded-[26px] flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, rgba(52,211,153,0.15), rgba(16,185,129,0.08))", border: "1px solid rgba(52,211,153,0.2)", boxShadow: "0 0 40px rgba(52,211,153,0.08)" }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
                className="relative w-11 h-11">
                <div className="absolute inset-0 rounded-full" style={{ border: "2.5px solid rgba(52,211,153,0.12)", borderTopColor: "#34d399" }} />
                <div className="absolute inset-[6px] rounded-full" style={{ background: "rgba(52,211,153,0.18)", boxShadow: "0 0 20px rgba(52,211,153,0.2)" }} />
              </motion.div>
            </motion.div>
            <h1 className="text-[26px] font-black tracking-tight leading-[1.15] mb-1.5" style={{ color: "#f4f4f5" }}>Loading the latest build</h1>
            <p className="text-sm mb-7" style={{ color: "#71717a" }}>A new release was detected and the website is refreshing automatically.</p>
            <div className="rounded-[20px] border px-4 py-3.5" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold" style={{ color: "#34d399" }}>Updating</span>
                <span className="text-xs tabular-nums" style={{ color: "#52525b" }}>{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                <motion.div className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #34d399, #2dd4bf)" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.2, ease: "easeOut" }} />
              </div>
            </div>
            <p className="mt-5 text-[11px]" style={{ color: "#52525b" }}>edutechsrm v2.1 &middot; one moment</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Data unavailable screen ─────────────────────────────────────────────────
export function DataUnavailableScreen({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="fixed inset-0 overflow-hidden flex items-center justify-center" style={{ background: "#09090b" }}>
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
