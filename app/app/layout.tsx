"use client"

import { useEffect, useState, useCallback, useRef, createContext, useContext, Component } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { useTheme, applyThemeGlobally } from "@/lib/theme-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ThemePanel } from "@/components/theme-panel"
import { MaintenanceOverlay } from "@/components/maintenance-overlay"
import { AppSidebar } from "@/components/app-sidebar"
import { LoginSyncScreen, UpdateOverlay, DataUnavailableScreen } from "@/components/app-shell-ui"
import type { TabType } from "@/lib/app-types"
import { VALID_TABS } from "@/lib/app-types"
import { writeCachedPhoto } from "@/lib/photo-cache"

export const AppContext = createContext<{ minimised: boolean; navigate: (tab: TabType) => void }>({
  minimised: false,
  navigate: () => {},
})

export const useAppContext = () => useContext(AppContext)

import { DashboardSection } from "@/components/dashboard-section"
import { TimetableSection } from "@/components/timetable-section"
import { AttendanceSection } from "@/components/attendance-section"
import { CoursesSection } from "@/components/courses-section"
import { MarksSection } from "@/components/marks-section"
import { CalendarSection } from "@/components/calendar-section"
import { GradeXSection } from "@/components/gradex-section"
import { CalculatorSection } from "@/components/calculator-section"
import { AboutSection } from "@/components/profile"
import { PlannerSection } from "@/components/planner-section"
import { MessSection } from "@/components/mess-section"
import { NotesSection } from "@/components/notes-section"
import { UpdatesSection } from "@/components/updates-section"
import { FeedbackSection } from "@/components/feedback-section"
import { SettingsSection } from "@/components/settings-section"
import { AiSection } from "@/components/ai-section"
import { FinderSection } from "@/components/finder-section"

const TAB_PAGE_MAP: Record<string, string> = {
  attendance: "My_Attendance",
  marks: "My_Attendance",
  timetable: "My_Time_Table_2023_24",
  courses: "My_Time_Table_2023_24",
  calendar: "Academic_Planner",
  planner: "Academic_Planner",
  about: "members/myprofile",
  notes: "notes",
  gradex: "gradex",
  updates: "updates",
  finder: "finder",
}

const SECTION_MAP: Record<TabType, (props: { onNavigate: (tab: TabType) => void; minimised: boolean; isActive: boolean }) => React.ReactNode> = {
  dashboard:  (props) => <DashboardSection {...props} />,
  timetable:  (props) => <TimetableSection {...props} />,
  attendance: (props) => <AttendanceSection {...props} />,
  courses:    ()      => <CoursesSection />,
  marks:      ()      => <MarksSection />,
  calendar:   (props) => <CalendarSection {...props} />,
  gradex:     ()      => <GradeXSection />,
  calculator: ()      => <CalculatorSection />,
  about:      ()      => <AboutSection />,
  planner:    ()      => <PlannerSection />,
  notes:      ()      => <NotesSection />,
  mess:       (props) => <MessSection {...props} />,
  updates:    (props) => <UpdatesSection {...props} />,
  feedback:   ()      => <FeedbackSection />,
  settings:   (props) => <SettingsSection {...props} />,
  ai:         (props) => <AiSection {...props} />,
  finder:     ()      => <FinderSection />,
}

function DisabledPageOverlay({ reason }: { reason: string }) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center p-4"
      style={{ backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm rounded-[28px] border p-6 text-center"
        style={{
          background: "linear-gradient(135deg, rgba(248,113,113,0.12), rgba(251,146,60,0.06))",
          borderColor: "rgba(248,113,113,0.25)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}>
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center"
          style={{ background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.2)" }}>
          <svg className="w-6 h-6" style={{ color: "#f87171" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect width="18" height="18" x="3" y="3" rx="2" /><path d="M9 9l6 6" /><path d="M15 9l-6 6" />
          </svg>
        </div>
        <h3 className="text-lg font-black" style={{ color: "#fca5a5" }}>Feature Disabled</h3>
        <p className="text-sm mt-2 leading-relaxed" style={{ color: "#fda4af" }}>{reason}</p>
      </motion.div>
    </div>
  )
}

class TabErrorBoundary extends Component<{ children: React.ReactNode }, { error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="text-center max-w-sm">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.2)" }}>
              <svg className="w-6 h-6" style={{ color: "#f87171" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <h2 className="text-lg font-black mb-2" style={{ color: "var(--text-primary)" }}>Something went wrong</h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>{this.state.error.message}</p>
            <button onClick={() => { this.setState({ error: null }); window.location.reload() }}
              className="px-5 py-2.5 rounded-xl font-bold text-sm" style={{ background: "linear-gradient(135deg,#34d399,#10b981)", color: "#09090b" }}>
              Reload page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function BackgroundApplier() {
  const { theme } = useTheme()
  useEffect(() => { applyThemeGlobally(theme) }, [theme])
  return null
}

function MidnightRefreshBanner({ show, dismiss }: { show: boolean; dismiss: () => void }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="fixed top-16 inset-x-0 z-40 flex justify-center px-3 pointer-events-none">
          <div className="w-full max-w-md pointer-events-auto">
            <div className="relative flex gap-3 px-4 py-3.5 rounded-2xl border border-amber-500/30 bg-amber-950/60 shadow-xl shadow-black/40 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
              <div className="shrink-0 w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/25 flex items-center justify-center mt-0.5">
                <svg className="w-4.5 h-4.5 text-amber-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="relative flex h-1.5 w-1.5 shrink-0">
                    <span className="animate-ping absolute inset-0 rounded-full bg-amber-400 opacity-75" />
                    <span className="relative rounded-full h-1.5 w-1.5 bg-amber-400" />
                  </span>
                  <p className="text-xs font-bold text-amber-300 tracking-wide">SRM Portal Maintenance — 12:00 AM</p>
                </div>
                <p className="text-[11px] text-amber-200/70 leading-relaxed">SRM Academia refreshes its database every night at midnight (12:00–12:05 AM). Your data may be temporarily unavailable or show stale values. Please wait a few minutes and refresh.</p>
              </div>
              <button onClick={dismiss} className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-amber-400/60 hover:text-amber-300 hover:bg-amber-500/15 transition-all mt-0.5" aria-label="Dismiss">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function useMidnightRefreshWindow() {
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const check = () => {
      const now = new Date()
      const inWindow = now.getHours() === 0 && now.getMinutes() < 5
      setShow(inWindow)
      if (!inWindow) setDismissed(false)
    }
    check()
    const id = setInterval(check, 15_000)
    return () => clearInterval(id)
  }, [])

  return { show: show && !dismissed, dismiss: useCallback(() => setDismissed(true), []) }
}

function ChangelogModalV2({ isOpen, onClose, onViewUpdates }: { isOpen: boolean; onClose: () => void; onViewUpdates: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}>
          <motion.div initial={{ opacity: 0, y: 14, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.2 }} onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl rounded-3xl border p-6 sm:p-7"
            style={{ background: "rgba(9,9,11,0.96)", borderColor: "rgba(52,211,153,0.22)", boxShadow: "0 28px 70px rgba(0,0,0,0.6)" }}>
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em]"
              style={{ color: "#86efac", borderColor: "rgba(52,211,153,0.35)", background: "rgba(52,211,153,0.09)" }}>Version 2 Is Live</div>
            <h2 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight" style={{ color: "#f4f4f5" }}>What&apos;s new in v2.1</h2>
            <p className="mt-2 text-sm" style={{ color: "#a1a1aa" }}>Complete redesign: all pages rebuilt with a new UI system, better structure, and faster workflows.</p>
            <div className="mt-5 space-y-2.5">
              {["Every major page has been redesigned from the ground up (mobile + laptop)","Theme customization with multiple visual modes and UI styles","Improved laptop/desktop layout for cleaner daily workflow","OD/ML implementation with planner integration and attendance impact mode","Proper App Settings section with smoother controls and better structure","Profile section update with new navigation flow","New edutechsrm AI assistant tab with student-aware answers and quick redirects","Performance and transition polish for smoother real-world usage"].map((item) => (
                <div key={item} className="flex items-start gap-2.5 text-sm" style={{ color: "#d4d4d8" }}>
                  <span className="mt-1 h-1.5 w-1.5 rounded-full" style={{ background: "#34d399" }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button onClick={onViewUpdates} className="w-full rounded-xl px-4 py-2.5 text-sm font-bold border"
                style={{ color: "#d4d4d8", borderColor: "rgba(255,255,255,0.16)", background: "rgba(255,255,255,0.02)" }}>View Full Release Updates</button>
              <button onClick={onClose} className="w-full rounded-xl px-4 py-2.5 text-sm font-bold"
                style={{ background: "linear-gradient(135deg, #34d399, #10b981)", color: "#0b0f14" }}>Continue</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoginSyncing, isBackgroundSyncing, isManualRefresh, user, disabledPages, logout, token } = useAuth()
  const router = useRouter()
  const [minimised, setMinimised] = useState(false)
  const [showThemePanel, setShowThemePanel] = useState(false)
  const [showV2Changelog, setShowV2Changelog] = useState(false)
  const { show: showMidnightBanner, dismiss: dismissMidnightBanner } = useMidnightRefreshWindow()
  const wasLoginSyncing = useRef(false)
  const hasShownDashboard = useRef(false)
  const [photoReady, setPhotoReady] = useState(false)
  const [isFreshLogin] = useState(() => {
    try {
      if (sessionStorage.getItem("fresh_login") === "1") {
        sessionStorage.removeItem("fresh_login")
        return true
      }
    } catch {}
    return false
  })
  if (isLoginSyncing) wasLoginSyncing.current = true

  // Hold sync screen for at least 1.5s for a smooth transition
  const [syncHold, setSyncHold] = useState(false)

  const [activeTab, setActiveTab] = useState<TabType>("dashboard")
  const [visitedTabs, setVisitedTabs] = useState<Set<TabType>>(new Set())

  useEffect(() => {
    if (!isAuthenticated) router.replace("/")
  }, [isAuthenticated, router])

  // On page reload for returning users: wait for photo before showing dashboard
  useEffect(() => {
    if (!token) return
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setPhotoReady(true)
      return
    }
    setPhotoReady(false)
    const controller = new AbortController()
    const timeout = setTimeout(() => { controller.abort(); setPhotoReady(true) }, 5000)
    fetch("/api/srm/photo", { headers: { "x-access-token": token }, signal: controller.signal })
      .then(async (r) => {
        clearTimeout(timeout)
        if (r.ok) {
          const blob = await r.blob()
          const reader = new FileReader()
          reader.onloadend = () => { if (reader.result && typeof reader.result === "string") writeCachedPhoto(reader.result, token) }
          reader.readAsDataURL(blob)
        }
        setPhotoReady(true)
      })
      .catch(() => { clearTimeout(timeout); setPhotoReady(true) })
    return () => { controller.abort(); clearTimeout(timeout) }
  }, [token])

  // Full-screen loading during login or initial page load (not for manual refresh)
  const showFullSyncScreen = isLoginSyncing || (isAuthenticated && !hasShownDashboard.current && (isBackgroundSyncing || !photoReady))

  // Hold sync screen for at least 2s so it doesn't flicker
  useEffect(() => {
    if (showFullSyncScreen) {
      setSyncHold(true)
    }
  }, [showFullSyncScreen])

  useEffect(() => {
    if (syncHold) {
      const timer = setTimeout(() => setSyncHold(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [syncHold])

  const effectiveShowSync = showFullSyncScreen || syncHold

  // Mark dashboard as shown once the sync screen is dismissed for the first time
  useEffect(() => {
    if (!showFullSyncScreen && isAuthenticated && !hasShownDashboard.current) {
      hasShownDashboard.current = true
    }
  }, [showFullSyncScreen, isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) {
      setVisitedTabs(new Set(VALID_TABS))
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) return
    try {
      const key = "edutechsrm_changelog_seen_v2_1"
      const hasSeen = window.localStorage.getItem(key) === "1"
      if (!hasSeen) setShowV2Changelog(true)
    } catch { setShowV2Changelog(true) }
  }, [isAuthenticated])

  const closeV2Changelog = useCallback(() => {
    try { window.localStorage.setItem("edutechsrm_changelog_seen_v2_1", "1") } catch {}
    setShowV2Changelog(false)
  }, [])

  const navigate = useCallback((tab: TabType) => {
    setActiveTab(tab)
    window.history.pushState({ tab }, "", "/app")
  }, [])

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state?.tab && VALID_TABS.includes(e.state.tab)) {
        setActiveTab(e.state.tab)
      } else {
        setActiveTab("dashboard")
      }
    }
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  const renderSection = useCallback((tab: TabType, isActive: boolean) => {
    const SectionRenderer = SECTION_MAP[tab]
    if (!SectionRenderer) return null
    const pageId = TAB_PAGE_MAP[tab]
    const disabledEntry = pageId ? (disabledPages || []).find((d: { page: string }) => d.page === pageId) : null
    if (disabledEntry) {
      return (
        <div className="relative">
          <div className="blur-sm pointer-events-none select-none">
            <SectionRenderer onNavigate={navigate} minimised={minimised} isActive={isActive} />
          </div>
          <DisabledPageOverlay reason={disabledEntry.reason} />
        </div>
      )
    }
    return <SectionRenderer onNavigate={navigate} minimised={minimised} isActive={isActive} />
  }, [navigate, disabledPages, minimised])

  // Data unavailable when authenticated but no user data
  const showDataUnavailable = isAuthenticated && !isLoginSyncing && !isBackgroundSyncing && photoReady && !user

  if (showFullSyncScreen) {
    return (
      <>
        <MaintenanceOverlay />
        <LoginSyncScreen variant={isLoginSyncing || isFreshLogin ? "login" : "reload"} />
      </>
    )
  }

  if (showDataUnavailable) {
    return (
      <>
        <MaintenanceOverlay />
        <DataUnavailableScreen onSignOut={() => { logout(); window.location.href = "/login" }} />
      </>
    )
  }

  if (!isAuthenticated) return null

  return (
    <AppContext.Provider value={{ minimised, navigate }}>
      <BackgroundApplier />
      <MidnightRefreshBanner show={showMidnightBanner} dismiss={dismissMidnightBanner} />
      <MaintenanceOverlay />
      <UpdateOverlay />
      <ChangelogModalV2 isOpen={showV2Changelog} onClose={closeV2Changelog}
        onViewUpdates={() => { closeV2Changelog(); navigate("updates") }} />
      <ThemePanel open={showThemePanel} onClose={() => setShowThemePanel(false)} />
      <div className="min-h-screen relative overflow-hidden flex flex-col selection:bg-emerald-500/30">
        <Navbar activeTab={activeTab} setActiveTab={(tab) => navigate(tab as TabType)} minimised={minimised} setMinimised={setMinimised} />
        {isManualRefresh && (
          <div className="w-full h-0.5 bg-emerald-500/15 overflow-hidden relative">
            <div className="absolute inset-0 bg-emerald-400 rounded-full animate-[syncingBar_1.8s_ease-in-out_infinite]" style={{ width: "45%", filter: "blur(1px)" }} />
            <style>{`@keyframes syncingBar{0%{left:-20%}50%{left:75%}100%{left:-20%}}`}</style>
          </div>
        )}
        <main className="w-full pb-14 pt-2 sm:pb-10 lg:pb-8 lg:px-6 lg:pt-5 flex-1 flex flex-col">
          <div className="w-full lg:grid lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[318px_minmax(0,1fr)] lg:gap-6 lg:items-start">
            <AppSidebar activeTab={activeTab} setActiveTab={(tab) => navigate(tab as TabType)} />
            <div className="min-w-0 flex-1 flex flex-col">
              <AnimatePresence mode="wait">
                {Array.from(VALID_TABS).map(tab => {
                  if (!visitedTabs.has(tab)) return null
                  if (tab !== activeTab) return null
                  return (
                    <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }} className="flex-1 flex flex-col">
                      <TabErrorBoundary>
                        {renderSection(tab, true)}
                      </TabErrorBoundary>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </AppContext.Provider>
  )
}
