"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Trophy,
  RefreshCw,
  GraduationCap,
  Sparkles,
  ChevronRight,
} from "lucide-react"
import { useStudentPortal } from "@/lib/student-portal-context"

const GRADE_COLOR_MAP: Record<string, { bg: string; text: string; ring: string }> = {
  O: { bg: "bg-emerald-500/10", text: "text-emerald-400", ring: "ring-emerald-500/20" },
  "A+": { bg: "bg-cyan-500/10", text: "text-cyan-400", ring: "ring-cyan-500/20" },
  A: { bg: "bg-sky-500/10", text: "text-sky-400", ring: "ring-sky-500/20" },
  "B+": { bg: "bg-purple-500/10", text: "text-purple-400", ring: "ring-purple-500/20" },
  B: { bg: "bg-amber-500/10", text: "text-amber-400", ring: "ring-amber-500/20" },
  C: { bg: "bg-orange-500/10", text: "text-orange-400", ring: "ring-orange-500/20" },
  F: { bg: "bg-rose-500/10", text: "text-rose-400", ring: "ring-rose-500/20" },
  W: { bg: "bg-rose-500/10", text: "text-rose-400", ring: "ring-rose-500/20" },
}

export function SemesterGradesModal() {
  const {
    isGradesModalOpen,
    closeGradesModal,
    portalData,
    openPortalLogin,
    syncPortalData,
    isSyncing,
    isSessionExpired,
  } = useStudentPortal()

  const [selectedSemTab, setSelectedSemTab] = useState<number | "all">("all")

  if (!isGradesModalOpen) return null

  const marks = portalData?.marks
  const semesters = marks?.semesters || []

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[125] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
        {/* Mobile backdrop click */}
        <div className="absolute inset-0" onClick={closeGradesModal} />

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.98 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl max-sm:rounded-t-3xl sm:rounded-3xl max-h-[92dvh] sm:max-h-[85vh] overflow-hidden flex flex-col bg-zinc-950 border border-white/10 ring-1 ring-white/5 shadow-2xl"
        >
          {/* Mobile Drag Pill */}
          <div className="w-10 h-1 rounded-full bg-zinc-800 mx-auto mt-3 sm:hidden" />

          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-white/5 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/25 shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold font-display text-zinc-100 tracking-tight">
                    Semester Performance
                  </h3>
                  {marks?.cgpa ? (
                    <span className="shrink-0 whitespace-nowrap text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                      CGPA {marks.cgpa.toFixed(2)}
                    </span>
                  ) : null}
                </div>
                <p className="text-[11px] text-zinc-500">
                  {semesters.length} Semesters Recorded · SRM Student Portal
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => syncPortalData({ forceRefresh: true })}
                disabled={isSyncing}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 bg-zinc-900 border border-white/5 transition-all disabled:opacity-50"
                title="Resync portal data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-cyan-400" : ""}`} />
              </button>
              <button
                onClick={closeGradesModal}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 bg-zinc-900 border border-white/5 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* Session Expired Notice */}
            {isSessionExpired && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-amber-300 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                  <span className="truncate">Session expired — Relogin to sync new records</span>
                </div>
                <button
                  onClick={() => {
                    closeGradesModal()
                    openPortalLogin()
                  }}
                  className="px-3 py-1 rounded-lg font-bold bg-amber-400 hover:bg-amber-300 text-zinc-950 transition-all shrink-0 text-xs shadow-sm"
                >
                  Relogin
                </button>
              </div>
            )}

            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3.5 rounded-2xl bg-zinc-900/60 ring-1 ring-white/5">
                <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-0.5">
                  CGPA
                </p>
                <p className="text-xl sm:text-2xl font-bold font-display text-emerald-400">
                  {marks?.cgpa ? marks.cgpa.toFixed(2) : "—"}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-900/60 ring-1 ring-white/5">
                <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-0.5">
                  Credits Earned
                </p>
                <p className="text-xl sm:text-2xl font-bold font-display text-cyan-400">
                  {marks?.creditsEarned || 0}
                  <span className="text-[11px] font-normal text-zinc-500 ml-1">
                    / {marks?.creditsRequired || 163}
                  </span>
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-900/60 ring-1 ring-white/5">
                <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-0.5">
                  Registered
                </p>
                <p className="text-xl sm:text-2xl font-bold font-display text-purple-400">
                  {marks?.creditsRegistered || 0}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-900/60 ring-1 ring-white/5">
                <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-0.5">
                  Semesters
                </p>
                <p className="text-xl sm:text-2xl font-bold font-display text-amber-400">
                  {semesters.length}
                </p>
              </div>
            </div>

            {/* Semester Tabs */}
            {semesters.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setSelectedSemTab("all")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    selectedSemTab === "all"
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                      : "bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  All Semesters
                </button>
                {semesters.map((sem) => (
                  <button
                    key={sem.semester}
                    onClick={() => setSelectedSemTab(sem.semester)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                      selectedSemTab === sem.semester
                        ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                        : "bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Sem {sem.semester} {sem.sgpa ? `(${sem.sgpa.toFixed(2)})` : ""}
                  </button>
                ))}
              </div>
            )}

            {/* Semester List */}
            {semesters.length === 0 ? (
              <div className="text-center py-12 rounded-2xl bg-zinc-900/40 border border-white/5 p-6">
                <GraduationCap className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                <p className="text-sm font-semibold text-zinc-300">No Semester Grades Recorded</p>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-4">
                  Connect your student portal account or click refresh to pull the latest semester grades.
                </p>
                <button
                  onClick={openPortalLogin}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-all"
                >
                  Connect Portal
                </button>
              </div>
            ) : (
              semesters
                .filter((sem) => selectedSemTab === "all" || sem.semester === selectedSemTab)
                .map((sem) => (
                  <div
                    key={sem.semester}
                    className="rounded-2xl bg-zinc-900/60 ring-1 ring-white/5 overflow-hidden"
                  >
                    {/* Semester Header */}
                    <div className="flex items-center justify-between p-3.5 sm:p-4 bg-zinc-900/80 border-b border-white/5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                        <h4 className="font-bold text-zinc-100 text-sm truncate">
                          Semester {sem.semester}
                        </h4>
                        <span className="text-[11px] text-zinc-500 shrink-0">
                          {sem.courses.length} courses
                        </span>
                      </div>
                      {sem.sgpa ? (
                        <span className="shrink-0 whitespace-nowrap text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                          SGPA {sem.sgpa.toFixed(2)}
                        </span>
                      ) : null}
                    </div>

                    {/* Courses List */}
                    <div className="divide-y divide-white/5">
                      {sem.courses.map((course, cIdx) => {
                        const gradeStyle =
                          GRADE_COLOR_MAP[course.grade?.trim() || ""] || {
                            bg: "bg-zinc-800",
                            text: "text-zinc-300",
                            ring: "ring-white/10",
                          }
                        return (
                          <div
                            key={cIdx}
                            className="p-3 sm:px-4 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono font-bold text-zinc-500">
                                  {course.code}
                                </span>
                                {course.credit > 0 && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                                    {course.credit} Cr
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-semibold text-zinc-200 truncate mt-0.5">
                                {(course as any).name || (course as any).title || course.code}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs ${gradeStyle.bg} ${gradeStyle.text} ring-1 ${gradeStyle.ring} shrink-0 whitespace-nowrap`}
                              >
                                {course.grade || "—"}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
