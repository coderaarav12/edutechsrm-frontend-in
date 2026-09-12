"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  X,
  MapPin,
  Navigation,
  Compass,
  Layers,
  Locate,
  Share2,
  Check,
  ChevronDown,
  ArrowUpRight,
  ExternalLink,
  Flame,
} from "lucide-react"
import { useIsPosterTheme } from "@/lib/theme-context"
import { AIPromoBadge } from "@/components/ai-promo-badge"
import {
  BUILDINGS,
  CATEGORY_META,
  CATEGORY_ORDER,
  haversineDistance,
  formatDistance,
  getDirectionsUrl,
} from "@/lib/campus-data"
import type { Building, BuildingCategory } from "@/lib/campus-data"

type CategoryFilter = BuildingCategory | "all"

const FILTERS: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "All Landmarks" },
  ...CATEGORY_ORDER.map((c) => ({ id: c as CategoryFilter, label: CATEGORY_META[c].label })),
]

const KEY_CAMPUS_HOTSPOTS = [
  { id: 1, name: "UB Block", icon: "🏛️", lat: 12.8233083, lng: 80.0424496 },
  { id: 2, name: "Tech Park", icon: "💻", lat: 12.824648, lng: 80.04533 },
  { id: 43, name: "Java Green", icon: "🍜", lat: 12.823636, lng: 80.044062 },
  { id: 14, name: "Library", icon: "📚", lat: 12.823285, lng: 80.042586 },
  { id: 13, name: "Auditorium", icon: "🎭", lat: 12.824652, lng: 80.046601 },
  { id: 35, name: "Main Gate", icon: "🚉", lat: 12.822000, lng: 80.038500 },
]

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
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [category, setCategory] = useState<CategoryFilter>(initialCategory)
  const [selectedId, setSelectedId] = useState<number | null>(initialBuildingId)
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap")
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null)
  const [posLoading, setPosLoading] = useState(false)
  const [sortNearest, setSortNearest] = useState(false)
  const [copied, setCopied] = useState(false)
  // Collapsed by default as requested
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({})
  const mapSectionRef = useRef<HTMLDivElement>(null)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Theme detection
  const isPosterTheme = useIsPosterTheme()
  const [isPosterLocal, setIsPosterLocal] = useState(false)
  useEffect(() => {
    const check = () => {
      if (typeof document !== "undefined") {
        const m =
          document.documentElement.getAttribute("data-landing-mode") ||
          document.documentElement.getAttribute("data-theme") ||
          localStorage.getItem("edutechsrm-landing-mode") ||
          localStorage.getItem("edutechsrm_landing_mode")
        setIsPosterLocal(m === "poster")
      }
    }
    check()
    window.addEventListener("landing-mode-change", check)
    window.addEventListener("storage", check)
    window.addEventListener("edutechsrm_theme_event", check)
    return () => {
      window.removeEventListener("landing-mode-change", check)
      window.removeEventListener("storage", check)
      window.removeEventListener("edutechsrm_theme_event", check)
    }
  }, [])
  const isPoster = isPosterTheme || isPosterLocal

  // Geolocation
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) return
    setPosLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setSortNearest(true)
        setPosLoading(false)
      },
      () => {
        setPosLoading(false)
      },
      { timeout: 8000, enableHighAccuracy: true }
    )
  }, [])

  // Filtered & sorted buildings
  const filteredBuildings = useMemo(() => {
    let list = BUILDINGS.filter((b) => {
      const matchCat = category === "all" || b.category === category
      const q = searchQuery.toLowerCase().trim()
      const matchSearch =
        !q ||
        b.name.toLowerCase().includes(q) ||
        b.shortDesc.toLowerCase().includes(q) ||
        b.longDesc.toLowerCase().includes(q)
      return matchCat && matchSearch
    })

    if (sortNearest && userPos) {
      list = [...list].sort((a, b) => {
        const distA = haversineDistance(userPos.lat, userPos.lng, a.lat, a.lng)
        const distB = haversineDistance(userPos.lat, userPos.lng, b.lat, b.lng)
        return distA - distB
      })
    }

    return list
  }, [category, searchQuery, sortNearest, userPos])

  // Selected building object
  const selectedBuilding = useMemo(
    () => (selectedId ? BUILDINGS.find((b) => b.id === selectedId) || null : null),
    [selectedId]
  )

  // Center coordinate for Google Maps embed
  const mapCenter = useMemo(() => {
    if (selectedBuilding) {
      return { lat: selectedBuilding.lat, lng: selectedBuilding.lng }
    }
    return { lat: 12.823636, lng: 80.044062 } // SRM Campus Central
  }, [selectedBuilding])

  // Share building handler
  const handleShare = () => {
    const url = typeof window !== "undefined" ? window.location.href : "https://edutechsrm.in/explore"
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Toggle category accordion
  const toggleCategory = (cat: string) => {
    setOpenCategories((prev) => ({ ...prev, [cat]: !prev[cat] }))
  }

  // Grouped buildings for directory list
  const groupedBuildings = useMemo(() => {
    if (category !== "all") {
      return [{ key: category, label: CATEGORY_META[category]?.label || "Landmarks", items: filteredBuildings }]
    }
    return CATEGORY_ORDER.map((cat) => ({
      key: cat,
      label: CATEGORY_META[cat]?.label || cat,
      items: filteredBuildings.filter((b) => b.category === cat),
    })).filter((g) => g.items.length > 0)
  }, [category, filteredBuildings])

  // Autocomplete search suggestions for instant floating dropdown
  const searchSuggestions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return []
    return BUILDINGS.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.shortDesc.toLowerCase().includes(q) ||
        b.longDesc.toLowerCase().includes(q)
    ).slice(0, 8)
  }, [searchQuery])

  const handleSelectSuggestion = (b: (typeof BUILDINGS)[0]) => {
    setSelectedId(b.id)
    setIsSearchFocused(false)
    setOpenCategories((prev) => ({ ...prev, [b.category]: true }))
    if (mapSectionRef.current) {
      const yOffset = -90
      const y = mapSectionRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: "smooth" })
    }
  }

  const handleSelectBuilding = (id: number) => {
    setSelectedId(id)
    if (mapSectionRef.current) {
      const yOffset = -90
      const y = mapSectionRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: "smooth" })
    }
  }

  return (
    <div className={`radar-shell w-full min-h-screen transition-colors duration-300 ${isPoster ? "bg-[#f4efe6] text-[#111111]" : "bg-[#070a0e] text-zinc-100"}`}>
      
      {/* Dynamic Global Theme Overrides */}
      <style>{`
        [data-landing-mode="poster"] .radar-shell {
          background-color: #f4efe6 !important;
          color: #111111 !important;
        }
        [data-landing-mode="poster"] .radar-search-input {
          background: #ffffff !important;
          border: 2px solid #111111 !important;
          color: #111111 !important;
          box-shadow: 3px 3px 0px #111111 !important;
        }
        [data-landing-mode="poster"] .radar-search-input::placeholder {
          color: #666666 !important;
        }
        [data-landing-mode="poster"] .radar-pill {
          background: #ffffff !important;
          border: 1.5px solid #111111 !important;
          color: #111111 !important;
          box-shadow: 2px 2px 0px #111111 !important;
        }
        [data-landing-mode="poster"] .radar-pill.is-active {
          background: #111111 !important;
          color: #ffffff !important;
          box-shadow: 3px 3px 0px #111111 !important;
        }
        [data-landing-mode="poster"] .radar-card {
          background: #ffffff !important;
          border: 2px solid #111111 !important;
          box-shadow: 4px 4px 0px #111111 !important;
          color: #111111 !important;
        }
        [data-landing-mode="poster"] .radar-card-selected {
          background: #ffffff !important;
          border: 2.5px solid #111111 !important;
          box-shadow: 6px 6px 0px #111111 !important;
        }
        [data-landing-mode="poster"] .radar-cockpit-box {
          background: #ffffff !important;
          border: 2.5px solid #111111 !important;
          box-shadow: 8px 8px 0px #111111 !important;
        }
        [data-landing-mode="poster"] .radar-btn-primary {
          background: #111111 !important;
          color: #ffffff !important;
          border: 2px solid #111111 !important;
          box-shadow: 3px 3px 0px #111111 !important;
        }
        [data-landing-mode="poster"] .radar-btn-secondary {
          background: #ffffff !important;
          color: #111111 !important;
          border: 1.5px solid #111111 !important;
          box-shadow: 2px 2px 0px #111111 !important;
        }
        [data-landing-mode="poster"] .radar-hotspot-chip {
          background: #ffffff !important;
          border: 1.5px solid #111111 !important;
          color: #111111 !important;
          box-shadow: 2px 2px 0px #111111 !important;
        }
        [data-landing-mode="poster"] .radar-hotspot-chip.is-active {
          background: #111111 !important;
          color: #ffffff !important;
        }
        [data-landing-mode="poster"] .radar-hotspot-chip.is-active span {
          color: #ffffff !important;
        }
      `}</style>

      <div className={standalone ? "mx-auto max-w-7xl px-4 pt-24 pb-20 sm:px-6 lg:px-8" : "min-h-full pt-[3.75rem] pb-20 px-3 sm:px-4 lg:px-8 lg:pb-8 w-full max-w-7xl mx-auto"}>
        
        {/* ── 1. Header ── */}
        {!standalone ? (
          /* Inside App Header - Standardized to match Courses, Attendance, Marks, GradeX */
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-start mb-6 sm:mb-8"
          >
            <div>
              <h2 className={`font-bold text-[10px] uppercase tracking-widest mb-1 ${isPoster ? "text-[#555555]" : "text-zinc-500"}`}>
                Campus Radar
              </h2>
              <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight font-display flex items-center gap-2 ${isPoster ? "text-[#111111]" : "text-zinc-100"}`}>
                <Compass className={`w-6 h-6 shrink-0 ${isPoster ? "text-[#111111]" : "text-emerald-400"}`} />
                Campus Explore
              </h1>
              <p className={`text-xs mt-1 ${isPoster ? "text-[#555555]" : "text-zinc-500"}`}>
                SRMIST KTR · Find any room, cabin, or stall · 250 Acres
              </p>
            </div>
            <div className="flex items-center gap-2">
              <AIPromoBadge page="explore" />
              <button
                onClick={handleShare}
                className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
                  isPoster
                    ? "bg-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] text-[#111111] hover:bg-[#f7f5f0]"
                    : "text-zinc-500 bg-zinc-900/60 ring-1 ring-white/5 hover:text-zinc-300 hover:bg-zinc-800"
                }`}
                title={copied ? "Link Copied!" : "Share Radar"}
              >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4" />}
              </button>
              <button
                onClick={requestLocation}
                disabled={posLoading}
                className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
                  isPoster
                    ? "bg-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] text-[#111111] hover:bg-[#f7f5f0]"
                    : "text-zinc-500 bg-zinc-900/60 ring-1 ring-white/5 hover:text-zinc-300 hover:bg-zinc-800"
                }`}
                title={userPos ? "GPS Active" : "Detect Location"}
              >
                <Locate className={`h-4 w-4 ${posLoading ? "animate-pulse" : userPos ? (isPoster ? "text-emerald-600" : "text-emerald-400") : ""}`} />
              </button>
            </div>
          </motion.div>
        ) : (
          /* Public Standalone Landing Page Masthead */
          <div className="mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-wider"
                style={{
                  borderColor: isPoster ? "#111111" : "rgba(52,211,153,0.3)",
                  background: isPoster ? "#ffffff" : "rgba(52,211,153,0.1)",
                  color: isPoster ? "#111111" : "#34d399",
                  boxShadow: isPoster ? "2px 2px 0px #111111" : "none",
                }}
              >
                <Compass className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: "12s" }} />
                <span>003 // CAMPUS RADAR & CARTOGRAPHY • 250 ACRES</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="radar-btn-secondary inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-mono font-bold transition-all"
                  style={{
                    background: isPoster ? "#ffffff" : "rgba(255,255,255,0.05)",
                    border: isPoster ? "1.5px solid #111111" : "1px solid rgba(255,255,255,0.1)",
                    color: isPoster ? "#111111" : "#d4d4d8",
                  }}
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5" />}
                  <span>{copied ? "Link Copied!" : "Share Radar"}</span>
                </button>

                <button
                  onClick={requestLocation}
                  disabled={posLoading}
                  className="radar-btn-secondary inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-mono font-bold transition-all"
                  style={{
                    background: isPoster ? "#ffffff" : "rgba(255,255,255,0.05)",
                    border: isPoster ? "1.5px solid #111111" : "1px solid rgba(255,255,255,0.1)",
                    color: isPoster ? "#111111" : userPos ? "#34d399" : "#d4d4d8",
                  }}
                >
                  <Locate className={`h-3.5 w-3.5 ${posLoading ? "animate-pulse" : ""}`} />
                  <span>{userPos ? "GPS Active" : "Detect Location"}</span>
                </button>
              </div>
            </div>

            <h1 className="font-display mt-5 text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl leading-[1.05]"
              style={{ color: isPoster ? "#111111" : "#ffffff" }}
            >
              SRMIST KTR Campus Radar. <br className="hidden sm:inline" />
              <span className="font-serif italic font-normal" style={{ color: isPoster ? "#059669" : "#34d399" }}>
                Find any room before the professor does.
              </span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed sm:text-base font-sans"
              style={{ color: isPoster ? "#444444" : "#a1a1aa" }}
            >
              Real-time walking estimates, floor directories, faculty cabins, food courts, and transit walkways across SRM Institute of Science and Technology, Kattankulathur. Zero login required.
            </p>
          </div>
        )}

        {/* ── 2. Unified Search with Live Dropdown & Category Switcher Bar ── */}
        <div className="mb-6 space-y-3">
          <div ref={searchContainerRef} className="relative z-30">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 z-10" style={{ color: isPoster ? "#111111" : "#71717a" }} />
            <input
              type="text"
              placeholder="Search 100+ blocks, faculty cabins, labs, or food stalls (e.g. 'Tech Park', 'Subway', 'UB Block')..."
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setIsSearchFocused(true)
              }}
              className="radar-search-input w-full rounded-2xl py-3.5 pl-11 pr-10 text-sm font-sans font-medium transition-all focus:outline-none"
              style={{
                background: isPoster ? "#ffffff" : "rgba(255,255,255,0.04)",
                border: isPoster ? "2px solid #111111" : "1px solid rgba(255,255,255,0.1)",
                color: isPoster ? "#111111" : "#ffffff",
                boxShadow: isPoster ? "3px 3px 0px #111111" : "none",
              }}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("")
                  setIsSearchFocused(false)
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-200 z-10"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Instant Floating Autocomplete Dropdown */}
            <AnimatePresence>
              {isSearchFocused && searchQuery.trim().length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl overflow-hidden shadow-2xl"
                  style={{
                    background: isPoster ? "#ffffff" : "#0d1117",
                    border: isPoster ? "2.5px solid #111111" : "1px solid rgba(255,255,255,0.14)",
                    boxShadow: isPoster ? "6px 6px 0px #111111" : "0 24px 48px rgba(0,0,0,0.6)",
                  }}
                >
                  <div className="px-3.5 py-2.5 border-b flex items-center justify-between"
                    style={{
                      background: isPoster ? "#faf7f2" : "rgba(255,255,255,0.03)",
                      borderColor: isPoster ? "#111111" : "rgba(255,255,255,0.08)",
                    }}
                  >
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider"
                      style={{ color: isPoster ? "#111111" : "#a1a1aa" }}
                    >
                      {searchSuggestions.length} Matching Places
                    </span>
                    <span className="font-mono text-[10px]" style={{ color: isPoster ? "#666666" : "#71717a" }}>
                      Tap to highlight on map
                    </span>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto p-1.5 space-y-1">
                    {searchSuggestions.length === 0 ? (
                      <div className="py-6 text-center">
                        <p className="text-xs font-mono" style={{ color: isPoster ? "#666666" : "#71717a" }}>
                          No campus locations found for &ldquo;{searchQuery}&rdquo;
                        </p>
                      </div>
                    ) : (
                      searchSuggestions.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => handleSelectSuggestion(b)}
                          className="w-full text-left flex items-center justify-between p-2.5 rounded-xl transition-all"
                          style={{
                            background: "transparent",
                            color: isPoster ? "#111111" : "#ffffff",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = isPoster ? "#faf7f2" : "rgba(255,255,255,0.06)"
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent"
                          }}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-xl shrink-0">{b.icon}</span>
                            <div className="min-w-0">
                              <p className="font-display text-xs sm:text-sm font-bold truncate">
                                {b.name}
                              </p>
                              <p className="text-[11px] truncate mt-0.5 font-sans"
                                style={{ color: isPoster ? "#666666" : "#a1a1aa" }}
                              >
                                {b.shortDesc}
                              </p>
                            </div>
                          </div>
                          <span className="shrink-0 font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ml-2"
                            style={{
                              background: isPoster ? "#f4efe6" : "rgba(255,255,255,0.06)",
                              color: isPoster ? "#111111" : CATEGORY_META[b.category]?.color || "#34d399",
                              border: isPoster ? "1px solid #111111" : "none",
                            }}
                          >
                            {CATEGORY_META[b.category]?.label.split(" ")[0]}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Filter Pills Carousel */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {FILTERS.map((f) => {
              const active = category === f.id
              return (
                <button
                  key={f.id}
                  onClick={() => setCategory(f.id)}
                  className={`radar-pill shrink-0 inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-mono font-bold transition-all active:scale-[0.97] ${active ? "is-active" : ""}`}
                  style={{
                    background: active
                      ? isPoster ? "#111111" : "#34d399"
                      : isPoster ? "#ffffff" : "rgba(255,255,255,0.03)",
                    color: active
                      ? isPoster ? "#ffffff" : "#09090b"
                      : isPoster ? "#111111" : "#a1a1aa",
                    border: isPoster ? "1.5px solid #111111" : "1px solid rgba(255,255,255,0.08)",
                    boxShadow: isPoster ? (active ? "3px 3px 0px #111111" : "2px 2px 0px #111111") : "none",
                  }}
                >
                  <span>{f.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── 3. The Interactive Cartography Cockpit ── */}
        <div ref={mapSectionRef} className="flex flex-col gap-5">
          <div className="radar-cockpit-box relative overflow-hidden rounded-3xl"
            style={{
              background: isPoster ? "#ffffff" : "#0c1017",
              border: isPoster ? "2.5px solid #111111" : "1px solid rgba(255,255,255,0.12)",
              boxShadow: isPoster ? "8px 8px 0px #111111" : "0 20px 40px rgba(0,0,0,0.4)",
            }}
          >
            {/* Map Header Bar: Map Mode Switcher & GPS Telemetry */}
            <div className="flex items-center justify-between border-b px-4 py-3"
              style={{
                background: isPoster ? "#faf7f2" : "rgba(255,255,255,0.02)",
                borderColor: isPoster ? "#111111" : "rgba(255,255,255,0.08)",
              }}
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider" style={{ color: isPoster ? "#111111" : "#34d399" }}>
                  LIVE SRMIST SATELLITE
                </span>
              </div>

              <div className="flex items-center rounded-xl p-1"
                style={{
                  background: isPoster ? "#ffffff" : "rgba(0,0,0,0.4)",
                  border: isPoster ? "1.5px solid #111111" : "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <button
                  onClick={() => setMapType("roadmap")}
                  className="rounded-lg px-2.5 py-1 text-[11px] font-mono font-bold transition-all"
                  style={{
                    background: mapType === "roadmap" ? (isPoster ? "#111111" : "#34d399") : "transparent",
                    color: mapType === "roadmap" ? (isPoster ? "#ffffff" : "#09090b") : (isPoster ? "#666666" : "#a1a1aa"),
                  }}
                >
                  Map
                </button>
                <button
                  onClick={() => setMapType("satellite")}
                  className="rounded-lg px-2.5 py-1 text-[11px] font-mono font-bold transition-all"
                  style={{
                    background: mapType === "satellite" ? (isPoster ? "#111111" : "#34d399") : "transparent",
                    color: mapType === "satellite" ? (isPoster ? "#ffffff" : "#09090b") : (isPoster ? "#666666" : "#a1a1aa"),
                  }}
                >
                  Satellite
                </button>
              </div>
            </div>

            {/* Real Google Map Embed Container */}
            <div className="relative h-[380px] sm:h-[480px] lg:h-[520px] w-full bg-[#0a0f16]">
              <iframe
                key={`${mapCenter.lat}-${mapCenter.lng}-${mapType}`}
                title="SRMIST KTR Campus Radar Map"
                src={`https://www.google.com/maps?q=${mapCenter.lat},${mapCenter.lng}&z=17&t=${mapType === "satellite" ? "k" : "m"}&output=embed`}
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />

              {/* GPS Coordinates HUD Pill */}
              <div className="pointer-events-none absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] font-bold shadow-lg"
                style={{
                  background: isPoster ? "rgba(255,255,255,0.95)" : "rgba(0,0,0,0.85)",
                  color: isPoster ? "#111111" : "#34d399",
                  border: isPoster ? "1.5px solid #111111" : "1px solid rgba(52,211,153,0.3)",
                }}
              >
                <Navigation className="h-3 w-3 text-emerald-400" />
                <span>GPS: {mapCenter.lat.toFixed(4)}°N, {mapCenter.lng.toFixed(4)}°E</span>
              </div>
            </div>

            {/* Bottom Quick Hotspot Strip */}
            <div className="border-t p-3 flex items-center gap-2 overflow-x-auto scrollbar-none"
              style={{
                background: isPoster ? "#ffffff" : "rgba(255,255,255,0.02)",
                borderColor: isPoster ? "#111111" : "rgba(255,255,255,0.08)",
              }}
            >
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider shrink-0 pl-1"
                style={{ color: isPoster ? "#666666" : "#71717a" }}
              >
                KEY HUBS:
              </span>
              {KEY_CAMPUS_HOTSPOTS.map((hotspot) => {
                const isActive = selectedId === hotspot.id
                return (
                  <button
                    key={hotspot.id}
                    onClick={() => handleSelectBuilding(hotspot.id)}
                    className={`radar-hotspot-chip shrink-0 inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-mono font-bold transition-all ${isActive ? "is-active" : ""}`}
                    style={{
                      background: isActive
                        ? isPoster ? "#111111" : "#34d399"
                        : isPoster ? "#f4efe6" : "rgba(255,255,255,0.04)",
                      color: isActive
                        ? isPoster ? "#ffffff" : "#09090b"
                        : isPoster ? "#111111" : "#d4d4d8",
                      border: isPoster ? "1.5px solid #111111" : "1px solid rgba(255,255,255,0.08)",
                      boxShadow: isPoster ? "2px 2px 0px #111111" : "none",
                    }}
                  >
                    <span>{hotspot.icon}</span>
                    <span>{hotspot.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selected Landmark Highlight Card */}
          {selectedBuilding && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="radar-card-selected rounded-3xl p-5 sm:p-6"
              style={{
                background: isPoster ? "#ffffff" : "rgba(255,255,255,0.035)",
                border: isPoster ? "2.5px solid #111111" : "1px solid rgba(52,211,153,0.3)",
                boxShadow: isPoster ? "6px 6px 0px #111111" : "0 16px 36px rgba(0,0,0,0.3)",
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
                    style={{
                      background: isPoster ? "#f4efe6" : "rgba(255,255,255,0.06)",
                      border: isPoster ? "1.5px solid #111111" : "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    {selectedBuilding.icon}
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-black leading-tight sm:text-xl"
                      style={{ color: isPoster ? "#111111" : "#ffffff" }}
                    >
                      {selectedBuilding.name}
                    </h3>
                    <p className="font-mono text-xs font-bold mt-0.5"
                      style={{ color: isPoster ? "#059669" : CATEGORY_META[selectedBuilding.category]?.color || "#34d399" }}
                    >
                      {CATEGORY_META[selectedBuilding.category]?.label} • {selectedBuilding.shortDesc}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedId(null)}
                  className="p-1.5 rounded-xl transition-colors"
                  style={{
                    background: isPoster ? "#f4efe6" : "rgba(255,255,255,0.08)",
                    color: isPoster ? "#111111" : "#d4d4d8",
                    border: isPoster ? "1px solid #111111" : "none",
                  }}
                  title="Close selection"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="mt-4 text-sm leading-relaxed"
                style={{ color: isPoster ? "#333333" : "#d4d4d8" }}
              >
                {selectedBuilding.longDesc}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <a
                  href={getDirectionsUrl(selectedBuilding.lat, selectedBuilding.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="radar-btn-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider transition-all"
                  style={{
                    background: isPoster ? "#111111" : "#34d399",
                    color: isPoster ? "#ffffff" : "#09090b",
                    border: isPoster ? "2px solid #111111" : "none",
                    boxShadow: isPoster ? "3px 3px 0px #111111" : "0 8px 20px rgba(52,211,153,0.3)",
                  }}
                >
                  <Navigation className="h-3.5 w-3.5" />
                  <span>Get Walking Directions</span>
                  <ExternalLink className="h-3 w-3 opacity-70" />
                </a>

                {userPos && (
                  <span className="font-mono text-xs font-bold"
                    style={{ color: isPoster ? "#0b7a54" : "#34d399" }}
                  >
                    ~{formatDistance(haversineDistance(userPos.lat, userPos.lng, selectedBuilding.lat, selectedBuilding.lng))} away from your current location
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* ── 4. Campus Directory (Positioned Directly Below the Map) ── */}
        <div className="mt-12 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4"
            style={{ borderColor: isPoster ? "rgba(17,17,17,0.15)" : "rgba(255,255,255,0.1)" }}
          >
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider"
                style={{ color: isPoster ? "#059669" : "#34d399" }}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>EXPLORE DIRECTORY</span>
              </div>
              <h2 className="font-display mt-1 text-2xl sm:text-3xl font-black"
                style={{ color: isPoster ? "#111111" : "#ffffff" }}
              >
                Campus Directory ({filteredBuildings.length} Locations)
              </h2>
            </div>

            <span className="font-mono text-xs" style={{ color: isPoster ? "#666666" : "#a1a1aa" }}>
              Click any location to spotlight on the map above ↑
            </span>
          </div>

          {filteredBuildings.length === 0 ? (
            <div className="radar-card rounded-3xl p-8 text-center"
              style={{
                background: isPoster ? "#ffffff" : "rgba(255,255,255,0.03)",
                border: isPoster ? "2px solid #111111" : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <p className="font-display font-bold text-base" style={{ color: isPoster ? "#111111" : "#ffffff" }}>
                No locations found matching &ldquo;{searchQuery}&rdquo;
              </p>
              <p className="text-xs mt-1 text-zinc-500">Try searching for &apos;UB&apos;, &apos;TP&apos;, or reset the category filter.</p>
              <button
                onClick={() => { setSearchQuery(""); setCategory("all") }}
                className="radar-btn-primary mt-4 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-mono font-bold"
                style={{
                  background: isPoster ? "#111111" : "#34d399",
                  color: isPoster ? "#ffffff" : "#09090b",
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {groupedBuildings.map((group) => {
                const isOpen = Boolean(openCategories[group.key])
                return (
                  <div key={group.key} className="radar-card rounded-2xl p-4 transition-all"
                    style={{
                      background: isPoster ? "#ffffff" : "rgba(255,255,255,0.03)",
                      border: isPoster ? "2px solid #111111" : "1px solid rgba(255,255,255,0.08)",
                      boxShadow: isPoster ? "3px 3px 0px #111111" : "none",
                    }}
                  >
                    <button
                      onClick={() => toggleCategory(group.key)}
                      className="w-full flex items-center justify-between py-1 font-mono text-xs font-bold uppercase tracking-wider transition-colors"
                      style={{ color: isPoster ? "#111111" : "#a1a1aa" }}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: CATEGORY_META[group.key as BuildingCategory]?.color || "#34d399" }} />
                        <span className="text-sm font-bold">{group.label}</span>
                        <span className="text-[11px] font-normal opacity-70">({group.items.length})</span>
                      </span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                    </button>

                    {isOpen && (
                      <div className="mt-3.5 space-y-2.5 border-t pt-3"
                        style={{ borderColor: isPoster ? "rgba(17,17,17,0.1)" : "rgba(255,255,255,0.08)" }}
                      >
                        {group.items.map((b) => {
                          const isSelected = selectedId === b.id
                          const dist = userPos ? haversineDistance(userPos.lat, userPos.lng, b.lat, b.lng) : null

                          return (
                            <div
                              key={b.id}
                              onClick={() => handleSelectBuilding(b.id)}
                              className={`rounded-xl p-3 transition-all cursor-pointer ${
                                isSelected ? "ring-2 ring-emerald-400 scale-[1.01]" : "hover:-translate-y-0.5"
                              }`}
                              style={{
                                background: isSelected
                                  ? isPoster ? "#f4efe6" : "rgba(52,211,153,0.1)"
                                  : isPoster ? "#faf7f2" : "rgba(255,255,255,0.04)",
                                border: isPoster ? "1.5px solid #111111" : "1px solid rgba(255,255,255,0.06)",
                                boxShadow: isPoster ? "2px 2px 0px #111111" : "none",
                              }}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className="text-xl shrink-0">{b.icon}</span>
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-display text-sm font-bold truncate"
                                      style={{ color: isPoster ? "#111111" : "#ffffff" }}
                                    >
                                      {b.name}
                                    </h4>
                                    <p className="text-[11px] truncate mt-0.5 font-sans"
                                      style={{ color: isPoster ? "#555555" : "#a1a1aa" }}
                                    >
                                      {b.shortDesc}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  {dist !== null && (
                                    <span className="font-mono text-[10px] font-bold" style={{ color: isPoster ? "#0b7a54" : "#34d399" }}>
                                      {formatDistance(dist)}
                                    </span>
                                  )}
                                  <span className="font-mono text-[10px] uppercase font-bold flex items-center gap-0.5 px-2 py-0.5 rounded"
                                    style={{
                                      background: isPoster ? "#111111" : "rgba(52,211,153,0.15)",
                                      color: isPoster ? "#ffffff" : "#34d399",
                                    }}
                                  >
                                    <span>View</span>
                                    <ArrowUpRight className="h-3 w-3" />
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
