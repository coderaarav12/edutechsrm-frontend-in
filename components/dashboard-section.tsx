"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import gsap from "gsap"
import {
  AlertTriangle,
  Award,
  BarChart3,
  BookOpen,
  Bot,
  Calculator,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Coffee,
  Clock3,
  FileText,
  Heart,
  IdCard,
  Megaphone,
  Palette,
  Pencil,
  Sparkles,
  TrendingUp,
  ChevronRight,
  User,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { expandCustomClassesByDate, useCustomPlanner } from "@/lib/custom-planner"
import { InstallPrompt } from "@/components/install-prompt"
import { AiQuickInput } from "@/components/ai-quick-input"
import { ProfileAvatar } from "@/components/profile-avatar"
import { SupportModal } from "./support-modal"
import { useSupport } from "@/lib/use-support"
import { DEFAULT_ANNOUNCEMENTS } from "@/components/announcements"

type TabType = "dashboard" | "timetable" | "attendance" | "courses" | "marks" | "calendar" | "gradex" | "about" | "notes" | "feedback" | "updates" | "settings" | "ai" | "finder" | "calculator"

interface DashboardSectionProps {
  onNavigate: (tab: TabType) => void
}

const DOCK_APPS_KEY = "edutechsrm_dock_apps"
const ALL_DOCK_APP_IDS = ["timetable", "attendance", "courses", "marks", "calendar", "mess", "gradex", "notes", "finder", "calculator", "ai", "about"]

const NAV_ITEMS = [
  { id: "timetable" as const, icon: Clock3, color: "#22d3ee", label: "Timetable" },
  { id: "attendance" as const, icon: BarChart3, color: "#34d399", label: "Attendance" },
  { id: "courses" as const, icon: BookOpen, color: "#3b82f6", label: "Courses" },
  { id: "marks" as const, icon: Award, color: "#f59e0b", label: "Marks" },
  { id: "calendar" as const, icon: CalendarDays, color: "#a78bfa", label: "Calendar" },
  { id: "mess" as const, icon: Coffee, color: "#e11d48", label: "Mess Menu" },
  { id: "gradex" as const, icon: TrendingUp, color: "#fb923c", label: "GradeX" },
  { id: "notes" as const, icon: FileText, color: "#10b981", label: "Notes" },
  { id: "finder" as const, icon: IdCard, color: "#34d399", label: "Faculty Finder" },
  { id: "calculator" as const, icon: Calculator, color: "#f59e0b", label: "Calculator" },
  { id: "ai" as const, icon: Bot, color: "#a78bfa", label: "AI" },
  { id: "about" as const, icon: ClipboardCheck, color: "#f97316", label: "Assignments" },
]

function fmtLocalDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function isSameDate(a: string, b: string) {
  return a.slice(0, 10) === b.slice(0, 10)
}

function parseTimeToMinutes(value: string) {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return null
  let hours = Number(match[1])
  if (hours < 7) hours += 12
  return hours * 60 + Number(match[2])
}

function parseTimeRange(value?: string | null) {
  if (!value) return null
  const parts = value.split("-").map((part) => part.trim())
  if (parts.length !== 2) return null
  const start = parseTimeToMinutes(parts[0])
  const end = parseTimeToMinutes(parts[1])
  if (start === null || end === null) return null
  return { start, end, label: `${parts[0]} - ${parts[1]}` }
}

function StatNumber({ value, color }: { value: number; color: string }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const obj = { val: 0 }
    gsap.to(obj, {
      val: value,
      duration: 1,
      ease: "power3.out",
      onUpdate: () => {
        if (ref.current) ref.current.textContent = Math.round(obj.val).toString()
      },
    })
  }, [value])

  return <span ref={ref} className="tabular-nums" style={{ color }}>0</span>
}

function DockItem({ item, info, onNavigate }: {
  item: typeof NAV_ITEMS[number]
  info: { label: string; color: string } | null
  onNavigate: (tab: TabType) => void
}) {
  return (
    <button
      onClick={() => onNavigate(item.id)}
      className="relative flex flex-col items-center gap-0.5 px-2.5 sm:px-3 py-2 rounded-2xl active:scale-95 select-none hover:bg-white/[0.02] transition-colors duration-200"
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-transform duration-200 hover:scale-110 hover:-translate-y-0.5 bg-zinc-900/60 ring-1 ring-white/5">
        <item.icon className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px]" style={{ color: item.color }} />
        {info && (
          <div
            className="absolute -top-1 -right-1 px-1.5 py-[1px] rounded-full text-[7px] font-bold leading-tight"
            style={{
              background: info.color,
              color: "#0a0e14",
              boxShadow: `0 0 8px ${info.color}60`,
            }}
          >
            {info.label}
          </div>
        )}
      </div>
      <span className="text-[9px] sm:text-[10px] font-semibold tracking-tight leading-tight text-zinc-400">
        {item.label}
      </span>
    </button>
  )
}

let _splashShown = false

export function DashboardSection({ onNavigate }: DashboardSectionProps) {
  const auth = useAuth() as any
  const { user, attendance, marks, timetable, calendar, dateToDoMap, isLoading, refreshData, lastSyncTime, courses, token } = auth
  const { customClasses, assignments, updateAssignment } = useCustomPlanner()
  const [now, setNow] = useState(() => new Date())
  const [showSplash, setShowSplash] = useState(() => {
    if (_splashShown) return false
    _splashShown = true
    return true
  })
  const [dockApps, setDockApps] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(DOCK_APPS_KEY)
      return stored ? JSON.parse(stored) : ["timetable", "attendance", "courses", "marks", "finder", "calculator"]
    } catch { return ["timetable", "attendance", "courses", "marks", "finder", "calculator"] }
  })
  const [showDockCustomize, setShowDockCustomize] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const { isSupportOpen, handleSupportClick, closeSupport } = useSupport()

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)")
    setIsDesktop(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  useEffect(() => {
    try { localStorage.setItem(DOCK_APPS_KEY, JSON.stringify(dockApps)) } catch {}
  }, [dockApps])

  useEffect(() => {
    if (!showDockCustomize) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setShowDockCustomize(false) }
    window.addEventListener("keydown", onKey)
    const onClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node
      const popover = document.getElementById("dock-customize-popover")
      const trigger = document.getElementById("dock-customize-trigger")
      if (popover && !popover.contains(target) && trigger && !trigger.contains(target)) {
        setShowDockCustomize(false)
      }
    }
    document.addEventListener("mousedown", onClick)
    document.addEventListener("touchstart", onClick)
    return () => {
      window.removeEventListener("keydown", onKey)
      document.removeEventListener("mousedown", onClick)
      document.removeEventListener("touchstart", onClick)
    }
  }, [showDockCustomize])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1_000)
    return () => window.clearInterval(timer)
  }, [])

  const containerRef = useRef<HTMLDivElement>(null)
  const splashRef = useRef<HTMLDivElement>(null)
  const greetingLineRef = useRef<HTMLDivElement>(null)
  const nameLineRef = useRef<HTMLDivElement>(null)
  const shimmerRef = useRef<HTMLDivElement>(null)

  const headerRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const dockRef = useRef<HTMLDivElement>(null)
  const alertRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline()

      if (greetingLineRef.current && nameLineRef.current && shimmerRef.current && splashRef.current) {
        tl.from(greetingLineRef.current, { y: 24, opacity: 0, duration: 0.45, ease: "power3.out" })
        tl.from(nameLineRef.current, { y: 20, opacity: 0, duration: 0.35, ease: "power3.out" }, "-=0.1")
        tl.from(shimmerRef.current, { y: 20, opacity: 0, duration: 0.4, ease: "power3.out" }, "+=0.2")
        tl.to({}, { duration: 0.6 })
        tl.to(greetingLineRef.current, { y: -10, opacity: 0, duration: 0.3, ease: "power2.in" }, "+=0")
        tl.to(nameLineRef.current, { y: -10, opacity: 0, duration: 0.3, ease: "power2.in" }, "-=0.2")
        tl.to(shimmerRef.current, { y: -10, opacity: 0, duration: 0.25, ease: "power2.in" }, "-=0.2")
        tl.to(splashRef.current, { opacity: 0, duration: 0.45, ease: "power2.inOut", onComplete: () => setShowSplash(false) }, "-=0.1")
      }

      const dtl = gsap.timeline({ defaults: { ease: "power3.out" } })
      dtl.from(headerRef.current, { y: -12, opacity: 0, duration: 0.35 })
      dtl.from(statsRef.current, { y: 20, opacity: 0, duration: 0.5 }, "-=0.1")
      dtl.from(dockRef.current, { y: 20, opacity: 0, duration: 0.45 }, "-=0.2")
      dtl.from(alertRef.current, { y: 20, opacity: 0, duration: 0.4 }, "-=0.15")
      dtl.from(profileRef.current, { y: 16, opacity: 0, duration: 0.35 }, "-=0.1")
      dtl.from(bottomRef.current, { y: 12, opacity: 0, duration: 0.35 }, "-=0.05")
    }, containerRef)
    return () => ctx.revert()
  }, [])

  const todayStr = fmtLocalDateKey(now)
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const customClassesByDate = expandCustomClassesByDate(customClasses, dateToDoMap)

  const uniqueCourses: any[] = useMemo(() => {
    const byCode = new Map<string, any[]>()
    ;(courses as any[]).forEach((c: any) => {
      const list = byCode.get(c.code) || []
      list.push(c)
      byCode.set(c.code, list)
    })
    const result: any[] = []
    byCode.forEach((entries) => {
      if (entries.length === 1) { result.push(entries[0]); return }
      const names = entries.map(e => e.name?.trim().toLowerCase() || "")
      const firstName = names[0]
      const allRelated = names.every(n => n.includes(firstName) || firstName.includes(n))
      if (allRelated) {
        const best = entries.reduce((a, b) => (b.credits || 0) > (a.credits || 0) ? b : a)
        result.push(best)
      } else {
        result.push(...entries)
      }
    })
    return result
  }, [courses])
  const mergedAttendance = useMemo(() => {
    const attByCode = new Map((attendance || []).map((r: any) => [r.code, r]))
    return uniqueCourses.map((course: any) => {
      const code = String(course.code || "")
      const existing = attByCode.get(code)
      return existing || { code, name: course.name || code, attended: 0, total: 0, percentage: 0 }
    })
  }, [uniqueCourses, attendance])
  const attendanceWithData = mergedAttendance.filter((item: any) => item.total > 0)
  const riskyAttendance = attendanceWithData.filter((item: any) => item.percentage > 0 && item.percentage < 75).sort((a: any, b: any) => a.percentage - b.percentage)
  const overallAttended = attendanceWithData.reduce((sum: number, item: any) => sum + (item.attended || 0), 0)
  const overallTotal = attendanceWithData.reduce((sum: number, item: any) => sum + (item.total || 0), 0)
  const averageAttendance = overallTotal > 0 ? Math.round((overallAttended / overallTotal) * 100) : 0
  const mergedMarks = useMemo(() => {
    const marksByCode = new Map((marks || []).map((m: any) => [m.code, m]))
    return uniqueCourses.map(course => {
      const existing = marksByCode.get(course.code)
      return existing || { code: course.code, name: course.name, total: 0, maxTotal: 0 }
    })
  }, [uniqueCourses, marks])
  const lowMarks = mergedMarks
    .map((item: any) => ({
      ...item,
      percentage: item.maxTotal > 0 ? Math.round(((item.total ?? 0) / item.maxTotal) * 100) : 0,
    }))
    .filter((item: any) => item.maxTotal > 0 && item.percentage < 60)
    .sort((a: any, b: any) => a.percentage - b.percentage)
  const totalMarks = mergedMarks.reduce((sum: number, item: any) => sum + (item.total ?? 0), 0)
  const maxMarks = mergedMarks.reduce((sum: number, item: any) => sum + (item.maxTotal ?? 0), 0)
  const marksPercent = maxMarks > 0 ? Math.round((totalMarks / maxMarks) * 100) : 0

  const mergedClasses = [
    ...timetable,
    ...Object.values(customClassesByDate).flat().map((item) => ({
      ...item,
      time: `${item.startTime} - ${item.endTime}`,
      custom: true,
    })),
  ] as any[]
  const todaysClasses = mergedClasses
    .filter((slot) => slot.date && isSameDate(slot.date, todayStr))
    .sort((a, b) => (parseTimeRange(a.time)?.start ?? 0) - (parseTimeRange(b.time)?.start ?? 0))
  const currentClass = todaysClasses.find((slot) => {
    const range = parseTimeRange(slot.time)
    return range ? nowMinutes >= range.start && nowMinutes < range.end : false
  })
  const nextClass = [...mergedClasses]
    .filter((slot) => slot.date && slot.time)
    .map((slot) => {
      const range = parseTimeRange(slot.time)
      return { ...slot, startMin: range?.start ?? 0, endMin: range?.end ?? 0 }
    })
    .filter((slot) => {
      if (slot.date < todayStr) return false
      if (slot.date === todayStr && slot.endMin <= nowMinutes) return false
      return true
    })
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date)
      return a.startMin - b.startMin
    })[0] ?? null
  const todayEvents = calendar.filter((event) => event.date === todayStr)
  const todayHoliday = todayEvents.find((event) => event.type === "holiday")
  const isWeekend = now.getDay() === 0 || now.getDay() === 6

  const todayDueAssignments = (assignments || []).filter((a: any) => a.status !== "done" && a.dueDate === todayStr)
  const upcomingAssignment = (assignments || [])
    .filter((a: any) => a.status !== "done" && a.dueDate >= todayStr)
    .sort((a: any, b: any) => a.dueDate.localeCompare(b.dueDate))[0] ?? null

  const pendingAssignmentCount = (assignments || []).filter((a: any) => a.status !== "done").length

  const todayDayOrder = dateToDoMap[todayStr]
  const nextCalendarEvent = calendar
    .filter((event) => event.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null
  const nextEvent = (() => {
    if (!nextCalendarEvent && !upcomingAssignment) return null
    if (!nextCalendarEvent) return { title: upcomingAssignment.title, date: upcomingAssignment.dueDate, type: "assignment", id: upcomingAssignment.id }
    if (!upcomingAssignment) return { title: nextCalendarEvent.title, date: nextCalendarEvent.date, type: nextCalendarEvent.type, id: nextCalendarEvent.id }
    return nextCalendarEvent.date <= upcomingAssignment.dueDate
      ? { title: nextCalendarEvent.title, date: nextCalendarEvent.date, type: nextCalendarEvent.type, id: nextCalendarEvent.id }
      : { title: upcomingAssignment.title, date: upcomingAssignment.dueDate, type: "assignment", id: upcomingAssignment.id }
  })()
  const nextEventDate = nextEvent ? new Date(nextEvent.date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) : ""
  const stripLabel = todayDayOrder
    ? nextEvent
      ? `Next event: ${nextEvent.title} - ${nextEventDate} - DO ${todayDayOrder}`
      : `Day Order: ${todayDayOrder}`
    : nextEvent
      ? `Next event: ${nextEvent.title} - ${nextEventDate}`
      : null

  const greeting = (() => {
    const hour = now.getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    if (hour < 21) return "Good evening"
    return "Good night"
  })()
  const firstName = user?.name ? user.name.split(" ")[0] : "Student"

  const timeParts = new Intl.DateTimeFormat("en-IN", {
    hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true,
  }).formatToParts(now)
  const currentTime = `${timeParts.find(p => p.type === "hour")?.value}:${timeParts.find(p => p.type === "minute")?.value}`
  const seconds = timeParts.find(p => p.type === "second")?.value ?? "00"
  const dayPeriod = timeParts.find(p => p.type === "dayPeriod")?.value?.toUpperCase() ?? ""

  const nextClassCountdown = (() => {
    if (currentClass || !nextClass || nextClass.date !== todayStr) return null
    const range = parseTimeRange(nextClass.time)
    if (!range) return null
    const diff = range.start - nowMinutes
    if (diff <= 0) return null
    return { hours: Math.floor(diff / 60), minutes: diff % 60 }
  })()

  const classesEnded = todaysClasses.length > 0 && todaysClasses.every(c => {
    const r = parseTimeRange(c.time)
    return r && nowMinutes >= r.end
  })

  const briefingText = (() => {
    if (currentClass) return `${currentClass.code} is live right now`
    if (isWeekend) return "Weekend mode \u2014 time to recharge"
    if (todaysClasses.length > 0) {
      const practicalCount = todaysClasses.filter(c => /practical|lab/i.test(`${c.type || ""} ${c.name || ""}`)).length
      const suffix = practicalCount > 0 ? ` (${practicalCount} lab${practicalCount > 1 ? 's' : ''})` : ""
      return `Today you have ${todaysClasses.length} class${todaysClasses.length > 1 ? 'es' : ''}${suffix}`
    }
    if (todayHoliday) return `It's a holiday \u2014 ${todayEvents[0]?.title || "enjoy your day"}`
    if (classesEnded) return "Classes finished for today"
    if (nextClass && nextClass.date === todayStr) return `Next class: ${nextClass.code} at ${nextClass.time?.split(" - ")[0] || nextClass.date}`
    return "No classes today"
  })()

  const dockInfo: Record<string, { label: string; color: string } | null> = {
    timetable: currentClass ? { label: "LIVE", color: "#22d3ee" } : todaysClasses.length > 0 ? { label: `${todaysClasses.length}`, color: "#22d3ee" } : null,
    attendance: riskyAttendance.length > 0 ? { label: `${riskyAttendance.length}`, color: "#f43f5e" } : null,
    courses: courses?.length ? { label: `${courses.length}`, color: "#60a5fa" } : null,
    marks: lowMarks.length > 0 ? { label: `${lowMarks.length} at risk`, color: "#f43f5e" } : marksPercent ? { label: `${marksPercent}%`, color: "#34d399" } : null,
    calendar: todayHoliday ? { label: "H", color: "#34d399" } : todayEvents.length > 0 ? { label: `${todayEvents.length}`, color: "#a78bfa" } : null,
    gradex: null,
    notes: null,
    mess: null,
    about: pendingAssignmentCount > 0 ? { label: `${pendingAssignmentCount}`, color: "#f97316" } : null,
  }

  const topAlert = (() => {
    if (currentClass) return {
      icon: Sparkles, color: "#3b82f6", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.2)",
      title: `${currentClass.code} is live now`,
      detail: `Runs till ${parseTimeRange(currentClass.time)?.label?.split(" - ")[1] || currentClass.time}`,
      tab: "timetable" as TabType,
    }
    if (todayDueAssignments.length > 0) return {
      icon: ClipboardCheck, color: "#f97316", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.2)",
      title: `${todayDueAssignments.length} assignment${todayDueAssignments.length > 1 ? 's' : ''} due today`,
      detail: `${todayDueAssignments[0]?.title}${todayDueAssignments[0]?.course ? ` (${todayDueAssignments[0].course})` : ""}`,
      tab: "about" as TabType,
      assignment: todayDueAssignments[0],
    }
    if (riskyAttendance.length > 0) return {
      icon: AlertTriangle, color: "#f43f5e", bg: "rgba(244,63,94,0.08)", border: "rgba(244,63,94,0.2)",
      title: `${riskyAttendance.length} subject${riskyAttendance.length > 1 ? 's' : ''} below 75%`,
      detail: `${riskyAttendance[0]?.code} at ${riskyAttendance[0]?.percentage}% \u2014 needs attention`,
      tab: "attendance" as TabType,
    }
    if (nextClassCountdown) return {
      icon: Clock3, color: "#fbbf24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.2)",
      title: `Next class in ${nextClassCountdown.hours}h ${nextClassCountdown.minutes}m`,
      detail: `${nextClass?.code} starts at ${nextClass?.time?.split(" - ")[0]}`,
      tab: "timetable" as TabType,
    }
    if (todaysClasses.length === 0 && todayHoliday) return {
      icon: CheckCircle2, color: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.2)",
      title: "It's a holiday!",
      detail: todayEvents[0]?.title || "No classes scheduled",
      tab: "calendar" as TabType,
    }
    return null
  })()

  return (
    <div ref={containerRef} className="min-h-full pt-[3.75rem] pb-20 px-3 sm:px-4 lg:px-8 lg:pb-8 w-full">
      {showSplash && (
        <div
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-zinc-950/98"
          style={{ willChange: "opacity" }}
          ref={splashRef}
        >
          <div className="flex flex-col items-center justify-center gap-1 text-center">
            <span
              ref={greetingLineRef}
              className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-100"
              style={{ willChange: "transform, opacity" }}
            >
              {greeting}
            </span>
            <span
              ref={nameLineRef}
              className="font-black tracking-tight text-emerald-400"
              style={{
                willChange: "transform, opacity",
                fontSize: firstName.length > 8 ? "clamp(1.5rem, 5vw, 2.5rem)" : firstName.length > 5 ? "clamp(1.75rem, 5.5vw, 2.75rem)" : "clamp(2rem, 6vw, 3.25rem)",
              }}
            >
              {firstName}
            </span>
          </div>

          <div
            ref={shimmerRef}
            className="mt-6 px-5 py-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10"
            style={{ willChange: "transform, opacity" }}
          >
            <p className="text-base font-bold tracking-wide text-zinc-400">
              {briefingText}
            </p>
          </div>
        </div>
      )}

      <InstallPrompt />
      <div className="flex flex-col gap-8">
        <div ref={headerRef} className="hidden" />

        <div className="border-b border-white/[0.04] pb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div className="relative text-center md:text-left w-full md:w-auto">
            <div className="absolute top-0 right-0 flex items-center gap-1.5 lg:hidden">
              <button
                onClick={() => {
                  try { localStorage.setItem("edutechsrm_open_theme", "1") } catch {}
                  onNavigate("settings")
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl ring-1 ring-white/10 text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all text-[10px] font-semibold"
              >
                <Palette className="w-3 h-3" />
                Themes
              </button>
            </div>
              <h1 className="font-display text-[5.5rem] sm:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 md:mt-0">
                {currentTime}
                <span className="text-zinc-600 text-4xl ml-4 font-sans tracking-[0.04em]">: {seconds}</span>
                <span className="text-zinc-600 text-lg ml-3 font-sans font-semibold tracking-[0.08em]">{dayPeriod}</span>
              </h1>
              <p className="text-zinc-500 text-xs font-semibold uppercase tracking-[0.15em] mt-1 md:mt-3">
                {now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>

            <div ref={statsRef} className="flex gap-4 self-center md:self-auto md:justify-end">
            <div className="bg-zinc-900/60 ring-1 ring-white/5 rounded-2xl px-5 py-3.5 min-w-[170px] relative overflow-hidden group text-center">
              <div className="text-zinc-500 text-[10px] font-bold mb-1.5 uppercase tracking-[0.15em] flex items-center justify-center gap-2">
                <span className={averageAttendance >= 75 ? "text-emerald-500/50" : "text-rose-500/50"}>✦</span>
                Attendance
              </div>
              <div className="text-3xl font-display font-bold tracking-tighter text-zinc-100 flex items-baseline justify-center gap-1">
                <StatNumber value={averageAttendance} color={averageAttendance >= 75 ? "#34d399" : "#f43f5e"} />
                <span className="text-lg text-emerald-500">%</span>
              </div>
              {riskyAttendance.length > 0 && (
                <p className="text-[10px] mt-1.5 font-semibold text-rose-400">{riskyAttendance.length} at risk</p>
              )}
            </div>

            <div className="bg-zinc-900/60 ring-1 ring-white/5 rounded-2xl px-5 py-3.5 min-w-[170px] relative overflow-hidden group text-center">
              <div className="text-zinc-500 text-[10px] font-bold mb-1.5 uppercase tracking-[0.15em] flex items-center justify-center gap-2">
                <span className={marksPercent >= 60 ? "text-emerald-500/50" : marksPercent >= 40 ? "text-amber-500/50" : "text-rose-500/50"}>✦</span>
                Marks
              </div>
              <div className="text-3xl font-display font-bold tracking-tighter text-zinc-100 flex items-baseline justify-center gap-1">
                <StatNumber value={marksPercent} color={marksPercent >= 60 ? "#34d399" : marksPercent >= 40 ? "#fbbf24" : "#f43f5e"} />
                <span className="text-lg text-emerald-500">%</span>
              </div>
              {lowMarks.length > 0 && (
                <p className="text-[10px] mt-1.5 font-semibold text-rose-400">{lowMarks.length} below 60%</p>
              )}
            </div>
            </div>
          </div>

          {stripLabel && (
            <div className="flex justify-center w-full mt-8 mb-3">
              <div className="flex items-center gap-2 rounded-xl bg-zinc-900/60 ring-1 ring-white/5 px-3 py-1.5">
                <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 ring-1 ring-white/5 bg-zinc-800/50">
                  <CalendarDays className="w-3 h-3 text-violet-400" />
                </div>
                <span className="text-[11px] font-semibold text-zinc-300">{stripLabel}</span>
              </div>
            </div>
          )}
        </div>

        <div className="-mt-6">
          <AiQuickInput onNavigate={onNavigate} />
        </div>

        <div ref={dockRef} className="flex justify-center relative">
          <div className="flex flex-nowrap items-center gap-1 sm:gap-1.5 px-4 py-2.5 rounded-3xl bg-zinc-900/60 ring-1 ring-white/5 overflow-x-auto w-full scrollbar-thin justify-start sm:justify-center">
            {(isDesktop ? NAV_ITEMS : NAV_ITEMS.filter((item) => dockApps.includes(item.id))).map((item) => (
              <DockItem key={item.id} item={item} info={dockInfo[item.id]} onNavigate={onNavigate} />
            ))}
            {!isDesktop && <button id="dock-customize-trigger" onClick={() => setShowDockCustomize(true)}
              className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/[0.04] active:scale-95 transition-all"
              style={{ WebkitTapHighlightColor: "transparent" }}>
              <Pencil className="w-3.5 h-3.5 text-zinc-500" />
            </button>}
          </div>
          {showDockCustomize && (
              <div id="dock-customize-popover" className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-50 w-72 p-4 rounded-2xl bg-zinc-900 ring-1 ring-white/10 shadow-2xl">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Dock Apps</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {ALL_DOCK_APP_IDS.map((id) => {
                    const navItem = NAV_ITEMS.find((n) => n.id === id)!
                    const enabled = dockApps.includes(id)
                    return (
                      <button key={id} onClick={() => {
                        setDockApps((prev) => enabled ? prev.filter((p) => p !== id) : [...prev, id])
                      }}
                        className={`flex items-center gap-2 px-2.5 py-2 rounded-xl transition-all ${enabled ? "bg-white/[0.04]" : "hover:bg-white/[0.02]"}`}
                        style={{ WebkitTapHighlightColor: "transparent" }}>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 relative ${enabled ? "bg-zinc-800/60 ring-1 ring-white/10" : "bg-zinc-800/30 ring-1 ring-white/5"}`}>
                          <navItem.icon className="w-4 h-4" style={{ color: enabled ? navItem.color : "#52525b" }} />
                          {enabled && <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center ring-2 ring-zinc-900"><CheckCircle2 className="w-1.5 h-1.5 text-zinc-950" /></div>}
                        </div>
                        <span className={`text-[10px] font-semibold ${enabled ? "text-zinc-300" : "text-zinc-600"}`}>{navItem.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
          )}
        </div>

        <div ref={alertRef}>
          {topAlert ? (
            topAlert.assignment ? (
              <div className="w-full bg-zinc-900/60 ring-1 ring-white/5 rounded-3xl p-6 flex items-center gap-4"
                style={{ background: topAlert.bg }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ring-1 ring-white/5 bg-zinc-800/50">
                  <topAlert.icon className="w-4 h-4" style={{ color: topAlert.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold leading-snug" style={{ color: topAlert.color }}>{topAlert.title}</p>
                  <p className="text-[11px] mt-0.5 text-zinc-400">{topAlert.detail}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <button onClick={(e) => { e.stopPropagation(); updateAssignment(topAlert.assignment.id, { status: "in_progress" }) }}
                      className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-lg ring-1 text-cyan-400 bg-cyan-500/10 border-cyan-500/20 hover:opacity-80 transition-all">
                      In Progress
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); updateAssignment(topAlert.assignment.id, { status: "done" }) }}
                      className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-lg ring-1 text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:opacity-80 transition-all">
                      Done
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => onNavigate(topAlert.tab)}
                className="w-full bg-zinc-900/60 ring-1 ring-white/5 rounded-3xl p-6 flex items-center gap-4 text-left transition-all active:scale-[0.99] hover:bg-white/[0.02]"
                style={{ background: topAlert.bg }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ring-1 ring-white/5 bg-zinc-800/50">
                  <topAlert.icon className="w-4 h-4" style={{ color: topAlert.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold leading-snug" style={{ color: topAlert.color }}>{topAlert.title}</p>
                  <p className="text-[11px] mt-0.5 text-zinc-400">{topAlert.detail}</p>
                </div>
              </button>
            )
          ) : (
            <div className="bg-zinc-900/60 ring-1 ring-white/5 rounded-3xl p-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ring-1 ring-white/5 bg-zinc-800/50">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold leading-snug text-emerald-400">All clear</p>
                <p className="text-[11px] mt-0.5 text-zinc-400">No alerts right now.</p>
          </div>
        </div>
          )}
        </div>

        <div ref={profileRef}>
          <div className="bg-zinc-900/60 ring-1 ring-white/5 rounded-3xl p-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl shrink-0 overflow-hidden ring-1 ring-white/5 bg-zinc-800/50 flex items-center justify-center">
              <ProfileAvatar name={user?.name} token={token} fallback={<User className="w-4 h-4 text-pink-400" />} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold leading-snug text-zinc-100">{user?.name || "Student"}</p>
              <p className="text-[11px] mt-0.5 text-zinc-400">
                {user?.program || ""}{user?.semester ? ` \u00b7 Sem ${user.semester}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onNavigate("about")}
                className="text-[10px] font-semibold px-3 py-1.5 rounded-lg ring-1 ring-white/10 text-zinc-400 hover:bg-white/5 transition-colors"
              >
                Profile
              </button>
              <button
                onClick={() => onNavigate("feedback")}
                className="text-[10px] font-semibold px-3 py-1.5 rounded-lg ring-1 ring-amber-500/20 text-amber-400 hover:bg-white/5 transition-colors"
              >
                Feedback
              </button>

            </div>
          </div>
        </div>

        <button onClick={handleSupportClick}
          className="w-full bg-zinc-900/60 ring-1 ring-white/5 rounded-3xl p-6 flex items-center gap-4 text-left transition-all active:scale-[0.99] hover:bg-white/[0.02]"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)" }}>
            <Heart className="w-4 h-4" style={{ color: "#a78bfa" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold leading-snug" style={{ color: "#a78bfa" }}>Support edutechsrm</p>
            <p className="text-[11px] mt-0.5 text-zinc-400">Help cover domain & Cloudflare costs</p>
          </div>
        </button>

        <div ref={bottomRef}>
          <div className="bg-zinc-900/60 ring-1 ring-white/5 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ring-1 ring-white/5 bg-zinc-800/50">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-bold leading-snug text-amber-400">Updates & release notes</p>
                  <p className="text-[11px] mt-0.5 text-zinc-400">Latest changes</p>
                </div>
                <button
                  onClick={() => onNavigate("updates")}
                  className="text-[10px] font-semibold px-3 py-1.5 rounded-lg ring-1 ring-white/10 text-zinc-400 hover:bg-white/5 transition-colors shrink-0"
                >
                  Know more
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {DEFAULT_ANNOUNCEMENTS.slice(0, 2).map((item) => {
                const tone = ({
                  bug: { color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)" },
                  fix: { color: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.2)" },
                  update: { color: "#22d3ee", bg: "rgba(34,211,238,0.08)", border: "rgba(34,211,238,0.2)" },
                  info: { color: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.2)" },
                })[item.type] || { color: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.2)" }

                return (
                  <div key={item.id} className="rounded-2xl p-4" style={{ background: tone.bg, border: `1px solid ${tone.border}` }}>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: tone.bg, border: `1px solid ${tone.border}` }}>
                        <Sparkles className="w-4 h-4" style={{ color: tone.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold leading-snug" style={{ color: tone.color }}>{item.title}</p>
                        {item.body && <p className="text-[10px] mt-1.5 text-zinc-400 leading-relaxed line-clamp-2">{item.body}</p>}
                        <p className="text-[9px] mt-1.5 text-zinc-600 font-semibold">{item.date}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <SupportModal isOpen={isSupportOpen} onClose={closeSupport} />
    </div>
  )
}
