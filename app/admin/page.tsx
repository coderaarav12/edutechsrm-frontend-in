"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowLeft, Eye, EyeOff, Loader2, Lock, Shield, AlertCircle,
  LogOut, Check, Users, BarChart3, Wrench, Megaphone, Smartphone,
} from "lucide-react"
import { useAdminControl } from "@/lib/admin-control"
import { AdminNavbar } from "@/components/admin-navbar"
import type { AdminTabType } from "@/components/admin-manager-modal"
import {
  AnalyticsTab, AnnouncementsTab, PagesTab, SessionsTab,
  FeedbackTab, PaymentsTab, ApiKeysTab, MobileAppSettingsTab, ADMIN_TABS,
} from "@/components/admin-manager-modal"
import type { AnnouncementType } from "@/components/announcements"

function AdminLoginBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#060910]">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      {/* Ambient glowing orbs */}
      <div className="absolute -top-40 -left-40 h-[560px] w-[560px] rounded-full blur-[140px] opacity-20 pointer-events-none" style={{ background: "#10b981" }} />
      <div className="absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full blur-[140px] opacity-15 pointer-events-none" style={{ background: "#6366f1" }} />
      <div className="absolute -bottom-40 left-1/4 h-[520px] w-[520px] rounded-full blur-[140px] opacity-15 pointer-events-none" style={{ background: "#06b6d4" }} />
    </div>
  )
}

export default function AdminPortalPage() {
  const {
    isAdminAuthenticated, adminLoading, adminLogin, adminLogout,
    refreshAdminStatus, analytics, maintenance, announcements,
    disabledPages, mobileAppSettings, feedback, setMaintenanceMode,
    addAnnouncement, deleteAnnouncement,
    addDisabledPage, removeDisabledPage,
    updateMobileAppSettings,
    logoutAllUsers, logoutUser,
    payments, fetchPayments,
  } = useAdminControl()

  const [checking, setChecking] = useState(true)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  const [activeTab, setActiveTab] = useState<AdminTabType>("analytics")
  const [moreOpen, setMoreOpen] = useState(false)
  const [targetUsername, setTargetUsername] = useState("")
  const [message, setMessage] = useState("")
  const [announcementType, setAnnouncementType] = useState<AnnouncementType>("update")
  const [announcementTitle, setAnnouncementTitle] = useState("")
  const [announcementBody, setAnnouncementBody] = useState("")
  const [disabledPage, setDisabledPage] = useState("")
  const [disabledReason, setDisabledReason] = useState("")
  const [status, setStatus] = useState<{ text: string; error: boolean } | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Strictly isolate Admin Portal from Poster Mode and enforce dark command styling
  useEffect(() => {
    if (typeof document === "undefined") return
    const root = document.documentElement
    const body = document.body

    const prevTheme = root.getAttribute("data-theme")
    const prevLandingMode = root.getAttribute("data-landing-mode")
    const prevBg = body.style.backgroundColor

    root.setAttribute("data-admin", "true")
    body.setAttribute("data-admin", "true")
    root.setAttribute("data-theme", "dark")
    root.setAttribute("data-landing-mode", "night")
    body.setAttribute("data-theme", "dark")
    body.setAttribute("data-landing-mode", "night")
    body.style.backgroundColor = "#060910"
    body.style.color = "#f4f4f5"

    // Clear any poster-mode inline variables from html element
    const propsToClear = [
      "--color-zinc-950", "--color-zinc-900", "--color-zinc-800", "--color-zinc-700",
      "--color-zinc-600", "--color-zinc-500", "--color-zinc-400", "--color-zinc-300",
      "--color-zinc-200", "--color-zinc-100", "--color-zinc-50",
      "--text-primary", "--text-secondary", "--text-muted", "--text-subtle", "--text-faint",
      "--card-bg", "--page-bg", "--input-bg"
    ]
    propsToClear.forEach(p => {
      root.style.removeProperty(p)
      body.style.removeProperty(p)
    })

    return () => {
      root.removeAttribute("data-admin")
      body.removeAttribute("data-admin")
      if (prevTheme) {
        root.setAttribute("data-theme", prevTheme)
        body.setAttribute("data-theme", prevTheme)
      } else {
        root.removeAttribute("data-theme")
        body.removeAttribute("data-theme")
      }
      if (prevLandingMode) {
        root.setAttribute("data-landing-mode", prevLandingMode)
        body.setAttribute("data-landing-mode", prevLandingMode)
      } else {
        root.removeAttribute("data-landing-mode")
        body.removeAttribute("data-landing-mode")
      }
      body.style.backgroundColor = prevBg
    }
  }, [])

  const showStatus = (text: string, error = false) => {
    setStatus({ text, error })
    setTimeout(() => setStatus(null), 4000)
  }

  useEffect(() => {
    const run = async () => {
      await refreshAdminStatus()
      setChecking(false)
    }
    void run()
  }, [refreshAdminStatus])

  useEffect(() => {
    setMessage(maintenance.message || "")
  }, [maintenance.message])

  useEffect(() => {
    if (!moreOpen) return
    const close = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("[data-admin-nav]")) return
    }
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [moreOpen])

  const handleManualRefresh = async () => {
    setRefreshing(true)
    await refreshAdminStatus()
    setRefreshing(false)
    showStatus("Admin status refreshed")
  }

  const handlePost = async () => {
    const r = await addAnnouncement(announcementType, announcementTitle, announcementBody)
    if (!r.success) { showStatus(r.error || "Failed to post", true); return }
    setAnnouncementTitle("")
    setAnnouncementBody("")
    showStatus("Announcement posted")
  }

  const handleDeleteAnnounce = async (id: number) => {
    const r = await deleteAnnouncement(id)
    if (!r.success) { showStatus(r.error || "Failed", true); return }
    showStatus("Announcement removed")
  }

  const handleAddPage = async () => {
    if (!disabledPage.trim()) { showStatus("Select a page", true); return }
    const r = await addDisabledPage(disabledPage.trim(), disabledReason.trim())
    if (!r.success) { showStatus(r.error || "Failed", true); return }
    setDisabledPage("")
    setDisabledReason("")
    showStatus("Page disabled")
  }

  const handleRemovePage = async (page: string) => {
    const r = await removeDisabledPage(page)
    if (!r.success) { showStatus(r.error || "Failed", true); return }
    showStatus("Page re-enabled")
  }

  const handleLogoutAll = async () => {
    const r = await logoutAllUsers()
    if (!r.success) { showStatus(r.error || "Failed", true); return }
    showStatus(`Logged out all users (${r.deletedCount || 0} sessions)`)
  }

  const handleLogoutUserFn = async () => {
    const r = await logoutUser(targetUsername)
    if (!r.success) { showStatus(r.error || "Failed", true); return }
    setTargetUsername("")
    showStatus(`Logged out user (${r.deletedCount || 0} sessions)`)
  }

  const handleLogout = async () => {
    await adminLogout()
    showStatus("Signed out")
  }

  const submitAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!username.trim() || !password) {
      setError("Enter admin username and password.")
      return
    }
    const result = await adminLogin(username.trim(), password)
    if (!result.success) {
      setError(result.error || "Admin login failed.")
      return
    }
    setPassword("")
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "analytics":
        return (
          <AnalyticsTab
            analytics={analytics}
            maintenance={maintenance}
            setMaintenanceMode={setMaintenanceMode}
            maintenanceMsg={message}
            setMaintenanceMsg={setMessage}
            maintenanceLoading={adminLoading}
          />
        )
      case "announcements":
        return (
          <AnnouncementsTab
            announcements={announcements}
            announcementType={announcementType}
            setAnnouncementType={setAnnouncementType}
            announcementTitle={announcementTitle}
            setAnnouncementTitle={setAnnouncementTitle}
            announcementBody={announcementBody}
            setAnnouncementBody={setAnnouncementBody}
            handlePostAnnouncement={handlePost}
            handleDeleteAnnouncement={handleDeleteAnnounce}
            adminLoading={adminLoading}
          />
        )
      case "pages":
        return (
          <PagesTab
            disabledPage={disabledPage}
            setDisabledPage={setDisabledPage}
            disabledReason={disabledReason}
            setDisabledReason={setDisabledReason}
            handleAddDisabledPage={handleAddPage}
            handleRemoveDisabledPage={handleRemovePage}
            disabledPages={disabledPages}
            adminLoading={adminLoading}
          />
        )
      case "sessions":
        return (
          <SessionsTab
            handleLogoutAll={handleLogoutAll}
            handleLogoutUser={handleLogoutUserFn}
            targetUsername={targetUsername}
            setTargetUsername={setTargetUsername}
            adminLoading={adminLoading}
          />
        )
      case "feedback":
        return <FeedbackTab feedback={feedback} />
      case "payments":
        return <PaymentsTab payments={payments} />
      case "mobile-app":
        return (
          <MobileAppSettingsTab
            mobileAppSettings={mobileAppSettings}
            updateMobileAppSettings={updateMobileAppSettings}
            adminLoading={adminLoading}
          />
        )
      case "api-keys":
        return <ApiKeysTab />
    }
  }

  // ── LOGIN VIEW ──
  if (!isAdminAuthenticated) {
    return (
      <div className="relative min-h-dvh flex items-center justify-center p-4 sm:p-6" style={{ background: "#060910" }}>
        <AdminLoginBackground />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div
            className="relative overflow-hidden rounded-[28px] p-6 sm:p-8 backdrop-blur-2xl"
            style={{
              background: "linear-gradient(180deg, rgba(14,20,32,0.92) 0%, rgba(9,13,22,0.95) 100%)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 28px 80px rgba(0,0,0,0.7), 0 0 40px rgba(52,211,153,0.06)",
            }}
          >
            {/* Top Back Link */}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 mb-6 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to main site
            </Link>

            <div className="text-center mb-6">
              <div
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl shadow-xl"
                style={{
                  background: "linear-gradient(135deg, rgba(52,211,153,0.22), rgba(6,182,212,0.18))",
                  border: "1px solid rgba(52,211,153,0.35)",
                  color: "#34d399",
                }}
              >
                <Shield className="h-7 w-7" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400">
                  SECURE ADMIN CONSOLE
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
                Admin Sign In
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-zinc-400">
                SRMIST KTR System Core Management
              </p>
            </div>

            <form onSubmit={submitAdminLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-zinc-400">
                  Admin Identity
                </label>
                <div className="relative">
                  <Shield className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Admin username"
                    autoComplete="username"
                    required
                    className="w-full h-12 rounded-xl pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 outline-none transition-all"
                    style={{
                      background: "rgba(6,9,16,0.9)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#34d399"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(52,211,153,0.15)" }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.boxShadow = "none" }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-zinc-400">
                  Secret Key
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Admin password"
                    autoComplete="current-password"
                    required
                    className="w-full h-12 rounded-xl pl-10 pr-12 text-sm text-white placeholder:text-zinc-600 outline-none transition-all"
                    style={{
                      background: "rgba(6,9,16,0.9)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#34d399"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(52,211,153,0.15)" }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.boxShadow = "none" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  className="flex items-center gap-2 rounded-xl p-3 text-xs"
                  style={{
                    background: "rgba(248,113,113,0.12)",
                    border: "1px solid rgba(248,113,113,0.25)",
                    color: "#fda4af",
                  }}
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={adminLoading}
                className="w-full h-12 mt-2 rounded-xl font-mono text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer bg-gradient-to-r from-emerald-400 to-teal-400 text-zinc-950 hover:brightness-110 shadow-lg shadow-emerald-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {adminLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-zinc-950" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 text-zinc-950" />
                    <span>Authenticate Console</span>
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-[11px] font-mono text-zinc-500 leading-relaxed">
              Protected access node · Session audited via Cloudflare
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── DASHBOARD VIEW ──
  return (
    <div className="min-h-screen text-zinc-100 selection:bg-emerald-400 selection:text-black" style={{ background: "#060910" }}>
      <style>{`
        @media (max-width: 1023px) {
          .admin-dash-main { padding-bottom: calc(env(safe-area-inset-bottom) + 80px); }
        }
      `}</style>

      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-40 h-14 sm:h-16 flex items-center px-4 sm:px-6"
        style={{
          background: "rgba(7,11,18,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        }}
      >
        <div className="mx-auto flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-white/[0.08]"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              title="Back to home"
            >
              <ArrowLeft className="w-4 h-4 text-zinc-400 hover:text-white" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md"
                style={{
                  background: "linear-gradient(135deg, rgba(52,211,153,0.25), rgba(6,182,212,0.2))",
                  border: "1px solid rgba(52,211,153,0.3)",
                  color: "#34d399",
                }}
              >
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black font-display tracking-tight" style={{ color: "#ffffff" }}>edutechsrm</span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    CONSOLE v2
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Active sessions indicator */}
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span style={{ color: "#9ca3af" }}>Sessions:</span>
              <span className="font-bold" style={{ color: "#ffffff" }}>{analytics.activeSessionCount || 0}</span>
            </div>

            {/* Refresh button */}
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="p-2 rounded-xl text-zinc-400 hover:text-white transition-colors cursor-pointer"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
              title="Refresh Data"
            >
              <Loader2 className={`w-4 h-4 ${refreshing ? "animate-spin text-emerald-400" : ""}`} />
            </button>

            {/* Sign out */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer hover:bg-rose-500/20"
              style={{
                background: "rgba(244,63,94,0.12)",
                color: "#fda4af",
                border: "1px solid rgba(244,63,94,0.25)",
              }}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Status toast */}
      {status && (
        <div
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-2xl text-xs sm:text-sm font-mono flex items-center gap-2.5 shadow-2xl"
          style={{
            background: status.error ? "rgba(244,63,94,0.92)" : "rgba(16,185,129,0.92)",
            color: "#ffffff",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          {status.error ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
          <span>{status.text}</span>
        </div>
      )}

      {/* Main layout */}
      <div className="w-full lg:grid lg:grid-cols-[260px_minmax(0,1fr)] max-w-7xl mx-auto">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block lg:sticky lg:top-[64px] pt-6 pl-4 lg:pl-6 h-[calc(100vh-64px)]">
          <div
            className="rounded-2xl p-3 flex flex-col justify-between h-[calc(100vh-100px)] overflow-y-auto"
            style={{
              background: "linear-gradient(180deg, rgba(13,19,30,0.85) 0%, rgba(8,12,20,0.9) 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
            }}
          >
            <div className="space-y-1">
              <p className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.18em]" style={{ color: "#9ca3af" }}>
                NAVIGATION
              </p>
              {ADMIN_TABS.map((tab) => {
                const Icon = tab.icon
                const active = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer relative"
                    style={{
                      background: active ? `linear-gradient(135deg, ${tab.color}1c, ${tab.color}08)` : "transparent",
                      border: active ? `1px solid ${tab.color}35` : "1px solid transparent",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all"
                      style={{
                        background: active ? `${tab.color}25` : "rgba(255,255,255,0.04)",
                        color: active ? tab.color : "#9ca3af",
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className="text-xs font-bold flex-1 text-left tracking-tight"
                      style={{ color: active ? "#ffffff" : "#d4d4d8" }}
                    >
                      {tab.label}
                    </span>
                    {active && (
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: tab.color }} />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Sidebar telemetry badge */}
            <div
              className="p-3 rounded-xl text-center mt-4"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <p className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">SRMIST KTR · CLOUDFLARE</p>
              <p className="text-[10px] font-mono text-emerald-400 mt-0.5">TLS 1.3 · ZERO STORED PASSWORDS</p>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="admin-dash-main relative pt-20 sm:pt-24 px-4 sm:px-6 lg:pr-8 pb-12">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
          >
            {renderTabContent()}
          </motion.div>
        </main>
      </div>

      {/* Admin navbar (mobile bottom sheet) */}
      <AdminNavbar activeTab={activeTab} setActiveTab={setActiveTab} moreOpen={moreOpen} setMoreOpen={setMoreOpen} />
    </div>
  )
}
