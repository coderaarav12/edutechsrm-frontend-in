"use client"

import React, { useState, useEffect, type FormEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  RefreshCw,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  Lock,
  User,
  Loader2,
  Sparkles,
  ShieldCheck,
  Edit3,
  KeyRound,
  ChevronDown,
} from "lucide-react"
import { useStudentPortal } from "@/lib/student-portal-context"
import { useAuth } from "@/lib/auth-context"
import { useTheme } from "@/lib/theme-context"

// NetID is strictly the 2-alpha + 4-digit prefix (e.g. ag0892) before @srmist.edu.in
function detectNetId(user: any): string {
  if (typeof window !== "undefined") {
    const directNetId = localStorage.getItem("edutechsrm_netid")?.trim().toLowerCase()
    if (directNetId && !/^ra\d/i.test(directNetId) && directNetId.length <= 8) {
      return directNetId
    }

    const storedEmail = localStorage.getItem("edutechsrm_srm_email")?.trim().toLowerCase()
    if (storedEmail) {
      const prefix = storedEmail.split("@")[0].trim()
      if (prefix && !/^ra\d/i.test(prefix) && prefix.length <= 8) {
        return prefix
      }
    }
  }

  if (user?.email && typeof user.email === "string") {
    const prefix = user.email.split("@")[0].trim().toLowerCase()
    if (prefix && !/^ra\d/i.test(prefix) && prefix.length <= 8) {
      return prefix
    }
  }

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("edutechsrm_auth_cache_v1")
      if (raw) {
        const parsed = JSON.parse(raw)
        const email = parsed?.user?.email
        if (email && typeof email === "string") {
          const prefix = email.split("@")[0].trim().toLowerCase()
          if (prefix && !/^ra\d/i.test(prefix) && prefix.length <= 8) {
            return prefix
          }
        }
      }
    } catch {}
  }

  return ""
}

function getStoredPassword(): string {
  if (typeof window === "undefined") return ""
  try {
    const raw = localStorage.getItem("edutechsrm_student_portal_creds_v2")
    if (raw) {
      const parsed = JSON.parse(raw)
      return typeof parsed?.password === "string" ? parsed.password : ""
    }
  } catch {}
  return ""
}

export function StudentPortalModal() {
  const { isLoginModalOpen, closePortalLogin, fetchCaptcha, loginPortal, isSyncing, isSessionExpired } =
    useStudentPortal()
  const { user } = useAuth()
  const { theme } = useTheme()
  const isPoster = theme?.mode === "poster" || (theme as any) === "poster" || (typeof document !== "undefined" && (document.documentElement.getAttribute("data-theme") === "poster" || document.documentElement.getAttribute("data-landing-mode") === "poster"))

  const [netId, setNetId] = useState("")
  const [password, setPassword] = useState("")
  const [showFullForm, setShowFullForm] = useState(false)
  const [captcha, setCaptcha] = useState("")
  const [captchaImage, setCaptchaImage] = useState("")
  const [sessionId, setSessionId] = useState("")
  const [captchaLoading, setCaptchaLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Auto-populate NetID and stored Password
  useEffect(() => {
    if (!isLoginModalOpen) return
    setError("")
    setSuccess("")
    setCaptcha("")

    const detected = detectNetId(user)
    if (detected) {
      setNetId(detected)
    }

    const savedPass = getStoredPassword()
    if (savedPass) {
      setPassword(savedPass)
      setShowFullForm(false) // Has saved credentials -> Show fast CAPTCHA-only view
    } else {
      setPassword("")
      setShowFullForm(true) // First time -> Show full form
    }

    void loadCaptcha()
  }, [isLoginModalOpen, user])

  const loadCaptcha = async (existingSessionId?: string) => {
    setCaptchaLoading(true)
    setError("")
    try {
      const res = await fetchCaptcha(existingSessionId || sessionId)
      if (res.success) {
        if (res.sessionId) setSessionId(res.sessionId)
        if (res.captchaImage) {
          const img = res.captchaImage.startsWith("data:")
            ? res.captchaImage
            : `data:image/png;base64,${res.captchaImage}`
          setCaptchaImage(img)
        }
      } else {
        setError(res.error || "Could not load CAPTCHA from Student Portal.")
      }
    } catch {
      setError("Failed to connect to Student Portal scraper.")
    } finally {
      setCaptchaLoading(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    const cleanNetId = netId.trim().toLowerCase()
    if (!cleanNetId) {
      setError("Please enter your NetID (e.g. ag0892).")
      setShowFullForm(true)
      return
    }

    if (!password) {
      setError("Please enter your Student Portal password.")
      setShowFullForm(true)
      return
    }

    if (!captcha.trim()) {
      setError("Please enter the CAPTCHA code.")
      return
    }

    const res = await loginPortal(cleanNetId, password, captcha, sessionId)
    if (res.success) {
      if (typeof window !== "undefined") {
        localStorage.setItem("edutechsrm_netid", cleanNetId)
        localStorage.setItem("edutechsrm_srm_email", `${cleanNetId}@srmist.edu.in`)
      }
      setNetId(cleanNetId)
      setShowFullForm(false)
      setSuccess("Resynced! Live attendance and semester marks updated.")
      setTimeout(() => {
        closePortalLogin()
      }, 800)
    } else {
      setError(res.error || "Authentication failed.")
      if (res.captchaImage) {
        const img = res.captchaImage.startsWith("data:")
          ? res.captchaImage
          : `data:image/png;base64,${res.captchaImage}`
        setCaptchaImage(img)
      }
      if (res.sessionId) {
        setSessionId(res.sessionId)
      }
      setCaptcha("")
    }
  }

  if (!isLoginModalOpen) return null

  const isCaptchaOnlyMode = Boolean(netId && password && !showFullForm)

  return (
    <AnimatePresence>
      <div className={`fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 ${isPoster ? "bg-black/50 backdrop-blur-sm" : "bg-black/80 backdrop-blur-sm"}`}>
        {/* Mobile Backdrop Tap */}
        <div className="absolute inset-0" onClick={closePortalLogin} />

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.98 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className={`relative w-full max-w-sm max-sm:rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 overflow-hidden max-h-[92dvh] overflow-y-auto ${
            isPoster
              ? "bg-white border-2 border-[#111111] shadow-[6px_6px_0px_#111111] text-[#111111]"
              : "bg-zinc-950 border border-white/10 ring-1 ring-white/5 shadow-2xl"
          }`}
        >
          {/* Mobile Drag Indicator */}
          <div className={`w-10 h-1 rounded-full mx-auto mb-4 sm:hidden ${isPoster ? "bg-[#111111]/20" : "bg-zinc-800"}`} />

          {/* Close button */}
          <button
            onClick={closePortalLogin}
            className={`absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
              isPoster
                ? "text-[#111111] bg-[#f7f5f0] border-2 border-[#111111] hover:bg-[#eae6dd]"
                : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
            }`}
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isPoster
                ? "bg-[#f7f5f0] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111]"
                : "bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/25"
            }`}>
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <p className={`font-bold text-[9px] uppercase tracking-widest ${isPoster ? "text-[#666666]" : "text-zinc-500"}`}>
                {isCaptchaOnlyMode ? "Quick Verification" : isSessionExpired ? "Session Expired" : "Student Portal"}
              </p>
              <h3 className={`text-base font-bold tracking-tight font-display ${isPoster ? "text-[#111111]" : "text-zinc-100"}`}>
                {isCaptchaOnlyMode ? "Enter CAPTCHA to Resync" : "Connect Student Portal"}
              </h3>
            </div>
          </div>

          {/* Locked Identity Pill in Captcha-Only Mode */}
          {isCaptchaOnlyMode && (
            <div className={`flex items-center justify-between px-3 py-1.5 rounded-xl mb-4 text-xs ${
              isPoster
                ? "bg-[#f7f5f0] border-2 border-[#111111] text-[#111111]"
                : "bg-zinc-900/80 border border-white/5"
            }`}>
              <div className="flex items-center gap-2 font-mono">
                <span className={isPoster ? "text-[#111111] font-bold" : "text-zinc-300 font-semibold"}>{netId}</span>
                <span className={`text-[10px] flex items-center gap-0.5 ${isPoster ? "text-[#111111] font-bold" : "text-emerald-400"}`}>
                  <ShieldCheck className="w-3 h-3" /> Saved
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowFullForm(true)}
                className={`text-[10px] flex items-center gap-1 transition-colors ${
                  isPoster ? "text-[#111111] hover:underline font-bold" : "text-zinc-500 hover:text-cyan-400"
                }`}
              >
                <Edit3 className="w-2.5 h-2.5" /> Edit
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Form Fields (Only shown on First Setup or when clicking Edit) */}
            {!isCaptchaOnlyMode && (
              <div className={`space-y-3 p-3 rounded-2xl ${
                isPoster ? "bg-[#f7f5f0] border-2 border-[#111111]" : "bg-zinc-900/40 border border-white/5"
              }`}>
                {/* NetID */}
                <div>
                  <label className={`block text-[9px] font-bold uppercase tracking-wider mb-1 ${
                    isPoster ? "text-[#111111]" : "text-zinc-400"
                  }`}>
                    NetID (e.g. ag0892)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={netId}
                      onChange={(e) => setNetId(e.target.value)}
                      placeholder="ag0892"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      className={`w-full rounded-xl px-3 py-2 text-xs font-mono outline-none transition-all ${
                        isPoster
                          ? "bg-white border-2 border-[#111111] text-[#111111] shadow-[2px_2px_0px_#111111] focus:ring-1 focus:ring-[#111111]"
                          : "bg-zinc-900/90 border border-white/10 text-zinc-100 focus:border-cyan-400/50"
                      }`}
                    />
                    <User className={`absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isPoster ? "text-[#555555]" : "text-zinc-500"}`} />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className={`block text-[9px] font-bold uppercase tracking-wider mb-1 ${
                    isPoster ? "text-[#111111]" : "text-zinc-400"
                  }`}>
                    Portal Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter portal password"
                      autoComplete="current-password"
                      className={`w-full rounded-xl px-3 py-2 text-xs font-mono outline-none transition-all ${
                        isPoster
                          ? "bg-white border-2 border-[#111111] text-[#111111] shadow-[2px_2px_0px_#111111] focus:ring-1 focus:ring-[#111111]"
                          : "bg-zinc-900/90 border border-white/10 text-zinc-100 focus:border-cyan-400/50"
                      }`}
                    />
                    <Lock className={`absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isPoster ? "text-[#555555]" : "text-zinc-500"}`} />
                  </div>
                  <p className={`text-[9px] mt-1 ${isPoster ? "text-[#666666]" : "text-zinc-500"}`}>Saved on device so you only solve captcha in future.</p>
                </div>
              </div>
            )}

            {/* Captcha Section */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`block text-[9px] font-bold uppercase tracking-wider ${
                  isPoster ? "text-[#111111]" : "text-zinc-400"
                }`}>
                  Solve CAPTCHA
                </label>
                <button
                  type="button"
                  onClick={() => loadCaptcha(sessionId)}
                  disabled={captchaLoading}
                  className={`text-[10px] font-medium flex items-center gap-1 transition-colors disabled:opacity-50 ${
                    isPoster ? "text-[#111111] hover:underline font-bold" : "text-cyan-400 hover:text-cyan-300"
                  }`}
                >
                  <RefreshCw className={`w-2.5 h-2.5 ${captchaLoading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>

              {/* Captcha Image Container */}
              <div className={`h-16 rounded-2xl flex items-center justify-center p-1.5 overflow-hidden mb-2.5 ${
                isPoster
                  ? "bg-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111]"
                  : "bg-zinc-900 border border-white/10 shadow-inner"
              }`}>
                {captchaLoading ? (
                  <div className={`flex items-center gap-2 text-xs ${isPoster ? "text-[#555555]" : "text-zinc-500"}`}>
                    <Loader2 className={`w-4 h-4 animate-spin ${isPoster ? "text-[#111111]" : "text-cyan-400"}`} />
                    Fetching CAPTCHA...
                  </div>
                ) : captchaImage ? (
                  <img
                    src={captchaImage}
                    alt="Portal CAPTCHA"
                    className="max-h-full object-contain rounded p-1"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => loadCaptcha()}
                    className={`text-xs underline ${isPoster ? "text-[#111111] font-bold" : "text-cyan-400"}`}
                  >
                    Click to load CAPTCHA
                  </button>
                )}
              </div>

              {/* Centered Large CAPTCHA Input - Case Sensitive */}
              <input
                type="text"
                value={captcha}
                onChange={(e) => setCaptcha(e.target.value)}
                placeholder="Enter characters exactly"
                maxLength={8}
                autoFocus
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className={`w-full rounded-xl px-3 py-2.5 text-base font-mono text-center tracking-[0.2em] font-semibold outline-none transition-all placeholder:tracking-normal placeholder:font-normal placeholder:text-xs ${
                  isPoster
                    ? "bg-white border-2 border-[#111111] text-[#111111] shadow-[2px_2px_0px_#111111] placeholder:text-[#888888] focus:ring-1 focus:ring-[#111111]"
                    : "bg-zinc-900/90 border border-white/15 text-zinc-100 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 placeholder:text-zinc-600"
                }`}
              />
              <p className={`text-[9px] text-center mt-1 ${isPoster ? "text-[#666666]" : "text-zinc-500"}`}>
                Case-sensitive: type uppercase and lowercase exactly as shown.
              </p>
            </div>

            {/* Error / Success feedback */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-2.5 rounded-xl border flex items-start gap-2 text-xs ${
                  isPoster
                    ? "bg-[#fee2e2] border-2 border-[#e11d48] text-[#e11d48]"
                    : "bg-rose-500/10 border-rose-500/20 text-rose-300"
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-2.5 rounded-xl border flex items-start gap-2 text-xs ${
                  isPoster
                    ? "bg-[#ecfdf5] border-2 border-[#059669] text-[#059669]"
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{success}</span>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="pt-1 flex flex-col gap-2">
              <button
                type="submit"
                disabled={isSyncing || captchaLoading || !captcha.trim()}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  isPoster
                    ? "bg-[#111111] text-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111] hover:bg-[#222222] disabled:opacity-40"
                    : "text-zinc-950 bg-emerald-400 hover:bg-emerald-300 shadow-md shadow-emerald-500/20 disabled:opacity-40"
                }`}
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Resyncing Portal...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    {isCaptchaOnlyMode ? "Verify & Resync" : "Connect & Save"}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={closePortalLogin}
                className={`w-full py-2 px-4 rounded-xl text-xs font-bold transition-all text-center ${
                  isPoster
                    ? "bg-[#f7f5f0] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-[#eae6dd]"
                    : "bg-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-white/10"
                }`}
              >
                Skip for now
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
