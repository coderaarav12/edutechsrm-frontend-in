"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  LogIn,
  BarChart3,
  ChevronDown,
  Award,
  Target,
  ShieldCheck,
  CheckCircle,
} from "lucide-react"
import { AIPromoBadge } from "@/components/ai-promo-badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useTheme, useIsPosterTheme } from "@/lib/theme-context"
import { useStudentPortal } from "@/lib/student-portal-context"
import { LoginModal } from "./login-modal"
import { useCustomPlanner } from "@/lib/custom-planner"

type TabType = "about"

interface AttendanceSectionProps {
  onNavigate?: (tab: TabType) => void
}

export function AttendanceSection({ onNavigate }: AttendanceSectionProps) {
  const {
    isAuthenticated,
    attendance,
    isLoading,
    refreshData,
    user,
    timetable = [],
    dateToDoMap = {},
    courses = [],
  } = useAuth() as any
  const { portalData, syncPortalData, openPortalLogin, isSessionExpired, isSyncing } = useStudentPortal()
  const { odMlEntries } = useCustomPlanner()
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [attendanceSource, setAttendanceSource] = useState<"backend" | "portal">("backend")
  const [filter, setFilter] = useState<"all" | "safe" | "risk">("all")
  const [expandedCode, setExpandedCode] = useState<string | null>(null)
  const [attendanceMode, setAttendanceMode] = useState<"base" | "with_od_ml">("base")
  const [isDesktop, setIsDesktop] = useState(false)
  const isPoster = useIsPosterTheme()

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  // Load attendance source setting
  useEffect(() => {
    const loadSource = async () => {
      try {
        const response = await fetch("/api/mobile-app-settings", { cache: "no-store" })
        const data = (await response.json().catch(() => ({}))) as any
        const update = data?.settings?.update || {}
        setAttendanceSource(update.attendanceSource === "portal" ? "portal" : "backend")
      } catch {
        setAttendanceSource("backend")
      }
    }
    void loadSource()
  }, [])

  const goalPercentage = 75

  // Support both usual/primary backend and student portal scraper
  const effectiveAttendance = useMemo(() => {
    if (attendanceSource === "portal") {
      if (portalData?.attendance && portalData.attendance.length > 0) {
        return portalData.attendance
      }
    }
    if (Array.isArray(attendance) && attendance.length > 0) return attendance
    if (portalData?.attendance && portalData.attendance.length > 0) return portalData.attendance
    return []
  }, [attendanceSource, attendance, portalData?.attendance])

  const refreshAttendance = async () => {
    await Promise.allSettled([refreshData(), syncPortalData()])
  }

  const toDate = (value: string) => new Date(`${value}T00:00:00`)
  const catFromSlot = (slot: string | undefined) => {
    if (!slot) return "Extra"
    const c = slot.trim().charAt(0).toUpperCase()
    if (c >= "A" && c <= "G") return "Theory"
    if (c === "P") return "Practical"
    if (slot.toLowerCase() === "online") return "Online"
    return "Extra"
  }

  // Full OD / ML attendance adjustment logic
  const attendanceWithAdjustments = useMemo(() => {
    if (!effectiveAttendance?.length) return effectiveAttendance
    if (!odMlEntries?.length) return effectiveAttendance

    const dayOrderSlots = new Map<number, any[]>()
    ;(timetable as any[]).forEach((slot) => {
      const dayOrder = Number(slot?.day_order)
      if (!dayOrder) return
      if (!dayOrderSlots.has(dayOrder)) dayOrderSlots.set(dayOrder, [])
      const list = dayOrderSlots.get(dayOrder)!
      if (!list.find((s: any) => s.hour === slot.hour && s.code === slot.code)) list.push(slot)
    })

    const slotCat = new Map<string, string>()
    const codeCats = new Map<string, Set<string>>()
    ;(effectiveAttendance as any[]).forEach((a: any) => {
      if (!a?.category || !a?.code) return
      if (a.slot) slotCat.set(`${a.code}|||${String(a.slot).toLowerCase()}`, a.category)
      if (!codeCats.has(a.code)) codeCats.set(a.code, new Set<string>())
      codeCats.get(a.code)!.add(a.category)
    })

    const missedByKey = new Map<string, number>()
    const seenSessionKeys = new Set<string>()

    ;(odMlEntries as any[]).forEach((entry) => {
      if (!entry?.startDate || !entry?.endDate) return
      const start = toDate(entry.startDate)
      const end = toDate(entry.endDate)
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return

      const type = entry.type === "od" ? "od" : "ml"

      Object.entries(dateToDoMap as Record<string, number>).forEach(([date, dayOrder]) => {
        if (!dayOrder) return
        const d = toDate(date)
        if (d < start || d > end) return

        const slots = dayOrderSlots.get(Number(dayOrder)) || []
        slots.forEach((slot) => {
          const code = String(slot?.code || "")
          if (!code) return

          const slotLower = String(slot?.slot || "").toLowerCase()
          const exact = slotCat.get(`${code}|||${slotLower}`)
          const cats = codeCats.get(code)
          const only = cats && cats.size === 1 ? [...cats][0] : null
          const typeLower = String(slot?.type || "").toLowerCase()
          const cat =
            exact ||
            (only === "Practical" ? "Practical" : null) ||
            (typeLower.includes("practical") || typeLower.includes("lab") ? "Practical" : null) ||
            (slotLower.startsWith("p") || slotLower.startsWith("l") ? "Practical" : "Theory")

          if (type === "od" && cat !== "Theory") return
          if (type === "ml" && cat !== "Practical" && cat !== "Theory") return

          const hour = String(slot?.hour || "0")
          const key = `${type}:${date}:${code}:${hour}`
          if (seenSessionKeys.has(key)) return
          seenSessionKeys.add(key)

          const catKey = `${code}|||${cat}`
          missedByKey.set(catKey, (missedByKey.get(catKey) || 0) + 1)
        })
      })
    })

    return effectiveAttendance.map((record: any) => {
      const missed = missedByKey.get(`${String(record.code)}|||${record.category || ""}`) || 0
      if (!missed) return record
      const total = Number(record.total || 0)
      const attended = Math.min(total, Number(record.attended || 0) + missed)
      const percentage = total > 0 ? Math.round((attended / total) * 100) : 0
      return { ...record, attended, total, percentage }
    })
  }, [effectiveAttendance, odMlEntries, timetable, dateToDoMap])

  const activeAttendance = attendanceMode === "with_od_ml" ? attendanceWithAdjustments : effectiveAttendance

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
    const codes = [
      ...new Set([
        ...(courses as any[]).map((c: any) => c.code),
        ...Array.from(attGrouped.keys()),
      ]),
    ]
    const result: any[] = []
    codes.forEach((code) => {
      const courseEntries = courseByCode.get(code) || []
      const names = [...new Set(courseEntries.map((c: any) => c.name?.trim()).filter(Boolean))]
      const attEntries = attGrouped.get(code) || []
      const name = names[0] || attEntries[0]?.name || code
      const hasData = attEntries.some((r: any) => r.total > 0)
      if (hasData) {
        const attended = attEntries.reduce((s: number, r: any) => s + (r.attended || 0), 0)
        const total = attEntries.reduce((s: number, r: any) => s + (r.total || 0), 0)
        const percentage = total > 0 ? Math.round((attended / total) * 100) : 0
        const statusPct = (() => {
          const valid = attEntries.filter((r: any) => r.total > 0)
          if (valid.length === 0) return percentage
          return Math.min(...valid.map((r: any) => Math.round((r.attended / r.total) * 100)))
        })()
        result.push({
          code,
          name,
          attended,
          total,
          percentage,
          statusPct,
          category:
            [...new Set(attEntries.map((r: any) => r.category || catFromSlot(r.slot)).filter(Boolean))].join(" + ") ||
            "",
          slot: courseEntries[0]?.slot || attEntries[0]?.slot || "",
          hasData: true,
          records: attEntries,
        })
      } else {
        result.push({
          code,
          name,
          attended: 0,
          total: 0,
          percentage: 0,
          statusPct: 0,
          category: "",
          slot: courseEntries[0]?.slot || "",
          hasData: false,
          records: [],
        })
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
    safe: {
      color: "#34d399",
      ring: "ring-emerald-500/20",
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      label: "On Track",
    },
    warning: {
      color: "#fbbf24",
      ring: "ring-amber-500/20",
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      label: "Borderline",
    },
    danger: {
      color: "#f87171",
      ring: "ring-red-500/20",
      bg: "bg-red-500/10",
      text: "text-red-400",
      label: "At Risk",
    },
  }

  const classesNeeded = (attended: number, total: number) => {
    if (total === 0) return 0
    if ((attended / total) * 100 >= goalPercentage) return 0
    let needed = 0,
      na = attended,
      nt = total
    while ((na / nt) * 100 < goalPercentage) {
      na++
      nt++
      needed++
      if (needed > 100) break
    }
    return needed
  }

  const canSkip = (attended: number, total: number) => {
    if (total === 0) return 0
    let skippable = 0,
      nt = total
    while ((attended / (nt + 1)) * 100 >= goalPercentage) {
      nt++
      skippable++
      if (skippable > 50) break
    }
    return skippable
  }

  const overallAttended = attendanceWithData.reduce((s: number, r: any) => s + r.attended, 0)
  const overallTotal = attendanceWithData.reduce((s: number, r: any) => s + r.total, 0)
  const overallPercentage = overallTotal > 0 ? Math.round((overallAttended / overallTotal) * 100) : 0
  const safeCount = attendanceWithData.filter(
    (r: any) => getStatus(r.statusPct ?? r.percentage) === "safe"
  ).length
  const atRiskSubjects = attendanceWithData.filter(
    (r: any) => getStatus(r.statusPct ?? r.percentage) !== "safe"
  )

  const filteredAttendance = mergedAttendance.filter((r: any) => {
    if (!r.hasData || r.total === 0) return false
    if (filter === "all") return true
    if (filter === "safe") return getStatus(r.statusPct ?? r.percentage) === "safe"
    return getStatus(r.statusPct ?? r.percentage) !== "safe"
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
          <Button
            size="lg"
            onClick={() => setIsLoginOpen(true)}
            className="bg-emerald-500 text-zinc-900 hover:bg-emerald-400 font-bold text-sm px-8 py-6 rounded-xl"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Connect to SRM Academia
          </Button>
        </motion.div>
        <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      </div>
    )
  }

  return (
    <div className="min-h-full pt-[3.75rem] pb-20 px-3 sm:px-4 lg:px-8 lg:pb-8 w-full">
      {/* ── Header ── */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className={`font-bold text-[10px] uppercase tracking-widest mb-1 ${isPoster ? "text-zinc-600 font-mono" : "text-zinc-500"}`}>
            Attendance Radar
          </p>
          <h1 className={`text-3xl font-bold tracking-tight font-display ${isPoster ? "text-[#111111]" : "text-zinc-100"}`}>
            Attendance
          </h1>
          <p className={`text-[11px] mt-0.5 ${isPoster ? "text-zinc-600 font-medium" : "text-zinc-500"}`}>
            {user?.specialization || user?.program} · Sem {user?.semester} ·{" "}
            {attendanceWithData.length} tracked
            {attendancePending.length > 0 ? ` · ${attendancePending.length} pending` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AIPromoBadge page="attendance" />
          {attendanceSource === "portal" && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={openPortalLogin}
              disabled={isLoading || isSyncing}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 ${
                isPoster
                  ? "bg-white text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-zinc-50"
                  : "bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/25 shadow-sm"
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Resync Portal</span>
              <span className="sm:hidden">Resync</span>
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={refreshAttendance}
            disabled={isLoading}
            className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all disabled:opacity-40 ${
              isPoster
                ? "bg-white text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-zinc-50"
                : "text-zinc-500 bg-zinc-900/60 ring-1 ring-white/5 hover:text-zinc-300"
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </motion.button>
        </div>
      </div>

      {/* ── Session Expired Warning Banner ── */}
      {isSessionExpired && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-3.5 sm:p-4 rounded-2xl flex items-center justify-between gap-3 text-xs ${
            isPoster
              ? "bg-[#fef3c7] border-2 border-[#111111] shadow-[3px_3px_0px_#111111] text-[#111111]"
              : "bg-amber-500/10 border border-amber-500/25 text-amber-300"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <AlertTriangle className={`w-4 h-4 shrink-0 ${isPoster ? "text-[#b45309]" : "text-amber-400"}`} />
            <span className={`truncate font-semibold ${isPoster ? "text-[#111111]" : "text-amber-300"}`}>
              Student Portal session expired — Relogin required to refresh live data
            </span>
          </div>
          <button
            onClick={openPortalLogin}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 text-xs whitespace-nowrap ${
              isPoster
                ? "bg-[#111111] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] keep-white hover:bg-zinc-800"
                : "bg-amber-400 hover:bg-amber-300 text-zinc-950 shadow-sm"
            }`}
          >
            Relogin Now
          </button>
        </motion.div>
      )}

      {/* ── Portal Mode Active Indicator ── */}
      {attendanceSource === "portal" && !isSessionExpired && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-3 sm:p-4 rounded-2xl flex items-center justify-between gap-3 text-xs ${
            isPoster
              ? "bg-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111] text-[#111111]"
              : "bg-cyan-500/10 border border-cyan-500/25 text-cyan-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full ${isPoster ? "bg-[#111111]" : "bg-cyan-400 animate-pulse"}`} />
            <span className={isPoster ? "font-bold text-[#111111] tracking-tight" : "text-cyan-300"}>
              Student Portal Scraper Mode Active — Live data from sp.srmist.edu.in
            </span>
          </div>
          {(!portalData?.attendance || portalData.attendance.length === 0) && (
            <button
              onClick={openPortalLogin}
              className={`px-3 py-1 rounded-lg font-bold transition-all shrink-0 ${
                isPoster
                  ? "bg-[#111111] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] keep-white hover:bg-zinc-800"
                  : "bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/30"
              }`}
            >
              Sync Portal
            </button>
          )}
        </motion.div>
      )}

      {/* ── Mode Switcher ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.03 }}
        className={`flex rounded-xl p-[3px] mb-6 ${
          isPoster
            ? "bg-[#e8e6dc] border-2 border-[#111111] shadow-[3px_3px_0px_#111111]"
            : "bg-zinc-900/80 ring-1 ring-white/[0.04]"
        }`}
      >
        <button
          onClick={() => setAttendanceMode("base")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all relative cursor-pointer ${
            attendanceMode === "base"
              ? isPoster
                ? "bg-[#111111] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] keep-white font-black"
                : "text-emerald-300"
              : isPoster
                ? "text-zinc-700 hover:text-[#111111]"
                : "text-zinc-500"
          }`}
        >
          {attendanceMode === "base" && !isPoster && (
            <div
              className="absolute inset-0 rounded-lg"
              style={{
                background: "rgba(52, 211, 153, 0.12)",
                border: "1px solid rgba(52, 211, 153, 0.2)",
              }}
            />
          )}
          <Award
            size={13}
            className={`relative z-10 ${
              attendanceMode === "base"
                ? isPoster
                  ? "text-white"
                  : "text-emerald-400"
                : isPoster
                  ? "text-zinc-600"
                  : "text-zinc-600"
            }`}
          />
          <span className="relative z-10 uppercase tracking-wider text-[11px]">
            Without OD/ML
          </span>
        </button>
        <button
          onClick={() => setAttendanceMode("with_od_ml")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all relative cursor-pointer ${
            attendanceMode === "with_od_ml"
              ? isPoster
                ? "bg-[#111111] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] keep-white font-black"
                : "text-emerald-300"
              : isPoster
                ? "text-zinc-700 hover:text-[#111111]"
                : "text-zinc-500"
          }`}
        >
          {attendanceMode === "with_od_ml" && !isPoster && (
            <div
              className="absolute inset-0 rounded-lg"
              style={{
                background: "rgba(52, 211, 153, 0.12)",
                border: "1px solid rgba(52, 211, 153, 0.2)",
              }}
            />
          )}
          <Target
            size={13}
            className={`relative z-10 ${
              attendanceMode === "with_od_ml"
                ? isPoster
                  ? "text-white"
                  : "text-emerald-400"
                : isPoster
                  ? "text-zinc-600"
                  : "text-zinc-600"
            }`}
          />
          <span className="relative z-10 uppercase tracking-wider text-[11px]">
            With OD/ML
          </span>
        </button>
      </motion.div>

      {/* ── OD/ML Planner Button ── */}
      {attendanceMode === "with_od_ml" && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              try {
                window.sessionStorage.setItem("edutechsrm_open_odml_from_attendance", "1")
              } catch {}
              window.history.replaceState(null, "", "#od-ml-planner")
              onNavigate?.("about")
            }}
            className={`group relative w-full overflow-hidden rounded-2xl px-5 py-4 transition-all text-left ${
              isPoster
                ? "bg-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111] hover:bg-zinc-50"
                : "border border-emerald-500/20 bg-zinc-900/70 hover:border-emerald-400/35"
            }`}
          >
            {!isPoster && (
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-emerald-400/5 to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
            )}
            <div className="relative flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isPoster
                    ? "bg-[#111111] text-white border-2 border-[#111111] shadow-[1px_1px_0px_#111111]"
                    : "bg-emerald-500/15 ring-1 ring-emerald-500/25 text-emerald-400"
                }`}>
                  <Target className="w-4 h-4" />
                </div>
                <div className="text-left min-w-0">
                  <p className={`text-[11px] font-black uppercase tracking-widest ${
                    isPoster ? "text-[#111111]" : "text-emerald-300"
                  }`}>
                    OD / ML Planner
                  </p>
                  <p className={`text-[10px] truncate ${
                    isPoster ? "text-zinc-600 font-medium" : "text-zinc-500"
                  }`}>
                    Open and edit attendance leave ranges
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                isPoster ? "text-[#111111] underline underline-offset-2" : "text-emerald-400/90 group-hover:text-emerald-300"
              }`}>
                Edit
              </span>
            </div>
          </motion.button>
        </motion.div>
      )}

      {/* ── Donut Chart & Hero Stats ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className={`rounded-2xl p-5 sm:p-6 mb-8 ${
          isPoster
            ? "bg-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111]"
            : "bg-zinc-900/60 ring-1 ring-white/5"
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Donut */}
          <div className="relative w-24 h-24 shrink-0">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 112 112">
              <circle cx="56" cy="56" r="46" fill="none" stroke={isPoster ? "#e5e5df" : "rgba(255,255,255,0.06)"} strokeWidth="8" />
              <motion.circle
                cx="56"
                cy="56"
                r="46"
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                stroke={
                  isPoster
                    ? (overallStatus === "emerald" ? "#15803d" : overallStatus === "amber" ? "#b45309" : "#dc2626")
                    : (overallStatus === "emerald" ? "#34d399" : overallStatus === "amber" ? "#fbbf24" : "#f87171")
                }
                strokeDasharray="289"
                initial={{ strokeDashoffset: 289 }}
                animate={{ strokeDashoffset: 289 - (289 * overallPercentage) / 100 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </svg>
            <span
              className={`absolute inset-0 flex items-center justify-center font-display font-bold text-xl ${
                isPoster
                  ? "text-[#111111]"
                  : (overallStatus === "emerald"
                    ? "text-emerald-400"
                    : overallStatus === "amber"
                    ? "text-amber-400"
                    : "text-red-400")
              }`}
            >
              {overallPercentage}%
            </span>
          </div>

          {/* Stats */}
          <div className="flex-1 min-w-0 w-full">
            <div className="flex items-start sm:items-center justify-between gap-2 mb-1">
              <h3 className={`text-[10px] font-bold uppercase tracking-widest ${isPoster ? "text-zinc-600 font-mono" : "text-zinc-500"}`}>
                Overall Attendance
              </h3>
              <span
                className={`text-[10px] font-bold shrink-0 ${
                  isPoster
                    ? (overallPercentage >= 75 ? "text-emerald-700 font-black" : "text-amber-700 font-black")
                    : (overallPercentage >= 75 ? "text-emerald-400" : "text-amber-400")
                }`}
              >
                {overallPercentage >= 75 ? "On Track" : "Needs Attention"}
              </span>
            </div>
            <p className={`text-xs mb-3 ${isPoster ? "text-zinc-600" : "text-zinc-500"}`}>
              <span className={`font-semibold ${isPoster ? "text-[#111111]" : "text-zinc-200"}`}>{overallAttended}</span> / {overallTotal} classes
            </p>
            <div className={`w-full h-2 rounded-full overflow-hidden ${isPoster ? "bg-zinc-200 border border-[#111111]" : "bg-zinc-950 ring-1 ring-white/5"}`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallPercentage}%` }}
                transition={{ duration: 1.1, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  isPoster
                    ? (overallStatus === "emerald" ? "bg-emerald-600" : overallStatus === "amber" ? "bg-amber-500" : "bg-red-600")
                    : (overallStatus === "emerald"
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                      : overallStatus === "amber"
                      ? "bg-gradient-to-r from-amber-500 to-amber-400"
                      : "bg-gradient-to-r from-red-500 to-red-400")
                }`}
              />
            </div>
            <div className="flex gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${isPoster ? "bg-emerald-600" : "bg-emerald-400"}`} />
                <span className={`text-[10px] font-bold ${isPoster ? "text-zinc-700" : "text-zinc-500"}`}>{safeCount} safe</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${isPoster ? "bg-red-600" : "bg-red-400"}`} />
                <span className={`text-[10px] font-bold ${isPoster ? "text-zinc-700" : "text-zinc-500"}`}>{atRiskSubjects.length} at risk</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Filter Tabs ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className={`flex rounded-xl p-1 mb-6 w-fit ${
          isPoster
            ? "bg-[#e8e6dc] border-2 border-[#111111] shadow-[2px_2px_0px_#111111]"
            : "bg-zinc-900 border border-white/5"
        }`}
      >
        {(["all", "safe", "risk"] as const).map((f) => (
          <motion.button
            key={f}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(f)}
            className={`px-4 sm:px-5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              filter === f
                ? isPoster
                  ? "bg-[#111111] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] keep-white font-black"
                  : "bg-zinc-800 text-zinc-100 shadow-md border border-white/5"
                : isPoster
                  ? "text-zinc-700 hover:text-[#111111]"
                  : "font-medium text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {f === "all"
              ? `All ${mergedAttendance.length}`
              : f === "safe"
              ? `Safe ${safeCount}`
              : `Risk ${atRiskSubjects.length}`}
          </motion.button>
        ))}
      </motion.div>

      {/* ── Subject Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredAttendance.map((record, idx) => {
          const statusPct = record.statusPct ?? record.percentage
          const status = getStatus(statusPct)
          const cfg = statusConfig[status]
          const needed = classesNeeded(record.attended, record.total)
          const skippable = canSkip(record.attended, record.total)
          const isExpanded = expandedCode === record.code

          const recChips =
            record.records && record.records.length > 1
              ? record.records.map((rr: any, ri: number) => {
                  const rp = rr.total > 0 ? Math.round((rr.attended / rr.total) * 100) : 0
                  const rc = rp >= 75 ? "#34d399" : rp >= 65 ? "#fbbf24" : "#f87171"
                  return {
                    ri,
                    rLabel: rr.category || catFromSlot(rr.slot) || `Component ${ri + 1}`,
                    rText: `${rp}% (${rr.attended}/${rr.total})`,
                    rColor: rc,
                  }
                })
              : []

          return (
            <motion.div
              key={record.code}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className={`rounded-2xl overflow-hidden transition-all flex flex-col justify-between ${
                isPoster
                  ? "bg-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] hover:shadow-[6px_6px_0px_#111111]"
                  : "bg-zinc-900/60 ring-1 ring-white/5 hover:ring-white/10"
              }`}
            >
              {/* Header on mobile tap or desktop view */}
              <div
                onClick={() => setExpandedCode(isExpanded ? null : record.code)}
                className="p-4 sm:p-5 cursor-pointer select-none"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <span className={`font-mono text-[10px] uppercase font-bold tracking-[0.1em] block ${
                      isPoster ? "text-zinc-600" : "text-zinc-500"
                    }`}>
                      {record.code}
                    </span>
                    <h4 className={`font-bold text-sm tracking-tight truncate mt-0.5 ${
                      isPoster ? "text-[#111111]" : "text-zinc-100"
                    }`}>
                      {record.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`font-display font-bold text-xl tracking-tighter ${
                      isPoster
                        ? (status === "safe" ? "text-emerald-700 font-black" : status === "warning" ? "text-amber-700 font-black" : "text-red-600 font-black")
                        : cfg.text
                    }`}>
                      {statusPct}%
                    </span>
                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown className={`w-3.5 h-3.5 ${isPoster ? "text-zinc-700" : "text-zinc-500"} lg:hidden`} />
                    </motion.div>
                  </div>
                </div>

                <div className={`w-full h-1.5 rounded-full overflow-hidden mt-3 ${
                  isPoster ? "bg-zinc-100 border border-[#111111]/30" : "bg-zinc-950 ring-1 ring-white/5"
                }`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${statusPct}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.05, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: isPoster ? (status === "safe" ? "#15803d" : status === "warning" ? "#b45309" : "#dc2626") : cfg.color }}
                  />
                </div>

                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span
                    className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${
                      isPoster
                        ? "bg-[#f4f4f0] text-[#111111] border border-[#111111] shadow-[1px_1px_0px_#111111]"
                        : `${cfg.bg} ${cfg.text} ring-1 ${cfg.ring}`
                    }`}
                  >
                    {cfg.label}
                  </span>
                  {status === "safe" && skippable > 0 && (
                    <span className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${
                      isPoster
                        ? "bg-[#dcfce7] text-emerald-900 border border-[#111111] shadow-[1px_1px_0px_#111111]"
                        : "bg-emerald-500/8 text-emerald-400 ring-1 ring-emerald-500/20"
                    }`}>
                      <TrendingUp className="w-2.5 h-2.5" />
                      Skip {skippable}
                    </span>
                  )}
                  {status !== "safe" && needed > 0 && (
                    <span className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${
                      isPoster
                        ? "bg-[#fee2e2] text-red-900 border border-[#111111] shadow-[1px_1px_0px_#111111]"
                        : "bg-red-500/8 text-red-400 ring-1 ring-red-500/20"
                    }`}>
                      <TrendingDown className="w-2.5 h-2.5" />
                      Need {needed}
                    </span>
                  )}
                  {recChips.length > 1 &&
                    recChips.map((c: any) => (
                      <span
                        key={`rec-${c.ri}`}
                        className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${
                          isPoster
                            ? "bg-[#f4f4f0] text-[#111111] border border-[#111111]/30 shadow-[1px_1px_0px_#111111]"
                            : "ring-1 ring-white/10"
                        }`}
                        style={isPoster ? {} : { background: `${c.rColor}12`, color: c.rColor }}
                      >
                        {c.rLabel}: {c.rText}
                      </span>
                    ))}
                </div>
              </div>

              {/* Expanded content */}
              <div className={`${isDesktop ? "block" : isExpanded ? "block" : "hidden"}`}>
                <div className={`mx-0 ${isPoster ? "border-t border-[#111111]/15" : "border-t border-white/5"}`} />
                <div className="px-4 pb-4 pt-3 space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Attended", value: record.attended },
                      { label: "Total", value: record.total },
                      { label: "Category", value: record.category || "Theory" },
                    ].map((s, i) => (
                      <div
                        key={i}
                        className={`rounded-lg px-3 py-2 ${
                          isPoster
                            ? "bg-[#f9f8f5] border border-[#111111]/20 shadow-[1px_1px_0px_#111111]"
                            : "bg-zinc-900/50 ring-1 ring-white/5"
                        }`}
                      >
                        <p className={`text-[9px] uppercase font-bold tracking-[0.1em] ${
                          isPoster ? "text-zinc-600 font-mono" : "text-zinc-500"
                        }`}>
                          {s.label}
                        </p>
                        <p className={`text-xs font-bold mt-0.5 break-words leading-snug ${
                          isPoster ? "text-[#111111]" : "text-zinc-200"
                        }`}>
                          {s.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {record.records && record.records.length > 1 && (
                    <div className="space-y-1.5">
                      <p className={`text-[9px] font-bold uppercase tracking-[0.1em] ${
                        isPoster ? "text-zinc-600 font-mono" : "text-zinc-500"
                      }`}>
                        Breakdown
                      </p>
                      {record.records.map((rr: any, ri: number) => {
                        const rp = rr.total > 0 ? Math.round((rr.attended / rr.total) * 100) : 0
                        const rc = rp >= 75 ? "#15803d" : rp >= 65 ? "#b45309" : "#dc2626"
                        return (
                          <div
                            key={ri}
                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${
                              isPoster
                                ? "bg-[#f9f8f5] border border-[#111111]/20 shadow-[1px_1px_0px_#111111]"
                                : "bg-zinc-900/50 ring-1 ring-white/[0.04]"
                            }`}
                          >
                            <div className="w-1 h-4 rounded-full shrink-0" style={{ background: rc }} />
                            <span className={`text-[11px] font-semibold flex-1 min-w-0 truncate ${
                              isPoster ? "text-[#111111]" : "text-zinc-300"
                            }`}>
                              {rr.category || catFromSlot(rr.slot) || "?"}
                            </span>
                            <span className="text-[11px] font-bold tabular-nums" style={{ color: rc }}>
                              {rp}%
                            </span>
                            <span className={`text-[10px] font-mono tabular-nums ${
                              isPoster ? "text-zinc-600 font-bold" : "text-zinc-500"
                            }`}>
                              {rr.attended}/{rr.total}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {status === "safe" && skippable > 0 && (
                    <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[10px] ${
                      isPoster
                        ? "bg-[#dcfce7] border border-emerald-600 text-emerald-950 font-bold shadow-[1px_1px_0px_#111111]"
                        : "bg-emerald-500/5 ring-1 ring-emerald-500/20 text-emerald-400"
                    }`}>
                      <TrendingUp className="w-3 h-3 shrink-0" />
                      <span>
                        Skip <strong>{skippable}</strong> more and stay safe
                      </span>
                    </div>
                  )}
                  {status === "safe" && skippable === 0 && (
                    <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[10px] ${
                      isPoster
                        ? "bg-[#fef3c7] border border-amber-600 text-amber-950 font-bold shadow-[1px_1px_0px_#111111]"
                        : "bg-amber-500/5 ring-1 ring-amber-500/20 text-amber-400"
                    }`}>
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>Borderline — don&apos;t miss any more classes</span>
                    </div>
                  )}
                  {status !== "safe" && needed > 0 && (
                    <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[10px] ${
                      isPoster
                        ? "bg-[#fee2e2] border border-red-600 text-red-950 font-bold shadow-[1px_1px_0px_#111111]"
                        : "bg-red-500/5 ring-1 ring-red-500/20 text-red-400"
                    }`}>
                      <TrendingDown className="w-3 h-3 shrink-0" />
                      <span>
                        Attend <strong>{needed}</strong> more to reach 75%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* ── Pending Attendance Cards ── */}
      {attendancePending.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-2 h-2 rounded-full ${isPoster ? "bg-zinc-700" : "bg-zinc-600"}`} />
            <h3 className={`text-[10px] font-bold uppercase tracking-widest ${
              isPoster ? "text-zinc-600 font-mono" : "text-zinc-500"
            }`}>
              Attendance data pending
            </h3>
            <span className={`text-[10px] ${isPoster ? "text-zinc-600" : "text-zinc-600"}`}>({attendancePending.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {attendancePending.map((record, idx) => (
              <motion.div
                key={`pending-${record.code}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className={`rounded-xl p-4 opacity-75 ${
                  isPoster
                    ? "bg-white border-2 border-dashed border-[#111111]/40 shadow-[2px_2px_0px_#111111]"
                    : "bg-zinc-900/20 ring-1 ring-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-1 h-9 rounded-full shrink-0 ${isPoster ? "bg-[#111111]" : "bg-zinc-700"}`} />
                  <div className="flex-1 min-w-0">
                    <span className={`text-[10px] uppercase font-bold tracking-[0.1em] block ${
                      isPoster ? "text-zinc-600 font-mono" : "text-zinc-600"
                    }`}>
                      {record.code}
                    </span>
                    <h4 className={`font-bold text-sm tracking-tight truncate ${
                      isPoster ? "text-[#111111]" : "text-zinc-500"
                    }`}>
                      {record.name}
                    </h4>
                  </div>
                </div>
                <p className={`text-[10px] mt-3 font-medium ${isPoster ? "text-zinc-600" : "text-zinc-600"}`}>Awaiting attendance data from SRM</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
