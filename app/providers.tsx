"use client"

import { type ReactNode } from "react"
import { AuthProvider } from "@/lib/auth-context"
import { StudentPortalProvider } from "@/lib/student-portal-context"
import { AdminControlProvider } from "@/lib/admin-control"
import { ThemeProvider } from "@/lib/theme-context"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <StudentPortalProvider>
        <AdminControlProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AdminControlProvider>
      </StudentPortalProvider>
    </AuthProvider>
  )
}
