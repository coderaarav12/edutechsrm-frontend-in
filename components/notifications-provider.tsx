"use client"

import {
  createContext, useContext, useEffect, useState, useCallback, useRef,
} from "react"
import { useAuth } from "@/lib/auth-context"

export type NotifType = "attendance" | "holiday" | "marks"

export interface Notification {
  id:        string
  type:      NotifType
  title:     string
  body:      string
  timestamp: number
  read:      boolean
}

interface NotifCtx {
  notifications: Notification[]
  unreadCount:   number
  markAllRead:   () => void
  markRead:      (id: string) => void
  clearAll:      () => void
}

const Ctx = createContext<NotifCtx>({
  notifications: [],
  unreadCount:   0,
  markAllRead:   () => {},
  markRead:      () => {},
  clearAll:      () => {},
})

export const useNotifications = () => useContext(Ctx)

const STORAGE_KEY = "edutechsrm_notifs_v3"

const lsGet = (): Notification[] => {
  try { return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]") } catch { return [] }
}
const lsSet = (n: Notification[]) => {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(n.slice(0, 60))) } catch {}
}

function fmtDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`
}

function NotificationsProviderInner({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, attendance, marks, calendar } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>(() => lsGet())
  // track which IDs we've already inserted so we never duplicate
  const seenIds = useRef<Set<string>>(new Set(lsGet().map(n => n.id)))

  const upsert = useCallback((n: Omit<Notification, "read">) => {
    if (seenIds.current.has(n.id)) return
    seenIds.current.add(n.id)
    setNotifications(prev => {
      const next = [{ ...n, read: false }, ...prev].slice(0, 60)
      lsSet(next)
      return next
    })
  }, [])

  // Re-run whenever attendance/marks/calendar change — handles delayed data loads
  useEffect(() => {
    if (!isAuthenticated) return

    const now = Date.now()
    const todayStr = fmtDate(new Date())

    // ── Low attendance warnings ──
    ;(attendance as any[]).filter(a => a.percentage < 75).forEach(a => {
      upsert({
        id:        `att-${a.code}-${todayStr}`,
        type:      "attendance",
        title:     "⚠️ Low Attendance",
        body:      `${a.name || a.code} is at ${Math.round(a.percentage)}% — below the 75% requirement.`,
        timestamp: now,
      })
    })

    // ── Upcoming holidays (next 7 days) ──
    const next7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() + i + 1); return fmtDate(d)
    })
    ;(calendar as any[])
      .filter(e => next7.includes(e.date) && (e.type === "holiday" || e.title?.toLowerCase().includes("holiday")))
      .forEach((h, i) => {
        upsert({
          id:        `holiday-${h.date}`,
          type:      "holiday",
          title:     "🎉 Upcoming Holiday",
          body:      `${h.title?.replace(/ - Holiday$/i, "").trim()} on ${new Date(h.date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}.`,
          timestamp: now - (i + 1) * 60000,
        })
      })

    // ── Low marks ──
    const low = (marks as any[]).filter(m => m.maxTotal > 0 && m.total / m.maxTotal < 0.5)
    if (low.length > 0) {
      upsert({
        id:        `marks-low-${todayStr}`,
        type:      "marks",
        title:     "📊 Low Marks Alert",
        body:      `You scored below 50% in ${low.length} assessment${low.length > 1 ? "s" : ""}. Check the Marks tab for details.`,
        timestamp: now - 120000,
      })
    }

    // ── Marks synced ──
    if ((marks as any[]).length > 0) {
      upsert({
        id:        `marks-synced-${todayStr}`,
        type:      "marks",
        title:     "✅ Marks Synced",
        body:      `${(marks as any[]).length} assessments loaded successfully.`,
        timestamp: now - 180000,
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, attendance, marks, calendar])

  const markRead = useCallback((id: string) => {
    setNotifications(prev => {
      const n = prev.map(x => x.id === id ? { ...x, read: true } : x)
      lsSet(n); return n
    })
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications(prev => {
      const n = prev.map(x => ({ ...x, read: true }))
      lsSet(n); return n
    })
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
    lsSet([])
    seenIds.current.clear()
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <Ctx.Provider value={{ notifications, unreadCount, markAllRead, markRead, clearAll }}>
      {children}
    </Ctx.Provider>
  )
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return <>{children}</>
  return <NotificationsProviderInner>{children}</NotificationsProviderInner>
}
