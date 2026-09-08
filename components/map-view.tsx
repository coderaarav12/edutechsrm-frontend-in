"use client"

import { useMemo, useState } from "react"
import type { Building } from "@/lib/campus-data"

interface MapViewProps {
  buildings: Building[]
  selectedId: number | null
  userPos: { lat: number; lng: number } | null
  onSelect?: (id: number) => void
}

const CAMPUS_LAT = 12.8236
const CAMPUS_LNG = 80.0442

function embedUrl(lat: number, lng: number, zoom: number, type: "roadmap" | "satellite"): string {
  const t = type === "satellite" ? "k" : "m"
  return `https://www.google.com/maps?q=${lat},${lng}&z=${zoom}&t=${t}&output=embed`
}

export default function MapView({ buildings, selectedId }: MapViewProps) {
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap")
  const selected = useMemo(
    () => buildings.find((b) => b.id === selectedId) ?? null,
    [buildings, selectedId],
  )

  const src = selected
    ? embedUrl(selected.lat, selected.lng, 17, mapType)
    : embedUrl(CAMPUS_LAT, CAMPUS_LNG, 16, mapType)

  return (
    <div className="w-full h-full relative" style={{ position: "absolute", inset: 0, zIndex: 1, background: "#0f172a" }}>
      <iframe
        key={`${src}-${mapType}`}
        title={selected ? `Google Maps — ${selected.name}` : "Google Maps — SRM Kattankulathur Campus"}
        src={src}
        className="w-full h-full border-0"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        style={{ display: "block" }}
      />
      {/* Map / Satellite Switcher Overlay */}
      <div className="absolute top-3 right-3 z-10 flex rounded-full border border-black/40 bg-black/80 p-0.5 backdrop-blur-md shadow-lg">
        <button
          type="button"
          onClick={() => setMapType("roadmap")}
          className={`rounded-full px-2.5 py-1 text-[10px] font-mono transition ${
            mapType === "roadmap"
              ? "bg-emerald-400/25 text-emerald-300 font-bold"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Map
        </button>
        <button
          type="button"
          onClick={() => setMapType("satellite")}
          className={`rounded-full px-2.5 py-1 text-[10px] font-mono transition ${
            mapType === "satellite"
              ? "bg-emerald-400/25 text-emerald-300 font-bold"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Satellite
        </button>
      </div>
    </div>
  )
}

