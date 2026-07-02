"use client"

import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LogIn, MapPin, User, RefreshCw, BookMarked, Moon } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { LoginModal } from "./login-modal"
import { AIPromoBadge } from "@/components/ai-promo-badge"

const TIME_SLOTS = [
  { hour: 1,  time: "08:00 - 08:50", short: "8:00"  },
  { hour: 2,  time: "08:50 - 09:40", short: "8:50"  },
  { hour: 3,  time: "09:45 - 10:35", short: "9:45"  },
  { hour: 4,  time: "10:40 - 11:30", short: "10:40" },
  { hour: 5,  time: "11:35 - 12:25", short: "11:35" },
  { hour: 6,  time: "12:30 - 01:20", short: "12:30" },
  { hour: 7,  time: "01:25 - 02:15", short: "1:25"  },
  { hour: 8,  time: "02:20 - 03:10", short: "2:20"  },
  { hour: 9,  time: "03:10 - 04:00", short: "3:10"  },
  { hour: 10, time: "04:00 - 04:50", short: "4:00"  },
  { hour: 11, time: "04:50 - 05:30", short: "4:50"  },
  { hour: 12, time: "05:30 - 06:10", short: "5:30"  },
]

const DO_COLORS = ["#34d399", "#38bdf8", "#a78bfa", "#f97316", "#f59e0b"]

function getTypeStyle(type: string) {
  const t = type?.toLowerCase() || ""
  if (t.includes("lab based")) return { color: "#a78bfa", bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.25)" }
  if (t.includes("lab") || t.includes("practical")) return { color: "#34d399", bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.25)" }
  if (t.includes("theory")) return { color: "#60a5fa", bg: "rgba(96,165,250,0.12)", border: "rgba(96,165,250,0.25)" }
  return { color: "#fbbf24", bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.25)" }
}

export function PlannerSection() {
  const { isAuthenticated, timetable, isLoading, refreshData } = useAuth() as any
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [selectedDO, setSelectedDO] = useState(1)

  const dayOrderTimetable = useMemo(() => {
    const map: Record<number, any[]> = {}
    timetable.forEach((slot: any) => {
      const do_ = slot.day_order
      if (!do_) return
      if (!map[do_]) map[do_] = []
      const existing = map[do_].find((s: any) => s.hour === slot.hour && s.code === slot.code)
      if (!existing) map[do_].push(slot)
    })
    Object.keys(map).forEach((k) => map[Number(k)].sort((a: any, b: any) => a.hour - b.hour))
    return map
  }, [timetable])

  const totalClasses = useMemo(() => Object.values(dayOrderTimetable).reduce((sum, slots) => sum + slots.length, 0), [dayOrderTimetable])

  if (!isAuthenticated) {
    return (
      <div className="min-h-full pt-[3.75rem] pb-20 px-3 sm:px-4 lg:px-8 lg:pb-8 w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-zinc-900/60 ring-1 ring-white/5 flex items-center justify-center">
            <BookMarked className="w-7 h-7 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-black mb-4 text-zinc-100">Connect to View Planner</h2>
          <p className="text-sm mb-8 max-w-xs mx-auto px-4 text-zinc-500">
            Login to see your full day order timetable — all 5 day orders in one place.
          </p>
          <motion.button whileTap={{ scale: 0.96 }} onClick={() => setIsLoginOpen(true)} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-emerald-400 text-zinc-950">
            <LogIn className="w-[18px] h-[18px]" /> Connect to SRM Academia
          </motion.button>
        </motion.div>
        <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      </div>
    )
  }

  const dayOrders = [1, 2, 3, 4, 5]
  const classes = dayOrderTimetable[selectedDO] || []
  const activeColor = DO_COLORS[selectedDO - 1]

  return (
    <div className="min-h-full pt-[3.75rem] pb-20 px-3 sm:px-4 lg:px-8 lg:pb-8 w-full">
      <div className="flex justify-between items-start mb-8">
        <div>
          <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-1">All Day Orders</p>
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight font-display">Day Order Planner</h1>
          <p className="text-xs mt-1 text-zinc-500">{totalClasses} classes across 5 day orders</p>
        </div>
        <div className="flex items-center gap-2">
          <AIPromoBadge page="planner" />
          <motion.button whileTap={{ scale: 0.9 }} onClick={refreshData} disabled={isLoading}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-zinc-500 bg-zinc-900/60 ring-1 ring-white/5 hover:text-zinc-300 transition-all disabled:opacity-40">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </motion.button>
        </div>
      </div>

      {/* Day Order Tabs */}
      <div className="flex bg-zinc-900 rounded-xl p-1 border border-white/5 shadow-inner mb-8">
        {dayOrders.map((do_, i) => {
          const isActive = selectedDO === do_
          const classCount = (dayOrderTimetable[do_] || []).length
          return (
            <motion.button
              key={do_}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedDO(do_)}
              className={`flex-1 min-w-[60px] flex flex-col items-center justify-center py-3 px-2 rounded-lg transition-all ${isActive ? "bg-zinc-800 text-zinc-100 shadow-md border border-white/5" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              <span className={`text-[10px] font-black uppercase tracking-wider ${isActive ? "text-zinc-100" : "text-zinc-500"}`}>
                DO {do_}
              </span>
              <span className={`text-[9px] mt-0.5 ${isActive ? "text-zinc-400" : "text-zinc-700"}`}>
                {classCount} class{classCount !== 1 ? "es" : ""}
              </span>
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedDO}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.15 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-lg font-bold text-zinc-100">Day Order {selectedDO}</h2>
            {classes.length > 0 && (
              <span className="text-xs text-zinc-500">
                {classes.length} class{classes.length > 1 ? "es" : ""}
              </span>
            )}
          </div>

          {classes.length === 0 ? (
            <div className="bg-zinc-900/60 ring-1 ring-white/5 rounded-3xl p-8 overflow-hidden relative text-center py-12">
              <Moon className="w-10 h-10 mx-auto mb-3 text-zinc-600" />
              <p className="text-sm font-semibold text-zinc-500">No classes</p>
            </div>
          ) : (
            <div className="space-y-4">
              {classes.map((c: any, ci: number) => {
                const timeSlot = TIME_SLOTS.find(s => s.hour === c.hour)
                const ts = getTypeStyle(c.type)
                return (
                  <motion.div
                    key={`${selectedDO}-${c.hour}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: ci * 0.05 }}
                    className="group bg-zinc-900/40 ring-1 ring-white/5 rounded-2xl p-6 hover:ring-zinc-700 hover:bg-zinc-900/60 transition-all relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="flex gap-3 relative z-10">
                      <div className="w-1 self-stretch rounded-full shrink-0" style={{ background: ts.color, boxShadow: `0 0 6px ${ts.color}80` }} />
                      <div className="shrink-0 flex flex-col items-end justify-center w-12 gap-0.5">
                        <span className="text-xs font-black tabular-nums text-zinc-400">
                          {timeSlot?.time?.split(" - ")[0] || c.time?.split(" - ")[0]}
                        </span>
                        <span className="text-[10px] tabular-nums text-zinc-600">
                          {timeSlot?.time?.split(" - ")[1] || c.time?.split(" - ")[1]}
                        </span>
                        <span className="text-[9px] text-zinc-700">Hr {c.hour}</span>
                      </div>
                      <div className="w-px self-stretch shrink-0 bg-white/5" />
                      <div className="flex-1 min-w-0 py-0.5">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="text-[10px] font-mono text-emerald-400">{c.code}</span>
                          {c.room && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0" style={{ background: `${activeColor}15`, color: activeColor, border: `1px solid ${activeColor}25` }}>
                              {c.room}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold leading-snug text-zinc-100 mb-1.5">{c.name}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-zinc-500 text-[10px]">
                          {c.faculty && (
                            <span className="flex items-center gap-0.5 truncate max-w-[130px]">
                              <User className="w-[10px] h-[10px] shrink-0" />{c.faculty}
                            </span>
                          )}
                          {c.slot && (
                            <span className="text-zinc-700">Slot {c.slot}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  )
}
