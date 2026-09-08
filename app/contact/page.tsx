"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Bookmark,
  Github,
  Heart,
  Instagram,
  Mail,
  MapPin,
  ShieldCheck,
  Terminal,
  Zap,
  Check,
  Copy,
  ExternalLink,
  Cpu,
} from "lucide-react"
import { Header } from "@/components/Header"
import { useSupport } from "@/lib/use-support"
import { SupportModal } from "@/components/support-modal"
import { PublicFooter } from "@/components/public-footer"

const verifiedSocials = [
  {
    icon: Mail,
    label: "Email / Bug Reports",
    handle: "admin@edutechsrm.in",
    href: "mailto:admin@edutechsrm.in",
    desc: "Direct bug reports, feature ideas & official inquiries",
    badge: "Direct Mail",
    accent: "#f59e0b",
    isEmail: true,
  },
  {
    icon: Instagram,
    label: "Instagram Community",
    handle: "@edutechsrm",
    href: "https://www.instagram.com/edutechsrm",
    desc: "Direct DMs, campus updates & feature announcements",
    badge: "Active Daily",
    accent: "#e1306c",
  },
  {
    icon: Github,
    label: "GitHub Repository",
    handle: "@coderaarav12",
    href: "https://github.com/coderaarav12",
    desc: "Open-source codebase, releases & issue tracking",
    badge: "Open Source",
    accent: "#10b981",
  },
  {
    icon: Bookmark,
    label: "LinkedIn Profile",
    handle: "in/aaravgoel12",
    href: "https://www.linkedin.com/in/aaravgoel12/",
    desc: "Professional background, tech stack & career journey",
    badge: "Connect",
    accent: "#0a66c2",
  },
]

export default function ContactPage() {
  const { isSupportOpen, handleSupportClick, closeSupport } = useSupport()
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [isPoster, setIsPoster] = useState(false)

  useEffect(() => {
    const check = () => {
      if (typeof document !== "undefined") {
        const saved = localStorage.getItem("edutechsrm-landing-mode")
        const attr = document.documentElement.getAttribute("data-landing-mode")
        setIsPoster(attr === "poster" || saved === "poster")
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

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText("admin@edutechsrm.in")
    setCopiedEmail(true)
    setTimeout(() => setCopiedEmail(false), 2500)
  }

  return (
    <>
      <Header />
      
      {/* Dynamic Theme Styles for Poster Mode */}
      <style>{`
        [data-landing-mode="poster"] .dev-page-shell {
          background-color: #f4efe6 !important;
          color: #111111 !important;
        }
        [data-landing-mode="poster"] .dev-card-brutal {
          background: #ffffff !important;
          border: 2.5px solid #111111 !important;
          box-shadow: 6px 6px 0px #111111 !important;
          color: #111111 !important;
        }
        [data-landing-mode="poster"] .dev-subcard {
          background: #faf7f2 !important;
          border: 2px solid #111111 !important;
          box-shadow: 3px 3px 0px #111111 !important;
          color: #111111 !important;
        }
        [data-landing-mode="poster"] .dev-btn-action {
          background: #111111 !important;
          color: #ffffff !important;
          border: 2px solid #111111 !important;
          box-shadow: 3px 3px 0px #111111 !important;
        }
        [data-landing-mode="poster"] .dev-tag-pill {
          background: #ffffff !important;
          border: 1.5px solid #111111 !important;
          color: #111111 !important;
          box-shadow: 2px 2px 0px #111111 !important;
        }
        [data-landing-mode="poster"] .dev-portrait-box {
          border: 2.5px solid #111111 !important;
          box-shadow: 4px 4px 0px #111111 !important;
        }
      `}</style>

      <main className={`dev-page-shell relative min-h-screen pt-36 sm:pt-40 pb-20 px-3.5 sm:px-6 lg:px-12 transition-colors duration-300 ${isPoster ? "bg-[#f4efe6] text-[#111111]" : "bg-[#070a0e] text-zinc-100"}`}>
        <div className="mx-auto max-w-5xl">
          
          {/* ── 1. Editorial Header ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-widest"
              style={{
                borderColor: isPoster ? "#111111" : "rgba(52,211,153,0.3)",
                background: isPoster ? "#ffffff" : "rgba(52,211,153,0.1)",
                color: isPoster ? "#111111" : "#34d399",
                boxShadow: isPoster ? "2px 2px 0px #111111" : "none",
              }}
            >
              <Terminal className="h-3.5 w-3.5" />
              <span>CREATOR & SOLO ARCHITECT • SRMIST KTR</span>
            </div>

            <h1 className="font-display mt-5 text-4xl font-black tracking-tight sm:text-6xl leading-[1.05]"
              style={{ color: isPoster ? "#111111" : "#ffffff" }}
            >
              One Developer. <br />
              <span className="font-serif italic font-normal" style={{ color: isPoster ? "#059669" : "#34d399" }}>
                1000+ Students Unthrottled.
              </span>
            </h1>

            <div className="mt-4 inline-block transform -rotate-1 rounded-xl px-4 py-1.5"
              style={{
                background: isPoster ? "rgba(11,122,84,0.12)" : "rgba(251,191,36,0.1)",
                border: isPoster ? "1.5px solid #111111" : "1px solid rgba(251,191,36,0.3)",
              }}
            >
              <span className="font-handwriting text-sm sm:text-base font-medium"
                style={{
                  fontFamily: "var(--font-caveat, 'Caveat', cursive)",
                  fontSize: "18px",
                  color: isPoster ? "#0b7a54" : "#fcd34d",
                }}
              >
                &ldquo;Built by a day scholar between morning campus commutes and lectures — because nobody should wait 15 minutes in a crowd just to check their room number.&rdquo;
              </span>
            </div>
          </motion.div>

          {/* ── 2. The Main Developer Dossier Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="dev-card-brutal rounded-3xl p-6 sm:p-8 mb-10"
            style={{
              background: isPoster ? "#ffffff" : "rgba(255,255,255,0.035)",
              border: isPoster ? "2.5px solid #111111" : "1px solid rgba(255,255,255,0.1)",
              boxShadow: isPoster ? "6px 6px 0px #111111" : "0 25px 50px -12px rgba(0,0,0,0.5)",
            }}
          >
            <div className="grid grid-cols-1 gap-8 md:grid-cols-12 items-center">
              
              {/* Left Column: Portrait & Identity */}
              <div className="md:col-span-4 flex flex-col items-center text-center">
                <div className="dev-portrait-box relative h-48 w-48 overflow-hidden rounded-2xl"
                  style={{
                    border: isPoster ? "2.5px solid #111111" : "2px solid rgba(52,211,153,0.3)",
                    boxShadow: isPoster ? "4px 4px 0px #111111" : "0 15px 35px rgba(16,185,129,0.2)",
                  }}
                >
                  <img src="/aarav_goel.jpg" alt="Aarav Goel" className="h-full w-full object-cover" />
                </div>

                <h2 className="font-display mt-4 text-2xl font-black" style={{ color: isPoster ? "#111111" : "#ffffff" }}>
                  Aarav Goel
                </h2>

                <div className="mt-1 flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider"
                  style={{ color: isPoster ? "#059669" : "#38bdf8" }}
                >
                  <MapPin className="h-3.5 w-3.5" />
                  <span>SRMIST Kattankulathur</span>
                </div>

                <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                  {["2nd Year CSE (AIML)", "Day Scholar", "Solo Engineer"].map((tag) => (
                    <span
                      key={tag}
                      className="dev-tag-pill rounded-full px-2.5 py-0.5 text-[10px] sm:text-[11px] font-mono font-bold uppercase"
                      style={{
                        background: isPoster ? "#faf7f2" : "rgba(255,255,255,0.05)",
                        border: isPoster ? "1.5px solid #111111" : "1px solid rgba(255,255,255,0.1)",
                        color: isPoster ? "#111111" : "#d4d4d8",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-mono font-bold"
                  style={{
                    background: isPoster ? "#faf7f2" : "rgba(16,185,129,0.1)",
                    border: isPoster ? "1.5px solid #111111" : "1px solid rgba(16,185,129,0.3)",
                    color: isPoster ? "#111111" : "#34d399",
                  }}
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>STATUS: ACTIVELY DEVELOPING</span>
                </div>
              </div>

              {/* Right Column: Mission & Core Highlights */}
              <div className="md:col-span-8 space-y-4">
                <div>
                  <h3 className="font-display text-lg font-bold mb-1.5" style={{ color: isPoster ? "#111111" : "#ffffff" }}>
                    Student Autonomy Engine
                  </h3>
                  <p className="text-sm leading-relaxed font-sans" style={{ color: isPoster ? "#333333" : "#d4d4d8" }}>
                    Built from scratch as an ultra-fast, client-side academic proxy for SRMIST students. It decrypts attendance records, calculates safe bunk margins, normalizes timetable schedules, and provides instant offline caching.
                  </p>
                </div>

                {/* 4 Crisp Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="dev-subcard rounded-xl p-3"
                    style={{
                      background: isPoster ? "#faf7f2" : "rgba(255,255,255,0.03)",
                      border: isPoster ? "2px solid #111111" : "1px solid rgba(255,255,255,0.08)",
                      boxShadow: isPoster ? "3px 3px 0px #111111" : "none",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1 font-mono text-xs font-bold" style={{ color: isPoster ? "#059669" : "#34d399" }}>
                      <Zap className="h-3.5 w-3.5" />
                      <span>120ms Edge Sync</span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: isPoster ? "#555555" : "#a1a1aa" }}>
                      Parses Academia tables into structured JSON instantly on device.
                    </p>
                  </div>

                  <div className="dev-subcard rounded-xl p-3"
                    style={{
                      background: isPoster ? "#faf7f2" : "rgba(255,255,255,0.03)",
                      border: isPoster ? "2px solid #111111" : "1px solid rgba(255,255,255,0.08)",
                      boxShadow: isPoster ? "3px 3px 0px #111111" : "none",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1 font-mono text-xs font-bold" style={{ color: isPoster ? "#0284c7" : "#38bdf8" }}>
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Zero Passwords Stored</span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: isPoster ? "#555555" : "#a1a1aa" }}>
                      Credentials never touch a database. Session tokens live in local RAM only.
                    </p>
                  </div>

                  <div className="dev-subcard rounded-xl p-3"
                    style={{
                      background: isPoster ? "#faf7f2" : "rgba(255,255,255,0.03)",
                      border: isPoster ? "2px solid #111111" : "1px solid rgba(255,255,255,0.08)",
                      boxShadow: isPoster ? "3px 3px 0px #111111" : "none",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1 font-mono text-xs font-bold" style={{ color: isPoster ? "#d97706" : "#fbbf24" }}>
                      <Cpu className="h-3.5 w-3.5" />
                      <span>Academic Intelligence</span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: isPoster ? "#555555" : "#a1a1aa" }}>
                      Calculates internal mark cut-offs and safe skip predictions automatically.
                    </p>
                  </div>

                  <div className="dev-subcard rounded-xl p-3"
                    style={{
                      background: isPoster ? "#faf7f2" : "rgba(255,255,255,0.03)",
                      border: isPoster ? "2px solid #111111" : "1px solid rgba(255,255,255,0.08)",
                      boxShadow: isPoster ? "3px 3px 0px #111111" : "none",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1 font-mono text-xs font-bold" style={{ color: isPoster ? "#e11d48" : "#f472b6" }}>
                      <Heart className="h-3.5 w-3.5" />
                      <span>Free For Everyone</span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: isPoster ? "#555555" : "#a1a1aa" }}>
                      Zero ads, zero subscriptions. 100% independent student utility.
                    </p>
                  </div>
                </div>

                {/* Tech Stack */}
                <div className="pt-1">
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider mr-1" style={{ color: isPoster ? "#666666" : "#71717a" }}>
                      STACK:
                    </span>
                    {["Next.js 16", "React 19", "Turbopack", "TailwindCSS", "Cloudflare Workers", "PWA"].map((tech) => (
                      <span
                        key={tech}
                        className="rounded-md px-2 py-0.5 text-[10px] font-mono font-bold"
                        style={{
                          background: isPoster ? "#ffffff" : "rgba(255,255,255,0.05)",
                          border: isPoster ? "1.5px solid #111111" : "1px solid rgba(255,255,255,0.1)",
                          color: isPoster ? "#111111" : "#e4e4e7",
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </motion.div>

          {/* ── 3. Direct Contact Channels (Clean 2x2 Grid) ── */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: isPoster ? "#111111" : "#a1a1aa" }}>
                DIRECT CONTACT & INQUIRIES
              </h3>
              <span className="font-mono text-[11px] text-zinc-500">Fastest replies via Email & Instagram</span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {verifiedSocials.map((channel) => (
                <div
                  key={channel.label}
                  className="dev-card-brutal group rounded-2xl p-3 sm:p-4 transition-all flex flex-col justify-between hover:-translate-y-1"
                  style={{
                    background: isPoster ? "#ffffff" : "rgba(255,255,255,0.035)",
                    border: isPoster ? "2px solid #111111" : "1px solid rgba(255,255,255,0.08)",
                    boxShadow: isPoster ? "4px 4px 0px #111111" : "none",
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl"
                        style={{
                          background: isPoster ? "#faf7f2" : "rgba(255,255,255,0.05)",
                          border: isPoster ? "1.5px solid #111111" : "1px solid rgba(255,255,255,0.1)",
                          color: channel.accent,
                        }}
                      >
                        <channel.icon className="h-4 w-4" />
                      </div>
                      <span className="font-mono text-[9px] font-bold uppercase px-2 py-0.5 rounded-full"
                        style={{
                          background: isPoster ? "#111111" : "rgba(255,255,255,0.1)",
                          color: isPoster ? "#ffffff" : "#d4d4d8",
                        }}
                      >
                        {channel.badge}
                      </span>
                    </div>

                    <h4 className="font-display font-bold text-sm sm:text-base leading-tight" style={{ color: isPoster ? "#111111" : "#ffffff" }}>
                      {channel.label}
                    </h4>
                    <p className="font-mono text-xs font-bold mt-0.5 truncate" style={{ color: channel.accent }}>
                      {channel.handle}
                    </p>
                    <p className="text-xs mt-1.5 leading-relaxed font-sans" style={{ color: isPoster ? "#555555" : "#a1a1aa" }}>
                      {channel.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs font-mono font-bold"
                    style={{ borderColor: isPoster ? "rgba(17,17,17,0.1)" : "rgba(255,255,255,0.08)" }}
                  >
                    {channel.isEmail ? (
                      <div className="flex items-center justify-between w-full gap-2">
                        <a
                          href={channel.href}
                          className="hover:underline flex items-center gap-1"
                          style={{ color: isPoster ? "#111111" : "#e4e4e7" }}
                        >
                          <span>Send Mail</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        <button
                          onClick={handleCopyEmail}
                          className="px-2 py-0.5 rounded-md text-[10px] flex items-center gap-1 transition-all"
                          style={{
                            background: isPoster ? "#f4efe6" : "rgba(255,255,255,0.08)",
                            color: copiedEmail ? "#10b981" : isPoster ? "#111111" : "#d4d4d8",
                            border: isPoster ? "1px solid #111111" : "1px solid rgba(255,255,255,0.15)",
                          }}
                        >
                          {copiedEmail ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          <span>{copiedEmail ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                    ) : (
                      <a
                        href={channel.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between w-full hover:underline"
                        style={{ color: isPoster ? "#111111" : "#e4e4e7" }}
                      >
                        <span>Connect</span>
                        <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── 4. Clean Footer Callout: Security & Independent Server Costs ── */}
          <div className="dev-card-brutal rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{
              background: isPoster ? "#ffffff" : "rgba(255,255,255,0.03)",
              border: isPoster ? "2.5px solid #111111" : "1px solid rgba(255,255,255,0.08)",
              boxShadow: isPoster ? "4px 4px 0px #111111" : "none",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{
                  background: isPoster ? "#faf7f2" : "rgba(52,211,153,0.1)",
                  border: isPoster ? "1.5px solid #111111" : "1px solid rgba(52,211,153,0.3)",
                  color: isPoster ? "#059669" : "#34d399",
                }}
              >
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-xs sm:text-sm" style={{ color: isPoster ? "#111111" : "#ffffff" }}>
                  Credential Integrity Protocol
                </h4>
                <p className="text-[11px] sm:text-xs font-sans mt-0.5" style={{ color: isPoster ? "#555555" : "#a1a1aa" }}>
                  We will never ask for your SRM password over email, DMs, or WhatsApp. Login only inside the encrypted app.
                </p>
              </div>
            </div>

            <button
              onClick={handleSupportClick}
              className="dev-btn-action shrink-0 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider transition-all"
              style={{
                background: isPoster ? "#111111" : "#8b5cf6",
                color: "#ffffff",
                border: isPoster ? "2px solid #111111" : "none",
                boxShadow: isPoster ? "3px 3px 0px #111111" : "0 8px 20px rgba(139,92,246,0.3)",
              }}
            >
              <Heart className="h-3.5 w-3.5 text-pink-400" />
              <span>Support Server Costs</span>
            </button>
          </div>

        </div>

        <SupportModal isOpen={isSupportOpen} onClose={closeSupport} />
      </main>

      <PublicFooter />
    </>
  )
}
