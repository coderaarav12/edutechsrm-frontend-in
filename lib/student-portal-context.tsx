"use client"

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from "react"
import { useAuth } from "@/lib/auth-context"

export interface PortalAttendanceRow {
  code: string
  name: string
  attended: number
  total: number
  percentage: number
  category?: string
  slot?: string
}

export interface GradeCourse {
  semester: number
  monthYear: string
  code: string
  name: string
  credit: number
  grade: string
}

export interface SemesterGradeSummary {
  semester: number
  sgpa: number
  courses: GradeCourse[]
}

export interface MarksReport {
  cgpa: number
  creditsEarned: number
  creditsRegistered: number
  creditsRequired: number
  semesters: SemesterGradeSummary[]
}

export interface InternalMarkRow {
  code: string
  name: string
  markObtained: number | null
  maxMark: number | null
  rawMarkText: string
  subjectId?: string
  components?: {
    title: string
    markObtained: number
    maxMark: number
  }[]
}

export interface UnifiedSubjectRecord {
  code: string
  name: string
  category?: string
  attendance?: {
    attended: number
    total: number
    percentage: number
  }
  internalMarks?: {
    markObtained: number | null
    maxMark: number | null
    rawText: string
    components?: {
      title: string
      markObtained: number
      maxMark: number
    }[]
  }
}

export interface StudentPortalData {
  attendance: PortalAttendanceRow[]
  attendanceOutput?: string
  marks: MarksReport
  marksOutput?: string
  internalMarks: InternalMarkRow[]
  internalMarksOutput?: string
  unifiedSubjects: UnifiedSubjectRecord[]
  lastUpdated: string
}

interface StoredCredentials {
  netId: string
  password?: string
  savedAt: string
}

interface StudentPortalContextType {
  isPortalConnected: boolean
  isSessionExpired: boolean
  portalData: StudentPortalData | null
  isSyncing: boolean
  isLoginModalOpen: boolean
  isGradesModalOpen: boolean
  openPortalLogin: () => void
  closePortalLogin: () => void
  openGradesModal: () => void
  closeGradesModal: () => void
  fetchCaptcha: (sessionId?: string) => Promise<{ success: boolean; sessionId?: string; captchaImage?: string; error?: string; errorCode?: string }>
  loginPortal: (netId: string, pass: string, captcha: string, sessionId: string) => Promise<{ success: boolean; error?: string; errorCode?: string; requiresCaptcha?: boolean; captchaImage?: string; sessionId?: string }>
  syncPortalData: (options?: { forceRefresh?: boolean }) => Promise<boolean>
  disconnectPortal: () => void
}

const StudentPortalContext = createContext<StudentPortalContextType | null>(null)

const CACHE_KEY = "edutechsrm_student_portal_cache_v2"
const CREDS_KEY = "edutechsrm_student_portal_creds_v2"
const SESSION_KEY = "edutechsrm_student_portal_session_id"
const PORTAL_POPUP_DISMISSED_KEY = "edutechsrm_portal_popup_dismissed_v2"

function readCachedPortalData(): StudentPortalData | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StudentPortalData
  } catch {
    return null
  }
}

function writeCachedPortalData(data: StudentPortalData) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch {}
}

function readStoredCredentials(): StoredCredentials | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(CREDS_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredCredentials
  } catch {
    return null
  }
}

function writeStoredCredentials(creds: StoredCredentials) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(CREDS_KEY, JSON.stringify(creds))
  } catch {}
}

function readStoredSessionId(): string {
  if (typeof window === "undefined") return ""
  try {
    return localStorage.getItem(SESSION_KEY) || ""
  } catch {
    return ""
  }
}

function writeStoredSessionId(sessionId: string) {
  if (typeof window === "undefined" || !sessionId) return
  try {
    localStorage.setItem(SESSION_KEY, sessionId)
  } catch {}
}

function clearStoredSessionId() {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {}
}

async function readJson(response: Response | null): Promise<any> {
  if (!response) return {}
  return response.json().catch(() => ({}))
}

function clearPortalStorage() {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(CACHE_KEY)
    localStorage.removeItem(CREDS_KEY)
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(PORTAL_POPUP_DISMISSED_KEY)
  } catch {}
}

export function StudentPortalProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isBackgroundSyncing } = useAuth()
  const [portalData, setPortalData] = useState<StudentPortalData | null>(() => readCachedPortalData())
  const [isSessionExpired, setIsSessionExpired] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isGradesModalOpen, setIsGradesModalOpen] = useState(false)

  const [storedSessionId, setStoredSessionId] = useState(() => readStoredSessionId())

  const isPortalConnected = useMemo(() => {
    return Boolean(
      storedSessionId ||
      (portalData && (portalData.marks?.semesters?.length || portalData.attendance?.length))
    )
  }, [portalData, storedSessionId])

  // Load cache on mount
  useEffect(() => {
    const cached = readCachedPortalData()
    if (cached) {
      setPortalData(cached)
    }
  }, [])

  // On reload or app login, silently reuse the saved portal session. Do not open
  // the login modal unless the scraper explicitly reports SESSION_EXPIRED.
  useEffect(() => {
    if (typeof window === "undefined") return
    if (!isAuthenticated) return

    const sessionId = readStoredSessionId()
    setStoredSessionId(sessionId)
    if (sessionId) {
      void syncPortalData({ forceRefresh: false })
    }

    const handleLoginSuccess = () => {
      const currentSessionId = readStoredSessionId()
      setStoredSessionId(currentSessionId)
      if (currentSessionId) void syncPortalData({ forceRefresh: false })
    }

    const handlePortalLogout = () => disconnectPortal()

    window.addEventListener("edutechsrm:login-success", handleLoginSuccess)
    window.addEventListener("edutechsrm:portal-logout", handlePortalLogout)
    return () => {
      window.removeEventListener("edutechsrm:login-success", handleLoginSuccess)
      window.removeEventListener("edutechsrm:portal-logout", handlePortalLogout)
    }
  }, [isAuthenticated])

  // Hook into background sync: when main app syncs, resync student portal if credentials exist
  useEffect(() => {
    if (isBackgroundSyncing && isPortalConnected) {
      void syncPortalData({ forceRefresh: false })
    }
  }, [isBackgroundSyncing, isPortalConnected])

  const openPortalLogin = useCallback(() => {
    setIsLoginModalOpen(true)
  }, [])

  const closePortalLogin = useCallback(() => {
    setIsLoginModalOpen(false)
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("edutechsrm_portal_skipped_session", "1")
      } catch {}
    }
  }, [])

  const openGradesModal = useCallback(() => {
    setIsGradesModalOpen(true)
  }, [])

  const closeGradesModal = useCallback(() => {
    setIsGradesModalOpen(false)
  }, [])

  const fetchCaptcha = useCallback(async (sessionId?: string) => {
    try {
      const url = new URL("/api/student-portal/captcha", window.location.origin)
      if (sessionId) url.searchParams.set("sessionId", sessionId)
      const res = await fetch(url.toString(), { cache: "no-store", credentials: "include" })
      const data = await readJson(res)
      if (!res.ok || !data.success) {
        return { success: false, error: data?.error || "Failed to fetch captcha from portal scraper", errorCode: data?.errorCode }
      }
      if (data.sessionId) {
        writeStoredSessionId(data.sessionId)
        setStoredSessionId(data.sessionId)
      }
      return {
        success: true,
        sessionId: data.sessionId,
        captchaImage: data.captchaImage || data.captchaDataUrl,
      }
    } catch (err: any) {
      return { success: false, error: err?.message || "Network error fetching captcha" }
    }
  }, [])

  const loginPortal = useCallback(
    async (netId: string, pass: string, captcha: string, sessionId: string) => {
      setIsSyncing(true)
      try {
        const res = await fetch("/api/student-portal/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            netId: netId.trim().toLowerCase(),
            password: pass,
            captcha: captcha.trim(),
            sessionId,
          }),
        })

        const data = await readJson(res)
        if (!res.ok || !data.success) {
          return {
            success: false,
            error: data?.error || "Student portal authentication failed",
            errorCode: data?.errorCode,
            requiresCaptcha: data?.requiresCaptcha,
            captchaImage: data?.captchaImage || data?.captchaDataUrl,
            sessionId: data?.sessionId || sessionId,
          }
        }

        const finalSessionId = data.sessionId || sessionId || ""
        const newPortalData: StudentPortalData = {
          attendance: data.attendance || [],
          attendanceOutput: data.attendanceOutput,
          marks: data.marks || { cgpa: 0, creditsEarned: 0, creditsRegistered: 0, creditsRequired: 0, semesters: [] },
          marksOutput: data.marksOutput,
          internalMarks: data.internalMarks || [],
          internalMarksOutput: data.internalMarksOutput,
          unifiedSubjects: data.unifiedSubjects || [],
          lastUpdated: new Date().toISOString(),
        }

        setPortalData(newPortalData)
        setIsSessionExpired(false)
        writeCachedPortalData(newPortalData)
        const cleanNetId = netId.trim().toLowerCase()
        if (typeof window !== "undefined") {
          if (finalSessionId) {
            writeStoredSessionId(finalSessionId)
            setStoredSessionId(finalSessionId)
          }
          if (cleanNetId && !/^ra\d/i.test(cleanNetId)) {
            localStorage.setItem("edutechsrm_netid", cleanNetId)
            localStorage.setItem("edutechsrm_srm_email", `${cleanNetId}@srmist.edu.in`)
          }
        }
        writeStoredCredentials({
          netId: cleanNetId,
          password: pass,
          savedAt: new Date().toISOString(),
        })

        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem("edutechsrm_portal_skipped_session", "1")
          } catch {}
        }

        setIsLoginModalOpen(false)
        return { success: true }
      } catch (err: any) {
        return { success: false, error: err?.message || "Network error logging into portal" }
      } finally {
        setIsSyncing(false)
      }
    },
    []
  )

  const markPortalSessionExpired = useCallback((stale?: Partial<StudentPortalData>) => {
    clearStoredSessionId()
    setStoredSessionId("")
    setIsSessionExpired(true)
    if (stale && portalData) {
      const merged: StudentPortalData = {
        ...portalData,
        attendance: (stale.attendance as PortalAttendanceRow[]) || portalData.attendance,
        attendanceOutput: stale.attendanceOutput || portalData.attendanceOutput,
        marks: (stale.marks as MarksReport) || portalData.marks,
        marksOutput: stale.marksOutput || portalData.marksOutput,
        internalMarks: (stale.internalMarks as InternalMarkRow[]) || portalData.internalMarks,
        internalMarksOutput: stale.internalMarksOutput || portalData.internalMarksOutput,
        unifiedSubjects: (stale.unifiedSubjects as UnifiedSubjectRecord[]) || portalData.unifiedSubjects,
      }
      setPortalData(merged)
      writeCachedPortalData(merged)
    }
    setIsLoginModalOpen(true)
  }, [portalData])

  const syncPortalData = useCallback(
    async (options?: { forceRefresh?: boolean }) => {
      const cached = readCachedPortalData()
      if (cached) {
        setPortalData(cached)
      }

      const activeSessionId = readStoredSessionId()
      setStoredSessionId(activeSessionId)

      if (!activeSessionId) {
        if (options?.forceRefresh) {
          setIsLoginModalOpen(true)
        }
        return false
      }

      setIsSyncing(true)
      try {
        const query = `?sessionId=${encodeURIComponent(activeSessionId)}`
        const requestInit: RequestInit = { cache: "no-store", credentials: "include" }
        const attRes = await fetch(`/api/student-portal/attendance${query}`, requestInit).catch(() => null)
        const attData = await readJson(attRes)

        if (attRes?.status === 401 || attData?.sessionExpired || attData?.errorCode === "SESSION_EXPIRED") {
          markPortalSessionExpired(attData)
          return false
        }

        const marksRes = await fetch(`/api/student-portal/marks${query}`, requestInit).catch(() => null)
        const marksData = await readJson(marksRes)

        if (marksRes?.status === 401 || marksData?.sessionExpired || marksData?.errorCode === "SESSION_EXPIRED") {
          markPortalSessionExpired({ ...attData, ...marksData })
          return false
        }

        const intRes = await fetch(`/api/student-portal/internal-marks${query}`, requestInit).catch(() => null)
        const intData = intRes?.ok ? await readJson(intRes) : {}

        if (intRes?.status === 401 || intData?.sessionExpired || intData?.errorCode === "SESSION_EXPIRED") {
          markPortalSessionExpired({ ...attData, ...marksData, ...intData })
          return false
        }

        if (attRes?.ok && marksRes?.ok && attData?.success && marksData?.success) {
          const updated: StudentPortalData = {
            attendance: attData.attendance || cached?.attendance || [],
            attendanceOutput: attData.attendanceOutput,
            marks: marksData.marks || cached?.marks || { cgpa: 0, creditsEarned: 0, creditsRegistered: 0, creditsRequired: 0, semesters: [] },
            marksOutput: marksData.marksOutput,
            internalMarks: intData.internalMarks || cached?.internalMarks || [],
            internalMarksOutput: intData.internalMarksOutput,
            unifiedSubjects: intData.unifiedSubjects || cached?.unifiedSubjects || [],
            lastUpdated: new Date().toISOString(),
          }

          setPortalData(updated)
          setIsSessionExpired(false)
          writeCachedPortalData(updated)
          return true
        }

        return false
      } catch {
        return false
      } finally {
        setIsSyncing(false)
      }
    },
    [markPortalSessionExpired]
  )

  const disconnectPortal = useCallback(async () => {
    const sessionId = readStoredSessionId()
    if (sessionId) {
      fetch("/api/student-portal/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sessionId }),
      }).catch(() => {})
    }
    clearPortalStorage()
    setStoredSessionId("")
    setPortalData(null)
    setIsSessionExpired(false)
  }, [])

  return (
    <StudentPortalContext.Provider
      value={{
        isPortalConnected,
        isSessionExpired,
        portalData,
        isSyncing,
        isLoginModalOpen,
        isGradesModalOpen,
        openPortalLogin,
        closePortalLogin,
        openGradesModal,
        closeGradesModal,
        fetchCaptcha,
        loginPortal,
        syncPortalData,
        disconnectPortal,
      }}
    >
      {children}
    </StudentPortalContext.Provider>
  )
}

export function useStudentPortal() {
  const context = useContext(StudentPortalContext)
  if (!context) {
    throw new Error("useStudentPortal must be used within a StudentPortalProvider")
  }
  return context
}
