"use client"

import { useEffect, useState } from "react"

const DASHBOARD_PREFS_KEY = "edutechsrm_dashboard_preferences"
const DASHBOARD_PREFS_EVENT = "edutechsrm:dashboard-preferences-updated"

export type DashboardQuickAccessId =
  | "marks"
  | "attendance"
  | "timetable"
  | "calendar"
  | "gradex"
  | "about"

export interface DashboardPreferences {
  mobileQuickAccess: DashboardQuickAccessId[]
  desktopQuickAccess: DashboardQuickAccessId[]
}

const DEFAULT_PREFERENCES: DashboardPreferences = {
  mobileQuickAccess: ["marks", "attendance", "timetable", "calendar"],
  desktopQuickAccess: ["marks", "attendance", "timetable", "calendar", "gradex"],
}

function readPreferences() {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES
  try {
    const raw = window.localStorage.getItem(DASHBOARD_PREFS_KEY)
    if (!raw) return DEFAULT_PREFERENCES
    return { ...DEFAULT_PREFERENCES, ...(JSON.parse(raw) as Partial<DashboardPreferences>) }
  } catch {
    return DEFAULT_PREFERENCES
  }
}

function writePreferences(value: DashboardPreferences) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(DASHBOARD_PREFS_KEY, JSON.stringify(value))
  window.dispatchEvent(new Event(DASHBOARD_PREFS_EVENT))
}

export function useDashboardPreferences() {
  const [preferences, setPreferences] = useState<DashboardPreferences>(DEFAULT_PREFERENCES)

  useEffect(() => {
    const sync = () => setPreferences(readPreferences())
    sync()
    window.addEventListener("storage", sync)
    window.addEventListener(DASHBOARD_PREFS_EVENT, sync)
    return () => {
      window.removeEventListener("storage", sync)
      window.removeEventListener(DASHBOARD_PREFS_EVENT, sync)
    }
  }, [])

  const updateProfile = (profile: keyof DashboardPreferences, ids: DashboardQuickAccessId[]) => {
    const next = { ...preferences, [profile]: ids }
    setPreferences(next)
    writePreferences(next)
  }

  const toggleQuickAccess = (
    profile: keyof DashboardPreferences,
    id: DashboardQuickAccessId,
    maxItems: number
  ) => {
    const current = preferences[profile]
    const next = current.includes(id)
      ? current.filter((item) => item !== id)
      : current.length >= maxItems
        ? [...current.slice(1), id]
        : [...current, id]
    updateProfile(profile, next)
  }

  return {
    preferences,
    updateProfile,
    toggleQuickAccess,
    defaultPreferences: DEFAULT_PREFERENCES,
  }
}
