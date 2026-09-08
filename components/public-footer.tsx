"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowUpRight, Github, Lock, Terminal } from "lucide-react"

export function PublicFooter() {
  const [isPoster, setIsPoster] = useState(false)

  useEffect(() => {
    const checkMode = () => {
      const mode = document.documentElement.getAttribute("data-landing-mode")
      setIsPoster(mode === "poster")
    }
    checkMode()
    window.addEventListener("landing-mode-change", checkMode)
    window.addEventListener("storage", checkMode)
    return () => {
      window.removeEventListener("landing-mode-change", checkMode)
      window.removeEventListener("storage", checkMode)
    }
  }, [])

  return (
    <footer
      className="relative z-10 w-full transition-colors duration-300"
      style={{
        background: isPoster ? "#f7f5f0" : "#05080e",
        backgroundImage: isPoster
          ? "linear-gradient(to right, rgba(17, 17, 17, 0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(17, 17, 17, 0.035) 1px, transparent 1px)"
          : undefined,
        backgroundSize: isPoster ? "54px 54px" : undefined,
        borderTop: isPoster ? "2px solid #111111" : "1px solid rgba(255,255,255,0.08)",
        color: isPoster ? "#111111" : "#f4f4f5",
      }}
      role="contentinfo"
    >
      <div className="mx-auto max-w-[1300px] px-6 py-16 sm:px-10 lg:py-20">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-12">
          
          {/* Column 1 (5 cols): Monumental brand + mission + status */}
          <div className="lg:col-span-5">
            <Link href="/" className="inline-flex items-center text-2xl font-black tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <span>edutechsrm</span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-relaxed" style={{ color: isPoster ? "#444444" : "#a1a1aa" }}>
              The high-speed academic operating system built for 1000+ students at SRMIST Kattankulathur. Real-time timetable, attendance limits, internal marks, and campus cartography.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-mono font-bold"
                style={{
                  background: isPoster ? "#ffffff" : "rgba(52,211,153,0.1)",
                  border: isPoster ? "1.5px solid #111111" : "1px solid rgba(52,211,153,0.3)",
                  color: isPoster ? "#111111" : "#34d399",
                  boxShadow: isPoster ? "2px 2px 0px #111111" : "none",
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                SRM Academia Direct Auth
              </span>

              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-mono font-bold"
                style={{
                  background: isPoster ? "#ffffff" : "rgba(255,255,255,0.04)",
                  border: isPoster ? "1.5px solid #111111" : "1px solid rgba(255,255,255,0.1)",
                  color: isPoster ? "#111111" : "#d4d4d8",
                  boxShadow: isPoster ? "2px 2px 0px #111111" : "none",
                }}
              >
                <Lock className="h-3 w-3 text-emerald-400" />
                Zero Passwords Stored
              </span>
            </div>

            {/* Social Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-2.5">
              <a
                href="https://instagram.com/edutechsrm"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition hover:scale-105"
                style={{
                  background: isPoster ? "#ffffff" : "rgba(225, 48, 108, 0.12)",
                  border: isPoster ? "1.5px solid #111111" : "1px solid rgba(225, 48, 108, 0.35)",
                  color: isPoster ? "#111111" : "#f472b6",
                  boxShadow: isPoster ? "2px 2px 0px #111111" : "none",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                <span>Instagram</span>
              </a>

              <a
                href="https://linkedin.com/company/edutechsrm"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition hover:scale-105"
                style={{
                  background: isPoster ? "#ffffff" : "rgba(10, 102, 194, 0.14)",
                  border: isPoster ? "1.5px solid #111111" : "1px solid rgba(10, 102, 194, 0.38)",
                  color: isPoster ? "#111111" : "#38bdf8",
                  boxShadow: isPoster ? "2px 2px 0px #111111" : "none",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                <span>LinkedIn</span>
              </a>

              <a
                href="https://github.com/coderaarav12/edutechsrm-frontend-in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition hover:scale-105"
                style={{
                  background: isPoster ? "#ffffff" : "rgba(255,255,255,0.06)",
                  border: isPoster ? "1.5px solid #111111" : "1px solid rgba(255,255,255,0.12)",
                  color: isPoster ? "#111111" : "#d4d4d8",
                  boxShadow: isPoster ? "2px 2px 0px #111111" : "none",
                }}
              >
                <Github className="h-3.5 w-3.5" />
                <span>GitHub</span>
              </a>
            </div>
          </div>

          {/* Column 2 (2 cols): Core Engines */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-[0.2em]" style={{ color: isPoster ? "#111111" : "#71717a" }}>
              Core Systems
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs font-semibold">
              <li>
                <Link href="/explore" className="transition hover:underline" style={{ color: isPoster ? "#333333" : "#d4d4d8" }}>
                  Campus Map Explorer
                </Link>
              </li>
              <li>
                <Link href="/login" className="transition hover:underline" style={{ color: isPoster ? "#333333" : "#d4d4d8" }}>
                  Timetable & Day Order
                </Link>
              </li>
              <li>
                <Link href="/login" className="transition hover:underline" style={{ color: isPoster ? "#333333" : "#d4d4d8" }}>
                  Attendance & Bunk Risk
                </Link>
              </li>
              <li>
                <Link href="/login" className="transition hover:underline" style={{ color: isPoster ? "#333333" : "#d4d4d8" }}>
                  Internal Marks & GradeX
                </Link>
              </li>
              <li>
                <Link href="/login" className="transition hover:underline" style={{ color: isPoster ? "#333333" : "#d4d4d8" }}>
                  Notes & PYQs Hub
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 (2 cols): Platform */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-[0.2em]" style={{ color: isPoster ? "#111111" : "#71717a" }}>
              Platform
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs font-semibold">
              <li>
                <Link href="/download" className="transition hover:underline" style={{ color: isPoster ? "#333333" : "#d4d4d8" }}>
                  Android App
                </Link>
              </li>
              <li>
                <a href="https://play.google.com/store/apps/details?id=in.edutechsrm.app" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 transition hover:underline" style={{ color: isPoster ? "#0b7a54" : "#34d399" }}>
                  <span>Google Play Store</span>
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </li>
              <li>
                <Link href="/reel" className="inline-flex items-center gap-1.5 transition hover:underline" style={{ color: isPoster ? "#111111" : "#34d399" }}>
                  <span>Motion Reel</span>
                  <span className="rounded px-1 text-[9px] font-mono font-bold uppercase" style={{ background: isPoster ? "#111111" : "#34d399", color: isPoster ? "#ffffff" : "#05080e" }}>New</span>
                </Link>
              </li>
              <li>
                <Link href="/docs" className="transition hover:underline" style={{ color: isPoster ? "#333333" : "#d4d4d8" }}>
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/about" className="transition hover:underline" style={{ color: isPoster ? "#333333" : "#d4d4d8" }}>
                  About Project
                </Link>
              </li>
              <li>
                <Link href="/login" className="transition hover:underline" style={{ color: isPoster ? "#333333" : "#d4d4d8" }}>
                  Student Portal Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 (3 cols): Solo Developer Info */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-[0.2em]" style={{ color: isPoster ? "#111111" : "#71717a" }}>
              Developer
            </h4>
            <div
              className="mt-4 rounded-2xl p-4 transition"
              style={{
                background: isPoster ? "#ffffff" : "rgba(255,255,255,0.03)",
                border: isPoster ? "2px solid #111111" : "1px solid rgba(255,255,255,0.08)",
                boxShadow: isPoster ? "4px 4px 0px #111111" : "none",
              }}
            >
              <div className="flex items-center gap-3">
                <img src="/aarav_goel.jpg" alt="Aarav Goel" className="h-10 w-10 rounded-xl object-cover" />
                <div>
                  <h5 className="font-display text-sm font-bold" style={{ color: isPoster ? "#111111" : "#ffffff" }}>
                    Aarav Goel
                  </h5>
                  <p className="text-[11px]" style={{ color: isPoster ? "#555555" : "#a1a1aa" }}>
                    2nd Yr CSE AIML · SRMIST KTR
                  </p>
                </div>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed" style={{ color: isPoster ? "#444444" : "#a1a1aa" }}>
                Built single-handedly to give SRM students an instant, modern academic experience.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1 text-[11px] font-bold transition hover:underline"
                  style={{ color: isPoster ? "#0b7a54" : "#34d399" }}
                >
                  <Terminal className="h-3 w-3" />
                  <span>Developer Profile & Contact →</span>
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Legal & Attribution */}
        <div
          className="mt-14 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs"
          style={{
            borderTop: isPoster ? "1.5px solid rgba(17,17,17,0.15)" : "1px solid rgba(255,255,255,0.08)",
            color: isPoster ? "#666666" : "#71717a",
          }}
        >
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
            <span>© 2026 edutechsrm</span>
            <span>·</span>
            <span>Independent open project</span>
            <span>·</span>
            <Link href="/privacy" className="hover:underline" style={{ color: isPoster ? "#111111" : "#d4d4d8" }}>
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:underline" style={{ color: isPoster ? "#111111" : "#d4d4d8" }}>
              Terms of Service
            </Link>
          </div>

          <div className="flex items-center gap-2 text-center sm:text-right">
            <span>Not affiliated with SRM Institute. Data fetched live from Academia.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
