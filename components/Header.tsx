"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { ArrowRight, Home, Info, LayoutDashboard, Mail, Scale, Shield, X } from "lucide-react"
import { QrCode } from "./qr-code"

interface HeaderProps {
  onLoginClick?: () => void
}

export function Header({ onLoginClick }: HeaderProps = {}) {
  const { isAuthenticated } = useAuth()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const isLandingHeader = true
  const [showSharePopup, setShowSharePopup] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const handleLoginClick = () => {
    setMenuOpen(false)
    if (isAuthenticated) { window.location.href = "/"; return }
    if (onLoginClick) onLoginClick()
    else window.location.href = "/login"
  }

  const navLinks = [
    { href: "/home", label: "Home", icon: Home },
    { href: "/about", label: "About", icon: Info },
    { href: "/privacy", label: "Privacy", icon: Shield },
    { href: "/terms", label: "Terms", icon: Scale },
    { href: "/contact", label: "Contact", icon: Mail },
  ]

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: scrolled ? "10px 24px" : isLandingHeader ? "16px 32px" : "16px 28px",
          background: scrolled
            ? "rgba(9,9,11,0.86)"
            : isLandingHeader
              ? "linear-gradient(180deg, rgba(7,9,15,0.78), rgba(7,9,15,0.18))"
              : "transparent",
          backdropFilter: scrolled || isLandingHeader ? "blur(18px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "1px solid transparent",
          transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
        }}
        className={isLandingHeader ? "landing-public-header" : undefined}
        role="navigation"
        aria-label="Main navigation"
      >
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
           <span style={{ fontSize: 17, fontWeight: 800, color: "#f4f4f5", letterSpacing: "-0.3px", fontFamily: "'Space Grotesk', sans-serif" }}>
             edutechsrm
           </span>
         </Link>

        {/* Centre Social */}
        <div className="desktop-social" style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "absolute", left: "50%", transform: "translateX(-50%)", gap: 20 }}>
          <a href="https://instagram.com/edutechsrm" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", color: "rgba(161,161,170,0.5)", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#d4d4d8"} onMouseLeave={e => e.currentTarget.style.color = "rgba(161,161,170,0.5)"}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
          </a>
          <a href="https://linkedin.com/company/edutechsrm" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", color: "rgba(161,161,170,0.5)", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#d4d4d8"} onMouseLeave={e => e.currentTarget.style.color = "rgba(161,161,170,0.5)"}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
          </a>
        </div>

        {/* Desktop Nav */}
        <nav
          style={{
            display: "none",
            alignItems: "center",
            gap: 4,
            padding: isLandingHeader ? "6px" : 0,
            borderRadius: isLandingHeader ? 16 : 0,
            border: isLandingHeader ? "1px solid rgba(255,255,255,0.08)" : "none",
            background: isLandingHeader
              ? "linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.025))"
              : "transparent",
            boxShadow: isLandingHeader ? "0 14px 36px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.06)" : "none",
            backdropFilter: isLandingHeader ? "blur(18px)" : undefined,
          }}
          className="desktop-nav"
        >
          <button onClick={() => setShowSharePopup(true)}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", padding: "8px 10px", borderRadius: 11, color: "rgba(161,161,170,0.5)", transition: "color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = "#d4d4d8"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(161,161,170,0.5)"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          </button>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                textDecoration: "none",
                fontSize: 13.5,
                fontWeight: isLandingHeader ? 700 : 500,
                padding: "8px 14px",
                borderRadius: 11,
                color: pathname === link.href ? "#ecfeff" : "rgba(212,212,216,0.72)",
                background: pathname === link.href
                  ? "linear-gradient(135deg, rgba(52,211,153,0.16), rgba(34,211,238,0.10))"
                  : "transparent",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { if (pathname !== link.href) e.currentTarget.style.color = "#d4d4d8" }}
              onMouseLeave={(e) => { if (pathname !== link.href) e.currentTarget.style.color = "rgba(161,161,170,0.7)" }}
            >
              {link.label}
            </Link>
          ))}
          <motion.button
            style={{
              padding: "9px 20px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              fontFamily: "'Space Grotesk', sans-serif",
              background: "linear-gradient(135deg,#34d399,#10b981)",
              color: "#09090b",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginLeft: 10,
              transition: "transform 0.2s, box-shadow 0.2s",
              boxShadow: "0 0 12px rgba(16,185,129,0.25)",
            }}
            onClick={handleLoginClick}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)" }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "" }}
          >
            {isAuthenticated ? <><LayoutDashboard style={{ width: 14, height: 14 }} /> Dashboard</> : <>Login <ArrowRight style={{ width: 13, height: 13 }} /></>}
          </motion.button>
        </nav>

        {/* Mobile share + Menu Toggle (same bordered group) */}
        <div className="mobile-action-group menu-toggle" style={{ display: "flex", alignItems: "center", gap: 0, padding: "4px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.07)", background: "linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.025))", backdropFilter: "blur(18px)" }}>
          <button onClick={() => setShowSharePopup(true)} className="mobile-share-btn" aria-label="Share" style={{ background: "none", border: "none", cursor: "pointer", width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(161,161,170,0.6)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          </button>
          <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />
          <button onClick={() => setMenuOpen(true)} className="menu-toggle mobile-hamburger" aria-label="Open menu" style={{ background: "none", border: "none", cursor: "pointer", width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(161,161,170,0.6)" }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="5" width="16" height="1.6" rx="0.8" fill="currentColor" />
              <rect x="2" y="9.2" width="16" height="1.6" rx="0.8" fill="currentColor" />
              <rect x="2" y="13.4" width="16" height="1.6" rx="0.8" fill="currentColor" />
            </svg>
          </button>
        </div>
      </header>

      {/* Bottom-Sheet Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMenuOpen(false)}
              className="mobile-menu-backdrop"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="mobile-menu-sheet"
            >
              {/* Drag handle */}
              <div className="mobile-menu-handle" />

              {/* Close button */}
              <button
                onClick={() => setMenuOpen(false)}
                className="mobile-menu-sheet-close"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>

              {/* Brand */}
              <div className="mobile-menu-sheet-brand">
                <div>
                  <p>edutechsrm</p>
                  <span>Your SRM companion</span>
                </div>
              </div>

              {/* Nav links */}
              <nav className="mobile-menu-sheet-nav">
                {navLinks.map((link, i) => {
                  const Icon = link.icon
                  const active = pathname === link.href
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ delay: i * 0.04, duration: 0.3 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className={`mobile-menu-sheet-link ${active ? "mobile-menu-sheet-link-active" : ""}`}
                      >
                        <span className="mobile-menu-sheet-link-icon"><Icon size={16} /></span>
                        <span>{link.label}</span>
                        {active && <span className="mobile-menu-sheet-link-pill">Current</span>}
                      </Link>
                    </motion.div>
                  )
                })}
              </nav>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="mobile-menu-sheet-cta-wrap"
              >
                <button onClick={handleLoginClick} className="mobile-menu-sheet-cta">
                  {isAuthenticated ? <><LayoutDashboard size={16} /> Return to Dashboard</> : <>Connect SRM Academia <ArrowRight size={16} /></>}
                </button>
                <p className="mobile-menu-sheet-note">Independent student project. Not affiliated with SRM.</p>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        @media (min-width: 768px) {
          .menu-toggle { display: none !important; }
          .desktop-nav { display: flex !important; }
        }
        @media (max-width: 767px) {
          .landing-public-header {
            padding-left: 28px !important;
            padding-right: 20px !important;
          }
          .landing-public-header a:first-child {
            gap: 9px !important;
          }
        }
        /* ── Animated hamburger ── */


        /* ── Bottom-sheet backdrop ── */
        .mobile-menu-backdrop {
          position: fixed;
          inset: 0;
          z-index: 200;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
        }

        /* ── Bottom-sheet panel ── */
        .mobile-menu-sheet {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 201;
          max-height: 82svh;
          border-radius: 24px 24px 0 0;
          background:
            radial-gradient(ellipse at 20% 0%, rgba(52,211,153,0.10), transparent 50%),
            rgba(7,9,15,0.98);
          backdrop-filter: blur(28px);
          border-top: 1px solid rgba(255,255,255,0.06);
          box-shadow: 0 -20px 60px rgba(0,0,0,0.5);
          padding: 12px 20px max(env(safe-area-inset-bottom, 12px), 16px);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }
        .mobile-menu-handle {
          width: 36px;
          height: 4px;
          border-radius: 4px;
          background: rgba(255,255,255,0.12);
          margin: 0 auto 8px;
          flex-shrink: 0;
        }
        .mobile-menu-sheet-close {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.04);
          color: rgba(161,161,170,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
          flex-shrink: 0;
        }
        .mobile-menu-sheet-close:hover {
          background: rgba(255,255,255,0.08);
          color: #d4d4d8;
        }

        /* ── Brand ── */
        .mobile-menu-sheet-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-right: 44px;
          margin-bottom: 16px;
          flex-shrink: 0;
        }
        .mobile-menu-sheet-brand img {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          object-fit: contain;
        }
        .mobile-menu-sheet-brand p {
          margin: 0;
          color: #f4f4f5;
          font-family: "Space Grotesk", sans-serif;
          font-size: 17px;
          font-weight: 900;
          letter-spacing: -0.02em;
        }
        .mobile-menu-sheet-brand span {
          display: block;
          margin-top: 1px;
          color: rgba(161,161,170,0.6);
          font-size: 11px;
          font-weight: 600;
        }

        /* ── Nav links ── */
        .mobile-menu-sheet-nav {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
          overflow-y: auto;
          margin: 0 -4px;
          padding: 0 4px;
        }
        .mobile-menu-sheet-link {
          display: flex;
          min-height: 50px;
          align-items: center;
          gap: 12px;
          border-radius: 14px;
          padding: 8px 12px;
          text-decoration: none;
          color: rgba(228,228,231,0.7);
          font-family: "Space Grotesk", sans-serif;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: -0.01em;
          transition: background 0.15s;
        }
        .mobile-menu-sheet-link:active {
          background: rgba(255,255,255,0.06);
        }
        .mobile-menu-sheet-link-active {
          background: linear-gradient(135deg, rgba(52,211,153,0.12), rgba(34,211,238,0.06));
          color: #f4f4f5;
        }
        .mobile-menu-sheet-link-icon {
          display: flex;
          width: 34px;
          height: 34px;
          flex: 0 0 34px;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: rgba(9,9,11,0.5);
          color: #34d399;
        }
        .mobile-menu-sheet-link-pill {
          margin-left: auto;
          border-radius: 999px;
          background: rgba(52,211,153,0.12);
          padding: 4px 7px;
          color: #86efac;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        /* ── CTA ── */
        .mobile-menu-sheet-cta-wrap {
          display: grid;
          gap: 10px;
          margin-top: 14px;
          flex-shrink: 0;
        }
        .mobile-menu-sheet-cta {
          display: inline-flex;
          min-height: 52px;
          width: 100%;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 0;
          border-radius: 16px;
          background: linear-gradient(135deg,#5ee6b4,#34d399);
          color: #07120d;
          font-family: "Space Grotesk", sans-serif;
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
          box-shadow: 0 12px 28px rgba(52,211,153,.18);
          transition: transform 0.15s;
        }
        .mobile-menu-sheet-cta:active {
          transform: scale(0.97);
        }
        .mobile-menu-sheet-note {
          margin: 0;
          text-align: center;
          color: rgba(161,161,170,.5);
          font-size: 10.5px;
          line-height: 1.5;
        }
      `}</style>

      {/* Share popup */}
      <AnimatePresence>
        {showSharePopup && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowSharePopup(false)}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
          >
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }} onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl border p-6 text-center relative"
              style={{ background: "var(--card-bg, #18181b)", borderColor: "rgba(255,255,255,0.08)" }}
            >
              <button onClick={() => setShowSharePopup(false)}
                className="absolute top-3 right-3 w-7 h-7 rounded-xl flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors"
                style={{ background: "rgba(255,255,255,0.05)" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>

              <h3 className="text-base font-black text-zinc-100 mb-1">Share edutechsrm</h3>
              <p className="text-[11px] text-zinc-500 mb-5">Scan or share with friends</p>

              <div className="flex justify-center">
                <QrCode size={260} />
              </div>

              <div className="mt-5 space-y-2">
                <button onClick={async () => {
                  const url = "https://edutechsrm.in"
                  const title = "edutechsrm"
                  const text = "SRM attendance, timetable & marks — all in one place"
                  if (typeof navigator.share === "function") {
                    try { await navigator.share({ title, text, url }) } catch {}
                  } else {
                    try { await navigator.clipboard.writeText(url) } catch {}
                  }
                }}
                  className="w-full rounded-xl py-2.5 text-sm font-bold"
                  style={{ background: "linear-gradient(135deg, #34d399, #10b981)", color: "#09090b" }}
                >
                  Share via apps
                </button>
                <button onClick={async (e) => {
                  try {
                    await navigator.clipboard.writeText("https://edutechsrm.in")
                    const btn = e.currentTarget
                    const orig = btn.textContent
                    btn.textContent = "Copied!"
                    btn.style.color = "#34d399"
                    btn.style.borderColor = "rgba(52,211,153,0.3)"
                    setTimeout(() => {
                      btn.textContent = orig
                      btn.style.color = "#a1a1aa"
                      btn.style.borderColor = "rgba(255,255,255,0.1)"
                    }, 1500)
                  } catch {}
                }}
                  className="w-full rounded-xl py-2.5 text-sm font-bold border transition-colors"
                  style={{ color: "#a1a1aa", borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}
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
