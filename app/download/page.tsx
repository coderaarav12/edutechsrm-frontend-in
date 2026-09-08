"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  ArrowDown,
  Globe,
  Shield,
  Smartphone,
  Sparkles,
  Download,
  Check,
  ShieldCheck,
  Zap,
  Clock,
  Navigation,
  QrCode as QrIcon,
  Apple,
  Laptop,
  Share2,
} from "lucide-react"
import { Header } from "@/components/Header"
import { PublicFooter } from "@/components/public-footer"
import { QrCode } from "@/components/qr-code"

const mobileFeatures = [
  {
    icon: Clock,
    title: "Instant Day Order & Schedule",
    desc: "Wakes up before your morning alarm. Know your current Day Order, room number, timetable slot, and first-hour course with zero Academia portal lag.",
    tag: "01 // SCHEDULE",
    color: "#34d399",
  },
  {
    icon: ShieldCheck,
    title: "Dynamic Bunk Shield",
    desc: "Exact algorithmic math on how many hours you can afford to skip while keeping your attendance strictly above SRMIST's 75% cutoff.",
    tag: "02 // ATTENDANCE",
    color: "#38bdf8",
  },
  {
    icon: Zap,
    title: "Offline Academic Vault",
    desc: "Cached timetable, course catalog, internal marks, and exam circulars available instantly even inside cellular dead-zones in TP basement.",
    tag: "03 // OFFLINE",
    color: "#fbbf24",
  },
  {
    icon: Navigation,
    title: "Instant Campus Cartography",
    desc: "Tap any class or lab room number in your timetable to immediately reveal turn-by-turn walking directions and floor lift locations.",
    tag: "04 // RADAR",
    color: "#f472b6",
  },
]

export default function DownloadPage() {
  const [copied, setCopied] = useState(false)
  const [isPoster, setIsPoster] = useState(false)

  useEffect(() => {
    const check = () => {
      if (typeof document !== "undefined") {
        const m = document.documentElement.getAttribute("data-landing-mode")
        setIsPoster(m === "poster")
      }
    }
    check()
    window.addEventListener("landing-mode-change", check)
    window.addEventListener("storage", check)
    return () => {
      window.removeEventListener("landing-mode-change", check)
      window.removeEventListener("storage", check)
    }
  }, [])

  const handleCopyLink = () => {
    const url = "https://play.google.com/store/apps/details?id=in.edutechsrm.edutechsrm"
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <>
      <Header />
      
      {/* Dynamic Poster Mode Theme Styles */}
      <style>{`
        [data-landing-mode="poster"] .dl-page-shell {
          background-color: #f4efe6 !important;
          color: #111111 !important;
        }
        [data-landing-mode="poster"] .dl-card-brutal {
          background: #ffffff !important;
          border: 2.5px solid #111111 !important;
          box-shadow: 6px 6px 0px #111111 !important;
          color: #111111 !important;
        }
        [data-landing-mode="poster"] .dl-subcard {
          background: #faf7f2 !important;
          border: 2px solid #111111 !important;
          box-shadow: 3px 3px 0px #111111 !important;
          color: #111111 !important;
        }
        [data-landing-mode="poster"] .dl-btn-primary {
          background: #111111 !important;
          color: #ffffff !important;
          border: 2px solid #111111 !important;
          box-shadow: 4px 4px 0px #111111 !important;
        }
        [data-landing-mode="poster"] .dl-btn-primary:hover {
          background: #222222 !important;
        }
        [data-landing-mode="poster"] .dl-btn-secondary {
          background: #ffffff !important;
          color: #111111 !important;
          border: 2px solid #111111 !important;
          box-shadow: 3px 3px 0px #111111 !important;
        }
        [data-landing-mode="poster"] .dl-tag-pill {
          background: #ffffff !important;
          border: 1.5px solid #111111 !important;
          color: #111111 !important;
          box-shadow: 2px 2px 0px #111111 !important;
        }
      `}</style>

      <main className={`dl-page-shell relative min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-12 transition-colors duration-300 ${isPoster ? "bg-[#f4efe6] text-[#111111]" : "bg-[#070a0e] text-zinc-100"}`}>
        <div className="mx-auto max-w-6xl">
          
          {/* ── 1. Editorial Header ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-widest"
              style={{
                borderColor: isPoster ? "#111111" : "rgba(52,211,153,0.3)",
                background: isPoster ? "#ffffff" : "rgba(52,211,153,0.1)",
                color: isPoster ? "#111111" : "#34d399",
                boxShadow: isPoster ? "2px 2px 0px #111111" : "none",
              }}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>005 // CLIENT DISTRIBUTION • ANDROID & WEB PWA</span>
            </div>

            <h1 className="font-display mt-6 text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl leading-[1.02]"
              style={{ color: isPoster ? "#111111" : "#ffffff" }}
            >
              Your Entire Campus Life. <br />
              <span className="font-serif italic font-normal" style={{ color: isPoster ? "#059669" : "#34d399" }}>
                Unthrottled in Your Pocket.
              </span>
            </h1>

            <p className="mt-4 text-base sm:text-lg leading-relaxed font-sans"
              style={{ color: isPoster ? "#444444" : "#a1a1aa" }}
            >
              Native Android app with instant morning Day Order alerts, smart attendance shortage warnings, offline academic vault, and 120ms Academia sync. Available on Google Play and Web.
            </p>

            <div className="mt-4 inline-block transform -rotate-1 rounded-xl px-4 py-1.5"
              style={{
                background: isPoster ? "rgba(11,122,84,0.12)" : "rgba(52,211,153,0.1)",
                border: isPoster ? "1.5px solid #111111" : "1px solid rgba(52,211,153,0.3)",
              }}
            >
              <span className="font-handwriting text-sm sm:text-base font-medium"
                style={{
                  fontFamily: "var(--font-caveat, 'Caveat', cursive)",
                  fontSize: "19px",
                  color: isPoster ? "#0b7a54" : "#6ee7b7",
                }}
              >
                &ldquo;Opens in 0.2s outside Tech Park. No 15-minute portal queues.&rdquo;
              </span>
            </div>
          </motion.div>

          {/* ── 2. Primary Showcase Box: Google Play & Interactive Phone UI ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="dl-card-brutal rounded-3xl p-6 sm:p-10 mb-14"
            style={{
              background: isPoster ? "#ffffff" : "rgba(255,255,255,0.035)",
              border: isPoster ? "2.5px solid #111111" : "1px solid rgba(255,255,255,0.1)",
              boxShadow: isPoster ? "8px 8px 0px #111111" : "0 25px 50px -12px rgba(0,0,0,0.5)",
            }}
          >
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-center">
              
              {/* Left Column: Direct Action & Download Details */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="dl-tag-pill rounded-full px-3 py-1 text-[11px] font-mono font-bold uppercase"
                    style={{
                      background: isPoster ? "#faf7f2" : "rgba(16,185,129,0.12)",
                      border: isPoster ? "1.5px solid #111111" : "1px solid rgba(16,185,129,0.3)",
                      color: isPoster ? "#111111" : "#34d399",
                    }}
                  >
                    Google Play Verified
                  </span>
                  <span className="dl-tag-pill rounded-full px-3 py-1 text-[11px] font-mono font-bold uppercase"
                    style={{
                      background: isPoster ? "#faf7f2" : "rgba(255,255,255,0.05)",
                      border: isPoster ? "1.5px solid #111111" : "1px solid rgba(255,255,255,0.1)",
                      color: isPoster ? "#111111" : "#d4d4d8",
                    }}
                  >
                    Version 2.4.0 (Latest)
                  </span>
                  <span className="dl-tag-pill rounded-full px-3 py-1 text-[11px] font-mono font-bold uppercase"
                    style={{
                      background: isPoster ? "#faf7f2" : "rgba(255,255,255,0.05)",
                      border: isPoster ? "1.5px solid #111111" : "1px solid rgba(255,255,255,0.1)",
                      color: isPoster ? "#111111" : "#d4d4d8",
                    }}
                  >
                    100% Free
                  </span>
                </div>

                <h2 className="font-display text-3xl sm:text-4xl font-black leading-tight" style={{ color: isPoster ? "#111111" : "#ffffff" }}>
                  Download for Android
                </h2>

                <p className="text-sm sm:text-base leading-relaxed" style={{ color: isPoster ? "#444444" : "#d4d4d8" }}>
                  Get the official native APK straight from the Google Play Store with Play Protect security verification. Automatic updates, low battery consumption, and zero background data drain.
                </p>

                {/* Primary Button Group */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <a
                    href="https://play.google.com/store/apps/details?id=in.edutechsrm.edutechsrm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dl-btn-primary inline-flex items-center justify-center gap-3 rounded-2xl px-7 py-4 text-sm font-mono font-black uppercase tracking-wider transition-all active:scale-[0.98]"
                    style={{
                      background: isPoster ? "#111111" : "#34d399",
                      color: isPoster ? "#ffffff" : "#09090b",
                      border: isPoster ? "2px solid #111111" : "none",
                      boxShadow: isPoster ? "4px 4px 0px #111111" : "0 12px 28px rgba(52,211,153,0.35)",
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                      <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 010 1.38l-2.302 2.302L15.394 12l2.304-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302L5.864 2.658z"/>
                    </svg>
                    <span>Get on Google Play</span>
                  </a>

                  <a
                    href="/login"
                    className="dl-btn-secondary inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-xs font-mono font-bold uppercase tracking-wider transition-all active:scale-[0.98]"
                    style={{
                      background: isPoster ? "#ffffff" : "rgba(255,255,255,0.05)",
                      border: isPoster ? "2px solid #111111" : "1px solid rgba(255,255,255,0.15)",
                      color: isPoster ? "#111111" : "#ffffff",
                    }}
                  >
                    <Globe className="h-4 w-4" />
                    <span>Launch Web Client →</span>
                  </a>
                </div>

                {/* Specs metadata grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t"
                  style={{ borderColor: isPoster ? "rgba(17,17,17,0.1)" : "rgba(255,255,255,0.08)" }}
                >
                  <div>
                    <span className="block font-mono text-[10px] uppercase font-bold" style={{ color: isPoster ? "#777777" : "#71717a" }}>App Package</span>
                    <span className="block font-mono text-xs font-bold mt-0.5" style={{ color: isPoster ? "#111111" : "#ffffff" }}>in.edutechsrm</span>
                  </div>
                  <div>
                    <span className="block font-mono text-[10px] uppercase font-bold" style={{ color: isPoster ? "#777777" : "#71717a" }}>Download Size</span>
                    <span className="block font-mono text-xs font-bold mt-0.5" style={{ color: isPoster ? "#111111" : "#ffffff" }}>~14 MB</span>
                  </div>
                  <div>
                    <span className="block font-mono text-[10px] uppercase font-bold" style={{ color: isPoster ? "#777777" : "#71717a" }}>Target OS</span>
                    <span className="block font-mono text-xs font-bold mt-0.5" style={{ color: isPoster ? "#111111" : "#ffffff" }}>Android 8.0+</span>
                  </div>
                  <div>
                    <span className="block font-mono text-[10px] uppercase font-bold" style={{ color: isPoster ? "#777777" : "#71717a" }}>Credentials</span>
                    <span className="block font-mono text-xs font-bold mt-0.5" style={{ color: isPoster ? "#059669" : "#34d399" }}>0 Stored</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Active Schedule & Morning Pulse Preview */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-[320px] rounded-[36px] p-4 relative"
                  style={{
                    background: isPoster ? "#f4efe6" : "#0f141c",
                    border: isPoster ? "3px solid #111111" : "2px solid rgba(255,255,255,0.12)",
                    boxShadow: isPoster ? "8px 8px 0px #111111" : "0 25px 60px rgba(0,0,0,0.6)",
                  }}
                >
                  {/* Phone Notch */}
                  <div className="mx-auto h-4 w-24 rounded-full mb-4"
                    style={{ background: isPoster ? "#111111" : "#1e2633" }}
                  />

                  {/* Pulse Card 1: 07:58 AM Alarm & Day Order */}
                  <div className="rounded-2xl p-4 mb-3"
                    style={{
                      background: isPoster ? "#ffffff" : "rgba(255,255,255,0.04)",
                      border: isPoster ? "2px solid #111111" : "1px solid rgba(255,255,255,0.08)",
                      boxShadow: isPoster ? "3px 3px 0px #111111" : "none",
                    }}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                      <span style={{ color: isPoster ? "#059669" : "#34d399" }}>● DAY ORDER 4</span>
                      <span style={{ color: isPoster ? "#777777" : "#71717a" }}>07:58 AM</span>
                    </div>
                    <div className="mt-2 font-display text-lg font-black" style={{ color: isPoster ? "#111111" : "#ffffff" }}>
                      Calculus & Lin. Alg
                    </div>
                    <div className="mt-0.5 flex items-center justify-between text-xs font-mono" style={{ color: isPoster ? "#555555" : "#a1a1aa" }}>
                      <span>Tech Park · Room 402</span>
                      <span className="font-bold text-emerald-500">Starts in 2m</span>
                    </div>
                  </div>

                  {/* Pulse Card 2: Bunk Shield Status */}
                  <div className="rounded-2xl p-4 mb-3"
                    style={{
                      background: isPoster ? "#ffffff" : "rgba(255,255,255,0.04)",
                      border: isPoster ? "2px solid #111111" : "1px solid rgba(255,255,255,0.08)",
                      boxShadow: isPoster ? "3px 3px 0px #111111" : "none",
                    }}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                      <span style={{ color: isPoster ? "#111111" : "#e4e4e7" }}>BUNK SHIELD</span>
                      <span className="text-emerald-500">SAFE (+2)</span>
                    </div>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="text-2xl font-black font-display text-emerald-400">76.4%</span>
                      <span className="text-xs font-mono" style={{ color: isPoster ? "#555555" : "#a1a1aa" }}>Threshold: 75%</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full rounded-full overflow-hidden" style={{ background: isPoster ? "#eeeeee" : "rgba(255,255,255,0.1)" }}>
                      <div className="h-full rounded-full bg-emerald-400" style={{ width: "76.4%" }} />
                    </div>
                  </div>

                  {/* Status Micro-Badge */}
                  <div className="text-center pt-2">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider" style={{ color: isPoster ? "#666666" : "#71717a" }}>
                      EDUTECHSRM • ZERO-LAG ACADEMIA SYNC
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>

          {/* ── 3. Four Core Mobile Superpowers Grid ── */}
          <div className="mb-14">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: isPoster ? "#111111" : "#a1a1aa" }}>
                TACTICAL MOBILE ARCHITECTURE
              </h3>
              <span className="font-mono text-[11px] text-zinc-500">Engineered for SRMIST KTR daily life</span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {mobileFeatures.map((feat) => (
                <div
                  key={feat.title}
                  className="dl-card-brutal rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between"
                  style={{
                    background: isPoster ? "#ffffff" : "rgba(255,255,255,0.035)",
                    border: isPoster ? "2px solid #111111" : "1px solid rgba(255,255,255,0.08)",
                    boxShadow: isPoster ? "4px 4px 0px #111111" : "none",
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl"
                        style={{
                          background: isPoster ? "#faf7f2" : "rgba(255,255,255,0.05)",
                          border: isPoster ? "1.5px solid #111111" : "1px solid rgba(255,255,255,0.1)",
                          color: feat.color,
                        }}
                      >
                        <feat.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <span className="font-mono text-[8px] sm:text-[9px] font-bold uppercase" style={{ color: feat.color }}>
                        {feat.tag}
                      </span>
                    </div>

                    <h4 className="font-display font-bold text-xs sm:text-base mb-1" style={{ color: isPoster ? "#111111" : "#ffffff" }}>
                      {feat.title}
                    </h4>
                    <p className="text-[11px] sm:text-xs leading-relaxed font-sans line-clamp-3 sm:line-clamp-none" style={{ color: isPoster ? "#555555" : "#a1a1aa" }}>
                      {feat.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── 4. Cross-Platform Support Matrix: iOS, Mac, Windows, Linux ── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 mb-14">
            
            {/* iOS & Desktop PWA Card */}
            <div className="lg:col-span-8 dl-card-brutal rounded-3xl p-6 sm:p-8"
              style={{
                background: isPoster ? "#ffffff" : "rgba(255,255,255,0.035)",
                border: isPoster ? "2.5px solid #111111" : "1px solid rgba(255,255,255,0.1)",
                boxShadow: isPoster ? "6px 6px 0px #111111" : "none",
              }}
            >
              <div className="flex items-center gap-2 mb-2 font-mono text-xs font-bold uppercase tracking-wider" style={{ color: isPoster ? "#059669" : "#34d399" }}>
                <Globe className="h-4 w-4" />
                <span>CROSS-PLATFORM INSTALLATION</span>
              </div>

              <h3 className="font-display text-2xl font-black mb-2" style={{ color: isPoster ? "#111111" : "#ffffff" }}>
                Using an iPhone, Mac, or Windows Laptop?
              </h3>
              <p className="text-sm leading-relaxed mb-6" style={{ color: isPoster ? "#444444" : "#a1a1aa" }}>
                edutechsrm is engineered as an installable Progressive Web App (PWA). You get an identical offline-first app experience on Apple devices and desktops without downloading an APK.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="dl-subcard rounded-2xl p-4"
                  style={{
                    background: isPoster ? "#faf7f2" : "rgba(255,255,255,0.03)",
                    border: isPoster ? "2px solid #111111" : "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div className="flex items-center gap-2 font-mono text-xs font-bold mb-1" style={{ color: isPoster ? "#111111" : "#ffffff" }}>
                    <Apple className="h-4 w-4" />
                    <span>Apple iOS (iPhone / iPad)</span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: isPoster ? "#555555" : "#a1a1aa" }}>
                    Open <strong>edutechsrm.in</strong> in Safari, tap the Share button at the bottom, and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong>.
                  </p>
                </div>

                <div className="dl-subcard rounded-2xl p-4"
                  style={{
                    background: isPoster ? "#faf7f2" : "rgba(255,255,255,0.03)",
                    border: isPoster ? "2px solid #111111" : "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div className="flex items-center gap-2 font-mono text-xs font-bold mb-1" style={{ color: isPoster ? "#111111" : "#ffffff" }}>
                    <Laptop className="h-4 w-4" />
                    <span>Desktop (Mac / Windows / Linux)</span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: isPoster ? "#555555" : "#a1a1aa" }}>
                    Open in Chrome or Edge, click the <strong>&ldquo;Install App&rdquo;</strong> icon in the address bar for a standalone desktop window.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t flex flex-wrap items-center justify-between gap-4"
                style={{ borderColor: isPoster ? "rgba(17,17,17,0.1)" : "rgba(255,255,255,0.08)" }}
              >
                <a
                  href="/login"
                  className="dl-btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider"
                  style={{
                    background: isPoster ? "#111111" : "#34d399",
                    color: isPoster ? "#ffffff" : "#09090b",
                    border: isPoster ? "2px solid #111111" : "none",
                  }}
                >
                  <span>Open Web Client in Browser →</span>
                </a>

                <button
                  onClick={handleCopyLink}
                  className="dl-btn-secondary inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-mono font-bold"
                  style={{
                    background: isPoster ? "#ffffff" : "rgba(255,255,255,0.05)",
                    border: isPoster ? "1.5px solid #111111" : "1px solid rgba(255,255,255,0.1)",
                    color: isPoster ? "#111111" : "#d4d4d8",
                  }}
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5" />}
                  <span>{copied ? "Link Copied!" : "Copy App Store Link"}</span>
                </button>
              </div>
            </div>

            {/* Scan to Install on Phone QR Card (Desktop only, hidden on mobile) */}
            <div className="hidden lg:flex lg:col-span-4 dl-card-brutal rounded-3xl p-6 text-center flex-col justify-between items-center"
              style={{
                background: isPoster ? "#ffffff" : "rgba(255,255,255,0.035)",
                border: isPoster ? "2.5px solid #111111" : "1px solid rgba(255,255,255,0.1)",
                boxShadow: isPoster ? "6px 6px 0px #111111" : "none",
              }}
            >
              <div>
                <div className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: isPoster ? "#059669" : "#34d399" }}>
                  <QrIcon className="h-3.5 w-3.5" />
                  <span>DESKTOP TO PHONE</span>
                </div>
                <h4 className="font-display font-bold text-lg mb-1" style={{ color: isPoster ? "#111111" : "#ffffff" }}>
                  Scan to Install on Phone
                </h4>
                <p className="text-xs mb-4" style={{ color: isPoster ? "#666666" : "#a1a1aa" }}>
                  Point your phone camera here to jump straight to Google Play.
                </p>
              </div>

              <div className="p-3 rounded-2xl"
                style={{
                  background: isPoster ? "#ffffff" : "#ffffff",
                  border: isPoster ? "2px solid #111111" : "2px solid rgba(255,255,255,0.2)",
                }}
              >
                <QrCode size={190} />
              </div>

              <span className="font-mono text-[10px] text-zinc-500 mt-3">
                play.google.com/store/apps/details?id=in.edutechsrm
              </span>
            </div>

          </div>

          {/* ── 5. Safe & Independent Project Disclaimer ── */}
          <div className="text-center pt-4">
            <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
              style={{
                borderColor: isPoster ? "#111111" : "rgba(255,255,255,0.1)",
                background: isPoster ? "#ffffff" : "rgba(255,255,255,0.03)",
                color: isPoster ? "#555555" : "#a1a1aa",
              }}
            >
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs font-mono">
                Independent student-built project · Not affiliated with SRMIST · Zero passwords stored
              </span>
            </div>
          </div>

        </div>
      </main>

      <PublicFooter />
    </>
  )
}