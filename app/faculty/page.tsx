import type { Metadata } from "next"
import { Header } from "@/components/Header"
import { PublicFooter } from "@/components/public-footer"
import { FinderSection } from "@/components/finder-section"

export const metadata: Metadata = {
  title: "Faculty Finder - SRMIST KTR",
  description:
    "Quickly locate staff rooms, faculty cabins, official emails, departments, and research specializations across SRMIST Kattankulathur. Zero login required.",
}

interface FacultyPageProps {
  searchParams: Promise<{ q?: string; dept?: string }>
}

export default async function FacultyPage({ searchParams }: FacultyPageProps) {
  const params = await searchParams
  return (
    <>
      <Header />
      <main className="min-h-screen w-full">
        <FinderSection
          standalone
          initialQuery={params.q ?? ""}
          initialDepartment={params.dept ?? "All"}
        />
      </main>
      <PublicFooter />
    </>
  )
}

