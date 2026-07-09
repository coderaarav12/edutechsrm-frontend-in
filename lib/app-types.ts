export type TabType = "dashboard" | "timetable" | "attendance" | "courses" | "marks" | "calendar" | "gradex" | "about" | "planner" | "notes" | "updates" | "feedback" | "settings" | "ai" | "mess" | "finder"

export const VALID_TABS: TabType[] = [
  "dashboard",
  "timetable",
  "attendance",
  "courses",
  "marks",
  "calendar",
  "gradex",
  "planner",
  "notes",
  "updates",
  "feedback",
  "ai",
  "mess",
  "about",
  "settings",
  "finder",
]

export const TAB_FROM_PATH: Record<string, TabType> = {
  dashboard: "dashboard",
  timetable: "timetable",
  attendance: "attendance",
  courses: "courses",
  marks: "marks",
  calendar: "calendar",
  gradex: "gradex",
  planner: "planner",
  notes: "notes",
  updates: "updates",
  feedback: "feedback",
  mess: "mess",
  about: "about",
  settings: "settings",
  ai: "ai",
  finder: "finder",
}
