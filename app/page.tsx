"use client"

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault()
    ;(window as any).__deferredPrompt = e
  })
}

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { LandingPage } from "@/components/landing-page"
import { LoginModal } from "@/components/login-modal"
import { useAuth } from "@/lib/auth-context"
import { MaintenanceOverlay } from "@/components/maintenance-overlay"
import { UpdateOverlay } from "@/components/app-shell-ui"

import { useOptionalTheme } from "@/lib/theme-context"

import { LogIn, X } from "lucide-react"

interface SessionExpiredModalProps {
  onLogin: () => void
  onClose: () => void
}

function SessionExpiredModal({ onLogin, onClose }: SessionExpiredModalProps) {
  const themeContext = useOptionalTheme()
  const isPoster =
    themeContext?.theme?.mode === "poster" ||
    (typeof document !== "undefined" &&
      (document.documentElement.getAttribute("data-theme") === "poster" ||
        document.documentElement.getAttribute("data-landing-mode") === "poster"))

  if (isPoster) {
    return (
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ type: "spring", bounce: 0.22 }}
        className="relative w-full max-w-sm rounded-[28px] border-[2.5px] border-[#111111] p-6 text-center bg-[#f7f5f0] shadow-[8px_8px_0px_#111111]"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center transition-colors cursor-pointer bg-black/5 hover:bg-black/10 text-[#111111]"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-[#fee2e2] border-2 border-[#111111] shadow-[3px_3px_0px_#111111]">
          <span className="text-2xl">⏳</span>
        </div>
        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-[#991b1b] bg-[#fee2e2] border border-[#111111] px-2.5 py-1 rounded-md shadow-[1.5px_1.5px_0px_#111111] inline-block">
          Authentication Required
        </span>
        <h2 className="text-xl font-black mt-3 mb-1.5 text-[#111111] font-display">Session Expired</h2>
        <p className="text-sm mb-1 text-zinc-700 font-medium">Your session was replaced by a new sign-in on another device.</p>
        <p className="text-xs mb-5 text-zinc-500">Please sign in again to regain access to your dashboard.</p>
        <button
          type="button"
          onClick={onLogin}
          className="w-full py-3.5 rounded-2xl font-mono text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer bg-[#111111] text-white keep-white hover:bg-zinc-800 border-2 border-[#111111] shadow-[3px_3px_0px_#8b7355] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center gap-2"
          style={{ color: "#ffffff" }}
        >
          <LogIn className="w-4 h-4 text-white keep-white" style={{ color: "#ffffff" }} />
          <span className="keep-white" style={{ color: "#ffffff" }}>Log In Again</span>
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div
      onClick={(e) => e.stopPropagation()}
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.94, opacity: 0 }}
      transition={{ type: "spring", bounce: 0.22 }}
      className="relative w-full max-w-sm rounded-[26px] border border-white/10 p-6 text-center bg-[#0b1017] shadow-[0_24px_70px_rgba(0,0,0,0.7),0_0_30px_rgba(248,113,113,0.15)]"
    >
      {/* Close Button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center transition-colors cursor-pointer bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-rose-500/15 border border-rose-500/30">
        <span className="text-2xl">⏳</span>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-400 font-mono">Authentication Required</p>
      <h2 className="text-xl font-black mt-2 mb-1 text-white font-display">Session Expired</h2>
      <p className="text-sm mb-1 text-zinc-300">Your session was replaced by a new sign-in on another device.</p>
      <p className="text-xs mb-5 text-zinc-400">Please sign in again to regain access to your dashboard.</p>
      <button
        type="button"
        onClick={onLogin}
        className="w-full py-3.5 rounded-2xl font-mono text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer bg-gradient-to-r from-emerald-400 to-teal-400 text-zinc-950 hover:brightness-110 shadow-lg shadow-emerald-500/25 active:scale-[0.98] flex items-center justify-center gap-2"
      >
        <LogIn className="w-4 h-4 text-zinc-950" />
        <span>Log In Again</span>
      </button>
    </motion.div>
  )
}

export default function Home() {
  const { isAuthenticated, isLoading, isLoginSyncing, sessionExpired, dismissSessionExpired } = useAuth()
  const router = useRouter()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [mounted, setMounted] = useState(false)
  const hasRedirected = useRef(false)
  const wasLoginSyncing = useRef(false)
  if (isLoginSyncing) wasLoginSyncing.current = true

  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect authenticated users to /app
  useEffect(() => {
    if (isAuthenticated && !hasRedirected.current) {
      hasRedirected.current = true
      if (wasLoginSyncing.current) {
        try { sessionStorage.setItem("fresh_login", "1") } catch {}
      }
      router.replace("/app")
    }
  }, [isAuthenticated, router])

  // Reset redirect flag when auth state changes back to unauthenticated
  useEffect(() => {
    if (!isAuthenticated) {
      hasRedirected.current = false
      wasLoginSyncing.current = false
    }
  }, [isAuthenticated])

  // While auth is loading (pre-auth check), show nothing
  if (isLoading) return null

  // Authenticated but not syncing — redirect to /app
  if (isAuthenticated) return null

  // Wait for client mount to prevent SSR flash
  if (!mounted) return null

  return (
    <>
      <MaintenanceOverlay />
      <UpdateOverlay />
      <LandingPage onEnterApp={() => setShowLoginModal(true)} />
      <AnimatePresence>
        {sessionExpired && !showLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => dismissSessionExpired()}
          >
            <SessionExpiredModal
              onClose={() => dismissSessionExpired()}
              onLogin={() => {
                dismissSessionExpired()
                setShowLoginModal(true)
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  )
}
