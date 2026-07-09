"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  RefreshCw, MapPin, User, BookOpen, LogIn,
  ChevronLeft, ChevronRight, Calendar, List, Grid3X3,
  GraduationCap, Users, Moon, Coffee, Sunset, X, Hash, Award, Download, Sparkles, Clock3, Trash2,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { LoginModal } from "./login-modal"
import { expandCustomClassesByDate, getCoveredHoursForClass, useCustomPlanner } from "@/lib/custom-planner"
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

const WEEKDAYS  = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const FULL_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

const BREAK_MESSAGES = [
  "Grab a coffee and breathe ☕",
  "Stretch, hydrate, squeeze in revision 🎵",
  "Rest up — next class coming soon 📱",
  "Good moment to review what you just learned 🧠",
  "Walk around, reset your mind 🌿",
]

const END_MESSAGES = [
  "That's a wrap for today! 📚 Now go conquer those assignments.",
  "Classes done! 🎯 Review your notes while they're fresh.",
  "You're free! 🌅 Rest or revise — your call.",
  "Day complete! ✅ Reward yourself, but prep for tomorrow.",
  "All done! 🚀 Great hustle today. Recharge for tomorrow.",
]

// ─── helpers ────────────────────────────────────────────────────────────────

function formatLocalDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function getDaysFrom(baseDate: Date, length: number) {
  const todayStr = formatLocalDate(new Date())
  return Array.from({ length }, (_, i) => {
    const d = new Date(baseDate)
    d.setDate(baseDate.getDate() + i)
    const dow = d.getDay()
    return {
      date: formatLocalDate(d),
      dayName: FULL_DAYS[dow],
      shortDay: WEEKDAYS[dow],
      dayNum: d.getDate(),
      month: d.toLocaleDateString("en-US", { month: "short" }),
      isWeekend: dow === 0 || dow === 6,
      isToday: formatLocalDate(d) === todayStr,
    }
  })
}

function getWeekDaysFrom(baseDate: Date) {
  return getDaysFrom(baseDate, 7)
}

function getThisWeekSunday() {
  const today = new Date()
  const d = new Date(today)
  d.setDate(today.getDate() - today.getDay())
  d.setHours(0, 0, 0, 0)
  return d
}

function getCurrentHour() {
  const t = new Date().getHours() * 60 + new Date().getMinutes()
  const ranges = [
    { hour: 1, start: 480, end: 530 }, { hour: 2, start: 530, end: 580 },
    { hour: 3, start: 585, end: 635 }, { hour: 4, start: 640, end: 690 },
    { hour: 5, start: 695, end: 745 }, { hour: 6, start: 750, end: 800 },
    { hour: 7, start: 805, end: 855 }, { hour: 8, start: 860, end: 910 },
    { hour: 9, start: 910, end: 960 }, { hour: 10, start: 960, end: 1010 },
  ]
  return ranges.find((r) => t >= r.start && t <= r.end)?.hour || null
}

function toMins(t: string) {
  if (!t) return 0
  const [h, m] = t.trim().replace(/\s/g, "").split(":").map(Number)
  const hours = h || 0
  const mins  = m || 0
  // TIME_SLOTS use 12-hr format without AM/PM for afternoon (e.g. "01:20" = 13:20).
  // Any hour ≤ 6 after the morning block must be PM — shift by 12.
  // Morning classes run 8:00–12:25, afternoon from 12:30 onwards.
  // So hours 1–6 that appear as end/start times of slots 6–12 are actually 13–18.
  // Simple rule: if parsed hour < 7, treat as PM (+12).
  const adjusted = hours < 7 ? hours + 12 : hours
  return adjusted * 60 + mins
}

function getSlotEnd(hour: number) {
  const slot = TIME_SLOTS.find((s) => s.hour === hour)
  return slot ? toMins(slot.time.split(" - ")[1]) : 0
}

function getSlotStart(hour: number) {
  const slot = TIME_SLOTS.find((s) => s.hour === hour)
  return slot ? toMins(slot.time.split(" - ")[0]) : 0
}

function getClassStartMins(classData: any) {
  if (classData?.custom && classData?.startTime) return toMins(classData.startTime)
  return getSlotStart(classData?.hour)
}

function getClassEndMins(classData: any) {
  if (classData?.custom && classData?.endTime) return toMins(classData.endTime)
  return getSlotEnd(classData?.hour)
}

function canSkip(attended: number, total: number) {
  if (total === 0) return 0
  let s = 0, nt = total
  while ((attended / (nt + 1)) * 100 >= 75) { nt++; s++; if (s > 50) break }
  return s
}

function classesNeeded(attended: number, total: number) {
  if (total === 0 || (attended / total) * 100 >= 75) return 0
  let n = 0, na = attended, nt = total
  while ((na / nt) * 100 < 75) { na++; nt++; n++; if (n > 100) break }
  return n
}

function getTypeStyle(type: string): { color: string; border: string; bg: string; label: string } {
  const t = type?.toLowerCase() || ""
  if (t.includes("lab based")) return { color: "#a78bfa", border: "rgba(167,139,250,0.25)", bg: "rgba(167,139,250,0.08)", label: type }
  if (t === "theory")          return { color: "#60a5fa", border: "rgba(96,165,250,0.25)",  bg: "rgba(96,165,250,0.08)",  label: "Theory" }
  if (t.includes("practical") || t === "lab") return { color: "#34d399", border: "rgba(52,211,153,0.25)", bg: "rgba(52,211,153,0.08)", label: type }
  return { color: "#f59e0b", border: "rgba(245,158,11,0.25)", bg: "rgba(245,158,11,0.08)", label: type }
}

// ─── Break card (extracted component — no IIFE needed) ──────────────────────

function TimelineDot({ isCurrent, isPast, isBreak }: { isCurrent?: boolean; isPast?: boolean; isBreak?: boolean }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 20, height: 20 }}>
      {isBreak ? (
        <Coffee className="w-3.5 h-3.5 text-zinc-500" />
      ) : (
        <>
          <div className={`absolute rounded-full transition-all ${
            isCurrent
              ? "w-5 h-5 bg-emerald-400/20 animate-ping"
              : "w-3 h-3"
          }`} />
          <div className={`rounded-full relative transition-all ${
            isCurrent
              ? "w-3 h-3 bg-emerald-400 "
              : isPast
                ? "w-2.5 h-2.5 bg-zinc-600"
                : "w-3 h-3 bg-zinc-500 ring-2 ring-zinc-800"
          }`} />
        </>
      )}
    </div>
  )
}

function BreakCard({ breakMins, isBreakNow, index }: { breakMins: number; isBreakNow: boolean; index: number }) {
  const msg   = BREAK_MESSAGES[index % BREAK_MESSAGES.length]
  const label = breakMins >= 60
    ? `${Math.floor(breakMins / 60)}h ${breakMins % 60 > 0 ? `${breakMins % 60}m ` : ""}break`
    : `${breakMins} min break`

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-stretch gap-3"
    >
      {/* Timeline gutter */}
      <div className="flex flex-col items-center shrink-0" style={{ width: 44 }}>
        <div className="w-0.5 flex-1 bg-gradient-to-b from-zinc-700 via-zinc-700/50 to-zinc-700" />
        <TimelineDot isBreak />
        <div className={`w-0.5 flex-1 ${isBreakNow ? "bg-gradient-to-b from-amber-400/50 via-amber-400/20 to-transparent" : "bg-gradient-to-b from-zinc-700 via-zinc-700/50 to-zinc-700"}`} />
      </div>
      {/* Content */}
      <div className={`flex-1 rounded-2xl p-3 ring-1 transition-all mb-0 ${
        isBreakNow
          ? "bg-amber-500/5 ring-amber-500/20 "
          : "bg-white/[0.02] ring-white/5"
      }`}>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold ${isBreakNow ? "text-amber-400" : "text-zinc-500"}`}>{label}</span>
          {isBreakNow && (
            <span className="inline-flex items-center gap-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30">
              <span className="w-1 h-1 rounded-full bg-amber-400 animate-pulse " />Now
            </span>
          )}
        </div>
        <p className="text-[10px] truncate mt-0.5 text-zinc-500">{msg}</p>
      </div>
    </motion.div>
  )
}

// ─── Holiday animation icon ────────────────────────────────────

function HolidayIcon({ size = "w-5 h-5" }: { size?: string }) {
  return (
    <motion.div
      className={`inline-flex items-center justify-center ${size}`}
      animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.15, 1] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <Sparkles className="w-full h-full text-emerald-400 " />
    </motion.div>
  )
}

// ─── Day classes list (extracted to avoid IIFE in JSX) ──────────────────────

function DayClassesList({
  selectedDayClasses, selectedDay, currentHour, getCourseDetails, getAttendanceData,
  dateToHoliday, assignments, updateAssignment, removeAssignment,
}: {
  selectedDayClasses: any[]
  selectedDay: ReturnType<typeof getWeekDaysFrom>[0] | undefined
  currentHour: number | null
  getCourseDetails: (code: string) => any
  getAttendanceData: (code: string) => any
  dateToHoliday: Record<string, string>
  assignments?: any[]
  updateAssignment?: (id: string, updates: any) => void
  removeAssignment?: (id: string) => void
}) {
  const now     = new Date()
  const nowMins = now.getHours() * 60 + now.getMinutes()
  const endMsg  = END_MESSAGES[now.getDate() % END_MESSAGES.length]

  // Collapsed state for past classes
  const [showPast, setShowPast] = useState(false)

  if (selectedDay?.isWeekend) {
    return (
      <div className="text-center py-16 bg-zinc-900/60 ring-1 ring-white/5  rounded-3xl p-8  overflow-hidden relative">
        <motion.div
          animate={{ y: [0, -4, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-12 h-12 mx-auto mb-4"
        >
          <Moon className="w-full h-full text-zinc-500/40" />
        </motion.div>
        <p className="text-lg font-semibold text-zinc-400">{selectedDay.dayName}</p>
        {dateToHoliday[selectedDay.date] ? (
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20 text-emerald-400">
            <span className="text-lg"><HolidayIcon size="w-5 h-5" /></span>
            <span className="font-medium">{dateToHoliday[selectedDay.date]}</span>
          </div>
        ) : (
          <p className="text-sm text-zinc-500/60 mt-1">No classes — enjoy your weekend!</p>
        )}
      </div>
    )
  }

  const dayAssignments = assignments?.filter(
    (a: any) => a.status !== "done" && a.dueDate === selectedDay?.date
  ) || []

  if (selectedDayClasses.length === 0 && dayAssignments.length === 0) {
    return (
      <div className="text-center py-16 bg-zinc-900/60 ring-1 ring-white/5  rounded-3xl p-8  overflow-hidden relative">
        {selectedDay && dateToHoliday[selectedDay.date] ? (
          <>
            <div className="text-5xl mb-4"><HolidayIcon size="w-10 h-10" /></div>
            <p className="text-xl font-bold text-emerald-400">{dateToHoliday[selectedDay.date]}</p>
            <p className="text-sm text-zinc-400 mt-2">Holiday — no classes today</p>
          </>
        ) : (
          <>
            <Calendar className="w-12 h-12 mx-auto mb-4 text-zinc-500/40" />
            <p className="text-lg font-semibold text-zinc-400">No Classes Scheduled</p>
            <p className="text-sm text-zinc-500/60 mt-1">This may be a holiday or free day</p>
          </>
        )}
      </div>
    )
  }

  const lastClass = selectedDayClasses[selectedDayClasses.length - 1]
  const isDayDone = !selectedDay?.isToday || nowMins >= getClassEndMins(lastClass)

  // Split classes into past and upcoming (only for today)
  const isToday = !!selectedDay?.isToday
  const pastClasses    = isToday && isDayDone
    ? selectedDayClasses  // all done
    : isToday
    ? selectedDayClasses.filter(c => nowMins > getClassEndMins(c) && nowMins >= getClassStartMins(c))
    : []
  const currentAndFuture = isToday && !isDayDone
    ? selectedDayClasses.filter(c => nowMins < getClassEndMins(c))
    : isDayDone ? [] : selectedDayClasses

  // For non-today days, show all classes normally (no collapse)
  const classesToAlwaysShow = !isToday ? selectedDayClasses : currentAndFuture

  const renderClassCard = (classData: any, index: number, globalIndex: number, dimmed = false) => {
    const courseDetails  = getCourseDetails(classData.code)
    const isCurrentClass = isToday && nowMins >= getClassStartMins(classData) && nowMins < getClassEndMins(classData)
    const timeSlot       = TIME_SLOTS.find((s) => s.hour === classData.hour)
    const att            = getAttendanceData(classData.code)
    const skip           = att ? canSkip(att.attended, att.total) : 0
    const needed         = att ? classesNeeded(att.attended, att.total) : 0
    const attPct         = att ? att.percentage : null
    const ts             = getTypeStyle(classData.type)

    const prevClass  = globalIndex > 0 ? selectedDayClasses[globalIndex - 1] : null
    const breakMins  = prevClass ? getClassStartMins(classData) - getClassEndMins(prevClass) : 0
    const breakStart = prevClass ? getClassEndMins(prevClass) : 0
    const breakEnd   = getClassStartMins(classData)
    const isBreakNow = !!(isToday && prevClass && nowMins >= breakStart && nowMins < breakEnd)

    return (
      <React.Fragment key={`${classData.code}-${classData.hour}`}>
        {prevClass && breakMins >= 10 && (
          <BreakCard breakMins={breakMins} isBreakNow={isBreakNow} index={index} />
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: dimmed ? 0.35 : 1, y: 0 }}
          transition={{ delay: index * 0.04 }}
          className="flex items-stretch gap-3"
        >
          {/* Timeline gutter */}
          <div className="flex flex-col items-center shrink-0" style={{ width: 44 }}>
            {index === 0 ? (
              <div className="w-0.5 flex-1 bg-gradient-to-b from-transparent via-zinc-700/50 to-zinc-700" />
            ) : (
              <div className="w-0.5 flex-1 bg-zinc-700/50" />
            )}
            <TimelineDot
              isCurrent={isCurrentClass}
              isPast={dimmed && !isCurrentClass}
            />
            <div className={`w-0.5 flex-1 ${index < selectedDayClasses.length - 1 ? "bg-zinc-700/50" : "bg-gradient-to-b from-zinc-700/50 to-transparent"}`} />
          </div>

          {/* Content card */}
          <div className={`flex-1 min-w-0 rounded-2xl p-4 ring-1 transition-all group relative overflow-hidden ${
            isCurrentClass
              ? "bg-zinc-900/60 ring-emerald-500/30 "
              : dimmed
                ? "bg-zinc-900/20 ring-white/5"
                : "bg-zinc-900/40 ring-white/5 hover:ring-zinc-700 hover:bg-zinc-900/60 "
          }`}>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {isCurrentClass && (
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />
            )}

            <div className="relative z-10">
              {/* Top row: code + type */}
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`text-[11px] font-mono font-bold tracking-tight ${isCurrentClass ? "text-emerald-400" : dimmed ? "text-zinc-500" : "text-emerald-400"}`}>
                    {classData.code}
                  </span>
                  {isCurrentClass && (
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-emerald-400" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[9px] font-bold tabular-nums ${isCurrentClass ? "text-emerald-400/70" : dimmed ? "text-zinc-500" : "text-zinc-400"}`}>
                    {(classData.custom ? classData.time?.split(" - ")[0] : timeSlot?.time?.split(" - ")[0]) || classData.time?.split(" - ")[0]}
                    {" — "}
                    {(classData.custom ? classData.time?.split(" - ")[1] : timeSlot?.time?.split(" - ")[1]) || classData.time?.split(" - ")[1]}
                  </span>
                  <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ring-1 ${
                    classData.type?.toLowerCase().includes("lab based") ? "text-amber-400 bg-amber-500/10 ring-amber-500/20" :
                    classData.type?.toLowerCase() === "theory" ? "text-purple-400 bg-purple-500/10 ring-purple-500/20" :
                    classData.type?.toLowerCase().includes("practical") || classData.type?.toLowerCase() === "lab" ? "text-blue-400 bg-blue-500/10 ring-blue-500/20" :
                    "text-emerald-400 bg-emerald-500/10 ring-emerald-500/20"
                  }`}>
                    {ts.label}
                  </span>
                </div>
              </div>

              {/* Class name */}
              <p className={`font-semibold text-sm tracking-tight mb-2 ${dimmed ? "text-zinc-500" : "text-zinc-200"}`}>{classData.name}</p>

              {/* Details row */}
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mb-2 text-zinc-500 text-[10px]">
                {classData.room    && <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{classData.room}</span>}
                {classData.faculty && <span className="flex items-center gap-1 truncate max-w-[130px]"><User className="w-2.5 h-2.5 shrink-0" />{classData.faculty}</span>}
                {courseDetails     && <span className="flex items-center gap-1"><BookOpen className="w-2.5 h-2.5" />{courseDetails.credits} Cr</span>}
                {classData.slot    && <span className="text-zinc-600">Slot {classData.slot}</span>}
              </div>

              {/* Attendance */}
              {att && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ring-1 ${
                    attPct !== null && attPct >= 75 ? "text-emerald-400 bg-emerald-500/10 ring-emerald-500/20" :
                    attPct !== null && attPct >= 65 ? "text-amber-400 bg-amber-500/10 ring-amber-500/20" :
                    "text-red-400 bg-red-500/10 ring-red-500/20"
                  }`}>
                    {attPct}% attended
                  </span>
                  {skip > 0 && (
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full text-emerald-400 bg-emerald-500/10 ring-1 ring-emerald-500/20">
                      Can skip {skip}
                    </span>
                  )}
                  {needed > 0 && (
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full text-red-400 bg-red-500/10 ring-1 ring-red-500/20">
                      Need {needed} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </React.Fragment>
    )
  }

  return (
    <div className="space-y-3">

      {/* Past classes collapse (today only, when some are done) */}
      {isToday && !isDayDone && pastClasses.length > 0 && (
        <>
          <button
            onClick={() => setShowPast(p => !p)}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900/40 ring-1 ring-white/5 text-xs text-zinc-400 hover:bg-zinc-900/60 transition-all"
          >
            <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${showPast ? "rotate-90" : ""}`} />
            {showPast ? "Hide" : "Show"} {pastClasses.length} past {pastClasses.length === 1 ? "class" : "classes"}
            <div className="ml-auto flex gap-1">
              {pastClasses.map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/10" />
              ))}
            </div>
          </button>

          <AnimatePresence initial={false}>
            {showPast && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden space-y-3"
              >
                {pastClasses.map((c, i) =>
                  renderClassCard(c, i, selectedDayClasses.indexOf(c), true)
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* All classes done today — collapsed by default */}
      {isToday && isDayDone && (
        <>
          {/* End of day message first */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-5 py-4 rounded-xl bg-zinc-900/40 ring-1 ring-white/5"
          >
            <Sunset className="w-4 h-4 shrink-0 text-emerald-400/70" />
            <p className="text-xs text-zinc-400">{endMsg}</p>
          </motion.div>

          {/* Collapsed classes toggle */}
          <button
            onClick={() => setShowPast(p => !p)}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900/40 ring-1 ring-white/5 text-xs text-zinc-400 hover:bg-zinc-900/60 transition-all"
          >
            <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${showPast ? "rotate-90" : ""}`} />
            {showPast ? "Hide" : "Show"} today's {selectedDayClasses.length} {selectedDayClasses.length === 1 ? "class" : "classes"}
            <div className="ml-auto flex gap-1">
              {selectedDayClasses.map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/10" />
              ))}
            </div>
          </button>

          <AnimatePresence initial={false}>
            {showPast && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden space-y-3"
              >
                {selectedDayClasses.map((c, i) =>
                  renderClassCard(c, i, i, true)
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Current + future classes (today), or all classes (other days) */}
      {classesToAlwaysShow.map((c, i) =>
        renderClassCard(c, i, selectedDayClasses.indexOf(c), false)
      )}

      {/* Assignments due */}
      {dayAssignments.length > 0 && (() => {
        return (
          <div className="pt-4 mt-3 border-t border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-0.5 h-4 rounded-full bg-emerald-400/60" />
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Assignments due</p>
              <span className="text-[9px] text-zinc-600 font-bold">{dayAssignments.length}</span>
            </div>
            <div className="space-y-2">
              {dayAssignments.map((a: any) => {
                const nextStatus = a.status === "todo" ? "in_progress" : a.status === "in_progress" ? "done" : "todo"
                return (
                  <div key={a.id}
                    className="group bg-zinc-900/40 ring-1 ring-white/5 rounded-2xl p-4 hover:ring-zinc-700 hover:bg-zinc-900/60 transition-all relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="flex items-center gap-3 relative z-10">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ring-1 ${
                        a.priority === "high" ? "bg-rose-500/10 ring-rose-500/20" : a.priority === "medium" ? "bg-amber-400/10 ring-amber-400/20" : "bg-emerald-500/10 ring-emerald-500/20"
                      }`}>
                        <Clock3 className={`w-4 h-4 ${a.priority === "high" ? "text-rose-400" : a.priority === "medium" ? "text-amber-400" : "text-emerald-400"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-zinc-200">{a.title}</p>
                          {a.course && (
                            <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg ring-1 text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
                              {a.course}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {a.dueTime ? `Due by ${a.dueTime}` : "All day"}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => updateAssignment?.(a.id, { status: nextStatus })}
                            className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg ring-1 transition-all hover:opacity-80 ${
                              nextStatus === "in_progress"
                                ? "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
                                : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                            }`}>
                            {nextStatus === "in_progress" ? "In Progress" : "Done"}
                          </button>
                          <button onClick={() => removeAssignment?.(a.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-all">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}

    </div>
  )
}

type TabType = "dashboard" | "timetable" | "attendance" | "courses" | "marks" | "calendar" | "gradex" | "about" | "planner" | "notes" | "updates"

// ─── Main component ──────────────────────────────────────────────────────────

export function TimetableSection({ onNavigate }: { onNavigate?: (tab: TabType) => void }) {
  const {
    isAuthenticated, timetable, timetableMetadata,
    courses, calendar, dateToDoMap, attendance,
    isLoading, refreshData, user,
  } = useAuth()
  const { customClasses, assignments, updateAssignment, removeAssignment } = useCustomPlanner()

  const [isLoginOpen,      setIsLoginOpen]      = useState(false)
  const [viewMode,         setViewMode]          = useState<"today" | "list" | "week">("today")
  // Grid popout — stores the class data + slot info when a cell is tapped
  const [selectedCell,     setSelectedCell]      = useState<{ class: any; slot: any; isNow: boolean } | null>(null)
  const [selectedHoliday,  setSelectedHoliday]   = useState<{ name: string; date: string } | null>(null)
  const [isExporting,      setIsExporting]       = useState(false)
  const [showDayOrder,     setShowDayOrder]      = useState(false)
  const dayButtonRefs = useRef<(HTMLButtonElement | null)[]>([])
  const dayScrollRef  = useRef<HTMLDivElement | null>(null)

  const [baseDate, setBaseDate] = useState(() => getThisWeekSunday())
  const weekDays = useMemo(() => getWeekDaysFrom(baseDate), [baseDate])
  const navStartDate = useMemo(() => {
    const d = new Date(baseDate)
    d.setDate(baseDate.getDate() - 7)
    return d
  }, [baseDate])
  const navDays = useMemo(() => getDaysFrom(navStartDate, 21), [navStartDate])

  const [selectedDayIndex, setSelectedDayIndex] = useState(() => new Date().getDay() + 7)

  useEffect(() => {
    const el = dayScrollRef.current
    const btn = dayButtonRefs.current[selectedDayIndex]
    if (el && btn) {
      const containerRect = el.getBoundingClientRect()
      const btnRect = btn.getBoundingClientRect()
      el.scrollLeft += btnRect.left - containerRect.left - el.offsetWidth / 2 + btn.offsetWidth / 2
    }
  }, [selectedDayIndex, baseDate])

  // Scroll to center on initial mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const el = dayScrollRef.current
      const btn = dayButtonRefs.current[selectedDayIndex]
      if (el && btn) {
        const containerRect = el.getBoundingClientRect()
        const btnRect = btn.getBoundingClientRect()
        el.scrollLeft += btnRect.left - containerRect.left - el.offsetWidth / 2 + btn.offsetWidth / 2
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const selectedDay   = navDays[selectedDayIndex]
  const currentHour   = getCurrentHour()

  const goToPrevDay = () => {
    if (selectedDayIndex > 0) { setSelectedDayIndex((p) => p - 1) }
    else { const nb = new Date(baseDate); nb.setDate(baseDate.getDate() - 7); setBaseDate(nb); setSelectedDayIndex(6) }
  }
  const goToNextDay = () => {
    if (selectedDayIndex < navDays.length - 1) { setSelectedDayIndex((p) => p + 1) }
    else { const nb = new Date(baseDate); nb.setDate(baseDate.getDate() + 7); setBaseDate(nb); setSelectedDayIndex(14) }
  }
  const goToToday = () => { setBaseDate(getThisWeekSunday()); setSelectedDayIndex(new Date().getDay() + 7) }

  const dayOrderToClasses = useMemo(() => {
    const map: Record<number, typeof timetable> = {}
    timetable.forEach((slot) => {
      const do_ = slot.day_order
      if (!map[do_]) map[do_] = []
      if (!map[do_].find((s: any) => s.hour === slot.hour && s.code === slot.code)) map[do_].push(slot)
    })
    Object.keys(map).forEach((k) => map[Number(k)].sort((a: any, b: any) => a.hour - b.hour))
    return map
  }, [timetable])

  const exportDayOrderClasses = useMemo(() => {
    const map: Record<number, any[]> = {}
    Object.entries(dayOrderToClasses).forEach(([dayOrder, slots]) => {
      map[Number(dayOrder)] = [...slots]
    })
    customClasses.forEach((item) => {
      if (item.repeatMode !== "day_order" || !item.dayOrder) return
      const dayOrder = item.dayOrder
      if (!map[dayOrder]) map[dayOrder] = []
      getCoveredHoursForClass(item.startTime, item.endTime).forEach((hour) => {
        map[dayOrder].push({
          ...item,
          hour,
          time: `${item.startTime} - ${item.endTime}`,
          custom: true,
        })
      })
    })
    Object.keys(map).forEach((key) => {
      map[Number(key)] = map[Number(key)].sort((a: any, b: any) => (a.hour - b.hour) || `${a.time || ""}`.localeCompare(`${b.time || ""}`))
    })
    return map
  }, [customClasses, dayOrderToClasses])

  const finalDateToDayOrder = dateToDoMap || timetableMetadata?.dateTodayOrder
  const customClassesByDate = useMemo(() => expandCustomClassesByDate(customClasses, finalDateToDayOrder), [customClasses, finalDateToDayOrder])

  const dateToHoliday = useMemo(() => {
    const map: Record<string, string> = {}
    calendar.forEach((event: any) => {
      if (event.type === "holiday" || event.type === "event") {
        map[event.date] = event.title.replace(/ - Holiday$/i, "").replace(/ - holiday$/i, "").trim()
      }
    })
    return map
  }, [calendar])

  const dateToClasses = useMemo(() => {
    const map: Record<string, typeof timetable> = {}

    // Group timetable entries directly by their date field
    timetable.forEach((slot) => {
      if (!slot.date) return
      if (!map[slot.date]) map[slot.date] = []
      if (!map[slot.date].find((s: any) => s.hour === slot.hour && s.code === slot.code)) {
        map[slot.date].push(slot)
      }
    })

    // Sort each date's classes by hour
    Object.keys(map).forEach((date) => {
      map[date].sort((a: any, b: any) => a.hour - b.hour)
    })

    // Ensure visible navigation dates exist — fall back to day_order-based schedule
    navDays.forEach((day) => {
      if (!map[day.date] && !day.isWeekend) {
        const dayOrder = finalDateToDayOrder[day.date]
        if (dayOrder && dayOrderToClasses[dayOrder]) {
          map[day.date] = dayOrderToClasses[dayOrder].map((slot: any) => ({
            ...slot,
            date: day.date,
            day: new Date(day.date).toLocaleDateString("en-US", { weekday: "short" }).toLowerCase(),
          }))
        } else {
          map[day.date] = []
        }
      }
    })

    // Merge custom classes
    Object.entries(customClassesByDate).forEach(([date, entries]) => {
      const mapped = entries.flatMap((item) => {
        const coveredHours = getCoveredHoursForClass(item.startTime, item.endTime)
        return coveredHours.map((hour, index) => ({
          ...item,
          hour,
          day_order: finalDateToDayOrder[date] || 0,
          day_key: "",
          time: `${item.startTime} - ${item.endTime}`,
          custom: true,
          customPrimaryHour: index === 0,
        }))
      }) as any
      map[date] = [...(map[date] || []), ...mapped].sort((a: any, b: any) => (a.hour - b.hour) || `${a.time || ""}`.localeCompare(`${b.time || ""}`))
    })
    return map
  }, [navDays, timetable, finalDateToDayOrder, dayOrderToClasses, customClassesByDate])

  const selectedDayClasses = useMemo(() => {
    if (!selectedDay) return []
    const regularClasses = dateToClasses[selectedDay.date]?.filter((item: any) => !item.custom) || []
    const customEntries = (customClassesByDate[selectedDay.date] || []).map((item) => ({
      ...item,
      day_order: finalDateToDayOrder[selectedDay.date] || 0,
      day_key: "",
      time: `${item.startTime} - ${item.endTime}`,
      custom: true,
    }))
    return [...regularClasses, ...customEntries].sort((a: any, b: any) => (a.hour - b.hour) || `${a.time || ""}`.localeCompare(`${b.time || ""}`))
  }, [selectedDay, dateToClasses, customClassesByDate, finalDateToDayOrder])

  const selectedDayOrder = selectedDay ? finalDateToDayOrder[selectedDay.date] : undefined

  const getCourseDetails = (code: string) => {
    if (!courses || !Array.isArray(courses)) return undefined
    return courses.find((c: any) => c.code === code || c.courseCode === code)
  }

  const getAttendanceData = (code: string) => {
    if (!attendance || !Array.isArray(attendance)) return null
    return attendance.find((a: any) =>
      a.code === code || a.course_code === code ||
      code?.startsWith(a.code) || a.code?.startsWith(code)
    ) ?? null
  }

  const uniqueCourses = new Set(timetable.map((t: any) => t.code)).size
  const totalCredits  = Array.isArray(courses)
    ? Array.from(
        (courses as any[]).reduce((m, c) => { if (!m.has(c.code)) m.set(c.code, c); return m }, new Map()).values()
      ).reduce((s: number, c: any) => s + (c.credits || 0), 0)
    : 0

  const labHours = useMemo(() => {
    const seen = new Set<string>()
    timetable.forEach((s: any) => {
      if (s.type?.toLowerCase().includes("lab") || s.type?.toLowerCase().includes("practical"))
        seen.add(`${s.day_order}-${s.hour}-${s.code}`)
    })
    return seen.size
  }, [timetable])

  const handleExportDayOrders = async () => {
    try {
      setIsExporting(true)
      const canvas = document.createElement("canvas")
      const dayOrders = [1, 2, 3, 4, 5]
      const leftPad = 34
      const topPad = 112
      const timeColumnWidth = 160
      const dayColumnWidth = 212
      const headerHeight = 56
      const rowHeight = 74
      const tableWidth = timeColumnWidth + dayOrders.length * dayColumnWidth
      const tableHeight = headerHeight + TIME_SLOTS.length * rowHeight
      canvas.width = leftPad * 2 + tableWidth
      canvas.height = topPad + tableHeight + 48
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      ctx.fillStyle = "#09090b"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      bg.addColorStop(0, "#18181b")
      bg.addColorStop(1, "#09090b")
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = "#f4f4f5"
      ctx.font = "700 34px Inter, sans-serif"
      ctx.fillText("edutechsrm Timetable", leftPad, 52)
      ctx.fillStyle = "#a1a1aa"
      ctx.font = "500 16px Inter, sans-serif"
      ctx.fillText("All day orders exported together as a proper timetable grid.", leftPad, 80)

      const tableX = leftPad
      const tableY = topPad

      ctx.fillStyle = "rgba(24,24,27,0.95)"
      ctx.strokeStyle = "rgba(255,255,255,0.08)"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(tableX, tableY, tableWidth, tableHeight, 26)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = "rgba(52,211,153,0.12)"
      ctx.fillRect(tableX, tableY, tableWidth, headerHeight)

      ctx.strokeStyle = "rgba(255,255,255,0.08)"
      ctx.beginPath()
      ctx.moveTo(tableX + timeColumnWidth, tableY)
      ctx.lineTo(tableX + timeColumnWidth, tableY + tableHeight)
      ctx.stroke()

      dayOrders.forEach((dayOrder, index) => {
        const colX = tableX + timeColumnWidth + index * dayColumnWidth
        if (index > 0) {
          ctx.beginPath()
          ctx.moveTo(colX, tableY)
          ctx.lineTo(colX, tableY + tableHeight)
          ctx.stroke()
        }
        ctx.fillStyle = "#34d399"
        ctx.font = "700 15px Inter, sans-serif"
        ctx.fillText(`DAY ORDER ${dayOrder}`, colX + 18, tableY + 34)
      })

      ctx.fillStyle = "#d4d4d8"
      ctx.font = "700 15px Inter, sans-serif"
      ctx.fillText("TIME", tableX + 18, tableY + 34)

      TIME_SLOTS.forEach((timeSlot, rowIndex) => {
        const rowY = tableY + headerHeight + rowIndex * rowHeight
        const rowBottom = rowY + rowHeight

        ctx.strokeStyle = "rgba(255,255,255,0.06)"
        ctx.beginPath()
        ctx.moveTo(tableX, rowY)
        ctx.lineTo(tableX + tableWidth, rowY)
        ctx.stroke()

        ctx.fillStyle = rowIndex % 2 === 0 ? "rgba(255,255,255,0.018)" : "rgba(255,255,255,0.028)"
        ctx.fillRect(tableX, rowY, tableWidth, rowHeight)

        ctx.fillStyle = "#f4f4f5"
        ctx.font = "700 13px Inter, sans-serif"
        ctx.fillText(`Hour ${timeSlot.hour}`, tableX + 18, rowY + 26)
        ctx.fillStyle = "#a1a1aa"
        ctx.font = "500 12px Inter, sans-serif"
        ctx.fillText(timeSlot.time, tableX + 18, rowY + 48)

        dayOrders.forEach((dayOrder, colIndex) => {
          const cellX = tableX + timeColumnWidth + colIndex * dayColumnWidth
          const slot = (exportDayOrderClasses[dayOrder] || []).find((item) => item.hour === timeSlot.hour)

          if (!slot) {
            ctx.fillStyle = "rgba(161,161,170,0.08)"
            ctx.font = "500 11px Inter, sans-serif"
            ctx.fillText("—", cellX + 18, rowY + 40)
            return
          }

          const tone = slot.custom
            ? "#34d399"
            : slot.type?.toLowerCase().includes("lab")
              ? "#34d399"
              : slot.type?.toLowerCase().includes("theory")
                ? "#60a5fa"
                : "#fbbf24"

          ctx.fillStyle = `${tone}18`
          ctx.fillRect(cellX + 8, rowY + 8, dayColumnWidth - 16, rowHeight - 16)
          ctx.fillStyle = tone
          ctx.fillRect(cellX + 8, rowY + 8, 4, rowHeight - 16)

          ctx.fillStyle = tone
          ctx.font = "700 12px JetBrains Mono, monospace"
          ctx.fillText((slot.code || "CLASS").slice(0, 16), cellX + 18, rowY + 26)
          ctx.fillStyle = "#f4f4f5"
          ctx.font = "700 12px Inter, sans-serif"
          ctx.fillText((slot.name || "Unnamed class").slice(0, 22), cellX + 18, rowY + 44)
          ctx.fillStyle = "#a1a1aa"
          ctx.font = "500 10px Inter, sans-serif"
          ctx.fillText((slot.room || (slot.custom ? "Custom class" : slot.type || "Class")).slice(0, 24), cellX + 18, rowY + 60)
        })

        if (rowIndex === TIME_SLOTS.length - 1) {
          ctx.strokeStyle = "rgba(255,255,255,0.06)"
          ctx.beginPath()
          ctx.moveTo(tableX, rowBottom)
          ctx.lineTo(tableX + tableWidth, rowBottom)
          ctx.stroke()
        }
      })

      const dataUrl = canvas.toDataURL("image/png")
      if ((window as any).Android?.saveFile) {
        (window as any).Android.saveFile(dataUrl, "edutechsrm-timetable.png")
      } else {
        const link = document.createElement("a")
        link.href = dataUrl
        link.download = "edutechsrm-timetable.png"
        link.click()
      }
    } finally {
      setIsExporting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-full pt-[3.75rem] pb-20 px-3 sm:px-4 lg:px-8 lg:pb-8 w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/60 ring-1 ring-white/5  rounded-3xl p-8  overflow-hidden relative text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center bg-emerald-500/10 ring-1 ring-emerald-500/20">
            <BookOpen className="w-7 h-7 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold text-zinc-100 tracking-tight font-display mb-4">Connect to View Timetable</h2>
          <p className="text-sm mb-8 max-w-xs mx-auto px-4 text-zinc-500">
            Login with your SRM Academia credentials to sync your timetable.
          </p>
          <motion.button whileTap={{ scale: 0.96 }} onClick={() => setIsLoginOpen(true)}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20  px-6 py-3 rounded-xl transition-all border border-emerald-500/20">
            <LogIn className="w-4 h-4" /> Connect to SRM Academia
          </motion.button>
        </motion.div>
        <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      </div>
    )
  }

  return (
    <div className="min-h-full pt-[3.75rem] pb-20 px-3 sm:px-4 lg:px-8 lg:pb-8 w-full">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest">Weekly Rhythm</p>
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-1.5">
                <motion.button whileTap={{ scale: 0.9 }} onClick={handleExportDayOrders}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20  px-4 py-2 rounded-xl transition-all border border-emerald-500/20">
                  <Download className={`w-3.5 h-3.5 ${isExporting ? "animate-pulse" : ""}`} />
                  {isExporting ? "..." : "Download"}
                </motion.button>
                <motion.button whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    window.history.replaceState(null, "", "#custom-class")
                    onNavigate?.("about")
                  }}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20  px-4 py-2 rounded-xl transition-all border border-emerald-500/20">
                  <BookOpen className="w-3.5 h-3.5" />
                  Add class
                </motion.button>
              </div>
              <AIPromoBadge page="timetable" />
              <div className="flex bg-zinc-900 rounded-lg p-0.5 border border-white/5 shadow-inner">
                {(["today", "list", "week"] as const).map((mode, i) => (
                  <motion.button key={mode} whileTap={{ scale: 0.9 }} onClick={() => setViewMode(mode)}
                    className={`h-7 w-7 flex items-center justify-center rounded transition-all ${
                      viewMode === mode
                        ? "bg-zinc-800 text-zinc-100 shadow-md border border-white/5"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}>
                    {i === 0 ? <Calendar className="w-3.5 h-3.5" /> : i === 1 ? <List className="w-3.5 h-3.5" /> : <Grid3X3 className="w-3.5 h-3.5" />}
                  </motion.button>
                ))}
              </div>
              <motion.button whileTap={{ scale: 0.9 }} onClick={refreshData} disabled={isLoading}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-zinc-500 bg-zinc-900/60 ring-1 ring-white/5 hover:text-zinc-300 transition-all disabled:opacity-40">
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              </motion.button>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-zinc-100 tracking-tight font-display">My Timetable</h1>
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-zinc-800/60 text-zinc-300 ring-1 ring-white/5">
                  {user?.specialization || timetableMetadata?.section || "CS AIML"}
                </span>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-zinc-800/60 text-zinc-300 ring-1 ring-white/5">
                  Batch {timetableMetadata?.batch || "1"}
                </span>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-zinc-800/60 text-zinc-300 ring-1 ring-white/5">
                  {uniqueCourses} courses
                </span>
              </div>
            </div>

            {/* Day order info popup */}
            {selectedDayOrder && (
              <div className="shrink-0">
                <div className="bg-zinc-900/80 ring-1 ring-white/5 rounded-xl px-3 py-2 ">
                  <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-500 mb-0.5">Day Order</p>
                  <p className="text-base font-black text-zinc-100 font-display text-center">{selectedDayOrder}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Mobile action buttons */}
        <div className="md:hidden flex items-center gap-2 mb-6">
          <motion.button whileTap={{ scale: 0.98 }} onClick={handleExportDayOrders}
            className="flex-1 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20  px-4 py-3 rounded-xl transition-all border border-emerald-500/20">
            <Download className={`w-4 h-4 ${isExporting ? "animate-pulse" : ""}`} />
            {isExporting ? "..." : "Download"}
          </motion.button>
          <motion.button whileTap={{ scale: 0.98 }}
            onClick={() => {
              window.history.replaceState(null, "", "#custom-class")
              onNavigate?.("about")
            }}
            className="flex-1 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20  px-4 py-3 rounded-xl transition-all border border-emerald-500/20">
            <BookOpen className="w-4 h-4" />
            Add class
          </motion.button>
        </div>

        {/* ── 3-Week Navigation ── */}
        {viewMode === "today" && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-zinc-900 ring-1 ring-white/5 shadow-inner lg:justify-center">
              <motion.button whileTap={{ scale: 0.9 }} onClick={goToPrevDay}
                className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 text-zinc-500 hover:text-zinc-300 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </motion.button>

              <div ref={dayScrollRef} className="min-w-0 flex-1 max-w-[360px] overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex min-w-max gap-1 px-0.5 lg:justify-center">
                  {navDays.map((day, index) => {
                    const isSelected = selectedDayIndex === index
                    const holiday    = dateToHoliday[day.date]
                    const isHoliday  = holiday && !day.isWeekend && !finalDateToDayOrder[day.date]
                    return (
                      <motion.button
                        key={day.date}
                        ref={(node) => { dayButtonRefs.current[index] = node }}
                        whileTap={{ scale: 0.93 }}
                        onClick={() => setSelectedDayIndex(index)}
                        className={`flex flex-col items-center min-w-[68px] py-2.5 px-2 rounded-lg transition-all ${
                          isSelected
                            ? "bg-zinc-800 shadow-md border border-white/5"
                            : "bg-transparent border border-transparent"
                        }`}
                      >
                        <span className={`text-[9px] uppercase font-bold tracking-wider ${isSelected ? "text-emerald-400" : "text-zinc-500"}`}>{day.shortDay}</span>
                        <span className={`text-base font-black leading-tight ${isSelected ? "text-emerald-400" : day.isToday ? "text-zinc-100" : "text-zinc-400"}`}>{day.dayNum}</span>
                        {day.isToday ? (
                          <span className={`text-[8px] font-black mt-0.5 ${isSelected ? "text-emerald-400" : "text-emerald-400/70"}`}>TODAY</span>
                        ) : isHoliday ? (
                          <span className={`text-[8px] font-bold mt-0.5 ${isSelected ? "text-emerald-400" : "text-emerald-400/60"}`}>H</span>
                        ) : day.isWeekend ? (
                          <span className={`text-[8px] mt-0.5 ${isSelected ? "text-zinc-400" : "text-zinc-600"}`}>W</span>
                        ) : null}
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              <motion.button whileTap={{ scale: 0.9 }} onClick={goToNextDay}
                className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 text-zinc-500 hover:text-zinc-300 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>

            {!selectedDay?.isToday && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mt-3">
                <motion.button whileTap={{ scale: 0.95 }} onClick={goToToday}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20  px-4 py-2 rounded-xl transition-all border border-emerald-500/20">
                  <Calendar className="w-3.5 h-3.5" /> Back to Today
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── Views ── */}
        <AnimatePresence mode="wait">

          {/* Today / Day view */}
          {viewMode === "today" && (
            <motion.div
              key={selectedDay?.date}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {/* Day header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    (selectedDay && dateToHoliday[selectedDay.date] && !selectedDayOrder) ? "bg-emerald-400" :
                    selectedDay?.isWeekend ? "bg-zinc-500" : "bg-emerald-400"
                  }`} />
                  <h2 className="text-lg font-bold text-zinc-100 tracking-tight">{selectedDay?.dayName}</h2>
                </div>
                <p className="text-xs text-zinc-500">{selectedDay?.dayNum} {selectedDay?.month}</p>
              </div>

              {/* Class list — no IIFE, no bracket artifacts */}
              <DayClassesList
                selectedDayClasses={selectedDayClasses}
                selectedDay={selectedDay}
                currentHour={currentHour}
                getCourseDetails={getCourseDetails}
                getAttendanceData={getAttendanceData}
                dateToHoliday={dateToHoliday}
                assignments={assignments}
                updateAssignment={updateAssignment}
                removeAssignment={removeAssignment}
              />
            </motion.div>
          )}

          {/* List view */}
          {viewMode === "list" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {weekDays.map((day, di) => {
                const dayOrder   = finalDateToDayOrder[day.date]
                const holiday    = dateToHoliday[day.date]
                const dayClasses = (!day.isWeekend && (!holiday || dayOrder))
                  ? (dateToClasses[day.date] || []).sort((a: any, b: any) => a.hour - b.hour)
                  : []

                return (
                  <motion.div key={day.date}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: di * 0.05 }}
                    className={`bg-zinc-900/60 ring-1  rounded-3xl  overflow-hidden relative ${
                      day.isToday ? "ring-emerald-500/30" : "ring-white/5"
                    }`}
                  >
                    {/* Day header */}
                    <div className="flex items-center justify-between px-6 py-3 border-b border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <p className={`text-[10px] font-bold uppercase tracking-widest ${day.isToday ? "text-emerald-400" : day.isWeekend ? "text-zinc-600" : "text-zinc-500"}`}>
                            {day.shortDay}
                          </p>
                          <p className={`text-lg font-black leading-none ${day.isToday ? "text-emerald-400" : day.isWeekend ? "text-zinc-600" : "text-zinc-100"}`}>
                            {day.dayNum}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {dayOrder && !day.isWeekend && (
                            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg text-emerald-400 bg-emerald-500/10 ring-1 ring-emerald-500/20">
                              DO {dayOrder}
                            </span>
                          )}
                          {day.isToday && (
                            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg text-emerald-400 bg-emerald-500/10 ring-1 ring-emerald-500/20">
                              Today
                            </span>
                          )}
                          {holiday && !dayOrder && (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg text-emerald-400 bg-emerald-500/10 ring-1 ring-emerald-500/20">
                              <HolidayIcon size="w-4 h-4" /> Holiday
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] text-zinc-500">
                        {dayClasses.length > 0 ? `${dayClasses.length} class${dayClasses.length > 1 ? "es" : ""}` : ""}
                      </span>
                    </div>

                    {day.isWeekend ? (
                      <div className="px-6 py-5 flex items-center gap-2">
                        <motion.div
                          animate={{ y: [0, -2, 0], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <Moon className="w-3.5 h-3.5 text-zinc-500" />
                        </motion.div>
                        <span className="text-xs text-zinc-500">Weekend</span>
                      </div>
                    ) : holiday && !dayOrder ? (
                      <div className="px-6 py-5 flex items-center gap-2">
                        <span className="text-xs text-emerald-400"><HolidayIcon size="w-4 h-4" /> {holiday}</span>
                      </div>
                    ) : dayClasses.length === 0 ? (
                      <div className="px-6 py-5">
                        <span className="text-xs text-zinc-500">No classes scheduled</span>
                      </div>
                    ) : (
                      <div className="divide-y divide-white/[0.04]">
                        {dayClasses.map((c: any) => {
                          const slot      = TIME_SLOTS.find(s => s.hour === c.hour)
                          const typeColors: Record<string, string> = {
                            Theory: "#60a5fa", Lab: "#34d399", Practical: "#34d399", "Lab Based Theory": "#a78bfa",
                          }
                          const barColor  = typeColors[c.type] || "#2dd4bf"
                          const isCurrent = day.isToday && currentHour === c.hour
                          return (
                            <div key={`${day.date}-${c.hour}`}
                              className="flex items-center gap-4 px-6 py-3 relative transition-colors"
                              style={{ background: isCurrent ? "rgba(16,185,129,0.03)" : "transparent" }}>
                              {isCurrent && (
                                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-400 " />
                              )}
                              <div className="w-0.5 h-8 rounded-full shrink-0"
                                style={{ background: barColor, boxShadow: `0 0 6px ${barColor}60` }} />
                              <div className="shrink-0 w-12">
                                <p className={`text-[10px] font-black tabular-nums ${isCurrent ? "text-emerald-400" : "text-zinc-400"}`}>{slot?.short}</p>
                                <p className="text-[8px] text-zinc-600">Hr {c.hour}</p>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold truncate text-zinc-200">{c.name}</p>
                                <p className="text-[10px] truncate text-zinc-500">
                                  {c.room && <span>{c.room} · </span>}{c.code}
                                </p>
                              </div>
                              <span className={`text-[9px] font-bold px-2 py-1 rounded-lg shrink-0 ring-1 ${
                                c.type?.toLowerCase().includes("lab based") ? "text-amber-400 bg-amber-500/10 ring-amber-500/20" :
                                c.type?.toLowerCase() === "theory" ? "text-purple-400 bg-purple-500/10 ring-purple-500/20" :
                                c.type?.toLowerCase().includes("practical") || c.type?.toLowerCase() === "lab" ? "text-blue-400 bg-blue-500/10 ring-blue-500/20" :
                                "text-emerald-400 bg-emerald-500/10 ring-emerald-500/20"
                              }`}>
                                {c.type === "Lab Based Theory" ? "LBT" : c.type?.slice(0, 3)}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </motion.div>
          )}

          {/* Week Grid — compact scrollable table with tap-to-expand */}
          {viewMode === "week" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-[10px] text-center mb-3 text-zinc-500">← Scroll horizontally · Tap a class for details →</p>
              <div className="bg-zinc-900/60 ring-1 ring-white/5  rounded-3xl  overflow-hidden relative">
                <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden" style={{ WebkitOverflowScrolling: "touch" }}>
                  <div style={{ minWidth: 580 }}>

                    {/* Day headers */}
                    <div style={{ display: "grid", gridTemplateColumns: "48px repeat(7, 1fr)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="text-zinc-600 text-[9px] text-center py-2" />
                      {weekDays.map((day) => {
                        const dayOrder = finalDateToDayOrder[day.date]
                        const holiday  = dateToHoliday[day.date]
                        return (
                          <div key={day.date} style={{
                            padding: "8px 4px", textAlign: "center",
                            background: day.isToday ? "rgba(16,185,129,0.06)" : day.isWeekend ? "rgba(255,255,255,0.01)" : "transparent",
                            borderLeft: "1px solid rgba(255,255,255,0.04)",
                          }}>
                            <p className={`text-[9px] font-bold uppercase tracking-wider m-0 ${day.isToday ? "text-emerald-400" : day.isWeekend ? "text-zinc-600" : "text-zinc-500"}`}>
                              {day.shortDay}
                            </p>
                            <p className={`text-sm font-black m-0 leading-tight ${day.isToday ? "text-emerald-400" : day.isWeekend ? "text-zinc-600" : "text-zinc-100"}`}>
                              {day.dayNum}
                            </p>
                            {dayOrder && !day.isWeekend && (
                              <p className="text-[8px] text-emerald-400 m-0 font-bold">DO{dayOrder}</p>
                            )}
                            {holiday && !dayOrder && (
                              <button
                                onClick={() => setSelectedHoliday({ name: holiday, date: day.date })}
                                className="text-[10px] m-0 bg-none border-none cursor-pointer p-0 leading-none"
                                title={holiday}>
                            <HolidayIcon size="w-7 h-7" />
                              </button>
                            )}
                            {day.isToday && <p className="text-[7px] text-emerald-400 font-black m-0 tracking-wider">TODAY</p>}
                          </div>
                        )
                      })}
                    </div>

                    {/* Time slot rows */}
                    {TIME_SLOTS.slice(0, 10).map((slot, si) => (
                      <div key={slot.hour} style={{
                        display: "grid", gridTemplateColumns: "48px repeat(7, 1fr)",
                        borderBottom: si < 9 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      }}>
                        {/* Time label */}
                        <div className="flex flex-col items-center justify-center py-1 px-0.5 border-r border-white/[0.04] bg-white/[0.01]">
                          <span className="text-[9px] font-bold text-zinc-500">{slot.short}</span>
                          <span className="text-[7px] text-zinc-600">H{slot.hour}</span>
                        </div>

                        {/* Day cells */}
                        {weekDays.map((day) => {
                          const dayOrder  = finalDateToDayOrder[day.date]
                          const holiday   = dateToHoliday[day.date]
                          const classData = (!day.isWeekend && (!holiday || dayOrder))
                            ? (dateToClasses[day.date] || []).find((s: any) => s.hour === slot.hour)
                            : null
                          const isCurrent = day.isToday && currentHour === slot.hour
                          const typeColors: Record<string, string> = {
                            Theory: "#60a5fa", Lab: "#34d399", Practical: "#34d399", "Lab Based Theory": "#a78bfa",
                          }
                          const col = classData ? (typeColors[classData.type] || "#2dd4bf") : null

                          return (
                            <div key={`${day.date}-${slot.hour}`}
                              onClick={() => {
                                if (classData && col) {
                                  setSelectedCell({ class: classData, slot, isNow: isCurrent })
                                } else if (holiday && !day.isWeekend && !dayOrder && slot.hour === 1) {
                                  setSelectedHoliday({ name: holiday, date: day.date })
                                }
                              }}
                              className="relative overflow-hidden transition-colors"
                              style={{
                                minHeight: 52, borderLeft: "1px solid rgba(255,255,255,0.04)",
                                background: isCurrent && classData ? "rgba(16,185,129,0.06)"
                                  : day.isWeekend ? "rgba(255,255,255,0.01)"
                                  : holiday && !dayOrder ? "rgba(16,185,129,0.03)"
                                  : "transparent",
                                outline: isCurrent && classData ? "1px solid rgba(16,185,129,0.3)" : "none",
                                cursor: classData ? "pointer" : holiday && !day.isWeekend && !dayOrder ? "pointer" : "default",
                              }}>

                              {/* Holiday first hour — shows name abbreviated */}
                              {holiday && !day.isWeekend && !dayOrder && slot.hour === 1 && (
                                <div className="h-full flex flex-col items-center justify-center py-0.5 px-0.5 gap-0.5">
                                  <span className="text-[11px]"><HolidayIcon size="w-4 h-4" /></span>
                                  <span className="text-[7px] text-emerald-400 text-center leading-tight font-bold line-clamp-2">
                                    {holiday}
                                  </span>
                                </div>
                              )}

                              {/* Class cell — tappable */}
                              {classData && col && (
                                <>
                                  {/* Active pulse ring */}
                                  {isCurrent && (
                                    <div className="absolute inset-0 border border-emerald-400 opacity-60 pointer-events-none" style={{ animation: "pulse 2s infinite" }} />
                                  )}
                                  <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ background: col, boxShadow: `0 0 4px ${col}` }} />
                                  <div className="p-1 pl-1.5">
                                    <p className="text-[9px] font-bold text-zinc-200 m-0 leading-tight line-clamp-2">
                                      {classData.name}
                                    </p>
                                    <p className="text-[7px] m-0 mt-0.5 font-bold" style={{ color: col }}>
                                      {classData.type === "Lab Based Theory" ? "LBT" : classData.type?.slice(0,3)}
                                    </p>
                                    {classData.room && (
                                      <p className="text-[7px] text-zinc-500 m-0">{classData.room}</p>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Class detail popout ── */}
              <AnimatePresence>
                {selectedCell && (
                  <>
                    {/* Backdrop */}
                    <motion.div
                      key="cell-backdrop"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                      onClick={() => setSelectedCell(null)}
                    />

                    {/* Bottom sheet */}
                    <motion.div
                      key="cell-sheet"
                      initial={{ y: "100%", opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: "100%", opacity: 0 }}
                      transition={{ type: "spring", damping: 28, stiffness: 340 }}
                      className="fixed bottom-0 left-0 right-0 z-50 max-w-[480px] mx-auto bg-zinc-900/80 backdrop-blur-md border border-white/5 shadow-2xl rounded-t-3xl overflow-hidden"
                    >
                      {/* Drag handle */}
                      <div className="flex justify-center pt-3 pb-1">
                        <div className="w-9 h-1 rounded-full bg-white/15" />
                      </div>

                      {(() => {
                        const c  = selectedCell.class
                        const ts = selectedCell.slot
                        const typeColors: Record<string, string> = {
                          Theory: "#60a5fa", Lab: "#34d399", Practical: "#34d399", "Lab Based Theory": "#a78bfa",
                        }
                        const col = typeColors[c.type] || "#2dd4bf"
                        const att = getAttendanceData(c.code)
                        const attPct = att ? att.percentage : null
                        const courseDetails = getCourseDetails(c.code)

                        return (
                          <div className="p-8">
                            {/* Header row */}
                            <div className="flex items-start justify-between gap-3 mb-4">
                              <div className="flex-1 min-w-0">
                                {selectedCell.isNow && (
                                  <div className="flex items-center gap-1.5 mb-2">
                                    <span className="relative flex h-1.5 w-1.5">
                                      <span className="animate-ping absolute inset-0 rounded-full opacity-75 bg-emerald-400" />
                                      <span className="relative rounded-full h-1.5 w-1.5 bg-emerald-400" />
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                                      Happening Now
                                    </span>
                                  </div>
                                )}
                                <p className="text-[10px] font-mono font-bold text-emerald-400 mb-1">{c.code}</p>
                                <p className="text-base font-bold text-zinc-100 leading-snug">{c.name}</p>
                              </div>
                              <button onClick={() => setSelectedCell(null)}
                                className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mt-1 bg-white/[0.06] ring-1 ring-white/10 text-zinc-500">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Type badge + time */}
                            <div className="flex items-center gap-2 mb-4">
                              <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg ring-1 ${
                                c.type?.toLowerCase().includes("lab based") ? "text-amber-400 bg-amber-500/10 ring-amber-500/20" :
                                c.type?.toLowerCase() === "theory" ? "text-purple-400 bg-purple-500/10 ring-purple-500/20" :
                                c.type?.toLowerCase().includes("practical") || c.type?.toLowerCase() === "lab" ? "text-blue-400 bg-blue-500/10 ring-blue-500/20" :
                                "text-emerald-400 bg-emerald-500/10 ring-emerald-500/20"
                              }`}>
                                {c.type}
                              </span>
                              <span className="text-[10px] font-semibold px-3 py-1.5 rounded-lg bg-white/[0.03] text-zinc-400 ring-1 ring-white/5">
                                {ts.time} · Hr {ts.hour}
                              </span>
                            </div>

                            {/* Info grid */}
                            <div className="grid grid-cols-2 gap-2 mb-4">
                              {[
                                { icon: MapPin, label: "Room",    value: c.room    || "—" },
                                { icon: User,   label: "Faculty", value: c.faculty || "—" },
                                { icon: Hash,   label: "Slot",    value: c.slot    || "—" },
                                { icon: Award,  label: "Credits", value: courseDetails ? `${courseDetails.credits} Cr` : "—" },
                              ].map(({ icon: Icon, label, value }) => (
                                <div key={label} className="rounded-xl px-3 py-2.5 bg-white/[0.03] ring-1 ring-white/5">
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                    <Icon className="w-2.5 h-2.5 text-zinc-500" />
                                    <p className="text-zinc-500 text-[9px] uppercase tracking-wider font-bold">{label}</p>
                                  </div>
                                  <p className="text-xs font-bold truncate text-zinc-200">{value}</p>
                                </div>
                              ))}
                            </div>

                            {/* Attendance bar */}
                            {att && attPct !== null && (
                              <div className="rounded-xl px-4 py-3 bg-white/[0.03] ring-1 ring-white/5">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Attendance</p>
                                  <p className={`text-sm font-black ${attPct >= 75 ? "text-emerald-400" : attPct >= 65 ? "text-amber-400" : "text-red-400"}`}>
                                    {attPct}%
                                  </p>
                                </div>
                                <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden shadow-inner ring-1 ring-white/5">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${attPct}%` }}
                                    transition={{ duration: 0.7, ease: "easeOut" }}
                                    className={`h-full rounded-full ${
                                      attPct >= 75 ? "bg-gradient-to-r from-emerald-500 to-emerald-400 "
                                        : attPct >= 65 ? "bg-gradient-to-r from-amber-500 to-amber-400 "
                                        : "bg-gradient-to-r from-red-500 to-red-400 "
                                    }`}
                                  />
                                </div>
                                <div className="flex justify-between mt-1.5">
                                  <p className="text-zinc-500 text-[9px]">{att.attended}/{att.total} classes</p>
                                  <p className="text-zinc-500 text-[9px]">Goal: 75%</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })()}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              {/* ── Holiday popout ── */}
              <AnimatePresence>
                {selectedHoliday && (
                  <>
                    <motion.div
                      key="hol-backdrop"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                      onClick={() => setSelectedHoliday(null)}
                    />
                    <motion.div
                      key="hol-sheet"
                      initial={{ y: "100%", opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: "100%", opacity: 0 }}
                      transition={{ type: "spring", damping: 28, stiffness: 340 }}
                      className="fixed bottom-0 left-0 right-0 z-50 max-w-[480px] mx-auto bg-zinc-900/80 backdrop-blur-md border border-emerald-500/15 shadow-2xl rounded-t-3xl overflow-hidden"
                      style={{ boxShadow: "0 -16px 60px rgba(0,0,0,0.7), 0 0 40px rgba(16,185,129,0.06)" }}
                    >
                      <div className="flex justify-center pt-3 pb-1">
                        <div className="w-9 h-1 rounded-full bg-white/15" />
                      </div>
                      <div className="p-8">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Holiday</p>
                          <button onClick={() => setSelectedHoliday(null)}
                            className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/[0.06] ring-1 ring-white/10 text-zinc-500">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 bg-emerald-500/10 ring-1 ring-emerald-500/20">
                            <HolidayIcon size="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-zinc-100 leading-tight">{selectedHoliday.name}</p>
                            <p className="text-xs mt-1 text-zinc-500">
                              {new Date(selectedHoliday.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                            </p>
                            <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg text-emerald-400 bg-emerald-500/10 ring-1 ring-emerald-500/20">
                              No classes scheduled
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

            </motion.div>
          )}

        </AnimatePresence>

        {/* ── Stats bar ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="mt-6 bg-zinc-900/60 ring-1 ring-white/5  rounded-2xl p-4 ">
          <div className="grid grid-cols-3 divide-x divide-white/5">
            {[
              { value: uniqueCourses,             label: "courses", color: "text-blue-400" },
              { value: totalCredits,              label: "credits", color: "text-emerald-400" },
              { value: selectedDayClasses.length, label: selectedDay?.isToday ? "today" : "classes", color: "text-teal-400" },
            ].map((stat, i) => (
              <div key={i} className="px-4 py-2 text-center">
                <p className={`text-lg font-black ${stat.color}`}>{stat.value}</p>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

    </div>
  )
}
