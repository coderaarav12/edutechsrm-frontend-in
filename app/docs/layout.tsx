import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Complete documentation for edutechsrm — learn how to track your SRMIST KTR timetable, attendance, internal marks, CGPA, and manage your academic dashboard.",
  openGraph: {
    title: "Documentation | edutechsrm — SRMIST KTR student dashboard",
    description:
      "Complete documentation for edutechsrm — learn how to track your SRMIST KTR timetable, attendance, internal marks, and CGPA.",
  },
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
