"use client"

import { motion } from "framer-motion"
import {
  Bug,
  CheckCircle2,
  Info,
  RefreshCw,
  Sparkles,
} from "lucide-react"
import { useAdminControl } from "@/lib/admin-control"
import { useAuth } from "@/lib/auth-context"
import { AIPromoBadge } from "@/components/ai-promo-badge"

const toneStyles = {
  bug: { color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)", icon: Bug },
  fix: { color: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.2)", icon: CheckCircle2 },
  update: { color: "#22d3ee", bg: "rgba(34,211,238,0.08)", border: "rgba(34,211,238,0.2)", icon: Sparkles },
  info: { color: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.2)", icon: Info },
}

type TabType = "dashboard" | "timetable" | "attendance" | "courses" | "marks" | "calendar" | "gradex" | "about" | "planner" | "notes" | "updates"

interface UpdatesSectionProps {
  onNavigate?: (tab: TabType) => void
}

export function UpdatesSection({ onNavigate }: UpdatesSectionProps) {
  const { announcements } = useAdminControl()
  const { isLoading, refreshData } = useAuth()

  const typeLabel: Record<string, string> = {
    bug: "Bug Report",
    fix: "Bug Fix",
    update: "Update",
    info: "Info",
  }

  return (
    <div className="min-h-full pt-[3.75rem] pb-20 px-3 sm:px-4 lg:px-8 lg:pb-8 w-full">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-1">Release Notes</h2>
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight font-display">Updates</h1>
        </div>
        <div className="flex items-center gap-2">
          <AIPromoBadge page="updates" />
          <button onClick={refreshData} disabled={isLoading}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-zinc-500 bg-zinc-900/60 ring-1 ring-white/5 hover:text-zinc-300 transition-all disabled:opacity-40">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900/60 ring-1 ring-white/5 rounded-2xl p-4 flex items-center justify-between mb-6"
      >
        <p className="text-xs text-zinc-400 font-medium">
          Found a bug?{" "}
          <button onClick={() => onNavigate?.("feedback")} className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors bg-none border-none cursor-pointer p-0 text-xs">
            Let us know
          </button>
        </p>
      </motion.div>

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/60 ring-1 ring-white/5 rounded-2xl p-8 text-center"
          >
            <p className="text-sm font-semibold text-zinc-400">No announcements yet</p>
          </motion.div>
        ) : (
          announcements.map((item, i) => {
            const tone = toneStyles[item.type] || toneStyles.info
            const Icon = tone.icon
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.025 }}
                className="group bg-zinc-900/40 ring-1 ring-white/5 rounded-2xl p-5 hover:ring-zinc-700 hover:bg-zinc-900/60 transition-all relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex items-start gap-4 relative z-10">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${tone.color}18` }}>
                    <Icon className="w-4 h-4" style={{ color: tone.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md" style={{ color: tone.color, background: `${tone.color}12`, border: `1px solid ${tone.border}` }}>
                        {typeLabel[item.type] || item.type}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-medium">{item.date}</span>
                    </div>
                    <p className="text-sm font-bold text-zinc-200 mt-2">{item.title}</p>
                    <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{item.body}</p>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
