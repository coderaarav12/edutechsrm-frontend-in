"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Eye, EyeOff, Loader2, Lock, Mail, AlertCircle, ArrowLeft, Rocket } from "lucide-react"
import { loginToSRM } from "@/lib/srm-api"
import { useAuth } from "@/lib/auth-context"
import { InstallPrompt } from "@/components/install-prompt"
import { TurnstileWidget } from "@/components/turnstile-widget"

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
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

  useEffect(() => {
    if (isAuthenticated) router.replace("/")
  }, [isAuthenticated, router])

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    let normalizedEmail = email.trim()
    if (!normalizedEmail.includes("@")) normalizedEmail = `${normalizedEmail}@srmist.edu.in`
    else if (!normalizedEmail.endsWith("@srmist.edu.in")) {
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
        try {
          localStorage.setItem("__srmites_count", String((Number(localStorage.getItem("__srmites_count")) || 120) + 1))
        } catch {}
        await login(result.token)
        router.replace("/")
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
    setIsLoading(true)
    try {
      let normalizedEmail = email.trim()
      if (!normalizedEmail.includes("@")) normalizedEmail = `${normalizedEmail}@srmist.edu.in`
      const result = await loginToSRM(normalizedEmail, password, captchaAnswer, cdigest || "")
      if (result.success && result.token) {
        try {
          localStorage.setItem("__srmites_count", String((Number(localStorage.getItem("__srmites_count")) || 120) + 1))
        } catch {}
        await login(result.token)
        router.replace("/")
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
        .login-input { width: 100%; height: 48px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.10); background: linear-gradient(180deg, rgba(8,11,16,0.95), rgba(7,10,14,0.9)); color: #d4d4d8; padding-left: 40px; padding-right: 12px; outline: none; box-shadow: inset 0 1px 0 rgba(255,255,255,0.04); transition: border-color 0.2s; font-size: 14px; }
        .login-input:focus { border-color: rgba(52,211,153,0.4); box-shadow: inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 3px rgba(52,211,153,0.08); }
        .login-input::placeholder { color: #52525b; }
        .login-btn { width: 100%; border-radius: 14px; border: 1px solid rgba(255,255,255,0.16); cursor: pointer; height: 50px; font-weight: 900; font-size: 17px; color: #07120d; background: linear-gradient(135deg, #34d399, #10b981); box-shadow: 0 12px 28px rgba(16,185,129,0.30); transition: all 0.2s; letter-spacing: 0.01em; }
        .login-btn:hover { box-shadow: 0 16px 36px rgba(16,185,129,0.40); transform: translateY(-1px); }
        .login-btn:active { transform: translateY(0); box-shadow: 0 6px 16px rgba(16,185,129,0.25); }
        .login-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
      `}</style>
      <div className="relative flex min-h-dvh items-center justify-center px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <InstallPrompt />
          <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-2xl sm:p-8" style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.50)" }}>

            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 mb-5 transition-colors hover:text-zinc-300">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to home
            </Link>

            <div className="text-center mb-6">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border bg-zinc-950/50" style={{ borderColor: "rgba(52,211,153,0.267)", color: "#34d399" }}>
                <Lock className="h-6 w-6" />
              </div>
              <h1 className="font-display text-2xl font-black tracking-tight text-zinc-50 sm:text-[26px]">Sign in to edutechsrm</h1>
              <p className="mt-2 text-sm text-zinc-400">Secure SRM login with live data sync.</p>
            </div>

            {!showCaptchaStep ? (
              <form onSubmit={submitLogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.12em] text-zinc-500">SRM Email</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#52525b" }} />
                    <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="yourid or yourid@srmist.edu.in" autoComplete="username" required className="login-input" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.12em] text-zinc-500">Academia Password</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#52525b" }} />
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Academia password" autoComplete="current-password" required className="login-input" style={{ paddingRight: 44 }} />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-lg border bg-white/[0.03] text-zinc-500 hover:text-zinc-300 transition-colors" style={{ width: 28, height: 28, borderColor: "rgba(255,255,255,0.1)" }}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <a href="https://academia.srmist.edu.in/reset" target="_blank" rel="noopener noreferrer" className="text-[11px] transition-colors text-center mt-2" style={{ color: "#71717a" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#a1a1aa" }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "#71717a" }}>
                    Can't get in? Recover account
                  </a>
                </div>

                {error && (
                  <div className="flex gap-2 rounded-xl border p-2.5 text-sm" style={{ borderColor: "rgba(248,113,113,0.18)", background: "rgba(248,113,113,0.07)", color: "#f87171" }}>
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}
                  </div>
                )}

                {showTurnstile && (
                  <TurnstileWidget key={turnstileKey} onSuccess={(token) => setTurnstileToken(token)} />
                )}
                <button type="submit" disabled={isLoading || (showTurnstile && !turnstileToken)} className="login-btn">
                  {isLoading ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Connecting...</span> : "Continue"}
                </button>
              </form>
            ) : (
              <form onSubmit={submitCaptcha} className="flex flex-col gap-4">
                {captchaImage && (
                  <div className="overflow-hidden rounded-xl bg-white p-2">
                    <img src={captchaImage.startsWith("data:") ? captchaImage : `data:image/png;base64,${captchaImage}`} alt="CAPTCHA" className="h-20 w-full object-contain" />
                  </div>
                )}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.12em] text-zinc-500">Enter CAPTCHA</label>
                  <input value={captchaAnswer} onChange={(e) => setCaptchaAnswer(e.target.value)} placeholder="Type the text above" required className="login-input" style={{ paddingLeft: 12 }} />
                </div>
                {error && (
                  <div className="flex gap-2 rounded-xl border p-2.5 text-sm" style={{ borderColor: "rgba(248,113,113,0.18)", background: "rgba(248,113,113,0.07)", color: "#f87171" }}>
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}
                  </div>
                )}
                <button type="submit" disabled={isLoading} className="login-btn">
                  {isLoading ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Verifying...</span> : "Verify and continue"}
                </button>
              </form>
            )}

            <p className="mt-5 text-center text-[11px] leading-relaxed text-zinc-600">
              By signing in, you agree to our{" "}
              <Link href="/terms" className="underline decoration-zinc-600 transition-colors hover:text-zinc-400 hover:decoration-zinc-400">Terms</Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline decoration-zinc-600 transition-colors hover:text-zinc-400 hover:decoration-zinc-400">Privacy Policy</Link>.
            </p>
          </div>
        </motion.div>
      </div>
    </>
  )
}
