"use client"

import type React from "react"
import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Eye, EyeOff, Loader2, Lock, Mail, AlertCircle, ArrowLeft, Rocket, Moon, Sparkles, GraduationCap, RefreshCw } from "lucide-react"
import { loginToSRM } from "@/lib/srm-api"
import { useAuth } from "@/lib/auth-context"
import { useStudentPortal } from "@/lib/student-portal-context"
import { TurnstileWidget } from "@/components/turnstile-widget"

function normalizeSrmEmail(value: string): string {
  const trimmed = value.trim().toLowerCase()
  return trimmed.includes("@") ? trimmed : `${trimmed}@srmist.edu.in`
}

function netIdFromEmail(value: string): string {
  return normalizeSrmEmail(value).split("@")[0].trim().toLowerCase()
}

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated } = useAuth()
  const { fetchCaptcha, loginPortal } = useStudentPortal()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [portalPassword, setPortalPassword] = useState("")
  const [portalCaptcha, setPortalCaptcha] = useState("")
  const [portalCaptchaImage, setPortalCaptchaImage] = useState("")
  const [portalSessionId, setPortalSessionId] = useState("")
  const [portalError, setPortalError] = useState("")
  const [portalLoading, setPortalLoading] = useState(false)
  const [captchaAnswer, setCaptchaAnswer] = useState("")
  const [captchaImage, setCaptchaImage] = useState<string | null>(null)
  const [cdigest, setCdigest] = useState<string | null>(null)
  const [showCaptchaStep, setShowCaptchaStep] = useState(false)
  const [showTurnstile, setShowTurnstile] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState("")
  const [turnstileKey, setTurnstileKey] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [mode, setMode] = useState<"night" | "poster">("poster")

  const derivedNetId = netIdFromEmail(email || "")

  const loadPortalCaptcha = useCallback(async (existingSessionId?: string) => {
    setPortalLoading(true)
    setPortalError("")
    try {
      const res = await fetchCaptcha(existingSessionId || portalSessionId)
      if (!res.success) {
        setPortalError(res.error || "Could not load Student Portal CAPTCHA.")
        return
      }
      if (res.sessionId) setPortalSessionId(res.sessionId)
      if (res.captchaImage) {
        setPortalCaptchaImage(res.captchaImage.startsWith("data:") ? res.captchaImage : `data:image/png;base64,${res.captchaImage}`)
      }
    } catch {
      setPortalError("Student Portal scraper is unreachable.")
    } finally {
      setPortalLoading(false)
    }
  }, [fetchCaptcha, portalSessionId])

  useEffect(() => {
    void loadPortalCaptcha()
  }, [])

  useEffect(() => {
    try {
      const saved = (localStorage.getItem("edutechsrm-landing-mode") || localStorage.getItem("edutechsrm_landing_mode")) as string
      const initialMode = saved === "night" ? "night" : "poster"
      setMode(initialMode)
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("data-landing-mode", initialMode)
        document.body.style.backgroundColor = initialMode === "poster" ? "#f7f5f0" : "#070a0e"
      }
    } catch { /* noop */ }

    const onModeChange = (e: Event) => {
      const detail = (e as CustomEvent).detail
      const m = typeof detail === "string" ? detail : detail?.mode
      if (m === "poster" || m === "night") {
        setMode(m)
        if (typeof document !== "undefined") {
          document.documentElement.setAttribute("data-landing-mode", m)
          document.documentElement.setAttribute("data-theme", m === "poster" ? "poster" : "dark")
          document.body.setAttribute("data-landing-mode", m)
          document.body.setAttribute("data-theme", m === "poster" ? "poster" : "dark")
          document.body.style.backgroundColor = m === "poster" ? "#f7f5f0" : "#070a0e"
        }
      }
    }
    window.addEventListener("landing-mode-change", onModeChange)
    return () => window.removeEventListener("landing-mode-change", onModeChange)
  }, [])

  const handleModeChange = (nextMode: "night" | "poster") => {
    setMode(nextMode)
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-landing-mode", nextMode)
      document.documentElement.setAttribute("data-theme", nextMode === "poster" ? "poster" : "dark")
      document.body.setAttribute("data-landing-mode", nextMode)
      document.body.setAttribute("data-theme", nextMode === "poster" ? "poster" : "dark")
      document.body.style.backgroundColor = nextMode === "poster" ? "#f7f5f0" : "#070a0e"
    }
    try {
      localStorage.setItem("edutechsrm_landing_mode", nextMode)
      localStorage.setItem("edutechsrm-landing-mode", nextMode)
      window.dispatchEvent(new CustomEvent("landing-mode-change", { detail: { mode: nextMode } }))
    } catch { /* noop */ }
  }

  useEffect(() => {
    if (isAuthenticated) router.replace("/")
  }, [isAuthenticated, router])

  const finishLogin = async (token: string, normalizedEmail: string) => {
    const wantsPortalSync = Boolean(portalPassword.trim() || portalCaptcha.trim())
    if (wantsPortalSync) {
      setPortalError("")
      if (!portalPassword.trim()) {
        setPortalError("Enter your Student Portal password, or leave both portal fields empty to skip portal sync.")
        return
      }
      if (!portalCaptcha.trim()) {
        setPortalError("Enter the Student Portal CAPTCHA, or leave both portal fields empty to skip portal sync.")
        return
      }
      if (!portalSessionId) {
        setPortalError("Refresh the Student Portal CAPTCHA and try again.")
        return
      }

      const cleanNetId = netIdFromEmail(normalizedEmail)
      const portalResult = await loginPortal(cleanNetId, portalPassword, portalCaptcha, portalSessionId)
      if (!portalResult.success) {
        const message =
          portalResult.errorCode === "INVALID_CAPTCHA"
            ? "Student Portal CAPTCHA is incorrect. A new CAPTCHA has been loaded."
            : portalResult.errorCode === "INVALID_CREDENTIALS"
            ? "Student Portal password is incorrect for this NetID."
            : portalResult.error || "Student Portal login failed."
        setPortalError(message)
        if (portalResult.captchaImage) {
          setPortalCaptchaImage(portalResult.captchaImage.startsWith("data:") ? portalResult.captchaImage : `data:image/png;base64,${portalResult.captchaImage}`)
        } else {
          void loadPortalCaptcha(portalResult.sessionId || portalSessionId)
        }
        if (portalResult.sessionId) setPortalSessionId(portalResult.sessionId)
        setPortalCaptcha("")
        return
      }
    }

    try {
      localStorage.setItem("__srmites_count", String((Number(localStorage.getItem("__srmites_count")) || 120) + 1))
      localStorage.setItem("edutechsrm_netid", netIdFromEmail(normalizedEmail))
      localStorage.setItem("edutechsrm_srm_email", normalizedEmail)
    } catch {}
    await login(token)
    router.replace("/")
  }

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setPortalError("")
    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    const normalizedEmail = normalizeSrmEmail(email)
    if (!normalizedEmail.endsWith("@srmist.edu.in")) {
      setError("Please use your SRM email address (@srmist.edu.in)")
      return
    }
    setIsLoading(true)
    try {
      const token = showTurnstile ? turnstileToken : undefined
      const result = await loginToSRM(normalizedEmail, password, undefined, undefined, token)
      if (result.requiresCaptcha) {
        setCaptchaImage(result.captchaImage || null)
        setCdigest(result.cdigest || null)
        setShowCaptchaStep(true)
        setIsLoading(false)
        return
      }
      if (result.success && result.token) {
        await finishLogin(result.token, normalizedEmail)
      } else if ("requiresTurnstile" in result && (result as any).requiresTurnstile) {
        setShowTurnstile(true)
        setTurnstileKey((k) => k + 1)
        setTurnstileToken("")
        setError("Complete the bot check below to continue.")
      } else {
        setTurnstileToken("")
        setTurnstileKey((k) => k + 1)
        setError(result.error || "Login failed. Please check your credentials.")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const submitCaptcha = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!captchaAnswer) return setError("Please enter the CAPTCHA")
    setError("")
    setPortalError("")
    setIsLoading(true)
    try {
      const normalizedEmail = normalizeSrmEmail(email)
      const result = await loginToSRM(normalizedEmail, password, captchaAnswer, cdigest || "")
      if (result.success && result.token) {
        await finishLogin(result.token, normalizedEmail)
      } else {
        setError(result.error || "CAPTCHA verification failed. Please try again.")
        setCaptchaAnswer("")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <style>{`
        .login-input { width: 100%; height: 50px; border-radius: 14px; border: 1.5px solid rgba(255,255,255,0.12); background: rgba(8,11,16,0.92); color: #f4f4f5; padding-left: 42px; padding-right: 12px; outline: none; box-shadow: inset 0 1px 0 rgba(255,255,255,0.04); transition: all 0.2s; font-size: 14px; }
        .login-input:focus { border-color: #34d399; box-shadow: 0 0 0 3px rgba(52,211,153,0.15); }
        .login-input::placeholder { color: #52525b; }
        .login-btn { width: 100%; border-radius: 14px; border: 1px solid rgba(255,255,255,0.16); cursor: pointer; height: 50px; font-weight: 900; font-size: 16px; color: #07120d; background: linear-gradient(135deg, #34d399, #10b981); box-shadow: 0 12px 28px rgba(16,185,129,0.30); transition: all 0.2s; letter-spacing: 0.01em; }
        .login-btn:hover { box-shadow: 0 16px 36px rgba(16,185,129,0.40); transform: translateY(-1px); }
        .login-btn:active { transform: translateY(0); box-shadow: 0 6px 16px rgba(16,185,129,0.25); }
        .login-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        /* Poster Mode Styles */
        html[data-landing-mode="poster"] .login-page-bg {
          background-color: #f7f5f0 !important;
          background-image: 
            linear-gradient(to right, rgba(17, 17, 17, 0.035) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(17, 17, 17, 0.035) 1px, transparent 1px) !important;
          background-size: 54px 54px !important;
          color: #111111 !important;
        }
        html[data-landing-mode="poster"] .login-card-container {
          background: #ffffff !important;
          border: 2.5px solid #111111 !important;
          box-shadow: 8px 8px 0px #111111 !important;
          color: #111111 !important;
        }
        html[data-landing-mode="poster"] .login-card-title {
          color: #111111 !important;
        }
        html[data-landing-mode="poster"] .login-card-subtitle {
          color: #52525b !important;
          font-weight: 500 !important;
        }
        html[data-landing-mode="poster"] .login-header-icon {
          background: #ecfdf5 !important;
          border: 2px solid #111111 !important;
          color: #059669 !important;
          box-shadow: 3px 3px 0px #111111 !important;
        }
        html[data-landing-mode="poster"] .login-hero-heading {
          color: #111111 !important;
        }
        html[data-landing-mode="poster"] .login-hero-sub {
          color: #27272a !important;
        }
        html[data-landing-mode="poster"] .login-field-label {
          color: #18181b !important;
          font-weight: 800 !important;
          letter-spacing: 0.05em !important;
        }
        html[data-landing-mode="poster"] .login-forgot-link {
          color: #52525b !important;
          font-weight: 600 !important;
          text-decoration: underline !important;
          text-decoration-color: rgba(17,17,17,0.2) !important;
        }
        html[data-landing-mode="poster"] .login-forgot-link:hover {
          color: #059669 !important;
          text-decoration-color: #059669 !important;
        }
        html[data-landing-mode="poster"] .login-input {
          background: #ffffff !important;
          border: 2px solid #111111 !important;
          color: #111111 !important;
          box-shadow: 2px 2px 0px #111111 !important;
          font-weight: 600 !important;
        }
        html[data-landing-mode="poster"] .login-input:focus {
          border-color: #059669 !important;
          box-shadow: 3.5px 3.5px 0px #111111 !important;
        }
        html[data-landing-mode="poster"] .login-input::placeholder {
          color: #71717a !important;
          font-weight: 500 !important;
        }
        html[data-landing-mode="poster"] .login-input-icon {
          color: #71717a !important;
        }
        html[data-landing-mode="poster"] .login-password-toggle {
          background: #ffffff !important;
          border: 1.5px solid #111111 !important;
          color: #18181b !important;
          box-shadow: 1.5px 1.5px 0px #111111 !important;
        }
        html[data-landing-mode="poster"] .login-password-toggle:hover {
          background: #f4f4f5 !important;
          color: #111111 !important;
        }
        html[data-landing-mode="poster"] .login-portal-card {
          background: #f0fdfa !important;
          border: 2px solid #111111 !important;
          box-shadow: 4px 4px 0px #111111 !important;
        }
        html[data-landing-mode="poster"] .login-portal-icon {
          background: #ffffff !important;
          border: 1.5px solid #111111 !important;
          color: #0891b2 !important;
          box-shadow: 2px 2px 0px #111111 !important;
        }
        html[data-landing-mode="poster"] .login-portal-title {
          color: #0e7490 !important;
          font-weight: 800 !important;
          letter-spacing: 0.05em !important;
        }
        html[data-landing-mode="poster"] .login-portal-netid {
          color: #4b5563 !important;
          font-weight: 500 !important;
        }
        html[data-landing-mode="poster"] .login-portal-netid-val {
          background: #ffffff !important;
          border: 1px solid #111111 !important;
          padding: 1px 6px !important;
          border-radius: 6px !important;
          color: #111111 !important;
          font-weight: 700 !important;
        }
        html[data-landing-mode="poster"] .login-portal-refresh {
          background: #ffffff !important;
          border: 1.5px solid #111111 !important;
          color: #111111 !important;
          box-shadow: 2px 2px 0px #111111 !important;
        }
        html[data-landing-mode="poster"] .login-portal-refresh:hover:not(:disabled) {
          background: #f4f4f5 !important;
          transform: translate(-1px, -1px) !important;
          box-shadow: 3px 3px 0px #111111 !important;
        }
        html[data-landing-mode="poster"] .login-portal-refresh:active:not(:disabled) {
          transform: translate(1px, 1px) !important;
          box-shadow: 1px 1px 0px #111111 !important;
        }
        html[data-landing-mode="poster"] .login-captcha-box {
          background: #ffffff !important;
          border: 2px solid #111111 !important;
          box-shadow: 2px 2px 0px #111111 !important;
        }
        html[data-landing-mode="poster"] .login-captcha-input {
          letter-spacing: 0.12em !important;
          font-weight: 800 !important;
        }
        html[data-landing-mode="poster"] .login-portal-error {
          background: #fffbeb !important;
          border: 2px solid #b45309 !important;
          color: #92400e !important;
          box-shadow: 3px 3px 0px #b45309 !important;
          font-weight: 600 !important;
        }
        html[data-landing-mode="poster"] .login-main-error {
          background: #fef2f2 !important;
          border: 2px solid #dc2626 !important;
          color: #991b1b !important;
          box-shadow: 3px 3px 0px #dc2626 !important;
          font-weight: 600 !important;
        }
        html[data-landing-mode="poster"] .login-btn {
          background: #111111 !important;
          color: #ffffff !important;
          border: 2px solid #111111 !important;
          box-shadow: 4px 4px 0px #111111 !important;
          font-weight: 900 !important;
          letter-spacing: 0.02em !important;
        }
        html[data-landing-mode="poster"] .login-btn:hover {
          background: #18181b !important;
          color: #ffffff !important;
          box-shadow: 6px 6px 0px #111111 !important;
          transform: translate(-1px, -1px) !important;
        }
        html[data-landing-mode="poster"] .login-btn:active {
          transform: translate(2px, 2px) !important;
          box-shadow: 2px 2px 0px #111111 !important;
        }
        html[data-landing-mode="poster"] .login-legal-box {
          border-top: 1.5px solid rgba(17,17,17,0.12) !important;
        }
        html[data-landing-mode="poster"] .login-legal-text {
          color: #52525b !important;
          font-weight: 500 !important;
        }
        html[data-landing-mode="poster"] .login-legal-link {
          color: #059669 !important;
          font-weight: 700 !important;
          text-decoration: underline !important;
          text-decoration-color: rgba(5,150,105,0.4) !important;
        }
        html[data-landing-mode="poster"] .login-legal-link:hover {
          color: #047857 !important;
        }
        html[data-landing-mode="poster"] .login-step2-captcha-box {
          background: #ffffff !important;
          border: 2px solid #111111 !important;
          box-shadow: 4px 4px 0px #111111 !important;
        }
        html[data-landing-mode="poster"] .login-badge-telemetry {
          background: #ffffff !important;
          border: 2px solid #111111 !important;
          color: #111111 !important;
          box-shadow: 3px 3px 0px #111111 !important;
        }
        html[data-landing-mode="poster"] .login-note-sticker {
          background: #fef08a !important;
          border: 2px solid #111111 !important;
          color: #111111 !important;
          box-shadow: 4px 4px 0px #111111 !important;
        }
        html[data-landing-mode="poster"] .login-note-sticker p {
          color: #78350f !important;
        }
        html[data-landing-mode="poster"] .login-note-sticker span {
          color: #92400e !important;
        }
        html[data-landing-mode="poster"] .login-feature-item {
          background: #ffffff !important;
          border: 2px solid #111111 !important;
          box-shadow: 4px 4px 0px #111111 !important;
          color: #111111 !important;
        }
        html[data-landing-mode="poster"] .login-feature-item span {
          color: #111111 !important;
        }
        html[data-landing-mode="poster"] .login-return-btn {
          background: #ffffff !important;
          border: 2px solid #111111 !important;
          color: #111111 !important;
          box-shadow: 3px 3px 0px #111111 !important;
        }
        html[data-landing-mode="poster"] .login-bottom-bar {
          color: #52525b !important;
          border-color: rgba(17,17,17,0.12) !important;
          font-weight: 600 !important;
        }
        html[data-landing-mode="poster"] .login-sync-badge {
          background: #ffffff !important;
          border: 1.5px solid #111111 !important;
          color: #059669 !important;
          box-shadow: 2px 2px 0px #111111 !important;
        }
      `}</style>

      <div className="login-page-bg relative min-h-screen bg-[#070a0e] text-zinc-100 flex flex-col justify-between selection:bg-emerald-400 selection:text-black">
        {/* Top Header */}
        <div className="w-full pt-6 px-4 sm:px-8 max-w-7xl mx-auto flex items-center justify-between z-20">
          <Link href="/" className="login-return-btn inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase px-3.5 py-2 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] transition-all backdrop-blur-md text-zinc-300 hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" /> Return Home
          </Link>

          <div className="flex items-center gap-3">
            <span className="login-sync-badge hidden sm:inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Academia Sync
            </span>

            {/* Dark / Poster Switcher */}
            <div
              className="inline-flex items-center rounded-xl p-1 gap-1 border transition-colors"
              style={{
                background: mode === "poster" ? "#ffffff" : "rgba(255,255,255,0.06)",
                borderColor: mode === "poster" ? "#111111" : "rgba(255,255,255,0.12)",
                borderWidth: mode === "poster" ? 2 : 1,
                boxShadow: mode === "poster" ? "3px 3px 0px #111111" : undefined,
              }}
            >
              <button
                type="button"
                onClick={() => handleModeChange("night")}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all"
                style={{
                  background: mode === "night" ? "rgba(255,255,255,0.14)" : "transparent",
                  color: mode === "night" ? "#ffffff" : (mode === "poster" ? "#71717a" : "rgba(255,255,255,0.5)"),
                }}
              >
                <Moon className="h-3 w-3" />
                <span>Dark</span>
              </button>
              <button
                type="button"
                onClick={() => handleModeChange("poster")}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all"
                style={{
                  background: mode === "poster" ? "#111111" : "transparent",
                  color: mode === "poster" ? "#ffffff" : "rgba(255,255,255,0.5)",
                }}
              >
                <Sparkles className="h-3 w-3" />
                <span>Poster</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="relative flex-1 flex items-center justify-center px-4 py-12 sm:px-6 z-10">
          <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Creative Editorial Hero & Live Telemetry (Desktop/Laptop only) */}
            <motion.div 
              initial={{ opacity: 0, x: -25 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.5 }}
              className="hidden lg:block lg:col-span-6 space-y-6 text-left"
            >
              <div className="login-badge-telemetry inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-mono font-bold tracking-wider uppercase text-zinc-300 backdrop-blur-md">
                <Lock className="h-3.5 w-3.5 text-emerald-400" /> SYS_AUTH // 001 PROTOCOL
              </div>

              <h1 className="login-hero-heading text-3xl sm:text-5xl font-black font-display tracking-tight text-white leading-[1.08]">
                Sign in to your <br />
                <span className="font-serif italic font-normal text-emerald-400">academic ledger.</span>
              </h1>

              <p className="login-hero-sub text-sm sm:text-base text-zinc-400 leading-relaxed max-w-lg">
                Direct authentication against SRM Academia. Timetable, day orders, attendance records, internal marks, and GradeX calculator synchronized in milliseconds.
              </p>

              {/* Editorial Feature Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="login-feature-item rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 backdrop-blur-md flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold font-mono tracking-wide text-zinc-200">Zero Password Storage</span>
                    <span className="block text-[11px] text-zinc-400">Forwarded in-memory only</span>
                  </div>
                </div>

                <div className="login-feature-item rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 backdrop-blur-md flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center shrink-0">
                    <Rocket className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold font-mono tracking-wide text-zinc-200">Instant Offline Cache</span>
                    <span className="block text-[11px] text-zinc-400">Works without campus WiFi</span>
                  </div>
                </div>
              </div>

              {/* Creative Handwritten Sticky Note */}
              <div className="login-note-sticker relative inline-block rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 transform -rotate-1 max-w-md">
                <p className="text-xs sm:text-sm font-handwriting text-amber-300 font-medium" style={{ fontFamily: "var(--font-caveat, 'Caveat', cursive)", fontSize: "17px", lineHeight: "1.3" }}>
                  "Skip calculations, bunk risk alerts, and 79 subjects of notes will be unlocked immediately upon session verification."
                </p>
                <span className="block text-[10px] font-mono uppercase tracking-widest text-amber-400/70 mt-1">— EdutechSRM Core System</span>
              </div>
            </motion.div>

            {/* Right Column: High-Craft Login Form */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-6 w-full max-w-md mx-auto"
            >
              <div className="login-card-container relative overflow-hidden rounded-[28px] border border-white/15 bg-white/[0.04] p-6 sm:p-8 backdrop-blur-2xl shadow-[0_24px_64px_rgba(0,0,0,0.50)]">
                
                <div className="text-center mb-6">
                  <div className="login-header-icon mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <h2 className="login-card-title text-xl sm:text-2xl font-black font-display tracking-tight">Academia Authentication</h2>
                  <p className="login-card-subtitle mt-1 text-xs text-zinc-400">Enter your SRM student credentials</p>
                </div>

                {!showCaptchaStep ? (
                  <form onSubmit={submitLogin} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="login-field-label text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400">SRM NetID / Email</label>
                      <div className="relative">
                        <Mail className="login-input-icon pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ab1234 or ab1234@srmist.edu.in" autoComplete="username" required className="login-input" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="login-field-label text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400">Academia Password</label>
                        <a href="https://academia.srmist.edu.in/reset" target="_blank" rel="noopener noreferrer" className="login-forgot-link text-[11px] text-zinc-400 hover:text-emerald-400 transition-colors">
                          Forgot password?
                        </a>
                      </div>
                      <div className="relative">
                        <Lock className="login-input-icon pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••••" autoComplete="current-password" required className="login-input" style={{ paddingRight: 44 }} />
                        <button type="button" onClick={() => setShowPassword((v) => !v)} className="login-password-toggle absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-zinc-400 hover:text-white transition-colors" style={{ width: 32, height: 32 }}>
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="login-portal-card rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.06] p-3.5">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div className="login-portal-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-cyan-500/25 bg-cyan-500/10 text-cyan-300">
                            <GraduationCap className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="login-portal-title text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-300">Student Portal Sync</p>
                            <p className="login-portal-netid text-[11px] text-zinc-500">
                              NetID: <span className="login-portal-netid-val font-mono text-zinc-300">{derivedNetId || "ab1234"}</span>
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => loadPortalCaptcha(portalSessionId)}
                          disabled={portalLoading}
                          className="login-portal-refresh flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-zinc-400 transition-colors hover:text-cyan-300 disabled:opacity-50"
                          title="Refresh Student Portal CAPTCHA"
                        >
                          <RefreshCw className={`h-3.5 w-3.5 ${portalLoading ? "animate-spin" : ""}`} />
                        </button>
                      </div>

                      <div className="flex flex-col gap-2.5">
                        <div className="relative">
                          <Lock className="login-input-icon pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                          <input
                            type="password"
                            value={portalPassword}
                            onChange={(e) => setPortalPassword(e.target.value)}
                            placeholder="Student Portal password"
                            autoComplete="current-password"
                            className="login-input"
                          />
                        </div>

                        <div className="flex items-center gap-2.5">
                          <div className="login-captcha-box flex h-[50px] w-[134px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-white px-1.5">
                            {portalCaptchaImage ? (
                              <img src={portalCaptchaImage} alt="Student Portal CAPTCHA" className="h-[42px] max-w-[124px] object-contain" />
                            ) : (
                              <span className="px-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                                {portalLoading ? "Loading..." : "Refresh"}
                              </span>
                            )}
                          </div>
                          <input
                            value={portalCaptcha}
                            onChange={(e) => setPortalCaptcha(e.target.value)}
                            placeholder="CAPTCHA"
                            autoCapitalize="characters"
                            autoCorrect="off"
                            spellCheck={false}
                            className="login-input login-captcha-input flex-1 min-w-0"
                            style={{ paddingLeft: 14 }}
                          />
                        </div>
                      </div>

                      {portalError && (
                        <div className="login-portal-error mt-3 flex gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-300">
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{portalError}
                        </div>
                      )}
                    </div>

                    {error && (
                      <div className="login-main-error flex gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400 leading-relaxed">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}
                      </div>
                    )}

                    {showTurnstile && (
                      <TurnstileWidget key={turnstileKey} onSuccess={(token) => setTurnstileToken(token)} />
                    )}

                    <button type="submit" disabled={isLoading || (showTurnstile && !turnstileToken)} className="login-btn mt-1">
                      {isLoading ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" /> Verifying Credentials...
                        </span>
                      ) : (
                        "Sign In to Portal"
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={submitCaptcha} className="flex flex-col gap-4">
                    {captchaImage && (
                      <div className="login-step2-captcha-box overflow-hidden rounded-2xl bg-white p-3 border border-white/20 text-center">
                        <img src={captchaImage.startsWith("data:") ? captchaImage : `data:image/png;base64,${captchaImage}`} alt="CAPTCHA" className="h-20 w-full object-contain" />
                      </div>
                    )}
                    <div className="flex flex-col gap-1.5">
                      <label className="login-field-label text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400">Enter Security CAPTCHA</label>
                      <input value={captchaAnswer} onChange={(e) => setCaptchaAnswer(e.target.value)} placeholder="Enter letters shown above" required className="login-input" style={{ paddingLeft: 14 }} />
                    </div>
                    {error && (
                      <div className="login-main-error flex gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400 leading-relaxed">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}
                      </div>
                    )}
                    <button type="submit" disabled={isLoading} className="login-btn">
                      {isLoading ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Confirming...</span> : "Verify & Sign In"}
                    </button>
                  </form>
                )}

                <div className="login-legal-box mt-6 pt-5 border-t border-white/10 text-center">
                  <p className="login-legal-text text-[11px] text-zinc-400 leading-relaxed">
                    By authenticating, you accept the{" "}
                    <Link href="/terms" className="login-legal-link text-emerald-400 underline decoration-emerald-400/40 hover:text-emerald-300">Terms of Service</Link>
                    {" "}and{" "}
                    <Link href="/privacy" className="login-legal-link text-emerald-400 underline decoration-emerald-400/40 hover:text-emerald-300">Privacy Policy</Link>.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Minimal Footer with status */}
        <div className="login-bottom-bar w-full py-5 px-4 text-center z-10 border-t border-white/5">
          <p className="login-bottom-bar text-[11px] font-mono text-zinc-400">
            edutechsrm // Secure Reverse-Proxy Handshake // SRMIST KTR
          </p>
        </div>
      </div>
    </>
  )
}
