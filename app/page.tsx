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
import { LandingSplash } from "@/components/landing-splash"

function SessionExpiredModal({ onLogin }: { onLogin: () => void }) {
  return (
    <motion.div onClick={(e) => e.stopPropagation()} initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}
      transition={{ type: "spring", bounce: 0.22 }}
      className="w-full max-w-sm rounded-[26px] border p-6 text-center"
      style={{ background: "linear-gradient(145deg, rgba(28,12,18,0.95), rgba(20,11,17,0.95))", borderColor: "rgba(248,113,113,0.24)", boxShadow: "0 24px 70px rgba(0,0,0,0.45)" }}>
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, rgba(248,113,113,0.25), rgba(244,114,182,0.18))", border: "1px solid rgba(248,113,113,0.28)" }}>
        <span className="text-2xl">⏳</span>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "#fb7185" }}>Authentication Required</p>
      <h2 className="text-xl font-black mt-1 mb-2" style={{ color: "#f4f4f5" }}>Session expired</h2>
      <p className="text-sm mb-1" style={{ color: "#d4d4d8" }}>Your session was replaced by a new sign-in on another device.</p>
      <p className="text-xs mb-5 opacity-80" style={{ color: "#a1a1aa" }}>Please sign in again to regain access to your dashboard.</p>
      <button onClick={onLogin} className="w-full py-3 rounded-xl text-sm font-extrabold"
        style={{ background: "linear-gradient(135deg, #34d399, #10b981)", color: "#08120d" }}>Go to login</button>
    </motion.div>
  )
}

export default function Home() {
  const { isAuthenticated, isLoading, isLoginSyncing, sessionExpired, dismissSessionExpired } = useAuth()
  const router = useRouter()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
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

  // Show splash screen for unauthenticated users before landing page
  if (!isAuthenticated && !isLoading && showSplash) {
    return <LandingSplash onFinish={() => setShowSplash(false)} />
  }

  return (
    <>
      <MaintenanceOverlay />
      <UpdateOverlay />
      <LandingPage onEnterApp={() => setShowLoginModal(true)} />
      <AnimatePresence>
        {sessionExpired && !showLoginModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => dismissSessionExpired()}>
            <SessionExpiredModal onLogin={() => { window.location.href = "/login" }} />
          </motion.div>
        )}
      </AnimatePresence>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  )
}
