"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import {
  AlertCircle, Loader2, Shield, Trash2, X,
  BarChart3, MessageSquareText, Megaphone, Ban, Users, Wrench,
  EyeOff, LogOut, UserX2, Check, Key,
} from "lucide-react"
import { useAdminControl } from "@/lib/admin-control"
import type { AnnouncementType } from "./announcements"

export type AdminTabType = "analytics" | "announcements" | "pages" | "sessions" | "feedback" | "api-keys" | "payments"
type TabType = AdminTabType

export const ADMIN_TABS: Array<{ id: AdminTabType; label: string; icon: any; color: string }> = [
  { id: "analytics", label: "Analytics", icon: BarChart3, color: "#38bdf8" },
  { id: "announcements", label: "Announcements", icon: Megaphone, color: "#34d399" },
  { id: "sessions", label: "Sessions", icon: Users, color: "#a78bfa" },
  { id: "feedback", label: "Feedback", icon: MessageSquareText, color: "#fbbf24" },
  { id: "payments", label: "Payments", icon: Wrench, color: "#34d399" },
  { id: "pages", label: "Pages", icon: Ban, color: "#f87171" },
  { id: "api-keys", label: "API Keys", icon: Key, color: "#f472b6" },
]

const TABS: Array<{ id: TabType; label: string; icon: any; color: string }> = [
  { id: "analytics", label: "Analytics", icon: BarChart3, color: "#38bdf8" },
  { id: "announcements", label: "Announcements", icon: Megaphone, color: "#34d399" },
  { id: "pages", label: "Pages", icon: Ban, color: "#f87171" },
  { id: "sessions", label: "Sessions", icon: Users, color: "#a78bfa" },
  { id: "feedback", label: "Feedback", icon: MessageSquareText, color: "#fbbf24" },
  { id: "api-keys", label: "API Keys", icon: Key, color: "#f472b6" },
  { id: "payments", label: "Payments", icon: Wrench, color: "#34d399" },
]

export const PAGE_OPTIONS = [
  { id: "My_Attendance", label: "Attendance & Marks" },
  { id: "My_Time_Table_2023_24", label: "Timetable & Courses" },
  { id: "members/myprofile", label: "About / Profile" },
  { id: "Academic_Planner", label: "Calendar & Planner" },
  { id: "notes", label: "Notes & PYQs" },
  { id: "gradex", label: "GradeX / GPA" },
  { id: "finder", label: "Faculty Finder" },
  { id: "settings", label: "Settings" },
  { id: "ai", label: "AI Chat" },
]

export const ANNOUNCE_OPTS: Array<{ value: AnnouncementType; label: string; color: string }> = [
  { value: "update", label: "Update", color: "#38bdf8" },
  { value: "fix", label: "Fix", color: "#34d399" },
  { value: "bug", label: "Bug", color: "#f87171" },
  { value: "info", label: "Info", color: "#a78bfa" },
]

export function fmtTime(v: string | null) {
  if (!v) return "Just now"
  return new Date(v).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })
}

export const logTone = (o: string) => {
  if (o === "failed") return { color: "#fda4af", bg: "rgba(248,113,113,0.12)" }
  if (o === "cached") return { color: "#fde68a", bg: "rgba(251,191,36,0.12)" }
  if (o === "warning") return { color: "#fcd34d", bg: "rgba(245,158,11,0.12)" }
  return { color: "#86efac", bg: "rgba(52,211,153,0.12)" }
}

export function StatCard({ label, value, color, subtitle }: { label: string; value: string | number; color: string; subtitle?: string }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: "linear-gradient(145deg, rgba(24,24,27,0.68), rgba(18,18,22,0.5))", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }}>
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>{value.toLocaleString()}</p>
      {subtitle && <p className="text-[11px] text-zinc-500 mt-1">{subtitle}</p>}
    </div>
  )
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl p-5 ${className}`} style={{ background: "linear-gradient(145deg, rgba(24,24,27,0.62), rgba(17,17,21,0.46))", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)" }}>
      {children}
    </div>
  )
}

export function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder-zinc-700 ${className}`}
      {...props}
    />
  )
}

export function Textarea({ className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder-zinc-700 resize-none ${className}`}
      {...props}
    />
  )
}

export function Select({ className = "", children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all appearance-none ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}

export function SectionHeader({ label, title, count, color, icon: Icon }: { label: string; title: string; count?: number; color: string; icon: any }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-1">{label}</h2>
        <h3 className="text-lg font-bold text-zinc-100 tracking-tight font-display flex items-center gap-2">
          {title}
          {count !== undefined && (
            <span className="text-[10px] font-bold text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">{count}</span>
          )}
        </h3>
      </div>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}15`, color }}>
        <Icon className="w-4 h-4" />
      </div>
    </div>
  )
}

export function AnalyticsTab({ analytics, maintenance, setMaintenanceMode, maintenanceMsg, setMaintenanceMsg, maintenanceLoading }: any) {
  const stats = useMemo(() => [
    { label: "Active Users", value: analytics.activeSessionCount, color: "#38bdf8", subtitle: "Currently logged in" },
    { label: "Total Visits", value: analytics.totalVisits, color: "#34d399", subtitle: "Backend hits tracked" },
    { label: "Success Logins", value: analytics.loginSuccessCount, color: "#60a5fa", subtitle: "Successful sign-ins" },
    { label: "Failed Logins", value: analytics.loginFailureCount, color: "#f87171", subtitle: "Failed attempts" },
  ], [analytics])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>
      <Card>
        <div className="flex items-center justify-between mb-4">
          <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest">Maintenance</p>
          <button onClick={async () => {
            await setMaintenanceMode(!maintenance.enabled, maintenanceMsg)
          }} disabled={maintenanceLoading}
            className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-0 transition-colors duration-200"
            style={{ background: maintenance.enabled ? "#34d399" : "rgba(255,255,255,0.08)" }}>
            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200" style={{ margin: "2px", transform: maintenance.enabled ? "translateX(14px)" : "translateX(0)" }} />
          </button>
        </div>
        <input value={maintenanceMsg} onChange={(e: any) => setMaintenanceMsg(e.target.value)} placeholder="Maintenance message (optional)"
          className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder-zinc-700" />
      </Card>
      <Card>
        <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-4">Recent Login Activity</p>
        <div className="space-y-2 max-h-60 lg:max-h-[480px] overflow-y-auto">
          {analytics.logs.length > 0 ? (
            analytics.logs.slice(0, 50).map((log: any) => (
              <div key={log.id} className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-zinc-900/60 ring-1 ring-white/5">
                <div className="min-w-0">
                  <p className="text-sm lg:text-base font-semibold text-zinc-200">{log.username}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] lg:text-xs text-zinc-500">{fmtTime(log.timestamp)}</span>
                    {log.page && <span className="text-[10px] lg:text-xs text-zinc-600">{log.page}</span>}
                  </div>
                </div>
                <span className="text-[9px] lg:text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-full whitespace-nowrap" style={logTone(log.outcome)}>
                  {log.outcome}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-zinc-500 py-4 text-center">No login activity recorded yet</p>
          )}
        </div>
      </Card>
    </div>
  )
}

export function AnnouncementsTab({
  announcements, announcementType, setAnnouncementType,
  announcementTitle, setAnnouncementTitle,
  announcementBody, setAnnouncementBody,
  handlePostAnnouncement, handleDeleteAnnouncement, adminLoading,
}: any) {
  return (
    <div className="space-y-6">
      <Card>
        <SectionHeader label="Publish" title="New Announcement" color="#34d399" icon={Megaphone} />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mb-4">
          {ANNOUNCE_OPTS.map(o => (
            <button key={o.value} onClick={() => setAnnouncementType(o.value)}
              className="py-2.5 px-3 rounded-xl text-xs font-bold transition-all ring-1"
              style={{
                background: announcementType === o.value ? `${o.color}18` : "rgba(255,255,255,0.03)",
                borderColor: announcementType === o.value ? o.color : "rgba(255,255,255,0.05)",
                color: announcementType === o.value ? o.color : "#a1a1aa",
              }}>
              {o.label}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          <Input value={announcementTitle} onChange={(e: any) => setAnnouncementTitle(e.target.value)} placeholder="Announcement title" />
          <Textarea value={announcementBody} onChange={(e: any) => setAnnouncementBody(e.target.value)} rows={3} placeholder="Write the announcement message..." className="lg:min-h-[100px]" />
          <button onClick={handlePostAnnouncement} disabled={adminLoading || !announcementTitle.trim()}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            {adminLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Megaphone className="w-3.5 h-3.5" />}
            Post Announcement
          </button>
        </div>
      </Card>

      <Card>
        <SectionHeader label="Active" title="Announcements" count={announcements.length} color="#38bdf8" icon={Megaphone} />
        {announcements.length > 0 ? (
          <div className="space-y-2 max-h-72 lg:max-h-[480px] overflow-y-auto">
            {announcements.map((item: any) => {
              const tone = ANNOUNCE_OPTS.find(o => o.value === item.type)
              const c = tone?.color || "#a1a1aa"
              return (
                <div key={item.id} className="flex items-start gap-3 px-4 py-3 lg:py-4 rounded-xl bg-zinc-900/60 ring-1 ring-white/5 group">
                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: c }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[9px] lg:text-[11px] font-bold uppercase tracking-wider" style={{ color: c }}>{item.type}</span>
                      <span className="text-[9px] lg:text-[11px] text-zinc-600">{item.date}</span>
                    </div>
                    <p className="text-sm lg:text-base font-semibold text-zinc-200">{item.title}</p>
                    <p className="text-xs lg:text-sm text-zinc-400 mt-0.5">{item.body}</p>
                  </div>
                  <button onClick={() => handleDeleteAnnouncement(item.id)} disabled={adminLoading}
                    className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 shrink-0">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-zinc-500 text-center py-4">No announcements posted yet</p>
        )}
      </Card>
    </div>
  )
}

export function PagesTab({
  disabledPage, setDisabledPage, disabledReason, setDisabledReason,
  handleAddDisabledPage, handleRemoveDisabledPage, disabledPages, adminLoading,
}: any) {
  const selectedLabel = PAGE_OPTIONS.find(p => p.id === disabledPage)?.label || ""

  return (
    <div className="space-y-6">
      <Card>
        <SectionHeader label="Restrict" title="Disable a Page" color="#f87171" icon={Ban} />
        <div className="space-y-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Select Page</p>
            <Select value={disabledPage} onChange={(e: any) => setDisabledPage(e.target.value)}>
              <option value="">Choose a page to disable...</option>
              {PAGE_OPTIONS.map(p => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </Select>
          </div>
          {disabledPage && (
            <div className="px-4 py-2 rounded-xl text-xs" style={{ background: "rgba(248,113,113,0.08)", color: "#f87171" }}>
              ID: <code className="font-mono text-[11px]">{disabledPage}</code>
              {selectedLabel && <> — {selectedLabel}</>}
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Reason</p>
            <Input value={disabledReason} onChange={(e: any) => setDisabledReason(e.target.value)} placeholder="Why is this page disabled?" />
          </div>
          <button onClick={handleAddDisabledPage} disabled={adminLoading || !disabledPage}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
            style={{ background: "rgba(248,113,113,0.15)", color: "#fda4af", opacity: adminLoading || !disabledPage ? 0.4 : 1 }}>
            <Ban className="w-3.5 h-3.5" />
            Disable Page
          </button>
        </div>
      </Card>

      {disabledPages.length > 0 && (
        <Card>
        <SectionHeader label="Currently Off" title="Disabled Pages" count={disabledPages.length} color="#f87171" icon={EyeOff} />
        <div className="space-y-2">
          {disabledPages.map((entry: any) => {
            const pageMeta = PAGE_OPTIONS.find(p => p.id === entry.page)
            return (
              <div key={entry.page} className="flex items-start justify-between gap-3 px-4 py-3 lg:py-4 rounded-xl bg-zinc-900/60 ring-1 ring-white/5 group">
                <div className="min-w-0">
                  <p className="text-sm lg:text-base font-semibold text-zinc-200">{pageMeta?.label || entry.page}</p>
                  <p className="text-[11px] lg:text-xs text-zinc-500 mt-0.5 font-mono">{entry.page}</p>
                  {entry.reason && <p className="text-xs lg:text-sm text-zinc-400 mt-1">{entry.reason}</p>}
                </div>
                <button onClick={() => handleRemoveDisabledPage(entry.page)}
                  className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center text-zinc-600 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all opacity-0 group-hover:opacity-100 shrink-0">
                  <Check className="w-3 h-3" />
                </button>
              </div>
            )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}

export function SessionsTab({ handleLogoutAll, handleLogoutUser, targetUsername, setTargetUsername, adminLoading }: any) {
  return (
    <div className="space-y-6 lg:space-y-8">
      <Card>
        <SectionHeader label="Session Management" title="Logout Users" color="#a78bfa" icon={Users} />
        <div className="space-y-4 lg:space-y-6">
          <div className="px-4 py-3 lg:px-6 lg:py-5 rounded-xl" style={{ background: "rgba(248,113,113,0.08)" }}>
            <p className="text-xs lg:text-sm font-semibold" style={{ color: "#fda4af" }}>Logout All Users</p>
            <p className="text-[11px] lg:text-sm mt-0.5" style={{ color: "#f87171" }}>This will terminate all active student sessions</p>
            <button onClick={handleLogoutAll} disabled={adminLoading}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 lg:py-3 px-4 rounded-xl font-bold text-xs lg:text-sm uppercase tracking-wider transition-all"
              style={{ background: "rgba(248,113,113,0.15)", color: "#fda4af", opacity: adminLoading ? 0.4 : 1 }}>
              {adminLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
              Logout All
            </button>
          </div>

          <div className="border-t border-white/5 pt-4 lg:pt-6">
            <p className="text-sm lg:text-base font-semibold text-zinc-300 mb-3">Logout Specific User</p>
            <Input value={targetUsername} onChange={(e: any) => setTargetUsername(e.target.value)} placeholder="Enter username (e.g. xx1234)" />
            <button onClick={handleLogoutUser} disabled={adminLoading || !targetUsername.trim()}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 lg:py-3 px-4 rounded-xl font-bold text-xs lg:text-sm uppercase tracking-wider transition-all"
              style={{ background: "rgba(167,139,250,0.15)", color: "#c4b5fd", opacity: adminLoading || !targetUsername.trim() ? 0.4 : 1 }}>
              <UserX2 className="w-3.5 h-3.5" />
              Logout User
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export function FeedbackTab({ feedback }: any) {
  return (
    <div className="space-y-6">
      <Card>
        <SectionHeader label="User Reports" title="Feedback" count={feedback.length} color="#fbbf24" icon={MessageSquareText} />
        {feedback.length > 0 ? (
          <div className="space-y-2 max-h-96 lg:max-h-[480px] overflow-y-auto">
            {feedback.map((entry: any) => {
              const ratingColor = ["#f87171", "#fb923c", "#fbbf24", "#34d399", "#22d3ee"][entry.rating - 1] || "#a1a1aa"
              const ratingLabel = ["Angry", "Frustrated", "Neutral", "Happy", "Love it"][entry.rating - 1] || ""
              return (
                <div key={entry.id} className="flex items-start gap-3 px-4 py-3 lg:py-4 rounded-xl bg-zinc-900/60 ring-1 ring-white/5">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center shrink-0 text-xs lg:text-sm font-bold" style={{ background: `${ratingColor}18`, color: ratingColor }}>
                    {entry.rating}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-sm lg:text-base font-semibold text-zinc-200">{entry.name}</span>
                      <span className="text-[9px] lg:text-[11px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: `${ratingColor}15`, color: ratingColor }}>{ratingLabel}</span>
                      <span className="text-[9px] lg:text-[11px] text-zinc-600">{new Date(entry.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                    </div>
                    <p className="text-xs lg:text-sm text-zinc-400 leading-relaxed">{entry.message}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[9px] lg:text-[11px] font-bold uppercase tracking-wider text-zinc-600">{entry.category}</span>
                      {entry.email && <span className="text-[9px] lg:text-[11px] text-zinc-600">{entry.email}</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-zinc-500 text-center py-4">No feedback submitted yet</p>
        )}
      </Card>
    </div>
  )
}

export function PaymentsTab({ payments }: any) {
  const total = payments.reduce((s: number, p: any) => s + (p.amount || 0), 0)
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard icon={Wrench} label="Total payments" value={payments.length} color="#34d399" />
        <StatCard icon={Wrench} label="Total collected" value={`₹${total}`} color="#38bdf8" />
      </div>
      <Card>
        <SectionHeader label="Transactions" title="Support Payments" count={payments.length} color="#34d399" icon={Wrench} />
        {payments.length > 0 ? (
          <div className="space-y-2 max-h-96 lg:max-h-[480px] overflow-y-auto">
            {payments.map((entry: any) => (
              <div key={entry.id} className="flex items-start gap-3 px-4 py-3 lg:py-4 rounded-xl bg-zinc-900/60 ring-1 ring-white/5">
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center shrink-0 text-xs lg:text-sm font-bold bg-emerald-500/10 text-emerald-400">
                  ₹
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-sm lg:text-base font-semibold text-zinc-200">₹{entry.amount}</span>
                    <span className="text-[9px] lg:text-[11px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">{entry.status}</span>
                    <span className="text-[9px] lg:text-[11px] text-zinc-600">{new Date(entry.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-[9px] lg:text-[11px] font-mono text-zinc-500">ID: {entry.payment_id}</span>
                    <span className="text-[9px] lg:text-[11px] font-mono text-zinc-500">Order: {entry.order_id}</span>
                    {entry.message && <span className="text-[9px] lg:text-[11px] text-zinc-400">{entry.message}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500 text-center py-4">No payments received yet</p>
        )}
      </Card>
    </div>
  )
}

export function ApiKeysTab() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const check = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const token = localStorage.getItem("edutechsrm_admin_token")
      const res = await fetch("/api/admin/check-keys", {
        headers: token ? { "x-admin-token": token } : {},
      })
      if (!res.ok) { setError(`Error ${res.status}`); return }
      setData(await res.json())
    } catch {
      setError("Failed to connect")
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className="space-y-6 lg:space-y-8">
      <SectionHeader label="Provider" title="API Key Status" color="#f472b6" icon={Key} />
      <button onClick={check} disabled={loading}
        className="flex items-center gap-2 px-4 py-2 lg:px-5 lg:py-3 rounded-xl text-xs lg:text-sm font-bold bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 transition-all disabled:opacity-40"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
        {loading ? "Checking..." : "Check Keys"}
      </button>

      {error && <p className="text-xs lg:text-sm text-red-400">{error}</p>}

      {data && (
        <div className="space-y-4 lg:space-y-6">
          <Card>
            <p className="text-zinc-500 font-bold text-[10px] lg:text-xs uppercase tracking-widest mb-3">Primary AI Provider</p>
            <div className="space-y-2 lg:space-y-3">
              {data.mistral?.length > 0 ? data.mistral.map((k: any, i: number) => (
                <div key={i} className="flex items-center justify-between px-3 lg:px-5 py-2.5 lg:py-3.5 rounded-xl bg-zinc-900/60 ring-1 ring-white/5">
                  <div>
                    <p className="text-xs lg:text-sm font-semibold text-zinc-200 font-mono">{k.key}</p>
                    {k.error && <p className="text-[10px] lg:text-xs text-red-400 mt-0.5">{k.statusCode}: {k.error}</p>}
                  </div>
                  <span className={`text-[9px] lg:text-[11px] font-bold uppercase tracking-wider px-2 py-1 lg:px-3 lg:py-1.5 rounded-full ${k.status === "working" ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"}`}>
                    {k.status}
                  </span>
                </div>
              )) : <p className="text-xs lg:text-sm text-zinc-600">No keys configured</p>}
            </div>
            <p className="text-[10px] lg:text-xs text-zinc-600 mt-2">Model: {data.config?.mistral_model}</p>
          </Card>

          <Card>
            <p className="text-zinc-500 font-bold text-[10px] lg:text-xs uppercase tracking-widest mb-3">Backup AI Provider</p>
            <div className="space-y-2 lg:space-y-3">
              {data.nvidia?.length > 0 ? data.nvidia.map((k: any, i: number) => (
                <div key={i} className="flex items-center justify-between px-3 lg:px-5 py-2.5 lg:py-3.5 rounded-xl bg-zinc-900/60 ring-1 ring-white/5">
                  <div>
                    <p className="text-xs lg:text-sm font-semibold text-zinc-200 font-mono">{k.key}</p>
                    {k.error && <p className="text-[10px] lg:text-xs text-red-400 mt-0.5">{k.statusCode}: {k.error}</p>}
                  </div>
                  <span className={`text-[9px] lg:text-[11px] font-bold uppercase tracking-wider px-2 py-1 lg:px-3 lg:py-1.5 rounded-full ${k.status === "working" ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"}`}>
                    {k.status}
                  </span>
                </div>
              )) : <p className="text-xs lg:text-sm text-zinc-600">No keys configured</p>}
            </div>
            <p className="text-[10px] lg:text-xs text-zinc-600 mt-2">Model: {data.config?.nvidia_model}</p>
          </Card>
        </div>
      )}
    </div>
  )
}

export function AdminManagerModal() {
  const {
    isManagerOpen, closeManager, isAdminAuthenticated, adminLoading,
    adminLogout, maintenance, analytics, announcements,
    disabledPages, feedback, setMaintenanceMode,
    addAnnouncement, deleteAnnouncement,
    addDisabledPage, removeDisabledPage,
    logoutAllUsers, logoutUser,
  } = useAdminControl()

  const [activeTab, setActiveTab] = useState<TabType>("analytics")
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
    if (!isManagerOpen) return
    setStatus(null)
    setMessage(maintenance.message || "")
    window.scrollTo({ top: 0, behavior: "auto" })
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = prev }
  }, [isManagerOpen, maintenance.message])

  if (!isManagerOpen) return null

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
    showStatus(`Page disabled`)
  }

  const handleRemovePage = async (page: string) => {
    const r = await removeDisabledPage(page)
    if (!r.success) { showStatus(r.error || "Failed", true); return }
    showStatus(`Page re-enabled`)
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

  return (
    <div className="fixed inset-0 z-[95] overflow-y-auto" style={{ background: "radial-gradient(circle at 12% 8%, rgba(52,211,153,0.16), transparent 24%), radial-gradient(circle at 88% 10%, rgba(56,189,248,0.14), transparent 26%), rgba(2,6,23,0.9)", backdropFilter: "blur(14px)" }}>
      <div className="min-h-full px-3 sm:px-6 pt-14 sm:pt-6 pb-4 sm:pb-6">
        <div className="mx-auto w-full max-w-5xl rounded-2xl sm:rounded-3xl overflow-hidden" style={{ background: "linear-gradient(145deg, rgba(12,14,20,0.95), rgba(15,17,24,0.9))", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 28px 80px rgba(0,0,0,0.55)" }}>

          {/* ── Header ── */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(52,211,153,0.28), rgba(56,189,248,0.22))", border: "1px solid rgba(255,255,255,0.14)" }}>
                <Shield className="w-4 h-4" style={{ color: "#6ee7b7" }} />
              </div>
              <div>
                <h2 className="text-base font-black text-zinc-100 font-display tracking-tight">Admin Manager</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  {isAdminAuthenticated ? <span className="text-emerald-400">Authenticated</span> : "Sign in required"}
                </p>
              </div>
            </div>
            <button onClick={closeManager} className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-200 transition-all" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── Not authenticated ── */}
          {!isAdminAuthenticated ? (
            <div className="p-4 sm:p-6 max-w-sm mx-auto w-full py-14 text-center">
              <div className="w-14 h-14 mx-auto mb-5 rounded-2xl flex items-center justify-center" style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.18)" }}>
                <Shield className="w-6 h-6" style={{ color: "#34d399" }} />
              </div>
              <h3 className="text-lg font-bold text-zinc-100 font-display">Admin Login Required</h3>
              <p className="text-sm text-zinc-500 mt-2 mb-6 max-w-xs mx-auto leading-relaxed">
                Sign in using your admin credentials on the login page to access the admin dashboard.
              </p>
              <a href="/login"
                className="inline-flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-all">
                Go to /login
              </a>
            </div>
          ) : (
            <>
              {/* ── Tabs ── */}
              <div className="flex gap-1.5 px-4 sm:px-6 pt-4 pb-2 border-b overflow-x-auto scrollbar-none" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                {TABS.map(tab => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all"
                      style={{
                        background: isActive ? `${tab.color}18` : "rgba(255,255,255,0.02)",
                        color: isActive ? tab.color : "#71717a",
                        border: isActive ? `1px solid ${tab.color}55` : "1px solid rgba(255,255,255,0.06)",
                      }}>
                      <Icon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* ── Content ── */}
              <div className="p-4 sm:p-6 max-h-[68vh] overflow-y-auto">
                {activeTab === "analytics" && <AnalyticsTab analytics={analytics} maintenance={maintenance} setMaintenanceMode={setMaintenanceMode} maintenanceMsg={message} setMaintenanceMsg={setMessage} maintenanceLoading={adminLoading} />}
                {activeTab === "announcements" && (
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
                )}
                {activeTab === "pages" && (
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
                )}
                {activeTab === "sessions" && (
                  <SessionsTab
                    handleLogoutAll={handleLogoutAll}
                    handleLogoutUser={handleLogoutUserFn}
                    targetUsername={targetUsername}
                    setTargetUsername={setTargetUsername}
                    adminLoading={adminLoading}
                  />
                )}
                {activeTab === "feedback" && <FeedbackTab feedback={feedback} />}
                {activeTab === "api-keys" && <ApiKeysTab />}
              </div>

              {/* ── Footer ── */}
              <div className="px-4 sm:px-6 py-4 border-t space-y-3" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                {status && (
                  <div className="px-4 py-3 rounded-xl text-sm flex items-center gap-2" style={{ background: status.error ? "rgba(248,113,113,0.1)" : "rgba(52,211,153,0.1)", color: status.error ? "#fda4af" : "#34d399" }}>
                    {status.error ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
                    {status.text}
                  </div>
                )}
                <div className="flex items-center justify-between gap-3">
                  <button onClick={handleLogout}
                    className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-zinc-400 hover:text-zinc-200 bg-zinc-800/60 hover:bg-zinc-800 transition-all">
                    <LogOut className="w-3 h-3" />
                    Sign Out
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-zinc-600">Live session</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
