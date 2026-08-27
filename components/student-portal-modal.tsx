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
  Edit2,
  KeyRound,
} from "lucide-react"
import { useStudentPortal } from "@/lib/student-portal-context"
import { useAuth } from "@/lib/auth-context"

// NetID is the email prefix (e.g. ag0892) before @srmist.edu.in, NOT the roll number (RA...)
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

  const [netId, setNetId] = useState("")
  const [isEditingNetId, setIsEditingNetId] = useState(false)
  const [password, setPassword] = useState("")
  const [isEditingPassword, setIsEditingPassword] = useState(false)
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
      setIsEditingNetId(false)
    } else {
      setIsEditingNetId(true)
    }

    const savedPass = getStoredPassword()
    if (savedPass) {
      setPassword(savedPass)
      setIsEditingPassword(false)
    } else {
      setPassword("")
      setIsEditingPassword(true)
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
      return
    }

    if (!password) {
      setError("Please enter your Student Portal password.")
      return
    }

    if (!captcha.trim()) {
      setError("Please enter the CAPTCHA code.")
      return
    }

    const res = await loginPortal(cleanNetId, password, captcha, sessionId)
    if (res.success) {
      setSuccess("Resynced! Fresh attendance and semester grades are now live.")
      setTimeout(() => {
        closePortalLogin()
      }, 900)
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

  const isQuickResync = Boolean(netId && !isEditingNetId && password && !isEditingPassword)

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
        {/* Mobile Backdrop Tap */}
        <div className="absolute inset-0" onClick={closePortalLogin} />

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.98 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md max-sm:rounded-t-3xl sm:rounded-3xl p-5 sm:p-7 overflow-hidden bg-zinc-950 border border-white/10 ring-1 ring-white/5 shadow-2xl max-h-[92dvh] overflow-y-auto"
        >
          {/* Mobile Drag Indicator */}
          <div className="w-10 h-1 rounded-full bg-zinc-800 mx-auto mb-4 sm:hidden" />

          {/* Close button */}
          <button
            onClick={closePortalLogin}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-xl flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/25 shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest">
                {isQuickResync ? "Quick Portal Resync" : isSessionExpired ? "Session Expired" : "Student Portal Scraper"}
              </p>
              <h3 className="text-lg font-bold text-zinc-100 tracking-tight font-display">
                {isQuickResync ? "Verify Captcha to Resync" : isSessionExpired ? "Reconnect Student Portal" : "Connect Student Portal"}
              </h3>
            </div>
          </div>

          <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
            {isQuickResync
              ? "Your credentials are auto-saved. Simply type the CAPTCHA to fetch fresh attendance and marks."
              : isSessionExpired
              ? "Your portal session has expired. Verify your password and captcha to re-authenticate."
              : "Connect once to unlock all semester grades, CGPA, credits, and live portal attendance."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Translucent NetID field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  NetID
                </label>
                {netId && !isEditingNetId ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-emerald-400/90 flex items-center gap-1 font-mono">
                      <ShieldCheck className="w-3 h-3" /> Auto-linked
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditingNetId(true)}
                      className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-0.5"
                    >
                      <Edit2 className="w-2.5 h-2.5" /> Edit
                    </button>
                  </div>
                ) : null}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={netId}
                  onChange={(e) => setNetId(e.target.value)}
                  placeholder="e.g. ag0892"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  readOnly={!isEditingNetId && Boolean(netId)}
                  disabled={!isEditingNetId && Boolean(netId)}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-sm font-mono transition-all outline-none ${
                    !isEditingNetId && Boolean(netId)
                      ? "bg-zinc-900/40 border border-white/5 text-zinc-300 opacity-75 cursor-not-allowed select-none"
                      : "bg-zinc-900/80 border border-white/10 text-zinc-100 focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
                  }`}
                />
                <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              </div>
            </div>

            {/* Password field with Saved status & Edit toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Portal Password
                </label>
                {password && !isEditingPassword ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-emerald-400/90 flex items-center gap-1 font-mono">
                      <KeyRound className="w-3 h-3" /> Saved
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditingPassword(true)}
                      className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-0.5"
                    >
                      <Edit2 className="w-2.5 h-2.5" /> Edit
                    </button>
                  </div>
                ) : null}
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter student portal password"
                  autoComplete="current-password"
                  readOnly={!isEditingPassword && Boolean(password)}
                  disabled={!isEditingPassword && Boolean(password)}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-sm font-mono transition-all outline-none ${
                    !isEditingPassword && Boolean(password)
                      ? "bg-zinc-900/40 border border-white/5 text-zinc-300 opacity-75 cursor-not-allowed select-none"
                      : "bg-zinc-900/80 border border-white/10 text-zinc-100 focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
                  }`}
                />
                <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              </div>
            </div>

            {/* Captcha */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  CAPTCHA Code
                </label>
                <button
                  type="button"
                  onClick={() => loadCaptcha(sessionId)}
                  disabled={captchaLoading}
                  className="text-[11px] font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${captchaLoading ? "animate-spin" : ""}`} />
                  Refresh Captcha
                </button>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-14 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center p-1.5 overflow-hidden">
                  {captchaLoading ? (
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                      Fetching CAPTCHA...
                    </div>
                  ) : captchaImage ? (
                    <img
                      src={captchaImage}
                      alt="Portal CAPTCHA"
                      className="max-h-full object-contain rounded bg-white/5 p-0.5"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => loadCaptcha()}
                      className="text-xs text-cyan-400 underline"
                    >
                      Click to load CAPTCHA
                    </button>
                  )}
                </div>
              </div>

              <input
                type="text"
                value={captcha}
                onChange={(e) => setCaptcha(e.target.value)}
                placeholder="Enter characters exactly"
                maxLength={8}
                autoFocus={Boolean(netId && password && !isEditingPassword)}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className="w-full rounded-xl bg-zinc-900/80 border border-white/10 px-3.5 py-2.5 text-sm text-zinc-100 font-mono text-center tracking-widest focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 outline-none transition-all"
              />
              <p className="text-[10px] text-zinc-500 text-center mt-1">
                Case-sensitive: type letters and numbers exactly as shown above.
              </p>
            </div>

            {/* Error / Success feedback */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-300"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 text-xs text-emerald-300"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{success}</span>
              </motion.div>
            )}

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={closePortalLogin}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-zinc-400 hover:text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-white/5 transition-all"
              >
                Dismiss
              </button>
              <button
                type="submit"
                disabled={isSyncing || captchaLoading}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Resyncing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    {isQuickResync ? "Resync Now" : isSessionExpired ? "Re-authenticate" : "Authenticate"}
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
