"use client"

import type React from "react"
import { useState } from "react"
import { Eye, EyeOff, Loader2, Lock, Mail, X, AlertCircle, ExternalLink, Shield } from "lucide-react"
import { loginToSRM } from "@/lib/srm-api"
import { useAuth } from "@/lib/auth-context"
import { TurnstileWidget } from "@/components/turnstile-widget"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email,          setEmail]          = useState("")
  const [password,       setPassword]       = useState("")
  const [captchaAnswer,  setCaptchaAnswer]  = useState("")
  const [showPassword,   setShowPassword]   = useState(false)
  const [isLoading,      setIsLoading]      = useState(false)
  const [error,          setError]          = useState("")
  const [captchaImage,   setCaptchaImage]   = useState<string | null>(null)
  const [cdigest,        setCdigest]        = useState<string | null>(null)
  const [showCaptchaStep,setShowCaptchaStep]= useState(false)
  const [showTurnstile, setShowTurnstile]   = useState(false)
  const [turnstileToken, setTurnstileToken] = useState("")
  const [turnstileKey, setTurnstileKey] = useState(0)
  const { login } = useAuth()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    let normalizedEmail = email.trim()
    if (!normalizedEmail.includes("@")) {
      normalizedEmail = `${normalizedEmail}@srmist.edu.in`
    } else if (!normalizedEmail.endsWith("@srmist.edu.in")) {
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
        setError(result.captchaImage ? "" : result.error || "CAPTCHA required but no image returned. Try again.")
        setIsLoading(false)
        return
      }
      if (result.success && result.token) {
        login(result.token)
        onClose()
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

  const handleCaptchaSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!captchaAnswer) { setError("Please enter the CAPTCHA"); return }

    setIsLoading(true)
    try {
      let normalizedEmail = email.trim()
      if (!normalizedEmail.includes("@")) normalizedEmail = `${normalizedEmail}@srmist.edu.in`

      const result = await loginToSRM(normalizedEmail, password, captchaAnswer, cdigest || "")
      if (result.success && result.token) {
        login(result.token)
        onClose()
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

  const resetCaptcha = () => {
    setShowCaptchaStep(false)
    setCaptchaImage(null)
    setCdigest(null)
    setCaptchaAnswer("")
    setError("")
  }

  return (
    <>
      <style>{`
        .lm-overlay {
          position: fixed; inset: 0; z-index: 300;
          background:
            radial-gradient(circle at 14% 10%, rgba(52,211,153,0.18), transparent 24%),
            radial-gradient(circle at 85% 14%, rgba(34,211,238,0.14), transparent 26%),
            radial-gradient(circle at 50% 90%, rgba(167,139,250,0.12), transparent 28%),
            rgba(7,9,12,0.9);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
          animation: lmFadeIn 0.18s ease;
        }
        .lm-card {
          position: relative; width: 100%; max-width: 430px;
          background: linear-gradient(155deg, rgba(10,14,20,0.97), rgba(12,19,22,0.93) 55%, rgba(16,23,26,0.9));
          border: 1px solid rgba(52,211,153,0.2);
          border-radius: 30px;
          padding: 28px 24px 24px;
          max-height: 92vh; overflow-y: auto;
          box-shadow: 0 36px 90px rgba(0,0,0,0.56), inset 0 1px 0 rgba(255,255,255,0.14);
          animation: lmSlideUp 0.2s ease;
        }
        .lm-card { -ms-overflow-style: none; scrollbar-width: none; }
        .lm-card::-webkit-scrollbar { width: 0; height: 0; display: none; }
        .lm-card::before {
          content: "";
          position: absolute;
          inset: -1px;
          border-radius: 30px;
          pointer-events: none;
          background: radial-gradient(120% 80% at 5% 0%, rgba(52,211,153,0.15), transparent 42%), radial-gradient(90% 70% at 95% 20%, rgba(34,211,238,0.12), transparent 46%);
          z-index: 0;
        }
        .lm-card > * { position: relative; z-index: 1; }
        @keyframes lmFadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes lmSlideUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        .lm-input {
          width: 100%; background: rgba(9,9,11,0.8);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px; padding: 12px 14px 12px 42px;
          color: #d4d4d8; font-size: 14px; outline: none;
          transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
          -webkit-appearance: none;
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.2);
        }
        .lm-input:focus {
          border-color: rgba(52,211,153,0.5);
          background: rgba(9,9,11,0.95);
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.2), 0 0 0 3px rgba(52,211,153,0.08);
        }
        .lm-input::placeholder { color: rgba(255,255,255,0.15); }
        .lm-input-wrap { position: relative; }
        .lm-input-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: rgba(161,161,170,0.8); width: 16px; height: 16px;
          pointer-events: none;
        }
        .lm-eye {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: rgba(161,161,170,0.8); padding: 0; display: flex;
        }
        .lm-eye:hover { color: rgba(255,255,255,0.7); }
        .lm-btn {
          width: 100%; padding: 13px 14px;
          background: linear-gradient(135deg, #34d399, #10b981);
          color: #09090b; font-weight: 700; font-size: 14px;
          border: none; border-radius: 12px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: opacity 0.15s, transform 0.1s;
          box-shadow: 0 0 15px rgba(16,185,129,0.3);
        }
        .lm-btn:hover:not(:disabled) { opacity: 0.92; }
        .lm-btn:active:not(:disabled) { transform: scale(0.98); }
        .lm-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .lm-btn-ghost {
          flex: 1; padding: 11px;
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.5); font-size: 14px; font-weight: 500;
          border: 1px solid rgba(255,255,255,0.06); border-radius: 12px;
          cursor: pointer; transition: background 0.15s;
        }
        .lm-btn-ghost:hover { background: rgba(255,255,255,0.06); }
        .lm-close {
          position: absolute; top: 16px; right: 16px;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px;
          width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: rgba(255,255,255,0.35); transition: background 0.15s, color 0.15s;
        }
        .lm-close:hover { background: rgba(255,255,255,0.08); color: #f4f4f5; }
        .lm-error {
          display: flex; align-items: flex-start; gap: 8px;
          background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.2);
          border-radius: 10px; padding: 10px 12px;
          color: #f87171; font-size: 13px; line-height: 1.5;
          animation: lmFadeIn 0.15s ease;
        }
        .lm-label { font-size: 10px; font-weight: 700; color: #71717a; margin-bottom: 8px; display: block; letter-spacing: 0.12em; text-transform: uppercase; }
        .lm-secure {
          display: flex; align-items: flex-start; gap: 10px;
          background: rgba(52,211,153,0.06);
          border: 1px solid rgba(52,211,153,0.14);
          border-radius: 16px; padding: 12px 13px; margin-bottom: 20px;
        }
        .lm-top-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 10px; border-radius: 999px;
          background: linear-gradient(135deg, rgba(52,211,153,0.12), rgba(34,211,238,0.07));
          border: 1px solid rgba(52,211,153,0.22);
          color: #34d399; font-size: 10px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase;
          margin-bottom: 12px;
          box-shadow: 0 0 18px rgba(52,211,153,0.18);
        }
        .lm-orb-shell {
          width: 74px; height: 74px; margin: 0 auto 16px;
          border-radius: 24px;
          background: linear-gradient(145deg, rgba(52,211,153,0.34), rgba(34,211,238,0.24));
          border: 1px solid rgba(255,255,255,0.18);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.28), 0 16px 34px rgba(15,23,42,0.45);
          transform: perspective(700px) rotateX(12deg) rotateY(-8deg);
          display: flex; align-items: center; justify-content: center;
        }
        .lm-orb-core {
          width: 56px; height: 56px;
          border-radius: 18px;
          background: linear-gradient(135deg, #34d399, #06b6d4);
          border: 1px solid rgba(255,255,255,0.18);
          display: flex; align-items: center; justify-content: center;
          box-shadow: inset 0 2px 0 rgba(255,255,255,0.3), 0 10px 24px rgba(6,182,212,0.38);
        }
        .lm-spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .lm-overlay { padding: 10px; }
          .lm-card {
            max-width: 100%;
            max-height: 88vh;
            border-radius: 24px;
            padding: 18px 14px 14px;
          }
          .lm-top-badge { margin-bottom: 8px; font-size: 9px; padding: 5px 9px; }
          .lm-orb-shell { width: 58px; height: 58px; margin: 0 auto 10px; border-radius: 18px; }
          .lm-orb-core { width: 44px; height: 44px; border-radius: 14px; }
          .lm-secure { margin-bottom: 12px; padding: 10px; border-radius: 12px; }
          .lm-label { margin-bottom: 6px; font-size: 9px; }
          .lm-input { padding-top: 10px; padding-bottom: 10px; }
          .lm-btn { padding: 11px 12px; }
        }
      `}</style>

      {/* Overlay */}
      <div className="lm-overlay" onClick={onClose}>
        <div className="lm-card" onClick={e => e.stopPropagation()}>

          {/* Close */}
          <button className="lm-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 14 }}>
            <div className="lm-top-badge">
              <span style={{ width: 6, height: 6, borderRadius: 999, background: "#34d399" }} />
              Secure SRM Login
            </div>
            <div className="lm-orb-shell" aria-hidden="true">
              <span className="lm-orb-core">
                <Lock size={22} color="#04120f" />
              </span>
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: "#f4f4f5", margin: 0, letterSpacing: "-0.03em", fontFamily: "'Space Grotesk', sans-serif" }}>
              {showCaptchaStep ? "Verify Human" : "Connect edutechsrm"}
            </h2>
              <p style={{ fontSize: 12, color: "rgba(161,161,170,0.88)", marginTop: 5, lineHeight: 1.5 }}>
              {showCaptchaStep ? "SRM Academia needs one quick CAPTCHA check before we continue." : "Use your SRM Academia credentials and we’ll pull your live dashboard data."}
            </p>
          </div>

          {!showCaptchaStep ? (
            <>
              {/* Secure badge */}
              <div className="lm-secure">
                  <Shield size={15} color="#34d399" style={{ marginTop: 1, flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#34d399", margin: "0 0 2px" }}>Secure Connection</p>
                  <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.35)", margin: 0, lineHeight: 1.5 }}>
                    Connects directly to SRM Academia. We never store your password.
                  </p>
                </div>
              </div>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Email */}
                <div>
                  <label className="lm-label">SRM Email</label>
                  <div className="lm-input-wrap">
                    <Mail size={16} className="lm-input-icon" />
                    <input
                      type="text"
                      className="lm-input"
                      placeholder="yourid or yourid@srmist.edu.in"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      autoComplete="username"
                      required
                    />
                  </div>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>
                    e.g. ab1234 or ab1234@srmist.edu.in
                  </p>
                </div>

                {/* Password */}
                <div>
                  <label className="lm-label">Academia Password</label>
                  <div className="lm-input-wrap">
                    <Lock size={16} className="lm-input-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      className="lm-input"
                      style={{ paddingRight: 40 }}
                      placeholder="Your Academia password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                    <button type="button" className="lm-eye" onClick={() => setShowPassword(p => !p)}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="lm-error">
                    <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>{error}</span>
                  </div>
                )}

                {showTurnstile && (
                  <TurnstileWidget key={turnstileKey} onSuccess={(token) => setTurnstileToken(token)} />
                )}
                <button type="submit" className="lm-btn" disabled={isLoading || (showTurnstile && !turnstileToken)}>
                  {isLoading
                    ? <><Loader2 size={16} className="lm-spin" /> Connecting to SRM...</>
                    : "Continue to dashboard"
                  }
                </button>
              </form>
            </>
          ) : (
            <>
              {/* CAPTCHA step */}
              <div style={{ marginBottom: 16, padding: "10px 12px", background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 10 }}>
                <p style={{ fontSize: 13, color: "#fbbf24", margin: 0 }}>
                  SRM Academia requires a CAPTCHA to proceed.
                </p>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="lm-label">Solve the CAPTCHA</label>
                {captchaImage ? (
                  <div style={{ background: "#fff", borderRadius: 10, padding: 8, border: "1px solid rgba(255,255,255,0.1)" }}>
                    <img
                      src={captchaImage.startsWith("data:") ? captchaImage : `data:image/png;base64,${captchaImage}`}
                      alt="CAPTCHA"
                      style={{ width: "100%", height: 80, objectFit: "contain", display: "block" }}
                    />
                  </div>
                ) : (
                  <div style={{ padding: "10px 12px", background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 10, fontSize: 13, color: "#fbbf24" }}>
                    No image returned. Go back and try again.
                  </div>
                )}
              </div>

              <form onSubmit={handleCaptchaSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label className="lm-label">Enter the CAPTCHA text</label>
                  <div className="lm-input-wrap">
                    <input
                      type="text"
                      className="lm-input"
                      style={{ paddingLeft: 12 }}
                      placeholder="Type the characters shown above"
                      value={captchaAnswer}
                      onChange={e => setCaptchaAnswer(e.target.value)}
                      autoFocus
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="lm-error">
                    <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>{error}</span>
                  </div>
                )}

                <div style={{ display: "flex", gap: 10 }}>
                  <button type="button" className="lm-btn-ghost" onClick={resetCaptcha}>Back</button>
                  <button type="submit" className="lm-btn" disabled={isLoading} style={{ flex: 1 }}>
                    {isLoading
                      ? <><Loader2 size={16} className="lm-spin" /> Verifying...</>
                      : "Verify & Login"
                    }
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Footer */}
          <div style={{ marginTop: 22, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.07)", textAlign: "center" }}>
            <p style={{ fontSize: 11, color: "rgba(148,163,184,0.7)", margin: "0 0 10px", lineHeight: 1.6 }}>
              Your credentials go only to SRM for authentication. edutechsrm never stores your password.
            </p>
            <a href="https://academia.srmist.edu.in/" target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 12, color: "#34d399", display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none", fontWeight: 700 }}>
              <ExternalLink size={11} /> SRM Portal
            </a>
          </div>

        </div>
      </div>
    </>
  )
}
