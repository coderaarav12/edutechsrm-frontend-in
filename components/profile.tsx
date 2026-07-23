"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  User, GraduationCap, Calendar, RefreshCw,
  LogIn, ExternalLink, Building, Layers,
  ChevronDown, Plus, Trash2, BookMarked, Clock3,
  ClipboardCheck, ClipboardList, CheckCircle2, Heart,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { readCachedPhoto, writeCachedPhoto } from "@/lib/photo-cache"
import { LoginModal } from "./login-modal"
import { SignOutModal } from "./signout-modal"
import { createCustomClass, createOdMlEntry, createAssignment, getHourTimeRange, useCustomPlanner } from "@/lib/custom-planner"
import { AIPromoBadge } from "@/components/ai-promo-badge"
import { SupportModal } from "./support-modal"
import { useSupport } from "@/lib/use-support"

function formatLocalDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

export function AboutSection() {
  const auth = useAuth() as any
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [classFormMessage, setClassFormMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null)
  const [odMlMessage, setOdMlMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null)
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [showOdMlForm, setShowOdMlForm] = useState(false)
  const [showSignOutModal, setShowSignOutModal] = useState(false)
  const [expandedInfoCard, setExpandedInfoCard] = useState<number | null>(null)
  const [showAssignmentsForm, setShowAssignmentsForm] = useState(false)
  const today = formatLocalDateKey(new Date())
  const [assignForm, setAssignForm] = useState({
    title: "",
    course: "",
    dueDate: today,
    dueTime: "",
    priority: "medium" as "low" | "medium" | "high",
    note: "",
  })
  const {
    customClasses,
    odMlEntries,
    assignments,
    addCustomClass,
    removeCustomClass,
    addOdMlEntry,
    removeOdMlEntry,
    addAssignment,
    removeAssignment,
    updateAssignment,
  } = useCustomPlanner()
  const { isSupportOpen, handleSupportClick, closeSupport } = useSupport()
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState(false)

  useEffect(() => {
    if (!auth.token || !auth.isAuthenticated) return
    let cancelled = false

    const cached = readCachedPhoto(auth.token)
    if (cached) {
      if (!cancelled) setPhotoUrl(cached)
      return
    }

    fetch("/api/srm/photo", { headers: { "x-access-token": auth.token } })
      .then((r) => (r.ok ? r.blob() : Promise.reject()))
      .then((blob) => {
        if (!cancelled) {
          setPhotoUrl(URL.createObjectURL(blob))
          const reader = new FileReader()
          reader.onloadend = () => {
            if (reader.result && typeof reader.result === "string") writeCachedPhoto(reader.result, auth.token!)
          }
          reader.readAsDataURL(blob)
        }
      })
      .catch(() => { if (!cancelled) { const cached = readCachedPhoto(auth.token); if (cached) setPhotoUrl(cached); else setPhotoError(true) } })
    return () => { cancelled = true }
  }, [auth.token, auth.isAuthenticated])

  const todayIso = formatLocalDateKey(new Date())

  useEffect(() => {
    const openCustomForm = () => {
      setShowCustomForm(true)
      setTimeout(() => {
        const element = document.getElementById("custom-planner-section")
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      }, 150)
    }

    const openOdMlForm = () => {
      setShowCustomForm(false)
      setShowOdMlForm(true)
      setTimeout(() => {
        const element = document.getElementById("od-ml-planner-section")
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      }, 150)
    }

    const shouldOpenOdMlFromRedirect = () => {
      try {
        return window.sessionStorage.getItem("edutechsrm_open_odml_from_attendance") === "1"
      } catch {
        return false
      }
    }

    const clearOdMlRedirectFlag = () => {
      try {
        window.sessionStorage.removeItem("edutechsrm_open_odml_from_attendance")
      } catch {}
    }

    const handleHashChange = () => {
      if (window.location.hash === "#custom-class") {
        openCustomForm()
      } else if (window.location.hash === "#od-ml-planner" && shouldOpenOdMlFromRedirect()) {
        openOdMlForm()
        clearOdMlRedirectFlag()
      }
    }

    const handleNavigateToProfile = () => {
      openCustomForm()
    }

    if (window.location.hash === "#custom-class") {
      openCustomForm()
    } else if (window.location.hash === "#od-ml-planner" && shouldOpenOdMlFromRedirect()) {
      openOdMlForm()
      clearOdMlRedirectFlag()
    }
    window.addEventListener("hashchange", handleHashChange)
    window.addEventListener("navigate-to-profile", handleNavigateToProfile)
    return () => {
      window.removeEventListener("hashchange", handleHashChange)
      window.removeEventListener("navigate-to-profile", handleNavigateToProfile)
    }
  }, [])
  const [classForm, setClassForm] = useState(() => {
    const time = getHourTimeRange(1)
    return {
      repeatMode: "single" as "single" | "day_order",
      date: todayIso,
      dayOrder: 1,
      hour: 1,
      startTime: time.start,
      endTime: time.end,
      code: "CUSTOM",
      name: "",
      faculty: "",
      room: "",
      type: "Custom",
      note: "",
    }
  })
  const [odMlForm, setOdMlForm] = useState(() => ({
    type: "od" as "od" | "ml",
    startDate: todayIso,
    endDate: todayIso,
    note: "",
  }))

  const isAuthenticated = auth.isAuthenticated
  const user            = auth.user
  const attendance      = (auth.attendance  || []) as any[]
  const marks           = (auth.marks       || []) as any[]
  const courses         = (auth.courses     || []) as any[]
  const timetable       = (auth.timetable   || []) as any[]
  const isLoading       = auth.isLoading
  const refreshData     = auth.refreshData
  const logout          = auth.logout
  const dateToDoMap     = auth.dateToDoMap  || {}

  const todayStr = formatLocalDateKey(new Date())
  const todayDO  = dateToDoMap[todayStr] ?? null

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

  const totalCredits   = uniqueCourses.reduce((s, c) => s + (c.credits || 0), 0)
  const theoryCount    = uniqueCourses.filter(c => c.type === "Theory").length
  const labCount       = uniqueCourses.filter(c => c.type === "Lab" || c.type === "Practical").length

  const codes = useMemo(() => [...new Set((courses as any[]).map((c: any) => c.code))], [courses])

  const mergedAttendance = useMemo(() => {
    const attGrouped = new Map<string, any[]>()
    ;(attendance || []).forEach((r: any) => {
      const list = attGrouped.get(r.code) || []
      list.push(r)
      attGrouped.set(r.code, list)
    })
    return codes.map(code => {
      const courseEntries = (courses as any[]).filter((c: any) => c.code === code)
      const names = [...new Set(courseEntries.map((c: any) => c.name?.trim()).filter(Boolean))]
      const name = names[0] || code
      const attEntries = attGrouped.get(code)
      if (attEntries && attEntries.length > 0 && attEntries.some((r: any) => r.total > 0)) {
        const attended = attEntries.reduce((s: number, r: any) => s + (r.attended || 0), 0)
        const total = attEntries.reduce((s: number, r: any) => s + (r.total || 0), 0)
        const percentage = total > 0 ? Math.round((attended / total) * 100) : 0
        return { code, name, attended, total, percentage }
      }
      return { code, name, attended: 0, total: 0, percentage: 0 }
    })
  }, [codes, attendance])
  const attendanceWithData = mergedAttendance.filter((r: any) => r.total > 0)
  const overallAttended = attendanceWithData.reduce((s: number, r: any) => s + r.attended, 0)
  const overallTotal = attendanceWithData.reduce((s: number, r: any) => s + r.total, 0)
  const avgAttendance = overallTotal > 0 ? Math.round((overallAttended / overallTotal) * 100) : 0
  const atRiskSubjects = attendanceWithData.filter((a: any) => a.percentage < 75)
  const safeSubjects   = attendanceWithData.filter((a: any) => a.percentage >= 75)
  const attendancePendingCount = codes.length - attendanceWithData.length

  const mergedMarks = useMemo(() => {
    const marksGrouped = new Map<string, any[]>()
    ;(marks as any[]).forEach((m: any) => {
      const list = marksGrouped.get(m.code) || []
      list.push(m)
      marksGrouped.set(m.code, list)
    })
    return codes.map(code => {
      const courseEntries = (courses as any[]).filter((c: any) => c.code === code)
      const names = [...new Set(courseEntries.map((c: any) => c.name?.trim()).filter(Boolean))]
      const name = names[0] || code
      const mEntries = marksGrouped.get(code)
      if (mEntries && mEntries.length > 0) {
        const total = mEntries.reduce((s: number, m: any) => s + (m.total || 0), 0)
        const maxTotal = mEntries.reduce((s: number, m: any) => s + (m.maxTotal || 0), 0)
        return { code, name, total, maxTotal, tests: mEntries.flatMap((m: any) => m.tests || []),
          test1: mEntries.reduce((s: number, m: any) => s + (m.test1 || 0), 0) || null,
          test1_max: mEntries.reduce((s: number, m: any) => s + (m.test1_max || 0), 0),
          test2: mEntries.reduce((s: number, m: any) => s + (m.test2 || 0), 0) || null,
          test2_max: mEntries.reduce((s: number, m: any) => s + (m.test2_max || 0), 0),
          test3: mEntries.reduce((s: number, m: any) => s + (m.test3 || 0), 0) || null,
          test3_max: mEntries.reduce((s: number, m: any) => s + (m.test3_max || 0), 0),
          grade: undefined }
      }
      return { code, name, total: 0, maxTotal: 0, tests: [], test1: null, test1_max: 0, test2: null, test2_max: 0, test3: null, test3_max: 0, grade: undefined }
    })
  }, [codes, marks])
  const totalScored = mergedMarks.reduce((s, m) => s + (m.total || 0), 0)
  const totalMax    = mergedMarks.reduce((s, m) => s + (m.maxTotal || 0), 0)
  const marksPercent = totalMax > 0 ? Math.round((totalScored / totalMax) * 100) : 0
  const upcomingCustomClasses = useMemo(
    () => customClasses.filter((item) => item.repeatMode === "day_order" || item.date >= todayIso).slice(0, 5),
    [customClasses, todayIso]
  )
  const toMins = (value: string) => {
    const [h, m] = value.split(":").map(Number)
    return (h || 0) * 60 + (m || 0)
  }
  const overlapWarning = useMemo(() => {
    const start = toMins(classForm.startTime)
    const end = toMins(classForm.endTime)
    if (!classForm.name.trim() || end <= start) return null

    const targetDayOrder = classForm.repeatMode === "day_order"
      ? classForm.dayOrder
      : (classForm.date ? dateToDoMap[classForm.date] : undefined)

    const regularOverlap = targetDayOrder
      ? timetable.find((slot: any) => {
          if (slot.day_order !== targetDayOrder || !slot.time) return false
          const [slotStart, slotEnd] = String(slot.time).split(" - ").map((value) => toMins(value.trim()))
          return start < slotEnd && end > slotStart
        })
      : null

    if (regularOverlap) {
      return `Overlaps regular class ${regularOverlap.code} (${regularOverlap.time}). You can still add it if needed.`
    }

    const customOverlap = customClasses.find((item) => {
      const sameBucket = classForm.repeatMode === "day_order"
        ? item.repeatMode === "day_order" && item.dayOrder === classForm.dayOrder
        : item.repeatMode === "single" && item.date === classForm.date
      if (!sameBucket) return false
      const itemStart = toMins(item.startTime)
      const itemEnd = toMins(item.endTime)
      return start < itemEnd && end > itemStart
    })

    if (customOverlap) {
      return `Overlaps another custom class ${customOverlap.code} (${customOverlap.startTime}-${customOverlap.endTime}).`
    }

    return null
  }, [classForm, customClasses, dateToDoMap, timetable])

  const updateClassField = (field: string, value: string | number) => {
    setClassFormMessage(null)
    setClassForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddCustomClass = () => {
    const start = toMins(classForm.startTime)
    const end = toMins(classForm.endTime)
    if (!classForm.name.trim()) {
      setClassFormMessage({ tone: "error", text: "Add a class name first." })
      return
    }
    if (classForm.repeatMode === "single" && !classForm.date) {
      setClassFormMessage({ tone: "error", text: "Choose the class date first." })
      return
    }
    if (classForm.repeatMode === "day_order" && !classForm.dayOrder) {
      setClassFormMessage({ tone: "error", text: "Choose the day order for this repeating class." })
      return
    }
    if (!classForm.startTime || !classForm.endTime || end <= start) {
      setClassFormMessage({ tone: "error", text: "Set a valid time range where end time is after start time." })
      return
    }
    addCustomClass(
      createCustomClass({
        ...classForm,
        code: "CUSTOM",
        name: classForm.name.trim(),
        faculty: "",
        room: classForm.room.trim(),
        type: "Custom",
        note: classForm.note.trim(),
        date: classForm.repeatMode === "single" ? classForm.date : "",
      })
    )
    setClassFormMessage({ tone: "success", text: "Class added to your planner." })
    const time = getHourTimeRange(1)
    setClassForm({
      repeatMode: "single",
      date: todayIso,
      dayOrder: 1,
      hour: 1,
      startTime: time.start,
      endTime: time.end,
      code: "CUSTOM",
      name: "",
      faculty: "",
      room: "",
      type: "Custom",
      note: "",
    })
  }

  const handleAddOdMl = () => {
    if (!odMlForm.startDate || !odMlForm.endDate) {
      setOdMlMessage({ tone: "error", text: "Select both start and end dates." })
      return
    }
    if (odMlForm.endDate < odMlForm.startDate) {
      setOdMlMessage({ tone: "error", text: "End date must be after start date." })
      return
    }
    addOdMlEntry(createOdMlEntry({
      type: odMlForm.type,
      startDate: odMlForm.startDate,
      endDate: odMlForm.endDate,
      note: odMlForm.note.trim(),
    }))
    setOdMlMessage({ tone: "success", text: `${odMlForm.type.toUpperCase()} range added.` })
    setOdMlForm({ type: "od", startDate: todayIso, endDate: todayIso, note: "" })
  }

  const handleAddAssignment = () => {
    if (!assignForm.title.trim() || !assignForm.dueDate) return
    addAssignment(
      createAssignment({
        title: assignForm.title.trim(),
        course: assignForm.course.trim().toUpperCase(),
        dueDate: assignForm.dueDate,
        dueTime: assignForm.dueTime,
        priority: assignForm.priority,
        status: "todo",
        note: assignForm.note.trim(),
      })
    )
    setAssignForm((prev) => ({
      ...prev,
      title: "",
      course: "",
      dueTime: "",
      note: "",
      priority: "medium",
    }))
  }

  const pendingAssignments = assignments?.filter((item) => item.status !== "done") || []
  const overdueAssignments = pendingAssignments.filter((item) => item.dueDate < today)
  const todayAssignments = pendingAssignments.filter((item) => item.dueDate === today)

  const groupedAssignments = {
    todo: assignments?.filter((item) => item.status === "todo") || [],
    in_progress: assignments?.filter((item) => item.status === "in_progress") || [],
    done: assignments?.filter((item) => item.status === "done") || [],
  }

  const priorityIconBg: Record<string, string> = {
    high: "bg-rose-500/10 border-rose-500/20",
    medium: "bg-amber-400/10 border-amber-400/20",
    low: "bg-emerald-500/10 border-emerald-500/20",
  }
  const priorityIconColor: Record<string, string> = {
    high: "text-rose-400",
    medium: "text-amber-400",
    low: "text-emerald-400",
  }
  const priorityBadge: Record<string, string> = {
    high: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    low: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  }
  const statusBadge: Record<string, string> = {
    todo: "text-zinc-400 bg-white/5 border-white/10",
    in_progress: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    done: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  }
  const statusLabelColor: Record<string, string> = {
    todo: "text-zinc-400",
    in_progress: "text-cyan-400",
    done: "text-emerald-400",
  }
  const statusMeta = {
    todo: { label: "To do", color: "#f8fafc" },
    in_progress: { label: "In progress", color: "#22d3ee" },
    done: { label: "Done", color: "#34d399" },
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-full pt-[3.75rem] pb-20 px-3 sm:px-4 lg:px-8 lg:pb-8 max-w-5xl mx-auto w-full flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center bg-emerald-500/10 ring-1 ring-emerald-500/20">
            <User className="w-7 h-7 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold text-zinc-100 tracking-tight font-display mb-4">Your Profile</h2>
          <p className="text-sm mb-8 max-w-xs mx-auto px-4 text-zinc-500">
            Login to view your student profile and academic summary.
          </p>
          <motion.button whileTap={{ scale: 0.96 }} onClick={() => setIsLoginOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-all">
            <LogIn className="w-[18px] h-[18px]" /> Connect to SRM Academia
          </motion.button>
        </motion.div>
        <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      </div>
    )
  }

  return (
    <div className="min-h-full pt-[3.75rem] pb-20 px-3 sm:px-4 lg:px-8 lg:pb-8 max-w-5xl mx-auto w-full">

      {/* ── Section heading ── */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-1">Account</h2>
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight font-display">Profile</h1>
          <p className="text-[11px] mt-1 text-zinc-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Your academic summary and planner
          </p>
        </div>
        <AIPromoBadge page="profile" />
      </motion.div>

      {/* ── Identity Hero ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest">Overview</p>
          <div className="flex items-center gap-2">
            <motion.button whileTap={{ scale: 0.9 }} onClick={refreshData} disabled={isLoading}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-zinc-500 bg-zinc-900/60 ring-1 ring-white/5 hover:text-zinc-300 transition-all disabled:opacity-40">
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </motion.button>
            <motion.a whileTap={{ scale: 0.9 }} href="https://academia.srmist.edu.in/" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center w-8 h-8 rounded-lg text-zinc-500 bg-zinc-900/60 ring-1 ring-white/5 hover:text-zinc-300 transition-all">
              <ExternalLink className="w-3.5 h-3.5" />
            </motion.a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-[60px] h-[60px] rounded-2xl flex items-center justify-center shrink-0 overflow-hidden bg-gradient-to-br from-emerald-400 to-emerald-500">
            {photoUrl && !photoError ? (
              <img src={photoUrl} alt={user?.name || "Profile"} className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-zinc-950" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-zinc-100 tracking-tight font-display break-words">{user?.name}</h1>
            <p className="text-[11px] font-mono text-zinc-500">{user?.username}</p>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                {user?.program}
              </span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-zinc-800/60 text-zinc-300 ring-1 ring-white/5">
                Sem {user?.semester}
              </span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-zinc-800/60 text-zinc-300 ring-1 ring-white/5">
                Batch {user?.batch}
              </span>
              {todayDO && (
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20">
                  DO {todayDO} today
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

       {/* ── Info grid ── */}
       <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
         className="grid grid-cols-2 gap-2 mb-8">
         {[
           { label: "Department", value: user?.department, icon: Building },
           { label: "Class", value: user?.specialization, icon: Layers },
           { label: "Semester", value: user?.semester ? `Semester ${user.semester}` : "—", icon: Calendar },
           { label: "Program", value: user?.program, icon: GraduationCap },
         ].map((item, i) => (
           <motion.div 
             key={i}
             onClick={() => setExpandedInfoCard(expandedInfoCard === i ? null : i)}
             className="flex gap-2.5 rounded-xl px-3 py-3 bg-zinc-900/30 ring-1 ring-white/[0.04] cursor-pointer hover:ring-white/10 transition-all"
           >
             <item.icon className="w-3.5 h-3.5 shrink-0 text-zinc-600 mt-0.5" />
             <div className="min-w-0">
               <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">{item.label}</p>
               <p className={`text-sm font-semibold text-zinc-200 mt-0.5 ${expandedInfoCard === i ? "whitespace-normal break-words" : "truncate"}`}>
                 {item.value || "—"}
               </p>
             </div>
           </motion.div>
         ))}
       </motion.div>

      {/* ── Stats row ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="grid grid-cols-3 gap-2 mb-8">
        <div className="rounded-2xl px-4 py-3.5 bg-zinc-900/40 ring-1 ring-white/5">
          <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">Attendance</p>
          <p className={`text-xl font-bold font-display mt-1 ${avgAttendance >= 75 ? "text-emerald-400" : "text-rose-400"}`}>{avgAttendance}%</p>
          <p className={`text-[10px] mt-0.5 font-medium ${avgAttendance >= 75 ? "text-emerald-400/70" : "text-rose-400/70"}`}>
            {avgAttendance >= 75 ? `${safeSubjects.length} safe` : `${atRiskSubjects.length} at risk`}
          </p>
        </div>
        <div className="rounded-2xl px-4 py-3.5 bg-zinc-900/40 ring-1 ring-white/5">
          <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">Marks</p>
          <p className={`text-xl font-bold font-display mt-1 ${marksPercent >= 60 ? "text-emerald-400" : "text-amber-400"}`}>{marksPercent}%</p>
          <p className="text-[10px] mt-0.5 text-zinc-500">{totalScored.toFixed(1)} / {totalMax}</p>
        </div>
        <div className="rounded-2xl px-4 py-3.5 bg-zinc-900/40 ring-1 ring-white/5">
          <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">Credits</p>
          <p className="text-xl font-bold font-display mt-1 text-cyan-400">{totalCredits}</p>
          <p className="text-[10px] mt-0.5 text-zinc-500">{uniqueCourses.length} courses</p>
        </div>
      </motion.div>

      {/* ── At-risk subjects ── */}
      {atRiskSubjects.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl px-4 py-3.5 bg-rose-500/5 ring-1 ring-rose-500/10 mb-8">
          <p className="text-rose-400 text-[9px] font-bold uppercase tracking-widest mb-2">Subjects below 75% attendance</p>
          <div className="space-y-1">
            {atRiskSubjects.map((s: any) => (
              <div key={s.code} className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">{s.code}</span>
                <span className="font-bold text-rose-400">{s.percentage}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Support ── */}
      <motion.button onClick={handleSupportClick} whileTap={{ scale: 0.98 }}
        className="w-full flex items-center gap-4 p-4 rounded-2xl mb-8 text-left"
        style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.15)" }}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)" }}>
          <Heart className="w-4 h-4" style={{ color: "#a78bfa" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold" style={{ color: "#a78bfa" }}>Support edutechsrm</p>
          <p className="text-[10px] mt-0.5 text-zinc-500">Help cover domain & Cloudflare costs</p>
        </div>
      </motion.button>

      {/* ── Custom Planner ── */}
      <div id="custom-planner-section" className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-white/5" />
        <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Custom Planner</span>
        <div className="flex-1 h-px bg-white/5" />
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
        className="group bg-zinc-900/40 ring-1 ring-white/5 rounded-2xl hover:ring-zinc-700 hover:bg-zinc-900/60 transition-all relative overflow-hidden mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <button
          onClick={() => setShowCustomForm(p => !p)}
          className="w-full flex items-center justify-between gap-2 p-5 relative z-10"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-cyan-500/10 ring-1 ring-cyan-500/20">
              <BookMarked className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-zinc-100">Add class</p>
              <p className="text-xs text-zinc-500 mt-0.5 truncate">Extra classes show in Timetable and Calendar.</p>
            </div>
          </div>
          <motion.div animate={{ rotate: showCustomForm ? 180 : 0 }} transition={{ duration: 0.2 }} className="self-stretch flex items-center">
            <ChevronDown className="w-4 h-4 shrink-0 text-zinc-500" />
          </motion.div>
        </button>

        <AnimatePresence initial={false}>
          {showCustomForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 border-t border-white/5 relative z-10">
                <div className="pt-4 grid grid-cols-2 gap-3">
                  <div className="col-span-2 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => updateClassField("repeatMode", "single")}
                      className={`rounded-xl px-3 py-3 text-xs font-bold transition-all ${
                        classForm.repeatMode === "single"
                          ? "bg-emerald-500/10 ring-1 ring-emerald-500/30 text-emerald-400"
                          : "bg-zinc-950 ring-1 ring-white/5 text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      Single date
                    </button>
                    <button
                      onClick={() => updateClassField("repeatMode", "day_order")}
                      className={`rounded-xl px-3 py-3 text-xs font-bold transition-all ${
                        classForm.repeatMode === "day_order"
                          ? "bg-emerald-500/10 ring-1 ring-emerald-500/30 text-emerald-400"
                          : "bg-zinc-950 ring-1 ring-white/5 text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      Repeat by day order
                    </button>
                  </div>
                  {classForm.repeatMode === "single" ? (
                    <div className="col-span-2">
                      <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">Date</p>
                      <input type="date" value={classForm.date} onChange={(e) => updateClassField("date", e.target.value)}
                        className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-medium shadow-inner" />
                    </div>
                  ) : (
                    <div className="col-span-2">
                      <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">Day order</p>
                      <select value={classForm.dayOrder} onChange={(e) => updateClassField("dayOrder", Number(e.target.value))}
                        className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-medium shadow-inner">
                        {[1, 2, 3, 4, 5].map((dayOrder) => (
                          <option key={dayOrder} value={dayOrder}>Day Order {dayOrder}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="col-span-2">
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">Class name <span className="text-emerald-400">*</span></p>
                    <input value={classForm.name} onChange={(e) => updateClassField("name", e.target.value)}
                      placeholder="Revision class"
                      className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-medium placeholder-zinc-700 shadow-inner" />
                  </div>
                  <div>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">Start time <span className="text-emerald-400">*</span></p>
                    <input type="time" value={classForm.startTime} onChange={(e) => updateClassField("startTime", e.target.value)}
                      className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-medium shadow-inner" />
                  </div>
                  <div>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">End time <span className="text-emerald-400">*</span></p>
                    <input type="time" value={classForm.endTime} onChange={(e) => updateClassField("endTime", e.target.value)}
                      className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-medium shadow-inner" />
                  </div>
                  <div>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">Room</p>
                    <input value={classForm.room} onChange={(e) => updateClassField("room", e.target.value)}
                      placeholder="Room / Lab"
                      className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-medium placeholder-zinc-700 shadow-inner" />
                  </div>
                  <div>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">Note</p>
                    <input value={classForm.note} onChange={(e) => updateClassField("note", e.target.value)}
                      placeholder="Optional note"
                      className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-medium placeholder-zinc-700 shadow-inner" />
                  </div>
                </div>

                <button onClick={handleAddCustomClass}
                  className="w-full bg-emerald-500 text-zinc-950 font-bold text-xs uppercase tracking-wider py-4 rounded-xl hover:bg-emerald-400 transition-all mt-4 flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add class
                </button>
                {classFormMessage ? (
                  <p className={`mt-2 text-[10px] font-bold uppercase tracking-widest ${classFormMessage.tone === "success" ? "text-emerald-400" : "text-rose-400"}`}>
                    {classFormMessage.text}
                  </p>
                ) : null}
                {overlapWarning ? (
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-amber-400">
                    {overlapWarning}
                  </p>
                ) : null}

                <div className="mt-4 space-y-2">
                  {upcomingCustomClasses.length > 0 ? upcomingCustomClasses.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 rounded-xl px-4 py-3 bg-zinc-950/50 ring-1 ring-white/[0.04]">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-cyan-500/10 ring-1 ring-cyan-500/20">
                        <Clock3 className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-zinc-200">{item.name}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {item.code} · {item.repeatMode === "day_order" ? `DO ${item.dayOrder}` : new Date(`${item.date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {item.startTime} - {item.endTime}
                        </p>
                        <p className="text-xs text-zinc-600 mt-0.5">{item.room ? `${item.room} · ` : ""}{item.faculty || item.type}</p>
                      </div>
                      <button onClick={() => removeCustomClass(item.id)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-rose-500/10 ring-1 ring-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )) : (
                    <p className="text-xs text-zinc-600 text-center pt-1">No custom classes added yet.</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── OD/ML Planner (under Custom Planner) ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
        id="od-ml-planner-section"
        className="group bg-zinc-900/40 ring-1 ring-white/5 rounded-2xl hover:ring-zinc-700 hover:bg-zinc-900/60 transition-all relative overflow-hidden mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <button
          onClick={() => setShowOdMlForm((p) => !p)}
          className="w-full flex items-center justify-between gap-2 p-5 relative z-10"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-500/10 ring-1 ring-emerald-500/20">
              <Calendar className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-zinc-100">OD / ML planner</p>
              <p className="text-xs text-zinc-500 mt-0.5 truncate">Set leave ranges for attendance adjustment.</p>
            </div>
          </div>
          <motion.div animate={{ rotate: showOdMlForm ? 180 : 0 }} transition={{ duration: 0.2 }} className="self-stretch flex items-center">
            <ChevronDown className="w-4 h-4 shrink-0 text-zinc-500" />
          </motion.div>
        </button>

        <AnimatePresence initial={false}>
          {showOdMlForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 border-t border-white/5 relative z-10">
                <div className="pt-4 grid grid-cols-2 gap-3">
                  <div className="col-span-2 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => { setOdMlMessage(null); setOdMlForm((p) => ({ ...p, type: "od" })) }}
                      className={`rounded-xl px-3 py-3 text-xs font-bold transition-all ${
                        odMlForm.type === "od"
                          ? "bg-emerald-500/10 ring-1 ring-emerald-500/30 text-emerald-400"
                          : "bg-zinc-950 ring-1 ring-white/5 text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      OD
                    </button>
                    <button
                      onClick={() => { setOdMlMessage(null); setOdMlForm((p) => ({ ...p, type: "ml" })) }}
                      className={`rounded-xl px-3 py-3 text-xs font-bold transition-all ${
                        odMlForm.type === "ml"
                          ? "bg-emerald-500/10 ring-1 ring-emerald-500/30 text-emerald-400"
                          : "bg-zinc-950 ring-1 ring-white/5 text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      ML
                    </button>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">From</p>
                    <input type="date" value={odMlForm.startDate} onChange={(e) => { setOdMlMessage(null); setOdMlForm((p) => ({ ...p, startDate: e.target.value })) }}
                      className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-medium shadow-inner" />
                  </div>
                  <div>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">To</p>
                    <input type="date" value={odMlForm.endDate} onChange={(e) => { setOdMlMessage(null); setOdMlForm((p) => ({ ...p, endDate: e.target.value })) }}
                      className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-medium shadow-inner" />
                  </div>
                  <div className="col-span-2">
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">Note</p>
                    <input value={odMlForm.note} onChange={(e) => { setOdMlMessage(null); setOdMlForm((p) => ({ ...p, note: e.target.value })) }}
                      placeholder="Optional note"
                      className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-medium placeholder-zinc-700 shadow-inner" />
                  </div>
                </div>

                <button onClick={handleAddOdMl}
                  className="w-full bg-emerald-500 text-zinc-950 font-bold text-xs uppercase tracking-wider py-4 rounded-xl hover:bg-emerald-400 transition-all mt-4 flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add {odMlForm.type.toUpperCase()} range
                </button>
                {odMlMessage ? (
                  <p className={`mt-2 text-[10px] font-bold uppercase tracking-widest ${odMlMessage.tone === "success" ? "text-emerald-400" : "text-rose-400"}`}>
                    {odMlMessage.text}
                  </p>
                ) : null}

                <p className="mt-3 text-[10px] text-zinc-600">
                  OD applies to theory and lab-based theory only. Normal practical sessions are excluded.
                </p>

                <div className="mt-4 space-y-2">
                  {odMlEntries.length > 0 ? odMlEntries.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 rounded-xl px-4 py-3 bg-zinc-950/50 ring-1 ring-white/[0.04]">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-500/10 ring-1 ring-emerald-500/20">
                        <Calendar className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-zinc-200">{item.type.toUpperCase()} · {item.startDate} to {item.endDate}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{item.note || "No note"}</p>
                      </div>
                      <button onClick={() => removeOdMlEntry(item.id)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-rose-500/10 ring-1 ring-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )) : (
                    <p className="text-xs text-zinc-600 text-center pt-1">No OD/ML ranges added yet.</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Assignments (under Custom Planner) ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
        className="group bg-zinc-900/40 ring-1 ring-white/5 rounded-2xl hover:ring-zinc-700 hover:bg-zinc-900/60 transition-all relative overflow-hidden mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <button
          onClick={() => setShowAssignmentsForm(p => !p)}
          className="w-full flex items-center justify-between gap-2 p-5 relative z-10"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-500/10 ring-1 ring-emerald-500/20">
              <ClipboardCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-zinc-100">Assignments</p>
              <p className="text-xs text-zinc-500 mt-0.5 truncate">{assignments?.length || 0} items · {pendingAssignments.length} pending</p>
            </div>
          </div>
          <motion.div animate={{ rotate: showAssignmentsForm ? 180 : 0 }} transition={{ duration: 0.2 }} className="self-stretch flex items-center">
            <ChevronDown className="w-4 h-4 shrink-0 text-zinc-500" />
          </motion.div>
        </button>

        <AnimatePresence initial={false}>
          {showAssignmentsForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 border-t border-white/5 relative z-10">
                {/* Stat cards */}
                <div className="grid grid-cols-3 gap-3 pt-4 mb-4">
                  {[
                    { label: "Pending", value: pendingAssignments.length, cls: "text-zinc-200" },
                    { label: "Due today", value: todayAssignments.length, cls: "text-cyan-400" },
                    { label: "Overdue", value: overdueAssignments.length, cls: "text-rose-400" },
                  ].map((item) => (
                    <div key={item.label} className="bg-zinc-950/50 ring-1 ring-white/5 rounded-xl px-3 py-3 text-center">
                      <p className={`text-base font-black ${item.cls}`}>{item.value}</p>
                      <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest mt-0.5">{item.label}</p>
                    </div>
                  ))}
                </div>

                {/* Add assignment form */}
                <div className="bg-zinc-950/30 ring-1 ring-white/5 rounded-2xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Plus className="w-4 h-4 text-emerald-400" />
                    <p className="text-xs font-semibold text-zinc-200">Add assignment</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest mb-1">Title</p>
                      <input value={assignForm.title} onChange={(e) => setAssignForm((p) => ({ ...p, title: e.target.value }))}
                        placeholder="DBMS assignment 2"
                        className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-medium placeholder-zinc-700 shadow-inner" />
                    </div>
                    <div>
                      <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest mb-1">Course</p>
                      <input value={assignForm.course} onChange={(e) => setAssignForm((p) => ({ ...p, course: e.target.value }))}
                        placeholder="21CSC201T"
                        className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-medium placeholder-zinc-700 shadow-inner" />
                    </div>
                    <div>
                      <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest mb-1">Priority</p>
                      <select value={assignForm.priority} onChange={(e) => setAssignForm((p) => ({ ...p, priority: e.target.value as "low" | "medium" | "high" }))}
                        className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-medium shadow-inner">
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                    <div>
                      <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest mb-1">Due date</p>
                      <input type="date" value={assignForm.dueDate} onChange={(e) => setAssignForm((p) => ({ ...p, dueDate: e.target.value }))}
                        className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-medium shadow-inner" />
                    </div>
                    <div>
                      <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest mb-1">Time</p>
                      <input type="time" value={assignForm.dueTime} onChange={(e) => setAssignForm((p) => ({ ...p, dueTime: e.target.value }))}
                        className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-medium shadow-inner" />
                    </div>
                    <div className="col-span-2">
                      <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest mb-1">Note</p>
                      <input value={assignForm.note} onChange={(e) => setAssignForm((p) => ({ ...p, note: e.target.value }))}
                        placeholder="Optional note"
                        className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-medium placeholder-zinc-700 shadow-inner" />
                    </div>
                  </div>
                  <button onClick={handleAddAssignment}
                    className="w-full mt-3 rounded-xl px-4 py-3 flex items-center justify-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all">
                    <Plus className="w-3.5 h-3.5" />
                    Add assignment
                  </button>
                </div>

                {/* Assignment board */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ClipboardList className="w-4 h-4 text-emerald-400" />
                    <p className="text-xs font-semibold text-zinc-200">Assignment board</p>
                    <span className="text-[9px] text-zinc-500 font-bold ml-auto">{assignments?.length || 0} total</span>
                  </div>

                  <div className="space-y-4">
                    {(["todo", "in_progress", "done"] as const).map((status) => (
                      <div key={status}>
                        <div className="flex items-center justify-between mb-2">
                          <p className={`text-[9px] font-bold uppercase tracking-widest ${statusLabelColor[status]}`}>
                            {statusMeta[status].label}
                          </p>
                          <span className="text-[9px] text-zinc-500 font-bold">{groupedAssignments[status].length}</span>
                        </div>
                        <div className="space-y-2">
                          {groupedAssignments[status].length > 0 ? groupedAssignments[status].map((item, idx) => {
                            const nextStatus = item.status === "todo" ? "in_progress" : item.status === "in_progress" ? "done" : "todo"
                            return (
                              <div key={item.id}
                                className="group/item bg-zinc-950/30 ring-1 ring-white/5 rounded-xl p-4 hover:ring-zinc-700 transition-all relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover/item:opacity-100 transition-opacity duration-500" />
                                <div className="flex items-start gap-3 relative z-10">
                                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ring-1 ${priorityIconBg[item.priority]}`}>
                                    {item.status === "done" ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                    ) : (
                                      <Clock3 className={`w-3.5 h-3.5 ${priorityIconColor[item.priority]}`} />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className="text-xs font-semibold text-zinc-200">{item.title}</p>
                                      <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg ring-1 ${priorityBadge[item.priority]}`}>
                                        {item.priority === "high" ? "High" : item.priority === "medium" ? "Med" : "Low"}
                                      </span>
                                      {item.course ? (
                                        <span className="text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg ring-1 text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
                                          {item.course}
                                        </span>
                                      ) : null}
                                    </div>
                                    <p className="text-[10px] text-zinc-500 mt-1">
                                      Due {new Date(`${item.dueDate}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", weekday: "short" })}
                                      {item.dueTime ? ` · ${item.dueTime}` : ""}
                                    </p>
                                    {item.note ? (
                                      <p className="text-[10px] text-zinc-500 mt-0.5">{item.note}</p>
                                    ) : null}
                                    <div className="flex items-center gap-2 mt-2">
                                      <button onClick={() => updateAssignment(item.id, { status: nextStatus })}
                                        className={`text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg ring-1 transition-all hover:opacity-80 ${statusBadge[nextStatus]}`}>
                                        Move to {statusMeta[nextStatus].label}
                                      </button>
                                      <button onClick={() => removeAssignment(item.id)}
                                        className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-all">
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          }) : (
                            <p className="text-[10px] text-zinc-600 text-center py-3 bg-zinc-950/20 ring-1 ring-white/5 rounded-xl">
                              Nothing in {statusMeta[status].label.toLowerCase()} right now.
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Logout ── */}
      <motion.button whileTap={{ scale: 0.98 }} onClick={() => setShowSignOutModal(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-rose-500/10 ring-1 ring-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all">
        <LogIn className="w-3.5 h-3.5 rotate-180" />
        Logout
      </motion.button>

      <SignOutModal
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={() => {
          setShowSignOutModal(false)
          logout()
        }}
      />

      <SupportModal isOpen={isSupportOpen} onClose={closeSupport} />

    </div>
  )
}
