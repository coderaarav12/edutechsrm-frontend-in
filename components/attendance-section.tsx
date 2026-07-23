"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { RefreshCw, TrendingUp, TrendingDown, AlertTriangle,
  LogIn, BarChart3, ChevronDown, Award, Target,
} from "lucide-react"
import { AIPromoBadge } from "@/components/ai-promo-badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { LoginModal } from "./login-modal"
import { useCustomPlanner } from "@/lib/custom-planner"

type TabType = "about"

interface AttendanceSectionProps {
  onNavigate?: (tab: TabType) => void
}

export function AttendanceSection({ onNavigate }: AttendanceSectionProps) {
  const { isAuthenticated, attendance, isLoading, refreshData, user, timetable = [], dateToDoMap = {}, courses = [], calendar = [] } = useAuth() as any
  const { odMlEntries } = useCustomPlanner()
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [filter, setFilter] = useState<"all" | "safe" | "risk">("all")
  const [expandedCode, setExpandedCode] = useState<string | null>(null)
  const [attendanceMode, setAttendanceMode] = useState<"base" | "with_od_ml">("base")
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])
  const goalPercentage = 75

  const toDate = (value: string) => new Date(`${value}T00:00:00`)
  const normalizeCat = (v: string) => {
    const t = String(v || "").toLowerCase().trim()
    if (t.includes("lab")) return "Practical"
    if (t === "practical" || t === "theory") return t[0].toUpperCase() + t.slice(1)
    return v
  }
  const isNormalPractical = (typeValue: string) => {
    const t = String(typeValue || "").toLowerCase().trim()
    if (!t) return false
    if (t.includes("lab based")) return false
    return t === "practical" || t === "lab"
  }

  const attendanceWithAdjustments = useMemo(() => {
    if (!attendance?.length) return attendance
    if (!odMlEntries?.length) return attendance

    const courseTypeByCode = new Map<string, string>()
    ;(courses as any[]).forEach((course) => {
      if (course?.code) courseTypeByCode.set(String(course.code), String(course.type || ""))
    })

    const dayOrderSlots = new Map<number, any[]>()
    ;(timetable as any[]).forEach((slot) => {
      const dayOrder = Number(slot?.day_order)
      if (!dayOrder) return
      if (!dayOrderSlots.has(dayOrder)) dayOrderSlots.set(dayOrder, [])
      dayOrderSlots.get(dayOrder)!.push(slot)
    })

    const holidayByDate = new Set<string>()
    ;(calendar as any[]).forEach((item) => {
      if (item?.type === "holiday" && item?.date) holidayByDate.add(String(item.date))
    })

    const bonusByCode = new Map<string, number>()
    const seenSessionKeys = new Set<string>()

    ;(odMlEntries as any[]).forEach((entry) => {
      if (!entry?.startDate || !entry?.endDate) return
      const start = toDate(entry.startDate)
      const end = toDate(entry.endDate)
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return

      Object.entries(dateToDoMap as Record<string, number>).forEach(([date, dayOrder]) => {
        if (!dayOrder) return
        const d = toDate(date)
        if (d < start || d > end) return
        if (holidayByDate.has(date) && !(dateToDoMap as Record<string, number>)[date]) return

        const slots = dayOrderSlots.get(Number(dayOrder)) || []
        slots.forEach((slot) => {
          const code = String(slot?.code || "")
          if (!code) return

          const courseType = courseTypeByCode.get(code) || String(slot?.type || "")
          if (entry.type === "od" && isNormalPractical(courseType)) return

          const hour = String(slot?.hour || "0")
          const key = `${entry.type}:${date}:${code}:${hour}`
          if (seenSessionKeys.has(key)) return
          seenSessionKeys.add(key)

          bonusByCode.set(code, (bonusByCode.get(code) || 0) + 1)
        })
      })
    })

    return attendance.map((record: any) => {
      const bonus = bonusByCode.get(String(record.code)) || 0
      if (!bonus) return record
      const attended = Number(record.attended || 0) + bonus
      const total = Number(record.total || 0) + bonus
      const percentage = total > 0 ? Math.round((attended / total) * 100) : 0
      return { ...record, attended, total, percentage }
    })
  }, [attendance, odMlEntries, courses, timetable, dateToDoMap, calendar])

  const activeAttendance = attendanceMode === "with_od_ml" ? attendanceWithAdjustments : attendance

  const mergedAttendance = useMemo(() => {
    const attGrouped = new Map<string, any[]>()
    ;(activeAttendance || []).forEach((r: any) => {
      const list = attGrouped.get(r.code) || []
      list.push(r)
      attGrouped.set(r.code, list)
    })
    const courseByCode = new Map<string, any[]>()
    ;(courses as any[]).forEach((c: any) => {
      const list = courseByCode.get(c.code) || []
      list.push(c)
      courseByCode.set(c.code, list)
    })
    const codes = [...new Set((courses as any[]).map((c: any) => c.code))]
    const result: any[] = []
    codes.forEach(code => {
      const courseEntries = courseByCode.get(code) || []
      const names = [...new Set(courseEntries.map((c: any) => c.name?.trim()).filter(Boolean))]
      const name = names[0] || code
      const courseTypes = [...new Set(courseEntries.map((c: any) => normalizeCat(c.type)).filter(Boolean))]
      const attEntries = attGrouped.get(code) || []
      const attCategories = [...new Set(attEntries.map((r: any) => normalizeCat(r.category)).filter(Boolean))]
      const allCategories = [...new Set([...courseTypes, ...attCategories])]
      const allRecords = allCategories.map((t: string) => {
        const match = attEntries.find((r: any) => normalizeCat(r.category) === t)
        return match || { code, name, attended: 0, total: 0, percentage: 0, category: t, slot: courseEntries.find((c: any) => normalizeCat(c.type) === t)?.slot || "" }
      })
      const hasData = attEntries.some((r: any) => r.total > 0)
      if (hasData) {
        const attended = attEntries.reduce((s: number, r: any) => s + (r.attended || 0), 0)
        const total = attEntries.reduce((s: number, r: any) => s + (r.total || 0), 0)
        const percentage = total > 0 ? Math.round((attended / total) * 100) : 0
        result.push({ code, name, attended, total, percentage, category: allCategories.join(" + ") || "", slot: courseEntries[0]?.slot || attEntries[0]?.slot || "", hasData: true, records: allRecords })
      } else {
        result.push({ code, name, attended: 0, total: 0, percentage: 0, category: allCategories.join(" + ") || "", slot: courseEntries[0]?.slot || "", hasData: false, records: allRecords })
      }
    })
    attGrouped.forEach((entries, code) => {
      if (!codes.includes(code) && entries.some((r: any) => r.total > 0)) {
        const attended = entries.reduce((s: number, r: any) => s + (r.attended || 0), 0)
        const total = entries.reduce((s: number, r: any) => s + (r.total || 0), 0)
        const percentage = total > 0 ? Math.round((attended / total) * 100) : 0
        result.push({ code, name: entries[0].name || code, attended, total, percentage, category: entries[0].category || "", slot: entries[0].slot || "", hasData: true, records: entries })
      }
    })
    return result
  }, [activeAttendance, courses])

  const attendanceWithData = mergedAttendance.filter((r: any) => r.hasData && r.total > 0)
  const attendancePending = mergedAttendance.filter((r: any) => !r.hasData || r.total === 0)

  const getStatus = (pct: number) => {
    if (pct >= goalPercentage) return "safe"
    if (pct >= goalPercentage - 10) return "warning"
    return "danger"
  }

  const statusConfig = {
    safe:   { color: "#34d399", ring: "ring-emerald-500/20", bg: "bg-emerald-500/10", text: "text-emerald-400", label: "On Track" },
    warning:{ color: "#fbbf24", ring: "ring-amber-500/20",  bg: "bg-amber-500/10",   text: "text-amber-400",  label: "Borderline" },
    danger: { color: "#f87171", ring: "ring-red-500/20",    bg: "bg-red-500/10",     text: "text-red-400",    label: "At Risk" },
  }

  const classesNeeded = (attended: number, total: number) => {
    if (total === 0) return 0
    if ((attended / total) * 100 >= goalPercentage) return 0
    let needed = 0, na = attended, nt = total
    while ((na / nt) * 100 < goalPercentage) { na++; nt++; needed++; if (needed > 100) break }
    return needed
  }

  const canSkip = (attended: number, total: number) => {
    if (total === 0) return 0
    let skippable = 0, nt = total
    while ((attended / (nt + 1)) * 100 >= goalPercentage) { nt++; skippable++; if (skippable > 50) break }
    return skippable
  }

  const overallAttended = attendanceWithData.reduce((s: number, r: any) => s + r.attended, 0)
  const overallTotal = attendanceWithData.reduce((s: number, r: any) => s + r.total, 0)
  const overallPercentage = overallTotal > 0 ? Math.round((overallAttended / overallTotal) * 100) : 0
  const safeCount = attendanceWithData.filter((r: any) => getStatus(r.percentage) === "safe").length
  const atRiskSubjects = attendanceWithData.filter((r: any) => getStatus(r.percentage) !== "safe")

  const filteredAttendance = mergedAttendance.filter((r: any) => {
    if (!r.hasData || r.total === 0) return false
    if (filter === "all") return true
    if (filter === "safe") return getStatus(r.percentage) === "safe"
    return getStatus(r.percentage) !== "safe"
  })

  const overallStatus = overallPercentage >= 75 ? "emerald" : overallPercentage >= 65 ? "amber" : "red"

  if (!isAuthenticated) {
    return (
      <div className="min-h-full pt-24 pb-12 px-4 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
            <BarChart3 className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold text-zinc-100 tracking-tight mb-4">Track Attendance</h2>
          <p className="text-zinc-500 max-w-md mx-auto mb-8 text-sm">
            Login with your SRM Academia credentials to sync your attendance data.
          </p>
          <Button size="lg" onClick={() => setIsLoginOpen(true)}
            className="bg-emerald-500 text-zinc-900 hover:bg-emerald-400 font-bold text-sm px-8 py-6 rounded-xl">
            <LogIn className="w-5 h-5 mr-2" />Connect to SRM Academia
          </Button>
        </motion.div>
        <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      </div>
    )
  }

  return (
    <div className="min-h-full pt-[3.75rem] pb-20 px-3 sm:px-4 lg:px-8 lg:pb-8 w-full">

      {/* ── Header ── */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-1">Attendance Radar</p>
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight font-display">Attendance</h1>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            {user?.specialization || user?.program} · Sem {user?.semester} · {attendanceWithData.length} tracked{attendancePending.length > 0 ? ` · ${attendancePending.length} pending` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AIPromoBadge page="attendance" />
          <motion.button whileTap={{ scale: 0.9 }} onClick={refreshData} disabled={isLoading}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-zinc-500 bg-zinc-900/60 ring-1 ring-white/5 hover:text-zinc-300 transition-all disabled:opacity-40">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </motion.button>
        </div>
      </div>

      {/* ── Overall hero ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.03 }}
        className="flex bg-zinc-900/80 rounded-xl p-[3px] ring-1 ring-white/[0.04] mb-6">
        <button onClick={() => setAttendanceMode("base")}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all relative">
          {attendanceMode === "base" && <div className="absolute inset-0 rounded-lg" style={{ background: "rgba(52, 211, 153, 0.12)", border: "1px solid rgba(52, 211, 153, 0.2)" }} />}
          <Award size={12} className={`relative z-10 ${attendanceMode === "base" ? "text-emerald-400" : "text-zinc-600"}`} />
          <span className={`relative z-10 ${attendanceMode === "base" ? "text-emerald-300" : "text-zinc-500"}`}>Without OD/ML</span>
        </button>
        <button onClick={() => setAttendanceMode("with_od_ml")}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all relative">
          {attendanceMode === "with_od_ml" && <div className="absolute inset-0 rounded-lg" style={{ background: "rgba(52, 211, 153, 0.12)", border: "1px solid rgba(52, 211, 153, 0.2)" }} />}
          <Target size={12} className={`relative z-10 ${attendanceMode === "with_od_ml" ? "text-emerald-400" : "text-zinc-600"}`} />
          <span className={`relative z-10 ${attendanceMode === "with_od_ml" ? "text-emerald-300" : "text-zinc-500"}`}>With OD/ML</span>
        </button>
      </motion.div>

      {attendanceMode === "with_od_ml" && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <motion.button whileTap={{ scale: 0.98 }}
            onClick={() => {
              try {
                window.sessionStorage.setItem("edutechsrm_open_odml_from_attendance", "1")
              } catch {}
              window.history.replaceState(null, "", "#od-ml-planner")
              onNavigate?.("about")
            }}
            className="group relative w-full overflow-hidden rounded-2xl border border-emerald-500/20 bg-zinc-900/70 px-5 py-4 transition-all hover:border-emerald-400/35"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-emerald-400/5 to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
            <div className="relative flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-500/15 ring-1 ring-emerald-500/25 shrink-0">
                  <Target className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-widest text-emerald-300">OD / ML Planner</p>
                  <p className="text-[10px] text-zinc-500 truncate">Open and edit attendance leave ranges</p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/90 group-hover:text-emerald-300 shrink-0">Edit</span>
            </div>
          </motion.button>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-zinc-900/60 ring-1 ring-white/5 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-6">
          {/* Donut */}
          <div className="relative w-24 h-24 shrink-0">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 112 112">
              <circle cx="56" cy="56" r="46" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              <motion.circle cx="56" cy="56" r="46"
                fill="none" strokeWidth="8" strokeLinecap="round"
                stroke={overallStatus === "emerald" ? "#34d399" : overallStatus === "amber" ? "#fbbf24" : "#f87171"}
                strokeDasharray="289"
                initial={{ strokeDashoffset: 289 }}
                animate={{ strokeDashoffset: 289 - (289 * overallPercentage) / 100 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </svg>
            <span className={`absolute inset-0 flex items-center justify-center font-display font-bold text-xl ${
              overallStatus === "emerald" ? "text-emerald-400" : overallStatus === "amber" ? "text-amber-400" : "text-red-400"
            }`}>
              {overallPercentage}%
            </span>
          </div>

          {/* Stats */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start sm:items-center justify-between gap-2 mb-1">
              <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Overall Attendance</h3>
              <span className={`text-[10px] font-bold shrink-0 ${
                overallPercentage >= 75 ? "text-emerald-400" : "text-amber-400"
              }`}>
                {overallPercentage >= 75 ? "On Track" : "Needs Attention"}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mb-3">
              <span className="text-zinc-200 font-semibold">{overallAttended}</span> / {overallTotal} classes
            </p>
            <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden ring-1 ring-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallPercentage}%` }}
                transition={{ duration: 1.1, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  overallStatus === "emerald" ? "bg-gradient-to-r from-emerald-500 to-emerald-400" :
                  overallStatus === "amber" ? "bg-gradient-to-r from-amber-500 to-amber-400" :
                  "bg-gradient-to-r from-red-500 to-red-400"
                }`}
              />
            </div>
            <div className="flex gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-[10px] text-zinc-500">{safeCount} safe</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-[10px] text-zinc-500">{atRiskSubjects.length} at risk</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Filter tabs ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="flex bg-zinc-900 rounded-xl p-1 border border-white/5 mb-6 w-fit">
        {(["all", "safe", "risk"] as const).map((f) => (
          <motion.button key={f} whileTap={{ scale: 0.95 }} onClick={() => setFilter(f)}
            className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${
              filter === f
                ? "bg-zinc-800 text-zinc-100 shadow-md border border-white/5"
                : "font-medium text-zinc-500 hover:text-zinc-300"
            }`}>
              {f === "all" ? `All ${mergedAttendance.length}` : f === "safe" ? `Safe ${safeCount}` : `Risk ${atRiskSubjects.length}`}
          </motion.button>
        ))}
      </motion.div>

      {/* ── Subject cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredAttendance.map((record, idx) => {
          const status = getStatus(record.percentage)
          const cfg = statusConfig[status]
          const needed = classesNeeded(record.attended, record.total)
          const skippable = canSkip(record.attended, record.total)
          const isExpanded = expandedCode === record.code

          return (
            <motion.div key={`${record.code}___${record.slot || record.category || idx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className={`group bg-zinc-900/30 ring-1 rounded-xl transition-all cursor-pointer relative overflow-hidden ${
                isExpanded ? cfg.ring : "ring-white/5"
              }`}>

              {/* Mobile: clickable header */}
              {!isDesktop && (
                <button className="w-full p-4 text-left lg:hidden" onClick={() => setExpandedCode(isExpanded ? null : record.code)}>
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-9 rounded-full shrink-0" style={{ background: cfg.color }} />
                    <div className="flex-1 min-w-0">
                      <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-[0.1em] block">{record.code}</span>
                      <h4 className="font-semibold text-zinc-200 text-sm tracking-tight truncate">{record.name}</h4>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`font-display font-bold text-xl tracking-tighter ${cfg.text}`}>
                        {record.percentage}%
                      </span>
                      <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1 bg-zinc-950 rounded-full overflow-hidden ring-1 ring-white/5 mt-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${record.percentage}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.05, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: cfg.color }}
                    />
                  </div>

                  {/* Status badges row */}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${cfg.bg} ${cfg.text} ring-1 ${cfg.ring}`}>
                      {cfg.label}
                    </span>
                    {status === "safe" && skippable > 0 && (
                      <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-emerald-500/8 text-emerald-400 ring-1 ring-emerald-500/20">
                        <TrendingUp className="w-2.5 h-2.5" />Skip {skippable}
                      </span>
                    )}
                    {status !== "safe" && needed > 0 && (
                      <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-red-500/8 text-red-400 ring-1 ring-red-500/20">
                        <TrendingDown className="w-2.5 h-2.5" />Need {needed}
                      </span>
                    )}
                  </div>
                </button>
              )}

              {/* Desktop: always visible header */}
              {isDesktop && (
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-9 rounded-full shrink-0" style={{ background: cfg.color }} />
                    <div className="flex-1 min-w-0">
                      <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-[0.1em] block">{record.code}</span>
                      <h4 className="font-semibold text-zinc-200 text-sm tracking-tight truncate">{record.name}</h4>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`font-display font-bold text-xl tracking-tighter ${cfg.text}`}>
                        {record.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-1 bg-zinc-950 rounded-full overflow-hidden ring-1 ring-white/5 mt-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${record.percentage}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.05, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: cfg.color }}
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${cfg.bg} ${cfg.text} ring-1 ${cfg.ring}`}>
                      {cfg.label}
                    </span>
                    {status === "safe" && skippable > 0 && (
                      <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-emerald-500/8 text-emerald-400 ring-1 ring-emerald-500/20">
                        <TrendingUp className="w-2.5 h-2.5" />Skip {skippable}
                      </span>
                    )}
                    {status !== "safe" && needed > 0 && (
                      <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-red-500/8 text-red-400 ring-1 ring-red-500/20">
                        <TrendingDown className="w-2.5 h-2.5" />Need {needed}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Expanded content: always visible on desktop, accordion on mobile */}
              <div className={`${isDesktop ? "block" : isExpanded ? "block" : "hidden"}`}>
                <div className="border-t border-white/5 mx-0" />
                <div className="px-4 pb-4 pt-3 space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Attended", value: record.attended },
                      { label: "Total", value: record.total },
                      { label: "Category", value: record.category },
                    ].map((s, i) => (
                      <div key={i} className="rounded-lg px-3 py-2 bg-zinc-900/50 ring-1 ring-white/5">
                        <p className="text-zinc-500 text-[9px] uppercase font-bold tracking-[0.1em]">{s.label}</p>
                        <p className="text-xs font-bold text-zinc-200 mt-0.5 truncate">{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {record.records && record.records.length > 1 && (
                    <div className="space-y-1.5">
                      <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-[0.1em]">Breakdown</p>
                      {record.records.map((rr: any, ri: number) => {
                        const rp = rr.total > 0 ? Math.round((rr.attended / rr.total) * 100) : 0
                        const rc = rp >= 75 ? "#34d399" : rp >= 65 ? "#fbbf24" : "#f87171"
                        return (
                          <div key={ri} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-900/50 ring-1 ring-white/[0.04]">
                            <div className="w-0.5 h-4 rounded-full shrink-0" style={{ background: rc }} />
                            <span className="text-[11px] font-semibold text-zinc-300 flex-1 min-w-0 truncate">{normalizeCat(rr.category) || "?"}</span>
                            <span className="text-[11px] font-bold tabular-nums" style={{ color: rc }}>{rp}%</span>
                            <span className="text-[10px] text-zinc-500 font-mono tabular-nums">{rr.attended}/{rr.total}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {status === "safe" && skippable > 0 && (
                    <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-[10px] bg-emerald-500/5 ring-1 ring-emerald-500/20 text-emerald-400">
                      <TrendingUp className="w-3 h-3 shrink-0" />
                      <span>Skip <strong>{skippable}</strong> more and stay safe</span>
                    </div>
                  )}
                  {status === "safe" && skippable === 0 && (
                    <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-[10px] bg-amber-500/5 ring-1 ring-amber-500/20 text-amber-400">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>Borderline — don't miss any more classes</span>
                    </div>
                  )}
                  {status !== "safe" && needed > 0 && (
                    <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-[10px] bg-red-500/5 ring-1 ring-red-500/20 text-red-400">
                      <TrendingDown className="w-3 h-3 shrink-0" />
                      <span>Attend <strong>{needed}</strong> more to reach 75%</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Pending attendance cards */}
      {attendancePending.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-zinc-600" />
            <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Attendance data pending</h3>
            <span className="text-zinc-600 text-[10px]">({attendancePending.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {attendancePending.map((record, idx) => (
              <motion.div key={`pending-${record.code}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="bg-zinc-900/20 ring-1 ring-white/[0.04] rounded-xl p-4 opacity-60"
              >
                <div className="flex items-center gap-3">
                  <div className="w-1 h-9 rounded-full shrink-0 bg-zinc-700" />
                  <div className="flex-1 min-w-0">
                    <span className="text-zinc-600 text-[10px] uppercase font-bold tracking-[0.1em] block">{record.code}</span>
                    <h4 className="font-semibold text-zinc-500 text-sm tracking-tight truncate">{record.name}</h4>
                  </div>
                </div>
                <p className="text-zinc-600 text-[10px] mt-3">Awaiting attendance data from SRM</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {filteredAttendance.length === 0 && attendancePending.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <p className="text-zinc-500 text-sm">No subjects matching filter</p>
        </motion.div>
      )}
      {filteredAttendance.length === 0 && attendancePending.length > 0 && filter !== "all" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
          <p className="text-zinc-500 text-sm">No subjects matching filter</p>
        </motion.div>
      )}
    </div>
  )
}
