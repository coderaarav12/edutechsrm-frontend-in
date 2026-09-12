"use client"

import { useState, useEffect, useCallback, useMemo, memo } from "react"
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"
import {
  TrendingUp, LogIn, RefreshCw, Sparkles, RotateCcw,
  BookOpen, Target, Zap, Award, Info, ChevronDown,
  Gauge, Bot,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useIsPosterTheme } from "@/lib/theme-context"
import { LoginModal } from "./login-modal"
import { AIPromoBadge } from "@/components/ai-promo-badge"

// ── Constants ──────────────────────────────────────────────────────────────────
const GRADE_POINTS: Record<string, number> = {
  O: 10, "A+": 9, A: 8, "B+": 7, B: 6, C: 5, F: 0,
}
const GRADE_OPTIONS = ["O", "A+", "A", "B+", "B", "C", "F"]
const GRADE_LABELS: Record<string, string> = {
  O: "Outstanding", "A+": "Excellent", A: "Very Good",
  "B+": "Good", B: "Above Avg", C: "Average", F: "Fail",
}
const GRADE_META: Record<string, { color: string; bg: string; border: string }> = {
  O:    { color: "#22d3ee", bg: "rgba(34,211,238,0.1)",  border: "rgba(34,211,238,0.25)"  },
  "A+": { color: "#34d399", bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.25)"  },
  A:    { color: "#4ade80", bg: "rgba(74,222,128,0.1)",  border: "rgba(74,222,128,0.25)"  },
  "B+": { color: "#a5b4fc", bg: "rgba(165,180,252,0.1)", border: "rgba(165,180,252,0.25)" },
  B:    { color: "#60a5fa", bg: "rgba(96,165,250,0.1)",  border: "rgba(96,165,250,0.25)"  },
  C:    { color: "#fcd34d", bg: "rgba(252,211,77,0.1)",  border: "rgba(252,211,77,0.25)"  },
  F:    { color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.25)" },
}
const ALL_GRADE_OPTIONS = ["—", ...GRADE_OPTIONS]

function cgpaGradient(v: number): string {
  if (v >= 9) return "linear-gradient(135deg, #22d3ee, #34d399)"
  if (v >= 8) return "linear-gradient(135deg, #34d399, #4ade80)"
  if (v >= 7) return "linear-gradient(135deg, #a5b4fc, #60a5fa)"
  if (v >= 6) return "linear-gradient(135deg, #fcd34d, #fbbf24)"
  if (v > 0)  return "linear-gradient(135deg, #f87171, #fb7185)"
  return "linear-gradient(135deg, #52525b, #71717a)"
}

function cgpaColor(v: number) {
  if (v >= 9) return "#22d3ee"
  if (v >= 8) return "#34d399"
  if (v >= 7) return "#a5b4fc"
  if (v >= 6) return "#fcd34d"
  if (v > 0)  return "#f87171"
  return "#71717a"
}

function cgpaLabel(v: number) {
  if (v >= 9)  return "Outstanding"
  if (v >= 8)  return "Excellent"
  if (v >= 7)  return "Very Good"
  if (v >= 6)  return "Good"
  if (v > 0)   return "Needs Work"
  return ""
}

function calcCGPA(subjects: { credits: number; grade: string }[]) {
  const valid = subjects.filter(s => s.grade && s.grade !== "—" && s.credits > 0)
  const tc = valid.reduce((a, x) => a + x.credits, 0)
  const tp = valid.reduce((a, x) => a + x.credits * (GRADE_POINTS[x.grade] ?? 0), 0)
  return tc > 0 ? tp / tc : 0
}

const spring = { type: "spring" as const, stiffness: 80, damping: 16, mass: 0.6 }
const fastSpring = { type: "spring" as const, stiffness: 200, damping: 20 }

// ── Arc dial ───────────────────────────────────────────────────────────────────
const CGPAArc = memo(function CGPAArc({ value, max = 10 }: { value: number; max?: number }) {
  const isPoster = useIsPosterTheme()
  const cx = 80, cy = 80, r = 62
  const startAngle = 200, sweepAngle = 320
  const pct = Math.min(value / max, 1)
  const toRad = (a: number) => (a * Math.PI) / 180
  const pt = (angle: number) => ({
    x: cx + r * Math.cos(toRad(angle - 90)),
    y: cy + r * Math.sin(toRad(angle - 90)),
  })
  const arcPath = (start: number, sweep: number) => {
    const s = pt(start), e = pt(start + sweep)
    const large = sweep > 180 ? 1 : 0
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`
  }
  const color = isPoster ? "#111111" : cgpaColor(value)
  const filledSweep = Math.max(pct * sweepAngle, 0.5)

  return (
    <div className="relative mx-auto h-[140px] w-[140px] sm:h-[180px] sm:w-[180px]">
      <svg viewBox="0 0 160 160" className="w-full h-full">
        <defs>
          <linearGradient id="cgpa-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={isPoster ? "#111111" : value >= 9 ? "#22d3ee" : value >= 7 ? "#34d399" : value >= 6 ? "#fcd34d" : "#f87171"} />
            <stop offset="100%" stopColor={isPoster ? "#333333" : value >= 9 ? "#34d399" : value >= 7 ? "#4ade80" : value >= 6 ? "#fbbf24" : "#fb7185"} />
          </linearGradient>
        </defs>
        <path
          d={arcPath(startAngle, sweepAngle)}
          fill="none" stroke={isPoster ? "rgba(17,17,17,0.12)" : "rgba(255,255,255,0.04)"} strokeWidth="8" strokeLinecap="round"
        />
        <motion.path
          d={arcPath(startAngle, filledSweep)}
          fill="none" stroke={isPoster ? "#111111" : "url(#cgpa-grad)"} strokeWidth="8" strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
        <motion.text
          x={cx} y={cy - 4} textAnchor="middle"
          fill={color} fontSize="34" fontWeight="900" fontFamily="JetBrains Mono, monospace"
          initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, ...fastSpring }}
        >
          {value > 0 ? value.toFixed(2) : "—"}
        </motion.text>
        <text x={cx} y={cy + 17} textAnchor="middle" fill={isPoster ? "#555555" : "#a1a1aa"} fontSize="8" fontWeight="800" letterSpacing="3">
          CGPA
        </text>
        <motion.text
          x={cx} y={cy + 31} textAnchor="middle"
          fill={color} fontSize="8" fontWeight="700" opacity={isPoster ? 0.9 : 0.7}
          initial={{ opacity: 0 }} animate={{ opacity: isPoster ? 0.9 : 0.7 }} transition={{ delay: 0.6 }}
        >
          {value > 0 ? cgpaLabel(value) : ""}
        </motion.text>
      </svg>
    </div>
  )
})

// ── Grade Slider ──────────────────────────────────────────────────────────────
const GradeSlider = memo(function GradeSlider({ value, onChange }: { value: string; onChange: (g: string) => void }) {
  const isPoster = useIsPosterTheme()
  const currentIdx = ALL_GRADE_OPTIONS.indexOf(value || "—")

  return (
    <div className="flex gap-1">
      {ALL_GRADE_OPTIONS.map((g, i) => {
        const m = g !== "—" ? GRADE_META[g] : null
        const sel = i === currentIdx
        return (
          <motion.button
            key={g}
            onClick={() => onChange(g)}
            whileTap={{ scale: 0.9 }}
            layout
            transition={fastSpring}
            className={`flex-1 min-w-[26px] py-[6px] rounded-lg text-[11px] font-black leading-none transition-all duration-150 ${
              isPoster
                ? sel
                  ? "bg-[#111111] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111]"
                  : "bg-[#f7f5f0] text-[#111111] border border-[#111111]/30 hover:border-[#111111] hover:bg-[#eae6dd]"
                : "transition-colors"
            }`}
            style={
              isPoster
                ? undefined
                : {
                    background: sel ? (m ? m.bg : "rgba(255,255,255,0.08)") : "rgba(255,255,255,0.02)",
                    color: sel ? (m ? m.color : "#a1a1aa") : `${m ? m.color : "rgba(255,255,255,0.15)"}`,
                    border: sel
                      ? `1.5px solid ${m ? m.border : "rgba(255,255,255,0.2)"}`
                      : "1.5px solid transparent",
                  }
            }
          >
            {g}
          </motion.button>
        )
      })}
    </div>
  )
})

// ── Stat Tile ──────────────────────────────────────────────────────────────────
function StatTile({ label, value, color }: { label: string; value: string | number; color: string }) {
  const isPoster = useIsPosterTheme()
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl py-3 text-center transition-all ${
        isPoster
          ? "bg-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111]"
          : "bg-zinc-900/50 ring-1 ring-white/[0.04]"
      }`}
    >
      <motion.p
        className="font-black text-lg sm:text-2xl tracking-tight tabular-nums"
        style={{ color: isPoster ? "#111111" : color }}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 150, damping: 12 }}
      >
        {value}
      </motion.p>
      <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${
        isPoster ? "text-[#555555]" : "text-zinc-600"
      }`}>
        {label}
      </p>
    </motion.div>
  )
}

// ── Subject Card ──────────────────────────────────────────────────────────────
function SubjectCard({
  code, name, credits, grade, pct,
  isOpen, onToggle, delay = 0,
}: {
  code: string; name: string; credits: number; grade: string; pct?: number;
  isOpen: boolean; onToggle: () => void; delay?: number;
}) {
  const isPoster = useIsPosterTheme()
  const meta = GRADE_META[grade] || { color: "#71717a", bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.06)" }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.04, ...spring }}
      className={`group rounded-xl overflow-hidden transition-all duration-300 ${
        isPoster
          ? "bg-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111] hover:translate-x-[1px] hover:translate-y-[1px]"
          : "bg-zinc-900/40 ring-1 ring-white/[0.04] hover:ring-white/[0.08]"
      }`}
    >
      <button onClick={onToggle} className="w-full p-3.5 sm:p-4 text-left flex items-center gap-3">
        <div
          className={`w-[4px] h-10 rounded-full shrink-0 transition-all duration-300 ${isPoster ? "border border-[#111111]" : ""}`}
          style={{ background: meta.color }}
        />
        <div className="flex-1 min-w-0">
          <span className={`text-[9px] uppercase font-black tracking-[0.12em] block mb-[2px] ${
            isPoster ? "text-[#555555]" : "text-zinc-600"
          }`}>
            {code}
          </span>
          <h4 className={`font-bold text-sm tracking-tight truncate leading-snug ${
            isPoster ? "text-[#111111]" : "text-zinc-200"
          }`}>
            {name}
          </h4>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <div className="text-right">
            <span
              className={`inline-block text-[11px] font-black px-2.5 py-[3px] rounded-md leading-none transition-all ${
                isPoster ? "bg-[#111111] text-white border border-[#111111] shadow-[1.5px_1.5px_0px_#111111]" : ""
              }`}
              style={
                isPoster
                  ? undefined
                  : {
                      color: meta.color,
                      background: meta.bg,
                      border: `1px solid ${meta.border}`,
                    }
              }
            >
              {grade}
            </span>
            <p className={`text-[8px] font-bold mt-1.5 tracking-wide ${
              isPoster ? "text-[#555555]" : "text-zinc-600"
            }`}>
              {credits}cr · {GRADE_POINTS[grade] ?? 0}pt
            </p>
          </div>
          <ChevronDown
            size={13}
            className={`shrink-0 transition-all duration-300 ${
              isPoster ? "text-[#111111]" : "text-zinc-700"
            } ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && pct !== undefined && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <div className={`border-t mx-3.5 sm:mx-4 ${isPoster ? "border-[#111111]/15" : "border-white/[0.04]"}`} />
            <div className="px-3.5 sm:px-4 pb-3.5 sm:pb-4 pt-2.5">
              <div className="flex items-center gap-3">
                <div className={`flex-1 h-2 rounded-full overflow-hidden ${
                  isPoster ? "bg-[#e8e5dc] border border-[#111111]/30" : "bg-zinc-950 ring-1 ring-white/[0.03]"
                }`}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: isPoster ? "#111111" : `linear-gradient(90deg, ${meta.color}88, ${meta.color})`,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                  />
                </div>
                <span className={`text-[10px] font-bold tabular-nums ${
                  isPoster ? "text-[#111111]" : "text-zinc-500"
                }`}>{pct}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Internal CGPA Tab ──────────────────────────────────────────────────────────
function InternalCGPA({ marks, courses }: { marks: any[]; courses: any[] }) {
  const isPoster = useIsPosterTheme()
  const [expandedCode, setExpandedCode] = useState<string | null>(null)

  const creditMap = useMemo(() => {
    const map: Record<string, number> = {}
    const byCode = new Map<string, any[]>()
    ;(courses as any[]).forEach((c: any) => {
      const list = byCode.get(c.code) || []
      list.push(c)
      byCode.set(c.code, list)
    })
    byCode.forEach((entries, code) => {
      const withCredits = entries.filter((e: any) => (e.credits || 0) > 0)
      if (withCredits.length === 0) return
      map[code] = Math.max(...withCredits.map((e: any) => e.credits))
    })
    return map
  }, [courses])

  const pctToGrade = useCallback((pct: number): string => {
    if (pct >= 90) return "O"
    if (pct >= 80) return "A+"
    if (pct >= 70) return "A"
    if (pct >= 60) return "B+"
    if (pct >= 50) return "B"
    if (pct >= 40) return "C"
    if (pct > 0)   return "F"
    return "—"
  }, [])

  const subjects = useMemo(() => {
    const filtered = marks.filter(m => m.maxTotal > 0 && m.total !== null && (creditMap[m.code] ?? 0) > 0)
    const byCode = new Map<string, any[]>()
    filtered.forEach(m => {
      const list = byCode.get(m.code) || []
      list.push(m)
      byCode.set(m.code, list)
    })
    const result: { code: string; name: string; credits: number; grade: string; pct: number }[] = []
    byCode.forEach((entries, code) => {
      const credits = creditMap[code]
      const firstName = entries[0].name?.trim().toLowerCase()
      const allSameName = entries.every((e: any) => e.name?.trim().toLowerCase() === firstName)
      if (allSameName) {
        const totalPct = entries.reduce((s: number, e: any) => s + Math.round((e.total / e.maxTotal) * 100), 0)
        const pct = Math.round(totalPct / entries.length)
        result.push({ code, name: entries[0].name, credits, grade: pctToGrade(pct), pct })
      } else {
        entries.forEach((e: any) => {
          const pct = Math.round((e.total / e.maxTotal) * 100)
          result.push({ code: e.code, name: e.name, credits, grade: pctToGrade(pct), pct })
        })
      }
    })
    return result
  }, [marks, creditMap, pctToGrade])

  const cgpa   = useMemo(() => calcCGPA(subjects), [subjects])
  const color  = cgpaColor(cgpa)
  const filled = subjects.filter(s => s.grade !== "—").length
  const avgPct = subjects.length > 0 ? Math.round(subjects.reduce((s, x) => s + x.pct, 0) / subjects.length) : 0

  return (
    <LayoutGroup>
      <div className="space-y-4 sm:space-y-5">

        {/* CGPA Hero */}
        <motion.div layout="position" className={`rounded-2xl p-5 sm:p-7 relative overflow-hidden transition-all ${
          isPoster
            ? "bg-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111]"
            : "bg-zinc-900/60 ring-1 ring-white/[0.04]"
        }`}>
          {!isPoster && <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />}
          <div className="relative z-10">
            <p className={`text-[10px] font-black uppercase tracking-[0.15em] mb-5 ${
              isPoster ? "text-[#555555]" : "text-zinc-600"
            }`}>
              Internal Marks CGPA
            </p>

            <CGPAArc value={cgpa} />

            <div className="mt-5 sm:mt-6 grid grid-cols-3 gap-2 sm:gap-3">
              <StatTile label="Subjects" value={subjects.length} color="#60a5fa" />
              <StatTile label="Graded" value={`${filled}/${subjects.length}`} color="#22d3ee" />
              <StatTile label="Avg %" value={subjects.length > 0 ? `${avgPct}%` : "—"} color="#34d399" />
            </div>

            <div className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2.5 transition-all ${
              isPoster
                ? "bg-[#f7f5f0] border border-[#111111]/30"
                : "bg-zinc-900/50 ring-1 ring-white/[0.03]"
            }`}>
              <Info size={11} className={`shrink-0 ${isPoster ? "text-[#111111]" : "text-zinc-600"}`} />
              <p className={`text-[9px] font-bold leading-relaxed ${
                isPoster ? "text-[#555555]" : "text-zinc-600"
              }`}>
                Estimated from internal marks · Credits synced from courses
              </p>
            </div>
          </div>
        </motion.div>

        {/* Subject breakdown */}
        <div className="space-y-1.5">
          {subjects.map((s, i) => (
            <SubjectCard
              key={s.code}
              {...s}
              isOpen={expandedCode === s.code}
              onToggle={() => setExpandedCode(expandedCode === s.code ? null : s.code)}
              delay={i}
            />
          ))}
          {subjects.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <div className={`w-12 h-12 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all ${
                isPoster
                  ? "bg-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111] text-[#111111]"
                  : "bg-zinc-900/60 ring-1 ring-white/[0.04] text-zinc-600"
              }`}>
                <BookOpen size={22} className={isPoster ? "text-[#111111]" : "text-zinc-600"} />
              </div>
              <p className={`text-sm font-bold ${isPoster ? "text-[#111111]" : "text-zinc-400"}`}>No marks data yet</p>
              <p className={`text-xs mt-1 font-medium ${isPoster ? "text-[#555555]" : "text-zinc-600"}`}>Sync from SRM to see your grades</p>
            </motion.div>
          )}
        </div>
      </div>
    </LayoutGroup>
  )
}

// ── Final Exam Predictor Tab ──────────────────────────────────────────────────
function FinalPredictor({ courses }: { courses: any[] }) {
  const isPoster = useIsPosterTheme()
  const [subjects, setSubjects] = useState<PredSubject[]>([])
  const [synced, setSynced] = useState(false)

  const syncFromCourses = useCallback(() => {
    if (!courses.length) return
    const byCode = new Map<string, any[]>()
    ;(courses as any[]).forEach((c: any) => {
      const list = byCode.get(c.code) || []
      list.push(c)
      byCode.set(c.code, list)
    })
    const fresh: PredSubject[] = []
    byCode.forEach((entries, code) => {
      const withCredits = entries.filter((e: any) => (e.credits || 0) > 0)
      if (withCredits.length === 0) return
      const firstName = withCredits[0].name?.trim().toLowerCase()
      const allSameName = withCredits.every((e: any) => e.name?.trim().toLowerCase() === firstName)
      if (allSameName) {
        const maxCredits = Math.max(...withCredits.map((e: any) => e.credits))
        fresh.push({ id: code, name: withCredits[0].name, code, credits: maxCredits, grade: "—" })
      } else {
        withCredits.forEach((e: any, i: number) => {
          fresh.push({ id: `${e.code}-${i}`, name: e.name, code: e.code, credits: e.credits, grade: "—" })
        })
      }
    })
    setSubjects(prev => fresh.map(s => {
      const ex = prev.find(p => p.id === s.id)
      return ex ? { ...s, grade: ex.grade } : s
    }))
    setSynced(true)
  }, [courses])

  useEffect(() => {
    if (courses.length && !synced) syncFromCourses()
  }, [courses, synced, syncFromCourses])

  const updateGrade = useCallback((id: string, grade: string) =>
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, grade } : s)), [])

  const resetGrades = useCallback(() =>
    setSubjects(prev => prev.map(s => ({ ...s, grade: "—" }))), [])

  const cgpa   = useMemo(() => calcCGPA(subjects), [subjects])
  const color  = cgpaColor(cgpa)
  const filled = subjects.filter(s => s.grade !== "—").length
  const total  = subjects.reduce((s, x) => s + x.credits, 0)

  const whatIf = useMemo(() =>
    GRADE_OPTIONS.map(g => ({
      grade: g,
      cgpa: calcCGPA(subjects.map(s => ({ ...s, grade: s.grade === "—" ? g : s.grade }))),
    })),
  [subjects])

  return (
    <LayoutGroup>
      <div className="space-y-4 sm:space-y-5">

        {/* CGPA Hero */}
        <motion.div layout="position" className={`rounded-2xl p-5 sm:p-7 relative overflow-hidden transition-all ${
          isPoster
            ? "bg-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111]"
            : "bg-zinc-900/60 ring-1 ring-white/[0.04]"
        }`}>
          {!isPoster && <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />}
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <p className={`text-[10px] font-black uppercase tracking-[0.15em] ${
                isPoster ? "text-[#555555]" : "text-zinc-600"
              }`}>
                Final Exam Predictor
              </p>
              <div className="flex gap-2">
                <motion.button whileTap={{ scale: 0.88 }} onClick={resetGrades}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                    isPoster
                      ? "bg-[#f7f5f0] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] text-[#111111] hover:bg-[#e8e5dc]"
                      : "bg-zinc-900/50 ring-1 ring-white/[0.06] text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800"
                  }`}
                  title="Reset grades"
                >
                  <RotateCcw size={11} />
                </motion.button>
                <motion.button whileTap={{ scale: 0.88 }} onClick={syncFromCourses}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                    isPoster
                      ? "bg-[#111111] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-[#2c2c2c]"
                      : "bg-emerald-500/10 ring-1 ring-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300"
                  }`}
                  title="Sync courses"
                >
                  <RefreshCw size={11} />
                </motion.button>
              </div>
            </div>

            <CGPAArc value={cgpa} />

            <div className="mt-5 sm:mt-6 grid grid-cols-3 gap-2 sm:gap-3">
              <StatTile label="Subjects" value={subjects.length} color="#60a5fa" />
              <StatTile label="Graded" value={`${filled}/${subjects.length}`} color="#22d3ee" />
              <StatTile label="Credits" value={total} color="#34d399" />
            </div>
          </div>
        </motion.div>

        {/* What-if Matrix */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, ...spring }}
          className={`rounded-xl p-4 sm:p-5 transition-all ${
            isPoster
              ? "bg-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111]"
              : "bg-zinc-900/40 ring-1 ring-white/[0.04]"
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <Target size={13} className={isPoster ? "text-[#111111]" : "text-zinc-500"} />
            <p className={`text-[11px] font-black tracking-tight ${
              isPoster ? "text-[#111111]" : "text-zinc-200"
            }`}>
              What‑if all ungraded get…
            </p>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {whatIf.map(({ grade, cgpa: c }, i) => {
              const m = GRADE_META[grade]
              return (
                <motion.div
                  key={grade}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.02 * i, ...fastSpring }}
                  className={`text-[9px] font-bold uppercase tracking-wider py-2 rounded-lg text-center leading-tight transition-all ${
                    isPoster
                      ? "bg-[#f7f5f0] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] text-[#111111]"
                      : ""
                  }`}
                  style={isPoster ? undefined : { background: m.bg, color: m.color, border: `1px solid ${m.border}` }}
                >
                  <p className={isPoster ? "font-black text-[#111111]" : ""}>{grade}</p>
                  <p className={`font-black mt-1 text-[11px] tracking-tight ${
                    isPoster ? "text-[#111111]" : "text-zinc-500"
                  }`}>
                    {c.toFixed(2)}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Predictor Subject Cards */}
        <div className="space-y-1.5">
          {subjects.map((s, i) => {
            const meta = s.grade !== "—" ? GRADE_META[s.grade] : null
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * i + 0.12, ...spring }}
                className={`rounded-xl p-3.5 sm:p-4 transition-all duration-300 ${
                  isPoster
                    ? "bg-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111]"
                    : "bg-zinc-900/40 ring-1 ring-white/[0.04] hover:ring-white/[0.08]"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-[4px] h-10 rounded-full shrink-0 ${isPoster ? "border border-[#111111]" : ""}`}
                    style={{
                      background: meta
                        ? meta.color
                        : isPoster
                        ? "#cfcac2"
                        : "rgba(255,255,255,0.08)",
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <span className={`text-[9px] uppercase font-black tracking-[0.12em] block mb-[2px] ${
                      isPoster ? "text-[#555555]" : "text-zinc-600"
                    }`}>
                      {s.code}
                    </span>
                    <h4 className={`font-bold text-sm tracking-tight truncate leading-snug ${
                      isPoster ? "text-[#111111]" : "text-zinc-200"
                    }`}>
                      {s.name}
                    </h4>
                    <p className={`text-[9px] font-bold mt-1 tracking-wide ${
                      isPoster ? "text-[#555555]" : "text-zinc-600"
                    }`}>
                      {s.credits} credits{meta && (
                        <span style={{ color: isPoster ? "#111111" : meta.color }}> · {GRADE_POINTS[s.grade]} pts</span>
                      )}
                    </p>
                  </div>
                  <div className="shrink-0 text-center">
                    <span
                      className={`inline-block text-[11px] font-black px-2.5 py-[3px] rounded-md leading-none transition-all ${
                        isPoster
                          ? s.grade !== "—"
                            ? "bg-[#111111] text-white border border-[#111111] shadow-[1.5px_1.5px_0px_#111111]"
                            : "bg-[#f7f5f0] text-[#111111] border border-[#111111]/30 font-bold"
                          : ""
                      }`}
                      style={
                        isPoster
                          ? undefined
                          : (meta
                            ? { color: meta.color, background: meta.bg, border: `1px solid ${meta.border}` }
                            : { color: "#27272a", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" })
                      }
                    >
                      {s.grade}
                    </span>
                  </div>
                </div>
                <GradeSlider value={s.grade} onChange={(g) => updateGrade(s.id, g)} />
              </motion.div>
            )
          })}

          {subjects.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <div className={`w-12 h-12 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all ${
                isPoster
                  ? "bg-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111] text-[#111111]"
                  : "bg-zinc-900/60 ring-1 ring-white/[0.04] text-zinc-600"
              }`}>
                <Zap size={22} className={isPoster ? "text-[#111111]" : "text-zinc-600"} />
              </div>
              <p className={`text-sm font-bold ${isPoster ? "text-[#111111]" : "text-zinc-400"}`}>No courses synced</p>
              <p className={`text-xs mt-1 font-medium ${isPoster ? "text-[#555555]" : "text-zinc-600"}`}>Sync from SRM to start predicting</p>
            </motion.div>
          )}
        </div>
      </div>
    </LayoutGroup>
  )
}

interface PredSubject { id: string; name: string; code: string; credits: number; grade: string }

// ── Main GradeX Page ──────────────────────────────────────────────────────────
export function GradeXSection() {
  const isPoster = useIsPosterTheme()
  const { isAuthenticated, courses, marks, isLoading, refreshData } = useAuth() as any
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"internal" | "predictor">("internal")

  if (!isAuthenticated) {
    return (
      <div className="min-h-full pt-[3.75rem] pb-20 px-3 sm:px-4 lg:px-8 lg:pb-8 w-full flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all ${
            isPoster
              ? "bg-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111]"
              : "bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 ring-1 ring-emerald-500/15"
          }`}>
            <Gauge size={34} className={isPoster ? "text-[#111111]" : "text-emerald-400"} />
          </div>
          <h2 className={`text-3xl font-black tracking-tight ${
            isPoster ? "text-[#111111]" : "text-zinc-100"
          }`}>GradeX</h2>
          <p className={`text-sm mt-2 mb-8 max-w-xs mx-auto leading-relaxed font-medium ${
            isPoster ? "text-[#555555]" : "text-zinc-500"
          }`}>
            Predict your final CGPA before results drop.
          </p>
          <motion.button whileTap={{ scale: 0.96 }} onClick={() => setIsLoginOpen(true)}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all ${
              isPoster
                ? "bg-[#111111] text-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111] hover:bg-[#222222]"
                : "bg-gradient-to-r from-emerald-500 to-emerald-400 text-zinc-950"
            }`}
          >
            <LogIn size={16} />
            Connect to SRM Academia
          </motion.button>
        </motion.div>
        <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      </div>
    )
  }

  return (
    <div className="min-h-full pt-[3.75rem] pb-20 px-3 sm:px-4 lg:px-8 lg:pb-8 w-full">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-start mb-6 sm:mb-7"
      >
        <div>
          <p className={`font-black text-[9px] uppercase tracking-[0.15em] mb-1 ${
            isPoster ? "text-[#555555]" : "text-zinc-600"
          }`}>Prediction Lab</p>
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2 ${
            isPoster ? "text-[#111111]" : "text-zinc-100"
          }`}>
            <Sparkles size={16} className={isPoster ? "text-[#111111]" : "text-emerald-400"} />
            GradeX
          </h1>
          <p className={`text-[10px] mt-0.5 tracking-wide font-medium ${
            isPoster ? "text-[#555555]" : "text-zinc-600"
          }`}>CGPA Calculator &amp; Predictor</p>
        </div>
        <div className="flex items-center gap-2">
          <AIPromoBadge page="gradex" />
          <motion.button whileTap={{ scale: 0.9 }} onClick={refreshData} disabled={isLoading}
            className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all disabled:opacity-30 ${
              isPoster
                ? "bg-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] text-[#111111] hover:bg-[#f7f5f0]"
                : "text-zinc-600 bg-zinc-900/60 ring-1 ring-white/[0.04] hover:text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </motion.button>
        </div>
      </motion.div>

      {/* Tab Switcher */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.03 }}
        className={`flex rounded-xl p-[4px] mb-6 transition-all ${
          isPoster
            ? "bg-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111]"
            : "bg-zinc-900/80 rounded-xl p-[3px] ring-1 ring-white/[0.04]"
        }`}
      >
        {[
          { id: "internal" as const, label: "Internal CGPA", icon: Award },
          { id: "predictor" as const, label: "Final Predictor", icon: Target },
        ].map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black transition-all relative"
            >
              {isActive && (
                <motion.div
                  layoutId="gradex-tab-bg"
                  className={`absolute inset-0 rounded-lg ${isPoster ? "bg-[#111111]" : ""}`}
                  style={isPoster ? undefined : { background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.2)" }}
                  transition={spring}
                />
              )}
              <Icon size={13} className={`relative z-10 transition-colors ${
                isPoster
                  ? isActive ? "text-white" : "text-[#555555]"
                  : isActive ? "text-emerald-400" : "text-zinc-600"
              }`} />
              <span className={`relative z-10 transition-colors ${
                isPoster
                  ? isActive ? "text-white" : "text-[#555555]"
                  : isActive ? "text-emerald-300" : "text-zinc-500"
              }`}>
                {tab.label}
              </span>
            </motion.button>
          )
        })}
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {activeTab === "internal"
            ? <InternalCGPA marks={marks || []} courses={courses || []} />
            : <FinalPredictor courses={courses || []} />
          }
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
