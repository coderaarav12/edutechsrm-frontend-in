"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import gsap from "gsap"
import { LocateFixed, MapPin, Navigation, Search, X } from "lucide-react"
import { BUILDINGS, CATEGORY_META } from "@/lib/campus-data"

/* Shared stylized KTR geometry — mirrors the real /explore map
   (Main Arch Gate → UB → Clock Tower → Tech Park → Java Green → Library). */

const STOPS = [
  { x: 110, y: 430, label: "Main Arch Gate" },
  { x: 300, y: 330, label: "UB Block" },
  { x: 430, y: 280, label: "Clock Tower" },
  { x: 590, y: 280, label: "Tech Park" },
  { x: 640, y: 380, label: "Java Green" },
  { x: 470, y: 430, label: "Central Library" },
]

const ROUTE_D =
  "M110,430 C180,420 220,380 300,330 C360,290 390,285 430,280 C490,272 540,268 590,280 C625,288 635,330 640,380 C644,415 550,428 470,430"

/* ─────────────────── grand opening: GPS campus tour ─────────────────── */

export function CampusIntro({ onDone }: { onDone: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const doneRef = useRef(false)
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  const finish = (fast = false) => {
    if (doneRef.current) return
    doneRef.current = true
    const root = rootRef.current
    if (fast && root) {
      tlRef.current?.kill()
      gsap.to(root, { opacity: 0, duration: 0.3, ease: "power2.in", onComplete: onDone })
    } else {
      onDone()
    }
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
      const route = document.getElementById("tour-route") as unknown as SVGPathElement | null
      const pin = document.getElementById("tour-pin")
      const shadow = document.getElementById("tour-shadow")
      const coords = document.getElementById("tour-coords")
      if (!route || !pin) { finish(); return }
      const len = route.getTotalLength()
      gsap.set(route, { strokeDasharray: len, strokeDashoffset: len })
      gsap.set(".tour-stop", { opacity: 0, scale: 0, transformOrigin: "50% 100%" })
      gsap.set("#tour-endpill", { opacity: 0, scale: 0.6, transformOrigin: "50% 50%" })

      const place = (p: number) => {
        const pt = route.getPointAtLength(p * len)
        gsap.set(pin, { x: pt.x, y: pt.y })
        gsap.set(route, { strokeDashoffset: len * (1 - p) })
        if (coords) {
          const lat = 12.821 + p * 0.0037
          const lng = 80.0385 + p * 0.0073
          coords.textContent = `${lat.toFixed(4)}°N · ${lng.toFixed(4)}°E`
        }
      }
      place(0)

      const travel = { p: 0 }
      const tl = gsap.timeline({ defaults: { ease: "expo.out" }, onComplete: () => finish() })
      tlRef.current = tl
      tl.from(".intro-kicker", { y: 18, opacity: 0, duration: 0.6 }, 0.15)
        .from(".intro-letter", { y: 70, opacity: 0, duration: 0.85, stagger: 0.05 }, 0.25)
        .from(".intro-sub", { y: 16, opacity: 0, duration: 0.7 }, 0.9)
        .from(".intro-mapwrap", { y: 40, opacity: 0, duration: 0.9 }, 1.0)
        /* GPS pin drops from the sky onto the Main Gate */
        .from("#tour-pin", { y: -220, duration: 0.7, ease: "bounce.out" }, 1.5)
        .fromTo("#tour-shadow", { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, transformOrigin: "50% 50%" }, 1.5)
        .fromTo(".pin-ring", { scale: 0.4, opacity: 0.9 }, { scale: 2.4, opacity: 0, duration: 1.1, stagger: 0.35, ease: "power2.out", transformOrigin: "50% 50%" }, 1.9)
        /* fly the campus */
        .to(travel, { p: 1, duration: 3.0, ease: "power1.inOut", onUpdate: () => place(travel.p) }, 2.2)
        .to(".tour-stop-0", { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, 2.3)
        .to(".tour-stop-1", { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, 2.9)
        .to(".tour-stop-2", { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, 3.5)
        .to(".tour-stop-3", { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, 4.1)
        .to(".tour-stop-4", { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, 4.6)
        .to(".tour-stop-5", { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, 5.0)
        .to("#tour-endpill", { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.8)" }, 5.2)
        .to(".campus-intro-inner", { yPercent: -100, duration: 0.85, ease: "power4.inOut" }, 6.1)
    }, rootRef)
    const safety = window.setTimeout(() => finish(true), 11000)
    return () => { window.clearTimeout(safety); ctx.revert() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={rootRef} className="fixed inset-0 z-[90] overflow-y-auto bg-[#05080e]" role="dialog" aria-label="Welcome to edutechsrm">
      <style>{`
        .vapor-text{background:linear-gradient(100deg,#6ee7b7 5%,#a5f3fc 28%,#c4b5fd 50%,#f9a8d4 72%,#6ee7b7 95%);background-size:220% auto;-webkit-background-clip:text;background-clip:text;color:transparent;animation:vaporSlide 5s linear infinite}
        @keyframes vaporSlide{to{background-position:220% center}}
        .tour-stop{transform-box:fill-box}
        #tour-endpill{transform-box:fill-box}
        .pin-ring{transform-box:fill-box}
        #tour-shadow{transform-box:fill-box}
      `}</style>
      <div className="campus-intro-inner min-h-full">
        {/* vapour backdrop */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -top-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full blur-[110px]" style={{ background: "radial-gradient(closest-side, rgba(52,211,153,.20), transparent)" }} />
          <div className="absolute top-[38%] -left-32 h-[380px] w-[380px] rounded-full blur-[100px]" style={{ background: "radial-gradient(closest-side, rgba(167,139,250,.20), transparent)" }} />
          <div className="absolute top-[30%] -right-32 h-[380px] w-[380px] rounded-full blur-[100px]" style={{ background: "radial-gradient(closest-side, rgba(244,114,182,.14), transparent)" }} />
        </div>

        <button onClick={() => finish(true)} className="absolute right-4 top-4 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 text-xs font-bold text-zinc-300 backdrop-blur-xl transition hover:bg-white/[0.1]">
          <X className="h-3.5 w-3.5" /> Skip
        </button>

        <div className="relative z-10 mx-auto flex min-h-full w-full max-w-[1060px] flex-col items-center px-5 pb-10 pt-14 sm:pt-16">
          <p className="intro-kicker text-[11px] font-black uppercase tracking-[0.34em] text-emerald-300">Welcome to</p>
          <h1 className="font-display mt-3 text-center text-[clamp(3rem,11vw,6.5rem)] font-black leading-none tracking-tight" aria-label="edutechsrm">
            {"edutechsrm".split("").map((c, i) => (
              <span key={i} className="intro-letter vapor-text inline-block">{c}</span>
            ))}
          </h1>
          <p className="intro-sub mt-4 max-w-xl text-center text-sm leading-7 text-zinc-400">
            Your SRMIST KTR companion — timetable, attendance, marks, AI… and a living map of the whole campus. Watch the GPS fly it.
          </p>

          {/* live tour map */}
          <div className="intro-mapwrap relative mt-8 w-full overflow-hidden rounded-[28px] border border-white/10 bg-[#070c14]/90 shadow-[0_30px_90px_rgba(0,0,0,.55)]">
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-3 sm:px-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300">
                <LocateFixed className="h-3.5 w-3.5" /> GPS · Live tour
              </span>
              <span id="tour-coords" className="font-mono text-[11px] font-semibold text-zinc-400">12.8210°N · 80.0385°E</span>
              <span className="hidden rounded-full bg-white/[0.05] px-3 py-1 text-[10px] font-bold text-zinc-400 sm:inline">100+ places mapped</span>
            </div>
            <svg viewBox="0 0 800 520" className="block h-auto w-full" role="img" aria-label="Animated GPS tour of SRM Kattankulathur campus">
              <defs>
                <pattern id="tour-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M40,0 H0 V40" fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="1" />
                </pattern>
                <linearGradient id="pinGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#6ee7b7" /><stop offset="100%" stopColor="#10b981" />
                </linearGradient>
                <radialGradient id="lakeGrad" cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0%" stopColor="rgba(56,189,248,.5)" /><stop offset="100%" stopColor="rgba(56,189,248,.08)" />
                </radialGradient>
              </defs>
              <rect width="800" height="520" fill="url(#tour-grid)" />
              {/* roads */}
              <path d="M40,470 C220,440 300,420 420,400 S640,360 770,330" fill="none" stroke="rgba(255,255,255,.09)" strokeWidth="10" strokeLinecap="round" />
              <path d="M200,40 C240,180 260,320 250,480" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="8" strokeLinecap="round" />
              <path d="M520,60 C540,180 560,300 600,470" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="8" strokeLinecap="round" />
              {/* lake */}
              <ellipse cx="250" cy="478" rx="120" ry="24" fill="url(#lakeGrad)" />
              <text x="250" y="482" textAnchor="middle" fontSize="11" fontWeight="700" fill="#7dd3fc" opacity="0.9">SRM Lake</text>
              {/* blocks */}
              {[
                { x: 60, y: 400, w: 100, h: 44, t: "Main Gate" },
                { x: 250, y: 296, w: 100, h: 44, t: "UB Block" },
                { x: 388, y: 246, w: 96, h: 44, t: "Clock Twr" },
                { x: 544, y: 246, w: 96, h: 44, t: "Tech Park" },
                { x: 596, y: 352, w: 100, h: 44, t: "Java Green" },
                { x: 420, y: 402, w: 110, h: 44, t: "Library" },
              ].map((b) => (
                <g key={b.t}>
                  <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="12" fill="rgba(255,255,255,.045)" stroke="rgba(255,255,255,.12)" />
                  <text x={b.x + b.w / 2} y={b.y + b.h / 2 + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="#d4d4d8">{b.t}</text>
                </g>
              ))}
              <g opacity="0.85">
                <circle cx="60" cy="240" r="5" fill="#fb923c" />
                <text x="74" y="244" fontSize="11" fontWeight="700" fill="#a1a1aa">Potheri Stn</text>
              </g>
              {/* route */}
              <path id="tour-route" d={ROUTE_D} fill="none" stroke="#34d399" strokeWidth="3.5" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 8px rgba(52,211,153,.8))" }} />
              {/* stop chips */}
              {STOPS.map((s, i) => (
                <g key={s.label} className={`tour-stop tour-stop-${i}`}>
                  <rect x={s.x - 62} y={s.y - 62} width="124" height="26" rx="13" fill="rgba(7,12,20,.92)" stroke="rgba(52,211,153,.45)" />
                  <text x={s.x} y={s.y - 44} textAnchor="middle" fontSize="12" fontWeight="800" fill="#a7f3d0">{s.label}</text>
                  <circle cx={s.x} cy={s.y} r="5" fill="#34d399" stroke="#052e22" strokeWidth="2" />
                </g>
              ))}
              {/* GPS pin */}
              <g id="tour-pin">
                <ellipse id="tour-shadow" cx="0" cy="4" rx="15" ry="5" fill="rgba(0,0,0,.5)" />
                <circle className="pin-ring" cx="0" cy="-8" r="10" fill="none" stroke="#34d399" strokeWidth="2" />
                <circle className="pin-ring" cx="0" cy="-8" r="10" fill="none" stroke="#34d399" strokeWidth="2" />
                <path d="M0,-40 C-15,-40 -24,-28 -24,-15 C-24,3 0,24 0,24 C0,24 24,3 24,-15 C24,-28 15,-40 0,-40 Z" fill="url(#pinGrad)" stroke="#052e22" strokeWidth="2" />
                <circle cx="0" cy="-15" r="8" fill="#052e22" />
                <circle cx="0" cy="-15" r="3.5" fill="#fff" />
              </g>
              {/* end pill */}
              <g id="tour-endpill" className="cursor-pointer" onClick={() => finish(true)}>
                <rect x="286" y="452" width="228" height="44" rx="22" fill="#34d399" />
                <text x="400" y="480" textAnchor="middle" fontSize="15" fontWeight="900" fill="#052e22">Enter Campus Explore →</text>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────── Campus Explore showcase (landing section) ─────────────── */

interface CampusHub {
  id: number
  key: string
  name: string
  icon: string
  badge: string
  floors: string
  category: BuildingCategory
  coords: string
  distance: string
  desc: string
  tip: string
  x: number
  y: number
  lat: number
  lng: number
}

const CAMPUS_HUBS: CampusHub[] = [
  {
    id: 2,
    key: "tp",
    name: "Tech Park (TP1 & TP2)",
    icon: "💻",
    badge: "15 Storeys",
    floors: "15 Floors",
    category: "academic",
    coords: "12.8246°N · 80.0453°E",
    distance: "350m from Main Gate",
    desc: "15-storey twin tech towers housing CSE, AIML labs, incubation cell, and 650-seat canteen.",
    tip: "Take the rear elevator early or stairs to 4th floor.",
    x: 580,
    y: 190,
    lat: 12.824648,
    lng: 80.045330,
  },
  {
    id: 1,
    key: "ub",
    name: "University Building (UB)",
    icon: "🏛️",
    badge: "Tallest Block",
    floors: "15 Floors",
    category: "academic",
    coords: "12.8233°N · 80.0424°E",
    distance: "200m from Main Gate",
    desc: "Central landmark with Central Library (1.5L sq ft), dean offices, and 6th-floor rooftop Amul canteen.",
    tip: "Amul milkshake counter on 6th floor terrace.",
    x: 320,
    y: 250,
    lat: 12.823308,
    lng: 80.042450,
  },
  {
    id: 43,
    key: "java",
    name: "Java Green Food Court",
    icon: "🍜",
    badge: "20 Food Stalls",
    floors: "Ground Level",
    category: "food",
    coords: "12.8236°N · 80.0440°E",
    distance: "280m from Main Gate",
    desc: "The campus culinary hub: Shawarma, Subway, Emo Restaurant (Shop 8), and late-night snacks.",
    tip: "Go between 12:45 and 1:15 PM for fresh hot shawarma.",
    x: 620,
    y: 330,
    lat: 12.823636,
    lng: 80.044062,
  },
  {
    id: 14,
    key: "library",
    name: "Central Library",
    icon: "📚",
    badge: "1.5L sq ft",
    floors: "3 Floors",
    category: "facilities",
    coords: "12.8232°N · 80.0425°E",
    distance: "210m from Main Gate",
    desc: "Air-conditioned 1,50,000 sq ft research sanctuary with 1.5+ lakh books and digital reading rooms.",
    tip: "3rd floor carrels have silent charging sockets.",
    x: 420,
    y: 320,
    lat: 12.823285,
    lng: 80.042586,
  },
  {
    id: 35,
    key: "potheri",
    name: "Main Gate & Potheri Stn",
    icon: "🚉",
    badge: "Transit Link",
    floors: "Ground Hub",
    category: "transport",
    coords: "12.8220°N · 80.0385°E",
    distance: "Origin (0m)",
    desc: "Direct walkway to Potheri Railway Station. Regular EMU local trains straight to Tambaram and Chennai Beach.",
    tip: "Trains run every 15-20 mins toward Chennai.",
    x: 120,
    y: 370,
    lat: 12.822000,
    lng: 80.038500,
  },
]

export function CampusShowcase() {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const [activeHub, setActiveHub] = useState<CampusHub>(CAMPUS_HUBS[0])
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap")

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return BUILDINGS.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.shortDesc.toLowerCase().includes(q) ||
        CATEGORY_META[b.category].label.toLowerCase().includes(q),
    ).slice(0, 6)
  }, [query])

  useEffect(() => { setActiveIdx(0) }, [query])

  const goBuilding = (id: number | null, q: string) => {
    const params = new URLSearchParams()
    if (q.trim()) params.set("q", q.trim())
    if (id !== null) params.set("b", String(id))
    window.location.href = `/explore?${params.toString()}`
  }

  const selectBuilding = (b: (typeof BUILDINGS)[0]) => {
    setActiveHub({
      id: b.id,
      key: `b-${b.id}`,
      name: b.name,
      icon: b.icon,
      badge: CATEGORY_META[b.category].label,
      floors: "Campus Block",
      category: b.category,
      coords: `${b.lat.toFixed(4)}°N · ${b.lng.toFixed(4)}°E`,
      distance: "SRM KTR Campus",
      desc: b.shortDesc,
      tip: "Click Open Explorer for indoor room finder & navigation.",
      x: 400,
      y: 240,
      lat: b.lat,
      lng: b.lng,
    })
    setQuery(b.name)
    setOpen(false)
  }

  return (
    <section id="campus" data-od-id="campus-showcase" className="mx-auto w-full max-w-[1280px] px-5 py-20 sm:px-8 lg:py-28 scroll-mt-24">
      {/* Container with sleek architectural borders and deep backdrop blur */}
      <div className="gs-reveal relative grid items-center gap-10 lg:gap-14 overflow-hidden rounded-[36px] border border-white/[0.08] bg-[#070b12]/90 p-6 sm:p-10 lg:p-12 lg:grid-cols-[1.12fr_.88fr] backdrop-blur-3xl shadow-[0_30px_100px_-20px_rgba(0,0,0,0.85)]">
        
        {/* Ambient atmospheric lighting */}
        <div className="pointer-events-none absolute -top-32 right-12 h-96 w-96 rounded-full blur-[130px]" style={{ background: "radial-gradient(closest-side, rgba(52,211,153,.15), transparent)" }} aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-32 left-12 h-80 w-80 rounded-full blur-[120px]" style={{ background: "radial-gradient(closest-side, rgba(56,189,248,.12), transparent)" }} aria-hidden="true" />

        {/* ── Left Side: Interactive Real Campus Cartography Cockpit ── */}
        <div className="relative flex flex-col overflow-hidden rounded-[28px] border border-white/[0.10] bg-[#05080e] shadow-2xl campus-cockpit">
          
          {/* Top telemetry bar */}
          <div className="flex items-center justify-between border-b border-white/[0.07] bg-white/[0.02] px-4 py-3 sm:px-5 cockpit-topbar">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                SRMIST KTR · LIVE MAP
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden font-mono text-[10px] text-zinc-400 sm:inline">
                {activeHub.coords}
              </span>
              <div className="cockpit-map-toggle flex rounded-full border border-white/10 bg-black/50 p-0.5">
                <button
                  onClick={() => setMapType("roadmap")}
                  className={`rounded-full px-2.5 py-1 text-[10px] font-mono transition ${
                    mapType === "roadmap"
                      ? "active bg-emerald-400/20 text-emerald-300 font-bold"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Map
                </button>
                <button
                  onClick={() => setMapType("satellite")}
                  className={`rounded-full px-2.5 py-1 text-[10px] font-mono transition ${
                    mapType === "satellite"
                      ? "active bg-emerald-400/20 text-emerald-300 font-bold"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Satellite
                </button>
              </div>
            </div>
          </div>

          {/* Search bar inside cockpit */}
          <div className="relative border-b border-white/[0.06] bg-black/40 px-4 py-2.5 sm:px-5 cockpit-searchbar">
            <div className="relative flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 transition focus-within:border-emerald-400/50">
              <Search className="h-4 w-4 shrink-0 text-zinc-400" />
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
                onFocus={() => setOpen(true)}
                onBlur={() => window.setTimeout(() => setOpen(false), 200)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown" && results.length > 0) { e.preventDefault(); setActiveIdx((i) => (i + 1) % results.length) }
                  else if (e.key === "ArrowUp" && results.length > 0) { e.preventDefault(); setActiveIdx((i) => (i - 1 + results.length) % results.length) }
                  else if (e.key === "Enter") {
                    const pick = results[activeIdx] ?? results[0]
                    if (pick) selectBuilding(pick)
                  }
                  else if (e.key === "Escape") setOpen(false)
                }}
                placeholder="Search 100+ blocks, faculty cabins, labs & food stalls…"
                aria-label="Search campus buildings"
                className="w-full bg-transparent text-xs text-zinc-100 placeholder-zinc-500 outline-none font-sans"
              />
              <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-mono text-zinc-400 hidden sm:inline">
                ESC
              </span>
            </div>

            {/* Instant auto-suggest dropdown */}
            {open && results.length > 0 && (
              <div className="absolute left-4 right-4 top-[56px] z-30 overflow-hidden rounded-2xl border border-white/15 bg-[#090d16]/98 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
                {results.map((b, i) => (
                  <button
                    key={b.id}
                    onMouseDown={(e) => { e.preventDefault(); selectBuilding(b) }}
                    onMouseEnter={() => setActiveIdx(i)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${i === activeIdx ? "bg-white/[0.08]" : "hover:bg-white/[0.04]"}`}
                  >
                    <span className="shrink-0 text-lg">{b.icon}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold text-zinc-100">{b.name}</span>
                      <span className="block truncate text-[11px] text-zinc-400">{b.shortDesc}</span>
                    </span>
                    <span className="shrink-0 text-[10px] font-mono font-bold uppercase tracking-wider" style={{ color: CATEGORY_META[b.category].color }}>
                      {CATEGORY_META[b.category].label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Real Google Maps Screen Area */}
          <div className="relative h-[360px] sm:h-[420px] w-full overflow-hidden bg-[#0a0f16]">
            <iframe
              key={`${activeHub.lat}-${activeHub.lng}-${mapType}`}
              title={`Live Campus Map - ${activeHub.name}`}
              src={`https://www.google.com/maps?q=${activeHub.lat},${activeHub.lng}&z=17&t=${mapType === "satellite" ? "k" : "m"}&output=embed`}
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />

            {/* Real GPS Coordinates Pill at top-left of map */}
            <div className="pointer-events-none absolute top-3 left-3 z-10 flex items-center gap-2 rounded-full border border-black/40 bg-black/80 px-3 py-1 text-[10px] font-mono text-emerald-300 backdrop-blur-md shadow-lg">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE GPS // {activeHub.coords}</span>
            </div>

            {/* Floating Real Hub Info Card (Bottom Overlay) */}
            <div className="absolute inset-x-2.5 bottom-2.5 sm:inset-x-4 sm:bottom-4 z-20 flex items-center justify-between gap-2 sm:gap-3 rounded-2xl border border-white/15 bg-[#080d16]/95 p-2.5 sm:p-3.5 shadow-2xl backdrop-blur-xl campus-infocard">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-lg sm:text-xl">
                  {activeHub.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="truncate font-display text-xs sm:text-sm font-bold text-white campus-hub-title">
                      {activeHub.name.replace(" (TP1 & TP2)", "")}
                      {activeHub.name.includes(" (TP1 & TP2)") && (
                        <span className="hidden sm:inline"> (TP1 &amp; TP2)</span>
                      )}
                    </h4>
                    <span className="hidden sm:inline-block rounded-full bg-emerald-400/15 border border-emerald-400/30 px-2 py-0.5 text-[9px] font-mono font-bold text-emerald-300 shrink-0">
                      {activeHub.badge}
                    </span>
                  </div>
                  <p className="truncate font-mono text-[9px] sm:text-[10px] text-zinc-300 mt-0.5 campus-hub-meta">
                    <span className="sm:hidden text-emerald-400 font-bold">{activeHub.badge} · </span>
                    {activeHub.distance} · {activeHub.floors}
                  </p>
                </div>
              </div>

              <button
                onClick={() => goBuilding(activeHub.id, "")}
                className="shrink-0 inline-flex items-center gap-1 rounded-full bg-emerald-400 px-3 py-1.5 sm:px-3.5 sm:py-1.5 text-[10px] sm:text-[11px] font-bold text-black transition hover:bg-emerald-300 shadow-md active:scale-95"
              >
                <span>Explore</span>
                <Navigation className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Interactive Landmark Hub Switcher strip */}
          <div className="cockpit-hubs-bar flex items-center gap-2 overflow-x-auto border-t border-white/[0.06] bg-black/50 p-2.5 scrollbar-none sm:px-4">
            <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 shrink-0 pl-1">
              KEY HUBS:
            </span>
            {CAMPUS_HUBS.map((hub) => (
              <button
                key={hub.key}
                onClick={() => setActiveHub(hub)}
                className={`cockpit-hub-btn shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-mono transition ${
                  activeHub.key === hub.key
                    ? "active-hub bg-white/15 border border-white/20 text-white font-bold"
                    : "bg-white/[0.03] border border-white/[0.06] text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <span>{hub.icon}</span>
                <span>{hub.name.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Right Side: Confident Editorial Typography ── */}
        <div className="flex flex-col justify-center text-center lg:text-left">
          <div className="mx-auto inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3.5 py-1 text-[11px] font-mono uppercase tracking-[0.2em] text-emerald-300 lg:mx-0">
            <MapPin className="h-3 w-3 text-emerald-400 animate-pulse" />
            <span>003 // Campus Cartography</span>
          </div>

          <h2 className="font-display mt-5 text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-[3.2rem] leading-[1.0] text-balance">
            Where is the class?
            <br />
            <span className="font-serif italic font-normal text-emerald-300">
              Find the room before the professor does.
            </span>
          </h2>

          <div className="mt-3">
            <span className="font-hand text-2xl sm:text-3xl text-amber-300/90 select-none">
              ↳ &ldquo;TP elevators broken again. Take the stairs to 4th floor.&rdquo;
            </span>
          </div>

          <p className="mx-auto mt-4 max-w-lg text-sm sm:text-base leading-relaxed text-zinc-300 font-sans lg:mx-0">
            Every block, lab, food stall, and faculty cabin on one living map. Built specifically for SRMIST KTR&apos;s sprawling 250-acre campus with walk estimates and floor directories.
          </p>

          {/* 4-Metric Architectural Telemetry */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto lg:mx-0 text-left">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3">
              <span className="block font-display text-xl font-bold text-white">100+</span>
              <span className="block font-mono text-[10px] text-zinc-400 uppercase tracking-wider mt-0.5">Verified Hubs</span>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3">
              <span className="block font-display text-xl font-bold text-emerald-300">15</span>
              <span className="block font-mono text-[10px] text-zinc-400 uppercase tracking-wider mt-0.5">TP & UB Floors</span>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3">
              <span className="block font-display text-xl font-bold text-amber-300">20+</span>
              <span className="block font-mono text-[10px] text-zinc-400 uppercase tracking-wider mt-0.5">Java Food Stalls</span>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3">
              <span className="block font-display text-xl font-bold text-cyan-300">0s</span>
              <span className="block font-mono text-[10px] text-zinc-400 uppercase tracking-wider mt-0.5">Login Required</span>
            </div>
          </div>

          {/* Call to action */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <button
              onClick={() => { window.location.href = "/explore" }}
              className="btn-shine w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-emerald-300 to-teal-300 px-8 py-4 text-xs font-mono font-bold uppercase tracking-wider text-zinc-950 shadow-[0_12px_30px_rgba(52,211,153,.25)] transition hover:brightness-110 active:scale-[0.98]"
            >
              <Navigation className="h-4 w-4" />
              <span>Launch Campus Radar</span>
            </button>
            <button
              onClick={() => { window.location.href = "/explore?cat=academic" }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-6 py-3.5 text-xs font-mono font-semibold text-zinc-300 backdrop-blur-md transition hover:bg-white/[0.08] hover:text-white active:scale-[0.98]"
            >
              <span>Explore Blocks</span>
            </button>
          </div>

          <p className="mt-3 text-[11px] font-mono text-zinc-500 text-center lg:text-left">
            Accessible to all students, faculty, parents, and campus visitors with zero authentication.
          </p>
        </div>

      </div>
    </section>
  )
}

