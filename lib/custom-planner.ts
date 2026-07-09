"use client"

import { useEffect, useMemo, useState } from "react"

const CUSTOM_CLASSES_KEY = "edutechsrm_custom_classes"
const CUSTOM_TASKS_KEY = "edutechsrm_custom_tasks"
const ASSIGNMENTS_KEY = "edutechsrm_assignments"
const OD_ML_KEY = "edutechsrm_od_ml_entries"
const CUSTOM_PLANNER_EVENT = "edutechsrm:custom-planner-updated"

export interface CustomClassEntry {
  id: string
  repeatMode: "single" | "day_order"
  date: string
  dayOrder?: number
  hour: number
  startTime: string
  endTime: string
  code: string
  name: string
  faculty: string
  room: string
  type: string
  note?: string
}

export interface CustomTaskEntry {
  id: string
  date: string
  title: string
  note: string
  createdAt: string
}

export interface AssignmentEntry {
  id: string
  title: string
  course: string
  dueDate: string
  dueTime: string
  priority: "low" | "medium" | "high"
  status: "todo" | "in_progress" | "done"
  note: string
  createdAt: string
}

export interface OdMlEntry {
  id: string
  type: "od" | "ml"
  startDate: string
  endDate: string
  note: string
  createdAt: string
}

const HOUR_RANGES = [
  { hour: 1, start: 480, end: 530 },
  { hour: 2, start: 530, end: 580 },
  { hour: 3, start: 585, end: 635 },
  { hour: 4, start: 640, end: 690 },
  { hour: 5, start: 695, end: 745 },
  { hour: 6, start: 750, end: 800 },
  { hour: 7, start: 805, end: 855 },
  { hour: 8, start: 860, end: 910 },
  { hour: 9, start: 910, end: 960 },
  { hour: 10, start: 960, end: 1010 },
  { hour: 11, start: 1010, end: 1050 },
  { hour: 12, start: 1050, end: 1090 },
]

function toTimeMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number)
  return (hours || 0) * 60 + (minutes || 0)
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(key, JSON.stringify(value))
  window.dispatchEvent(new Event(CUSTOM_PLANNER_EVENT))
}

function readClassesFromStorage() {
  return byClassOrder(readJson<CustomClassEntry[]>(CUSTOM_CLASSES_KEY, []))
}

function readTasksFromStorage() {
  return byDateAndTime(readJson<CustomTaskEntry[]>(CUSTOM_TASKS_KEY, []))
}

function readAssignmentsFromStorage() {
  return byAssignmentOrder(readJson<AssignmentEntry[]>(ASSIGNMENTS_KEY, []))
}

function readOdMlFromStorage() {
  return byOdMlOrder(readJson<OdMlEntry[]>(OD_ML_KEY, []))
}

function byDateAndTime<T extends { date: string }>(items: T[]) {
  return [...items].sort((a, b) => `${a.date}`.localeCompare(`${b.date}`))
}

function byAssignmentOrder(items: AssignmentEntry[]) {
  const priorityWeight = { high: 0, medium: 1, low: 2 }
  const statusWeight = { todo: 0, in_progress: 1, done: 2 }
  return [...items].sort((a, b) => {
    const statusCmp = statusWeight[a.status] - statusWeight[b.status]
    if (statusCmp !== 0) return statusCmp
    const dateCmp = a.dueDate.localeCompare(b.dueDate)
    if (dateCmp !== 0) return dateCmp
    const timeCmp = (a.dueTime || "99:99").localeCompare(b.dueTime || "99:99")
    if (timeCmp !== 0) return timeCmp
    const priorityCmp = priorityWeight[a.priority] - priorityWeight[b.priority]
    if (priorityCmp !== 0) return priorityCmp
    return a.createdAt.localeCompare(b.createdAt)
  })
}

function byClassOrder(items: CustomClassEntry[]) {
  return [...items].sort((a, b) => {
    if (a.repeatMode !== b.repeatMode) return a.repeatMode === "day_order" ? -1 : 1
    if (a.repeatMode === "day_order" || b.repeatMode === "day_order") {
      const dayOrderCmp = (a.dayOrder || 0) - (b.dayOrder || 0)
      if (dayOrderCmp !== 0) return dayOrderCmp
    } else {
      const dateCmp = a.date.localeCompare(b.date)
      if (dateCmp !== 0) return dateCmp
    }
    if (a.hour !== b.hour) return a.hour - b.hour
    return a.startTime.localeCompare(b.startTime)
  })
}

function byOdMlOrder(items: OdMlEntry[]) {
  return [...items].sort((a, b) => {
    const startCmp = a.startDate.localeCompare(b.startDate)
    if (startCmp !== 0) return startCmp
    const endCmp = a.endDate.localeCompare(b.endDate)
    if (endCmp !== 0) return endCmp
    return a.createdAt.localeCompare(b.createdAt)
  })
}

export function getHourTimeRange(hour: number) {
  const map: Record<number, { start: string; end: string }> = {
    1: { start: "08:00", end: "08:50" },
    2: { start: "08:50", end: "09:40" },
    3: { start: "09:45", end: "10:35" },
    4: { start: "10:40", end: "11:30" },
    5: { start: "11:35", end: "12:25" },
    6: { start: "12:30", end: "13:20" },
    7: { start: "13:25", end: "14:15" },
    8: { start: "14:20", end: "15:10" },
    9: { start: "15:10", end: "16:00" },
    10: { start: "16:00", end: "16:50" },
    11: { start: "16:50", end: "17:30" },
    12: { start: "17:30", end: "18:10" },
  }
  return map[hour] ?? { start: "08:00", end: "08:50" }
}

export function getHourFromTime(value: string) {
  const minutes = toTimeMinutes(value)
  return HOUR_RANGES.find((slot) => minutes >= slot.start && minutes < slot.end)?.hour ?? 1
}

export function getCoveredHoursForClass(startTime: string, endTime: string) {
  const start = toTimeMinutes(startTime)
  const end = toTimeMinutes(endTime)
  return HOUR_RANGES
    .filter((slot) => start < slot.end && end > slot.start)
    .map((slot) => slot.hour)
}

export function createCustomClass(input: Omit<CustomClassEntry, "id">): CustomClassEntry {
  return {
    ...input,
    hour: getHourFromTime(input.startTime),
    id: `cc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  }
}

export function expandCustomClassesByDate(
  classes: CustomClassEntry[],
  dateToDayOrder: Record<string, number>
) {
  const map: Record<string, CustomClassEntry[]> = {}
  classes.forEach((item) => {
    if (item.repeatMode === "day_order" && item.dayOrder) {
      Object.entries(dateToDayOrder).forEach(([date, dayOrder]) => {
        if (dayOrder === item.dayOrder) {
          if (!map[date]) map[date] = []
          map[date].push({ ...item, date })
        }
      })
      return
    }
    if (!map[item.date]) map[item.date] = []
    map[item.date].push(item)
  })
  Object.keys(map).forEach((date) => {
    map[date] = map[date].sort((a, b) => (a.hour - b.hour) || a.startTime.localeCompare(b.startTime))
  })
  return map
}

export function createCustomTask(input: Omit<CustomTaskEntry, "id" | "createdAt">): CustomTaskEntry {
  return {
    ...input,
    id: `ct-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  }
}

export function createAssignment(
  input: Omit<AssignmentEntry, "id" | "createdAt">
): AssignmentEntry {
  return {
    ...input,
    id: `as-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  }
}

export function createOdMlEntry(input: Omit<OdMlEntry, "id" | "createdAt">): OdMlEntry {
  return {
    ...input,
    id: `odml-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  }
}

export function useCustomPlanner() {
  const [classes, setClasses] = useState<CustomClassEntry[]>([])
  const [tasks, setTasks] = useState<CustomTaskEntry[]>([])
  const [assignments, setAssignments] = useState<AssignmentEntry[]>([])
  const [odMlEntries, setOdMlEntries] = useState<OdMlEntry[]>([])

  useEffect(() => {
    const sync = () => {
      setClasses(byClassOrder(readJson<CustomClassEntry[]>(CUSTOM_CLASSES_KEY, [])))
      const storedTasks = byDateAndTime(readJson<CustomTaskEntry[]>(CUSTOM_TASKS_KEY, []))
      const storedAssignments = byAssignmentOrder(readJson<AssignmentEntry[]>(ASSIGNMENTS_KEY, []))
      const storedOdMl = byOdMlOrder(readJson<OdMlEntry[]>(OD_ML_KEY, []))

      if (storedAssignments.length === 0 && storedTasks.length > 0) {
        const migratedAssignments = storedTasks.map((task) => ({
          id: `mig-${task.id}`,
          title: task.title,
          course: "",
          dueDate: task.date,
          dueTime: "",
          priority: "medium" as const,
          status: "todo" as const,
          note: task.note,
          createdAt: task.createdAt,
        }))
        writeJson(ASSIGNMENTS_KEY, byAssignmentOrder(migratedAssignments))
        setAssignments(byAssignmentOrder(migratedAssignments))
      } else {
        setAssignments(storedAssignments)
      }

      setTasks(storedTasks)
      setOdMlEntries(storedOdMl)
    }
    sync()
    window.addEventListener("storage", sync)
    window.addEventListener(CUSTOM_PLANNER_EVENT, sync)
    return () => {
      window.removeEventListener("storage", sync)
      window.removeEventListener(CUSTOM_PLANNER_EVENT, sync)
    }
  }, [])

  const tasksByDate = useMemo(() => {
    const map: Record<string, CustomTaskEntry[]> = {}
    tasks.forEach((item) => {
      if (!map[item.date]) map[item.date] = []
      map[item.date].push(item)
    })
    return map
  }, [tasks])

  const assignmentsByDate = useMemo(() => {
    const map: Record<string, AssignmentEntry[]> = {}
    assignments.forEach((item) => {
      if (!map[item.dueDate]) map[item.dueDate] = []
      map[item.dueDate].push(item)
    })
    Object.keys(map).forEach((date) => {
      map[date] = byAssignmentOrder(map[date])
    })
    return map
  }, [assignments])

  const addClass = (item: CustomClassEntry) => {
    const current = readClassesFromStorage()
    writeJson(CUSTOM_CLASSES_KEY, byClassOrder([...current, item]))
  }

  const removeClass = (id: string) => {
    const current = readClassesFromStorage()
    writeJson(CUSTOM_CLASSES_KEY, current.filter((item) => item.id !== id))
  }

  const addTask = (item: CustomTaskEntry) => {
    const current = readTasksFromStorage()
    writeJson(CUSTOM_TASKS_KEY, byDateAndTime([...current, item]))
  }

  const removeTask = (id: string) => {
    const current = readTasksFromStorage()
    writeJson(CUSTOM_TASKS_KEY, current.filter((item) => item.id !== id))
  }

  const addAssignment = (item: AssignmentEntry) => {
    const current = readAssignmentsFromStorage()
    writeJson(ASSIGNMENTS_KEY, byAssignmentOrder([...current, item]))
  }

  const removeAssignment = (id: string) => {
    const current = readAssignmentsFromStorage()
    writeJson(ASSIGNMENTS_KEY, current.filter((item) => item.id !== id))
  }

  const updateAssignment = (id: string, updates: Partial<Omit<AssignmentEntry, "id" | "createdAt">>) => {
    const current = readAssignmentsFromStorage()
    writeJson(
      ASSIGNMENTS_KEY,
      byAssignmentOrder(current.map((item) => (item.id === id ? { ...item, ...updates } : item)))
    )
  }

  const addOdMlEntry = (item: OdMlEntry) => {
    const current = readOdMlFromStorage()
    writeJson(OD_ML_KEY, byOdMlOrder([...current, item]))
  }

  const removeOdMlEntry = (id: string) => {
    const current = readOdMlFromStorage()
    writeJson(OD_ML_KEY, current.filter((item) => item.id !== id))
  }

  return {
    customClasses: classes,
    customTasks: tasks,
    customTasksByDate: tasksByDate,
    assignments,
    odMlEntries,
    assignmentsByDate,
    addCustomClass: addClass,
    removeCustomClass: removeClass,
    addCustomTask: addTask,
    removeCustomTask: removeTask,
    addAssignment,
    removeAssignment,
    updateAssignment,
    addOdMlEntry,
    removeOdMlEntry,
  }
}
