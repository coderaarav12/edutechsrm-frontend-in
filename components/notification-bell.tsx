"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, X, CheckCheck, Trash2, AlertTriangle, Calendar, BarChart3 } from "lucide-react"
import { useNotifications, type Notification, type NotifType } from "./notifications-provider"

function timeAgo(ms: number) {
  const diff = Date.now() - ms
  if (diff < 60_000)     return "just now"
  if (diff < 3_600_000)  return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  return `${Math.floor(diff / 86_400_000)}d ago`
}

const TYPE_META: Record<NotifType, { color: string; bg: string; Icon: any }> = {
  attendance: { color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20", Icon: AlertTriangle },
  holiday:    { color: "text-green-400",  bg: "bg-green-400/10 border-green-400/20",   Icon: Calendar     },
  marks:      { color: "text-primary",    bg: "bg-primary/10 border-primary/20",        Icon: BarChart3    },
}

function NotifRow({ n, onRead }: { n: Notification; onRead: (id: string) => void }) {
  const meta = TYPE_META[n.type]
  return (
    <button
      onClick={() => onRead(n.id)}
      className={`w-full text-left flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-white/5 border-b border-border/10 last:border-0 ${n.read ? "opacity-40" : ""}`}
    >
      <div className={`mt-0.5 w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${meta.bg}`}>
        <meta.Icon className={`w-4 h-4 ${meta.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <p className={`text-xs font-semibold leading-snug ${n.read ? "text-muted-foreground" : "text-foreground"}`}>
            {n.title}
          </p>
          {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />}
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{n.body}</p>
        <p className="text-[10px] text-muted-foreground/40 mt-1.5">{timeAgo(n.timestamp)}</p>
      </div>
    </button>
  )
}

export function NotificationBell() {
  const { unreadCount, notifications, markAllRead, markRead, clearAll } = useNotifications()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  return (
    <div className="relative" ref={wrapRef}>
      {/* Bell button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen(o => !o)}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl glass border border-border/40 hover:border-primary/40 transition-colors"
        aria-label="Notifications"
      >
        <Bell className={`w-4 h-4 ${unreadCount > 0 ? "text-primary" : "text-muted-foreground"}`} />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key={unreadCount}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-background text-[9px] font-black flex items-center justify-center shadow-lg"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Panel — fixed on mobile so it doesn't overflow */}
      <AnimatePresence>
        {open && (
          <>
            {/* Mobile backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 sm:hidden"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className={`
                z-50 flex flex-col overflow-hidden
                rounded-2xl border border-border/40 shadow-2xl shadow-black/60
                bg-background/95
                fixed left-3 right-3 top-[72px]
                sm:absolute sm:left-auto sm:right-0 sm:top-11 sm:w-[320px] sm:inset-x-auto
              `}
              style={{ maxHeight: "min(460px, calc(100vh - 100px))" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/20 shrink-0">
                <div className="flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-primary" />
                  <span className="text-sm font-bold">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-semibold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button onClick={markAllRead}
                      className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary px-2 py-1 rounded-lg hover:bg-white/5 transition-colors">
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Mark all read</span>
                    </button>
                  )}
                  <button onClick={() => setOpen(false)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:bg-white/5 transition-colors ml-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Notification list */}
              <div className="flex-1 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-secondary/40 flex items-center justify-center mb-3">
                      <Bell className="w-6 h-6 text-muted-foreground/30" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground/60">No notifications yet</p>
                    <p className="text-[11px] text-muted-foreground/40 mt-1">They'll appear here once your data syncs</p>
                  </div>
                ) : (
                  notifications.map(n => <NotifRow key={n.id} n={n} onRead={markRead} />)
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="shrink-0 border-t border-border/20 px-4 py-2.5 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground/40">{notifications.length} total</span>
                  <button onClick={clearAll}
                    className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3 h-3" />Clear all
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
