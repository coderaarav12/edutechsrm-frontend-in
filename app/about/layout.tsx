import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about edutechsrm — the free SRMIST KTR student dashboard for timetable, attendance, internal marks, CGPA, assignments, and academic calendar. Built by a student, for students.",
  openGraph: {
    title: "About edutechsrm | SRMIST KTR student dashboard",
    description:
      "Learn about edutechsrm — the free SRMIST KTR student dashboard for timetable, attendance, internal marks, CGPA, assignments, and academic calendar.",
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
