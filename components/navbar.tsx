"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import {
  Award,
  BarChart3,
  BookMarked,
  BookOpen,
  Bot,
  Calendar,
  CalendarDays,
  Coffee, ExternalLink, Heart,
  FileText,
  Hash,
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  Megaphone,
  MessageSquareText,
  Moon,
  WifiOff,
  Settings,
  Sun,
  TrendingUp,
  User,
  X,
  IdCard,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useTheme } from "@/lib/theme-context"
import { LoginModal } from "./login-modal"
import { SignOutModal } from "./signout-modal"
import { SupportModal } from "./support-modal"
import { useSupport } from "@/lib/use-support"
import { ProfileAvatar } from "./profile-avatar"
import { QrCode } from "./qr-code"

type TabType =
  | "dashboard"
  | "timetable"
  | "attendance"
  | "courses"
  | "marks"
  | "calendar"
  | "gradex"
  | "planner"
  | "notes"
  | "updates"
  | "about"
  | "feedback"
  | "ai"
  | "settings"
  | "mess"
  | "finder"

interface NavbarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  minimised: boolean
  setMinimised: (v: boolean) => void
}

const NAV = [
  { id: "dashboard" as const, label: "Dashboard", short: "Home", icon: LayoutDashboard, color: "#34d399" },
  { id: "timetable" as const, label: "Timetable", short: "Time", icon: Calendar, color: "#38bdf8" },
  { id: "attendance" as const, label: "Attendance", short: "Attend", icon: BarChart3, color: "#34d399" },
  { id: "courses" as const, label: "Courses", short: "Courses", icon: BookOpen, color: "#60a5fa" },
  { id: "marks" as const, label: "Marks", short: "Marks", icon: Award, color: "#f59e0b" },
  { id: "calendar" as const, label: "Calendar", short: "Cal", icon: CalendarDays, color: "#a78bfa" },
  { id: "gradex" as const, label: "GradeX", short: "Grade", icon: TrendingUp, color: "#fb923c" },
  { id: "planner" as const, label: "Planner", short: "Plan", icon: BookMarked, color: "#34d399" },
  { id: "notes" as const, label: "Notes & PYQs", short: "Notes", icon: FileText, color: "#60a5fa" },
  { id: "mess" as const, label: "Mess Menu", short: "Mess", icon: Coffee, color: "#34d399" },
  { id: "updates" as const, label: "Updates", short: "News", icon: Megaphone, color: "#fbbf24" },
  { id: "feedback" as const, label: "Feedback", short: "Feedback", icon: MessageSquareText, color: "#fb923c" },
  { id: "about" as const, label: "Profile", short: "Me", icon: User, color: "#f472b6" },
  { id: "finder" as const, label: "Faculty Finder", short: "Finder", icon: IdCard, color: "#34d399" },
  { id: "settings" as const, label: "App Setting", short: "Gear", icon: Settings, color: "#a78bfa" },
] as const

function getCategoryItems(cat: string): readonly (typeof NAV)[number][] {
  if (cat === "academics") return NAV.filter((n) => n.id === "timetable" || n.id === "attendance" || n.id === "marks" || n.id === "courses" || n.id === "calendar")
  if (cat === "tools") return NAV.filter((n) => n.id === "planner" || n.id === "gradex" || n.id === "notes" || n.id === "finder")
  return NAV.filter((n) => n.id === "about" || n.id === "settings" || n.id === "updates" || n.id === "feedback")
}

const MOBILE_TABS = [
  { key: "academics", label: "Academics" },
  { key: "tools", label: "Tools" },
  { key: "home", label: "" },
  { key: "account", label: "Account" },
  { key: "ai", label: "AI" },
] as const

function tabCategory(tab: string): string | null {
  if (["timetable", "attendance", "marks", "courses", "calendar"].includes(tab)) return "academics"
  if (["planner", "gradex", "notes", "finder"].includes(tab)) return "tools"
  if (["about", "settings", "updates", "feedback"].includes(tab)) return "account"
  if (tab === "ai") return "ai"
  return null
}

const SUBTITLES: Record<TabType, string> = {
  dashboard: "Quick access and focus",
  timetable: "Daily class flow",
  attendance: "Track shortage and risk",
  courses: "Subjects and faculty",
  marks: "Internal score view",
  calendar: "Day order and holidays",
  gradex: "Prediction tools",
  planner: "All 5 day orders",
  notes: "Study material hub",
  mess: "Hostel mess menu",
  updates: "Bugs & release notes",
  settings: "Theme, colors & more",
  about: "Your SRM snapshot",
  feedback: "Send feedback",
  ai: "AI assistant & chat",
  finder: "Faculty staff room locator",
}

function fmtDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function SRMLogo() {
  return <img src="/apple-icon-v2.png" alt="edutechsrm" style={{ width: 36, height: 36, borderRadius: 12, objectFit: "contain" }} />
}

export function Navbar({ activeTab, setActiveTab, minimised, setMinimised }: NavbarProps) {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isSignOutOpen, setIsSignOutOpen] = useState(false)
  const [openCategory, setOpenCategory] = useState<string | null>(null)
  const [showTop, setShowTop] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showAiPrompt, setShowAiPrompt] = useState(false)
  const [showSharePopup, setShowSharePopup] = useState(false)
  const [showMobileNav, setShowMobileNav] = useState(true)
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [sliderPos, setSliderPos] = useState({ left: 0, width: 0 })
  const aiPromptShown = useRef(false)

  const { isSupportOpen, handleSupportClick, closeSupport } = useSupport()

  // Close settings dropdown on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-settings-dropdown]')) setMenuOpen(false)
    }
    document.addEventListener("mousedown", handleClick, true)
    return () => document.removeEventListener("mousedown", handleClick, true)
  }, [menuOpen])

  const lastY = useRef(0)
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const overlayTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { theme, setMode } = useTheme()
  const { isAuthenticated, user, token, calendar, dateToDoMap, logout, refreshData, isLoading, isBackgroundSyncing, isManualRefresh, isOffline } = useAuth() as any

  // Show AI prompt once per session after login, dismiss on any click
  useEffect(() => {
    if (isAuthenticated && !aiPromptShown.current) {
      aiPromptShown.current = true
      setShowAiPrompt(true)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!showAiPrompt) return
    const dismiss = () => setShowAiPrompt(false)
    document.addEventListener("click", dismiss, { once: true })
    return () => document.removeEventListener("click", dismiss)
  }, [showAiPrompt])

  const toggleDarkLight = useCallback(() => {
    const nextMode = theme.mode === "light" ? "dark" : "light"
    const run = () => setMode(nextMode)
    const docWithTransition = document as Document & {
      startViewTransition?: (callback: () => void) => { finished: Promise<void> }
    }

    const overlay = document.createElement("div")
    overlay.style.cssText =
      "position:fixed;inset:0;pointer-events:none;z-index:9999;background:rgba(52,211,153,0.1);opacity:1;transition:opacity 420ms ease-out;"
    document.body.appendChild(overlay)

    if (typeof docWithTransition.startViewTransition === "function") {
      docWithTransition.startViewTransition(run)
      requestAnimationFrame(() => {
        overlay.style.opacity = "0"
      })
      window.setTimeout(() => overlay.remove(), 460)
      return
    }

    run()
    requestAnimationFrame(() => {
      overlay.style.opacity = "0"
    })
    window.setTimeout(() => overlay.remove(), 460)
  }, [theme.mode, setMode])

  const handleShare = () => setShowSharePopup(true)

  const todayStr = fmtDate(new Date())
  const todayDO = (dateToDoMap || {})[todayStr] ?? null
  const todayHoliday = (calendar as any[] | undefined)?.find(
    (event: any) => event.date === todayStr && (event.type === "holiday" || event.title?.toLowerCase?.().includes("holiday")),
  )

  const activeItem = NAV.find((item) => item.id === activeTab) ?? NAV[0]
  const activeColor = activeItem.color

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      const docH = document.documentElement.scrollHeight
      const winH = window.innerHeight
      const nearFooter = docH - y - winH < 88
      const goingDown = y > lastY.current && y > 40

      setShowTop(!goingDown)
      setMinimised(goingDown || nearFooter)
      setShowMobileNav(!nearFooter)
      lastY.current = y
      if (y > 10) setShowAiPrompt(false)

      if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
      scrollTimeout.current = setTimeout(() => {
        const stillNearFooter = document.documentElement.scrollHeight - window.scrollY - window.innerHeight < 88
        if (!stillNearFooter) {
          setMinimised(false)
          setShowMobileNav(true)
        }
      }, 700)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
    }
  }, [])

  useEffect(() => {
    return () => { if (overlayTimer.current) clearTimeout(overlayTimer.current) }
  }, [])

  // Close folder when mobile nav hides
  useEffect(() => {
    if (!showMobileNav) setOpenCategory(null)
  }, [showMobileNav])

  // Close folder on scroll
  useEffect(() => {
    if (!openCategory) return
    const onScroll = () => setOpenCategory(null)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [openCategory])

  // Derive which category tab should be highlighted
  const activeCategory = tabCategory(activeTab) || openCategory

  // Measure slider position for the active category
  useLayoutEffect(() => {
    const key = openCategory || activeCategory
    if (!key) return
    const btn = tabRefs.current[key]
    if (!btn) return
    const parent = btn.parentElement
    if (!parent) return
    setSliderPos({ left: btn.offsetLeft, width: btn.offsetWidth })
  }, [openCategory, activeTab])

  const handleTab = useCallback((tab: TabType) => {
    setActiveTab(tab)
  }, [setActiveTab])

  return (
    <>
      <motion.header
        animate={{ y: showTop ? 0 : -52, opacity: showTop ? 1 : 0 }}
        transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
        className="fixed left-0 right-0 top-0 z-50"
        style={{
          background: "linear-gradient(180deg, color-mix(in srgb, var(--page-bg, #09090b) 95%, transparent), color-mix(in srgb, var(--page-bg, #09090b) 72%, transparent))",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          borderBottom: "1px solid var(--border-color, rgba(255,255,255,0.05))",
          boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
        }}
      >
        <div className="mx-auto flex h-[52px] w-full max-w-full items-center px-3 sm:max-w-lg lg:max-w-full lg:px-6 relative">

          {/* ── Left: brand ── */}
          <div className="flex flex-1 justify-start lg:flex-none lg:w-[280px] xl:w-[318px] lg:justify-center">
            <button
              onClick={() => handleTab("dashboard")}
              className="flex items-center gap-1.5 text-left"
              style={{ background: "transparent", border: 0, padding: 0, cursor: "pointer" }}
            >
              <p className="font-black tracking-tight leading-none" style={{ fontSize: 14, color: "var(--text-primary)", letterSpacing: "-0.5px", fontFamily: "'Space Grotesk', sans-serif" }}>
                edutechsrm
              </p>
              <span style={{ fontSize: 8, fontWeight: 700, color: "var(--text-muted)", background: "var(--element-bg, rgba(255,255,255,0.06))", padding: "1px 4px", borderRadius: 3, fontFamily: "'Space Grotesk', sans-serif", lineHeight: "14px" }}>v2.1</span>
            </button>
          </div>

          {/* ── Center: class/batch/DO ── */}
          <div className="flex flex-1 justify-center lg:fixed lg:left-1/2 lg:-translate-x-1/2 lg:w-auto">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-1 leading-none">
                {user.specialization || user.section ? (
                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{user.specialization || user.section}</span>
                ) : null}
                {user.batch ? (
                  <>
                    <span style={{ color: "var(--text-faint, rgba(255,255,255,0.1))" }}>·</span>
                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>B{user.batch}</span>
                  </>
                ) : null}
                {todayDO ? (
                  <>
                    <span style={{ color: "var(--text-faint, rgba(255,255,255,0.1))" }}>·</span>
                    <span className="flex items-center gap-0.5 text-[10px] font-bold" style={{ color: "#34d399" }}>
                      <Hash style={{ width: 7, height: 7 }} />
                      DO {todayDO}
                    </span>
                  </>
                ) : null}
                {todayHoliday && !todayDO ? (
                  <>
                    <span style={{ color: "var(--text-faint, rgba(255,255,255,0.1))" }}>·</span>
                    <span className="text-[10px]" style={{ color: "#34d399" }}>Holiday</span>
                  </>
                ) : null}
              </div>
            ) : (
              <p className="text-[9px] leading-none" style={{ color: "var(--text-muted)" }}>SRM Academia</p>
            )}
          </div>

          {/* ── Right: theme toggle + settings ── */}
          <div className="flex flex-1 justify-end items-center gap-1.5">

            {/* ── Theme toggle ── */}
            <button
              onClick={toggleDarkLight}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300"
              style={{
                color: theme.mode === "light" ? "#fbbf24" : "var(--text-faint, #52525b)",
                background: theme.mode === "light" ? "rgba(251,191,36,0.08)" : "var(--element-bg, rgba(255,255,255,0.03))",
                border: "1px solid var(--border-color, rgba(255,255,255,0.05))",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = theme.mode === "light" ? "#fbbf24" : "#d4d4d8" }}
              onMouseLeave={(e) => { e.currentTarget.style.color = theme.mode === "light" ? "#fbbf24" : "var(--text-faint, #52525b)" }}
            >
               <AnimatePresence mode="wait" initial={false}>
                 <motion.div
                   key={theme.mode === "light" ? "sun" : "moon"}
                   initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
                   animate={{ rotate: 0, scale: 1, opacity: 1 }}
                   exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
                   transition={{ duration: 0.35, ease: "easeOut" }}
                   style={{ display: "flex" }}
                >
                  {theme.mode === "light" ? (
                    <Sun style={{ width: 13, height: 13 }} />
                  ) : (
                    <Moon style={{ width: 13, height: 13 }} />
                  )}
                </motion.div>
              </AnimatePresence>
            </button>

            <button
              onClick={handleShare}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300"
              style={{
                color: "var(--text-faint, #52525b)",
                background: "var(--element-bg, rgba(255,255,255,0.03))",
                border: "1px solid var(--border-color, rgba(255,255,255,0.05))",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#d4d4d8" }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-faint, #52525b)" }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>
            </button>

            {isAuthenticated ? (
              <div className="relative" data-settings-dropdown>
                {/* Desktop: settings gear */}
                <button
                  onClick={() => setMenuOpen(o => !o)}
                  className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300"
                  style={{
                    color: menuOpen ? "#34d399" : "var(--text-faint, #52525b)",
                    background: menuOpen ? "rgba(52,211,153,0.1)" : "var(--element-bg, rgba(255,255,255,0.03))",
                    border: "1px solid var(--border-color, rgba(255,255,255,0.05))",
                  }}
                  onMouseEnter={(e) => { if (!menuOpen) e.currentTarget.style.color = "#d4d4d8" }}
                  onMouseLeave={(e) => { if (!menuOpen) e.currentTarget.style.color = "var(--text-faint, #52525b)" }}
                >
                  <Settings style={{ width: 13, height: 13 }} className={"transition-transform duration-300 " + (menuOpen ? "rotate-90" : "")} />
                </button>
                {/* Mobile: profile photo */}
                <button
                  onClick={() => setMenuOpen(o => !o)}
                  className="flex sm:hidden h-8 w-8 items-center justify-center rounded-full overflow-hidden transition-all duration-300"
                  style={{
                    background: menuOpen ? "rgba(52,211,153,0.1)" : "var(--element-bg, rgba(255,255,255,0.03))",
                    border: "1px solid var(--border-color, rgba(255,255,255,0.05))",
                  }}
                >
                  <ProfileAvatar name={user?.name} token={token} fallback={<Settings style={{ width: 13, height: 13 }} />} />
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                    <div
                      className="fixed right-3 top-[68px] sm:absolute sm:right-0 sm:top-full sm:mt-2 z-50 w-56 rounded-2xl border overflow-hidden"
                      style={{
                        background: "var(--elevated-bg, rgba(24,24,27,0.98))",
                        borderColor: "var(--border-medium, rgba(255,255,255,0.08))",
                        backdropFilter: "blur(24px) saturate(180%)",
                        WebkitBackdropFilter: "blur(24px) saturate(180%)",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                      }}
                    >
                      {user && (
                        <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border-color, rgba(255,255,255,0.06))" }}>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl shrink-0 overflow-hidden" style={{ background: "var(--accent-bg)", border: "1px solid var(--accent-border)" }}>
                              <ProfileAvatar name={user.name} token={token} fallback={<User style={{ width: 16, height: 16, color: "var(--accent-theme, #34d399)" }} />} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>{user.name}</p>
                              <p className="text-[10px] truncate" style={{ color: "var(--text-subtle)" }}>{user.email || user.username}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 mt-2 text-[10px]" style={{ color: "#52525b" }}>
                            <span style={{ color: "var(--accent-theme, #34d399)" }}>{user.specialization || user.program}</span>
                            <span style={{ color: "var(--text-faint, rgba(255,255,255,0.1))" }}>·</span>
                            <span>B{user.batch}</span>
                            <span style={{ color: "var(--text-faint, rgba(255,255,255,0.1))" }}>·</span>
                            <span>Sem {user.semester}</span>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => { setMenuOpen(false); setActiveTab("settings") }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium transition-all"
                        style={{ color: "var(--text-secondary)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--element-bg-hover, rgba(255,255,255,0.04))" }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "" }}
                      >
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--accent-bg)", border: "1px solid var(--accent-border)" }}>
                          <Settings style={{ width: 13, height: 13, color: "var(--accent-theme, #34d399)" }} />
                        </div>
                        <div className="text-left">
                          <p style={{ color: "var(--text-primary)" }}>App Settings</p>
                          <p className="text-[10px]" style={{ color: "var(--text-subtle)" }}>Theme, colors & more</p>
                        </div>
                      </button>

                      <button
                        onClick={() => { setMenuOpen(false); setActiveTab("about") }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium transition-all"
                        style={{ color: "var(--text-secondary)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--element-bg-hover, rgba(255,255,255,0.04))" }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "" }}
                      >
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(244,114,182,0.1)", border: "1px solid rgba(244,114,182,0.2)" }}>
                          <User style={{ width: 13, height: 13, color: "#f472b6" }} />
                        </div>
                        <div className="text-left">
                          <p style={{ color: "var(--text-primary)" }}>Profile</p>
                          <p className="text-[10px]" style={{ color: "var(--text-subtle)" }}>Your SRM snapshot</p>
                        </div>
                      </button>

                      <button
                        onClick={() => { setMenuOpen(false); handleSupportClick() }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium transition-all"
                        style={{ color: "var(--text-secondary)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--element-bg-hover, rgba(255,255,255,0.04))" }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "" }}
                      >
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)" }}>
                            <Heart style={{ width: 13, height: 13, color: "#a78bfa" }} />
                          </div>
                          <div className="text-left">
                            <p style={{ color: "var(--text-primary)" }}>Support</p>
                            <p className="text-[10px]" style={{ color: "var(--text-subtle)" }}>Buy me a coffee</p>
                          </div>
                      </button>

                      <div style={{ height: 1, background: "var(--border-color, rgba(255,255,255,0.06))", margin: "0 8px" }} />

                      <button
                        onClick={() => { setMenuOpen(false); setIsSignOutOpen(true) }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium transition-all"
                        style={{ color: "var(--text-muted)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(248,113,113,0.06)"; e.currentTarget.style.color = "#f87171" }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = ""; e.currentTarget.style.color = "#a1a1aa" }}
                      >
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(248,113,113,0.1)" }}>
                          <LogOut style={{ width: 13, height: 13, color: "#f87171" }} />
                        </div>
                        <div className="text-left">
                          <p>Sign Out</p>
                          <p className="text-[10px]" style={{ color: "var(--text-subtle)" }}>End your session</p>
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold"
                style={{ background: "linear-gradient(135deg,#34d399,#10b981)", color: "#09090b" }}
              >
                <LogIn style={{ width: 12, height: 12 }} />
                Login
              </button>
            )}
          </div>
        </div>
      </motion.header>

      {/* ── Sync / Offline pills ── */}
      <AnimatePresence>
        {(isBackgroundSyncing || isManualRefresh || isOffline) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{ top: 62 }}
            className="fixed inset-x-0 z-50 flex items-center justify-center gap-2 pointer-events-none"
          >
            {(isBackgroundSyncing || isManualRefresh) && (
              <motion.div
                layoutId="syncPill"
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full pointer-events-auto"
                style={{
                  background: "color-mix(in srgb, rgba(52,211,153,0.12) 100%, transparent)",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                  border: "1px solid rgba(52,211,153,0.18)",
                  color: "#34d399",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: "#34d399", boxShadow: "0 0 6px rgba(52,211,153,0.6)" }}
                />
                Syncing
              </motion.div>
            )}
            {isOffline && (
              <motion.div
                layoutId="offlinePill"
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full pointer-events-auto"
                style={{
                  background: "color-mix(in srgb, rgba(248,113,113,0.12) 100%, transparent)",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                  border: "1px solid rgba(248,113,113,0.18)",
                  color: "#f87171",
                }}
              >
                <WifiOff style={{ width: 12, height: 12 }} />
                Offline
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile: floating pill nav ── */}
      <style>{`
        @keyframes nav-tab-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes nav-shine {
          0% { transform: translateX(-100%) rotate(25deg); }
          100% { transform: translateX(100%) rotate(25deg); }
        }
      `}</style>

      {/* Folder panel backdrop (outside pill container to avoid z-index issues) */}
      <AnimatePresence>
        {openCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: "rgba(0,0,0,0.35)" }}
            onClick={() => setOpenCategory(null)}
          />
        )}
      </AnimatePresence>

      {/* Folder panel — icon grid */}
      <AnimatePresence>
        {openCategory && (() => {
          const catColor = openCategory === "academics" ? "#34d399"
            : openCategory === "tools" ? "#60a5fa"
            : openCategory === "account" ? "#f59e0b"
            : "#a78bfa"
          return (
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed left-0 right-0 z-[60] flex justify-center lg:hidden"
            style={{
              bottom: "calc(88px + env(safe-area-inset-bottom, 0px))",
              pointerEvents: "auto",
            }}
            onClick={() => setOpenCategory(null)}
          >
            <div
              style={{
                width: "calc(100% - 32px)",
                maxWidth: 400,
                borderRadius: 24,
                overflow: "hidden",
                background: `color-mix(in srgb, ${catColor}08, var(--elevated-bg, rgba(24,24,27,0.98)) 85%)`,
                backdropFilter: "blur(28px) saturate(180%)",
                WebkitBackdropFilter: "blur(28px) saturate(180%)",
                border: `1px solid ${catColor}20`,
                boxShadow: `0 12px 48px ${catColor}08, 0 0 0 0 rgba(0,0,0,0.4)`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top color bar */}
              <div style={{ height: 3, background: `linear-gradient(90deg, ${catColor}00, ${catColor}, ${catColor}00)`, opacity: 0.6 }} />
              <div style={{ padding: "12px 12px 14px" }}>
                {/* Category row with icon + name */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, padding: "0 4px" }}>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 7,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: `${catColor}18`,
                    }}
                  >
                    {openCategory === "academics" ? (
                      <BookOpen style={{ width: 13, height: 13, color: catColor }} />
                    ) : openCategory === "tools" ? (
                      <LayoutDashboard style={{ width: 13, height: 13, color: catColor }} />
                    ) : openCategory === "account" ? (
                      <User style={{ width: 13, height: 13, color: catColor }} />
                    ) : (
                      <Bot style={{ width: 13, height: 13, color: catColor }} />
                    )}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: catColor, fontFamily: "'Space Grotesk', sans-serif" }}>
                    {openCategory === "academics"
                      ? "Academics"
                      : openCategory === "tools"
                        ? "Tools"
                        : openCategory === "account"
                          ? "Account"
                          : "AI"}
                  </span>
                </div>

                {/* Animated grid */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={openCategory}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{ display: "flex", flexDirection: "row", justifyContent: "center", gap: 6 }}
                  >
                    {(openCategory === "ai"
                      ? [{ id: "ai", label: "AI Chat", icon: Bot, color: "#a78bfa" }]
                      : getCategoryItems(openCategory).map((n) => ({ ...n }))
                    ).map((item: any, idx: number) => {
                      const active = activeTab === item.id
                      const Icon = item.icon
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            if (item.id === "ai") sessionStorage.setItem("ai_context", "navbar")
                            handleTab(item.id)
                            setOpenCategory(null)
                          }}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 4,
                            padding: "10px 6px 8px",
                            minWidth: 0,
                            flex: 1,
                            borderRadius: 14,
                            background: active ? `${item.color}0a` : "transparent",
                            border: `1px solid ${active ? `${item.color}18` : "transparent"}`,
                            cursor: "pointer",
                            transition: "all 0.2s",
                            position: "relative",
                            animation: `nav-tab-in 0.35s ease-out backwards`,
                            animationDelay: `${0.03 * idx}s`,
                          }}
                        >
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 10,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: active ? `${item.color}18` : `${catColor}0a`,
                            }}
                          >
                            <Icon style={{ width: 16, height: 16, color: active ? item.color : catColor }} />
                          </div>
                          <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? item.color : catColor, textAlign: "center", lineHeight: 1.2 }}>
                            {item.label}
                          </span>
                          {active && (
                            <div style={{ position: "absolute", top: 4, right: 4, width: 5, height: 5, borderRadius: "50%", background: item.color }} />
                          )}
                        </button>
                      )
                    })}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
          )
        })()}
      </AnimatePresence>

      {/* Floating pill (glassmorphism) */}
      <div
        className={`fixed left-0 right-0 z-50 transition-all duration-500 ease-out lg:hidden ${
          showMobileNav ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-12 pointer-events-none"
        }`}
        style={{ bottom: 0 }}
      >
        <div className="flex justify-center px-4" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 14px)" }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative flex items-center"
            style={{
              gap: 0,
              background: "color-mix(in srgb, var(--elevated-bg, rgba(24,24,27,0.98)) 55%, transparent)",
              backdropFilter: "blur(36px) saturate(200%)",
              WebkitBackdropFilter: "blur(36px) saturate(200%)",
              padding: 6,
              borderRadius: 30,
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              border: "1px solid var(--border-color, rgba(255,255,255,0.06))",
              width: "100%",
              maxWidth: 380,
              minWidth: 300,
              height: 60,
              overflow: "hidden",
            }}
          >
            {/* Glass shine overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(45deg, transparent, rgba(255,255,255,0.02), transparent)",
                borderRadius: 25,
                animation: "nav-shine 4s linear infinite",
                opacity: 0.6,
                pointerEvents: "none",
              }}
            />
            {/* Slider indicator */}
            <div
              style={{
                position: "absolute",
                top: 6,
                bottom: 6,
                left: sliderPos.left || 6,
                width: sliderPos.width || `calc(25% - 4px)`,
                background: "var(--card-solid, #18181b)",
                borderRadius: 24,
                transition: "all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
                zIndex: 0,
                opacity: activeCategory ? 1 : 0,
              }}
            />
            {MOBILE_TABS.map((tab) => {
              const isActive = (tab.key === "home" ? activeTab === "dashboard" : activeCategory === tab.key || openCategory === tab.key)
              const catColors: Record<string, string> = {
                academics: "#34d399",
                tools: "#60a5fa",
                account: "#f59e0b",
                ai: "#a78bfa",
                home: "#f472b6",
              }
              const accent = catColors[tab.key] || "#34d399"
              const tabColor = openCategory ? (isActive ? accent : `${accent}88`) : (isActive ? accent : "var(--text-muted, #a1a1aa)")
              return tab.key === "home" ? (
                <button
                  key="home"
                  onClick={() => handleTab("dashboard")}
                  style={{
                    position: "relative",
                    zIndex: 1,
                    width: 44,
                    height: 44,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: activeTab === "dashboard" ? "rgba(244,114,182,0.12)" : "transparent",
                    border: activeTab === "dashboard" ? "1px solid rgba(244,114,182,0.2)" : "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "50%",
                    cursor: "pointer",
                    touchAction: "manipulation",
                    WebkitTapHighlightColor: "transparent",
                    transition: "all 0.2s",
                    flexShrink: 0,
                    margin: "0 4px",
                  }}
                >
                  <Home style={{ width: 20, height: 20, color: activeTab === "dashboard" ? "#f472b6" : (openCategory ? "#f472b688" : "var(--text-muted, #a1a1aa)") }} />
                </button>
              ) : tab.key === "ai" ? (
                <button
                  key="ai"
                  ref={(el) => { tabRefs.current["ai"] = el }}
                  onClick={() => { sessionStorage.setItem("ai_context", "navbar"); handleTab("ai"); setOpenCategory(null) }}
                  style={{
                    position: "relative",
                    zIndex: 1,
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    padding: "0 8px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    touchAction: "manipulation",
                    WebkitTapHighlightColor: "transparent",
                    animation: `nav-tab-in 0.4s ease-out backwards`,
                    animationDelay: `${0.08 + MOBILE_TABS.indexOf(tab) * 0.06}s`,
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      width: "100%",
                      color: tabColor,
                      fontSize: 14,
                      fontWeight: isActive ? 700 : 600,
                      cursor: "pointer",
                      userSelect: "none",
                      borderRadius: 20,
                      whiteSpace: "nowrap",
                      fontFamily: "'Space Grotesk', sans-serif",
                      transition: "color 0.3s ease, font-weight 0.3s ease",
                    }}
                  >
                    {tab.label}
                  </span>
                </button>
              ) : (
                <button
                  key={tab.key}
                  ref={(el) => { tabRefs.current[tab.key] = el }}
                  onClick={() => setOpenCategory(openCategory === tab.key ? null : tab.key)}
                  style={{
                    position: "relative",
                    zIndex: 1,
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    padding: "0 8px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    touchAction: "manipulation",
                    WebkitTapHighlightColor: "transparent",
                    animation: `nav-tab-in 0.4s ease-out backwards`,
                    animationDelay: `${0.08 + MOBILE_TABS.indexOf(tab) * 0.06}s`,
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      width: "100%",
                      color: tabColor,
                      fontSize: 14,
                      fontWeight: isActive ? 700 : 600,
                      cursor: "pointer",
                      userSelect: "none",
                      borderRadius: 20,
                      whiteSpace: "nowrap",
                      fontFamily: "'Space Grotesk', sans-serif",
                      transition: "color 0.3s ease, font-weight 0.3s ease",
                    }}
                  >
                    {tab.label}
                  </span>
                </button>
              )
            })}
          </motion.div>
        </div>
      </div>

      {/* ── Desktop: floating AI chat button ── */}
      <button
        className="hidden lg:flex fixed z-50 items-center"
        onClick={() => {
          sessionStorage.setItem("ai_context", "navbar")
          handleTab("ai")
        }}
        style={{
          bottom: "calc(env(safe-area-inset-bottom) + 24px)",
          right: 24,
          gap: 12,
          padding: "14px 24px 14px 20px",
          borderRadius: 9999,
          background: "color-mix(in srgb, var(--card-solid, #18181b) 95%, transparent)",
          border: "1px solid rgba(167,139,250,0.2)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
          cursor: "pointer",
          outline: "none",
        }}
      >
        <div style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(167,139,250,0.1)",
          flexShrink: 0,
        }}>
          <Bot style={{ width: 18, height: 18, color: "#a78bfa" }} />
        </div>
        <span style={{
          fontSize: 14,
          fontWeight: 700,
          color: "var(--text-primary)",
          fontFamily: "'Space Grotesk', sans-serif",
          whiteSpace: "nowrap",
        }}>
          Hi, how can I help you?
        </span>
        </button>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <SignOutModal
        isOpen={isSignOutOpen}
        onClose={() => setIsSignOutOpen(false)}
        onConfirm={() => {
          setIsSignOutOpen(false)
          logout()
        }}
      />

      <SupportModal isOpen={isSupportOpen} onClose={closeSupport} />

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
                  const url = window.location.href
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
                    await navigator.clipboard.writeText(window.location.href)
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
