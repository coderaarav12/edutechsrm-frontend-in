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
            padding: "clamp(10px, 2.5vw, 14px) clamp(18px, 4vw, 26px) clamp(10px, 2.5vw, 14px) clamp(12px, 3vw, 18px)",
            borderRadius: 9999,
            background: "linear-gradient(180deg, rgba(14,20,32,0.95) 0%, rgba(9,13,22,0.98) 100%)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.7), 0 0 24px rgba(52,211,153,0.08)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            cursor: "pointer",
            outline: "none",
          }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: `${activeColor}22`, border: `1px solid ${activeColor}44`, flexShrink: 0,
          }}>
            {(() => {
              const Icon = activeItem.icon
              return <Icon style={{ width: 18, height: 18, color: activeColor }} />
            })()}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
            <span style={{
              fontSize: 14, fontWeight: 800, color: "#ffffff",
              whiteSpace: "nowrap", fontFamily: "var(--font-display, sans-serif)",
              letterSpacing: "-0.3px", lineHeight: 1.1,
            }}>
              {activeItem.label}
            </span>
            <span style={{
              fontSize: 9, fontWeight: 700, color: activeColor,
              letterSpacing: "0.15em", textTransform: "uppercase", lineHeight: 1, fontFamily: "monospace",
            }}>
              SWITCH TAB
            </span>
          </div>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(255,255,255,0.06)", flexShrink: 0,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
              style={{ background: "rgba(4,6,12,0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
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
                background: "linear-gradient(180deg, rgba(14,20,32,0.98) 0%, rgba(8,12,20,0.99) 100%)",
                borderTopLeftRadius: "clamp(22px, 5vw, 28px)",
                borderTopRightRadius: "clamp(22px, 5vw, 28px)",
                borderTop: "1px solid rgba(255,255,255,0.12)",
                maxHeight: "88vh",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 -20px 60px rgba(0,0,0,0.7)",
              }}
            >
              {/* Handle bar */}
              <div style={{ display: "flex", justifyContent: "center", paddingTop: "clamp(10px, 2.5vw, 14px)", paddingBottom: "clamp(2px, 0.5vw, 4px)", flexShrink: 0 }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)" }} />
              </div>

              {/* Sheet header */}
              <div className="flex items-center justify-between px-6 pb-3 pt-1" style={{ flexShrink: 0 }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(52,211,153,0.2)", border: "1px solid rgba(52,211,153,0.35)", color: "#34d399" }}>
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-black text-white font-display tracking-tight">
                      Console Navigation
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500 block -mt-0.5">SRMIST Core Admin</span>
                  </div>
                </div>
                <button onClick={() => setMoreOpen(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable nav grid */}
              <div style={{ overflow: "auto", padding: "clamp(6px, 1.5vw, 12px) clamp(16px, 4vw, 32px) calc(env(safe-area-inset-bottom, 8px) + clamp(10px, 2.5vw, 20px))" }}>
                <nav style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "clamp(8px, 1.8vw, 12px)", width: "100%" }}>
                  {NAV.map((item) => {
                    const active = activeTab === item.id
                    const Icon = item.icon
                    return (
                      <button key={item.id} onClick={() => handleTab(item.id)}
                        style={{
                          width: "100%", display: "flex", flexDirection: "column", alignItems: "center",
                          gap: "clamp(6px, 1.2vw, 8px)",
                          padding: "clamp(10px, 2.2vw, 16px) clamp(4px, 0.8vw, 8px)",
                          background: active ? `linear-gradient(135deg, ${item.color}1c, ${item.color}08)` : "rgba(255,255,255,0.02)",
                          border: active ? `1px solid ${item.color}45` : "1px solid rgba(255,255,255,0.04)",
                          cursor: "pointer",
                          borderRadius: "clamp(12px, 2.8vw, 16px)",
                          transition: "all 0.18s ease",
                        }}
                      >
                        <div style={{
                          width: "clamp(38px, 8.5vw, 48px)", height: "clamp(38px, 8.5vw, 48px)",
                          borderRadius: "clamp(10px, 2.4vw, 14px)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          background: active ? `${item.color}25` : "rgba(255,255,255,0.04)",
                          border: active ? `1.5px solid ${item.color}40` : "1px solid rgba(255,255,255,0.06)",
                          boxShadow: active ? `0 0 16px ${item.color}25` : "none",
                        }}>
                          <Icon style={{
                            width: "clamp(18px, 4vw, 22px)", height: "clamp(18px, 4vw, 22px)",
                            color: active ? item.color : "#71717a",
                          }} />
                        </div>
                        <span style={{
                          fontSize: "clamp(0.6rem, 2vw, 0.72rem)",
                          fontWeight: active ? 800 : 600,
                          color: active ? "#ffffff" : "#a1a1aa",
                          textAlign: "center", lineHeight: 1.2,
                          letterSpacing: active ? "-0.01em" : "0",
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
