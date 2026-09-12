"use client"

import { useEffect, useState, useMemo, useCallback, useRef } from "react"
import {
  AlertCircle, Loader2, Shield, Trash2, X,
  BarChart3, MessageSquareText, Megaphone, Ban, Users, Wrench,
  EyeOff, LogOut, UserX2, Check, Key, Smartphone, Megaphone as AnnounceIcon,
  ServerCog,
  UploadCloud, ImageOff, Plus, Save,
} from "lucide-react"
import { useAdminControl } from "@/lib/admin-control"
import type { AnnouncementType } from "./announcements"

export type AdminTabType = "analytics" | "announcements" | "pages" | "sessions" | "feedback" | "api-keys" | "payments" | "mobile-app"
type TabType = AdminTabType

export const ADMIN_TABS: Array<{ id: AdminTabType; label: string; icon: any; color: string }> = [
  { id: "analytics", label: "Analytics", icon: BarChart3, color: "#38bdf8" },
  { id: "announcements", label: "Announcements", icon: Megaphone, color: "#34d399" },
  { id: "sessions", label: "Sessions", icon: Users, color: "#a78bfa" },
  { id: "feedback", label: "Feedback", icon: MessageSquareText, color: "#fbbf24" },
  { id: "payments", label: "Payments", icon: Wrench, color: "#34d399" },
  { id: "pages", label: "Pages", icon: Ban, color: "#f87171" },
  { id: "mobile-app", label: "Mobile App", icon: Smartphone, color: "#22d3ee" },
  { id: "api-keys", label: "API Keys", icon: Key, color: "#f472b6" },
]

const TABS: Array<{ id: TabType; label: string; icon: any; color: string }> = [
  { id: "analytics", label: "Analytics", icon: BarChart3, color: "#38bdf8" },
  { id: "announcements", label: "Announcements", icon: Megaphone, color: "#34d399" },
  { id: "pages", label: "Pages", icon: Ban, color: "#f87171" },
  { id: "sessions", label: "Sessions", icon: Users, color: "#a78bfa" },
  { id: "feedback", label: "Feedback", icon: MessageSquareText, color: "#fbbf24" },
  { id: "mobile-app", label: "Mobile App", icon: Smartphone, color: "#22d3ee" },
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
  { id: "map", label: "Campus Map" },
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

export function StatCard({ label, value, color, subtitle, icon: Icon }: { label: string; value: string | number; color: string; subtitle?: string; icon?: any }) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl p-4 sm:p-5 transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: "linear-gradient(180deg, rgba(16,22,35,0.92) 0%, rgba(10,14,23,0.92) 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.07)",
      }}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <p className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-zinc-400">{label}</p>
        {Icon && (
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}15`, color }}>
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
      <p className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white" style={{ color }}>{typeof value === "number" ? value.toLocaleString() : value}</p>
      {subtitle && <p className="text-[11px] text-zinc-400 mt-1 font-sans">{subtitle}</p>}
      <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-20" style={{ background: color }} />
    </div>
  )
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl sm:rounded-[22px] p-5 sm:p-6 ${className}`}
      style={{
        background: "linear-gradient(180deg, rgba(14,20,32,0.85) 0%, rgba(10,14,24,0.85) 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 14px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
        backdropFilter: "blur(16px)",
      }}
    >
      {children}
    </div>
  )
}

export function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-xl px-4 py-2.5 text-sm text-zinc-100 transition-all placeholder:text-zinc-500 outline-none ${className}`}
      style={{
        background: "rgba(7,11,19,0.95)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "inset 0 1px 2px rgba(0,0,0,0.4)",
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "rgba(52,211,153,0.5)"
        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(52,211,153,0.12), inset 0 1px 2px rgba(0,0,0,0.4)"
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"
        e.currentTarget.style.boxShadow = "inset 0 1px 2px rgba(0,0,0,0.4)"
      }}
      {...props}
    />
  )
}

export function Textarea({ className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full rounded-xl px-4 py-3 text-sm text-zinc-100 transition-all placeholder:text-zinc-500 outline-none resize-none ${className}`}
      style={{
        background: "rgba(7,11,19,0.95)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "inset 0 1px 2px rgba(0,0,0,0.4)",
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "rgba(52,211,153,0.5)"
        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(52,211,153,0.12), inset 0 1px 2px rgba(0,0,0,0.4)"
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"
        e.currentTarget.style.boxShadow = "inset 0 1px 2px rgba(0,0,0,0.4)"
      }}
      {...props}
    />
  )
}

export function Select({ className = "", children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full rounded-xl px-4 py-2.5 text-sm text-zinc-100 transition-all appearance-none outline-none cursor-pointer ${className}`}
      style={{
        background: "rgba(7,11,19,0.95)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "inset 0 1px 2px rgba(0,0,0,0.4)",
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "rgba(52,211,153,0.5)"
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"
      }}
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
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
          <h2 className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-[0.16em]" style={{ color }}>{label}</h2>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight font-display flex items-center gap-2.5">
          {title}
          {count !== undefined && (
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full" style={{ background: `${color}18`, color }}>{count}</span>
          )}
        </h3>
      </div>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg" style={{ background: `linear-gradient(135deg, ${color}22, ${color}0c)`, border: `1px solid ${color}33`, color }}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  )
}

export function AnalyticsTab({ analytics, maintenance, setMaintenanceMode, maintenanceMsg, setMaintenanceMsg, maintenanceLoading }: any) {
  const stats = useMemo(() => [
    { label: "Active Users", value: analytics.activeSessionCount || 0, color: "#38bdf8", subtitle: "Currently connected", icon: Users },
    { label: "Total Visits", value: analytics.totalVisits || 0, color: "#34d399", subtitle: "Total backend hits", icon: BarChart3 },
    { label: "Success Logins", value: analytics.loginSuccessCount || 0, color: "#60a5fa", subtitle: "Verified sign-ins", icon: Check },
    { label: "Mobile Logins", value: analytics.mobileLoginSuccessCount || 0, color: "#a78bfa", subtitle: "Android app syncs", icon: Smartphone },
    { label: "Failed Logins", value: analytics.loginFailureCount || 0, color: "#f87171", subtitle: "Auth failures", icon: AlertCircle },
  ], [analytics])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${maintenance.enabled ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`} />
              <p className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-[0.16em] text-zinc-400">System Gateway</p>
            </div>
            <h3 className="text-lg font-bold text-white font-display">Maintenance Mode</h3>
            <p className="text-xs text-zinc-400 mt-0.5">When active, student logins and dashboard queries are paused with your broadcast message.</p>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-center">
            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${maintenance.enabled ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"}`}>
              {maintenance.enabled ? "MAINTENANCE ACTIVE" : "PRODUCTION LIVE"}
            </span>
            <button
              onClick={async () => {
                await setMaintenanceMode(!maintenance.enabled, maintenanceMsg)
              }}
              disabled={maintenanceLoading}
              className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-0 transition-colors duration-200 focus:outline-none"
              style={{ background: maintenance.enabled ? "#f59e0b" : "rgba(255,255,255,0.12)" }}
            >
              <span
                className="inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 shadow-md"
                style={{ margin: "2px", transform: maintenance.enabled ? "translateX(20px)" : "translateX(0)" }}
              />
            </button>
          </div>
        </div>
        <div className="pt-2">
          <Input
            value={maintenanceMsg}
            onChange={(e: any) => setMaintenanceMsg(e.target.value)}
            placeholder="Broadcast maintenance message (e.g. Scheduled system upgrade in progress...)"
          />
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-[0.16em] text-zinc-400 mb-0.5">Realtime Telemetry</p>
            <h3 className="text-lg font-bold text-white font-display">Recent Login Activity</h3>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">Last 50 entries</span>
        </div>
        <div className="space-y-2 max-h-72 lg:max-h-[480px] overflow-y-auto pr-1">
          {analytics.logs && analytics.logs.length > 0 ? (
            analytics.logs.slice(0, 50).map((log: any) => (
              <div
                key={log.id}
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-white/[0.04]"
                style={{
                  background: "rgba(18,24,38,0.6)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-100 font-mono tracking-tight">{log.username}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono text-zinc-400">{fmtTime(log.timestamp)}</span>
                    {log.page && <span className="text-[10px] font-mono text-zinc-500 border-l border-white/10 pl-2">{log.page}</span>}
                  </div>
                </div>
                <span
                  className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap"
                  style={logTone(log.outcome)}
                >
                  {log.outcome}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-zinc-500 py-8 text-center font-mono">No login activity recorded yet</p>
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
              className="py-2.5 px-3 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer"
              style={{
                background: announcementType === o.value ? `${o.color}20` : "rgba(255,255,255,0.03)",
                border: announcementType === o.value ? `1px solid ${o.color}66` : "1px solid rgba(255,255,255,0.06)",
                color: announcementType === o.value ? o.color : "#a1a1aa",
                boxShadow: announcementType === o.value ? `0 0 16px ${o.color}22` : "none",
              }}>
              {o.label}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          <Input value={announcementTitle} onChange={(e: any) => setAnnouncementTitle(e.target.value)} placeholder="Announcement title (e.g. SRMIST Exam Timetable Published)" />
          <Textarea value={announcementBody} onChange={(e: any) => setAnnouncementBody(e.target.value)} rows={3} placeholder="Write the announcement message students should see..." className="lg:min-h-[100px]" />
          <button onClick={handlePostAnnouncement} disabled={adminLoading || !announcementTitle.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "#022c22",
              boxShadow: "0 4px 20px rgba(16,185,129,0.3)",
            }}>
            {adminLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Megaphone className="w-3.5 h-3.5" />}
            Post Announcement
          </button>
        </div>
      </Card>

      <Card>
        <SectionHeader label="Active" title="Announcements" count={announcements.length} color="#38bdf8" icon={Megaphone} />
        {announcements.length > 0 ? (
          <div className="space-y-2.5 max-h-72 lg:max-h-[480px] overflow-y-auto pr-1">
            {announcements.map((item: any) => {
              const tone = ANNOUNCE_OPTS.find(o => o.value === item.type)
              const c = tone?.color || "#a1a1aa"
              return (
                <div key={item.id} className="flex items-start gap-3.5 p-4 rounded-2xl transition-colors hover:bg-white/[0.03] group"
                  style={{
                    background: "rgba(18,24,38,0.6)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}>
                  <div className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ background: c, boxShadow: `0 0 10px ${c}88` }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ background: `${c}15`, border: `1px solid ${c}30`, color: c }}>{item.type}</span>
                      <span className="text-[10px] font-mono text-zinc-500">{item.date}</span>
                    </div>
                    <p className="text-sm font-semibold text-zinc-100">{item.title}</p>
                    <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">{item.body}</p>
                  </div>
                  <button onClick={() => handleDeleteAnnouncement(item.id)} disabled={adminLoading}
                    title="Delete announcement"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-rose-400 hover:bg-rose-500/15 border border-transparent hover:border-rose-500/25 transition-all opacity-80 group-hover:opacity-100 shrink-0 cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-zinc-500 text-center py-6 font-mono">No announcements posted yet</p>
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
            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-zinc-400 mb-2">Select Page</p>
            <Select value={disabledPage} onChange={(e: any) => setDisabledPage(e.target.value)}>
              <option value="">Choose a page to disable...</option>
              {PAGE_OPTIONS.map(p => (
                <option key={p.id} value={p.id} className="bg-zinc-900 text-zinc-100">{p.label} ({p.id})</option>
              ))}
            </Select>
          </div>
          {disabledPage && (
            <div className="px-4 py-2.5 rounded-xl text-xs flex items-center justify-between" style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "#fda4af" }}>
              <span>Target: <code className="font-mono text-[11px] font-bold text-white">{disabledPage}</code></span>
              {selectedLabel && <span className="text-[11px] text-zinc-400">{selectedLabel}</span>}
            </div>
          )}
          <div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-zinc-400 mb-2">Reason</p>
            <Input value={disabledReason} onChange={(e: any) => setDisabledReason(e.target.value)} placeholder="Why is this page disabled? (e.g. Under maintenance for grade calculation)" />
          </div>
          <button onClick={handleAddDisabledPage} disabled={adminLoading || !disabledPage}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: disabledPage ? "linear-gradient(135deg, rgba(244,63,94,0.3), rgba(225,29,72,0.35))" : "rgba(255,255,255,0.04)",
              border: disabledPage ? "1px solid rgba(244,63,94,0.45)" : "1px solid rgba(255,255,255,0.06)",
              color: disabledPage ? "#fda4af" : "#71717a",
            }}>
            <Ban className="w-3.5 h-3.5" />
            Disable Page
          </button>
        </div>
      </Card>

      {disabledPages.length > 0 && (
        <Card>
          <SectionHeader label="Currently Off" title="Disabled Pages" count={disabledPages.length} color="#f87171" icon={EyeOff} />
          <div className="space-y-2.5">
            {disabledPages.map((entry: any) => {
              const pageMeta = PAGE_OPTIONS.find(p => p.id === entry.page)
              return (
                <div key={entry.page} className="flex items-start justify-between gap-3 px-4 py-3.5 rounded-2xl transition-all group"
                  style={{
                    background: "rgba(18,24,38,0.6)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-100">{pageMeta?.label || entry.page}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5 font-mono">{entry.page}</p>
                    {entry.reason && <p className="text-xs text-zinc-300 mt-1">{entry.reason}</p>}
                  </div>
                  <button onClick={() => handleRemoveDisabledPage(entry.page)}
                    title="Re-enable page"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-400 hover:bg-emerald-500/15 border border-emerald-500/20 transition-all shrink-0 cursor-pointer">
                    <Check className="w-3.5 h-3.5" />
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

export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)}
      className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-0 transition-colors duration-200"
      style={{ background: checked ? "#22d3ee" : "rgba(255,255,255,0.08)" }}>
      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200" style={{ margin: "2px", transform: checked ? "translateX(14px)" : "translateX(0)" }} />
    </button>
  )
}

interface AnnouncementDraft {
  id: string
  enabled: boolean
  title: string
  body: string
  imageUrl: string
}

function newAnnouncementId(): string {
  return `ann-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function normalizeAnnouncements(s: any): AnnouncementDraft[] {
  const list =
    Array.isArray(s?.announcements) && s.announcements.length > 0
      ? s.announcements
      : s?.announcement && (s.announcement.title || s.announcement.body || s.announcement.imageUrl || s.announcement.enabled)
        ? [s.announcement]
        : []
  return list.map((a: any) => ({
    id: a?.id || newAnnouncementId(),
    enabled: Boolean(a?.enabled),
    title: a?.title || "",
    body: a?.body || "",
    imageUrl: a?.imageUrl || "",
  }))
}

/** Downscale + re-encode an image to a small data URI so it loads reliably in the app. */
function compressImage(dataUrl: string, maxDim = 1280, quality = 0.72): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
      if (scale >= 1 && dataUrl.length < 400 * 1024) {
        resolve(dataUrl)
        return
      }
      const canvas = document.createElement("canvas")
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        resolve(dataUrl)
        return
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      try {
        const out = canvas.toDataURL("image/jpeg", quality)
        resolve(out.length < dataUrl.length ? out : dataUrl)
      } catch {
        resolve(dataUrl)
      }
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}

export function MobileAppSettingsTab({
  mobileAppSettings, updateMobileAppSettings, adminLoading,
}: any) {
  const [annList, setAnnList] = useState<AnnouncementDraft[]>(() => normalizeAnnouncements(mobileAppSettings))
  const [annSaving, setAnnSaving] = useState(false)
  const [annStatus, setAnnStatus] = useState<{ text: string; error: boolean } | null>(null)
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const [updEnabled, setUpdEnabled] = useState(Boolean(mobileAppSettings?.update?.enabled))
  const [latestVersion, setLatestVersion] = useState(mobileAppSettings?.update?.latestVersion || "1.1.0")
  const [latestVersionCode, setLatestVersionCode] = useState(String(mobileAppSettings?.update?.latestVersionCode ?? 14))
  const [minVersionCode, setMinVersionCode] = useState(String(mobileAppSettings?.update?.minVersionCode ?? 14))
  const [forceUpdate, setForceUpdate] = useState(Boolean(mobileAppSettings?.update?.forceUpdate))
  const [updateUrl, setUpdateUrl] = useState(mobileAppSettings?.update?.updateUrl || "https://play.google.com/store/apps/details?id=in.edutechsrm.app")
  const [changelog, setChangelog] = useState<Array<{ version: string; code: number; date: string; changes: string[] }>>(
    Array.isArray(mobileAppSettings?.update?.changelog) ? mobileAppSettings.update.changelog : []
  )
const [attendanceSource, setAttendanceSource] = useState<"backend" | "portal">(mobileAppSettings?.update?.attendanceSource === "portal" ? "portal" : "backend")
  const [updSaving, setUpdSaving] = useState(false)
  const [updStatus, setUpdStatus] = useState<{ text: string; error: boolean } | null>(null)

  useEffect(() => {
    if (!mobileAppSettings) return
    setAnnList(normalizeAnnouncements(mobileAppSettings))
    setUpdEnabled(Boolean(mobileAppSettings.update?.enabled))
    setLatestVersion(mobileAppSettings.update?.latestVersion || "1.1.0")
    setLatestVersionCode(String(mobileAppSettings.update?.latestVersionCode ?? 14))
    setMinVersionCode(String(mobileAppSettings.update?.minVersionCode ?? 14))
    setForceUpdate(Boolean(mobileAppSettings.update?.forceUpdate))
    setUpdateUrl(mobileAppSettings.update?.updateUrl || "")
    setChangelog(Array.isArray(mobileAppSettings.update?.changelog) ? mobileAppSettings.update.changelog : [])
setAttendanceSource(mobileAppSettings.update?.attendanceSource === "portal" ? "portal" : "backend")
  }, [mobileAppSettings])

  const updateAnn = useCallback((id: string, patch: Partial<{ enabled: boolean; title: string; body: string; imageUrl: string }>) => {
    setAnnList((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)))
  }, [])

  const addAnnouncement = () => {
    setAnnList((prev) => [...prev, { id: newAnnouncementId(), enabled: true, title: "", body: "", imageUrl: "" }])
    setAnnStatus(null)
  }

  const removeAnnouncement = (id: string) => {
    setAnnList((prev) => prev.filter((a) => a.id !== id))
    setAnnStatus(null)
  }

  const handleAnnImage = async (id: string, file: File) => {
    if (!file) return
    if (!file.type.startsWith("image/")) { setAnnStatus({ text: "Please select an image file", error: true }); return }
    if (file.size > 10 * 1024 * 1024) { setAnnStatus({ text: "Image must be under 10MB", error: true }); return }
    const reader = new FileReader()
    reader.onload = async () => {
      if (typeof reader.result !== "string") return
      const compressed = await compressImage(reader.result)
      updateAnn(id, { imageUrl: compressed })
      setAnnStatus({ text: "Image attached — auto-compressed for fast loading in the app", error: false })
    }
    reader.readAsDataURL(file)
  }

  const saveAnnouncements = async () => {
    setAnnSaving(true)
    setAnnStatus(null)
    const list = annList
      .filter((a) => a.title.trim() || a.body.trim() || a.imageUrl.trim())
      .map((a) => ({
        id: a.id,
        enabled: a.enabled,
        title: a.title.trim(),
        body: a.body.trim(),
        imageUrl: a.imageUrl.trim(),
        createdAt: new Date().toISOString(),
      }))
    const r = await updateMobileAppSettings({ announcements: list })
    if (!r.success) { setAnnStatus({ text: r.error || "Failed to save", error: true }) }
    else { setAnnStatus({ text: list.length === 0 ? "All announcements removed — nothing shows in the app" : `Saved ${list.length} announcement${list.length > 1 ? "s" : ""} — they appear as popups on launch`, error: false }) }
    setAnnSaving(false)
  }

  const saveUpdate = async () => {
    setUpdSaving(true)
    setUpdStatus(null)
    const code = parseInt(latestVersionCode, 10)
    const minCode = parseInt(minVersionCode, 10)
    const r = await updateMobileAppSettings({
      update: {
        enabled: updEnabled,
        latestVersion: latestVersion.trim() || "1.0.0",
        latestVersionCode: Number.isFinite(code) ? code : 1,
        minVersionCode: Number.isFinite(minCode) ? minCode : code,
        forceUpdate,
        updateUrl: updateUrl.trim(),
        changelog,
        attendanceSource,
      },
    })
    if (!r.success) { setUpdStatus({ text: r.error || "Failed to save", error: true }) }
    else { setUpdStatus({ text: "Update settings saved — the update popup will reflect these values", error: false }) }
    setUpdSaving(false)
  }

  const addChangelog = () => {
    const version = latestVersion.trim() || `1.0.${changelog.length + 1}`
    setChangelog((prev) => [{ version, code: parseInt(latestVersionCode, 10) || 1, date: new Date().toISOString().slice(0, 10), changes: [] }, ...prev])
  }

  const updateChangelog = (index: number, patch: Partial<{ version: string; code: number; date: string; changes: string[] }>) => {
    setChangelog((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  const removeChangelog = (index: number) => {
    setChangelog((prev) => prev.filter((_, i) => i !== index))
  }

  const flash = (s: { text: string; error: boolean } | null) => {
    if (!s) return null
    return (
      <div className="px-4 py-3 rounded-xl text-sm flex items-center gap-2" style={{ background: s.error ? "rgba(248,113,113,0.1)" : "rgba(52,211,153,0.1)", color: s.error ? "#fda4af" : "#34d399" }}>
        {s.error ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
        {s.text}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <SectionHeader
          label="Attendance"
          title="Attendance Source Switch"
          color={attendanceSource === "portal" ? "#22d3ee" : "#34d399"}
          icon={ServerCog}
        />
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4 rounded-2xl p-4 sm:p-5"
            style={{
              background: "rgba(18,24,38,0.6)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-zinc-100">
                Active Source: <span className={attendanceSource === "portal" ? "text-cyan-400 font-mono font-bold" : "text-emerald-400 font-mono font-bold"}>{attendanceSource === "portal" ? "Student Portal Scraper" : "Primary API Backend"}</span>
              </p>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed font-sans">
                Switch this only when the primary attendance backend is unavailable. The attendance page will dynamically route queries through the portal scraper.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setAttendanceSource("backend")}
                className="px-3 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer"
                style={{
                  background: attendanceSource === "backend" ? "rgba(52,211,153,0.18)" : "rgba(255,255,255,0.03)",
                  color: attendanceSource === "backend" ? "#34d399" : "#71717a",
                  border: attendanceSource === "backend" ? "1px solid rgba(52,211,153,0.4)" : "1px solid rgba(255,255,255,0.06)",
                  boxShadow: attendanceSource === "backend" ? "0 0 16px rgba(52,211,153,0.15)" : "none",
                }}
              >
                Primary
              </button>
              <button
                type="button"
                onClick={() => setAttendanceSource("portal")}
                className="px-3 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer"
                style={{
                  background: attendanceSource === "portal" ? "rgba(34,211,238,0.18)" : "rgba(255,255,255,0.03)",
                  color: attendanceSource === "portal" ? "#22d3ee" : "#71717a",
                  border: attendanceSource === "portal" ? "1px solid rgba(34,211,238,0.4)" : "1px solid rgba(255,255,255,0.06)",
                  boxShadow: attendanceSource === "portal" ? "0 0 16px rgba(34,211,238,0.15)" : "none",
                }}
              >
                Student Portal
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-xs text-zinc-400 leading-relaxed font-sans">
            The student portal scraper backend is configured via secure Cloudflare environment credentials.
          </div>

          <button
            type="button"
            onClick={async () => {
              const r = await updateMobileAppSettings({
                update: {
                  ...(mobileAppSettings?.update ?? {}),
                  attendanceSource,
                },
              })
              if (!r.success) {
                setUpdStatus({ text: r.error || "Failed to save attendance source", error: true })
              } else {
                setUpdStatus({ text: "Attendance source saved", error: false })
              }
            }}
            disabled={adminLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg disabled:opacity-40"
            style={{
              background: "linear-gradient(135deg, rgba(34,211,238,0.25), rgba(6,182,212,0.2))",
              border: "1px solid rgba(34,211,238,0.35)",
              color: "#22d3ee",
            }}
          >
            <Save className="w-3.5 h-3.5" />
            Save Attendance Source
          </button>
        </div>
      </Card>

      {/* ── App announcements ── */}
      <Card>
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md" style={{ background: "rgba(34,211,238,0.12)", border: "1px solid rgba(34,211,238,0.25)", color: "#22d3ee" }}>
              <AnnounceIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight font-display">App Popups & Banners</h3>
              <p className="text-xs text-zinc-400 mt-0.5">{annList.length} announcement{annList.length === 1 ? "" : "s"} · Displayed as mobile dialogs on student app launch</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {annList.length === 0 && (
            <div className="text-sm text-zinc-500 text-center py-6 border border-dashed border-white/10 rounded-2xl font-mono">No mobile announcements configured</div>
          )}
          {annList.map((a, idx) => (
            <div key={a.id} className="rounded-2xl p-4 sm:p-5 space-y-3.5"
              style={{
                background: "rgba(18,24,38,0.6)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-cyan-400">Announcement #{idx + 1}</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                    <span className={a.enabled ? "text-cyan-400 font-bold" : "text-zinc-500"}>{a.enabled ? "LIVE" : "DRAFT"}</span>
                    <Toggle checked={a.enabled} onChange={(v) => updateAnn(a.id, { enabled: v })} />
                  </div>
                  <button onClick={() => removeAnnouncement(a.id)}
                    title="Remove announcement"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-rose-400 hover:bg-rose-500/15 border border-transparent hover:border-rose-500/25 transition-all cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-zinc-400 mb-2">Title</p>
                <Input value={a.title} onChange={(e: any) => updateAnn(a.id, { title: e.target.value })} placeholder="e.g. SRMIST Mid-Term Exam Schedule Released" />
              </div>
              <div>
                <p className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-zinc-400 mb-2">Message</p>
                <Textarea value={a.body} onChange={(e: any) => updateAnn(a.id, { body: e.target.value })} rows={3} placeholder="Write the announcement message students should see..." />
              </div>
              <div>
                <p className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-zinc-400 mb-2">Image (optional)</p>
                <input
                  ref={(el) => { fileRefs.current[a.id] = el }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAnnImage(a.id, f); e.target.value = "" }}
                />
                {a.imageUrl ? (
                  <div className="relative overflow-hidden rounded-xl border border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.imageUrl} alt="Announcement preview" className="w-full h-44 object-cover" />
                    <button onClick={() => { updateAnn(a.id, { imageUrl: "" }); setAnnStatus(null) }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-lg flex items-center justify-center text-white bg-black/70 hover:bg-rose-600 transition-all cursor-pointer">
                      <ImageOff className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => fileRefs.current[a.id]?.click()}
                    className="w-full flex flex-col items-center justify-center gap-2 py-6 rounded-xl border border-dashed border-white/10 hover:border-cyan-400/40 hover:bg-cyan-400/5 transition-all text-zinc-400 cursor-pointer">
                    <UploadCloud className="w-5 h-5 text-cyan-400" />
                    <span className="text-xs font-semibold">Click to attach banner image (auto-compressed)</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          <button onClick={addAnnouncement}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-all border border-dashed border-white/15 hover:border-cyan-400/50 hover:text-cyan-300 text-zinc-400 cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
            Add Announcement
          </button>

          <button onClick={saveAnnouncements} disabled={adminLoading || annSaving}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg disabled:opacity-40"
            style={{
              background: "linear-gradient(135deg, rgba(34,211,238,0.25), rgba(6,182,212,0.2))",
              border: "1px solid rgba(34,211,238,0.4)",
              color: "#67e8f9",
            }}>
            {annSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {annSaving ? "Saving..." : "Save App Announcements"}
          </button>
          {flash(annStatus)}
        </div>
      </Card>

      {/* ── Update / version popup ── */}
      <Card>
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md" style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.25)", color: "#34d399" }}>
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight font-display">Mobile App Release Controller</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Controls the in-app version update prompt on Android</p>
            </div>
          </div>
          <Toggle checked={updEnabled} onChange={setUpdEnabled} />
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-zinc-400 mb-2">Latest Version</p>
              <Input value={latestVersion} onChange={(e: any) => setLatestVersion(e.target.value)} placeholder="1.1.0" />
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-zinc-400 mb-2">Version Code</p>
              <Input value={latestVersionCode} onChange={(e: any) => setLatestVersionCode(e.target.value.replace(/\D/g, ""))} placeholder="14" inputMode="numeric" />
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-zinc-400 mb-2">Min Version Code</p>
              <Input value={minVersionCode} onChange={(e: any) => setMinVersionCode(e.target.value.replace(/\D/g, ""))} placeholder="14" inputMode="numeric" />
            </div>
          </div>
          <p className="text-[11px] text-zinc-400 font-sans">The update prompt appears when an installed app's code is below <span className="text-emerald-400 font-mono font-bold">Latest Version Code</span>. If below <span className="text-amber-400 font-mono font-bold">Min Version Code</span>, usage is hard-blocked until updated.</p>

          <div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-zinc-400 mb-2">Update Link (Play Store / APK)</p>
            <Input value={updateUrl} onChange={(e: any) => setUpdateUrl(e.target.value)} placeholder="https://play.google.com/store/apps/details?id=in.edutechsrm.app" />
          </div>

          <div className="flex items-center justify-between px-5 py-4 rounded-2xl" style={{ background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.18)" }}>
            <div>
              <p className="text-sm font-semibold text-zinc-100">Force Mandatory Update</p>
              <p className="text-xs text-zinc-400 mt-0.5 font-sans">Disallow dismissing the update modal</p>
            </div>
            <Toggle checked={forceUpdate} onChange={setForceUpdate} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-zinc-400">Release Changelog</p>
              <button onClick={addChangelog}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 hover:bg-cyan-400/10 transition-all cursor-pointer">
                <Plus className="w-3.5 h-3.5" /> Add version
              </button>
            </div>
            {changelog.length === 0 ? (
              <p className="text-xs text-zinc-500 font-mono text-center py-6 rounded-2xl" style={{ background: "rgba(18,24,38,0.4)", border: "1px solid rgba(255,255,255,0.06)" }}>No changelog entries yet</p>
            ) : (
              <div className="space-y-2.5">
                {changelog.map((entry, index) => (
                  <div key={`${entry.version}-${index}`} className="p-4 rounded-2xl space-y-2.5"
                    style={{
                      background: "rgba(18,24,38,0.6)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md font-mono" style={{ background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)" }}>v{entry.version || "—"}</span>
                        <span className="text-[10px] text-zinc-400 font-mono">code {entry.code}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">{entry.date || "—"}</span>
                      </div>
                      <button onClick={() => removeChangelog(index)} className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-rose-400 hover:bg-rose-500/15 transition-all cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input value={entry.version} onChange={(e: any) => updateChangelog(index, { version: e.target.value })} placeholder="1.2.0" className="!py-2 !text-xs font-mono" />
                      <Input value={String(entry.code)} onChange={(e: any) => updateChangelog(index, { code: parseInt(e.target.value.replace(/\D/g, ""), 10) || 0 })} placeholder="15" inputMode="numeric" className="!py-2 !text-xs font-mono" />
                    </div>
                    <Textarea
                      value={entry.changes.join("\n")}
                      onChange={(e: any) => updateChangelog(index, { changes: e.target.value.split("\n").map((l: string) => l.trim()).filter(Boolean) })}
                      rows={2}
                      placeholder={"One feature per line:\n• New dashboard customization\n• Faster student login"}
                      className="!py-2 !text-xs font-sans"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={saveUpdate} disabled={adminLoading || updSaving}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
            style={{ background: "rgba(52,211,153,0.15)", color: "#6ee7b7", opacity: adminLoading || updSaving ? 0.4 : 1 }}>
            {updSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {updSaving ? "Saving..." : "Save Update Settings"}
          </button>
          {flash(updStatus)}
        </div>
      </Card>
    </div>
  )
}

export function SessionsTab({ handleLogoutAll, handleLogoutUser, targetUsername, setTargetUsername, adminLoading }: any) {
  return (
    <div className="space-y-6">
      <Card>
        <SectionHeader label="Session Management" title="Terminate Active Sessions" color="#a78bfa" icon={Users} />
        <div className="space-y-5">
          <div
            className="p-5 sm:p-6 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(244,63,94,0.12) 0%, rgba(225,29,72,0.06) 100%)",
              border: "1px solid rgba(244,63,94,0.25)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              <p className="text-xs sm:text-sm font-bold tracking-tight text-rose-300">Global Session Invalidation</p>
            </div>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed font-sans">
              This will immediately invalidate all active student and staff sessions across the platform. All users will be prompted to re-authenticate on their next request.
            </p>
            <button onClick={handleLogoutAll} disabled={adminLoading}
              className="mt-4 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #e11d48, #be123c)",
                color: "#ffffff",
                boxShadow: "0 4px 20px rgba(225,29,72,0.3)",
              }}>
              {adminLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
              Invalidate All Sessions
            </button>
          </div>

          <div
            className="p-5 sm:p-6 rounded-2xl"
            style={{
              background: "rgba(18,24,38,0.6)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-violet-400" />
              <p className="text-sm font-bold text-zinc-100">Logout Specific User</p>
            </div>
            <p className="text-xs text-zinc-400 mb-4 leading-relaxed font-sans">
              Target an individual student account by username or registration number to clear their active cached session.
            </p>
            <div className="space-y-3">
              <Input value={targetUsername} onChange={(e: any) => setTargetUsername(e.target.value)} placeholder="Enter username (e.g. ra2311003010xxx)" />
              <button onClick={handleLogoutUser} disabled={adminLoading || !targetUsername.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: targetUsername.trim() ? "linear-gradient(135deg, rgba(167,139,250,0.25), rgba(139,92,246,0.3))" : "rgba(255,255,255,0.04)",
                  border: targetUsername.trim() ? "1px solid rgba(167,139,250,0.4)" : "1px solid rgba(255,255,255,0.06)",
                  color: targetUsername.trim() ? "#c4b5fd" : "#71717a",
                }}>
                <UserX2 className="w-3.5 h-3.5" />
                Invalidate User Session
              </button>
            </div>
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
        <SectionHeader label="User Reports" title="Feedback & Bug Reports" count={feedback.length} color="#fbbf24" icon={MessageSquareText} />
        {feedback.length > 0 ? (
          <div className="space-y-3 max-h-96 lg:max-h-[540px] overflow-y-auto pr-1">
            {feedback.map((entry: any) => {
              const ratingColor = ["#f87171", "#fb923c", "#fbbf24", "#34d399", "#22d3ee"][entry.rating - 1] || "#a1a1aa"
              const ratingLabel = ["Angry", "Frustrated", "Neutral", "Happy", "Love it"][entry.rating - 1] || ""
              return (
                <div
                  key={entry.id}
                  className="flex items-start gap-3.5 p-4 rounded-2xl transition-colors hover:bg-white/[0.03]"
                  style={{
                    background: "rgba(18,24,38,0.6)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold font-mono shadow-md"
                    style={{ background: `${ratingColor}18`, border: `1px solid ${ratingColor}33`, color: ratingColor }}
                  >
                    {entry.rating}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-bold text-zinc-100">{entry.name || "Anonymous Student"}</span>
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: `${ratingColor}15`, border: `1px solid ${ratingColor}30`, color: ratingColor }}>{ratingLabel}</span>
                      <span className="text-[10px] font-mono text-zinc-500">{new Date(entry.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">{entry.message}</p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/[0.04] text-zinc-400 border border-white/5">{entry.category || "GENERAL"}</span>
                      {entry.email && <span className="text-[10px] font-mono text-zinc-400">{entry.email}</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-zinc-500 text-center py-8 font-mono">No feedback submitted yet</p>
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
        <StatCard icon={Wrench} label="Total payments" value={payments.length} color="#34d399" subtitle="Successful orders" />
        <StatCard icon={Wrench} label="Total collected" value={`₹${total}`} color="#38bdf8" subtitle="Net support funds" />
      </div>
      <Card>
        <SectionHeader label="Transactions" title="Support Payments" count={payments.length} color="#34d399" icon={Wrench} />
        {payments.length > 0 ? (
          <div className="space-y-2.5 max-h-96 lg:max-h-[540px] overflow-y-auto pr-1">
            {payments.map((entry: any) => (
              <div
                key={entry.id}
                className="flex items-start gap-3.5 p-4 rounded-2xl transition-colors hover:bg-white/[0.03]"
                style={{
                  background: "rgba(18,24,38,0.6)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold font-mono bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                  ₹
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap mb-1">
                    <span className="text-base font-bold text-white font-mono tracking-tight">₹{entry.amount}</span>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">{entry.status}</span>
                    <span className="text-[10px] font-mono text-zinc-500">{new Date(entry.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap mt-1">
                    <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded">ID: {entry.payment_id}</span>
                    <span className="text-[10px] font-mono text-zinc-500">Order: {entry.order_id}</span>
                    {entry.message && <span className="text-xs text-zinc-300 italic">"{entry.message}"</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500 text-center py-8 font-mono">No payments received yet</p>
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
    <div className="space-y-6">
      <Card>
        <SectionHeader label="Provider" title="AI Provider Health" color="#f472b6" icon={Key} />
        <div className="flex items-center gap-3">
          <button onClick={check} disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            style={{
              background: "linear-gradient(135deg, rgba(244,114,182,0.2), rgba(236,72,153,0.15))",
              border: "1px solid rgba(244,114,182,0.35)",
              color: "#f472b6",
            }}>
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
            {loading ? "Verifying..." : "Ping Provider Keys"}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl flex items-center gap-2 text-xs font-mono" style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", color: "#fda4af" }}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </Card>

      {data && (
        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between mb-3">
              <p className="text-zinc-400 font-mono font-bold text-[10px] uppercase tracking-[0.14em]">Primary AI Provider · Mistral</p>
              <p className="text-[10px] font-mono text-zinc-500">Model: {data.config?.mistral_model || "default"}</p>
            </div>
            <div className="space-y-2">
              {data.mistral?.length > 0 ? data.mistral.map((k: any, i: number) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{
                    background: "rgba(18,24,38,0.6)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}>
                  <div>
                    <p className="text-xs font-semibold text-zinc-200 font-mono">{k.key}</p>
                    {k.error && <p className="text-[10px] text-rose-400 mt-0.5 font-mono">{k.statusCode}: {k.error}</p>}
                  </div>
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${k.status === "working" ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/25" : "text-rose-400 bg-rose-500/10 border border-rose-500/25"}`}>
                    {k.status}
                  </span>
                </div>
              )) : <p className="text-xs text-zinc-500 font-mono py-2">No keys configured</p>}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-3">
              <p className="text-zinc-400 font-mono font-bold text-[10px] uppercase tracking-[0.14em]">Backup AI Provider · NVIDIA NIM</p>
              <p className="text-[10px] font-mono text-zinc-500">Model: {data.config?.nvidia_model || "default"}</p>
            </div>
            <div className="space-y-2">
              {data.nvidia?.length > 0 ? data.nvidia.map((k: any, i: number) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{
                    background: "rgba(18,24,38,0.6)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}>
                  <div>
                    <p className="text-xs font-semibold text-zinc-200 font-mono">{k.key}</p>
                    {k.error && <p className="text-[10px] text-rose-400 mt-0.5 font-mono">{k.statusCode}: {k.error}</p>}
                  </div>
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${k.status === "working" ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/25" : "text-rose-400 bg-rose-500/10 border border-rose-500/25"}`}>
                    {k.status}
                  </span>
                </div>
              )) : <p className="text-xs text-zinc-500 font-mono py-2">No keys configured</p>}
            </div>
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
    disabledPages, mobileAppSettings, feedback, setMaintenanceMode,
    addAnnouncement, deleteAnnouncement,
    addDisabledPage, removeDisabledPage,
    updateMobileAppSettings,
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
                {activeTab === "mobile-app" && (
                  <MobileAppSettingsTab
                    mobileAppSettings={mobileAppSettings}
                    updateMobileAppSettings={updateMobileAppSettings}
                    adminLoading={adminLoading}
                  />
                )}
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
