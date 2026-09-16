"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Share, X } from "lucide-react"

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=in.edutechsrm.app"

/**
 * High-tech green wireframe mesh download icon:
 * Crisp #34d399 faceted stroke, subtle translucent emerald fill, interior mesh coordinates.
 */
function GreenMeshDownloadIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      {/* Downward arrow with faceted mesh lines */}
      <path
        d="M12 3v10m0 0l4-4m-4 4l-4-4"
        stroke="#34d399"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Tray base with glowing emerald bracket */}
      <path
        d="M4.5 14.5v2.5a2 2 0 002 2h11a2 2 0 002-2v-2.5"
        stroke="#34d399"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Subtle interior mesh connector lines */}
      <line x1="7.5" y1="19" x2="16.5" y2="19" stroke="#6ee7b7" strokeWidth="1" strokeDasharray="1.5 1.5" opacity="0.65" />
    </svg>
  )
}

interface FloatingAppActionProps {
  onLogin?: () => void
  mode?: "night" | "poster" | string
  onModeChange?: (mode: "night" | "poster", coords?: { x: number; y: number }) => void
  onOpenJump?: () => void
}

export function FloatingAppAction({ onLogin, mode = "night", onModeChange, onOpenJump }: FloatingAppActionProps = {}) {
  const isPoster = mode === "poster" || mode === "blueprint"
  const [device, setDevice] = useState<"android" | "ios" | "desktop">("desktop")
  const [canInstallPwa, setCanInstallPwa] = useState(false)
  const [showIosTip, setShowIosTip] = useState(false)
  const [showJumpTop, setShowJumpTop] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    const handleScroll = () => {
      setShowJumpTop(window.scrollY > 280)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    const ua = navigator.userAgent || ""
    if (/Android/i.test(ua)) {
      setDevice("android")
    } else if (/iPhone|iPad|iPod/i.test(ua)) {
      setDevice("ios")
    } else {
      setDevice("desktop")
    }

    if ((window as any).__deferredPrompt) {
      setCanInstallPwa(true)
    }

    const onPrompt = () => setCanInstallPwa(true)
    window.addEventListener("beforeinstallprompt", onPrompt)
    return () => window.removeEventListener("beforeinstallprompt", onPrompt)
  }, [])

  // Close iOS tooltip when clicking outside
  useEffect(() => {
    if (!showIosTip) return
    const onDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowIosTip(false)
      }
    }
    document.addEventListener("click", onDocClick)
    return () => document.removeEventListener("click", onDocClick)
  }, [showIosTip])

  const handleClick = async () => {
    // 1. Android: Directly open Play Store (no popup)
    if (device === "android") {
      window.location.href = PLAY_STORE_URL
      return
    }

    // 2. iOS: Show brief "Add to Home Screen" PWA install guidance
    if (device === "ios") {
      setShowIosTip((prev) => !prev)
      return
    }

    // 3. Desktop / Browser: Trigger PWA install if available, else open Play Store or download
    const deferredPrompt = (window as any).__deferredPrompt
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt()
        const choice = await deferredPrompt.userChoice
        if (choice.outcome === "accepted") {
          setCanInstallPwa(false)
          ;(window as any).__deferredPrompt = null
        }
        return
      } catch {
        // fallback to play store
      }
    }

    window.open(PLAY_STORE_URL, "_blank", "noopener,noreferrer")
  }

  return (
    <>
      {/* Bottom-Left Fixed Jump to Top Button (Laptop / Desktop overlay) - only visible when scrolled */}
      <AnimatePresence>
        {showJumpTop && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.9 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="hidden md:flex fixed z-50 items-center"
            style={{
              bottom: "max(env(safe-area-inset-bottom, 20px), 20px)",
              left: "max(env(safe-area-inset-left, 20px), 20px)",
            }}
          >
            <motion.button
              onClick={() => {
                const html = document.documentElement
                const prev = html.style.scrollBehavior
                html.style.scrollBehavior = "auto"
                window.scrollTo({ top: 0, behavior: "instant" })
                html.style.scrollBehavior = prev
              }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Jump to Top"
              className="group relative flex min-h-[44px] items-center gap-2 rounded-full px-4 py-2.5 shadow-2xl backdrop-blur-xl transition select-none cursor-pointer"
              style={{
                background: isPoster ? "#ffffff" : "#0d1514",
                border: isPoster ? "2px solid #111111" : "1px solid rgba(255,255,255,0.18)",
                boxShadow: isPoster ? "4px 4px 0px #111111" : "0 8px 28px rgba(0,0,0,0.65)",
                color: isPoster ? "#111111" : "#ffffff",
              }}
            >
              <span className="text-sm font-bold text-emerald-400 group-hover:-translate-y-0.5 transition-transform">↑</span>
              <span className="font-mono text-xs font-bold tracking-tight">Jump to Top</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        ref={containerRef}
        className="fixed z-50 flex flex-col items-end"
        style={{
          bottom: "max(env(safe-area-inset-bottom, 12px), 12px)",
          right: "max(env(safe-area-inset-right, 12px), 12px)",
        }}
      >
      {/* iOS PWA Install Instruction Balloon */}
      <AnimatePresence>
        {showIosTip && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.94 }}
            transition={{ type: "spring", damping: 24, stiffness: 350 }}
            className="mb-2.5 w-[280px] rounded-2xl border border-white/15 bg-[#091110]/95 p-3.5 shadow-[0_18px_45px_rgba(0,0,0,0.7)] backdrop-blur-xl"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Share className="h-3.5 w-3.5 text-emerald-400" />
                <span>Install on iPhone</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowIosTip(false)
                }}
                className="flex h-5 w-5 items-center justify-center rounded text-zinc-400 transition hover:text-white"
                aria-label="Close"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-zinc-300">
              Tap <span className="font-bold text-emerald-300">Share</span> in Safari, scroll down and tap{" "}
              <span className="font-bold text-emerald-300">&ldquo;Add to Home Screen&rdquo;</span>.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Cluster: Unified single-row dock on mobile & desktop */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Mobile Quick-Jump Trigger (Integrated into same row, compact & matching) */}
        {onOpenJump && (
          <motion.button
            onClick={onOpenJump}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            aria-label="Jump to station"
            className="group relative flex h-9 md:hidden items-center gap-1 rounded-full px-2.5 shadow-lg backdrop-blur-xl transition select-none touch-manipulation cursor-pointer"
            style={{
              background: isPoster ? "#ffffff" : "#0d1514",
              border: isPoster ? "2px solid #111111" : "1px solid rgba(255,255,255,0.18)",
              boxShadow: isPoster ? "3px 3px 0px #111111" : "0 8px 24px rgba(0,0,0,0.55)",
              color: isPoster ? "#111111" : "#ffffff",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <span className="text-emerald-400 font-bold text-xs">⚡</span>
            <span className="font-mono text-[11px] font-bold tracking-tight">Jump to</span>
          </motion.button>
        )}

        {/* Mode Switcher Button */}
        {onModeChange && (
          <motion.button
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              onModeChange(isPoster ? "night" : "poster", {
                x: Math.round(rect.left + rect.width / 2),
                y: Math.round(rect.top + rect.height / 2),
              })
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={isPoster ? "Switch to Dark Mode" : "Switch to Poster Mode"}
            className="group relative flex h-9 md:h-11 items-center gap-1 sm:gap-1.5 rounded-full px-2.5 sm:px-3.5 shadow-lg backdrop-blur-xl transition select-none touch-manipulation cursor-pointer"
            style={{
              background: isPoster ? "#ffffff" : "#0d1514",
              border: isPoster ? "2px solid #111111" : "1px solid rgba(255,255,255,0.15)",
              boxShadow: isPoster ? "3px 3px 0px #111111" : "0 8px 24px rgba(0,0,0,0.55)",
              color: isPoster ? "#111111" : "#ffffff",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <span className="text-xs">{isPoster ? "☾" : "⌖"}</span>
            <span className="font-mono text-[11px] sm:text-xs font-bold tracking-tight">
              {isPoster ? "Dark" : "Poster"}
            </span>
          </motion.button>
        )}

        {/* Direct Action Button (Compact on mobile, expanded on desktop) */}
        <motion.button
          onClick={handleClick}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          aria-label={
            device === "android"
              ? "Install Android App"
              : device === "ios"
                ? "Install PWA on iPhone"
                : canInstallPwa
                  ? "Install Web App"
                  : "Download edutechsrm App"
          }
          className="group relative flex h-9 md:h-11 items-center gap-1.5 sm:gap-2 rounded-full px-3 sm:px-4 backdrop-blur-xl transition active:scale-95 touch-manipulation select-none cursor-pointer"
          style={{
            background: isPoster ? "#ffffff" : "#0d1514",
            border: isPoster ? "2px solid #111111" : "1px solid rgba(255,255,255,0.15)",
            boxShadow: isPoster ? "3px 3px 0px #111111" : "0 8px 24px rgba(0,0,0,0.55)",
            color: isPoster ? "#111111" : "#ffffff",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {/* Green Mesh Download Sign */}
          <span className="relative flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center">
            <GreenMeshDownloadIcon className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200 group-hover:translate-y-0.5" />
          </span>

          {/* Dynamic platform text */}
          <span className="font-display flex items-center gap-1 sm:gap-1.5 text-xs font-black tracking-tight" style={{ color: isPoster ? "#111111" : "#ffffff" }}>
            <span>Install</span>
            <span className="hidden sm:inline">App</span>
            <span
              className="hidden sm:inline-block rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase"
              style={{
                border: isPoster ? "1px solid #111111" : "1px solid rgba(255,255,255,0.10)",
                background: isPoster ? "#111111" : "rgba(255,255,255,0.06)",
                color: isPoster ? "#ffffff" : "#d4d4d8",
              }}
            >
              {device === "android" ? "Android" : device === "ios" ? "iOS" : "Free"}
            </span>
          </span>
        </motion.button>
      </div>
    </div>
    </>
  )
}
