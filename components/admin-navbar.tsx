"use client"

import { AnimatePresence, motion } from "framer-motion"
import {
  BarChart3, Megaphone, Ban, Users, MessageSquareText,
  LogOut, Shield, X,
} from "lucide-react"
import { ADMIN_TABS, type AdminTabType } from "./admin-manager-modal"

const NAV = ADMIN_TABS

interface AdminNavbarProps {
  activeTab: AdminTabType
  setActiveTab: (tab: AdminTabType) => void
  moreOpen: boolean
  setMoreOpen: (open: boolean) => void
}

export function AdminNavbar({ activeTab, setActiveTab, moreOpen, setMoreOpen }: AdminNavbarProps) {
  const activeItem = NAV.find((item) => item.id === activeTab) ?? NAV[0]
  const activeColor = activeItem.color

  const handleTab = (tab: AdminTabType) => {
    setActiveTab(tab)
    setMoreOpen(false)
  }

  return (
    <>
      {/* Mobile bottom floating pill */}
      <div
        className="fixed left-1/2 z-50 lg:hidden flex items-center"
        style={{
          bottom: "calc(env(safe-area-inset-bottom) + max(14px, 2vw))",
          transform: "translateX(-50%)",
        }}
      >
        <motion.button
          onClick={() => setMoreOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "clamp(10px, 2.5vw, 16px)",
            padding: "clamp(10px, 2.5vw, 16px) clamp(18px, 4vw, 28px) clamp(10px, 2.5vw, 16px) clamp(12px, 3vw, 20px)",
            borderRadius: 9999,
            background: "rgba(24,24,27,0.96)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
            cursor: "pointer",
            outline: "none",
          }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: `${activeColor}18`, flexShrink: 0,
          }}>
            {(() => {
              const Icon = activeItem.icon
              return <Icon style={{ width: 18, height: 18, color: activeColor }} />
            })()}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
            <span style={{
              fontSize: 14, fontWeight: 800, color: "#e4e4e7",
              whiteSpace: "nowrap", fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: "-0.3px", lineHeight: 1.1,
            }}>
              {activeItem.label}
            </span>
            <span style={{
              fontSize: 8, fontWeight: 700, color: activeColor,
              letterSpacing: "0.15em", textTransform: "uppercase", lineHeight: 1, opacity: 0.7,
            }}>
              Open admin
            </span>
          </div>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(255,255,255,0.04)", flexShrink: 0,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </motion.button>
      </div>

      {/* Bottom sheet overlay */}
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              key="admin-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 lg:hidden"
              style={{ background: "rgba(9,9,11,0.8)" }}
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              key="admin-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
              style={{
                background: "rgba(24,24,27,0.98)",
                borderTopLeftRadius: "clamp(22px, 5vw, 28px)",
                borderTopRightRadius: "clamp(22px, 5vw, 28px)",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                maxHeight: "88vh",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 -20px 60px rgba(0,0,0,0.3)",
              }}
            >
              {/* Handle bar */}
              <div style={{ display: "flex", justifyContent: "center", paddingTop: "clamp(10px, 2.5vw, 14px)", paddingBottom: "clamp(2px, 0.5vw, 4px)", flexShrink: 0 }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)" }} />
              </div>

              {/* Sheet header */}
              <div className="flex items-center justify-between px-6 pb-2" style={{ flexShrink: 0 }}>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" style={{ color: "#6ee7b7" }} />
                  <span className="text-sm font-bold text-zinc-100" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Admin Manager
                  </span>
                </div>
                <button onClick={() => setMoreOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-200 transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Scrollable nav grid */}
              <div style={{ overflow: "auto", padding: "clamp(6px, 1.5vw, 12px) clamp(16px, 4vw, 32px) calc(env(safe-area-inset-bottom, 8px) + clamp(10px, 2.5vw, 20px))" }}>
                <nav style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "clamp(6px, 1.2vw, 12px)", width: "100%" }}>
                  {NAV.map((item) => {
                    const active = activeTab === item.id
                    const Icon = item.icon
                    return (
                      <button key={item.id} onClick={() => handleTab(item.id)}
                        style={{
                          width: "100%", display: "flex", flexDirection: "column", alignItems: "center",
                          gap: "clamp(5px, 1vw, 8px)",
                          padding: "clamp(10px, 2.2vw, 18px) clamp(4px, 0.8vw, 8px)",
                          background: "none", border: "none", cursor: "pointer",
                          borderRadius: "clamp(12px, 2.8vw, 16px)",
                        }}
                      >
                        <div style={{
                          width: "clamp(40px, 9vw, 52px)", height: "clamp(40px, 9vw, 52px)",
                          borderRadius: "clamp(12px, 2.8vw, 16px)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          background: active ? `linear-gradient(135deg, ${item.color}18, ${item.color}08)` : "rgba(255,255,255,0.03)",
                          border: active ? `1.5px solid ${item.color}30` : "1px solid rgba(255,255,255,0.05)",
                          transition: "background 0.2s, border-color 0.2s",
                        }}>
                          <Icon style={{
                            width: "clamp(18px, 4vw, 24px)", height: "clamp(18px, 4vw, 24px)",
                            color: active ? item.color : "#52525b",
                          }} />
                        </div>
                        <span style={{
                          fontSize: "clamp(0.55rem, 2vw, 0.75rem)",
                          fontWeight: active ? 800 : 500,
                          color: active ? item.color : "#a1a1aa",
                          fontFamily: "'Space Grotesk', sans-serif",
                          textAlign: "center", lineHeight: 1.2,
                          letterSpacing: active ? "-0.02em" : "0",
                        }}>
                          {item.label}
                        </span>
                      </button>
                    )
                  })}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </>
  )
}
