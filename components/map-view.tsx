"use client"

import { useMemo } from "react"
import type { Building } from "@/lib/campus-data"

interface MapViewProps {
  buildings: Building[]
  selectedId: number | null
  userPos: { lat: number; lng: number } | null
  onSelect?: (id: number) => void
}

const CAMPUS_LAT = 12.8236
const CAMPUS_LNG = 80.0442

function embedUrl(lat: number, lng: number, zoom: number): string {
  // Free Google Maps embed — no API key required (output=embed)
  return `https://www.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`
}

export default function MapView({ buildings, selectedId }: MapViewProps) {
  const selected = useMemo(
    () => buildings.find((b) => b.id === selectedId) ?? null,
    [buildings, selectedId],
  )

  const src = selected
    ? embedUrl(selected.lat, selected.lng, 16)
    : embedUrl(CAMPUS_LAT, CAMPUS_LNG, 15)

  return (
    <div className="w-full h-full" style={{ position: "absolute", inset: 0, zIndex: 1, background: "#0f172a" }}>
      <iframe
        key={src}
        title={selected ? `Google Maps — ${selected.name}` : "Google Maps — SRM Kattankulathur Campus"}
        src={src}
        className="w-full h-full border-0"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        style={{ display: "block" }}
      />
    </div>
  )
}
