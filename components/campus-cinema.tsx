"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import gsap from "gsap"
import {
  ArrowUpRight,
  Building2,
  Compass,
  ExternalLink,
  GraduationCap,
  LocateFixed,
  MapPin,
  Navigation,
  Radio,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react"
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

type BuildingCategory = "academic" | "hostel" | "food" | "sports" | "facilities" | "transport" | "medical" | string

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

interface LiveFaculty {
  id: number
  name: string
  role: string
  dept: string
  cabin: string
  block: string
  floor: string
  status: "In Cabin" | "Available" | "Office Hours"
  statusColor: string
  photo: string
}

function FacultyPhoto({ name, photo, isPoster }: { name: string; photo?: string; isPoster?: boolean }) {
  const [error, setError] = useState(false)
  const initials = useMemo(() => {
    const clean = name.replace(/^(Dr\.|Dr|Prof\.|Prof|Mr\.|Mr|Mrs\.|Mrs|Ms\.|Ms)\s*/i, "").trim()
    const parts = clean.split(" ").filter(Boolean)
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    return clean.slice(0, 2).toUpperCase() || "SR"
  }, [name])

  const proxied = photo && !error ? `/api/finder/image?url=${encodeURIComponent(photo)}` : null

  return (
    <div
      className={`w-9 h-9 rounded-xl overflow-hidden border flex items-center justify-center text-[10px] font-black shrink-0 ${
        isPoster
          ? "border-2 border-[#111111] bg-[#f0eee6] text-[#111111] shadow-[1px_1px_0px_#111111]"
          : "border border-white/15 bg-white/10 text-emerald-300"
      }`}
    >
      {proxied ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={proxied}
          alt={name}
          className="w-full h-full object-cover object-top"
          onError={() => setError(true)}
          loading="lazy"
        />
      ) : (
        <span className="tracking-wider">{initials}</span>
      )}
    </div>
  )
}

const LIVE_FACULTY_FEED: LiveFaculty[] = [
  {
    id: 102688,
    name: "Dr. Lakshmi M",
    role: "Professor & Head",
    dept: "Networking & Comms",
    cabin: "TP 411",
    block: "Tech Park",
    floor: "4th Floor",
    status: "In Cabin",
    statusColor: "#34d399",
    photo: "https://www.srmist.edu.in/wp-content/uploads/2024/04/DSC_4325.jpg",
  },
  {
    id: 100158,
    name: "Dr. Malathy C",
    role: "Professor",
    dept: "Networking & Comms",
    cabin: "TP 1310",
    block: "Tech Park",
    floor: "13th Floor",
    status: "Available",
    statusColor: "#38bdf8",
    photo: "https://www.srmist.edu.in/wp-content/uploads/2024/04/DSC_4309.jpg",
  },
  {
    id: 102223,
    name: "Dr. Supraja P",
    role: "Associate Professor",
    dept: "Computing",
    cabin: "UB 402",
    block: "University Bldg",
    floor: "4th Floor",
    status: "In Cabin",
    statusColor: "#34d399",
    photo: "https://www.srmist.edu.in/wp-content/uploads/2024/04/Supraja-600x600-1.jpg",
  },
  {
    id: 100631,
    name: "Dr. Mukesh Krishnan",
    role: "Professor",
    dept: "Networking & Comms",
    cabin: "TP 309",
    block: "Tech Park",
    floor: "3rd Floor",
    status: "Office Hours",
    statusColor: "#fbbf24",
    photo: "https://www.srmist.edu.in/wp-content/uploads/2024/04/DSC_3768.jpg",
  },
  {
    id: 102693,
    name: "Dr. Krishnaraj N",
    role: "Professor",
    dept: "AI & Data Science",
    cabin: "TP 403A",
    block: "Tech Park",
    floor: "4th Floor",
    status: "In Cabin",
    statusColor: "#34d399",
    photo: "https://www.srmist.edu.in/wp-content/uploads/2024/04/DSC_3751.jpg",
  },
  {
    id: 100160,
    name: "Dr. Annapurani K",
    role: "Professor",
    dept: "Computer Science",
    cabin: "TP2 - FR310",
    block: "Tech Park 2",
    floor: "3rd Floor",
    status: "Available",
    statusColor: "#38bdf8",
    photo: "https://www.srmist.edu.in/wp-content/uploads/2024/04/DSC_3760.jpg",
  },
  {
    id: 102462,
    name: "Dr. Vinoth Kumar C N S",
    role: "Professor",
    dept: "Cyber Security",
    cabin: "TP 512",
    block: "Tech Park",
    floor: "5th Floor",
    status: "In Cabin",
    statusColor: "#34d399",
    photo: "https://www.srmist.edu.in/wp-content/uploads/2026/04/004a3f4a-72ff-4b17-8bc3-0dc8dde3efb6-1.jpg",
  },
  {
    id: 102068,
    name: "Dr. Anand L",
    role: "Associate Professor",
    dept: "IoT & Cloud",
    cabin: "TP 211",
    block: "Tech Park",
    floor: "2nd Floor",
    status: "Office Hours",
    statusColor: "#fbbf24",
    photo: "https://www.srmist.edu.in/wp-content/uploads/2024/04/DSC_3815.jpg",
  },
]

export function CampusShowcase({ isPoster: propIsPoster }: { isPoster?: boolean } = {}) {
  const [internalPoster, setInternalPoster] = useState(false)
  useEffect(() => {
    const check = () => {
      if (typeof document !== "undefined") {
        const mode = document.documentElement.getAttribute("data-landing-mode")
        setInternalPoster(mode === "poster")
      }
    }
    check()
    window.addEventListener("landing-mode-change", check)
    return () => window.removeEventListener("landing-mode-change", check)
  }, [])
  const isPoster = propIsPoster ?? internalPoster

  // Card 1: Map State
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const [activeHub, setActiveHub] = useState<CampusHub>(CAMPUS_HUBS[0])
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap")

  // Card 2: Faculty Radar & Live Feed State
  const [facultyFilter, setFacultyFilter] = useState<"ALL" | "TP" | "UB" | "CSE">("ALL")
  const [facultyQuery, setFacultyQuery] = useState("")
  const [feedOffset, setFeedOffset] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [apiResults, setApiResults] = useState<Array<{id: number | string; name: string; dept: string; cabin: string; block: string; floor: string; status: string; statusColor: string; photo: string}>>([])
  const [isSearching, setIsSearching] = useState(false)

  // Debounced API search for full faculty database
  useEffect(() => {
    if (!facultyQuery.trim() || facultyQuery.trim().length < 2) {
      setApiResults([])
      setIsSearching(false)
      return
    }
    setIsSearching(true)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/finder?q=${encodeURIComponent(facultyQuery.trim())}&limit=6`)
        if (res.ok) {
          const data = (await res.json()) as { faculty?: Array<{ id?: string; facultyId?: string; name?: string; department?: string; staffRoom?: string; designation?: string; college?: string }> }
          const mapped = (data.faculty || []).map((r: { id?: string; facultyId?: string; name?: string; department?: string; staffRoom?: string; designation?: string; college?: string }) => ({
            id: r.facultyId || r.id || Math.random(),
            name: r.name || "Unknown",
            dept: r.department || "",
            cabin: r.staffRoom || "—",
            block: "",
            floor: "",
            status: "Faculty",
            statusColor: "#34d399",
            photo: "",
          }))
          setApiResults(mapped)
        }
      } catch { /* ignore */ }
      setIsSearching(false)
    }, 350)
    return () => clearTimeout(timer)
  }, [facultyQuery])

  // Auto-cycle faculty feed
  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      setFeedOffset((prev) => (prev + 1) % LIVE_FACULTY_FEED.length)
    }, 3800)
    return () => clearInterval(timer)
  }, [isPaused])

  const filteredFaculty = useMemo(() => {
    let list = LIVE_FACULTY_FEED
    if (facultyFilter === "TP") list = list.filter((f) => f.block.includes("Tech Park"))
    else if (facultyFilter === "UB") list = list.filter((f) => f.block.includes("University"))
    else if (facultyFilter === "CSE") list = list.filter((f) => f.dept.includes("Cyber") || f.dept.includes("AI") || f.dept.includes("Computer"))

    if (facultyQuery.trim()) {
      const q = facultyQuery.toLowerCase()
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.cabin.toLowerCase().includes(q) ||
          f.dept.toLowerCase().includes(q) ||
          f.block.toLowerCase().includes(q),
      )
    }
    return list
  }, [facultyFilter, facultyQuery])

  // Get items for faculty feed / search results
  const visibleFaculty = useMemo(() => {
    if (facultyQuery.trim().length >= 1) {
      if (apiResults.length > 0) return apiResults.slice(0, 4)
      return filteredFaculty.slice(0, 4)
    }
    if (filteredFaculty.length <= 2) return filteredFaculty
    return [
      filteredFaculty[feedOffset % filteredFaculty.length],
      filteredFaculty[(feedOffset + 1) % filteredFaculty.length],
    ]
  }, [filteredFaculty, feedOffset, facultyQuery, apiResults])

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

  const handleFacultySearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (facultyQuery.trim()) {
      window.location.href = `/faculty?q=${encodeURIComponent(facultyQuery.trim())}`
    } else {
      window.location.href = "/faculty"
    }
  }

  return (
    <section id="campus" data-od-id="campus-showcase" className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-8 lg:py-24 scroll-mt-24">
      <style>{`
        @keyframes beaconBlink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(0.8); }
        }
        @keyframes beaconRing {
          0% { r: 3.5; opacity: 0.85; stroke-width: 1.5; }
          70% { r: 10; opacity: 0; stroke-width: 0.5; }
          100% { r: 10; opacity: 0; stroke-width: 0; }
        }
        .beacon-dot-1 {
          animation: beaconBlink 1.8s ease-in-out infinite;
          transform-origin: center;
        }
        .beacon-dot-2 {
          animation: beaconBlink 2.2s ease-in-out infinite 0.5s;
          transform-origin: center;
        }
        .beacon-dot-3 {
          animation: beaconBlink 2.0s ease-in-out infinite 1.0s;
          transform-origin: center;
        }
        .beacon-dot-4 {
          animation: beaconBlink 2.4s ease-in-out infinite 1.4s;
          transform-origin: center;
        }
        .beacon-ring-1 {
          animation: beaconRing 2.4s cubic-bezier(0, 0.2, 0.8, 1) infinite;
        }
        .beacon-ring-2 {
          animation: beaconRing 2.6s cubic-bezier(0, 0.2, 0.8, 1) infinite 0.6s;
        }
        .beacon-ring-3 {
          animation: beaconRing 2.4s cubic-bezier(0, 0.2, 0.8, 1) infinite 1.2s;
        }
        .beacon-ring-4 {
          animation: beaconRing 2.8s cubic-bezier(0, 0.2, 0.8, 1) infinite 1.6s;
        }
      `}</style>

      {/* ── Section Header ── */}
      <div className="gs-reveal mb-8 sm:mb-12 text-center max-w-2xl mx-auto">
        <div
          className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-[11px] font-mono uppercase tracking-[0.2em] mb-3 transition-colors ${
            isPoster
              ? "border-2 border-[#111111] bg-white text-[#111111] shadow-[2px_2px_0px_#111111]"
              : "border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 backdrop-blur-md"
          }`}
        >
          <span className={`h-2 w-2 rounded-full animate-ping ${isPoster ? "bg-[#111111]" : "bg-emerald-400"}`} />
          <span>003 // Campus Cartography &amp; Faculty Radar</span>
        </div>
        <h2 className={`font-display text-2xl sm:text-4xl lg:text-[2.8rem] font-black tracking-tight leading-[1.1] ${isPoster ? "text-[#111111]" : "text-white"}`}>
          Instant Campus Map.{" "}
          <span className={isPoster ? "font-serif italic font-normal" : "font-serif italic font-normal text-emerald-300"}>
            Live Faculty Cabins.
          </span>
        </h2>
      </div>

      {/* ── 2 Segregated Balanced Cards Grid with Generous Breathing Room ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch max-w-6xl mx-auto">

        {/* ════════════════ CARD 1: Campus Cartography (Map Cockpit) ════════════════ */}
        <div
          className={`relative flex flex-col justify-between overflow-hidden rounded-2xl transition-all duration-300 ${
            isPoster
              ? "bg-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] text-[#111111]"
              : "bg-[#090d15] border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.5)] text-white"
          }`}
        >
          {/* Top Content Area */}
          <div className="flex flex-col">
            {/* Top Telemetry Bar */}
            <div
              className={`flex items-center justify-between border-b px-4 py-3 sm:px-5 ${
                isPoster ? "border-[#111111] bg-[#f7f5f0]" : "border-white/[0.08] bg-white/[0.02]"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPoster ? "bg-[#111111]" : "bg-emerald-400"}`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isPoster ? "bg-[#111111]" : "bg-emerald-400"}`} />
                </span>
                <span className={`font-mono text-[10px] font-black uppercase tracking-[0.18em] ${isPoster ? "text-[#111111]" : "text-emerald-400"}`}>
                  CAMPUS RADAR // KTR
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`font-mono text-[9px] ${isPoster ? "text-zinc-600 font-bold" : "text-zinc-400"}`}>
                  {activeHub.coords}
                </span>
                <div
                  className={`flex rounded-full p-0.5 ${
                    isPoster ? "border border-[#111111] bg-white" : "border border-white/10 bg-black/50"
                  }`}
                >
                  <button
                    onClick={() => setMapType("roadmap")}
                    className={`rounded-full px-2 py-0.5 text-[9px] font-mono transition cursor-pointer ${
                      mapType === "roadmap"
                        ? isPoster
                          ? "bg-[#111111] text-white font-bold keep-white"
                          : "bg-emerald-400/20 text-emerald-300 font-bold"
                        : isPoster
                          ? "text-zinc-500 hover:text-black"
                          : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Map
                  </button>
                  <button
                    onClick={() => setMapType("satellite")}
                    className={`rounded-full px-2 py-0.5 text-[9px] font-mono transition cursor-pointer ${
                      mapType === "satellite"
                        ? isPoster
                          ? "bg-[#111111] text-white font-bold keep-white"
                          : "bg-emerald-400/20 text-emerald-300 font-bold"
                        : isPoster
                          ? "text-zinc-500 hover:text-black"
                          : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Sat
                  </button>
                </div>
              </div>
            </div>

            {/* Integrated Search */}
            <div
              className={`relative border-b px-3.5 py-2 sm:px-4 ${
                isPoster ? "border-[#111111] bg-[#ffffff]" : "border-white/[0.06] bg-black/40"
              }`}
            >
              <div
                className={`relative flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition ${
                  isPoster ? "border border-[#111111] bg-[#f7f5f0]" : "border border-white/10 bg-white/[0.03] focus-within:border-emerald-400/40"
                }`}
              >
                <Search className={`h-3.5 w-3.5 shrink-0 ${isPoster ? "text-zinc-600" : "text-zinc-400"}`} />
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
                  placeholder="Search 100+ blocks, labs & food stalls…"
                  aria-label="Search campus buildings"
                  className={`w-full bg-transparent text-xs outline-none font-sans ${
                    isPoster ? "text-[#111111] placeholder-zinc-500" : "text-zinc-100 placeholder-zinc-500"
                  }`}
                />
                {query && (
                  <button onClick={() => { setQuery(""); setOpen(false) }} className="text-zinc-400 hover:text-zinc-200">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Autocomplete Dropdown */}
              {open && results.length > 0 && (
                <div
                  className={`absolute left-3.5 right-3.5 top-[44px] z-30 overflow-hidden rounded-xl border shadow-xl ${
                    isPoster ? "bg-white border-2 border-[#111111] text-[#111111]" : "bg-[#090d16] border-white/15 text-zinc-100 backdrop-blur-2xl"
                  }`}
                >
                  {results.map((b, i) => (
                    <button
                      key={b.id}
                      onMouseDown={(e) => { e.preventDefault(); selectBuilding(b) }}
                      onMouseEnter={() => setActiveIdx(i)}
                      className={`flex w-full items-center gap-2.5 px-3 py-1.5 text-left transition cursor-pointer ${
                        i === activeIdx ? (isPoster ? "bg-black/5 font-bold" : "bg-white/[0.08]") : ""
                      }`}
                    >
                      <span className="text-sm">{b.icon}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-bold">{b.name}</span>
                        <span className={`block truncate text-[10px] ${isPoster ? "text-zinc-600" : "text-zinc-400"}`}>{b.shortDesc}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Embedded Google Map Viewport */}
            <div className="relative h-[180px] w-full overflow-hidden bg-[#0a0f16]">
              <iframe
                key={`${activeHub.lat}-${activeHub.lng}-${mapType}`}
                title={`Live Campus Map - ${activeHub.name}`}
                src={`https://www.google.com/maps?q=${activeHub.lat},${activeHub.lng}&z=17&t=${mapType === "satellite" ? "k" : "m"}&output=embed`}
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />

              {/* Floating Active Hub Card Overlay */}
              <div
                className={`absolute inset-x-2.5 bottom-2 z-20 flex items-center justify-between gap-2 rounded-xl p-2 shadow-lg transition-all ${
                  isPoster
                    ? "bg-white/95 border-1.5 border-[#111111] text-[#111111] shadow-[2px_2px_0px_#111111]"
                    : "bg-[#080d16]/90 border border-white/15 text-white backdrop-blur-md"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm ${
                      isPoster ? "bg-[#f7f5f0] border border-[#111111]" : "bg-white/[0.08] border border-white/10"
                    }`}
                  >
                    {activeHub.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="truncate font-display text-[11px] font-bold">
                        {activeHub.name.replace(" (TP1 & TP2)", "")}
                      </h4>
                      <span
                        className={`rounded px-1 py-0.2 text-[8px] font-mono font-bold shrink-0 ${
                          isPoster ? "bg-[#111111] text-white keep-white" : "bg-emerald-400/20 text-emerald-300"
                        }`}
                      >
                        {activeHub.badge}
                      </span>
                    </div>
                    <p className={`truncate font-mono text-[9px] ${isPoster ? "text-zinc-600 font-bold" : "text-zinc-400"}`}>
                      {activeHub.distance} · {activeHub.floors}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => goBuilding(activeHub.id, "")}
                  className={`shrink-0 inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold transition cursor-pointer ${
                    isPoster
                      ? "bg-[#111111] text-white border border-[#111111] hover:bg-zinc-800 keep-white shadow-xs"
                      : "bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 hover:bg-emerald-400/30"
                  }`}
                >
                  <span>Explore</span>
                  <Navigation className="h-2.5 w-2.5" />
                </button>
              </div>
            </div>

            {/* Hub Selector Strip */}
            <div
              className={`flex items-center gap-1.5 overflow-x-auto border-t p-2 sm:p-2.5 scrollbar-none sm:px-4 ${
                isPoster ? "border-[#111111] bg-[#f7f5f0]" : "border-white/[0.06] bg-black/40"
              }`}
            >
              <span className={`font-mono text-[9px] uppercase tracking-wider shrink-0 pl-1 ${isPoster ? "text-zinc-600 font-bold" : "text-zinc-500"}`}>
                HUBS:
              </span>
              {CAMPUS_HUBS.map((hub) => (
                <button
                  key={hub.key}
                  onClick={() => setActiveHub(hub)}
                  className={`shrink-0 inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-mono transition cursor-pointer ${
                    activeHub.key === hub.key
                      ? isPoster
                        ? "bg-[#111111] text-white font-bold border-2 border-[#111111] keep-white shadow-[1px_1px_0px_#111111]"
                        : "bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 font-bold"
                      : isPoster
                        ? "bg-white border-2 border-[#111111]/30 text-[#111111] hover:border-[#111111]"
                        : "bg-white/[0.03] border border-white/[0.06] text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <span>{hub.icon}</span>
                  <span>{hub.name.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Bar */}
          <div className={`p-3 sm:p-4 border-t ${isPoster ? "border-[#111111] bg-[#faf8f5]" : "border-white/[0.08] bg-white/[0.01]"}`}>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => { window.location.href = "/explore" }}
                className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isPoster
                    ? "bg-[#111111] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-zinc-800 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none keep-white"
                    : "bg-zinc-900/90 hover:bg-zinc-800 text-emerald-400 border border-emerald-500/35 hover:border-emerald-400/60 shadow-sm"
                }`}
              >
                <span>Launch Campus Radar</span>
                <Navigation className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => { window.location.href = "/explore?cat=academic" }}
                className={`inline-flex items-center justify-center gap-1 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isPoster
                    ? "border-2 border-[#111111] bg-white text-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-zinc-100"
                    : "border border-white/12 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08]"
                }`}
              >
                <span>Blocks</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>


        {/* ════════════════ CARD 2: Faculty Cabin Radar & Live Directory ════════════════ */}
        <div
          className={`relative flex flex-col justify-between overflow-hidden rounded-2xl transition-all duration-300 ${
            isPoster
              ? "bg-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] text-[#111111]"
              : "bg-[#090d15] border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.5)] text-white"
          }`}
        >
          {/* Top Content Area */}
          <div className="flex flex-col">
            {/* Top Telemetry Bar */}
            <div
              className={`flex items-center justify-between border-b px-3.5 py-2.5 sm:px-4 ${
                isPoster ? "border-[#111111] bg-[#f7f5f0]" : "border-white/[0.08] bg-white/[0.02]"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPoster ? "bg-[#111111]" : "bg-sky-400"}`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isPoster ? "bg-[#111111]" : "bg-sky-400"}`} />
                </span>
                <span className={`font-mono text-[10px] font-black uppercase tracking-[0.18em] ${isPoster ? "text-[#111111]" : "text-sky-400"}`}>
                  CABIN RADAR // FACULTY
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-mono font-bold ${
                    isPoster
                      ? "bg-sky-100 text-sky-950 border border-sky-900/30"
                      : "bg-sky-400/15 border border-sky-400/30 text-sky-300"
                  }`}
                >
                  ● 2,400+ VERIFIED
                </span>
              </div>
            </div>

            {/* Integrated Search Bar */}
            <div
              className={`relative border-b px-3.5 py-2 sm:px-4 ${
                isPoster ? "border-[#111111] bg-[#ffffff]" : "border-white/[0.06] bg-black/40"
              }`}
            >
              <form onSubmit={handleFacultySearch}>
                <div
                  className={`relative flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition ${
                    isPoster ? "border border-[#111111] bg-[#f7f5f0]" : "border border-white/10 bg-white/[0.03] focus-within:border-sky-400/40"
                  }`}
                >
                  <Search className={`h-3.5 w-3.5 shrink-0 ${isPoster ? "text-zinc-600" : "text-zinc-400"}`} />
                  <input
                    value={facultyQuery}
                    onChange={(e) => setFacultyQuery(e.target.value)}
                    placeholder="Search 2,400+ faculty by name, cabin (e.g. TP411), dept…"
                    aria-label="Search faculty by name or cabin"
                    className={`w-full bg-transparent text-xs outline-none font-sans ${
                      isPoster ? "text-[#111111] placeholder-zinc-500" : "text-zinc-100 placeholder-zinc-500"
                    }`}
                  />
                  {facultyQuery && (
                    <button
                      type="button"
                      onClick={() => setFacultyQuery("")}
                      className="text-zinc-400 hover:text-zinc-200 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded cursor-pointer shrink-0 ${
                      isPoster ? "bg-[#111111] text-white keep-white" : "bg-sky-500/20 text-sky-300 border border-sky-500/30 hover:bg-sky-500/30"
                    }`}
                  >
                    Find
                  </button>
                </div>
              </form>
            </div>

            {/* Center Viewport */}
            <div className="relative min-h-[215px] w-full overflow-hidden flex flex-col justify-between">
              {facultyQuery.trim().length >= 1 ? (
                /* Search Results View */
                <div className="h-full overflow-y-auto p-3 space-y-2 scrollbar-none">
                  {isSearching ? (
                    <div className="h-full flex flex-col items-center justify-center gap-2 text-center py-8">
                      <span className="h-4 w-4 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
                      <span className="text-[11px] font-mono text-zinc-400">Scanning 2,400+ SRM faculty database...</span>
                    </div>
                  ) : visibleFaculty.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-8">
                      <p className={`text-xs font-bold ${isPoster ? "text-[#111111]" : "text-zinc-300"}`}>
                        No faculty found for &ldquo;{facultyQuery}&rdquo;
                      </p>
                      <p className="text-[10px] font-mono text-zinc-500 mt-1">
                        Press Enter or Find to search entire directory
                      </p>
                    </div>
                  ) : (
                    visibleFaculty.map((prof) => (
                      <div
                        key={prof.id}
                        onClick={() => { window.location.href = `/faculty?q=${encodeURIComponent(prof.name)}` }}
                        className={`group flex items-center justify-between gap-3 px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                          isPoster
                            ? "bg-[#f7f5f0] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-white hover:shadow-[3px_3px_0px_#111111]"
                            : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.07] hover:border-sky-400/30"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <FacultyPhoto name={prof.name} photo={prof.photo} isPoster={isPoster} />
                          <div className="min-w-0 flex-1">
                            <h4 className={`text-xs font-bold truncate group-hover:text-sky-500 transition-colors ${isPoster ? "text-[#111111]" : "text-white"}`}>
                              {prof.name}
                            </h4>
                            <p className="text-[9.5px] font-mono truncate text-zinc-500">{prof.dept}</p>
                          </div>
                        </div>
                        <span
                          className={`shrink-0 inline-flex items-center gap-1 font-mono font-bold text-[9px] px-2 py-1 rounded-lg ${
                            isPoster
                              ? "bg-[#111111] text-white keep-white"
                              : "bg-sky-400/15 text-sky-300 border border-sky-400/25"
                          }`}
                        >
                          <Building2 className="h-2.5 w-2.5" />
                          {prof.cabin}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                /* Idle Radar Art & Live Feed View */
                <div className="flex flex-col justify-between">
                  {/* Top Radar Art Canvas (~88px) */}
                  <div
                    className={`relative w-full h-[88px] overflow-hidden flex items-center justify-center border-b ${
                      isPoster ? "border-[#111111] bg-[#faf8f5]" : "border-white/[0.06] bg-[#05080e]"
                    }`}
                  >
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 360 88">
                      {/* Concentric rings */}
                      <circle cx="180" cy="44" r="18" fill="none" stroke={isPoster ? "#111111" : "rgba(255,255,255,0.12)"} strokeWidth={isPoster ? "1.5" : "1"} strokeDasharray="2 2" />
                      <circle cx="180" cy="44" r="36" fill="none" stroke={isPoster ? "#111111" : "rgba(255,255,255,0.14)"} strokeWidth={isPoster ? "1.5" : "1"} />
                      <circle cx="180" cy="44" r="58" fill="none" stroke={isPoster ? "#111111" : "rgba(255,255,255,0.08)"} strokeWidth="1" strokeDasharray="3 3" />
                      <circle cx="180" cy="44" r="82" fill="none" stroke={isPoster ? "#111111" : "rgba(255,255,255,0.05)"} strokeWidth="0.8" />

                      {/* Crosshairs */}
                      <line x1="180" y1="2" x2="180" y2="86" stroke={isPoster ? "#111111" : "rgba(255,255,255,0.08)"} strokeWidth="1" />
                      <line x1="10" y1="44" x2="350" y2="44" stroke={isPoster ? "#111111" : "rgba(255,255,255,0.08)"} strokeWidth="1" />

                      {/* Tech Park Beacon Node */}
                      <g transform="translate(230, 26)" className="cursor-pointer" onClick={() => setFacultyFilter("TP")}>
                        <circle r="3.5" fill="none" stroke={isPoster ? "#111111" : "#34d399"} className="beacon-ring-1" />
                        <circle r="4" fill={isPoster ? "#111111" : "#34d399"} className="beacon-dot-1" />
                        <circle r="2" fill={isPoster ? "#ffffff" : "#10b981"} />
                        <text x="8" y="3" fontSize="8" fontFamily="monospace" fontWeight="bold" fill={isPoster ? "#111111" : "#34d399"}>TP // 45 CABINS</text>
                      </g>

                      {/* UB Beacon Node */}
                      <g transform="translate(125, 32)" className="cursor-pointer" onClick={() => setFacultyFilter("UB")}>
                        <circle r="3.5" fill="none" stroke={isPoster ? "#111111" : "#38bdf8"} className="beacon-ring-2" />
                        <circle r="4" fill={isPoster ? "#111111" : "#38bdf8"} className="beacon-dot-2" />
                        <circle r="2" fill={isPoster ? "#ffffff" : "#0284c7"} />
                        <text x="-72" y="3" fontSize="8" fontFamily="monospace" fontWeight="bold" fill={isPoster ? "#111111" : "#38bdf8"}>UB // 38 CABINS</text>
                      </g>

                      {/* BioTech Beacon Node */}
                      <g transform="translate(135, 64)">
                        <circle r="3" fill="none" stroke={isPoster ? "#111111" : "#fbbf24"} className="beacon-ring-3" />
                        <circle r="3.5" fill={isPoster ? "#111111" : "#fbbf24"} className="beacon-dot-3" />
                        <circle r="1.8" fill={isPoster ? "#ffffff" : "#f59e0b"} />
                        <text x="-67" y="3" fontSize="7.5" fontFamily="monospace" fontWeight="bold" fill={isPoster ? "#111111" : "#fbbf24"}>BIO // 18 CABINS</text>
                      </g>

                      {/* Arch Beacon Node */}
                      <g transform="translate(240, 66)">
                        <circle r="3" fill="none" stroke={isPoster ? "#111111" : "#a855f7"} className="beacon-ring-4" />
                        <circle r="3.5" fill={isPoster ? "#111111" : "#a855f7"} className="beacon-dot-4" />
                        <circle r="1.8" fill={isPoster ? "#ffffff" : "#9333ea"} />
                        <text x="8" y="3" fontSize="7.5" fontFamily="monospace" fontWeight="bold" fill={isPoster ? "#111111" : "#c084fc"}>ARCH // 12 CABINS</text>
                      </g>
                    </svg>

                    <div className="absolute bottom-1 left-3 z-10">
                      <span className={`text-[8px] font-mono uppercase tracking-wider ${isPoster ? "text-[#111111] font-bold" : "text-zinc-400"}`}>
                        LIVE RADAR // CABIN PINGS
                      </span>
                    </div>
                  </div>

                  {/* Bottom Live Feed */}
                  <div
                    className="p-3 sm:p-3.5 space-y-2"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                  >
                    {visibleFaculty.slice(0, 2).map((prof) => (
                      <div
                        key={prof.id}
                        onClick={() => { window.location.href = `/faculty?q=${encodeURIComponent(prof.name)}` }}
                        className={`group flex items-center justify-between gap-3 px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                          isPoster
                            ? "bg-[#f7f5f0] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-white hover:shadow-[3px_3px_0px_#111111]"
                            : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.07] hover:border-sky-400/30"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="relative shrink-0">
                            <FacultyPhoto name={prof.name} photo={prof.photo} isPoster={isPoster} />
                            <span
                              className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-[#070b12]"
                              style={{ backgroundColor: prof.statusColor }}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className={`text-xs font-bold truncate group-hover:text-sky-500 transition-colors ${isPoster ? "text-[#111111]" : "text-white"}`}>
                              {prof.name}
                            </h4>
                            <p className="text-[9.5px] font-mono truncate text-zinc-500">{prof.dept}</p>
                          </div>
                        </div>
                        <span
                          className={`shrink-0 inline-flex items-center gap-1 font-mono font-bold text-[9px] px-2 py-1 rounded-lg ${
                            isPoster
                              ? "bg-[#111111] text-white keep-white"
                              : "bg-sky-400/15 text-sky-300 border border-sky-400/25"
                          }`}
                        >
                          <Building2 className="h-2.5 w-2.5" />
                          {prof.cabin}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Block Filter Strip */}
            <div
              className={`flex items-center gap-1.5 overflow-x-auto border-t p-2 sm:p-2.5 scrollbar-none sm:px-4 ${
                isPoster ? "border-[#111111] bg-[#f7f5f0]" : "border-white/[0.06] bg-black/40"
              }`}
            >
              <span className={`font-mono text-[9px] uppercase tracking-wider shrink-0 pl-1 ${isPoster ? "text-zinc-600 font-bold" : "text-zinc-500"}`}>
                FILTER:
              </span>
              {(["ALL", "TP", "UB", "CSE"] as const).map((filterKey) => {
                const label = filterKey === "ALL" ? "All Cabins" : filterKey === "TP" ? "Tech Park" : filterKey === "UB" ? "Univ Bldg" : "Computing & AI"
                const isActive = facultyFilter === filterKey
                return (
                  <button
                    key={filterKey}
                    onClick={() => { setFacultyFilter(filterKey); setFacultyQuery("") }}
                    className={`shrink-0 inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-mono transition cursor-pointer ${
                      isActive
                        ? isPoster
                          ? "bg-[#111111] text-white font-bold border-2 border-[#111111] keep-white shadow-[1px_1px_0px_#111111]"
                          : "bg-sky-400/20 border border-sky-400/40 text-sky-300 font-bold"
                        : isPoster
                          ? "bg-white border-2 border-[#111111]/30 text-[#111111] hover:border-[#111111]"
                          : "bg-white/[0.03] border border-white/[0.06] text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <span>{label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Action Bar */}
          <div className={`p-3 sm:p-4 border-t ${isPoster ? "border-[#111111] bg-[#faf8f5]" : "border-white/[0.08] bg-white/[0.01]"}`}>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => { window.location.href = "/faculty" }}
                className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isPoster
                    ? "bg-[#111111] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-zinc-800 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none keep-white"
                    : "bg-zinc-900/90 hover:bg-zinc-800 text-sky-400 border border-sky-500/35 hover:border-sky-400/60 shadow-sm"
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Open Faculty Finder</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => { window.location.href = "/faculty" }}
                className={`inline-flex items-center justify-center gap-1 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isPoster
                    ? "border-2 border-[#111111] bg-white text-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-zinc-100"
                    : "border border-white/12 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08]"
                }`}
              >
                <span>Directory</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}


