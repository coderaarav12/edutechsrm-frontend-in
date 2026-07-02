"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FileText, BookOpen, ExternalLink, ChevronLeft, GraduationCap, BookMarked, Sparkles, ArrowRight, Library, Lightbulb } from "lucide-react"
import { NOTES_DATA, type SemesterResources, type SubjectResources } from "@/lib/notes-data"
import { useAuth } from "@/lib/auth-context"
import { DriveViewer } from "@/components/drive-viewer"
import { AIPromoBadge } from "@/components/ai-promo-badge"

const SEM_COLORS = ["#34d399", "#38bdf8", "#a78bfa", "#f97316", "#f59e0b", "#f472b6", "#34d399", "#fb923c"]

function categorizeItems(notes: { title: string; url: string }[], pyqs: { title: string; url: string }[]) {
  const studyNotes = [...notes]
  const prevPyqs: { title: string; url: string }[] = []
  const practiceMaterials: { title: string; url: string }[] = []

  pyqs.forEach(item => {
    if (item.title.startsWith("PYQ")) {
      prevPyqs.push(item)
    } else {
      practiceMaterials.push(item)
    }
  })

  prevPyqs.sort((a, b) => {
    const yearA = parseInt(a.title.match(/\b(20\d{2})\b/)?.[1] || "0")
    const yearB = parseInt(b.title.match(/\b(20\d{2})\b/)?.[1] || "0")
    return yearB - yearA
  })

  return { studyNotes, prevPyqs, practiceMaterials }
}

export function NotesSection() {
  const { user } = useAuth()
  const userSem = user?.semester ? Number(user.semester) : null
  const [selectedSem, setSelectedSem] = useState<number | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [driveViewer, setDriveViewer] = useState<{ url: string; title: string } | null>(null)

  const semData = NOTES_DATA.find(s => s.semester === selectedSem) || null
  const subjectData = semData?.subjects.find(s => s.name === selectedSubject) || null
  const totalSubjects = NOTES_DATA.reduce((sum, sem) => sum + sem.subjects.length, 0)

  const categorized = useMemo(() => subjectData ? categorizeItems(subjectData.notes, subjectData.pyqs) : null, [subjectData])

  const goBack = () => {
    if (selectedSubject) {
      setSelectedSubject(null)
    } else {
      setSelectedSem(null)
    }
  }

  return (
    <div className="min-h-full pt-[3.75rem] pb-20 px-3 sm:px-4 lg:px-8 lg:pb-8 w-full">

      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-1">Study Material</h2>
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight font-display">Notes &amp; PYQs</h1>
          <p className="text-zinc-500 text-[11px] mt-1 font-medium">
            {totalSubjects} subjects across {NOTES_DATA.length} semesters
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] font-medium text-zinc-400">
              <span className="text-emerald-400">Sourced</span> from{" "}
              <a href="https://thehelpers.tech" target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2 text-sky-400">
                thehelpers.tech
              </a>
            </span>
          </div>
        </div>
        <AIPromoBadge page="notes" />
      </div>

      {/* Breadcrumb Back */}
      <AnimatePresence>
        {(selectedSem !== null || selectedSubject) && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            onClick={goBack}
            className="flex items-center gap-2 mb-6 text-xs font-bold text-zinc-400 hover:text-zinc-100 bg-zinc-900/60 ring-1 ring-white/5 px-3 py-2 rounded-xl transition-all"
          >
            <ChevronLeft size={14} />
            {selectedSubject ? `Back to Semester ${selectedSem}` : "All Semesters"}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Semester Grid */}
      {!selectedSem && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {NOTES_DATA.map((sem, i) => {
              const color = SEM_COLORS[i]
              const subjCount = sem.subjects.length
              const totalNotes = sem.subjects.reduce((s, sub) => s + sub.notes.length, 0)
              const totalPyqs = sem.subjects.reduce((s, sub) => s + sub.pyqs.length, 0)
              const isCurrent = userSem !== null && sem.semester === userSem
              return (
                <motion.button
                  key={sem.semester}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setSelectedSem(sem.semester)}
                  className="group text-left rounded-2xl p-5 transition-all relative overflow-hidden bg-zinc-900/40 ring-1 ring-white/5 hover:ring-zinc-700 hover:bg-zinc-900/60"
                >
                  {isCurrent && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-emerald-600" />
                  )}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm mb-3"
                    style={{ background: `${color}18`, border: `1px solid ${color}30`, color }}
                  >
                    {sem.semester}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-200">
                      Semester {sem.semester}
                      {isCurrent && <span className="ml-1.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-400">Current</span>}
                    </p>
                    <p className="text-[10px] text-zinc-500 font-medium mt-1">{subjCount} subjects</p>
                    <div className="flex items-center gap-2.5 mt-2 text-[9px]">
                      <span className="flex items-center gap-1" style={{ color: "#34d399" }}>
                        <FileText className="w-2.5 h-2.5" />{totalNotes}
                      </span>
                      <span className="flex items-center gap-1" style={{ color: "#38bdf8" }}>
                        <BookOpen className="w-2.5 h-2.5" />{totalPyqs}
                      </span>
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-3.5 h-3.5" style={{ color }} />
                  </div>
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Subject List */}
      {selectedSem && !selectedSubject && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`sem-${selectedSem}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
                style={{ background: `${SEM_COLORS[selectedSem - 1]}18`, color: SEM_COLORS[selectedSem - 1] }}
              >
                {selectedSem}
              </div>
              <p className="text-sm font-bold text-zinc-200">Semester {selectedSem}</p>
              <p className="text-[10px] text-zinc-500 ml-auto">{semData?.subjects.length || 0} subjects</p>
            </div>
            {semData?.subjects.map((sub, i) => {
              const color = SEM_COLORS[selectedSem - 1]
              const noteCount = sub.notes.length
              const pyqCount = sub.pyqs.length
              return (
                <motion.button
                  key={sub.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedSubject(sub.name)}
                  className="group w-full text-left rounded-2xl p-4 transition-all bg-zinc-900/40 ring-1 ring-white/5 hover:ring-zinc-700 hover:bg-zinc-900/60 relative overflow-hidden"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-zinc-800/80 ring-1 ring-white/5">
                      <Library className="w-4 h-4" style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate text-zinc-200">{sub.name}</p>
                      <div className="flex items-center gap-2.5 mt-1">
                        {noteCount > 0 && (
                          <span className="flex items-center gap-1 text-[9px]" style={{ color: "#34d399" }}>
                            <FileText className="w-2.5 h-2.5" />{noteCount} note{noteCount !== 1 ? "s" : ""}
                          </span>
                        )}
                        {pyqCount > 0 && (
                          <span className="flex items-center gap-1 text-[9px]" style={{ color: "#38bdf8" }}>
                            <BookOpen className="w-2.5 h-2.5" />{pyqCount} PYQ{pyqCount !== 1 ? "s" : ""}
                          </span>
                        )}
                        {noteCount === 0 && pyqCount === 0 && (
                          <span className="text-[9px] text-zinc-600">Coming soon</span>
                        )}
                      </div>
                    </div>
                    <ExternalLink size={14} className="text-zinc-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.button>
              )
            })}
            {(!semData?.subjects || semData.subjects.length === 0) && (
              <div className="text-center py-12 rounded-2xl bg-zinc-900/40 ring-1 ring-white/5">
                <GraduationCap className="w-10 h-10 mx-auto mb-3 text-zinc-700" />
                <p className="text-sm font-semibold text-zinc-500">No subjects added yet</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Subject Resources */}
      {selectedSubject && subjectData && categorized && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`sub-${selectedSubject}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: `${SEM_COLORS[(selectedSem || 1) - 1]}18`, border: `1px solid ${SEM_COLORS[(selectedSem || 1) - 1]}30` }}
              >
                <BookMarked className="w-5 h-5" style={{ color: SEM_COLORS[(selectedSem || 1) - 1] }} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-100 tracking-tight font-display">{subjectData.name}</h2>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Semester {selectedSem}</p>
              </div>
            </div>

            {/* Study Notes */}
            {categorized.studyNotes.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-500/10">
                    <FileText size={13} className="text-emerald-400" />
                  </div>
                  <p className="text-sm font-bold text-zinc-200">Study Notes</p>
                  <span className="text-[10px] font-medium text-zinc-600 ml-auto">{categorized.studyNotes.length} file{categorized.studyNotes.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {categorized.studyNotes.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setDriveViewer({ url: item.url, title: item.title })}
                      className="group flex items-center gap-3 rounded-xl px-4 py-3.5 bg-zinc-900/50 ring-1 ring-white/5 hover:bg-emerald-500/5 hover:ring-emerald-500/15 transition-all min-w-0 text-left w-full"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-zinc-800/80 ring-1 ring-white/5 group-hover:bg-emerald-500/10 group-hover:ring-emerald-500/20 transition-all">
                        <FileText size={13} className="text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                      </div>
                      <span className="text-sm font-medium truncate text-zinc-300 group-hover:text-zinc-100 transition-colors flex-1 min-w-0">{item.title}</span>
                      <ExternalLink size={13} className="text-zinc-600 shrink-0 opacity-0 group-hover:opacity-100 transition-all group-hover:text-emerald-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Previous Year Papers */}
            {categorized.prevPyqs.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-sky-500/10">
                    <BookOpen size={13} className="text-sky-400" />
                  </div>
                  <p className="text-sm font-bold text-zinc-200">Previous Year Papers</p>
                  <span className="text-[10px] font-medium text-zinc-600 ml-auto">{categorized.prevPyqs.length} file{categorized.prevPyqs.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {categorized.prevPyqs.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setDriveViewer({ url: item.url, title: item.title })}
                      className="group flex items-center gap-3 rounded-xl px-4 py-3.5 bg-zinc-900/50 ring-1 ring-white/5 hover:bg-sky-500/5 hover:ring-sky-500/15 transition-all min-w-0 text-left w-full"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-zinc-800/80 ring-1 ring-white/5 group-hover:bg-sky-500/10 group-hover:ring-sky-500/20 transition-all">
                        <BookOpen size={13} className="text-zinc-400 group-hover:text-sky-400 transition-colors" />
                      </div>
                      <span className="text-sm font-medium truncate text-zinc-300 group-hover:text-zinc-100 transition-colors flex-1 min-w-0">{item.title}</span>
                      <ExternalLink size={13} className="text-zinc-600 shrink-0 opacity-0 group-hover:opacity-100 transition-all group-hover:text-sky-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Practice Material */}
            {categorized.practiceMaterials.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-500/10">
                    <Lightbulb size={13} className="text-amber-400" />
                  </div>
                  <p className="text-sm font-bold text-zinc-200">Practice Material</p>
                  <span className="text-[10px] font-medium text-zinc-600 ml-auto">{categorized.practiceMaterials.length} file{categorized.practiceMaterials.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {categorized.practiceMaterials.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setDriveViewer({ url: item.url, title: item.title })}
                      className="group flex items-center gap-3 rounded-xl px-4 py-3.5 bg-zinc-900/50 ring-1 ring-white/5 hover:bg-amber-500/5 hover:ring-amber-500/15 transition-all min-w-0 text-left w-full"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-zinc-800/80 ring-1 ring-white/5 group-hover:bg-amber-500/10 group-hover:ring-amber-500/20 transition-all">
                        <Lightbulb size={13} className="text-zinc-400 group-hover:text-amber-400 transition-colors" />
                      </div>
                      <span className="text-sm font-medium truncate text-zinc-300 group-hover:text-zinc-100 transition-colors flex-1 min-w-0">{item.title}</span>
                      <ExternalLink size={13} className="text-zinc-600 shrink-0 opacity-0 group-hover:opacity-100 transition-all group-hover:text-amber-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {categorized.studyNotes.length === 0 && categorized.prevPyqs.length === 0 && categorized.practiceMaterials.length === 0 && (
              <div className="rounded-2xl p-10 text-center bg-zinc-900/40 ring-1 ring-white/5">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-white/[0.03] ring-1 ring-white/10">
                  <FileText className="w-8 h-8 text-zinc-600" />
                </div>
                <p className="text-base font-bold mb-1 text-zinc-400">Coming Soon</p>
                <p className="text-[11px] leading-relaxed text-zinc-500 max-w-[280px] mx-auto">Notes and PYQs for this subject are not yet available. They&apos;ll appear here once added.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      <AnimatePresence>
        {driveViewer && (
          <DriveViewer
            url={driveViewer.url}
            title={driveViewer.title}
            onClose={() => setDriveViewer(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
