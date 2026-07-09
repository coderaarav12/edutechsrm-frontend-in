"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  RefreshCw, BookOpen, LogIn, User, Clock, Award,
  GraduationCap, Beaker, BookText, Search, ChevronDown, MapPin,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { LoginModal } from "./login-modal"
import { AIPromoBadge } from "@/components/ai-promo-badge"

const typeStyles: Record<string, { badge: string; accent: string; ring: string }> = {
  theory: {
    badge: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    accent: "bg-emerald-400",
    ring: "ring-emerald-500/20",
  },
  lab: {
    badge: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    accent: "bg-sky-400",
    ring: "ring-sky-500/20",
  },
  practical: {
    badge: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    accent: "bg-violet-400",
    ring: "ring-violet-500/20",
  },
  "lab based": {
    badge: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    accent: "bg-amber-400",
    ring: "ring-amber-500/20",
  },
}

function getTypeStyle(type: string) {
  const t = type?.toLowerCase()
  if (t === "theory") return typeStyles.theory
  if (t === "lab" || t === "practical") return typeStyles.lab
  if (t?.includes("lab based")) return typeStyles["lab based"]
  return typeStyles.theory
}

function getTypeIcon(type: string) {
  const t = type?.toLowerCase()
  if (t === "theory") return <BookText className="w-3 h-3" />
  if (t?.includes("lab")) return <Beaker className="w-3 h-3" />
  return <BookOpen className="w-3 h-3" />
}

export function CoursesSection() {
  const { isAuthenticated, courses, timetable, isLoading, refreshData, user } = useAuth()
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "Theory" | "Lab">("all")
  const [expandedCode, setExpandedCode] = useState<string | null>(null)
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  // Room lookup from timetable — collect all distinct rooms per code
  const codeToRooms = (timetable as any[]).reduce((map: Record<string, Set<string>>, slot: any) => {
    if (slot.code && slot.room) {
      if (!map[slot.code]) map[slot.code] = new Set()
      map[slot.code].add(slot.room)
    }
    return map
  }, {})

  // Deduplicate courses intelligently:
  // - Same code + same name = same subject split into Theory/Lab components → keep highest-credit entry only
  // - Same code + different name = genuinely different subjects that share a code → keep both
  const uniqueCourses: any[] = (() => {
    const byCode = new Map<string, any[]>()
    ;(courses as any[]).forEach((c: any) => {
      const list = byCode.get(c.code) || []
      list.push(c)
      byCode.set(c.code, list)
    })
    const result: any[] = []
    byCode.forEach((entries) => {
      if (entries.length === 1) {
        result.push(entries[0])
        return
      }
      // Check if all entries share a related name (one contains another, e.g. "Python" vs "Python Lab")
      const names = entries.map(e => e.name?.trim().toLowerCase() || "")
      const firstName = names[0]
      const allRelated = names.every(n => n.includes(firstName) || firstName.includes(n))
      if (allRelated) {
        // Same subject — pick the entry with the highest credits
        const best = entries.reduce((a, b) => (b.credits || 0) > (a.credits || 0) ? b : a)
        result.push(best)
      } else {
        // Different subjects sharing a code — keep all of them
        result.push(...entries)
      }
    })
    return result
  })()

  const totalCredits = uniqueCourses.reduce((s, c) => s + (c.credits || 0), 0)
  const theoryCount = uniqueCourses.filter(c => c.type === "Theory").length
  const labCount = uniqueCourses.filter(c => c.type === "Lab" || c.type === "Practical" || c.type === "Lab Based Theory").length

  const filteredCourses = uniqueCourses.filter(course => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      course.name?.toLowerCase().includes(q) ||
      course.code?.toLowerCase().includes(q) ||
      course.faculty?.toLowerCase().includes(q)
    const matchesType =
      typeFilter === "all" ||
      course.type === typeFilter ||
      (typeFilter === "Lab" && (course.type === "Practical" || course.type?.includes("Lab")))
    return matchesSearch && matchesType
  })

  if (!isAuthenticated) {
    return (
      <div className="min-h-full pt-[3.75rem] pb-20 px-3 sm:px-4 lg:px-8 lg:pb-8 w-full flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 ring-1 ring-white/5 flex items-center justify-center">
            <GraduationCap className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-zinc-100">Your Courses</h2>
          <p className="text-zinc-500 max-w-md mx-auto mb-8">
            Login with your SRM Academia credentials to see your registered courses.
          </p>
          <Button size="lg" onClick={() => setIsLoginOpen(true)}
            className="bg-gradient-to-r from-emerald-500 to-emerald-400 text-zinc-950 hover:opacity-90 font-bold">
            <LogIn className="w-5 h-5 mr-2" />Connect to SRM Academia
          </Button>
        </motion.div>
        <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      </div>
    )
  }

  return (
    <div className="min-h-full pt-[3.75rem] pb-20 px-3 sm:px-4 lg:px-8 lg:pb-8 w-full">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-1">Course Hub</h2>
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight font-display">Courses</h1>
          <p className="text-zinc-500 text-xs mt-1">
            {user?.specialization || user?.program} · Sem {user?.semester} · {uniqueCourses.length} subjects
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AIPromoBadge page="courses" />
          <motion.button whileTap={{ scale: 0.9 }} onClick={refreshData} disabled={isLoading}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-zinc-500 bg-zinc-900/60 ring-1 ring-white/5 hover:text-zinc-300 transition-all disabled:opacity-40">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </motion.button>
        </div>
      </motion.div>

      {/* Hero stats */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-zinc-900/60 ring-1 ring-white/5 rounded-2xl p-6 mb-8">
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: "Courses", value: uniqueCourses.length, color: "text-emerald-400" },
            { label: "Credits", value: totalCredits, color: "text-amber-400" },
            { label: "Theory", value: theoryCount, color: "text-emerald-400" },
          ].map(s => (
            <div key={s.label}>
              <p className={`font-display font-bold text-2xl tracking-tighter ${s.color}`}>{s.value}</p>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <div className="w-full h-1 bg-zinc-950 rounded-full overflow-hidden ring-1 ring-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${uniqueCourses.length > 0 ? (theoryCount / uniqueCourses.length) * 100 : 0}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-400"
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-emerald-400 text-[10px]">Theory {theoryCount}</span>
            <span className="text-sky-400 text-[10px]">Lab {labCount}</span>
          </div>
        </div>
      </motion.div>

      {/* Search + filter */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="space-y-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            placeholder="Search courses, faculty..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder-zinc-700 pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-zinc-900 rounded-xl p-1 border border-white/5">
            {(["all", "Theory", "Lab"] as const).map(f => (
              <button key={f} onClick={() => setTypeFilter(f)}
                className={`px-4 py-1.5 text-xs font-bold transition-all rounded-lg ${
                  typeFilter === f
                    ? "bg-zinc-800 text-zinc-100 shadow-md border border-white/5"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}>
                {f === "all" ? "All" : f === "Theory" ? "Theory" : "Labs"}
              </button>
            ))}
          </div>
          <span className="ml-auto text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
            {filteredCourses.length}/{uniqueCourses.length}
          </span>
        </div>
      </motion.div>

      {/* Course cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredCourses.map((course, idx) => {
          const isOpen = expandedCode === course.code
          const facultyClean = course.faculty?.replace(/\s*\(\d+\)\s*$/, "").trim() || "—"
          const courseRooms = codeToRooms[course.code]
          const roomList = courseRooms?.size
            ? [...courseRooms].filter(Boolean)
            : [course.roomNo || course.room || "—"].filter(Boolean)
          const ts = getTypeStyle(course.type)

          return (
            <motion.div
              key={course.code}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className={`group bg-zinc-900/30 ring-1 rounded-xl transition-all relative overflow-hidden ${
                isOpen ? ts.ring : "ring-white/5"
              } ${isDesktop ? "" : "cursor-pointer"}`}
            >
              {/* Mobile: accordion header */}
              {!isDesktop && (
                <button onClick={() => setExpandedCode(isOpen ? null : course.code)}
                  className="w-full text-left p-4 lg:hidden">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-[0.1em] block mb-0.5">{course.code}</span>
                      <h4 className={`font-semibold text-zinc-200 text-sm tracking-tight ${!isOpen ? "truncate" : ""}`}>{course.name}</h4>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ring-1 inline-flex items-center ${ts.badge}`}>
                        {getTypeIcon(course.type)}
                        <span className="ml-1">{course.type}</span>
                      </span>
                      <span className="font-display font-bold text-base text-zinc-100">{course.credits}<span className="text-[10px] text-zinc-600 ml-0.5">cr</span></span>
                      <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                      </motion.div>
                    </div>
                  </div>
                </button>
              )}

              {/* Desktop: always expanded header */}
              {isDesktop && (
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-[0.1em] block mb-0.5">{course.code}</span>
                      <h4 className="font-semibold text-zinc-200 text-sm tracking-tight">{course.name}</h4>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ring-1 inline-flex items-center ${ts.badge}`}>
                        {getTypeIcon(course.type)}
                        <span className="ml-1">{course.type}</span>
                      </span>
                      <span className="font-display font-bold text-base text-zinc-100">{course.credits}<span className="text-[10px] text-zinc-600 ml-0.5">cr</span></span>
                    </div>
                  </div>
                </div>
              )}

              {/* Expanded content: always visible on desktop, accordion on mobile */}
              <div className={`${isDesktop ? "block" : isOpen ? "block" : "hidden"}`}>
                <div className="border-t border-white/5 mx-0" />
                <div className="px-4 pb-4 pt-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg px-3 py-2 bg-zinc-900/50 ring-1 ring-white/5">
                      <Award className="w-3 h-3 text-emerald-400 mb-1" />
                      <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">Credits</p>
                      <p className="text-xs font-bold text-zinc-100 mt-0.5">{course.credits}</p>
                    </div>
                    <div className="rounded-lg px-3 py-2 bg-zinc-900/50 ring-1 ring-white/5">
                      <Clock className="w-3 h-3 text-emerald-400 mb-1" />
                      <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">Slot</p>
                      <p className="text-xs font-bold text-zinc-100 mt-0.5">{course.slot || "TBA"}</p>
                    </div>
                    <div className="rounded-lg px-3 py-2 bg-zinc-900/50 ring-1 ring-white/5">
                      <MapPin className="w-3 h-3 text-emerald-400 mb-1" />
                      <div>
                        <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">Room</p>
                        {roomList.map((r, i) => (
                          <p key={i} className="text-xs font-bold text-zinc-100 mt-0.5">{r}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg px-3 py-2 bg-zinc-900/50 ring-1 ring-white/5 mt-2">
                    <User className="w-3 h-3 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">Faculty</p>
                      <p className="text-[10px] font-semibold text-zinc-100 truncate">{facultyClean}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {filteredCourses.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <p className="text-zinc-500 text-sm">No courses matching your search</p>
        </motion.div>
      )}
    </div>
  )
}
