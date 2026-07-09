// SRM Academia API Integration - Scraper Format
// Interfaces match the Python scraper backend response format exactly

// Scraper Response Interfaces
export interface SRMProfile {
  registration_number: string
  name: string
  program: string
  department: string
  specialization: string
  semester: number
  batch: number
  enrollment_status: string
  photo_id: string
}

export interface SRMAttendanceRecord {
  course_code: string
  course_title: string
  category: "Theory" | "Practical"
  faculty: string
  slot: string
  room_no: string
  hours_conducted: number
  hours_absent: number
  attendance_pct: number
}

export interface SRMTestRecord {
  test: string
  max: number
  scored: number
}

export interface SRMMarksRecord {
  course_code: string
  course_type: "Theory" | "Practical"
  tests: SRMTestRecord[]
  test1?: number
  test1_max?: number
  test2?: number
  test2_max?: number
  test3?: number
  test3_max?: number
  total?: number
  max_total?: number
}

export interface SRMCourseRecord {
  course_code: string
  course_title: string
  credit: number
  regn_type: string
  category: string
  course_type: string
  faculty: string
  slot: string
  room_no: string
  academic_year: string
}

export interface SRMTimeSlotSchedule {
  [key: string]: string
}

export interface SRMUnifiedTimetable {
  time_slots: string[]
  schedule: {
    [day: string]: SRMTimeSlotSchedule
  }
}

export interface SRMHoliday {
  date: string
  day: string
  event: string
}

export interface SRMDayOrderSchedule {
  date: string
  day: string
  day_order: number
}

export interface SRMAcademicPlanner {
  semester_type: string
  holidays: SRMHoliday[]
  day_order_schedule: SRMDayOrderSchedule[]
}

export interface SRMAcademicPlannerMap {
  [plannerId: string]: SRMAcademicPlanner
}

export interface SRMTimetableByDayOrder {
  day: string
  day_order: number
  day_key: string
  date: string
  hour: number
  time: string
  slot: string
  code: string
  name: string
  room: string
  faculty: string
  type: string
  is_my_class: boolean
}

export interface SRMScraperResponse {
  success: boolean
  profile: SRMProfile
  attendance: SRMAttendanceRecord[]
  marks: SRMMarksRecord[]
  personal_timetable: SRMCourseRecord[]
  batch: number
  semester: number
  unified_timetable: SRMUnifiedTimetable
  academic_planner: SRMAcademicPlanner
  academic_planners?: SRMAcademicPlannerMap
  timetable_by_day_order: SRMTimetableByDayOrder[]
  day_order_to_dates: { [dayOrder: number]: { date: string; day: string }[] }
  date_to_day_order: { [date: string]: number }
}

interface SRMHydrateResponse {
  success: boolean
  dashboard: SRMScraperResponse
  timetable: SRMScraperResponse
  calendar: SRMScraperResponse
  circulars: SRMCircular[]
}

// UI-Facing Interfaces
export interface SRMUser {
  name: string
  username: string
  email?: string
  department: string
  batch: string
  semester: string
  program: string
  specialization: string
}

export interface SRMAttendance {
  code: string
  name: string
  attended: number
  total: number
  percentage: number
  category: string
  slot: string
}

export interface SRMCourse {
  code: string
  name: string
  type: string
  credits: number
  faculty: string
  slot: string
}

export interface SRMMarks {
  code: string
  name: string
  tests: SRMTestRecord[]
  test1: number | null
  test1_max: number
  test2: number | null
  test2_max: number
  test3: number | null
  test3_max: number
  total: number
  maxTotal: number
  grade?: string
}

export interface SRMTimetableSlot {
  day: string
  day_order: number
  day_key: string
  date: string
  hour: number
  time: string
  code: string
  name: string
  room: string
  faculty: string
  type: string
  slot?: string
}

export interface SRMTimetableResponse {
  timetable: SRMTimetableSlot[]
  unified: SRMUnifiedTimetable
  dateTodayOrder: Record<string, number>
  metadata: {
    section: string
    batch: string
    semester: number
    totalClasses: number
    lastUpdated: string
    dateTodayOrder?: Record<string, number>
  }
}

export interface SRMCalendarEvent {
  id: string
  title: string
  date: string
  day: string
  type: "holiday" | "deadline" | "exam" | "event"
}

export interface SRMCircular {
  id: string
  title: string
  date: string
  category: string
  content: string
  attachmentUrl?: string
  isNew?: boolean
}

export class SessionExpiredClientError extends Error {
  readonly code = "session_expired"
  readonly reason: string

  constructor(message: string, reason = "signed_in_elsewhere") {
    super(message)
    this.name = "SessionExpiredClientError"
    this.reason = reason
  }
}

function readErrorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object") {
    const detail = typeof (payload as { detail?: unknown }).detail === "string" ? (payload as { detail: string }).detail : null
    const error = typeof (payload as { error?: unknown }).error === "string" ? (payload as { error: string }).error : null
    const message = typeof (payload as { message?: unknown }).message === "string" ? (payload as { message: string }).message : null
    return detail || error || message || fallback
  }

  return fallback
}

async function readResponsePayload(response: Response): Promise<unknown> {
  try {
    return await response.clone().json()
  } catch {
    return null
  }
}

async function throwIfSessionExpired(response: Response, fallback: string) {
  if (response.status !== 401) {
    return
  }

  const payload = await readResponsePayload(response)
  const message = readErrorMessage(payload, fallback)
  throw new SessionExpiredClientError(message)
}

// ----------------------------------------------------------------
// Token refresh — called automatically when any API request gets a 401
// ----------------------------------------------------------------

let _refreshPromise: Promise<string | null> | null = null

async function attemptSilentRefresh(): Promise<string | null> {
  // Deduplicate: if a refresh is already in flight, wait for it
  if (_refreshPromise) return _refreshPromise

  _refreshPromise = (async () => {
    const expiredToken = localStorage.getItem("srm_token")
    if (!expiredToken) return null

    try {
      const controller = new AbortController()
      const id = setTimeout(() => controller.abort(), 30000)
      const res = await fetch("/api/refresh", {
        method: "POST",
        headers: { "x-access-token": expiredToken },
        signal: controller.signal,
      })
      clearTimeout(id)

      if (!res.ok) return null
      const data = await res.json() as { success: boolean; token?: string; requiresLogin?: boolean }
      if (data.success && data.token) {
        localStorage.setItem("srm_token", data.token)
        console.info("[edutechsrm] Session auto-refreshed silently ✓")
        return data.token
      }
    } catch (e) {
      console.warn("[edutechsrm] Silent refresh failed:", e)
    }
    return null
  })()

  try {
    return await _refreshPromise
  } finally {
    _refreshPromise = null
  }
}

// ----------------------------------------------------------------
// Fetch with timeout + auto-refresh on 401
// ----------------------------------------------------------------

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 25000,
): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)
  let response: Response
  try {
    response = await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(id)
  }

  // Auto-refresh: if we get a 401, silently get a new token and retry once
  if (response.status === 401) {
    const newToken = await attemptSilentRefresh()
    if (newToken) {
      // Rebuild headers with the fresh token and retry
      const newHeaders = new Headers(options.headers)
      newHeaders.set("x-access-token", newToken)
      const controller2 = new AbortController()
      const id2 = setTimeout(() => controller2.abort(), timeoutMs)
      try {
        return await fetch(url, { ...options, headers: newHeaders, signal: controller2.signal })
      } finally {
        clearTimeout(id2)
      }
    }
  }

  return response
}

// ----------------------------------------------------------------
// Transform helpers
// ----------------------------------------------------------------

export function transformAttendance(records: SRMAttendanceRecord[]): SRMAttendance[] {
  return records.map(record => ({
    code:       record.course_code,
    name:       record.course_title,
    attended:   record.hours_conducted - record.hours_absent,
    total:      record.hours_conducted,
    percentage: record.attendance_pct,
    category:   record.category,
    slot:       record.slot,
  }))
}

export function transformCourses(records: SRMCourseRecord[]): SRMCourse[] {
  return records.map(record => ({
    code:    record.course_code,
    name:    record.course_title,
    type:    record.course_type,
    credits: record.credit,
    faculty: record.faculty,
    slot:    record.slot,
  }))
}

export function transformMarks(records: SRMMarksRecord[]): SRMMarks[] {
  return records.map(record => ({
    code:      record.course_code,
    name:      "",
    tests:     record.tests,
    // Use flat fields from backend directly
    test1:     record.test1     ?? null,
    test1_max: record.test1_max ?? 0,
    test2:     record.test2     ?? null,
    test2_max: record.test2_max ?? 0,
    test3:     record.test3     ?? null,
    test3_max: record.test3_max ?? 0,
    total:     record.total     ?? 0,
    maxTotal:  record.max_total ?? 0,
  }))
}

function transformUserFromDashboard(data: SRMScraperResponse): SRMUser | null {
  if (!data.profile) return null
  return {
    name: data.profile.name,
    username: data.profile.registration_number,
    department: data.profile.department,
    batch: String(data.batch || 1),
    semester: String(data.semester || 1),
    program: data.profile.program,
    specialization: data.profile.specialization,
  }
}

export async function fetchHydratedDashboard(token: string): Promise<HydratedDashboard | null> {
  try {
    const response = await fetchWithTimeout("/api/srm/hydrate", {
      headers: { "x-access-token": token },
    })
    await throwIfSessionExpired(response, "Your session was replaced by a new sign-in. Please sign in again to continue.")
    if (!response.ok) return null

    const data = await response.json() as SRMHydrateResponse
    const dashboard = data.dashboard
    const user = transformUserFromDashboard(dashboard)
    if (!dashboard || !user) return null

    const courses = transformCourses(dashboard.personal_timetable || [])
    const marks = transformMarks(dashboard.marks || []).map(mark => ({
      ...mark,
      name: courses.find((course) => course.code === mark.code)?.name || mark.code,
    }))

    return {
      user,
      attendance: transformAttendance(dashboard.attendance || []),
      timetable: {
        timetable: Array.isArray((data.timetable as any)?.timetable_by_day_order)
          ? (data.timetable as any).timetable_by_day_order.filter((s: Record<string, unknown>) => s.is_my_class)
          : [],
        unified: (data.timetable as any)?.unified_timetable || { schedule: {}, time_slots: [] },
        dateTodayOrder: (data.timetable as any)?.date_to_day_order || {},
        metadata: {
          section: user.specialization || "A",
          batch: String(dashboard.batch || 1),
          semester: dashboard.semester || 1,
          totalClasses: Array.isArray((data.timetable as any)?.timetable_by_day_order)
            ? (data.timetable as any).timetable_by_day_order.filter((s: Record<string, unknown>) => s.is_my_class).length
            : 0,
          lastUpdated: new Date().toISOString(),
        },
      },
      courses,
      marks,
      calendar: {
        events: Array.isArray((data.calendar as any)?.academic_planner?.holidays)
          ? ((data.calendar as any).academic_planner.holidays as SRMHoliday[]).map((holiday, index) => ({
              id: `${holiday.date}-${index}`,
              title: holiday.event,
              date: holiday.date,
              day: holiday.day,
              type: "holiday" as const,
            }))
          : [],
        dateToDoMap: (data.calendar as any)?.date_to_day_order || {},
      },
      circulars: Array.isArray(data.circulars) ? data.circulars : [],
    }
  } catch (error) {
    if (error instanceof SessionExpiredClientError) {
      throw error
    }
    return null
  }
}

// ----------------------------------------------------------------
// API fetch functions
// ----------------------------------------------------------------

export async function loginToSRM(
  email: string,
  password: string,
  captchaAnswer?: string,
  cdigest?: string,
  turnstileToken?: string,
): Promise<{
  success: boolean
  token?: string
  error?: string
  requiresCaptcha?: boolean
  captchaImage?: string
  cdigest?: string
}> {
  try {
    console.log("[edutechsrm] loginToSRM - Sending request to /api/srm/login")
    const response = await fetchWithTimeout("/api/srm/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, captchaAnswer, cdigest, turnstileToken }),
    }, 120000)
    const data = await response.json() as {
      success: boolean
      token?: string
      error?: string
      requiresCaptcha?: boolean
      captchaImage?: string
      cdigest?: string
    }
    return data
  } catch (error) {
    console.error("[edutechsrm] loginToSRM - Fetch error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Network error" }
  }
}

export async function fetchUserDetails(token: string): Promise<SRMUser | null | "network_error"> {
  try {
    const response = await fetchWithTimeout("/api/srm/user", {
      headers: { "x-access-token": token },
    })
    // Only a real 401 means the session is dead — log out
    if (response.status === 401) return null
    // Any other non-ok = server/network issue — keep session alive
    if (!response.ok) return "network_error"
    const data: SRMScraperResponse = await response.json()
    if (data.profile) {
      return {
        name:           data.profile.name,
        username:       data.profile.registration_number,
        department:     data.profile.department,
        batch:          String(data.batch || 1),
        semester:       String(data.semester || 1),
        program:        data.profile.program,
        specialization: data.profile.specialization,
      }
    }
    // 200 OK but no profile — backend returned partial/empty data
    // Treat as network error, NOT as session expiry — keep user logged in
    return "network_error"
  } catch {
    // Timeout, connection refused, etc — keep session alive
    return "network_error"
  }
}

export async function fetchAttendance(token: string): Promise<SRMAttendance[] | null> {
  try {
    const response = await fetchWithTimeout("/api/srm/attendance", {
      headers: { "x-access-token": token },
    })
    await throwIfSessionExpired(response, "Your session was replaced by a new sign-in. Please sign in again to continue.")
    if (!response.ok) return null
    const data: SRMScraperResponse = await response.json()
    return transformAttendance(data.attendance || [])
  } catch (error) {
    if (error instanceof SessionExpiredClientError) {
      throw error
    }
    return null
  }
}

export interface HydratedDashboard {
  user: SRMUser
  attendance: SRMAttendance[]
  timetable: SRMTimetableResponse
  courses: SRMCourse[]
  marks: SRMMarks[]
  calendar: { events: SRMCalendarEvent[]; dateToDoMap: Record<string, number> }
  circulars: SRMCircular[]
}

export async function fetchTimetable(
  token: string,
  section?: string,
  batch?: string,
): Promise<SRMTimetableResponse | null> {
  try {
    const weekdayName = (date: string) =>
      new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { weekday: "long" })

    const params = new URLSearchParams()
    if (section) params.set("section", section)
    if (batch) params.set("batch", batch)

    const url = params.toString() ? `/api/srm/timetable?${params}` : "/api/srm/timetable"
    const response = await fetchWithTimeout(url, {
      headers: { "x-access-token": token },
    })
    await throwIfSessionExpired(response, "Your session was replaced by a new sign-in. Please sign in again to continue.")
    if (!response.ok) return null
    const data: SRMScraperResponse = await response.json()

    // Use pre-built timetable_by_day_order — already matched to student's courses
    // Also inject ALL date→day_order mappings so frontend can show any week
    const dateToDoMap: Record<string, number> = data.date_to_day_order || {}

    const timetable: SRMTimetableSlot[] = (data.timetable_by_day_order || [])
      .filter((slot: SRMTimetableByDayOrder) => slot.is_my_class)
      .map((slot: SRMTimetableByDayOrder) => ({
        day:       slot.date ? weekdayName(slot.date) : slot.day,
        day_order: slot.day_order,
        day_key:   slot.day_key,
        date:      slot.date,
        hour:      slot.hour,
        time:      slot.time,
        code:      slot.code,
        name:      slot.name,
        room:      slot.room,
        faculty:   slot.faculty,
        type:      slot.type,
        slot:      slot.slot,
      }))

    // Only generate extra slots for a limited upcoming window (next 14 days)
    const extraSlots: SRMTimetableSlot[] = []
    const today = new Date()
    const windowEnd = new Date(today)
    windowEnd.setDate(windowEnd.getDate() + 14)
    const windowEndStr = windowEnd.toISOString().slice(0, 10)
    const windowStartStr = today.toISOString().slice(0, 10)

    Object.entries(dateToDoMap).forEach(([date, dayOrder]) => {
      if (date < windowStartStr || date > windowEndStr) return
      if (timetable.some((s) => s.date === date)) return
      const baseSlots = timetable.filter((s) => s.day_order === dayOrder)
      baseSlots.forEach((base) => {
        extraSlots.push({
          ...base,
          date,
          day: weekdayName(date),
        })
      })
    })

    const allSlots = [...timetable, ...extraSlots].sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date)
      return dateCompare !== 0 ? dateCompare : a.hour - b.hour
    })

    return {
      timetable: allSlots,
      unified: data.unified_timetable,
      dateTodayOrder: dateToDoMap,
      metadata: {
        section:      section || data.profile?.specialization || "A",
        batch:        String(batch || data.batch || 1),
        semester:     data.semester || 1,
        totalClasses: timetable.length,
        lastUpdated:  new Date().toISOString(),
      },
    }
  } catch (error) {
    if (error instanceof SessionExpiredClientError) {
      throw error
    }
    return null
  }
}

export async function fetchCourses(token: string): Promise<SRMCourse[] | null> {
  try {
    const response = await fetchWithTimeout("/api/srm/courses", {
      headers: { "x-access-token": token },
    })
    await throwIfSessionExpired(response, "Your session was replaced by a new sign-in. Please sign in again to continue.")
    if (!response.ok) return null
    const data: SRMScraperResponse = await response.json()
    return transformCourses(data.personal_timetable || [])
  } catch (error) {
    if (error instanceof SessionExpiredClientError) {
      throw error
    }
    return null
  }
}

export async function fetchMarks(token: string): Promise<SRMMarks[] | null> {
  try {
    const response = await fetchWithTimeout("/api/srm/marks", {
      headers: { "x-access-token": token },
    })
    await throwIfSessionExpired(response, "Your session was replaced by a new sign-in. Please sign in again to continue.")
    if (!response.ok) return null
    const data: SRMScraperResponse = await response.json()
    const transformedMarks = transformMarks(data.marks || [])

    // Merge course names from personal_timetable
    const courseMap = new Map(
      (data.personal_timetable || []).map(course => [course.course_code, course.course_title])
    )

    return transformedMarks.map(mark => ({
      ...mark,
      name: courseMap.get(mark.code) || mark.code,
    }))
  } catch (error) {
    if (error instanceof SessionExpiredClientError) {
      throw error
    }
    return null
  }
}

export async function fetchCalendar(token: string): Promise<{ events: SRMCalendarEvent[], dateToDoMap: Record<string, number> } | null> {
  try {
    const response = await fetchWithTimeout("/api/srm/calendar", {
      headers: { "x-access-token": token },
    })
    await throwIfSessionExpired(response, "Your session was replaced by a new sign-in. Please sign in again to continue.")
    if (!response.ok) return null
    const data: SRMScraperResponse = await response.json()

    // Build date→day_order map from planner schedule — always correct, never stale
    const dateToDoMap: Record<string, number> = {}
    const planners = Object.values(data.academic_planners || {})
    const effectivePlanners = planners.length ? planners : (data.academic_planner ? [data.academic_planner] : [])
    const events: SRMCalendarEvent[] = []
    const seenEvents = new Set<string>()

    effectivePlanners.forEach((planner: any, plannerIndex) => {
      ;(planner?.day_order_schedule || []).forEach((entry: any) => {
        if (entry.date && entry.day_order && !dateToDoMap[entry.date]) {
          dateToDoMap[entry.date] = entry.day_order
        }
      })

      ;(planner?.holidays || []).forEach((holiday: any, holidayIndex: number) => {
        const key = `${holiday.date}:${holiday.event}`
        if (seenEvents.has(key)) return
        seenEvents.add(key)
        events.push({
          id: `${plannerIndex}-${holidayIndex}-${holiday.date}`,
          title: holiday.event,
          date: holiday.date,
          day: holiday.day,
          type: "holiday" as const,
        })
      })
    })

    events.sort((a, b) => a.date.localeCompare(b.date))
    return { events, dateToDoMap }
  } catch (error) {
    if (error instanceof SessionExpiredClientError) {
      throw error
    }
    return null
  }
}

export async function syncData(token: string): Promise<{
  success: boolean
  error?: string
  reason?: "session_expired" | "captcha" | "network" | "server"
}> {
  try {
    const response = await fetchWithTimeout("/api/srm/sync", {
      method: "POST",
      headers: { "x-access-token": token },
    }, 30000)
    if (!response.ok) {
      const data = await response.json() as { detail?: string; error?: string; requiresCaptcha?: boolean }
      if (response.status === 401) {
        return { success: false, error: data.detail || "Session expired", reason: "session_expired" }
      }
      if (response.status === 409 || data.requiresCaptcha) {
        return { success: false, error: data.detail || "CAPTCHA required", reason: "captcha" }
      }
      return { success: false, error: data.detail || "Sync failed", reason: "server" }
    }
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Network error", reason: "network" }
  }
}

export async function fetchCirculars(token: string): Promise<SRMCircular[] | null> {
  try {
    const response = await fetchWithTimeout("/api/srm/circulars", {
      headers: { "x-access-token": token },
    })
    await throwIfSessionExpired(response, "Your session was replaced by a new sign-in. Please sign in again to continue.")
    if (!response.ok) return null
    return response.json() as Promise<SRMCircular[]>
  } catch (error) {
    if (error instanceof SessionExpiredClientError) {
      throw error
    }
    return null
  }
}
