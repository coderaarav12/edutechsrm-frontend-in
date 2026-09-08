"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, LogIn, ShieldCheck, CheckCircle2 } from "lucide-react"
import { useOptionalTheme } from "@/lib/theme-context"

export default function LoggedOutPage() {
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

  if (isPoster) {
    return (
      <div
        className="min-h-screen px-4 py-8 flex items-center justify-center relative overflow-hidden"
        style={{
          background: "#f7f5f0",
          backgroundImage:
            "linear-gradient(to right, rgba(17, 17, 17, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(17, 17, 17, 0.05) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="w-full max-w-md rounded-[28px] border-[2.5px] border-[#111111] p-6 sm:p-8 text-center bg-white shadow-[8px_8px_0px_#111111] relative"
        >
          {/* Top header strip */}
          <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-[#111111]/15">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#991b1b] bg-[#fee2e2] px-2.5 py-1 rounded-md border border-[#111111] shadow-[1.5px_1.5px_0px_#111111]">
              AUTH // TERMINATED
            </span>
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-[#111111] px-2 py-0.5 rounded-md shadow-[1.5px_1.5px_0px_#111111]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span className="text-[10px] font-mono font-bold text-emerald-800">SESSION CLEARED</span>
            </div>
          </div>

          {/* Center poster emblem */}
          <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center bg-[#fee2e2] border-2 border-[#111111] shadow-[3px_3px_0px_#111111] my-3">
            <ShieldCheck className="w-8 h-8 text-[#991b1b]" />
          </div>

          <p className="mt-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#666666]">
            Signed Out Successfully
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-black font-display tracking-tight text-[#111111]">
            You have been logged out
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#555555]">
            Your app session has been cleared from this device, and your backend session was also closed.
          </p>

          <div className="mt-5 rounded-2xl border-2 border-[#111111] p-4 text-left bg-[#f7f5f0] shadow-[3px_3px_0px_#111111]">
            <p className="text-sm font-bold text-[#111111] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#111111]" />
              What happens now
            </p>
            <p className="mt-2 text-[13px] leading-6 text-[#555555]">
              If you want to use edutechsrm again, just sign in from the main page. This screen ensures your session is fully terminated before returning.
            </p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="flex-1 rounded-2xl px-4 py-3.5 text-sm font-black inline-flex items-center justify-center gap-2 bg-[#111111] text-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
              style={{ textDecoration: "none" }}
            >
              <LogIn className="w-4 h-4" />
              Go to login
            </Link>
            <Link
              href="/"
              className="flex-1 rounded-2xl px-4 py-3.5 text-sm font-bold inline-flex items-center justify-center gap-2 bg-white text-[#111111] border-2 border-[#111111] shadow-[3px_3px_0px_#111111] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
              style={{ textDecoration: "none" }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
          </div>

          <p className="text-[10px] font-mono font-bold text-[#777777] tracking-wider uppercase text-center mt-6 pt-4 border-t border-[#111111]/15">
            EDUTECHSRM • KTR ACADEMIA PORTAL • 2026
          </p>
        </motion.div>
      </div>
    )
  }

  // Dark mode
  return (
    <div
      className="min-h-screen px-4 py-8 flex items-center justify-center"
      style={{
        background: "#09090b",
        backgroundImage:
          "radial-gradient(circle at 50% 30%, rgba(248,113,113,0.1), transparent 55%), radial-gradient(circle at 20% 80%, rgba(168,85,247,0.06), transparent 45%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md rounded-[28px] border p-6 sm:p-7 text-center"
        style={{
          background: "linear-gradient(145deg, rgba(25,10,14,0.96), rgba(18,11,16,0.92))",
          borderColor: "rgba(248,113,113,0.24)",
          boxShadow: "0 24px 70px rgba(0,0,0,0.5)",
        }}
      >
        <div
          className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(248,113,113,0.25), rgba(244,114,182,0.18))",
            border: "1px solid rgba(248,113,113,0.28)",
          }}
        >
          <ShieldCheck className="w-7 h-7" style={{ color: "#fda4af" }} />
        </div>

        <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "#fb7185" }}>
          Signed Out
        </p>
        <h1 className="mt-2 text-2xl font-black tracking-tight" style={{ color: "#f4f4f5" }}>
          You have been logged out
        </h1>
        <p className="mt-2 text-sm leading-6" style={{ color: "#a1a1aa" }}>
          Your app session has been cleared from this device, and your backend session was also asked to close.
        </p>

        <div
          className="mt-5 rounded-2xl border p-3 text-left"
          style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <p className="text-sm font-semibold" style={{ color: "#d4d4d8" }}>
            What happens now
          </p>
          <p className="mt-2 text-[13px] leading-6" style={{ color: "#a1a1aa" }}>
            If you want to use edutechsrm again, just sign in from the main page. This screen is here so logout feels final instead of quietly dropping you back into the app shell.
          </p>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 rounded-2xl px-4 py-3 text-sm font-bold inline-flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg,#34d399,#10b981)", color: "#09090b", textDecoration: "none" }}
          >
            <LogIn className="w-4 h-4" />
            Go to login
          </Link>
          <Link
            href="/"
            className="flex-1 rounded-2xl px-4 py-3 text-sm font-semibold inline-flex items-center justify-center gap-2 border"
            style={{ borderColor: "rgba(255,255,255,0.08)", color: "#a1a1aa", textDecoration: "none" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

