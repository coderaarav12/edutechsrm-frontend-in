"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowLeft, Eye, EyeOff, Loader2, Lock, Shield, AlertCircle,
  LogOut, Check, Users, BarChart3, Wrench, Megaphone,
} from "lucide-react"
import { useAdminControl } from "@/lib/admin-control"
import { AdminNavbar } from "@/components/admin-navbar"
import type { AdminTabType } from "@/components/admin-manager-modal"
import {
  AnalyticsTab, AnnouncementsTab, PagesTab, SessionsTab,
  FeedbackTab, PaymentsTab, ApiKeysTab, ADMIN_TABS,
} from "@/components/admin-manager-modal"
import type { AnnouncementType } from "@/components/announcements"

function AdminLoginBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#07090f]">
      <div className="absolute inset-0">
        <div className="admin-morph absolute -left-36 top-0 h-[520px] w-[520px] border border-emerald-300/25" />
        <div className="admin-morph admin-morph-alt absolute -right-28 top-0 h-[440px] w-[440px] border border-violet-300/20" />
        <div className="admin-morph absolute bottom-[-180px] left-[20%] h-[500px] w-[500px] border border-cyan-300/12" />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(52,211,153,0.12),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(167,139,250,0.10),transparent_30%),radial-gradient(circle_at_50%_90%,rgba(34,211,238,0.08),transparent_35%)]" />
    </div>
  )
}

export default function AdminPortalPage() {
  const {
    isAdminAuthenticated, adminLoading, adminLogin, adminLogout,
    refreshAdminStatus, analytics, maintenance, announcements,
    disabledPages, feedback, setMaintenanceMode,
    addAnnouncement, deleteAnnouncement,
    addDisabledPage, removeDisabledPage,
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

  const metrics = useMemo(() => ([
    { icon: Users, label: "Active sessions", value: analytics.activeSessionCount || 0, color: "#34d399" },
    { icon: BarChart3, label: "Successful logins", value: analytics.loginSuccessCount || 0, color: "#60a5fa" },
    { icon: Wrench, label: "Failed logins", value: analytics.loginFailureCount || 0, color: "#f87171" },
  ]), [analytics.activeSessionCount, analytics.loginFailureCount, analytics.loginSuccessCount])

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
      case "api-keys":
        return <ApiKeysTab />
    }
  }

  // ── LOGIN VIEW ──
  if (!isAdminAuthenticated) {
    return (
      <>
        <style>{`
          .admin-morph { border-radius: 46% 54% 62% 38% / 45% 38% 62% 55%; animation: adminMorph 14s ease-in-out infinite alternate; box-shadow: inset 0 0 80px rgba(52,211,153,.06); }
          .admin-morph-alt { animation-delay: -6s; }
          @keyframes adminMorph {
            from { border-radius: 46% 54% 62% 38% / 45% 38% 62% 55%; transform: translate3d(0,0,0) rotate(0deg); }
            to { border-radius: 62% 38% 44% 56% / 55% 60% 40% 45%; transform: translate3d(24px,-20px,0) rotate(22deg); }
          }
          .admin-input { width: 100%; height: 48px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.10); background: linear-gradient(180deg, rgba(8,11,16,0.95), rgba(7,10,14,0.9)); color: #d4d4d8; padding-left: 40px; padding-right: 12px; outline: none; box-shadow: inset 0 1px 0 rgba(255,255,255,0.04); transition: border-color 0.2s; font-size: 14px; }
          .admin-input:focus { border-color: rgba(52,211,153,0.4); box-shadow: inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 3px rgba(52,211,153,0.08); }
          .admin-input::placeholder { color: #52525b; }
          .admin-btn { width: 100%; border-radius: 14px; border: 1px solid rgba(255,255,255,0.16); cursor: pointer; height: 50px; font-weight: 900; font-size: 17px; color: #07120d; background: linear-gradient(135deg, #34d399, #10b981); box-shadow: 0 12px 28px rgba(16,185,129,0.30); transition: all 0.2s; letter-spacing: 0.01em; }
          .admin-btn:hover { box-shadow: 0 16px 36px rgba(16,185,129,0.40); transform: translateY(-1px); }
          .admin-btn:active { transform: translateY(0); box-shadow: 0 6px 16px rgba(16,185,129,0.25); }
          .admin-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
          @media (max-width: 640px) {
            .admin-morph { height: 260px !important; width: 260px !important; animation-duration: 18s; box-shadow: inset 0 0 40px rgba(52,211,153,.04); }
            .admin-morph:nth-child(1) { left: -140px !important; top: -30px !important; }
            .admin-morph:nth-child(2) { right: -140px !important; top: 160px !important; }
            .admin-morph:nth-child(3) { left: 5vw !important; bottom: -120px !important; }
          }
          @media (prefers-reduced-motion: reduce) {
            .admin-morph { animation: none !important; }
          }
        `}</style>
        <AdminLoginBackground />
        <div className="relative flex min-h-dvh items-center justify-center px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
            <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-2xl sm:p-8" style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.50)" }}>
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl" style={{ background: "#34d399", opacity: 0.10 }} />
              <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full blur-3xl" style={{ background: "#06b6d4", opacity: 0.08 }} />

              <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 mb-5 transition-colors hover:text-zinc-300">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to home
              </Link>

              <div className="text-center mb-6">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border bg-zinc-950/50" style={{ borderColor: "rgba(52,211,153,0.267)", color: "#34d399" }}>
                  <Shield className="h-6 w-6" />
                </div>
                <h1 className="font-display text-2xl font-black tracking-tight text-zinc-50 sm:text-[26px]">Admin Sign In</h1>
                <p className="mt-2 text-sm text-zinc-400">Authorized personnel only.</p>
              </div>

              <form onSubmit={submitAdminLogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.12em] text-zinc-500">Admin Username</label>
                  <div className="relative">
                    <Shield className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#52525b" }} />
                    <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Admin username" autoComplete="username" required className="admin-input" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.12em] text-zinc-500">Password</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#52525b" }} />
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Admin password" autoComplete="current-password" required className="admin-input" style={{ paddingRight: 44 }} />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-lg border bg-white/[0.03] text-zinc-500 hover:text-zinc-300 transition-colors" style={{ width: 28, height: 28, borderColor: "rgba(255,255,255,0.1)" }}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex gap-2 rounded-xl border p-2.5 text-sm" style={{ borderColor: "rgba(248,113,113,0.18)", background: "rgba(248,113,113,0.07)", color: "#f87171" }}>
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}
                  </div>
                )}

                <button type="submit" disabled={adminLoading} className="admin-btn">
                  {adminLoading ? (
                    <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Signing in...</span>
                  ) : (
                    <span className="inline-flex items-center gap-2"><Lock className="h-4 w-4" />Enter Admin Portal</span>
                  )}
                </button>
              </form>

              <p className="mt-5 text-center text-[11px] leading-relaxed text-zinc-600">
                Admin access is separate from student login.
              </p>
            </div>
          </motion.div>
        </div>
      </>
    )
  }

  // ── DASHBOARD VIEW ──
  return (
    <div className="min-h-screen" style={{ background: "#07090f" }}>
      <style>{`
        @media (max-width: 1023px) {
          .admin-dash-main { padding-bottom: calc(env(safe-area-inset-bottom) + 80px); }
        }
      `}</style>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40" style={{
        background: "linear-gradient(180deg, color-mix(in srgb, #09090b 95%, transparent), color-mix(in srgb, #09090b 72%, transparent))",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
      }}>
        <div className="mx-auto flex h-[52px] w-full items-center px-3 sm:px-6">
          <div className="flex items-center gap-2 flex-1">
            <Link href="/" className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <ArrowLeft className="w-3.5 h-3.5" style={{ color: "#52525b" }} />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(52,211,153,0.28), rgba(56,189,248,0.22))", border: "1px solid rgba(255,255,255,0.14)" }}>
                <Shield className="w-3 h-3" style={{ color: "#6ee7b7" }} />
              </div>
              <span className="text-sm font-black text-zinc-100 font-display tracking-tight">Admin</span>
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(52,211,153,0.12)", color: "#34d399" }}>LIVE</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-1 justify-end">
            <span className="hidden sm:block text-[10px] text-zinc-600">Active session</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{ background: "rgba(248,113,113,0.1)", color: "#fda4af", border: "1px solid rgba(248,113,113,0.15)" }}>
              <LogOut className="w-3 h-3" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Status toast */}
      {status && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl text-sm flex items-center gap-2 shadow-lg"
          style={{
            background: status.error ? "rgba(248,113,113,0.12)" : "rgba(52,211,153,0.12)",
            color: status.error ? "#fda4af" : "#34d399",
            border: status.error ? "1px solid rgba(248,113,113,0.2)" : "1px solid rgba(52,211,153,0.2)",
            backdropFilter: "blur(12px)",
          }}>
          {status.error ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
          {status.text}
        </div>
      )}

      {/* Main content with sidebar */}
      <div className="w-full lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block lg:sticky lg:top-[52px] pt-[72px] lg:pl-6">
          <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(24,24,27,0.6)", border: "1px solid rgba(255,255,255,0.04)" }}>
            <div className="p-4 space-y-1">
              {ADMIN_TABS.map((tab) => {
                const Icon = tab.icon
                const active = activeTab === tab.id
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 10,
                      padding: "9px 12px", borderRadius: 10, cursor: "pointer",
                      border: "none", background: active ? `${tab.color}0d` : "transparent",
                      transition: "background 0.15s", position: "relative",
                    }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.03)" }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent" }}
                  >
                    {active && (
                      <div style={{ position: "absolute", left: 0, top: 6, bottom: 6, width: 3, borderRadius: "0 3px 3px 0", background: tab.color }} />
                    )}
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: active ? `${tab.color}18` : "rgba(255,255,255,0.03)", flexShrink: 0,
                    }}>
                      <Icon style={{ width: 15, height: 15, color: active ? tab.color : "#52525b" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                      <p style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? "#e4e4e7" : "#a1a1aa", margin: 0, lineHeight: 1.3 }}>
                        {tab.label}
                      </p>
                    </div>
                    {active && (
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: tab.color, flexShrink: 0 }} />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="admin-dash-main relative pt-[68px] px-3 sm:px-6 lg:pr-8 pb-4">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            {renderTabContent()}
          </motion.div>
        </main>
      </div>

      {/* Admin navbar (mobile bottom sheet) */}
      <AdminNavbar activeTab={activeTab} setActiveTab={setActiveTab} moreOpen={moreOpen} setMoreOpen={setMoreOpen} />
    </div>
  )
}
