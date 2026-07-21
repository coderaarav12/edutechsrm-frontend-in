"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import type {
  SRMUser,
  SRMAttendance,
  SRMTimetableSlot,
  SRMCourse,
  SRMMarks,
  SRMCalendarEvent,
  SRMCircular,
} from "./srm-api"
import {
  fetchHydratedDashboard,
  fetchTimetable,
  syncData,
  SessionExpiredClientError,
} from "./srm-api"

interface TimetableMetadata {
  section?: string
  batch?: string
  availableSections?: string[]
  availableBatches?: string[]
  totalClasses?: number
  lastUpdated?: string
  semester?: number
  dateTodayOrder?: Record<string, number>
}

interface DataStatus {
  user: "loading" | "success" | "error"
  attendance: "loading" | "success" | "error"
  timetable: "loading" | "success" | "error"
  courses: "loading" | "success" | "error"
  marks: "loading" | "success" | "error"
  calendar: "loading" | "success" | "error"
  circulars: "loading" | "success" | "error"
}

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  isLoginSyncing: boolean
  isOffline: boolean
  isBackgroundSyncing: boolean
  isManualRefresh: boolean
  token: string | null
  user: SRMUser | null
  attendance: SRMAttendance[]
  timetable: SRMTimetableSlot[]
  timetableMetadata: TimetableMetadata | null
  courses: SRMCourse[]
  marks: SRMMarks[]
  calendar: SRMCalendarEvent[]
  circulars: SRMCircular[]
  dateToDoMap: Record<string, number>
  dataStatus: DataStatus
  lastSyncTime: string | null
  sessionExpired: boolean
  sessionExpiredMessage: string | null
  disabledPages: { page: string; reason: string }[]
}

interface AuthContextType extends AuthState {
  login: (
    token: string,
    section?: string,
    batch?: string,
    autoSync?: boolean,
    options?: { silent?: boolean },
  ) => Promise<void>
  logout: () => Promise<void>
  refreshData: () => Promise<void>
  updateTimetableSettings: (section: string, batch: string) => Promise<void>
  dismissSessionExpired: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)
const AUTH_CACHE_KEY = "edutechsrm_auth_cache_v1"

const initialDataStatus: DataStatus = {
  user: "loading",
  attendance: "loading",
  timetable: "loading",
  courses: "loading",
  marks: "loading",
  calendar: "loading",
  circulars: "loading",
}

interface PersistedAuthSnapshot {
  user: SRMUser | null
  attendance: SRMAttendance[]
  timetable: SRMTimetableSlot[]
  timetableMetadata: TimetableMetadata | null
  courses: SRMCourse[]
  marks: SRMMarks[]
  calendar: SRMCalendarEvent[]
  circulars: SRMCircular[]
  dateToDoMap: Record<string, number>
  lastSyncTime: string | null
}

function getInitialOfflineState() {
  return typeof navigator !== "undefined" ? !navigator.onLine : false
}

function readPersistedSnapshot(): PersistedAuthSnapshot | null {
  if (typeof window === "undefined") return null

  try {
    const raw = localStorage.getItem(AUTH_CACHE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PersistedAuthSnapshot
  } catch {
    return null
  }
}

function writePersistedSnapshot(snapshot: PersistedAuthSnapshot) {
  if (typeof window === "undefined") return
  localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(snapshot))
}

function clearPersistedSnapshot() {
  if (typeof window === "undefined") return
  localStorage.removeItem(AUTH_CACHE_KEY)
  try { localStorage.removeItem("edutechsrm_photo_cache_v1") } catch {}
}

function buildDataStatusFromSnapshot(snapshot: PersistedAuthSnapshot): DataStatus {
  const hasUser = Boolean(snapshot.user)
  return {
    user: hasUser ? "success" : "error",
    attendance: hasUser ? "success" : "error",
    timetable: hasUser ? "success" : "error",
    courses: hasUser ? "success" : "error",
    marks: hasUser ? "success" : "error",
    calendar: hasUser ? "success" : "error",
    circulars: hasUser ? "success" : "error",
  }
}

function buildAuthenticatedStateFromSnapshot(
  token: string,
  snapshot: PersistedAuthSnapshot,
  overrides?: Partial<AuthState>,
): AuthState {
  return {
    isAuthenticated: true,
    isLoading: false,
    isLoginSyncing: false,
    isOffline: getInitialOfflineState(),
    isBackgroundSyncing: false,
    isManualRefresh: false,
    token,
    user: snapshot.user,
    attendance: snapshot.attendance || [],
    timetable: snapshot.timetable || [],
    timetableMetadata: snapshot.timetableMetadata || null,
    courses: snapshot.courses || [],
    marks: snapshot.marks || [],
    calendar: snapshot.calendar || [],
    circulars: snapshot.circulars || [],
    dateToDoMap: snapshot.dateToDoMap || {},
    dataStatus: buildDataStatusFromSnapshot(snapshot),
    lastSyncTime: snapshot.lastSyncTime,
    sessionExpired: false,
    sessionExpiredMessage: null,
    disabledPages: [],
    ...overrides,
  }
}

function createSignedOutState(message: string | null, sessionExpired: boolean): AuthState {
  return {
    isAuthenticated: false,
    isLoading: false,
    isLoginSyncing: false,
    isOffline: getInitialOfflineState(),
    isBackgroundSyncing: false,
    isManualRefresh: false,
    token: null,
    user: null,
    attendance: [],
    timetable: [],
    timetableMetadata: null,
    courses: [],
    marks: [],
    calendar: [],
    circulars: [],
    dateToDoMap: {},
    dataStatus: initialDataStatus,
    lastSyncTime: null,
    sessionExpired,
    sessionExpiredMessage: message,
    disabledPages: [],
  }
}

function isSessionExpiredError(err: unknown): boolean {
  if (!err) return false
  if (err instanceof SessionExpiredClientError) return true

  const message = err instanceof Error ? err.message : String(err)
  const lower = message.toLowerCase()
  return (
    lower.includes("session") ||
    lower.includes("expired") ||
    lower.includes("unauthorized") ||
    lower.includes("invalid token") ||
    lower.includes("401") ||
    lower.includes("sign in again") ||
    lower.includes("signed in on another")
  )
}

function extractSessionFailure(
  results: Array<PromiseSettledResult<unknown>>,
): SessionExpiredClientError | null {
  for (const result of results) {
    if (result.status === "rejected" && result.reason instanceof SessionExpiredClientError) {
      return result.reason
    }
  }

  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    ...createSignedOutState(null, false),
    isLoading: true,
  })

  const fetchDisabledPages = async () => {
    try {
      const res = await fetch("/api/disabled-pages", { cache: "no-store" })
      const data: Record<string, unknown> = await res.json()
      const pages = data?.pages
      if (Array.isArray(pages)) {
        setState((prev) => ({ ...prev, disabledPages: pages }))
      }
    } catch {
      // best effort
    }
  }

  useEffect(() => {
    const storedToken = localStorage.getItem("srm_token")
    const storedSection = localStorage.getItem("srm_section")
    const storedBatch = localStorage.getItem("srm_batch")
    const cachedSnapshot = storedToken ? readPersistedSnapshot() : null

    console.log("[AuthContext Init]", {
      hasToken: Boolean(storedToken),
      hasCachedSnapshot: Boolean(cachedSnapshot),
      cachedDataSummary: cachedSnapshot ? {
        userName: cachedSnapshot.user?.username,
        timetableSlots: cachedSnapshot.timetable?.length || 0,
        attendanceSubjects: cachedSnapshot.attendance?.length || 0,
        lastSyncTime: cachedSnapshot.lastSyncTime,
      } : null,
    })

    if (storedToken) {
      if (cachedSnapshot) {
        // Log cache info for debugging
        console.log("[AuthContext] Using cached snapshot from:", cachedSnapshot.lastSyncTime)
        setState((prev) => ({
          ...buildAuthenticatedStateFromSnapshot(storedToken, cachedSnapshot, {
            isOffline: getInitialOfflineState(),
            isBackgroundSyncing: !getInitialOfflineState(),
            isLoginSyncing: false,
            disabledPages: prev.disabledPages,
          }),
        }))
      } else {
        setState((prev) => ({
          ...prev,
          isAuthenticated: true,
          isLoading: false,
          isLoginSyncing: !getInitialOfflineState(),
          isOffline: getInitialOfflineState(),
          isBackgroundSyncing: false,
          token: storedToken,
          sessionExpired: false,
          sessionExpiredMessage: null,
        }))
      }

      if (!getInitialOfflineState()) {
        console.log("[AuthContext] Starting background sync...")
        // Always sync to ensure fresh data, even if cache exists
        void login(storedToken, storedSection || undefined, storedBatch || undefined, true, { silent: Boolean(cachedSnapshot) })
      }
    } else {
      setState((prev) => ({ ...prev, isLoading: false }))
    }

    void fetchDisabledPages()
  }, [])

  useEffect(() => {
    if (!state.isAuthenticated || !state.token || !state.user) {
      if (!state.isAuthenticated) {
        clearPersistedSnapshot()
      }
      return
    }

    writePersistedSnapshot({
      user: state.user,
      attendance: state.attendance,
      timetable: state.timetable,
      timetableMetadata: state.timetableMetadata,
      courses: state.courses,
      marks: state.marks,
      calendar: state.calendar,
      circulars: state.circulars,
      dateToDoMap: state.dateToDoMap,
      lastSyncTime: state.lastSyncTime,
    })
  }, [
    state.isAuthenticated,
    state.token,
    state.user,
    state.attendance,
    state.timetable,
    state.timetableMetadata,
    state.courses,
    state.marks,
    state.calendar,
    state.circulars,
    state.dateToDoMap,
    state.lastSyncTime,
  ])

  const forceSessionExpiry = (message = "Your session was replaced by a new sign-in. Please sign in again to continue.") => {
    localStorage.removeItem("srm_token")
    localStorage.removeItem("srm_section")
    localStorage.removeItem("srm_batch")
    clearPersistedSnapshot()
    try { localStorage.removeItem("edutechsrm_photo_cache_v1") } catch {}
    setState(createSignedOutState(message, true))
  }

  const login = async (
    token: string,
    section?: string,
    batch?: string,
    autoSync = false,
    options?: { silent?: boolean },
  ) => {
    const silent = options?.silent ?? false

    setState((prev) => ({
      ...prev,
      isLoading: silent ? prev.isLoading : true,
      isLoginSyncing: !silent,
      isBackgroundSyncing: silent,
      isOffline: getInitialOfflineState(),
      dataStatus: silent ? prev.dataStatus : initialDataStatus,
    }))

    try {
      localStorage.setItem("srm_token", token)

      if (autoSync) {
        await syncData(token).catch((error) => console.warn("[edutechsrm] Background sync failed:", error))
      }

      const hydrated = await fetchHydratedDashboard(token)
      // After fetchHydratedDashboard, a silent refresh may have updated localStorage.
      // Read the latest token to keep state.token in sync.
      const latestToken = localStorage.getItem("srm_token") || token

      if (!hydrated) {
        const cachedSnapshot = readPersistedSnapshot()
        if (cachedSnapshot) {
          setState((prev) => ({
            ...buildAuthenticatedStateFromSnapshot(latestToken, cachedSnapshot, {
              isOffline: getInitialOfflineState(),
              isLoading: false,
              isLoginSyncing: false,
              isBackgroundSyncing: false,
              disabledPages: prev.disabledPages,
            }),
          }))
          return
        }
        // Fresh login — hydrate failed but token is valid.
        // Don't sign out; let the user see the dashboard with a data-fetch error.
        setState((prev) => ({
          ...prev,
          isAuthenticated: true,
          isLoading: false,
          isLoginSyncing: false,
          isBackgroundSyncing: false,
          isOffline: getInitialOfflineState(),
          token: latestToken,
          user: null,
          attendance: [],
          timetable: [],
          timetableMetadata: null,
          courses: [],
          marks: [],
          calendar: [],
          circulars: [],
          dateToDoMap: {},
          lastSyncTime: null,
          sessionExpired: false,
          sessionExpiredMessage: null,
        }))
        return
      }

      setState((prev) => ({
        ...prev,
        isAuthenticated: true,
        isLoading: false,
        isLoginSyncing: false,
        isOffline: false,
        isBackgroundSyncing: false,
        token: latestToken,
        user: hydrated.user,
        attendance: hydrated.attendance,
        timetable: hydrated.timetable.timetable || [],
        timetableMetadata: {
          ...(hydrated.timetable.metadata || {}),
          dateTodayOrder: hydrated.timetable.dateTodayOrder || {},
        },
        courses: hydrated.courses,
        marks: hydrated.marks,
        calendar: hydrated.calendar.events || [],
        dateToDoMap: hydrated.calendar.dateToDoMap || {},
        circulars: hydrated.circulars,
        lastSyncTime: new Date().toISOString(),
        sessionExpired: false,
        sessionExpiredMessage: null,
        dataStatus: {
          user: "success",
          attendance: "success",
          timetable: "success",
          courses: "success",
          marks: "success",
          calendar: "success",
          circulars: "success",
        },
      }))
      // Download profile photo
      fetch("/api/srm/photo?force=1", { headers: { "x-access-token": token } }).catch(() => {})
    } catch (error) {
      console.error("[edutechsrm] Login error:", error)
      if (isSessionExpiredError(error)) {
        forceSessionExpiry(error instanceof Error ? error.message : undefined)
        return
      }
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isLoginSyncing: false,
        isBackgroundSyncing: false,
        isOffline: getInitialOfflineState(),
      }))
    }
  }

  const logout = async () => {
    const token = localStorage.getItem("srm_token")
    try {
      if (token) {
        await fetch("/api/logout", {
          method: "POST",
          headers: { "x-access-token": token },
        })
        // Delete cached profile photo
        await fetch("/api/srm/photo", { method: "DELETE" }).catch(() => {})
      }
    } catch {
      // local logout should still succeed even if the server call fails
    }

    localStorage.removeItem("srm_token")
    localStorage.removeItem("srm_section")
    localStorage.removeItem("srm_batch")
    clearPersistedSnapshot()
    setState(createSignedOutState(null, false))

    if (typeof window !== "undefined") {
      window.location.assign("/logged-out")
    }
  }

  const notifyAndroidRefreshComplete = () => {
    if (typeof window !== "undefined" && (window as any).Android?.onRefreshComplete) {
      (window as any).Android.onRefreshComplete()
    }
  }

  const runRefreshData = useCallback(async (options?: { silent?: boolean; tokenOverride?: string | null }) => {
    // Prefer the caller-provided token, then localStorage (which may have been
    // updated by a silent refresh), then the in-memory state.
    const activeToken = options?.tokenOverride ?? (typeof localStorage !== "undefined" ? localStorage.getItem("srm_token") : null) ?? state.token
    if (!activeToken) { notifyAndroidRefreshComplete(); return }
    const silent = options?.silent ?? Boolean(state.isAuthenticated && state.user)

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isLoginSyncing: false,
        isBackgroundSyncing: false,
        isManualRefresh: false,
        isOffline: true,
      }))
      notifyAndroidRefreshComplete()
      return
    }

    setState((prev) => ({
      ...prev,
      isLoading: silent ? prev.isLoading : true,
      isLoginSyncing: false,
      isBackgroundSyncing: silent,
      isOffline: getInitialOfflineState(),
      dataStatus: silent ? prev.dataStatus : initialDataStatus,
    }))

    try {
      // Read the freshest token from localStorage BEFORE making any API call,
      // since a previous refresh cycle (e.g. during syncData) may have rotated it.
      const tokenAfterSync = typeof localStorage !== "undefined" ? localStorage.getItem("srm_token") : null
      const freshToken = tokenAfterSync || activeToken

      const syncResult = await syncData(freshToken)
      if (!syncResult.success && syncResult.reason === "session_expired") {
        forceSessionExpiry(syncResult.error || "Your SRM session was replaced elsewhere. Please sign in again.")
        return
      }

      if (!syncResult.success && syncResult.reason === "network") {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isLoginSyncing: false,
          isBackgroundSyncing: false,
          isManualRefresh: false,
          isOffline: true,
        }))
        return
      }

      // Re-read token after syncData in case it triggered a silent refresh
      const tokenAfterHydrate = typeof localStorage !== "undefined" ? localStorage.getItem("srm_token") : null
      const freshToken2 = tokenAfterHydrate || freshToken
      const hydrated = await fetchHydratedDashboard(freshToken2)
      // Silent refresh may have rotated the token again — read the latest from localStorage
      const latestToken = typeof localStorage !== "undefined" ? localStorage.getItem("srm_token") : null

      if (!hydrated) {
        const cachedSnapshot = readPersistedSnapshot()
        if (cachedSnapshot) {
          setState((prev) => ({
            ...buildAuthenticatedStateFromSnapshot(latestToken || activeToken, cachedSnapshot, {
              isOffline: getInitialOfflineState(),
              isLoading: false,
              isLoginSyncing: false,
              isBackgroundSyncing: false,
              disabledPages: prev.disabledPages,
            }),
          }))
        } else if (!state.user) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            isLoginSyncing: false,
            isBackgroundSyncing: false,
            isManualRefresh: false,
            isOffline: getInitialOfflineState(),
          }))
        } else {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            isLoginSyncing: false,
            isBackgroundSyncing: false,
            isManualRefresh: false,
            isOffline: getInitialOfflineState(),
          }))
        }
        return
      }

      setState((prev) => ({
        ...prev,
        isLoading: false,
        isLoginSyncing: false,
        isOffline: false,
        isBackgroundSyncing: false,
        isManualRefresh: false,
        token: latestToken || activeToken,
        user: hydrated.user,
        attendance: hydrated.attendance,
        timetable: hydrated.timetable.timetable || [],
        timetableMetadata: {
          ...(hydrated.timetable.metadata || {}),
          dateTodayOrder: hydrated.timetable.dateTodayOrder || {},
        },
        courses: hydrated.courses,
        marks: hydrated.marks,
        calendar: hydrated.calendar.events || [],
        dateToDoMap: hydrated.calendar.dateToDoMap || {},
        circulars: hydrated.circulars,
        lastSyncTime: new Date().toISOString(),
        sessionExpired: false,
        sessionExpiredMessage: null,
        dataStatus: {
          user: "success",
          attendance: "success",
          timetable: "success",
          courses: "success",
          marks: "success",
          calendar: "success",
          circulars: "success",
        },
      }))
    } catch (error) {
      console.error("[edutechsrm] Refresh error:", error)
      if (isSessionExpiredError(error)) {
        forceSessionExpiry(error instanceof Error ? error.message : undefined)
        return
      }
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isLoginSyncing: false,
        isBackgroundSyncing: false,
        isManualRefresh: false,
        isOffline: getInitialOfflineState(),
      }))
    } finally {
      notifyAndroidRefreshComplete()
    }
  }, [state.token, state.isAuthenticated, state.user])

  useEffect(() => {
    const handleOffline = () => {
      setState((prev) => ({
        ...prev,
        isOffline: true,
        isLoading: false,
        isLoginSyncing: false,
        isBackgroundSyncing: false,
      }))
    }

    const handleOnline = () => {
      setState((prev) => ({ ...prev, isOffline: false }))

      const storedToken = localStorage.getItem("srm_token")
      if (!storedToken) return

      void runRefreshData({ silent: true, tokenOverride: storedToken })
    }

    // Tab visibility listener: Refresh data when user returns to this tab
    // This fixes the stale cache issue when switching between browser tabs
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && navigator.onLine) {
        console.log("[AuthContext] Tab became visible, refreshing data...")
        const storedToken = localStorage.getItem("srm_token")
        if (storedToken && state.isAuthenticated) {
          void runRefreshData({ silent: true, tokenOverride: storedToken })
        }
      }
    }

    // Periodic heartbeat: refresh every 90 minutes to keep the session alive
    // and prevent silent expiry when the user leaves the tab open for hours.
    const HEARTBEAT_MS = 90 * 60 * 1000
    const heartbeatId = setInterval(() => {
      const storedToken = localStorage.getItem("srm_token")
      if (storedToken && state.isAuthenticated && navigator.onLine) {
        console.log("[AuthContext] Heartbeat — refreshing data to keep session alive")
        void runRefreshData({ silent: true, tokenOverride: storedToken })
      }
    }, HEARTBEAT_MS)

    const handlePullToRefresh = () => {
      console.log("[AuthContext] Pull-to-refresh triggered from native app")
      const storedToken = localStorage.getItem("srm_token")
      if (storedToken && state.isAuthenticated) {
        void runRefreshData({ silent: false })
      }
    }

    window.addEventListener("offline", handleOffline)
    window.addEventListener("online", handleOnline)
    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("app:pulltorefresh", handlePullToRefresh)
    
    return () => {
      clearInterval(heartbeatId)
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("online", handleOnline)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("app:pulltorefresh", handlePullToRefresh)
    }
  }, [runRefreshData, state.isAuthenticated])

  const refreshData = useCallback(() => {
    setState((prev) => ({ ...prev, isManualRefresh: true }))
    return runRefreshData()
  }, [runRefreshData])

  const updateTimetableSettings = async (section: string, batch: string) => {
    // Use the freshest token available — a silent refresh may have updated localStorage
    const activeToken = typeof localStorage !== "undefined" ? localStorage.getItem("srm_token") : null
    if (!activeToken) return

    setState((prev) => ({ ...prev, isLoading: true, isLoginSyncing: false }))

    localStorage.setItem("srm_section", section)
    localStorage.setItem("srm_batch", batch)

    try {
      const timetableData = await fetchTimetable(activeToken, section, batch)

      setState((prev) => ({
        ...prev,
        isLoading: false,
        isLoginSyncing: false,
        timetable: timetableData?.timetable || [],
        timetableMetadata: timetableData?.metadata || null,
        sessionExpiredMessage: null,
        dataStatus: {
          ...prev.dataStatus,
          timetable: timetableData?.timetable?.length ? "success" : "error",
        },
      }))
    } catch (error) {
      console.error("[edutechsrm] Update timetable error:", error)
      if (isSessionExpiredError(error)) {
        forceSessionExpiry(error instanceof Error ? error.message : undefined)
        return
      }
      setState((prev) => ({ ...prev, isLoading: false, isLoginSyncing: false, isOffline: getInitialOfflineState() }))
    }
  }

  const dismissSessionExpired = useCallback(() => {
    setState((prev) => ({ ...prev, sessionExpired: false, sessionExpiredMessage: null }))
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshData, updateTimetableSettings, dismissSessionExpired }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
