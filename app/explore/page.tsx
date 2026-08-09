import type { Metadata } from "next"
import { Header } from "@/components/Header"
import { PublicFooter } from "@/components/public-footer"
import { CampusMapSection } from "@/components/campus-map-section"

export const metadata: Metadata = {
  title: "Explore SRM Campus Map",
  description:
    "Interactive SRM Kattankulathur campus map — academic blocks, hostels, food, transport, sports and facilities. Free to explore, no login needed.",
}

interface ExplorePageProps {
  searchParams: Promise<{ q?: string; cat?: string; b?: string }>
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams
  const buildingId = params.b ? Number(params.b) : null
  return (
    <>
      <Header />
      <main className="min-h-screen w-full text-zinc-50">
        <CampusMapSection
          standalone
          initialQuery={params.q ?? ""}
          initialCategory={(params.cat as never) || "all"}
          initialBuildingId={buildingId && !Number.isNaN(buildingId) ? buildingId : null}
        />
      </main>
      <PublicFooter />
    </>
  )
}
