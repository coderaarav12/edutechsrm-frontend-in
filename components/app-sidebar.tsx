"use client"

import { useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { SupportModal } from "./support-modal"
import { useSupport } from "@/lib/use-support"
import { ProfileAvatar } from "@/components/profile-avatar"
import type { TabType } from "@/lib/app-types"

function CalculatorIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/><line x1="10" y1="14" x2="10" y2="18"/></svg>;
}
function UserIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function RefreshCwIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
}
function CoffeeIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></svg>
}
function HeartIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
}

const iconComponents: Record<string, React.FC<{ active: boolean; color: string }>> = {
  Calculator: ({ active, color }) => <CalculatorIcon className="w-[15px] h-[15px]" style={{ color: active ? color : "#52525b" }} />,
  LayoutDashboard: ({ active, color }) => <svg className="w-[15px] h-[15px]" style={{ color: active ? color : "#52525b" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>,
  Calendar: ({ active, color }) => <svg className="w-[15px] h-[15px]" style={{ color: active ? color : "#52525b" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>,
  BarChart3: ({ active, color }) => <svg className="w-[15px] h-[15px]" style={{ color: active ? color : "#52525b" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>,
  BookOpen: ({ active, color }) => <svg className="w-[15px] h-[15px]" style={{ color: active ? color : "#52525b" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  Award: ({ active, color }) => <svg className="w-[15px] h-[15px]" style={{ color: active ? color : "#52525b" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>,
  CalendarDays: ({ active, color }) => <svg className="w-[15px] h-[15px]" style={{ color: active ? color : "#52525b" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/></svg>,
  ClipboardCheck: ({ active, color }) => <svg className="w-[15px] h-[15px]" style={{ color: active ? color : "#52525b" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>,
  TrendingUp: ({ active, color }) => <svg className="w-[15px] h-[15px]" style={{ color: active ? color : "#52525b" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  User: ({ active, color }) => <svg className="w-[15px] h-[15px]" style={{ color: active ? color : "#52525b" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  BookMarked: ({ active, color }) => <svg className="w-[15px] h-[15px]" style={{ color: active ? color : "#52525b" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H8.5a2.5 2.5 0 0 1 0-5H20"/><path d="m9 9 2 2 4-4"/></svg>,
  FileText: ({ active, color }) => <svg className="w-[15px] h-[15px]" style={{ color: active ? color : "#52525b" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><line x1="10" x2="14" y1="12" y2="12"/><line x1="10" x2="14" y1="16" y2="16"/></svg>,
  Megaphone: ({ active, color }) => <svg className="w-[15px] h-[15px]" style={{ color: active ? color : "#52525b" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 11 18-5v12L3 13v-2Z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>,
  MessageSquareText: ({ active, color }) => <svg className="w-[15px] h-[15px]" style={{ color: active ? color : "#52525b" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="14" y2="13"/></svg>,
  Sliders: ({ active, color }) => <svg className="w-[15px] h-[15px]" style={{ color: active ? color : "#52525b" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="2" y1="14" x2="6" y2="14"/><line x1="10" y1="12" x2="14" y2="12"/><line x1="18" y1="16" x2="22" y2="16"/></svg>,
  Bot: ({ active, color }) => <svg className="w-[15px] h-[15px]" style={{ color: active ? color : "#52525b" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="12" x="3" y="8" rx="2"/><path d="M10 11h4"/><path d="M12 2v6"/><circle cx="9" cy="14" r="1" fill="currentColor"/><circle cx="15" cy="14" r="1" fill="currentColor"/></svg>,
  Coffee: ({ active, color }) => <CoffeeIcon className="w-[15px] h-[15px]" style={{ color: active ? color : "#52525b" }} />,
  IdCard: ({ active, color }) => <svg className="w-[15px] h-[15px]" style={{ color: active ? color : "#52525b" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3h5v18H3V3h5"/><rect width="6" height="10" x="9" y="7" rx="1"/><path d="M9 7v10"/></svg>,
}

const DESKTOP_SECTIONS = [
  {
    label: "Dashboard",
    items: [
      { id: "dashboard" as const, label: "Dashboard", subtitle: "Overview and focus", icon: "LayoutDashboard", color: "#34d399" },
    ],
  },
  {
    label: "Academics",
    items: [
      { id: "timetable" as const, label: "Timetable", subtitle: "Daily schedule", icon: "Calendar", color: "#34d399" },
      { id: "attendance" as const, label: "Attendance", subtitle: "Risk and shortage", icon: "BarChart3", color: "#34d399" },
      { id: "courses" as const, label: "Courses", subtitle: "Subjects and faculty", icon: "BookOpen", color: "#60a5fa" },
      { id: "marks" as const, label: "Marks", subtitle: "Scores and trends", icon: "Award", color: "#f59e0b" },
      { id: "calendar" as const, label: "Calendar", subtitle: "Day order and holidays", icon: "CalendarDays", color: "#a78bfa" },
    ],
  },
  {
    label: "Tools",
    items: [
      { id: "gradex" as const, label: "GradeX", subtitle: "Projection tools", icon: "TrendingUp", color: "#fb923c" },
      { id: "planner" as const, label: "Planner", subtitle: "All day orders", icon: "BookMarked", color: "#34d399" },
      { id: "notes" as const, label: "Notes & PYQs", subtitle: "Study material", icon: "FileText", color: "#60a5fa" },
      { id: "mess" as const, label: "Mess Menu", subtitle: "Hostel mess menus", icon: "Coffee", color: "#34d399" },
      { id: "calculator" as const, label: "Calculator Plus", subtitle: "Study utilities", icon: "Calculator", color: "#34d399" },
      { id: "finder" as const, label: "Faculty Finder", subtitle: "Staff room locator", icon: "IdCard", color: "#34d399" },
    ],
  },
  {
    label: "Account",
    items: [
      { id: "about" as const, label: "Profile", subtitle: "Your SRM snapshot", icon: "User", color: "#f472b6" },
      { id: "settings" as const, label: "App Setting", subtitle: "Theme, colors & more", icon: "Sliders", color: "#a78bfa" },
      { id: "updates" as const, label: "Updates", subtitle: "Bugs & release notes", icon: "Megaphone", color: "#fbbf24" },
      { id: "feedback" as const, label: "Feedback", subtitle: "Send feedback", icon: "MessageSquareText", color: "#a78bfa" },
    ],
  },
  {
    label: "AI",
    items: [
      { id: "ai" as const, label: "AI Chat", subtitle: "AI assistant & chat", icon: "Bot", color: "#a78bfa" },
    ],
  },
]

function fmtShortSync(value: string | null | undefined) {
  if (!value) return "Not synced yet"
  return new Date(value).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })
}

export function AppSidebar({ activeTab, setActiveTab }: {
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
}) {
  const auth = useAuth() as any
  const user = auth.user
  const refreshData = auth.refreshData
  const lastSyncTime = auth.lastSyncTime
  const { isSupportOpen, handleSupportClick, closeSupport } = useSupport()
  useEffect(() => { const s = document.createElement("style"); s.textContent = "@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}"; s.id = "toast-style-sidebar"; if (!document.getElementById("toast-style-sidebar")) document.head.appendChild(s); return () => { document.getElementById("toast-style-sidebar")?.remove() } }, [])
  return (
    <>
      <aside className="hidden lg:block lg:sticky lg:top-[52px] lg:mt-12">
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card-bg, rgba(24,24,27,0.6))", border: "1px solid var(--border-color, rgba(255,255,255,0.04))" }}>
        <div className="p-5" style={{ borderBottom: "1px solid var(--border-color, rgba(255,255,255,0.04))" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl shrink-0 overflow-hidden" style={{ background: "var(--accent-bg, rgba(52,211,153,0.1))", border: "1px solid var(--accent-border, rgba(52,211,153,0.15))" }}>
              <ProfileAvatar name={user?.name} token={auth?.token} fallback={<UserIcon className="w-5 h-5" style={{ color: "var(--accent-theme, #34d399)" }} />} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>{user?.name || "SRM Student"}</p>
              <p className="text-[11px]" style={{ color: "var(--text-subtle)" }}>Sem {user?.semester || "—"} · Batch {user?.batch || "—"}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>
              <RefreshCwIcon className="w-3 h-3 inline mr-1 -mt-0.5" />
              {fmtShortSync(lastSyncTime)}
            </span>
            <button onClick={refreshData}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
              style={{ color: "var(--text-faint)", background: "var(--element-bg, rgba(255,255,255,0.03))", border: "1px solid var(--border-color, rgba(255,255,255,0.04))" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent-theme, #34d399)"; e.currentTarget.style.background = "var(--accent-bg, rgba(52,211,153,0.1))" }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-faint)"; e.currentTarget.style.background = "var(--element-bg, rgba(255,255,255,0.03))" }}>
              <RefreshCwIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="p-3 space-y-3">
          {DESKTOP_SECTIONS.map((section, si) => (
            <div key={section.label}>
              {si > 0 && (
                <div style={{ height: 1, background: "var(--border-color, rgba(255,255,255,0.06))", margin: "4px 12px 6px" }} />
              )}
              <p style={{
                fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
                color: "var(--text-faint, #52525b)", padding: "0 12px", marginBottom: 4, marginTop: 2,
              }}>
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = activeTab === item.id
                  const Icon = iconComponents[item.icon]
                  return (
                    <button key={item.id} onClick={() => setActiveTab(item.id)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 12px",
                        borderRadius: 10,
                        cursor: "pointer",
                        border: "none",
                        background: active ? `${item.color}0d` : "transparent",
                        transition: "background 0.15s",
                        position: "relative",
                      }}
                      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.03)" }}
                      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent" }}
                    >
                      {active && (
                        <div style={{
                          position: "absolute", left: 0, top: 6, bottom: 6, width: 3,
                          borderRadius: "0 3px 3px 0", background: item.color,
                        }} />
                      )}
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: active ? `${item.color}18` : "rgba(255,255,255,0.03)",
                        flexShrink: 0,
                      }}>
                        <Icon active={active} color={item.color} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                        <p style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? "var(--text-primary)" : "var(--text-muted)", margin: 0, lineHeight: 1.3 }}>
                          {item.label}
                        </p>
                        <p style={{ fontSize: 10, color: "var(--text-faint)", margin: 0, lineHeight: 1.3 }}>{item.subtitle}</p>
                      </div>
                      {active && (
                        <div style={{
                          width: 5, height: 5, borderRadius: "50%",
                          background: item.color, flexShrink: 0,
                        }} />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 pt-0">
          <button onClick={handleSupportClick} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", borderRadius: 10, width: "100%", textAlign: "left",
            background: "rgba(245,158,11,0.04)",
            border: "1px solid rgba(245,158,11,0.1)",
            cursor: "pointer", transition: "background 0.2s",
          }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(245,158,11,0.07)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(245,158,11,0.04)"}
          >
            <div style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(245,158,11,0.1)", flexShrink: 0 }}>
              <HeartIcon className="w-4 h-4" style={{ color: "var(--text-muted, #a1a1aa)" }} />
            </div>
            <div>
              <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>Support</p>
              <p className="text-[10px]" style={{ color: "var(--text-subtle)" }}>Buy me a coffee</p>
            </div>
          </button>
        </div>
      </div>
    </aside>
      <SupportModal isOpen={isSupportOpen} onClose={closeSupport} />
    </>
  )
}
