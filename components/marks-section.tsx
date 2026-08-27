"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  RefreshCw,
  LogIn,
  Award,
  BookOpen,
  Trophy,
  Target,
  ChevronDown,
  GraduationCap,
  Sparkles,
  ChevronRight,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useStudentPortal } from "@/lib/student-portal-context"
import { LoginModal } from "./login-modal"
import { AIPromoBadge } from "@/components/ai-promo-badge"

export function MarksSection() {
  const { isAuthenticated, marks, courses, isLoading, refreshData, user } = useAuth()
  const { portalData, isPortalConnected, isSessionExpired, openGradesModal, openPortalLogin } = useStudentPortal()
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  // Map internal marks from Academia and Student Portal scraper directly into subjects
  const mergedMarks = useMemo(() => {
    // 1. Primary Academia marks map
    const marksByCode = new Map<string, any[]>()
    ;(marks as any[] || []).forEach((m: any) => {
      if (!m?.code) return
      const list = marksByCode.get(m.code) || []
      list.push(m)
      marksByCode.set(m.code, list)
    })

    // 2. Student Portal Scraper internal marks map
    const portalInternalByCode = new Map<string, any[]>()
    if (Array.isArray(portalData?.internalMarks)) {
      portalData.internalMarks.forEach((item: any) => {
        if (!item?.code) return
        const list = portalInternalByCode.get(item.code) || []
        list.push(item)
        portalInternalByCode.set(item.code, list)
      })
    }

    // 3. Types and categories
    const normalizeCat = (v: string) => {
      const t = String(v || "").toLowerCase().trim()
      if (t.includes("lab")) return "Practical"
      if (t === "practical" || t === "theory") return t[0].toUpperCase() + t.slice(1)
      return v
    }
    const typesByCode = new Map<string, Set<string>>()
    ;(courses as any[] || []).forEach((c: any) => {
      if (!typesByCode.has(c.code)) typesByCode.set(c.code, new Set())
      typesByCode.get(c.code)!.add(normalizeCat(c.type))
    })

    // 4. Combine all unique course codes
    const allCodes = [
      ...new Set([
        ...(courses as any[] || []).map((c: any) => c.code),
        ...Array.from(marksByCode.keys()),
        ...Array.from(portalInternalByCode.keys()),
        ...(portalData?.attendance || []).map((a: any) => a.code),
        ...(portalData?.unifiedSubjects || []).map((u: any) => u.code),
      ]),
    ].filter(Boolean)

    return allCodes.map((code) => {
      const courseEntries = (courses as any[] || []).filter((c: any) => c.code === code)
      const names = [...new Set(courseEntries.map((c: any) => c.name?.trim()).filter(Boolean))]
      const marksEntries = marksByCode.get(code) || []
      const portalEntries = portalInternalByCode.get(code) || []
      const unified = (portalData?.unifiedSubjects || []).find((u: any) => u.code === code)

      const name =
        names[0] ||
        unified?.name ||
        portalEntries[0]?.description ||
        marksEntries[0]?.name ||
        code

      const types = [...(typesByCode.get(code) || [])]
      const type = types.length > 1 ? "Theory + Practical" : types[0] || unified?.category || "Course"

      // Case A: Primary Academia marks exist
      if (marksEntries.length > 0) {
        const total = marksEntries.reduce((s: number, m: any) => s + (m.total || 0), 0)
        const maxTotal = marksEntries.reduce((s: number, m: any) => s + (m.maxTotal || 0), 0)
        const tests = marksEntries.flatMap((m: any) => m.tests || [])
        const test1 = marksEntries.reduce((s: number, m: any) => s + (m.test1 || 0), 0) || null
        const test1_max = marksEntries.reduce((s: number, m: any) => s + (m.test1_max || 0), 0)
        const test2 = marksEntries.reduce((s: number, m: any) => s + (m.test2 || 0), 0) || null
        const test2_max = marksEntries.reduce((s: number, m: any) => s + (m.test2_max || 0), 0)
        const test3 = marksEntries.reduce((s: number, m: any) => s + (m.test3 || 0), 0) || null
        const test3_max = marksEntries.reduce((s: number, m: any) => s + (m.test3_max || 0), 0)
        const pct = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0
        const grade =
          pct >= 90
            ? "O"
            : pct >= 80
            ? "A+"
            : pct >= 70
            ? "A"
            : pct >= 60
            ? "B+"
            : pct >= 50
            ? "B"
            : pct >= 40
            ? "C"
            : pct > 0
            ? "F"
            : undefined
        return {
          code,
          name,
          type,
          tests,
          test1,
          test1_max,
          test2,
          test2_max,
          test3,
          test3_max,
          total,
          maxTotal,
          grade,
        }
      }

      // Case B: Portal internal marks exist
      if (portalEntries.length > 0) {
        const tests = portalEntries.map((p: any) => {
          const scoredNum = parseFloat(String(p.marks || "0"))
          const validNum = !isNaN(scoredNum) ? scoredNum : 0
          return {
            test: p.description || "Internal Test",
            scored: validNum,
            max: 50,
          }
        })
        const total = tests.reduce((s: number, t: any) => s + t.scored, 0)
        const maxTotal = tests.reduce((s: number, t: any) => s + t.max, 0)
        const pct = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0
        const grade =
          pct >= 90
            ? "O"
            : pct >= 80
            ? "A+"
            : pct >= 70
            ? "A"
            : pct >= 60
            ? "B+"
            : pct >= 50
            ? "B"
            : pct >= 40
            ? "C"
            : pct > 0
            ? "F"
            : undefined
        return {
          code,
          name,
          type,
          tests,
          test1: tests[0]?.scored ?? null,
          test1_max: tests[0]?.max ?? 0,
          test2: tests[1]?.scored ?? null,
          test2_max: tests[1]?.max ?? 0,
          test3: tests[2]?.scored ?? null,
          test3_max: tests[2]?.max ?? 0,
          total,
          maxTotal,
          grade,
        }
      }

      // Default: Pending marks
      return {
        code,
        name,
        type,
        tests: [],
        test1: null,
        test1_max: 0,
        test2: null,
        test2_max: 0,
        test3: null,
        test3_max: 0,
        total: 0,
        maxTotal: 0,
        grade: undefined,
      }
    })
  }, [courses, marks, portalData?.internalMarks, portalData?.attendance, portalData?.unifiedSubjects])

  const getPercentage = (total: number | null, max: number) => {
    if (total === null || max === 0) return 0
    return Math.round((total / max) * 100)
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80)
      return { bar: "#34d399", bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.25)" }
    if (percentage >= 60)
      return { bar: "#22d3ee", bg: "rgba(34,211,238,0.12)", border: "rgba(34,211,238,0.25)" }
    if (percentage >= 40)
      return { bar: "#fbbf24", bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.25)" }
    return { bar: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.25)" }
  }

  const totalMarks = mergedMarks.reduce((sum, m) => sum + (m.total || 0), 0)
  const maxMarks = mergedMarks.reduce((sum, m) => sum + (m.maxTotal || 0), 0)
  const overallPercentage = maxMarks > 0 ? Math.round((totalMarks / maxMarks) * 100) : 0

  const excellentCount = mergedMarks.filter(
    (m) => m.grade === "O" || m.grade === "A+" || m.grade === "A"
  ).length

  const marksWithData = mergedMarks.filter((m) => m.total !== null && m.maxTotal > 0)
  const averageScore =
    marksWithData.length > 0
      ? Math.round(
          marksWithData.reduce((sum, m) => sum + getPercentage(m.total, m.maxTotal), 0) /
            marksWithData.length
        )
      : 0

  const improvementSubjects = mergedMarks
    .map((mark) => ({
      ...mark,
      percentage: getPercentage(mark.total, mark.maxTotal),
    }))
    .filter((mark) => mark.maxTotal > 0 && mark.percentage < 60)
    .sort((a, b) => a.percentage - b.percentage)

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4">
        <div className="container mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center bg-teal-500/10 border border-teal-500/20">
              <Award className="w-7 h-7 text-teal-400" />
            </div>
            <h2 className="text-2xl font-black mb-4 text-zinc-100">Connect to View Marks</h2>
            <p className="text-sm mb-8 max-w-xs mx-auto px-4 text-zinc-600">
              Login with your SRM Academia credentials to view your test scores, assignments, and grades.
            </p>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setIsLoginOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-zinc-950"
              style={{ background: "linear-gradient(135deg,#2dd4bf,#22d3ee)" }}
            >
              <LogIn className="w-[18px] h-[18px]" /> Connect to SRM Academia
            </motion.button>
          </motion.div>
        </div>
        <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      </div>
    )
  }

  return (
    <div className="min-h-full pt-[3.75rem] pb-20 px-3 sm:px-4 lg:px-8 lg:pb-8 w-full">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-1">
            Performance Studio
          </h2>
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight font-display">
            Marks & Grades
          </h1>
          <p className="text-xs mt-1 text-zinc-600">
            {user?.specialization || user?.program} · Sem {user?.semester} · {mergedMarks.length} subjects
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AIPromoBadge page="marks" />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={openPortalLogin}
            disabled={isLoading || isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/25 transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Resync Portal</span>
            <span className="sm:hidden">Resync</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-zinc-500 bg-zinc-900/60 ring-1 ring-white/5 hover:text-zinc-300 transition-all disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </motion.button>
        </div>
      </motion.div>

      {/* ── Session Expired Warning Banner ── */}
      {isSessionExpired && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-center gap-2.5 text-amber-300 min-w-0">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <span className="truncate">Student Portal session expired — Relogin required to refresh semester grades</span>
          </div>
          <button
            onClick={openPortalLogin}
            className="px-3.5 py-1.5 rounded-xl font-bold bg-amber-400 hover:bg-amber-300 text-zinc-950 transition-all shrink-0 text-xs shadow-sm whitespace-nowrap"
          >
            Relogin Now
          </button>
        </motion.div>
      )}

      {/* ── Student Portal Grades & CGPA Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-4 sm:p-5 rounded-2xl bg-zinc-900/60 ring-1 ring-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 overflow-hidden"
      >
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/25 shrink-0">
            <GraduationCap className="w-5 h-5 shrink-0" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold font-display text-zinc-100 shrink-0">
                Semester-wise Grades & CGPA
              </h3>
              {portalData?.marks?.cgpa ? (
                <span className="shrink-0 whitespace-nowrap text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                  CGPA {portalData.marks.cgpa.toFixed(2)}
                </span>
              ) : null}
            </div>
            <p className="text-xs text-zinc-400 mt-1 line-clamp-2 break-words">
              {isPortalConnected
                ? `Tracked across ${portalData?.marks?.semesters?.length || 0} semesters with SGPA breakdown`
                : "Connect student portal scraper to view multi-semester SGPA & grades history"}
            </p>
          </div>
        </div>

        <button
          onClick={isPortalConnected ? openGradesModal : openPortalLogin}
          className="w-full sm:w-auto px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 text-zinc-950 bg-emerald-400 hover:bg-emerald-300 transition-all active:scale-[0.98] shrink-0 shadow-md shadow-emerald-500/10 whitespace-nowrap"
        >
          {isPortalConnected ? (
            <>
              View All Semesters & SGPA
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              Connect Student Portal
            </>
          )}
        </button>
      </motion.div>

      {/* Stats Grid: Overall Score */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 gap-3 sm:gap-4 mb-8"
      >
        <div className="bg-zinc-900/60 ring-1 ring-white/5 rounded-2xl sm:rounded-3xl p-5 sm:p-8 overflow-hidden relative col-span-2">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div>
              <h3 className="text-zinc-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1 sm:mb-2">
                Overall Internal Score
              </h3>
              <p className="text-zinc-400 text-xs sm:text-sm">
                {totalMarks.toFixed(1)} / {maxMarks}
              </p>
            </div>
            <span className="font-display font-bold text-2xl sm:text-4xl tracking-tighter text-zinc-100">
              {overallPercentage}%
            </span>
          </div>
          <div className="w-full h-1 sm:h-1.5 bg-zinc-950 rounded-full overflow-hidden shadow-inner ring-1 ring-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallPercentage}%` }}
              transition={{ duration: 1 }}
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
            />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900/60 ring-1 ring-white/5 rounded-2xl p-3 sm:p-6 text-center sm:text-left"
        >
          <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-4">
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center bg-emerald-500/15">
              <Trophy className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-zinc-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">
                Excellent
              </p>
              <p className="font-display font-bold text-xl sm:text-4xl tracking-tighter text-zinc-100">
                {excellentCount}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-zinc-900/60 ring-1 ring-white/5 rounded-2xl p-3 sm:p-6 text-center sm:text-left"
        >
          <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-4">
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center bg-cyan-500/15">
              <Target className="w-4 h-4 sm:w-6 sm:h-6 text-cyan-400" />
            </div>
            <div>
              <p className="text-zinc-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">
                Avg Score
              </p>
              <p className="font-display font-bold text-xl sm:text-4xl tracking-tighter text-zinc-100">
                {averageScore}%
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {improvementSubjects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-amber-500/10 ring-1 ring-amber-500/20 rounded-2xl p-4 mb-8"
        >
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              Need to improve
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {improvementSubjects.slice(0, 5).map((subject) => (
              <div
                key={subject.code}
                className="rounded-lg px-3 py-1.5 text-xs bg-white/5 ring-1 ring-amber-500/20"
              >
                <span className="font-mono text-amber-400">{subject.code}</span>
                <span className="ml-1.5 text-zinc-500">{subject.percentage}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Subject Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {mergedMarks.map((mark, index) => {
          const cardKey = `${mark.code}-${index}`
          const hasMarks = mark.maxTotal > 0
          const pct = hasMarks ? getPercentage(mark.total, mark.maxTotal) : 0
          const color = getProgressColor(pct)
          return (
            <motion.div
              key={cardKey}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group bg-zinc-900/40 ring-1 ring-white/5 rounded-2xl hover:ring-zinc-700 hover:bg-zinc-900/60 transition-all relative overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono font-bold text-zinc-500 block mb-0.5">
                      {mark.code}
                    </span>
                    <h4 className="text-sm font-bold text-zinc-100 truncate">{mark.name}</h4>
                  </div>
                  {mark.grade && (
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                      {mark.grade}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline justify-between mt-4 mb-2">
                  <span className="text-2xl font-bold font-display text-zinc-100">
                    {hasMarks ? `${pct}%` : "Pending"}
                  </span>
                  {hasMarks && (
                    <span className="text-xs font-mono text-zinc-400">
                      {mark.total} / {mark.maxTotal}
                    </span>
                  )}
                </div>

                {hasMarks && (
                  <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: color.bar }}
                    />
                  </div>
                )}

                <div className="text-[11px] text-zinc-500 flex items-center justify-between pt-2 border-t border-white/5">
                  <span>{mark.type || "Course"}</span>
                  {hasMarks && <span>{mark.tests.length} tests recorded</span>}
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
