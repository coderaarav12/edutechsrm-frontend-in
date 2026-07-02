"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  RefreshCw, LogIn, CalendarDays, ChevronLeft, ChevronRight,
  Sparkles, BookOpen, FileText, Bell, Hash, X, MapPin, User,
  ClipboardCheck, CheckCircle2, Clock3, Plus, Trash2,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { LoginModal } from "./login-modal"
import { AIPromoBadge } from "@/components/ai-promo-badge"
import { expandCustomClassesByDate, useCustomPlanner } from "@/lib/custom-planner"

const MONTHS     = ["January","February","March","April","May","June","July","August","September","October","November","December"]
const DAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
const DAYS_FULL  = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]

const TIME_SLOTS: Record<number, string> = {
  1:"08:00",2:"08:50",3:"09:45",4:"10:40",5:"11:35",
  6:"12:30",7:"13:25",8:"14:20",9:"15:10",10:"16:00",11:"16:50",12:"17:30",
}

const EVENT_META: Record<string, { color: string; border: string; bg: string; icon: React.ReactNode }> = {
  holiday:  { color: "#34d399", border: "rgba(52,211,153,0.25)",  bg: "rgba(52,211,153,0.08)",  icon: <Sparkles style={{ width: 13, height: 13 }} /> },
  exam:     { color: "#f87171", border: "rgba(248,113,113,0.25)", bg: "rgba(248,113,113,0.08)", icon: <BookOpen    style={{ width: 13, height: 13 }} /> },
  deadline: { color: "#fbbf24", border: "rgba(251,191,36,0.25)",  bg: "rgba(251,191,36,0.08)",  icon: <FileText    style={{ width: 13, height: 13 }} /> },
  event:    { color: "#60a5fa", border: "rgba(96,165,250,0.25)",  bg: "rgba(96,165,250,0.08)",  icon: <Bell        style={{ width: 13, height: 13 }} /> },
}

const DO_COLORS = ["#a78bfa","#60a5fa","#fbbf24","#f87171","#34d399"]

function getEventMeta(type: string) { return EVENT_META[type] ?? EVENT_META.event }
function getDoColor(do_: number)    { return DO_COLORS[(do_ - 1) % 5] }

function getClassTypeColor(type: string): string {
  const t = type?.toLowerCase() || ""
  if (t.includes("lab based")) return "#a78bfa"
  if (t === "theory")          return "#60a5fa"
  if (t.includes("practical") || t === "lab") return "#34d399"
  return "#fbbf24"
}

export function CalendarSection({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { isAuthenticated, calendar, dateToDoMap, timetable, isLoading, refreshData } = useAuth()
  const { customClasses, assignments, updateAssignment, removeAssignment } = useCustomPlanner()
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [filter,      setFilter]      = useState<"all"|"holiday"|"exam"|"event"|"deadline">("all")
  const [selectedDay, setSelectedDay] = useState<number|null>(() => new Date().getDate())
  const [showDayOrderClasses, setShowDayOrderClasses] = useState(true)
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set())

  const currentMonth = currentDate.getMonth()
  const currentYear  = currentDate.getFullYear()
  const todayDate    = new Date()
  const todayStr     = `${todayDate.getFullYear()}-${String(todayDate.getMonth()+1).padStart(2,"0")}-${String(todayDate.getDate()).padStart(2,"0")}`

  const dateToDayOrder = useMemo(() => dateToDoMap || {}, [dateToDoMap])

  const activeAssignments = useMemo(() => (assignments || []).filter((a) => a.status !== "done"), [assignments])

  const getAssignmentsForDay = (day: number) => {
    const date = getDateStr(day)
    return activeAssignments.filter((a) => a.dueDate === date)
  }

  const todayAssignments = useMemo(() => activeAssignments.filter((a) => a.dueDate === todayStr), [activeAssignments, todayStr])

  const dayOrderToClasses = useMemo(() => {
    const map: Record<number, any[]> = {}
    ;(timetable as any[]).forEach(slot => {
      if (!map[slot.day_order]) map[slot.day_order] = []
      if (!map[slot.day_order].find((s: any) => s.hour === slot.hour && s.code === slot.code))
        map[slot.day_order].push(slot)
    })
    Object.keys(map).forEach(k => map[Number(k)].sort((a: any, b: any) => a.hour - b.hour))
    return map
  }, [timetable])

  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const firstDay    = new Date(currentYear, currentMonth, 1).getDay()
    const days: (number|null)[] = []
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)
    return days
  }, [currentMonth, currentYear])

  const getDateStr      = (day: number) => `${currentYear}-${String(currentMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`
  const getEventsForDay = (day: number) => {
    const date = getDateStr(day)
    return (calendar as any[]).filter((e: any) => e.date === date)
  }
  const isToday         = (day: number) => day === todayDate.getDate() && currentMonth === todayDate.getMonth() && currentYear === todayDate.getFullYear()
  const isWeekend       = (day: number) => { const d = new Date(currentYear, currentMonth, day).getDay(); return d === 0 || d === 6 }

  const todayDayOrder = dateToDayOrder[todayStr]
  const todayEvents   = (calendar as any[]).filter((e: any) => e.date === todayStr)
  const todayHoliday  = todayEvents.find((e: any) => e.type === "holiday")

  const selectedDayStr     = selectedDay ? getDateStr(selectedDay) : null
  const selectedDayEvents  = selectedDay ? getEventsForDay(selectedDay) : []
  const selectedDayAssignments = selectedDay ? getAssignmentsForDay(selectedDay) : []
  const selectedDayOrder   = selectedDayStr ? dateToDayOrder[selectedDayStr] : undefined
  const selectedIsWeekend  = selectedDay ? isWeekend(selectedDay) : false
  const selectedIsToday    = selectedDay ? isToday(selectedDay) : false
  const customClassesByDate = useMemo(() => expandCustomClassesByDate(customClasses, dateToDayOrder), [customClasses, dateToDayOrder])
  const selectedCustomClasses = selectedDayStr ? (customClassesByDate[selectedDayStr] || []) : []
  const selectedDayClasses: any[] = [
    ...(selectedDayOrder ? (dayOrderToClasses[selectedDayOrder] || []) : []),
    ...selectedCustomClasses.map((item) => ({
      ...item,
      time: `${item.startTime} - ${item.endTime}`,
      custom: true,
    })),
  ].sort((a: any, b: any) => (a.hour - b.hour) || `${a.time || ""}`.localeCompare(`${b.time || ""}`))


  const currentMonthHolidays = (calendar as any[])
    .filter((event: any) => {
      if (event.type !== "holiday") return false
      const eventDate = new Date(`${event.date}T00:00:00`)
      return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear
    })
    .sort((a: any, b: any) => a.date.localeCompare(b.date))

  if (!isAuthenticated) {
    return (
      <div className="min-h-full pt-[3.75rem] pb-20 px-3 sm:px-4 lg:px-8 lg:pb-8 w-full flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20 flex items-center justify-center">
            <CalendarDays className="w-9 h-9 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-100 mb-4">
            Connect to View Calendar
          </h2>
          <p className="text-sm text-zinc-500 mb-8 max-w-xs mx-auto">
            Login with your SRM Academia credentials to view holidays and day orders.
          </p>
          <motion.button whileTap={{ scale: 0.96 }} onClick={() => setIsLoginOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-colors">
            <LogIn className="w-[18px] h-[18px]" /> Connect to SRM Academia
          </motion.button>
        </motion.div>
        <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      </div>
    )
  }

  return (
    <div className="min-h-full pt-[3.75rem] pb-20 px-3 sm:px-4 lg:px-8 lg:pb-8 w-full">
      <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-6 lg:items-start">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-start mb-8 lg:col-span-2">
          <div>
            <h2 className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-1">Calendar Flow</h2>
            <h1 className="text-3xl font-bold text-zinc-100 tracking-tight font-display">Calendar</h1>
            <p className="text-[11px] mt-1 text-zinc-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {(calendar as any[]).length + customClasses.length} calendar items
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AIPromoBadge page="calendar" />
            <motion.button whileTap={{ scale: 0.9 }} onClick={refreshData} disabled={isLoading}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-zinc-500 bg-zinc-900/60 ring-1 ring-white/5 hover:text-zinc-300 transition-all disabled:opacity-40">
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </motion.button>
          </div>
        </motion.div>

        {/* Today hero */}
        <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-zinc-900/60 ring-1 ring-white/5 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="shrink-0 text-center rounded-xl px-3 py-2 bg-emerald-500/10 ring-1 ring-emerald-500/20">
              <p className="text-2xl font-black leading-none text-emerald-400">{todayDate.getDate()}</p>
              <p className="text-[9px] mt-0.5 uppercase tracking-wider font-semibold text-zinc-400">
                {MONTHS[todayDate.getMonth()].slice(0,3)}
              </p>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-base font-bold text-zinc-100">{DAYS_FULL[todayDate.getDay()]}</p>
                {todayHoliday && !todayDayOrder && (
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg ring-1 text-emerald-400 bg-emerald-500/10 ring-emerald-500/20">
                    Holiday
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {todayDayOrder ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md"
                    style={{ background: `${getDoColor(todayDayOrder)}12`, color: getDoColor(todayDayOrder) }}>
                    <Hash className="w-2 h-2" />DO {todayDayOrder}
                  </span>
                ) : (
                  <p className="text-[11px] text-zinc-500">
                    {todayHoliday ? (todayHoliday.title as string).replace(/ - Holiday$/i,"").trim() : "No classes today"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filter tabs */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}
          className="flex justify-center bg-zinc-900 rounded-xl p-1 border border-white/5 mb-6 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {(["all","holiday","exam","event","deadline"] as const).map(f => {
            const active = filter === f
            return (
              <motion.button key={f} whileTap={{ scale: 0.93 }} onClick={() => setFilter(f)}
                className={`px-4 py-2 text-xs font-bold whitespace-nowrap shrink-0 transition-all rounded-lg ${
                  active
                    ? "bg-zinc-800 text-zinc-100 shadow-md border border-white/5"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}>
                {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              </motion.button>
            )
          })}
        </motion.div>

        {/* Calendar grid */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-zinc-900/40 ring-1 ring-white/5 rounded-2xl p-5 mb-6">

          <div className="flex items-center justify-between mb-4">
            <motion.button whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentDate(new Date(currentYear, currentMonth - 1, 1))}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition-all">
              <ChevronLeft className="w-3.5 h-3.5" />
            </motion.button>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-zinc-100">
                {MONTHS[currentMonth]} {currentYear}
              </h2>
              <motion.button whileTap={{ scale: 0.92 }}
                onClick={() => { setCurrentDate(new Date()); setSelectedDay(new Date().getDate()) }}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                  selectedIsToday
                    ? "text-zinc-600 bg-white/5 ring-1 ring-white/10 cursor-default"
                    : "text-emerald-400 bg-emerald-500/10 ring-1 ring-emerald-500/25"
                }`}>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${selectedIsToday ? "bg-zinc-600" : "bg-emerald-400 animate-pulse"}`} />
                Today
              </motion.button>
            </div>
            <motion.button whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentDate(new Date(currentYear, currentMonth + 1, 1))}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition-all">
              <ChevronRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {DAYS_SHORT.map((d, i) => (
              <div key={i} className={`text-center py-1.5 text-[11px] font-bold ${i === 0 || i === 6 ? "text-zinc-700" : "text-zinc-600"}`}>
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {calendarDays.map((day, index) => {
              if (!day) return <div key={`e-${index}`} />
              const dateStr  = getDateStr(day)
              const dayOrder = dateToDayOrder[dateStr]
              const events   = getEventsForDay(day).filter((e: any) => filter === "all" || e.type === filter)
              const weekend  = isWeekend(day)
              const today    = isToday(day)
              const selected = selectedDay === day
              const hasCustomClasses = (customClassesByDate[dateStr] || []).length > 0
              const hasAssignments = getAssignmentsForDay(day).length > 0
              const allTypes = [...events.map((e: any) => e.type), ...(hasCustomClasses ? ["custom"] : []), ...(hasAssignments ? ["assignment"] : [])]
              const dotTypes = [...new Set(allTypes)].slice(0, 2)

              return (
                <motion.button key={day} whileTap={{ scale: 0.88 }}
                  onClick={() => setSelectedDay(selected ? null : day)}
                  className={`relative flex flex-col items-center justify-center gap-0.5 py-2 min-h-[44px] rounded-lg transition-all ${
                    selected
                      ? "bg-emerald-500/20 ring-1 ring-emerald-500/40"
                      : today
                        ? "bg-emerald-500/10 ring-1 ring-emerald-500/25"
                        : "ring-1 ring-transparent"
                  } ${!selected && !today && weekend ? "opacity-30" : ""}`}>

                  {dayOrder && !weekend && (
                    <span className={`text-[7px] font-black leading-none px-1 py-0.5 rounded-md ${
                      selected ? "bg-emerald-500/20 text-emerald-400" : ""
                    }`}
                      style={!selected ? { background: `${getDoColor(dayOrder)}18`, color: getDoColor(dayOrder) } : {}}>
                      {dayOrder}
                    </span>
                  )}

                  <span className={`text-[13px] font-bold leading-none ${
                    selected ? "text-emerald-400" : today ? "text-zinc-100" : weekend ? "text-zinc-700" : "text-zinc-300"
                  }`}>
                    {day}
                  </span>

                  {dotTypes.length > 0 && (
                    <div className="flex gap-0.5 h-1.5 items-center">
                      {dotTypes.map((type, i) => (
                        <span key={i} className="w-1.5 h-1.5 rounded-full"
                          style={{ background: selected ? "#34d399" : type === "custom" ? "#22d3ee" : type === "assignment" ? "#f97316" : getEventMeta(type).color }} />
                      ))}
                    </div>
                  )}

                  {today && !selected && (
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                </motion.button>
              )
            })}
          </div>
        </motion.div>
        </div>

        {/* Right column */}
        <div className="space-y-6">

        {/* Selected day panel */}
        <AnimatePresence mode="wait">
          {selectedDay && (
            <motion.div
              key="day-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.18 }}
              className="bg-zinc-900/40 ring-1 ring-white/5 rounded-2xl p-5 lg:sticky lg:top-24">

              <div className="flex items-start justify-between pb-3 border-b border-white/5">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-zinc-500">
                    {new Date(currentYear, currentMonth, selectedDay).toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {selectedIsToday && (
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg ring-1 inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 ring-emerald-500/20">
                        <span className="w-1 h-1 rounded-full bg-emerald-400" />Today
                      </span>
                    )}
                    {selectedDayOrder && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg ring-1 inline-flex items-center gap-1"
                        style={{ background: `${getDoColor(selectedDayOrder)}18`, color: getDoColor(selectedDayOrder), borderColor: `${getDoColor(selectedDayOrder)}30` }}>
                        <Hash className="w-[9px] h-[9px]" />DO {selectedDayOrder}
                      </span>
                    )}
                    {selectedIsWeekend && !selectedDayOrder && (
                      <span className="text-[10px] text-zinc-600">Weekend</span>
                    )}
                  </div>
                </div>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setSelectedDay(null)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg ml-2 shrink-0 text-zinc-500 bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition-all">
                  <X className="w-3.5 h-3.5" />
                </motion.button>
              </div>

              <div className="pt-3 space-y-3">

                {selectedDayEvents.length > 0 && (
                  <div>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2">Events</p>
                    <div className="space-y-2">
                      {selectedDayEvents.map((event: any) => {
                        const meta = getEventMeta(event.type)
                        const do_ = selectedDayStr ? dateToDayOrder[selectedDayStr] : undefined
                        const expanded = expandedEvents.has(event.id)
                        return (
                          <button key={event.id} onClick={() => setExpandedEvents(prev => { const n = new Set(prev); expanded ? n.delete(event.id) : n.add(event.id); return n })}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl w-full text-left"
                            style={{ background: meta.bg, border: `1px solid ${meta.border}` }}>
                            <div className="w-1 self-stretch rounded-full shrink-0" style={{ background: meta.color }} />
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                              style={{ background: `${meta.color}18`, color: meta.color }}>
                              {event.type === "holiday" ? (
                                <motion.div
                                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.15, 1] }}
                                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                >
                                  {meta.icon}
                                </motion.div>
                              ) : meta.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-semibold ${expanded ? "" : "truncate"} text-zinc-100`}>
                                {(event.title as string).replace(/ - Holiday$/i,"").trim()}
                              </p>
                              <p className="text-[10px] capitalize text-zinc-500">{do_ && event.type === "holiday" ? `DO ${do_}` : event.type}</p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {selectedDayAssignments.length > 0 && (
                  <div>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <ClipboardCheck className="w-3 h-3" /> Assignments
                    </p>
                    <div className="space-y-2">
                      {selectedDayAssignments.map((a) => {
                        const nextStatus = a.status === "todo" ? "in_progress" : a.status === "in_progress" ? "done" : "todo"
                        return (
                          <div key={a.id}
                            className="flex items-start gap-3 px-3 py-3 rounded-xl bg-zinc-950/50 ring-1 ring-white/5">
                            <div className="w-1 self-stretch rounded-full shrink-0" style={{ background: a.priority === "high" ? "#f87171" : a.priority === "medium" ? "#fbbf24" : "#34d399" }} />
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ring-1 ${
                              a.priority === "high" ? "bg-rose-500/10 ring-rose-500/20" : a.priority === "medium" ? "bg-amber-400/10 ring-amber-400/20" : "bg-emerald-500/10 ring-emerald-500/20"
                            }`}>
                              {a.status === "done" ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Clock3 className={`w-4 h-4 ${a.priority === "high" ? "text-rose-400" : a.priority === "medium" ? "text-amber-400" : "text-emerald-400"}`} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-xs font-semibold text-zinc-200">{a.title}</p>
                                {a.course && (
                                  <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-lg ring-1 text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
                                    {a.course}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-zinc-500 mt-0.5">
                                {a.dueTime ? `Due by ${a.dueTime}` : "All day"}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                {a.status !== "done" && (
                                  <button onClick={() => updateAssignment(a.id, { status: nextStatus })}
                                    className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg ring-1 transition-all hover:opacity-80 ${
                                      nextStatus === "in_progress"
                                        ? "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
                                        : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                                    }`}>
                                    {nextStatus === "in_progress" ? "In Progress" : "Done"}
                                  </button>
                                )}
                                {a.status === "done" ? (
                                  <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg ring-1 text-zinc-500 bg-white/5 border-white/10">
                                    Completed
                                  </span>
                                ) : (
                                  <button onClick={() => removeAssignment(a.id)}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-all">
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {!selectedIsWeekend && selectedDayOrder && (
                  <div>
                    <button onClick={() => setShowDayOrderClasses(!showDayOrderClasses)}
                      className="flex items-center w-full text-left mb-2 group">
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <BookOpen className="w-[9px] h-[9px] text-zinc-500" />
                        <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Classes · DO {selectedDayOrder}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 text-zinc-600 transition-transform duration-200 ${showDayOrderClasses ? "rotate-90" : ""}`} />
                    </button>
                    {showDayOrderClasses && (
                      selectedDayClasses.length === 0 ? (
                        <div className="px-3 py-4 rounded-xl text-center bg-white/5 border border-dashed border-white/10">
                          <p className="text-xs text-zinc-600">Timetable not synced for this day order</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {selectedDayClasses.map((cls: any, idx: number) => {
                            const tc = getClassTypeColor(cls.type)
                            return (
                              <div key={`${cls.hour}-${cls.code}`}
                                className="flex items-center gap-3 px-3 py-2 rounded-xl bg-zinc-950/50 ring-1 ring-white/5">
                                <div className="w-1 self-stretch rounded-full shrink-0" style={{ background: tc }} />
                                <div className="shrink-0 text-right w-10">
                                  <p className="text-[10px] font-black" style={{ color: tc }}>{cls.custom ? cls.startTime : (TIME_SLOTS[cls.hour] || `H${cls.hour}`)}</p>
                                  <p className="text-[8px] text-zinc-700">Hr {cls.hour}</p>
                                </div>
                                <div className="w-px h-8 shrink-0 bg-white/5" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[9px] font-mono mb-0.5 text-emerald-400">{cls.code}</p>
                                  <p className="text-xs font-semibold truncate text-zinc-100 leading-snug">{cls.name}</p>
                                  <div className="flex flex-wrap gap-x-2.5 mt-0.5 text-zinc-600 text-[10px]">
                                    {cls.room    && <span className="flex items-center gap-0.5"><MapPin className="w-[9px] h-[9px]" />{cls.room}</span>}
                                    {cls.faculty && <span className="flex items-center gap-0.5 truncate max-w-[110px]"><User className="w-[9px] h-[9px] shrink-0" />{cls.faculty}</span>}
                                  </div>
                                </div>
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-lg shrink-0"
                                  style={{ background: `${tc}15`, color: tc, border: `1px solid ${tc}25` }}>
                                  {cls.custom ? "Custom" : cls.type}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      )
                    )}
                  </div>
                )}

                {!selectedDayOrder && !selectedIsWeekend && selectedDayEvents.length === 0 && selectedCustomClasses.length === 0 && selectedDayAssignments.length === 0 && (
                  <div className="py-6 text-center rounded-xl bg-white/5 border border-dashed border-white/10">
                    <CalendarDays className="w-7 h-7 text-zinc-700 mx-auto mb-2" />
                    <p className="text-xs text-zinc-600">No events or classes scheduled</p>
                  </div>
                )}
                {selectedIsWeekend && selectedDayEvents.length === 0 && (
                  <p className="text-xs text-center py-2 text-zinc-600">Enjoy your weekend!</p>
                )}
          </div>
        </motion.div>
          )}
        </AnimatePresence>

        {/* Add Assignment */}
        <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
          onClick={() => onNavigate?.("about")} whileTap={{ scale: 0.97 }}
          className="w-full bg-zinc-900/40 ring-1 ring-white/5 rounded-2xl p-4 flex items-center gap-3 text-left hover:bg-white/[0.02] transition-all mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-amber-500/10 ring-1 ring-amber-500/20 text-amber-400">
            <Plus className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-zinc-100">Add Assignment</p>
            <p className="text-[11px] text-zinc-500">Track todos, deadlines & progress</p>
          </div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-amber-400 shrink-0">Profile</div>
        </motion.button>

        {/* Month holidays */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.13 }}>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2">
            {MONTHS[currentMonth]} Holidays
          </p>
          <div className="space-y-2">
            {currentMonthHolidays.length > 0 ? (
              currentMonthHolidays.map((holiday: any, i: number) => {
                const do_ = dateToDayOrder[holiday.date]
                const expanded = expandedEvents.has(holiday.id)
                return (
                <button
                  key={`${holiday.id}-month`}
                  onClick={() => setExpandedEvents(prev => { const n = new Set(prev); expanded ? n.delete(holiday.id) : n.add(holiday.id); return n })}
                  className="bg-zinc-900/40 ring-1 ring-white/5 rounded-xl p-4 flex items-center gap-3 w-full text-left"
                >
                  <div className="w-1 self-stretch rounded-full shrink-0 bg-emerald-400" />
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-emerald-500/10 text-emerald-400">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.15, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </motion.div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold ${expanded ? "" : "truncate"} text-zinc-100`}>
                      {(holiday.title as string).replace(/ - Holiday$/i, "").trim()}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      {new Date(`${holiday.date}T00:00:00`).toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                  {do_ ? (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg ring-1"
                      style={{ background: `${getDoColor(do_)}18`, color: getDoColor(do_) }}>
                      DO {do_}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg ring-1 text-emerald-400 bg-emerald-500/10 ring-emerald-500/20">
                      Holiday
                    </span>
                  )}
                </button>
                )
              })
            ) : (
              <div className="px-3 py-4 rounded-xl text-center bg-white/5 border border-dashed border-white/10">
                <p className="text-xs text-zinc-600">
                  No holidays listed for {MONTHS[currentMonth]}.
                </p>
              </div>
            )}
          </div>
        </motion.div>

        </div>

      </div>
    </div>
  )
}
