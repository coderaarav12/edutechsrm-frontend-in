"use client"

import { useState, useEffect, useRef } from "react"
import gsap from "gsap"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import {
  ArrowRight,
  Home,
  LayoutDashboard,
  Mail,
  MapPin,
  Moon,
  Share2,
  Smartphone,
  Sparkles,
  Users,
  X,
} from "lucide-react"
import { QrCode } from "./qr-code"
import { performThemeTransition } from "@/lib/theme-transition"
import { applyThemeGlobally } from "@/lib/theme-context"

export type LandingMode = "night" | "poster"

interface HeaderProps {
  onLoginClick?: () => void
  solid?: boolean
  mode?: LandingMode | "paper" | "blueprint"
  onModeChange?: (mode: LandingMode, coords?: { x: number; y: number }) => void
}

export function Header({ onLoginClick, solid, mode, onModeChange }: HeaderProps = {}) {
  const [internalMode, setInternalMode] = useState<LandingMode>(() => {
    return mode === "night" ? "night" : "poster"
  })

  useEffect(() => {
    if (mode === "poster" || mode === "night") {
      setInternalMode(mode as LandingMode)
    }
  }, [mode])

  useEffect(() => {
    const syncFromDOM = () => {
      if (typeof document === "undefined") return
      const domLanding = document.documentElement.getAttribute("data-landing-mode")
      if (domLanding === "poster" || domLanding === "night") {
        setInternalMode(domLanding)
        return
      }
      const domTheme = document.documentElement.getAttribute("data-theme")
      if (domTheme === "poster") {
        setInternalMode("poster")
        return
      }
      if (domTheme === "dark") {
        setInternalMode("night")
        return
      }
      const saved = localStorage.getItem("edutechsrm-landing-mode") || localStorage.getItem("edutechsrm_landing_mode")
      if (saved === "poster" || saved === "night") {
        setInternalMode(saved as LandingMode)
      } else {
        setInternalMode("poster")
      }
    }

    syncFromDOM()

    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<any>
      const detail = customEvent?.detail
      let nextMode: LandingMode | null = null

      if (typeof detail === "string") {
        if (detail === "poster" || detail === "night") nextMode = detail
      } else if (detail && typeof detail === "object") {
        if (detail.mode === "poster" || detail.mode === "night") {
          nextMode = detail.mode
        }
      }

      if (nextMode) {
        setInternalMode(nextMode)
      } else {
        syncFromDOM()
      }
    }

    window.addEventListener("landing-mode-change", handleSync)
    window.addEventListener("storage", handleSync)
    window.addEventListener("edutechsrm_theme_event", handleSync)
    return () => {
      window.removeEventListener("landing-mode-change", handleSync)
      window.removeEventListener("storage", handleSync)
      window.removeEventListener("edutechsrm_theme_event", handleSync)
    }
  }, [])

  const currentMode: LandingMode =
    (mode === "poster" || mode === "night")
      ? (mode as LandingMode)
      : internalMode

  const isPoster = currentMode === "poster"

  const handleModeSwitch = (newMode: LandingMode, e?: React.MouseEvent | React.TouchEvent) => {
    let coords: { x: number; y: number } | undefined
    if (e && 'currentTarget' in e && e.currentTarget) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      coords = {
        x: Math.round(rect.left + rect.width / 2),
        y: Math.round(rect.top + rect.height / 2),
      }
    } else if (e && 'clientX' in e && typeof (e as React.MouseEvent).clientX === "number" && typeof (e as React.MouseEvent).clientY === "number") {
      coords = {
        x: Math.round((e as React.MouseEvent).clientX),
        y: Math.round((e as React.MouseEvent).clientY),
      }
    }

    if (onModeChange) {
      onModeChange(newMode, coords)
      return
    }

    setInternalMode(newMode)
    const validMode = newMode === "poster" ? "poster" : "night"
    const themeName = validMode === "poster" ? "poster" : "dark"

    const applyTheme = () => {
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("data-landing-mode", validMode)
        document.documentElement.setAttribute("data-theme", themeName)
        document.body.setAttribute("data-landing-mode", validMode)
        document.body.setAttribute("data-theme", themeName)
        document.body.style.backgroundColor = validMode === "poster" ? "#f7f5f0" : "#06080d"
        localStorage.setItem("edutechsrm-landing-mode", validMode)
        localStorage.setItem("edutechsrm_landing_mode", validMode)
        const themeObj: any = {
          mode: themeName,
          presetId: validMode === "poster" ? "poster-cardstock" : "default",
          customImage: null,
          customColors: { pageBg: "#09090b", cardBg: "#18181b", textPrimary: "#f4f4f5", accent: "#34d399" },
        }
        localStorage.setItem("edutechsrm_theme", JSON.stringify(themeObj))
        localStorage.setItem("edutechsrm-theme", JSON.stringify(themeObj))
        try {
          applyThemeGlobally(themeObj)
        } catch { /* noop */ }
        window.dispatchEvent(new CustomEvent("landing-mode-change", {
          detail: { mode: validMode, ...(coords || {}) }
        }))
        window.dispatchEvent(new Event("edutechsrm_theme_event"))
      }
    }

    performThemeTransition({
      nextMode: validMode,
      coords,
      applyTheme,
    })
  }

  const { isAuthenticated } = useAuth()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const elevated = scrolled || solid
  const [showSharePopup, setShowSharePopup] = useState(false)
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  /* GSAP smooth entrance */
  useEffect(() => {
    try {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    } catch {
      /* noop */
    }
    if (!headerRef.current) return
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        y: -60,
        opacity: 0,
        duration: 0.8,
        ease: "expo.out",
        delay: 0.05,
      })
    })
    return () => ctx.revert()
  }, [])

  const handleLoginClick = () => {
    setMenuOpen(false)
    if (isAuthenticated) {
      window.location.href = "/"
      return
    }
    if (onLoginClick) onLoginClick()
    else window.location.href = "/login"
  }

  const navLinks = [
    { href: "/home", label: "Home", icon: Home },
    { href: "/explore", label: "Explore Map", icon: MapPin },
    { href: "/faculty", label: "Faculty", icon: Users },
    { href: "/download", label: "Download", icon: Smartphone },
    { href: "/contact", label: "Developer", icon: Mail },
  ]

  return (
    <>
      <style>{`
        [data-theme="poster"] .header-brand-wordmark,
        [data-landing-mode="poster"] .header-brand-wordmark {
          color: #111111 !important;
        }
        [data-theme="poster"] .header-nav-island,
        [data-landing-mode="poster"] .header-nav-island {
          background-color: #ffffff !important;
          border: 2px solid #111111 !important;
          box-shadow: 3px 3px 0px #111111 !important;
        }
        [data-theme="poster"] .header-mode-toggle,
        [data-landing-mode="poster"] .header-mode-toggle {
          background-color: #ffffff !important;
          border: 2px solid #111111 !important;
          box-shadow: 2px 2px 0px #111111 !important;
        }
        [data-theme="poster"] .header-login-cta,
        [data-landing-mode="poster"] .header-login-cta {
          background: #111111 !important;
          color: #ffffff !important;
          border: 2px solid #111111 !important;
          box-shadow: 2px 2px 0px #111111 !important;
        }
        [data-theme="poster"] .header-hamburger-btn,
        [data-landing-mode="poster"] .header-hamburger-btn {
          background-color: #ffffff !important;
          border: 2px solid #111111 !important;
          color: #111111 !important;
          box-shadow: 2px 2px 0px #111111 !important;
        }
      `}</style>
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isPoster
            ? elevated
              ? "bg-[#f7f5f0]/95 backdrop-blur-xl border-b-2 border-[#111111] shadow-[0_4px_20px_rgba(0,0,0,0.06)] py-2.5 sm:py-3 px-3 sm:px-8 lg:px-12"
              : "bg-[#f7f5f0]/80 backdrop-blur-md border-b border-[#111111]/10 py-3 sm:py-4 px-3 sm:px-8 lg:px-12"
            : elevated
              ? "bg-[#06080d]/90 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_12px_32px_rgba(0,0,0,0.4)] py-2.5 sm:py-3 px-3 sm:px-8 lg:px-12"
              : "bg-transparent py-3 sm:py-4 px-3 sm:px-8 lg:px-12"
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="w-full relative flex items-center justify-between gap-2 sm:gap-4">
          {/* ── Brand Wordmark (Left) ── */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 z-10">
            <Link
              href="/"
              className="flex items-center gap-2 group no-underline"
              aria-label="edutechsrm home"
            >
              <span
                className={`header-brand-wordmark text-[17px] sm:text-[19px] font-black tracking-tight font-display transition-colors ${
                  isPoster ? "text-[#111111]" : "text-white"
                }`}
              >
                edutechsrm
              </span>
            </Link>
          </div>

          {/* ── Central Navigation Island (Center) ── */}
          <nav
            className={`header-nav-island hidden lg:flex lg:absolute lg:left-1/2 lg:-translate-x-1/2 items-center gap-0.5 xl:gap-1 px-2.5 xl:px-3 py-1.5 rounded-full transition-all duration-300 z-10 ${
              isPoster
                ? "bg-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111]"
                : "bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
            }`}
          >
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href || (link.href === "/home" && pathname === "/")
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{ color: isActive && isPoster ? "#ffffff" : undefined }}
                  className={`px-2.5 xl:px-3.5 py-1.5 rounded-full text-xs font-bold transition-all no-underline shrink-0 ${
                    isActive
                      ? isPoster
                        ? "bg-[#111111] text-white keep-white shadow-sm"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : isPoster
                        ? "text-[#111111]/70 hover:text-[#111111] hover:bg-[#111111]/[0.06]"
                        : "text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* ── Right Actions & Utilities (Right) ── */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 z-10">
            {/* Social Icons (Discreet & Polished) */}
            <div className="hidden xl:flex items-center gap-1 mr-1">
              <a
                href="https://instagram.com/edutechsrm"
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram @edutechsrm"
                aria-label="Instagram"
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isPoster
                    ? "text-[#111111]/70 hover:text-[#111111] hover:bg-black/5"
                    : "text-zinc-400 hover:text-pink-400 hover:bg-pink-400/10"
                }`}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>

              <a
                href="https://linkedin.com/company/edutechsrm"
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn @edutechsrm"
                aria-label="LinkedIn"
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isPoster
                    ? "text-[#111111]/70 hover:text-[#111111] hover:bg-black/5"
                    : "text-zinc-400 hover:text-sky-400 hover:bg-sky-400/10"
                }`}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>

              <button
                type="button"
                onClick={() => setShowSharePopup(true)}
                title="Share edutechsrm"
                aria-label="Share"
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  isPoster
                    ? "text-[#111111]/70 hover:text-[#111111] hover:bg-black/5"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Share2 size={14} />
              </button>
            </div>

            {/* Segmented Mode Switcher (Dark / Poster) */}
            <div
              className={`header-mode-toggle inline-flex items-center p-0.5 sm:p-1 rounded-lg sm:rounded-xl transition-all shrink-0 ${
                isPoster
                  ? "bg-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111]"
                  : "bg-white/[0.05] border border-white/10"
              }`}
            >
              <button
                type="button"
                onClick={(e) => handleModeSwitch("night", e)}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-md sm:rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentMode === "night"
                    ? isPoster
                      ? "bg-[#111111]/10 text-[#111111]"
                      : "bg-white/20 text-white shadow-sm"
                    : isPoster
                      ? "text-[#111111]/50 hover:text-[#111111]"
                      : "text-zinc-400 hover:text-white"
                }`}
                title="Switch to Dark Mode"
              >
                <Moon size={12} />
                <span className="hidden sm:inline">Dark</span>
              </button>
              <button
                type="button"
                onClick={(e) => handleModeSwitch("poster", e)}
                style={{ color: currentMode === "poster" && isPoster ? "#ffffff" : undefined }}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-md sm:rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentMode === "poster"
                    ? isPoster
                      ? "bg-[#111111] text-white keep-white shadow-sm"
                      : "bg-white text-zinc-950 font-black shadow-sm"
                    : isPoster
                      ? "text-[#111111]/50 hover:text-[#111111]"
                      : "text-zinc-400 hover:text-white"
                }`}
                title="Switch to Poster Mode"
              >
                <Sparkles size={12} />
                <span className="hidden sm:inline">Poster</span>
              </button>
            </div>

            {/* Primary Login / Dashboard CTA */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleLoginClick}
              style={{ color: isPoster ? "#ffffff" : undefined }}
              className={`header-login-cta inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-black tracking-wide uppercase transition-all cursor-pointer keep-white shrink-0 ${
                isPoster
                  ? "bg-[#111111] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] sm:shadow-[3px_3px_0px_#111111] hover:bg-zinc-800 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                  : "bg-gradient-to-r from-emerald-400 to-teal-400 text-zinc-950 shadow-[0_0_15px_rgba(52,211,153,0.3)] hover:brightness-110 active:scale-95"
              }`}
            >
              {isAuthenticated ? (
                <>
                  <LayoutDashboard size={12} className="sm:w-3.5 sm:h-3.5" />
                  <span className="hidden sm:inline">Dashboard</span>
                  <span className="sm:hidden">App</span>
                </>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight size={12} className="sm:w-3.5 sm:h-3.5" />
                </>
              )}
            </motion.button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className={`header-hamburger-btn lg:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                isPoster
                  ? "bg-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] text-[#111111]"
                  : "bg-white/[0.06] border border-white/10 text-white hover:bg-white/10"
              }`}
            >
              <svg width="16" height="16" className="sm:w-[18px] sm:h-[18px]" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="5" width="16" height="2" rx="1" fill="currentColor" />
                <rect x="2" y="9" width="16" height="2" rx="1" fill="currentColor" />
                <rect x="2" y="13" width="16" height="2" rx="1" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Bottom-Sheet Navigation Menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />

            {/* Bottom Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className={`fixed left-0 right-0 bottom-0 z-50 max-h-[85vh] rounded-t-3xl p-6 flex flex-col overflow-y-auto ${
                isPoster
                  ? "bg-[#f7f5f0] border-t-3 border-[#111111] text-[#111111] shadow-[0_-10px_35px_rgba(0,0,0,0.15)]"
                  : "bg-zinc-950/95 border-t border-white/10 text-white backdrop-blur-2xl shadow-[0_-20px_60px_rgba(0,0,0,0.8)]"
              }`}
            >
              {/* Drag Pill */}
              <div
                className={`w-10 h-1 rounded-full mx-auto mb-4 shrink-0 ${
                  isPoster ? "bg-black/20" : "bg-white/20"
                }`}
              />

              {/* Close Button & Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3
                    className={`text-base font-black font-display leading-none ${
                      isPoster ? "text-[#111111]" : "text-white"
                    }`}
                  >
                    edutechsrm
                  </h3>
                  <p
                    className={`text-[11px] font-mono mt-0.5 ${
                      isPoster ? "text-[#111111]/60" : "text-zinc-400"
                    }`}
                  >
                    SRM Academic Companion
                  </p>
                </div>

                <button
                  onClick={() => setMenuOpen(false)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                    isPoster
                      ? "bg-white border-1.5 border-[#111111] text-[#111111]"
                      : "bg-white/10 text-zinc-300 hover:text-white"
                  }`}
                  aria-label="Close menu"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Mobile Mode Switcher */}
              <div
                className={`flex gap-2 p-1 rounded-2xl mb-6 ${
                  isPoster ? "bg-white border-2 border-[#111111]" : "bg-white/5 border border-white/10"
                }`}
              >
                <button
                  type="button"
                  onClick={(e) => handleModeSwitch("night", e)}
                  style={{ color: currentMode === "night" && !isPoster ? "#ffffff" : undefined }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    currentMode === "night"
                      ? isPoster
                        ? "bg-[#111111]/10 text-[#111111]"
                        : "bg-white/20 text-white keep-white font-black"
                      : isPoster
                        ? "text-[#111111]/50"
                        : "text-zinc-400"
                  }`}
                >
                  <Moon size={14} />
                  <span>Dark Mode</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => handleModeSwitch("poster", e)}
                  style={{ color: currentMode === "poster" && isPoster ? "#ffffff" : undefined }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    currentMode === "poster"
                      ? isPoster
                        ? "bg-[#111111] text-white keep-white font-black shadow-sm"
                        : "bg-white text-zinc-950 font-black"
                      : isPoster
                        ? "text-[#111111]/50"
                        : "text-zinc-400"
                  }`}
                >
                  <Sparkles size={14} />
                  <span style={{ color: currentMode === "poster" && isPoster ? "#ffffff" : undefined }}>Poster Mode</span>
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col gap-2 mb-6">
                {navLinks.map((link) => {
                  const Icon = link.icon
                  const isActive = pathname === link.href
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all no-underline ${
                        isActive
                          ? isPoster
                            ? "bg-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] text-[#111111]"
                            : "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                          : isPoster
                            ? "text-[#111111]/80 hover:bg-black/5"
                            : "text-zinc-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          isPoster
                            ? "bg-black/5 text-[#111111]"
                            : "bg-white/5 text-emerald-400"
                        }`}
                      >
                        <Icon size={15} />
                      </div>
                      <span className="flex-1">{link.label}</span>
                      {isActive && (
                        <span
                          style={{ color: isPoster ? "#ffffff" : undefined }}
                          className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full keep-white ${
                            isPoster ? "bg-[#111111] text-white" : "bg-emerald-400/20 text-emerald-300"
                          }`}
                        >
                          Active
                        </span>
                      )}
                    </Link>
                  )
                })}
              </nav>

              {/* Mobile Socials */}
              <div className="flex gap-2.5 mb-6">
                <a
                  href="https://instagram.com/edutechsrm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold no-underline transition-all ${
                    isPoster
                      ? "bg-white border-1.5 border-[#111111] text-[#111111]"
                      : "bg-pink-500/10 border border-pink-500/25 text-pink-300"
                  }`}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                  <span>Instagram</span>
                </a>

                <a
                  href="https://linkedin.com/company/edutechsrm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold no-underline transition-all ${
                    isPoster
                      ? "bg-white border-1.5 border-[#111111] text-[#111111]"
                      : "bg-sky-500/10 border border-sky-500/25 text-sky-300"
                  }`}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                  <span>LinkedIn</span>
                </a>
              </div>

              {/* Mobile CTA */}
              <button
                onClick={handleLoginClick}
                style={{ color: isPoster ? "#ffffff" : undefined }}
                className={`w-full py-3.5 rounded-2xl text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer keep-white ${
                  isPoster
                    ? "bg-[#111111] text-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                    : "bg-gradient-to-r from-emerald-400 to-teal-400 text-zinc-950 font-black shadow-lg"
                }`}
              >
                {isAuthenticated ? (
                  <>
                    <LayoutDashboard size={16} />
                    <span style={{ color: isPoster ? "#ffffff" : undefined }}>Go to Dashboard</span>
                  </>
                ) : (
                  <>
                    <span style={{ color: isPoster ? "#ffffff" : undefined }}>Connect SRM Academia</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Share Modal ── */}
      <AnimatePresence>
        {showSharePopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSharePopup(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-sm rounded-3xl p-6 text-center relative ${
                isPoster
                  ? "bg-[#f7f5f0] border-3 border-[#111111] shadow-[6px_6px_0px_#111111]"
                  : "bg-zinc-900 border border-white/10 shadow-2xl"
              }`}
            >
              <button
                onClick={() => setShowSharePopup(false)}
                className={`absolute top-4 right-4 w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  isPoster
                    ? "bg-white border-2 border-[#111111] text-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-zinc-100"
                    : "bg-white/10 text-zinc-300 hover:text-white"
                }`}
                aria-label="Close share popup"
              >
                <X size={14} />
              </button>

              <h3
                className={`text-base font-black font-display mb-1 ${
                  isPoster ? "text-[#111111]" : "text-white"
                }`}
              >
                Share edutechsrm
              </h3>
              <p
                className={`text-xs mb-5 font-mono ${
                  isPoster ? "text-[#111111]/60" : "text-zinc-400"
                }`}
              >
                Scan or share with friends
              </p>

              <div
                className={`flex justify-center p-3 rounded-2xl mb-5 ${
                  isPoster ? "bg-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111]" : "bg-black/40 border border-white/5"
                }`}
              >
                <QrCode size={220} />
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={async () => {
                    const url = "https://edutechsrm.in"
                    const title = "edutechsrm"
                    const text = "SRM attendance, timetable & marks — all in one place"
                    if (typeof navigator.share === "function") {
                      try {
                        await navigator.share({ title, text, url })
                      } catch {}
                    } else {
                      try {
                        await navigator.clipboard.writeText(url)
                      } catch {}
                    }
                  }}
                  data-theme-keep="white"
                  style={{
                    color: isPoster ? "#ffffff" : undefined,
                    backgroundColor: isPoster ? "#111111" : undefined,
                  }}
                  className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer keep-white ${
                    isPoster
                      ? "border-2 border-[#111111] shadow-[3px_3px_0px_#111111] hover:bg-zinc-800 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                      : "bg-emerald-500 text-zinc-950 font-black shadow-md hover:bg-emerald-400"
                  }`}
                >
                  <span className="keep-white" style={{ color: isPoster ? "#ffffff" : undefined }}>
                    Share via apps
                  </span>
                </button>
                <button
                  onClick={async (e) => {
                    try {
                      await navigator.clipboard.writeText("https://edutechsrm.in")
                      const btn = e.currentTarget
                      const orig = btn.textContent
                      btn.textContent = "Copied!"
                      setTimeout(() => {
                        btn.textContent = orig
                      }, 1500)
                    } catch {}
                  }}
                  style={{
                    color: isPoster ? "#111111" : undefined,
                    backgroundColor: isPoster ? "#ffffff" : undefined,
                  }}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isPoster
                      ? "border-2 border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-zinc-50 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                      : "bg-white/5 border border-white/10 text-zinc-300 hover:text-white"
                  }`}
                >
                  Copy link
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

