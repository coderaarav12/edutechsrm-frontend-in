import type { Metadata } from "next"
import { LandingPage } from "@/components/landing-page"

export const metadata: Metadata = {
  title: "Home",
  description:
    "Free SRMIST KTR student dashboard — track timetable, attendance, internal marks, CGPA, assignments and academic calendar. Live data from SRM Academia in one place.",
}

export default function HomePage() {
  return <LandingPage />
}
