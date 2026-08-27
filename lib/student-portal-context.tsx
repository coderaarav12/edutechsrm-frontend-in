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
}

export interface UnifiedSubjectRecord {
  code: string
  name: string
  attendance?: {
    attended: number
    total: number
    percentage: number
  }
  internalMarks?: {
    markObtained: number | null
    maxMark: number | null
    rawText: string
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
  fetchCaptcha: (sessionId?: string) => Promise<{ success: boolean; sessionId?: string; captchaImage?: string; error?: string }>
  loginPortal: (netId: string, pass: string, captcha: string, sessionId: string) => Promise<{ success: boolean; error?: string; requiresCaptcha?: boolean; captchaImage?: string; sessionId?: string }>
  syncPortalData: (options?: { forceRefresh?: boolean }) => Promise<boolean>
  disconnectPortal: () => void
}

const StudentPortalContext = createContext<StudentPortalContextType | null>(null)

const CACHE_KEY = "edutechsrm_student_portal_cache_v2"
const CREDS_KEY = "edutechsrm_student_portal_creds_v2"
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

function clearPortalStorage() {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(CACHE_KEY)
    localStorage.removeItem(CREDS_KEY)
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

  const isPortalConnected = useMemo(() => {
    return Boolean(portalData && (portalData.marks?.semesters?.length || portalData.attendance?.length))
  }, [portalData])

  // Load cache on mount
  useEffect(() => {
    const cached = readCachedPortalData()
    if (cached) {
      setPortalData(cached)
    }
  }, [])

  // Auto prompt popup on login if user is authenticated but not yet connected to student portal
  useEffect(() => {
    if (typeof window === "undefined") return
    if (!isAuthenticated) return

    const cached = readCachedPortalData()
    if (!cached || (!cached.marks?.semesters?.length && !cached.attendance?.length)) {
      const dismissed = localStorage.getItem(PORTAL_POPUP_DISMISSED_KEY)
      if (!dismissed) {
        const timer = setTimeout(() => {
          setIsLoginModalOpen(true)
        }, 2200)
        return () => clearTimeout(timer)
      }
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
      try { localStorage.setItem(PORTAL_POPUP_DISMISSED_KEY, "1") } catch {}
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
      const res = await fetch(url.toString(), { cache: "no-store" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.success) {
        return { success: false, error: data?.error || "Failed to fetch captcha from portal scraper" }
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
          body: JSON.stringify({
            netId: netId.trim().toLowerCase(),
            password: pass,
            captcha: captcha.trim(),
            sessionId,
          }),
        })

        const data = await res.json().catch(() => ({}))
        if (!res.ok || !data.success) {
          return {
            success: false,
            error: data?.error || "Student portal authentication failed",
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
        if (typeof window !== "undefined") {
          if (finalSessionId) {
            localStorage.setItem("edutechsrm_student_portal_session_id", finalSessionId)
          }
        }
        writeStoredCredentials({
          netId: netId.trim().toLowerCase(),
          password: pass,
          savedAt: new Date().toISOString(),
        })

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

  const syncPortalData = useCallback(
    async (options?: { forceRefresh?: boolean }) => {
      const cached = readCachedPortalData()
      if (cached) {
        setPortalData(cached)
      }

      const storedSessionId = typeof window !== "undefined"
        ? localStorage.getItem("edutechsrm_student_portal_session_id") || ""
        : ""

      if (!storedSessionId) {
        // No active session token found - session is stale/expired
        if (cached) {
          setIsSessionExpired(true)
        }
        return false
      }

      setIsSyncing(true)
      try {
        const query = `?sessionId=${encodeURIComponent(storedSessionId)}`
        const attRes = await fetch(`/api/student-portal/attendance${query}`, { cache: "no-store" }).catch(() => null)
        const marksRes = await fetch(`/api/student-portal/marks${query}`, { cache: "no-store" }).catch(() => null)
        const intRes = await fetch(`/api/student-portal/internal-marks${query}`, { cache: "no-store" }).catch(() => null)

        if (
          attRes?.status === 401 ||
          marksRes?.status === 401 ||
          intRes?.status === 401 ||
          attRes?.status === 404 ||
          marksRes?.status === 404
        ) {
          setIsSessionExpired(true)
          return false
        }

        if (attRes?.ok && marksRes?.ok) {
          const attData = await attRes.json().catch(() => ({}))
          const marksData = await marksRes.json().catch(() => ({}))
          const intData = intRes?.ok ? await intRes.json().catch(() => ({})) : { internalMarks: [] }

          if (attData?.sessionExpired || marksData?.sessionExpired || !attData?.success) {
            setIsSessionExpired(true)
            return false
          }

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
    []
  )

  const disconnectPortal = useCallback(() => {
    clearPortalStorage()
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
