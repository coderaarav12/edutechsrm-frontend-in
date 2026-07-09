"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  LogIn,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { LoginModal } from "./login-modal"
import { AIPromoBadge } from "@/components/ai-promo-badge"
import { createAssignment, useCustomPlanner } from "@/lib/custom-planner"

const priorityMeta = {
  high: { label: "High", color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.22)" },
  medium: { label: "Medium", color: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.22)" },
  low: { label: "Low", color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.22)" },
} as const

const statusMeta = {
  todo: { label: "To do", color: "#f8fafc", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.08)" },
  in_progress: { label: "In progress", color: "#22d3ee", bg: "rgba(34,211,238,0.08)", border: "rgba(34,211,238,0.18)" },
  done: { label: "Done", color: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.18)" },
} as const

function formatLocalDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

export function AssignmentsSection() {
  const { isAuthenticated, isLoading, refreshData, dateToDoMap } = useAuth()
  const { assignments, addAssignment, updateAssignment, removeAssignment } = useCustomPlanner()
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const today = formatLocalDateKey(new Date())
  const [form, setForm] = useState({
    title: "",
    course: "",
    dueDate: today,
    dueTime: "",
    priority: "medium" as "low" | "medium" | "high",
    note: "",
  })

  const pendingAssignments = useMemo(
    () => assignments.filter((item) => item.status !== "done"),
    [assignments]
  )
  const overdueAssignments = useMemo(
    () => pendingAssignments.filter((item) => item.dueDate < today),
    [pendingAssignments, today]
  )
  const todayAssignments = useMemo(
    () => pendingAssignments.filter((item) => item.dueDate === today),
    [pendingAssignments, today]
  )

  const groupedAssignments = useMemo(() => {
    return {
      todo: assignments.filter((item) => item.status === "todo"),
      in_progress: assignments.filter((item) => item.status === "in_progress"),
      done: assignments.filter((item) => item.status === "done"),
    }
  }, [assignments])

  const handleAddAssignment = () => {
    if (!form.title.trim() || !form.dueDate) return
    addAssignment(
      createAssignment({
        title: form.title.trim(),
        course: form.course.trim().toUpperCase(),
        dueDate: form.dueDate,
        dueTime: form.dueTime,
        priority: form.priority,
        status: "todo",
        note: form.note.trim(),
      })
    )
    setForm((prev) => ({
      ...prev,
      title: "",
      course: "",
      dueTime: "",
      note: "",
      priority: "medium",
    }))
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-full pt-[3.75rem] pb-20 px-3 sm:px-4 lg:px-8 lg:pb-8 w-full flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center bg-emerald-500/10 ring-1 ring-emerald-500/20">
            <ClipboardCheck className="w-9 h-9 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold text-zinc-100 tracking-tight font-display mb-4">
            Connect to track assignments
          </h2>
          <p className="text-sm text-zinc-500 mb-8 max-w-xs mx-auto font-medium">
            Login with your SRM credentials to manage your assignments, status, and due dates.
          </p>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsLoginOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-emerald-400 text-zinc-950 hover:bg-emerald-300 transition-all"
          >
            <LogIn className="w-[18px] h-[18px]" /> Connect to SRM Academia
          </motion.button>
        </motion.div>
        <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      </div>
    )
  }

  return (
    <div className="min-h-full pt-[3.75rem] pb-20 px-3 sm:px-4 lg:px-8 lg:pb-8 w-full">
      <div className="flex justify-between items-start mb-8">
        <div>
          <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-1">Planner Board</p>
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight font-display">Assignments</h1>
        </div>
        <div className="flex items-center gap-2">
          <AIPromoBadge page="assignments" />
          <motion.button whileTap={{ scale: 0.9 }} onClick={refreshData} disabled={isLoading}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-zinc-500 bg-zinc-900/60 ring-1 ring-white/5 hover:text-zinc-300 transition-all disabled:opacity-40">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[0.92fr_1.08fr] gap-6">
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Pending", value: pendingAssignments.length, cls: "text-zinc-200" },
              { label: "Due today", value: todayAssignments.length, cls: "text-cyan-400" },
              { label: "Overdue", value: overdueAssignments.length, cls: "text-rose-400" },
            ].map((item) => (
              <div key={item.label} className="bg-zinc-900/60 ring-1 ring-white/5 rounded-2xl p-4">
                <p className={`text-lg font-black ${item.cls}`}>{item.value}</p>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{item.label}</p>
              </div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/60 ring-1 ring-white/5 rounded-3xl p-8 overflow-hidden relative">
            <div className="flex items-center gap-3 mb-6">
              <Plus className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-sm font-semibold text-zinc-200">Add assignment</p>
                <p className="text-xs text-zinc-500">This is now the dedicated place for planner tasks and submissions.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="sm:col-span-2">
                <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Title</span>
                <input
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="DBMS assignment 2"
                  className="mt-1 w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-medium placeholder-zinc-700 shadow-inner"
                />
              </label>
              <label>
                <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Course</span>
                <input
                  value={form.course}
                  onChange={(e) => setForm((prev) => ({ ...prev, course: e.target.value }))}
                  placeholder="21CSC201T"
                  className="mt-1 w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-medium placeholder-zinc-700 shadow-inner"
                />
              </label>
              <label>
                <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Priority</span>
                <select
                  value={form.priority}
                  onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value as "low" | "medium" | "high" }))}
                  className="mt-1 w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-medium shadow-inner"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </label>
              <label>
                <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Due date</span>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                  className="mt-1 w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-medium shadow-inner"
                />
              </label>
              <label>
                <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Time</span>
                <input
                  type="time"
                  value={form.dueTime}
                  onChange={(e) => setForm((prev) => ({ ...prev, dueTime: e.target.value }))}
                  className="mt-1 w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-medium shadow-inner"
                />
              </label>
              <label className="sm:col-span-2">
                <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Note</span>
                <input
                  value={form.note}
                  onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
                  placeholder="Optional note"
                  className="mt-1 w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-medium placeholder-zinc-700 shadow-inner"
                />
              </label>
            </div>

            <button
              onClick={handleAddAssignment}
              className="w-full mt-4 rounded-xl px-4 py-3 flex items-center justify-center gap-2 text-sm font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add assignment
            </button>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="bg-zinc-900/60 ring-1 ring-white/5 rounded-3xl p-8 overflow-hidden relative">
          <div className="flex items-center gap-3 mb-6">
            <ClipboardList className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-sm font-semibold text-zinc-200">Assignment board</p>
              <p className="text-xs text-zinc-500">
                {assignments.length} total items across your tracker{dateToDoMap[today] ? ` · DO ${dateToDoMap[today]} today` : ""}.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {(["todo", "in_progress", "done"] as const).map((status) => (
              <div key={status}>
                <div className="flex items-center justify-between mb-3">
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${statusLabelColor[status]}`}>
                    {statusMeta[status].label}
                  </p>
                  <span className="text-[10px] text-zinc-500 font-bold">{groupedAssignments[status].length}</span>
                </div>
                <div className="space-y-3">
                  {groupedAssignments[status].length > 0 ? groupedAssignments[status].map((item, idx) => {
                    const nextStatus =
                      item.status === "todo" ? "in_progress" : item.status === "in_progress" ? "done" : "todo"
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group bg-zinc-900/40 ring-1 ring-white/5 rounded-2xl p-6 hover:ring-zinc-700 hover:bg-zinc-900/60 transition-all relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="flex items-start gap-4 relative z-10">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ring-1 ${priorityIconBg[item.priority]}`}>
                            {item.status === "done" ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Clock3 className={`w-4 h-4 ${priorityIconColor[item.priority]}`} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold text-zinc-200">{item.title}</p>
                              <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg ring-1 ${priorityBadge[item.priority]}`}>
                                {priorityMeta[item.priority].label}
                              </span>
                              {item.course ? (
                                <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg ring-1 text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
                                  {item.course}
                                </span>
                              ) : null}
                            </div>
                            <p className="text-xs text-zinc-400 mt-1">
                              Due {new Date(`${item.dueDate}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", weekday: "short" })}
                              {item.dueTime ? ` · ${item.dueTime}` : ""}
                              {dateToDoMap[item.dueDate] ? ` · DO ${dateToDoMap[item.dueDate]}` : ""}
                            </p>
                            {item.note ? (
                              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{item.note}</p>
                            ) : null}
                            <div className="flex items-center gap-2 mt-3">
                              <button
                                onClick={() => updateAssignment(item.id, { status: nextStatus })}
                                className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg ring-1 transition-all hover:opacity-80 ${statusBadge[nextStatus]}`}
                              >
                                Move to {statusMeta[nextStatus].label}
                              </button>
                              <button
                                onClick={() => removeAssignment(item.id)}
                                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  }) : (
                    <div className="bg-zinc-900/20 ring-1 ring-white/5 rounded-2xl px-4 py-5 text-center">
                      <p className="text-xs text-zinc-500">Nothing in {statusMeta[status].label.toLowerCase()} right now.</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
