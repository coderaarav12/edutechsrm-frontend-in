"use client"

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react"
import { motion, AnimatePresence } from "framer-motion"
import dynamic from "next/dynamic"
import { Search, X, MapPin, Navigation, LocateFixed, Navigation2 } from "lucide-react"
import {
  BUILDINGS,
  CATEGORY_META,
  CATEGORY_ORDER,
  haversineDistance,
  formatDistance,
  getDirectionsUrl,
} from "@/lib/campus-data"
import type { Building, BuildingCategory } from "@/lib/campus-data"

const MapView = dynamic(() => import("@/components/map-view"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center" style={{ background: "rgba(9,9,11,0.6)" }}>
      <div className="flex flex-col items-center gap-2">
        <div className="w-5 h-5 rounded-full border-2 border-zinc-600 border-t-emerald-400 animate-spin" />
        <span className="text-xs" style={{ color: "#52525b" }}>Loading map…</span>
      </div>
    </div>
  ),
})

type CategoryFilter = BuildingCategory | "all"

const FILTERS: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "All" },
  ...CATEGORY_ORDER.map((c) => ({ id: c as CategoryFilter, label: CATEGORY_META[c].label })),
]

function getDirectionsUrlSafe(lat: number, lng: number) {
  try {
    return getDirectionsUrl(lat, lng)
  } catch {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
  }
}

type GroupKey = BuildingCategory | "nearest"

function regroupItems(items: Building[], nearest: boolean): { key: GroupKey; items: Building[] }[] {
  if (nearest) return items.length ? [{ key: "nearest", items }] : []
  return CATEGORY_ORDER.map((cat) => ({
    key: cat,
    items: items.filter((b) => b.category === cat),
  })).filter((g) => g.items.length > 0)
}

function groupLabel(key: GroupKey) {
  if (key === "nearest") return "Nearest to you"
  return CATEGORY_META[key].label
}

function groupColor(key: GroupKey) {
  if (key === "nearest") return "#34d399"
  return CATEGORY_META[key].color
}

function BuildingCard({ b, isSelected, bDist, onToggle }: {
  b: Building
  isSelected: boolean
  bDist: number | null
  onToggle: (id: number) => void
}) {
  return (
    <motion.button
      id={`building-${b.id}`}
      onClick={() => onToggle(b.id)}
      whileTap={{ scale: 0.98 }}
      aria-expanded={isSelected}
      className="w-full text-left rounded-2xl overflow-hidden transition-colors"
      style={{
        background: isSelected
          ? "linear-gradient(145deg, rgba(24,24,27,0.85), rgba(18,18,22,0.6))"
          : "linear-gradient(145deg, rgba(24,24,27,0.55), rgba(18,18,22,0.4))",
        border: isSelected ? `1px solid ${CATEGORY_META[b.category].color}40` : "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div className="p-3 flex items-center gap-3 min-h-[48px]">
        <div className="text-xl shrink-0">{b.icon}</div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold leading-snug text-zinc-100">{b.name}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-zinc-500 truncate">{b.shortDesc}</span>
            {bDist !== null && (
              <span className="text-[11px] font-semibold shrink-0" style={{ color: "#34d399" }}>
                {formatDistance(bDist)}
              </span>
            )}
          </div>
        </div>
        <motion.svg
          animate={{ rotate: isSelected ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="#71717a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className="shrink-0"
        >
          <polyline points="6 9 12 15 18 9" />
        </motion.svg>
      </div>
      <AnimatePresence initial={false}>
        {isSelected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-0">
              <div className="h-px mb-2" style={{ background: "linear-gradient(90deg, rgba(52,211,153,0.15), transparent)" }} />
              <p className="text-[11px] leading-relaxed text-zinc-400">{b.longDesc}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

function GroupHeader({ kind, count, open, onToggle }: { kind: GroupKey; count: number; open: boolean; onToggle: () => void }) {
  const color = groupColor(kind)
  return (
    <button
      onClick={onToggle}
      aria-expanded={open}
      className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl border transition-all active:scale-[0.98]"
      style={{
        background: open
          ? "linear-gradient(145deg, rgba(24,24,27,0.6), rgba(18,18,22,0.4))"
          : `linear-gradient(145deg, ${color}0d, rgba(18,18,22,0.35))`,
        border: open ? "1px solid rgba(255,255,255,0.06)" : `1px solid ${color}26`,
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ background: color, boxShadow: `0 0 8px ${color}80` }}
      />
      <span className="flex-1 min-w-0 text-left">
        <span className="block text-[12px] font-extrabold uppercase tracking-[0.12em] text-zinc-100">{groupLabel(kind)}</span>
        {!open && (
          <span className="block text-[10px] text-zinc-500 mt-0.5">
            {count} {count === 1 ? "location" : "locations"} — tap to expand
          </span>
        )}
      </span>
      <span
        className="shrink-0 min-w-[34px] px-2 py-1 rounded-lg text-[10px] font-bold text-center"
        style={{ background: `${color}1a`, color }}
      >
        {count}
      </span>
      <motion.svg
        animate={{ rotate: open ? 180 : 0 }}
        transition={{ duration: 0.2 }}
        width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        className="shrink-0"
      >
        <polyline points="6 9 12 15 18 9" />
      </motion.svg>
    </button>
  )
}

export function CampusMapSection({
  standalone = false,
  initialQuery = "",
  initialCategory = "all",
  initialBuildingId = null,
}: {
  standalone?: boolean
  initialQuery?: string
  initialCategory?: CategoryFilter
  initialBuildingId?: number | null
}) {
  const [selectedId, setSelectedId] = useState<number | null>(initialBuildingId)
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null)
  const [posStatus, setPosStatus] = useState<"idle" | "loading" | "denied" | "unsupported">("idle")
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [searchFocused, setSearchFocused] = useState(false)
  const [category, setCategory] = useState<CategoryFilter>(initialCategory)
  const [sortNearest, setSortNearest] = useState(false)
  const [groupOverrides, setGroupOverrides] = useState<Record<string, boolean>>(() =>
    initialBuildingId ? { [BUILDINGS.find((b) => b.id === initialBuildingId)?.category ?? "academic"]: true } : {},
  )
  const selectedRef = useRef<HTMLDivElement | null>(null)
  const mapWrapRef = useRef<HTMLDivElement | null>(null)
  const [mapBoxHeight, setMapBoxHeight] = useState(0)

  const isDesktop = useSyncExternalStore(
    useCallback((cb: () => void) => {
      const mq = window.matchMedia("(min-width: 1024px)")
      mq.addEventListener("change", cb)
      return () => mq.removeEventListener("change", cb)
    }, []),
    () => window.matchMedia("(min-width: 1024px)").matches,
    () => false,
  )

  useEffect(() => {
    const el = mapWrapRef.current
    if (!el) return
    const update = () => setMapBoxHeight(el.getBoundingClientRect().height)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    window.addEventListener("resize", update)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", update)
    }
  }, [])

  const requestLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setPosStatus("unsupported")
      return
    }
    setPosStatus("loading")
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setPosStatus("idle")
      },
      () => {
        setUserPos(null)
        setPosStatus("denied")
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }, [])

  useEffect(() => {
    if ("geolocation" in navigator) {
      requestLocation()
    } else {
      setPosStatus("unsupported")
    }
  }, [requestLocation])

  const filteredBuildings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    let list = BUILDINGS.filter((b) => {
      if (category !== "all" && b.category !== category) return false
      if (!q) return true
      return (
        b.name.toLowerCase().includes(q) ||
        b.shortDesc.toLowerCase().includes(q) ||
        b.longDesc.toLowerCase().includes(q) ||
        CATEGORY_META[b.category].label.toLowerCase().includes(q)
      )
    })
    if (sortNearest && userPos) {
      list = [...list].sort(
        (a, b) =>
          haversineDistance(userPos.lat, userPos.lng, a.lat, a.lng) -
          haversineDistance(userPos.lat, userPos.lng, b.lat, b.lng),
      )
    }
    return list
  }, [searchQuery, category, sortNearest, userPos])

  const selectedBuilding = useMemo(
    () => BUILDINGS.find((b) => b.id === selectedId) ?? null,
    [selectedId],
  )

  const distance = useMemo(() => {
    if (!userPos || !selectedBuilding) return null
    return haversineDistance(userPos.lat, userPos.lng, selectedBuilding.lat, selectedBuilding.lng)
  }, [userPos, selectedBuilding])

  const scrollSelectedIntoView = useCallback(() => {
    requestAnimationFrame(() => {
      selectedRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
    })
  }, [])

  const toggleSelect = useCallback(
    (id: number) => {
      setSelectedId((prev) => (prev === id ? null : id))
      scrollSelectedIntoView()
    },
    [scrollSelectedIntoView],
  )

  const handleMapSelect = useCallback(
    (id: number) => {
      setSelectedId(id)
      const b = BUILDINGS.find((x) => x.id === id)
      if (b) {
        const key = sortNearest && userPos ? "nearest" : b.category
        setGroupOverrides((prev) => (prev[key] ? prev : { ...prev, [key]: true }))
      }
      scrollSelectedIntoView()
    },
    [sortNearest, userPos, scrollSelectedIntoView],
  )

  const handleSearchPick = useCallback(
    (b: Building) => {
      setSelectedId(b.id)
      const key = sortNearest && userPos ? "nearest" : b.category
      setGroupOverrides((prev) => (prev[key] ? prev : { ...prev, [key]: true }))
      setSearchQuery("")
      setSearchFocused(false)
      requestAnimationFrame(() => {
        document.getElementById(`building-${b.id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" })
      })
    },
    [sortNearest, userPos],
  )

  const grouped = useMemo(() => {
    if (sortNearest && userPos) {
      return [{ category: "nearest" as const, items: filteredBuildings }]
    }
    return CATEGORY_ORDER.map((cat) => ({
      category: cat,
      items: filteredBuildings.filter((b) => b.category === cat),
    })).filter((g) => g.items.length > 0)
  }, [filteredBuildings, sortNearest, userPos])

  const nearest = sortNearest && !!userPos

  const isGroupOpen = useCallback(
    (key: GroupKey) => groupOverrides[key] ?? isDesktop,
    [groupOverrides, isDesktop],
  )

  const toggleGroup = useCallback((key: GroupKey) => {
    setGroupOverrides((prev) => ({ ...prev, [key]: !(prev[key] ?? isDesktop) }))
  }, [isDesktop])

  // Desktop: side list fills the map's height; the rest flows into a grid below.
  const flatOrdered = useMemo(() => grouped.flatMap((g) => g.items), [grouped])
  const sideCapacity = useMemo(() => {
    if (!isDesktop || mapBoxHeight <= 0) return Infinity
    const reserved = (selectedBuilding ? 190 : 30)
    const available = Math.max(80, mapBoxHeight - reserved)
    return Math.max(2, Math.floor(available / 86))
  }, [isDesktop, mapBoxHeight, selectedBuilding])
  const sideItems = useMemo(() => flatOrdered.slice(0, sideCapacity), [flatOrdered, sideCapacity])
  const gridItems = useMemo(() => flatOrdered.slice(sideCapacity), [flatOrdered, sideCapacity])
  const sideGroups = useMemo(() => regroupItems(sideItems, nearest), [sideItems, nearest])
  const gridGroups = useMemo(() => regroupItems(gridItems, nearest), [gridItems, nearest])

  const showNoResults = filteredBuildings.length === 0 && (searchQuery.trim() || category !== "all")

  return (
    <div className="min-h-full pt-[3.75rem] pb-[calc(5rem+env(safe-area-inset-bottom))] px-3 sm:px-4 lg:px-8 lg:pb-8 w-full" style={standalone ? { paddingTop: "5.5rem", paddingBottom: "3rem" } : undefined}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-1">Campus</p>
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight font-display">Campus Map</h1>
          <p className="text-xs mt-1 text-zinc-500">Navigate SRM Kattankulathur — blocks, hostels & facilities.</p>
        </div>
      </div>

      {/* Sticky search + filters */}
      <div
        className="sticky top-[52px] z-30 -mx-3 px-3 sm:-mx-4 sm:px-4 lg:mx-0 lg:px-0 pt-1.5 pb-2.5"
        style={{ background: "var(--page-bg, #09090b)", backdropFilter: "blur(12px)", top: standalone ? 68 : 52 }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search buildings, hostels, labs…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            aria-label="Search campus buildings"
            className="w-full pl-9 pr-9 py-2.5 bg-zinc-900/70 border border-white/5 rounded-xl text-zinc-100 text-sm placeholder-zinc-500 focus:outline-none focus:border-emerald-500/40 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <AnimatePresence>
            {searchFocused && searchQuery.trim() && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute top-full left-0 right-0 mt-1 z-10 rounded-xl border border-white/5 bg-zinc-900/95 backdrop-blur-xl overflow-hidden"
              >
                {filteredBuildings.length > 0 ? (
                  <>
                    {filteredBuildings.slice(0, 8).map((b) => (
                      <button
                        key={b.id}
                        onMouseDown={() => handleSearchPick(b)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/5 transition-colors"
                      >
                        <span className="text-base shrink-0">{b.icon}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-zinc-100 truncate">{b.name}</p>
                          <p className="text-[10px] text-zinc-500">{b.shortDesc}</p>
                        </div>
                        <span className="shrink-0 text-[10px] font-semibold" style={{ color: CATEGORY_META[b.category].color }}>
                          {CATEGORY_META[b.category].label.replace(" Blocks", "").replace("accommodation", "Hostel")}
                        </span>
                      </button>
                    ))}
                    {filteredBuildings.length > 8 && (
                      <div className="px-3 py-1.5 text-center text-[10px] text-zinc-500">
                        +{filteredBuildings.length - 8} more
                      </div>
                    )}
                  </>
                ) : (
                  <div className="px-3 py-3 text-center text-xs text-zinc-500">No buildings found</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Category filters */}
        <div className="flex gap-2 mt-2.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FILTERS.map((f) => {
            const active = category === f.id
            return (
              <motion.button
                key={f.id}
                whileTap={{ scale: 0.93 }}
                onClick={() => setCategory(f.id)}
                aria-pressed={active}
                className={`shrink-0 min-h-[40px] px-3.5 py-2 text-xs font-bold whitespace-nowrap rounded-lg border transition-all ${
                  active
                    ? "bg-zinc-800 text-emerald-400 shadow-md border-white/5"
                    : "bg-transparent text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-white/5"
                }`}
              >
                {f.label}
              </motion.button>
            )
          })}
          {userPos && (
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => setSortNearest((v) => !v)}
              aria-pressed={sortNearest}
              className={`shrink-0 min-h-[40px] px-3.5 py-2 text-xs font-bold whitespace-nowrap rounded-lg border transition-all ${
                sortNearest
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                  : "bg-transparent text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-white/5"
              }`}
            >
              Nearest
            </motion.button>
          )}
        </div>
      </div>

      {/* Map + list */}
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-6 lg:items-start">
        {/* Map */}
        <div ref={mapWrapRef} className="lg:sticky" style={{ top: standalone ? 156 : 140 }}>
          <div
            className="campus-map-wrap relative rounded-2xl overflow-hidden h-[38vh] min-h-[300px] max-h-[460px] lg:h-[52vh] lg:min-h-[400px] lg:max-h-[540px] isolate z-0"
            style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <MapView buildings={BUILDINGS} selectedId={selectedId} userPos={userPos} onSelect={handleMapSelect} />

            {/* Locate me */}
            <button
              onClick={requestLocation}
              aria-label="Locate my position"
              className="absolute top-3 right-3 z-[400] w-11 h-11 rounded-full flex items-center justify-center transition-all hover:opacity-90"
              style={{
                background: "rgba(15,23,42,0.9)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#e2e8f0",
                boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
              }}
            >
              <LocateFixed className={`w-4.5 h-4.5 ${posStatus === "loading" ? "animate-spin" : ""}`} />
            </button>

            {/* Location status pill */}
            {posStatus === "loading" && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[400] px-3 py-1.5 rounded-xl text-xs font-semibold"
                style={{ background: "rgba(15,23,42,0.9)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)" }}>
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse mr-2 align-middle" />
                Getting your location…
              </div>
            )}
            {posStatus === "denied" && (
              <button
                onClick={requestLocation}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[400] px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
                style={{ background: "rgba(15,23,42,0.9)", color: "#fca5a5", border: "1px solid rgba(248,113,113,0.2)" }}
              >
                Location blocked — tap to retry
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="mt-4 lg:mt-0 min-w-0">
          <AnimatePresence>
            {selectedBuilding && (
              <motion.div
                key={`selected-${selectedBuilding.id}`}
                ref={selectedRef}
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                className="mb-3 rounded-2xl p-4"
                style={{
                  background: "linear-gradient(145deg, rgba(24,24,27,0.85), rgba(18,18,22,0.6))",
                  border: "1px solid rgba(52,211,153,0.2)",
                  boxShadow: "0 14px 30px rgba(0,0,0,0.25)",
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl shrink-0">{selectedBuilding.icon}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-zinc-100 leading-snug">{selectedBuilding.name}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: CATEGORY_META[selectedBuilding.category].color }}>
                      {CATEGORY_META[selectedBuilding.category].label}
                    </p>
                    {distance !== null ? (
                      <p className="text-lg font-black tracking-tight mt-1" style={{ color: "#34d399" }}>
                        {formatDistance(distance)}
                        <span className="text-[10px] font-semibold text-zinc-500 ml-1.5">from you</span>
                      </p>
                    ) : posStatus === "idle" || posStatus === "loading" ? (
                      <p className="text-[11px] mt-1 text-zinc-500">
                        {posStatus === "loading" ? "Fetching your location…" : "Allow location to see distance."}
                      </p>
                    ) : (
                      <p className="text-[11px] mt-1 text-red-400/80">Distance unavailable without location.</p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedId(null)}
                    aria-label="Dismiss"
                    className="shrink-0 p-1.5 rounded-full text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs leading-relaxed mt-3 text-zinc-400">{selectedBuilding.longDesc}</p>
                <div className="flex gap-2 mt-4">
                  <a
                    href={getDirectionsUrlSafe(selectedBuilding.lat, selectedBuilding.lng)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-90"
                    style={{ background: "linear-gradient(135deg,#10b981,#34d399)", color: "#09090b" }}
                  >
                    <Navigation className="w-4 h-4" />
                    Get Directions
                  </a>
                  {userPos && (
                    <button
                      onClick={() => { setSelectedId(null); setSortNearest(true) }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#d4d4d8" }}
                    >
                      <Navigation2 className="w-4 h-4" />
                      Nearest
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {showNoResults ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <MapPin className="w-10 h-10 text-zinc-600 mb-4" />
              <h3 className="text-lg font-bold text-zinc-100 mb-1">No buildings found</h3>
              <p className="text-sm text-zinc-500 mb-6">Try a different search or filter.</p>
              <button
                onClick={() => { setSearchQuery(""); setCategory("all"); setSortNearest(false) }}
                className="px-5 py-2 bg-zinc-800 border border-white/5 text-zinc-300 rounded-xl text-xs font-bold hover:bg-zinc-700 transition-colors"
              >
                Clear Search & Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {sideGroups.map((group) => {
                const open = isGroupOpen(group.key)
                return (
                  <div key={group.key}>
                    <GroupHeader kind={group.key} count={group.items.length} open={open} onToggle={() => toggleGroup(group.key)} />
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-1.5 pt-1">
                            {group.items.map((b) => (
                              <BuildingCard
                                key={b.id}
                                b={b}
                                isSelected={selectedId === b.id}
                                bDist={userPos ? haversineDistance(userPos.lat, userPos.lng, b.lat, b.lng) : null}
                                onToggle={toggleSelect}
                              />
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Overflow grid (desktop only) */}
      {isDesktop && gridGroups.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-2 px-1 py-1">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.18em]" style={{ color: "#a1a1aa" }}>
              More locations
            </span>
            <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.08), transparent)" }} />
            <span className="text-[10px] text-zinc-600 shrink-0">{gridItems.length}</span>
          </div>
          {gridGroups.map((group) => {
            const open = isGroupOpen(group.key)
            return (
              <div key={group.key}>
                <GroupHeader kind={group.key} count={group.items.length} open={open} onToggle={() => toggleGroup(group.key)} />
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 pt-1">
                        {group.items.map((b) => (
                          <BuildingCard
                            key={b.id}
                            b={b}
                            isSelected={selectedId === b.id}
                            bDist={userPos ? haversineDistance(userPos.lat, userPos.lng, b.lat, b.lng) : null}
                            onToggle={toggleSelect}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
