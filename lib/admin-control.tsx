"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { DEFAULT_ANNOUNCEMENTS, type Announcement, type AnnouncementType } from "@/components/announcements"
import { APP_RUNTIME_VERSION, LIVE_RUNTIME_POLL_MS } from "@/lib/runtime-version"

interface MaintenanceState {
  enabled: boolean
  message: string
  updatedAt: string | null
}

interface AdminLogItem {
  id: string
  username: string
  outcome: "success" | "failed" | "cached" | "warning"
  source: "login" | "scrape"
  page?: string
  message?: string
  timestamp: string
}

interface AdminAnalytics {
  totalVisits: number
  loginSuccessCount: number
  loginFailureCount: number
  activeSessionCount: number
  lastUpdated: string | null
  logs: AdminLogItem[]
}

interface AdminControlContextValue {
  isManagerOpen: boolean
  isAdminAuthenticated: boolean
  isApplyingUpdate: boolean
  adminLoading: boolean
  maintenance: MaintenanceState
  analytics: AdminAnalytics
  announcements: Announcement[]
  disabledPages: { page: string; reason: string }[]
  feedback: any[]
  payments: any[]
  fetchPayments: () => Promise<void>
  openManager: () => void
  closeManager: () => void
  adminLogin: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  adminLogout: () => Promise<void>
  refreshAdminStatus: () => Promise<void>
  refreshAnnouncements: () => Promise<void>
  fetchDisabledPages: () => Promise<void>
  fetchFeedback: () => Promise<void>
  logoutAllUsers: () => Promise<{ success: boolean; error?: string; deletedCount?: number }>
  logoutUser: (username: string) => Promise<{ success: boolean; error?: string; deletedCount?: number; matchedUsers?: string[] }>
  setMaintenanceMode: (enabled: boolean, message: string) => Promise<{ success: boolean; error?: string }>
  addAnnouncement: (type: AnnouncementType, title: string, body: string) => Promise<{ success: boolean; error?: string }>
  deleteAnnouncement: (id: number) => Promise<{ success: boolean; error?: string }>
  addDisabledPage: (page: string, reason: string) => Promise<{ success: boolean; error?: string }>
  removeDisabledPage: (page: string) => Promise<{ success: boolean; error?: string }>
}

type LooseJson = Record<string, any>

const STORAGE_KEY = "edutechsrm_admin_token"
const V2_ANNOUNCEMENT_CUTOFF = "2026-05-20"

function sanitizeAnnouncements(list: Announcement[] | null | undefined): Announcement[] {
  if (!Array.isArray(list)) return []
  return list.filter((item) => item && typeof item.date === "string" && item.date >= V2_ANNOUNCEMENT_CUTOFF)
}

const AdminControlContext = createContext<AdminControlContextValue | null>(null)

export function AdminControlProvider({ children }: { children: ReactNode }) {
  const [isManagerOpen, setIsManagerOpen] = useState(false)
  const [adminToken, setAdminToken] = useState<string | null>(null)
  const [adminLoading, setAdminLoading] = useState(false)
  const [isApplyingUpdate, setIsApplyingUpdate] = useState(false)
  const [maintenance, setMaintenance] = useState<MaintenanceState>({
    enabled: false,
    message: "",
    updatedAt: null,
  })
  const [analytics, setAnalytics] = useState<AdminAnalytics>({
    totalVisits: 0,
    loginSuccessCount: 0,
    loginFailureCount: 0,
    activeSessionCount: 0,
    lastUpdated: null,
    logs: [],
  })
  const [announcements, setAnnouncements] = useState<Announcement[]>(DEFAULT_ANNOUNCEMENTS)
  const [disabledPages, setDisabledPages] = useState<{ page: string; reason: string }[]>([])
  const [feedback, setFeedback] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const updateReloadStartedRef = useRef(false)
  const pageLoadTimeRef = useRef(Date.now())
  const RELOAD_ATTEMPT_KEY = "edutechsrm_reload_attempts"

  const applyMaintenanceState = useCallback((data: LooseJson | null | undefined) => {
    setMaintenance({
      enabled: Boolean(data?.enabled),
      message: typeof data?.message === "string" ? data.message : "",
      updatedAt: typeof data?.updatedAt === "string" ? data.updatedAt : null,
    })
  }, [])

  const triggerLiveReload = useCallback((nextVersion: string) => {
    if (updateReloadStartedRef.current) {
      return
    }

    // Don't auto-reload within the first 30 seconds after page load
    // to avoid interfering with login or initial data fetching
    if (Date.now() - pageLoadTimeRef.current < 30_000) {
      return
    }

    // Prevent infinite reload loop: track attempts in sessionStorage
    try {
      const attempts = JSON.parse(sessionStorage.getItem(RELOAD_ATTEMPT_KEY) || "{}")
      if (attempts[nextVersion] && attempts[nextVersion] >= 2) {
        console.info(`[edutechsrm] Already attempted reload for version ${nextVersion} ${attempts[nextVersion]}x. Skipping.`)
        return
      }
      attempts[nextVersion] = (attempts[nextVersion] || 0) + 1
      sessionStorage.setItem(RELOAD_ATTEMPT_KEY, JSON.stringify(attempts))
    } catch {}

    updateReloadStartedRef.current = true
    setIsApplyingUpdate(true)
    console.info(`[edutechsrm] New runtime version detected (${nextVersion}). Reloading automatically.`)
    window.setTimeout(() => {
      window.location.reload()
    }, 1200)
  }, [])

  const loadRuntimeState = useCallback(async () => {
    try {
      const response = await fetch("/api/runtime", { cache: "no-store" })
      const data = await response.json() as LooseJson
      applyMaintenanceState(data?.maintenance)

      if (
        typeof data?.version === "string" &&
        data.version.trim() &&
        data.version !== APP_RUNTIME_VERSION
      ) {
        triggerLiveReload(data.version)
      }
    } catch {
      setMaintenance((prev) => prev)
    }
  }, [applyMaintenanceState, triggerLiveReload])

  const refreshAdminStatus = useCallback(async () => {
    const token = localStorage.getItem(STORAGE_KEY)
    if (!token) {
      setAdminToken(null)
      return
    }

    try {
      const response = await fetch("/api/admin/status", {
        headers: { "x-admin-token": token },
      })

      if (!response.ok) {
        localStorage.removeItem(STORAGE_KEY)
        setAdminToken(null)
        return
      }

      const data = await response.json() as LooseJson
      setAdminToken(token)
      if (data?.maintenance) {
        applyMaintenanceState(data.maintenance)
      }
      if (data?.analytics) {
        setAnalytics({
          totalVisits: Number(data.analytics.totalVisits || 0),
          loginSuccessCount: Number(data.analytics.loginSuccessCount || 0),
          loginFailureCount: Number(data.analytics.loginFailureCount || 0),
          activeSessionCount: Number(data.analytics.activeSessionCount || 0),
          lastUpdated: data.analytics.lastUpdated || null,
          logs: Array.isArray(data.analytics.logs) ? data.analytics.logs : [],
        })
      }
    } catch {
      setAdminToken(null)
    }
  }, [applyMaintenanceState])

  const refreshAnnouncements = useCallback(async () => {
    try {
      const response = await fetch("/api/announcements", { cache: "no-store" })
      const data = await response.json() as LooseJson
      if (response.ok && Array.isArray(data?.announcements)) {
        const filtered = sanitizeAnnouncements(data.announcements)
        if (filtered.length > 0) {
          const backendIds = new Set(filtered.map((a: Announcement) => a.id))
          const extraDefaults = DEFAULT_ANNOUNCEMENTS.filter(a => !backendIds.has(a.id))
          setAnnouncements([...filtered, ...extraDefaults])
        } else {
          setAnnouncements(DEFAULT_ANNOUNCEMENTS)
        }
      }
    } catch {
      setAnnouncements((prev) => (prev.length > 0 ? prev : DEFAULT_ANNOUNCEMENTS))
    }
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setAdminToken(stored)
      void refreshAdminStatus()
    }

    void loadRuntimeState()
    void refreshAnnouncements()
  }, [loadRuntimeState, refreshAdminStatus, refreshAnnouncements])

  const fetchDisabledPages = useCallback(async () => {
    try {
      const response = await fetch("/api/disabled-pages", { cache: "no-store" })
      const data = await response.json() as LooseJson
      if (Array.isArray(data?.pages)) {
        setDisabledPages(data.pages)
      }
    } catch {
      // best effort
    }
  }, [])

  const fetchFeedback = useCallback(async () => {
    if (!adminToken) return
    try {
      const response = await fetch("/api/admin/feedback", {
        cache: "no-store",
        headers: { "x-admin-token": adminToken },
      })
      const data = await response.json() as LooseJson
      if (Array.isArray(data?.feedback)) {
        setFeedback(data.feedback)
      }
    } catch {
      // best effort
    }
  }, [adminToken])

  const fetchPayments = useCallback(async () => {
    if (!adminToken) return
    try {
      const response = await fetch("/api/admin/payments", {
        cache: "no-store",
        headers: { "x-admin-token": adminToken },
      })
      const data = await response.json() as LooseJson
      if (Array.isArray(data?.payments)) {
        setPayments(data.payments)
      }
    } catch {
      // best effort
    }
  }, [adminToken])

  useEffect(() => {
    void fetchDisabledPages()
    void fetchFeedback()
    void fetchPayments()
  }, [fetchDisabledPages, fetchFeedback, fetchPayments])

  useEffect(() => {
    const poll = () => {
      if (typeof navigator !== "undefined" && !navigator.onLine) return
      if (document.visibilityState !== "visible") return
      void loadRuntimeState()
    }

    const id = window.setInterval(poll, LIVE_RUNTIME_POLL_MS)
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        poll()
      }
    }
    const onFocus = () => poll()

    window.addEventListener("focus", onFocus)
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      window.clearInterval(id)
      window.removeEventListener("focus", onFocus)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [loadRuntimeState])

  useEffect(() => {
    const id = window.setInterval(() => {
      if (typeof navigator !== "undefined" && !navigator.onLine) return
      if (document.visibilityState !== "visible") return
      void refreshAnnouncements()
    }, 120000)
    return () => window.clearInterval(id)
  }, [refreshAnnouncements])

  useEffect(() => {
    if (!adminToken || !isManagerOpen) {
      return
    }

    const id = window.setInterval(() => {
      if (typeof navigator !== "undefined" && !navigator.onLine) return
      if (document.visibilityState !== "visible") return
      void refreshAdminStatus()
    }, 60000)
    return () => window.clearInterval(id)
  }, [adminToken, isManagerOpen, refreshAdminStatus])

  const adminLogin = useCallback(async (username: string, password: string) => {
    setAdminLoading(true)
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      const data = await response.json() as LooseJson
      if (!response.ok || !data?.token) {
        return { success: false, error: data?.error || "Admin login failed" }
      }

      localStorage.setItem(STORAGE_KEY, data.token)
      setAdminToken(data.token)
      if (data?.maintenance) {
        applyMaintenanceState(data.maintenance)
      }
      await refreshAdminStatus()
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Admin login failed" }
    } finally {
      setAdminLoading(false)
    }
  }, [applyMaintenanceState, refreshAdminStatus])

  const adminLogout = useCallback(async () => {
    const token = localStorage.getItem(STORAGE_KEY)
    if (token) {
      try {
        await fetch("/api/admin/logout", {
          method: "POST",
          headers: { "x-admin-token": token },
        })
      } catch {
        // best effort
      }
    }
    localStorage.removeItem(STORAGE_KEY)
    setAdminToken(null)
  }, [])

  const logoutAllUsers = useCallback(async () => {
    const token = localStorage.getItem(STORAGE_KEY)
    if (!token) return { success: false, error: "Admin session missing" }

    setAdminLoading(true)
    try {
      const response = await fetch("/api/admin/logout-all", {
        method: "POST",
        headers: { "x-admin-token": token },
      })
      const data = await response.json() as LooseJson
      if (!response.ok) return { success: false, error: data?.error || "Failed to logout users" }
      return { success: true, deletedCount: data?.deletedCount }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to logout users" }
    } finally {
      setAdminLoading(false)
    }
  }, [])

  const logoutUser = useCallback(async (username: string) => {
    const token = localStorage.getItem(STORAGE_KEY)
    if (!token) return { success: false, error: "Admin session missing" }

    setAdminLoading(true)
    try {
      const response = await fetch("/api/admin/logout-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify({ username }),
      })
      const data = await response.json() as LooseJson
      if (!response.ok) return { success: false, error: data?.error || "Failed to logout user" }
      return {
        success: true,
        deletedCount: data?.deletedCount,
        matchedUsers: Array.isArray(data?.matchedUsers) ? data.matchedUsers : [],
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to logout user" }
    } finally {
      setAdminLoading(false)
    }
  }, [])

  const setMaintenanceMode = useCallback(async (enabled: boolean, message: string) => {
    const token = localStorage.getItem(STORAGE_KEY)
    if (!token) return { success: false, error: "Admin session missing" }

    setAdminLoading(true)
    try {
      const response = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify({ enabled, message }),
      })
      const data = await response.json() as LooseJson
      if (!response.ok) return { success: false, error: data?.error || "Failed to update maintenance mode" }

      if (data?.maintenance) {
        applyMaintenanceState(data.maintenance)
      } else {
        await loadRuntimeState()
      }
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to update maintenance mode" }
    } finally {
      setAdminLoading(false)
    }
  }, [applyMaintenanceState, loadRuntimeState])

  const addAnnouncement = useCallback(async (type: AnnouncementType, title: string, body: string) => {
    const token = localStorage.getItem(STORAGE_KEY)
    if (!token) return { success: false, error: "Admin session missing" }

    setAdminLoading(true)
    try {
      const response = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify({ type, title, body }),
      })
      const data = await response.json() as LooseJson
      if (!response.ok) return { success: false, error: data?.error || "Failed to post announcement" }
      if (Array.isArray(data?.announcements)) {
        const filtered = sanitizeAnnouncements(data.announcements)
        setAnnouncements(filtered.length > 0 ? filtered : DEFAULT_ANNOUNCEMENTS)
      } else {
        await refreshAnnouncements()
      }
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to post announcement" }
    } finally {
      setAdminLoading(false)
    }
  }, [refreshAnnouncements])

  const deleteAnnouncement = useCallback(async (id: number) => {
    const token = localStorage.getItem(STORAGE_KEY)
    if (!token) return { success: false, error: "Admin session missing" }

    setAdminLoading(true)
    try {
      const response = await fetch("/api/admin/announcements", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify({ id }),
      })
      const data = await response.json() as LooseJson
      if (!response.ok) return { success: false, error: data?.error || "Failed to delete announcement" }
      if (Array.isArray(data?.announcements)) {
        const filtered = sanitizeAnnouncements(data.announcements)
        setAnnouncements(filtered.length > 0 ? filtered : DEFAULT_ANNOUNCEMENTS)
      } else {
        await refreshAnnouncements()
      }
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to delete announcement" }
    } finally {
      setAdminLoading(false)
    }
  }, [refreshAnnouncements])

  const addDisabledPage = useCallback(async (page: string, reason: string) => {
    const token = localStorage.getItem(STORAGE_KEY)
    if (!token) return { success: false, error: "Admin session missing" }

    setAdminLoading(true)
    try {
      const response = await fetch("/api/admin/disabled-pages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify({ page, reason }),
      })
      const data = await response.json() as LooseJson
      if (!response.ok) return { success: false, error: data?.error || "Failed to disable page" }
      if (Array.isArray(data?.pages)) {
        setDisabledPages(data.pages)
      }
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to disable page" }
    } finally {
      setAdminLoading(false)
    }
  }, [])

  const removeDisabledPage = useCallback(async (page: string) => {
    const token = localStorage.getItem(STORAGE_KEY)
    if (!token) return { success: false, error: "Admin session missing" }

    setAdminLoading(true)
    try {
      const response = await fetch("/api/admin/disabled-pages", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify({ page }),
      })
      const data = await response.json() as LooseJson
      if (!response.ok) return { success: false, error: data?.error || "Failed to re-enable page" }
      if (Array.isArray(data?.pages)) {
        setDisabledPages(data.pages)
      }
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to re-enable page" }
    } finally {
      setAdminLoading(false)
    }
  }, [])

  const value = useMemo<AdminControlContextValue>(() => ({
    isManagerOpen,
    isAdminAuthenticated: Boolean(adminToken),
    isApplyingUpdate,
    adminLoading,
    maintenance,
    analytics,
    announcements,
    disabledPages,
    openManager: () => setIsManagerOpen(true),
    closeManager: () => setIsManagerOpen(false),
    adminLogin,
    adminLogout,
    refreshAdminStatus,
    refreshAnnouncements,
    fetchDisabledPages,
    logoutAllUsers,
    logoutUser,
    setMaintenanceMode,
    addAnnouncement,
    deleteAnnouncement,
    addDisabledPage,
    removeDisabledPage,
    feedback,
    fetchFeedback,
    payments,
    fetchPayments,
  }), [
    isManagerOpen,
    adminToken,
    isApplyingUpdate,
    adminLoading,
    maintenance,
    analytics,
    announcements,
    disabledPages,
    feedback,
    payments,
    adminLogin,
    adminLogout,
    refreshAdminStatus,
    refreshAnnouncements,
    fetchDisabledPages,
    fetchFeedback,
    fetchPayments,
    logoutAllUsers,
    logoutUser,
    setMaintenanceMode,
    addAnnouncement,
    deleteAnnouncement,
    addDisabledPage,
    removeDisabledPage,
  ])

  return <AdminControlContext.Provider value={value}>{children}</AdminControlContext.Provider>
}

export function useAdminControl() {
  const context = useContext(AdminControlContext)
  if (!context) {
    throw new Error("useAdminControl must be used within an AdminControlProvider")
  }
  return context
}
