"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { RefreshCw, LogIn, Award, BookOpen, Trophy, Target, ChevronDown } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { LoginModal } from "./login-modal"
import { AIPromoBadge } from "@/components/ai-promo-badge"
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, CartesianGrid } from "recharts"

export function MarksSection() {
  const { isAuthenticated, marks, courses, isLoading, refreshData, user } = useAuth()
  const [isLoginOpen,   setIsLoginOpen]   = useState(false)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  const mergedMarks = useMemo(() => {
    const marksByCode = new Map<string, any[]>()
    ;(marks as any[]).forEach((m: any) => {
      const list = marksByCode.get(m.code) || []
      list.push(m)
      marksByCode.set(m.code, list)
    })
    const courseByCode = new Map<string, any[]>()
    ;(courses as any[]).forEach((c: any) => {
      const list = courseByCode.get(c.code) || []
      list.push(c)
      courseByCode.set(c.code, list)
    })
    const codes = [...new Set((courses as any[]).map((c: any) => c.code))]
    return codes.map(code => {
      const courseEntries = courseByCode.get(code) || []
      const names = [...new Set(courseEntries.map((c: any) => c.name?.trim()).filter(Boolean))]
      const name = names[0] || code
      const marksEntries = marksByCode.get(code)
      if (marksEntries && marksEntries.length > 0) {
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
        const grade = pct >= 90 ? "O" : pct >= 80 ? "A+" : pct >= 70 ? "A" : pct >= 60 ? "B+" : pct >= 50 ? "B" : pct >= 40 ? "C" : pct > 0 ? "F" : undefined
        return { code, name, tests, test1, test1_max, test2, test2_max, test3, test3_max, total, maxTotal, grade }
      }
      return { code, name, tests: [], test1: null, test1_max: 0, test2: null, test2_max: 0, test3: null, test3_max: 0, total: 0, maxTotal: 0, grade: undefined }
    })
  }, [courses, marks])

  const getPercentage = (total: number | null, max: number) => {
    if (total === null || max === 0) return 0
    return Math.round((total / max) * 100)
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return { bar: "#34d399", bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.25)" }
    if (percentage >= 60) return { bar: "#22d3ee", bg: "rgba(34,211,238,0.12)", border: "rgba(34,211,238,0.25)" }
    if (percentage >= 40) return { bar: "#fbbf24", bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.25)" }
    return { bar: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.25)" }
  }

  const totalMarks = mergedMarks.reduce((sum, m) => sum + (m.total || 0), 0)
  const maxMarks = mergedMarks.reduce((sum, m) => sum + (m.maxTotal || 0), 0)
  const overallPercentage = maxMarks > 0 ? Math.round((totalMarks / maxMarks) * 100) : 0

  const excellentCount = mergedMarks.filter((m) => m.grade === "O" || m.grade === "A+" || m.grade === "A").length

  const marksWithData = mergedMarks.filter((m) => m.total !== null && m.maxTotal > 0)
  const averageScore =
    marksWithData.length > 0
      ? Math.round(
          marksWithData.reduce((sum, m) => sum + getPercentage(m.total, m.maxTotal), 0) / marksWithData.length
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
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => setIsLoginOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-zinc-950"
              style={{ background: "linear-gradient(135deg,#2dd4bf,#22d3ee)" }}>
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
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-1">Performance Studio</h2>
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight font-display">Marks & Grades</h1>
          <p className="text-xs mt-1 text-zinc-600">
            {user?.specialization || user?.program} · Sem {user?.semester} · {mergedMarks.length} subjects
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AIPromoBadge page="marks" />
          <motion.button whileTap={{ scale: 0.9 }} onClick={refreshData} disabled={isLoading}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-zinc-500 bg-zinc-900/60 ring-1 ring-white/5 hover:text-zinc-300 transition-all disabled:opacity-40">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 gap-3 sm:gap-4 mb-8"
      >
        <div className="bg-zinc-900/60 ring-1 ring-white/5 rounded-2xl sm:rounded-3xl p-5 sm:p-8 overflow-hidden relative col-span-2">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div>
              <h3 className="text-zinc-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1 sm:mb-2">Overall Score</h3>
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
              <p className="text-zinc-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">Excellent</p>
              <p className="font-display font-bold text-xl sm:text-4xl tracking-tighter text-zinc-100">{excellentCount}</p>
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
              <p className="text-zinc-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">Avg Score</p>
              <p className="font-display font-bold text-xl sm:text-4xl tracking-tighter text-zinc-100">{averageScore}%</p>
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
            <h2 className="text-xs font-bold text-amber-400 uppercase tracking-widest">Need to improve</h2>
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
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mergedMarks.map((mark, index) => {
            const cardKey   = `${mark.code}-${index}`
            const isOpen    = expandedCard === cardKey
            const pct       = getPercentage(mark.total, mark.maxTotal)
            const color     = getProgressColor(pct)
            const chartData = mark.tests.map((t) => ({
              name:   t.test,
              scored: t.scored ?? 0,
              max:    t.max,
              pct:    t.max > 0 ? Math.round(((t.scored ?? 0) / t.max) * 100) : 0,
            }))
            return (
              <motion.div
                key={cardKey}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-zinc-900/40 ring-1 ring-white/5 rounded-2xl hover:ring-zinc-700 hover:bg-zinc-900/60 transition-all relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* === MOBILE (collapsible) === */}
                <div className="md:hidden">
                  <button
                    className="w-full p-6 text-left relative z-10"
                    onClick={() => setExpandedCard(isOpen ? null : cardKey)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0 pr-2">
                        <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-[0.1em] mb-1 block">{mark.code}</span>
                        <h4 className={`font-semibold text-zinc-200 text-lg tracking-tight ${!isOpen ? "truncate" : ""}`}>{mark.name}</h4>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <svg width="40" height="40" viewBox="0 0 36 36" className="shrink-0">
                          <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2.5" />
                          <motion.circle
                            cx="18" cy="18" r="15.5" fill="none"
                            stroke={color.bar} strokeWidth="2.5" strokeLinecap="round"
                            strokeDasharray="97.389"
                            transform="rotate(-90 18 18)"
                            initial={{ strokeDashoffset: 97.389 }}
                            animate={{ strokeDashoffset: 97.389 - (97.389 * pct) / 100 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                          <text x="18" y="19" textAnchor="middle" fontSize="7" fontWeight="800" fill={color.bar}>{pct}%</text>
                        </svg>
                        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronDown className="w-4 h-4 text-zinc-500" />
                        </motion.div>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden shadow-inner ring-1 ring-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8 }}
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg,${color.bar},#22d3ee)` }}
                      />
                    </div>
                    <p className="text-[10px] text-zinc-600 mt-1.5">{mark.total ?? "—"} / {mark.maxTotal || "—"} total</p>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden border-t border-white/5"
                      >
                        <div className="px-6 pb-6 pt-4 space-y-4 relative z-10">
                          {mark.tests.length === 0 ? (
                            <p className="text-xs text-center py-2 text-zinc-500">No test data yet</p>
                          ) : (
                            <>
                              <div className="h-36">
<ResponsiveContainer width="100%" height={144}>
                  <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                                    <defs>
                                      <linearGradient id={`grad-m-${mark.code}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor={color.bar} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={color.bar} stopOpacity={0}   />
                                      </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#475569" }} axisLine={false} tickLine={false} />
                                    <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "#475569" }} axisLine={false} tickLine={false} />
                                    <Tooltip content={({ active, payload }) => {
                                      if (!active || !payload?.length) return null
                                      const d = payload[0].payload
                                      return (
                                        <div className="rounded-lg px-2.5 py-1.5 text-xs border bg-zinc-950/95 border-white/10">
                                          <p className="font-semibold text-zinc-100">{d.name}</p>
                                          <p style={{ color: color.bar }}>{d.scored} / {d.max}</p>
                                          <p className="text-zinc-500">{d.pct}%</p>
                                        </div>
                                      )
                                    }} />
                                    <Area type="monotone" dataKey="pct" stroke={color.bar} strokeWidth={2} fill={`url(#grad-m-${mark.code})`}
                                      dot={(props: any) => {
                                        const { cx, cy, payload } = props
                                        const dotColor = payload.pct >= 80 ? "#34d399" : payload.pct >= 60 ? "#22d3ee" : payload.pct >= 40 ? "#fbbf24" : "#f87171"
                                        return <circle key={cx} cx={cx} cy={cy} r={4} fill={dotColor} stroke="#18181b" strokeWidth={2} />
                                      }}
                                      activeDot={{ r: 6, stroke: color.bar, strokeWidth: 2, fill: "#18181b" }} />
                                  </AreaChart>
                                </ResponsiveContainer>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {mark.tests.map((test) => (
                                  <div key={test.test} className="rounded-xl px-3 py-2.5 text-center bg-white/5 ring-1 ring-white/10">
                                    <p className="text-zinc-500 text-[10px] mb-1">{test.test}</p>
                                    <p className="text-sm font-bold text-zinc-100">
                                      {test.scored !== null && test.scored !== undefined ? test.scored : "—"}
                                      <span className="text-xs font-normal text-zinc-500">/{test.max}</span>
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                          {pct < 60 && pct > 0 && (
                            <div className="rounded-xl ring-1 ring-amber-500/20 px-3 py-2 text-xs flex items-center gap-2 bg-amber-500/10">
                              <Target className="w-3 h-3 text-amber-400" />
                              <span className="text-amber-400">Need to improve in this subject</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* === DESKTOP (always-expanded dashboard card) === */}
                <div className="hidden md:block p-6 relative z-10">
                  {/* Top row: code + donut */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="min-w-0 flex-1">
                      <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-[0.1em] mb-1 block">{mark.code}</span>
                      <h4 className="font-semibold text-zinc-200 text-lg tracking-tight leading-tight">{mark.name}</h4>
                    </div>
                    <div className="shrink-0 ml-4 flex items-center gap-3">
                      <svg width="52" height="52" viewBox="0 0 36 36" className="shrink-0">
                        <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2.5" />
                        <motion.circle
                          cx="18" cy="18" r="15.5" fill="none"
                          stroke={color.bar} strokeWidth="2.5" strokeLinecap="round"
                          strokeDasharray="97.389"
                          transform="rotate(-90 18 18)"
                          initial={{ strokeDashoffset: 97.389 }}
                          animate={{ strokeDashoffset: 97.389 - (97.389 * pct) / 100 }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                        <text x="18" y="19" textAnchor="middle" fontSize="7" fontWeight="800" fill={color.bar}>{pct}%</text>
                      </svg>
                      <div className="text-right">
                        <p className="text-[10px] text-zinc-500">
                          <span className="font-mono text-zinc-400">{mark.total ?? "—"}</span>
                          <span className="text-zinc-600"> / {mark.maxTotal || "—"}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Chart + tests side by side */}
                  <div className="flex gap-5">
                    {/* Area chart */}
                    <div className="flex-1 min-w-0">
                      {mark.tests.length > 0 ? (
                        <div className="h-28">
                          <ResponsiveContainer width="100%" height={112}>
                            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id={`grad-d-${mark.code}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%"  stopColor={color.bar} stopOpacity={0.25} />
                                  <stop offset="95%" stopColor={color.bar} stopOpacity={0}   />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#52525b" }} axisLine={false} tickLine={false} />
                              <YAxis domain={[0, 100]} tick={{ fontSize: 8, fill: "#52525b" }} axisLine={false} tickLine={false} />
                              <Area type="monotone" dataKey="pct" stroke={color.bar} strokeWidth={1.5} fill={`url(#grad-d-${mark.code})`}
                                dot={(props: any) => {
                                  const { cx, cy, payload } = props
                                  const dotColor = payload.pct >= 80 ? "#34d399" : payload.pct >= 60 ? "#22d3ee" : payload.pct >= 40 ? "#fbbf24" : "#f87171"
                                  return <circle key={cx} cx={cx} cy={cy} r={3} fill={dotColor} stroke="#18181b" strokeWidth={1.5} />
                                }} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-600 py-6 text-center">No test data</p>
                      )}
                    </div>

                    {/* Test pills */}
                    <div className="shrink-0 flex flex-col gap-1.5 min-w-[100px]">
                      {mark.tests.length > 0 ? mark.tests.map((test) => {
                        const tp = test.max > 0 ? Math.round(((test.scored ?? 0) / test.max) * 100) : 0
                        const tc = tp >= 80 ? "#34d399" : tp >= 60 ? "#22d3ee" : tp >= 40 ? "#fbbf24" : "#f87171"
                        return (
                          <div key={test.test} className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/[0.03] ring-1 ring-white/[0.06]">
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: tc }} />
                            <span className="text-[10px] text-zinc-400 min-w-[36px]">{test.test}</span>
                            <div className="flex-1" />
                            <span className="text-[10px] font-semibold tabular-nums w-9 text-right" style={{ color: tc }}>{tp}%</span>
                            <span className="text-[10px] text-zinc-500 font-mono tabular-nums w-14 text-right">{test.scored ?? "—"}/{test.max}</span>
                          </div>
                        )
                      }) : null}
                    </div>
                  </div>

                  {/* Bottom: progress bar + need to improve */}
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1 h-1 bg-zinc-950 rounded-full overflow-hidden shadow-inner ring-1 ring-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8 }}
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg,${color.bar},#22d3ee)` }}
                      />
                    </div>
                    {pct < 60 && pct > 0 && (
                      <span className="text-[9px] font-bold uppercase tracking-widest text-amber-400 shrink-0">Needs work</span>
                    )}
                    {pct >= 80 && (
                      <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 shrink-0">Excellent</span>
                    )}
                  </div>
                </div>

              </motion.div>
            )
          })}
      </motion.div>
    </div>
  )
}
