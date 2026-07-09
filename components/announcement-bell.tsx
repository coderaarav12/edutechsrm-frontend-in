"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Bell } from "lucide-react"
import { DEFAULT_ANNOUNCEMENTS } from "./announcements"
import { useAdminControl } from "@/lib/admin-control"

function storageKeyFor(latestId: number) {
  return `edutechsrm_read_anns_v${latestId}`
}

function getReadIds(storageKey: string): number[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(storageKey) || "[]") } catch { return [] }
}
function saveReadIds(storageKey: string, ids: number[]) {
  try { localStorage.setItem(storageKey, JSON.stringify(ids)) } catch {}
}

export function AnnouncementBell({ onNavigate }: { onNavigate?: (tab: any) => void }) {
  const { announcements } = useAdminControl()
  const latestId = Math.max(...(announcements.length > 0 ? announcements : DEFAULT_ANNOUNCEMENTS).map(a => a.id), 0)
  const storageKey = storageKeyFor(latestId)
  const [readIds, setReadIds] = useState<number[]>(() => {
    if (typeof window === "undefined") return []
    return getReadIds(storageKeyFor(Math.max(...DEFAULT_ANNOUNCEMENTS.map(a => a.id), 0)))
  })

  useEffect(() => {
    setReadIds(getReadIds(storageKey))
  }, [storageKey])

  useEffect(() => {
    const allIds = announcements.map(a => a.id)
    setReadIds(allIds)
    saveReadIds(storageKey, allIds)
  }, [announcements, storageKey])

  const unread = announcements.length > 0 ? announcements.filter(a => !readIds.includes(a.id)).length : 0

  return (
    <motion.button
      whileTap={{ scale: 0.88 }}
      onClick={() => onNavigate?.("updates")}
      className="flex items-center justify-center rounded-xl transition-all cursor-pointer"
      style={{
        width: 32, height: 32,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.05)",
        color: "#71717a",
        WebkitTapHighlightColor: "transparent",
      }}
      onMouseEnter={e => e.currentTarget.style.color = "#d4d4d8"}
      onMouseLeave={e => e.currentTarget.style.color = "#71717a"}
    >
      <Bell style={{ width: 14, height: 14 }} />
      {unread > 0 && (
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
          style={{ background: "#34d399" }}
        />
      )}
    </motion.button>
  )
}
