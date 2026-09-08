"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { CSSProperties } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import {
  AlertTriangle, ArrowRight, ArrowUpRight, BarChart3, BookOpen, Bot, CalendarDays, Calculator,
  CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Clock, Coffee, FileCode, FileText, GraduationCap, IdCard, Lock, MapPin,
  MessageSquareText, Navigation, RefreshCw, Shield, Sparkles, SlidersHorizontal, TrendingUp, Wifi, Zap,
} from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Header, type LandingMode } from "@/components/Header"
import { SEOStructuredData } from "@/components/seo-structured-data" // kept for legacy only
import { FloatingAppAction } from "@/components/floating-app-action"
import { CampusShowcase } from "@/components/campus-cinema"
import { PublicFooter } from "@/components/public-footer"
import { useAuth } from "@/lib/auth-context"
import { useTheme } from "@/lib/theme-context"
import { WelcomeSplash } from "@/components/welcome-splash"
import { ModeSelectionModal } from "@/components/mode-selection-modal"
import { flushSync } from "react-dom"
import { performThemeTransition } from "@/lib/theme-transition"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=in.edutechsrm.app"

/* ───────────────────────── data ───────────────────────── */

const STORY = [
  {
    id: "dashboard",
    kicker: "01 // HOME ENGINE",
    eyebrow: "CENTRAL COMMAND",
    title: "Your SRM day starts on one home screen.",
    titlePrefix: "YOUR ENTIRE SRM DAY.",
    titleEmphasis: "Synthesized before 08:00 AM.",
    body: "Live clock, day order, attendance and marks at a glance, next holiday, and one-tap jumps to Timetable, Attendance, Courses and Marks.",
    studentNote: "Your entire SRM day synthesized before 08:00 AM.",
    accent: "#34d399",
    chip: "83% attendance · 89% marks",
    shot: "dashboard",
    alt: "edutechsrm Android home dashboard with attendance, marks, AI ask bar and quick navigation",
    callouts: [
      { text: "⚡ DO 4 · 09:58 AM", sub: "live day order sync", className: "-top-3 -right-4 sm:-right-8" },
      { text: "🛡️ 83% Attendance", sub: "1 at risk · debar guard", className: "top-[38%] -left-6 sm:-left-12" },
      { text: "🤖 1-Tap AI Prompt", sub: "ask schedule or bunks", className: "bottom-10 -right-4 sm:-right-8" },
    ],
    specs: [
      { label: "Attendance", val: "83% Safe" },
      { label: "Internal Marks", val: "89% Aggregate" },
      { label: "Day Order", val: "DO 4 Synced" },
    ],
  },
  {
    id: "timetable",
    kicker: "02 // TIMETABLE & SLOTS",
    eyebrow: "SCHEDULE RADAR",
    title: "Today, at a glance. Week, in one swipe.",
    titlePrefix: "EVERY ROOM & TIMING.",
    titleEmphasis: "Zero corridor panic.",
    body: "Daily schedule with course codes, timings, rooms, faculty, and live attendance margins calculated for every single slot.",
    studentNote: "Another timetable nobody remembers — unless it calculates your bunks.",
    accent: "#34d399",
    chip: "DO 5 · Full Stack Web Dev 08:00",
    shot: "timetable",
    alt: "edutechsrm Android timetable showing daily schedule with rooms, faculty and attendance badges",
    callouts: [
      { text: "📍 TP402 Tech Park", sub: "Slot B · 08:00 AM", className: "-top-3 -left-4 sm:-left-8" },
      { text: "🟢 Margin: +1 Class", sub: "bunk calculation active", className: "top-[38%] -right-6 sm:-right-12" },
      { text: "🗓️ Week in One Swipe", sub: "day orders 1 through 5", className: "bottom-10 -left-4 sm:-left-8" },
    ],
    specs: [
      { label: "Current Slot", val: "Slot B · 08:00" },
      { label: "Classroom", val: "TP402 Tech Park" },
      { label: "Bunk Margin", val: "+1 Class Safe" },
    ],
  },
  {
    id: "marks",
    kicker: "03 // PERFORMANCE STUDIO",
    eyebrow: "ANALYTICS VAULT",
    title: "Every internal, dissected.",
    titlePrefix: "INTERNAL MARKS,",
    titleEmphasis: "dissected before grade cards.",
    body: "Totals CA cycle tests, quizzes, practicals and assignments per subject with trend lines and distribution bars.",
    studentNote: "Know your exact standing before grade cards even drop.",
    accent: "#f59e0b",
    chip: "89.1% · DBMS 93%",
    shot: "marks",
    alt: "edutechsrm Android marks performance studio with overall score ring and subject breakdown",
    callouts: [
      { text: "📊 89.1% Internal Total", sub: "live SGPA projection", className: "-top-3 -right-4 sm:-right-8" },
      { text: "🎯 DBMS: 93%", sub: "CA1 + CA2 + Quizzes", className: "top-[38%] -left-6 sm:-left-12" },
      { text: "📈 Trend Distribution", sub: "component breakdowns", className: "bottom-10 -right-4 sm:-right-8" },
    ],
    specs: [
      { label: "Overall Internal", val: "89.1%" },
      { label: "Top Subject", val: "DBMS (93%)" },
      { label: "Components", val: "CA1, CA2, Lab" },
    ],
  },
  {
    id: "ai",
    kicker: "04 // EDUTECHSRM AI",
    eyebrow: "INTELLIGENCE LAYER",
    title: "Ask your data, not the void.",
    titlePrefix: "ASK YOUR REAL DATA.",
    titleEmphasis: "Not chaotic group chats.",
    body: "One-tap prompts for your next class, attendance summary, and day order — answered directly from your actual SRM schedule.",
    studentNote: "Ask your actual schedule instead of scrolling group chats.",
    accent: "#a78bfa",
    chip: "15/15 left · Ask or type",
    shot: "ai",
    alt: "edutechsrm Android AI assistant with suggested prompts for timetable and attendance",
    callouts: [
      { text: "✨ Grounded in Academia", sub: "zero hallucinated rooms", className: "-top-3 -left-4 sm:-left-8" },
      { text: "⚡ 15/15 Free Prompts", sub: "instant schedule queries", className: "top-[38%] -right-6 sm:-right-12" },
      { text: "💬 'Next class in 20m'", sub: "contextual assistant", className: "bottom-10 -left-4 sm:-left-8" },
    ],
    specs: [
      { label: "Inference Speed", val: "<400ms" },
      { label: "Grounded Source", val: "Live Academia" },
      { label: "Daily Quota", val: "15 Free Prompts" },
    ],
  },
  {
    id: "notes",
    kicker: "05 // STUDY REPOSITORY",
    eyebrow: "ACADEMIC ARCHIVE",
    title: "Every semester's material, shelved.",
    titlePrefix: "79 SUBJECTS ARCHIVED.",
    titleEmphasis: "Zero dead Google Drive links.",
    body: "Study Material spans 79 subjects across 8 semesters — PYQs, notes, and syllabus catalogs with zero dead Google Drive links.",
    studentNote: "79 subjects cataloged. Zero dead Google Drive links.",
    accent: "#60a5fa",
    chip: "Sem 6 NOW · 25 PYQs",
    shot: "notes",
    alt: "edutechsrm Android Notes and PYQs library organized by semester",
    callouts: [
      { text: "📚 79 Subjects Shelved", sub: "semesters 1 through 8", className: "-top-3 -right-4 sm:-right-8" },
      { text: "📁 25 Verified PYQs", sub: "instant PDF view", className: "top-[38%] -left-6 sm:-left-12" },
      { text: "⚡ Zero Dead Drives", sub: "locally cached & fast", className: "bottom-10 -right-4 sm:-right-8" },
    ],
    specs: [
      { label: "Syllabus Coverage", val: "79 Courses" },
      { label: "Question Papers", val: "2018 - 2025" },
      { label: "Drive Redundancy", val: "Zero Dead Links" },
    ],
  },
  {
    id: "faculty",
    kicker: "06 // FACULTY FINDER",
    eyebrow: "CAMPUS DIRECTORY",
    title: "Find the professor. Find the room.",
    titlePrefix: "FIND THE PROFESSOR.",
    titleEmphasis: "Direct to TP411 or UB.",
    body: "Search faculty by name or ID across departments — designation, department, and the exact cabin like TP411 with direct email and call actions.",
    studentNote: "Locate TP411 or UB 6th floor without wandering corridors.",
    accent: "#38bdf8",
    chip: "TP411 · NWC dept",
    shot: "faculty",
    alt: "edutechsrm Android faculty finder showing professor cards with staff room locations",
    callouts: [
      { text: "🚪 Cabin TP411 Located", sub: "NWC Department", className: "-top-3 -left-4 sm:-left-8" },
      { text: "📞 Direct Call & Mail", sub: "1-tap faculty actions", className: "top-[38%] -right-6 sm:-right-12" },
      { text: "🏢 400+ Professors", sub: "Tech Park & UB floors", className: "bottom-10 -left-4 sm:-left-8" },
    ],
    specs: [
      { label: "Faculty Directory", val: "400+ Professors" },
      { label: "Cabin Pins", val: "TP & UB Floors" },
      { label: "Direct Actions", val: "Call & Email" },
    ],
  },
]

const GALLERY = [
  {
    shot: "calendar",
    tag: "01 · CHRONOMETER",
    kicker: "CALENDAR & SCHEDULES",
    titlePrefix: "Day Orders & Events.",
    titleEmphasis: "Synced live.",
    desc: "Automated Day Order 1 to 5 mapping, university holiday feeds, and internal cycle test timelines synced directly to your schedule.",
    studentNote: "Never ask 'Which day order is today?' in WhatsApp again.",
    specs: ["Day Order 1–5 Sync", "Cycle Test Feeds", "Holiday Alerts"],
    accent: "#34d399",
    alt: "edutechsrm Android calendar with day orders and class list",
  },
  {
    shot: "courses",
    tag: "02 · SLOTS & CABINS",
    kicker: "COURSE & FACULTY MATRIX",
    titlePrefix: "Every Slot & Room.",
    titleEmphasis: "TP to UB.",
    desc: "All registered semester courses mapped to assigned professors, credits, classroom numbers, and required attendance thresholds.",
    studentNote: "Know your room number before the 8:00 AM rush.",
    specs: ["Room Allocations", "Prof Cabins", "Credit Audit"],
    accent: "#fbbf24",
    alt: "edutechsrm Android courses list with credits and faculty",
  },
  {
    shot: "profile",
    tag: "03 · IDENTITY SNAPSHOT",
    kicker: "CREDENTIALS & CGPA",
    titlePrefix: "Your SRM Profile.",
    titleEmphasis: "One canvas.",
    desc: "Registration number, degree branch, semester standing, aggregate attendance status, and cumulative CGPA forecast on a single screen.",
    studentNote: "Your entire college standing without opening Academia once.",
    specs: ["Registration ID", "Attendance Total", "Grade Matrix"],
    accent: "#a78bfa",
    alt: "edutechsrm Android profile with academic overview",
  },
]

const GRID_FEATURES = [
  { icon: Clock, title: "SRM Timetable Viewer", desc: "Weekly schedule, day order, rooms, and faculty live from Academia.", color: "#34d399" },
  { icon: BarChart3, title: "Attendance Tracker", desc: "Per-subject %, risk flags below 75%, and safe skip calculations.", note: "Calculates the exact margin before your faculty sends a shortage warning.", color: "#f472b6" },
  { icon: CalendarDays, title: "OD / ML Mode", desc: "Add OD-ML ranges and compare adjusted attendance immediately.", color: "#22d3ee" },
  { icon: BookOpen, title: "Internal Marks", desc: "CA totals, percentages, and component breakdowns in one view.", color: "#f59e0b" },
  { icon: TrendingUp, title: "GradeX CGPA", desc: "What-if grades, SGPA, and cumulative CGPA projections that update live.", color: "#fb923c" },
  { icon: FileText, title: "Notes & PYQs", desc: "Subject-wise notes and question papers organized by course code.", color: "#60a5fa" },
  { icon: IdCard, title: "Faculty Finder", desc: "400+ faculty — designation, department, and cabin in one search.", color: "#34d399" },
  { icon: Calculator, title: "Calculator Plus", desc: "Scientific, unit converters, logic gates, and binary operations.", color: "#fbbf24" },
  { icon: Bot, title: "edutechsrm AI", desc: "Instant answers grounded in your timetable, attendance, and syllabus.", color: "#a78bfa" },
  { icon: Shield, title: "Zero Credentials Stored", desc: "Direct SRM authentication only. Session token, nothing else kept.", color: "#34d399" },
]

const FAQS = [
  { q: "What is edutechsrm?", a: "A free SRMIST KTR student dashboard — timetable, attendance, internal marks, CGPA, calendar, notes, PYQs, assignments and AI in one fast interface, synced live from SRM Academia." },
  { q: "Is my SRM password safe?", a: "Yes. Credentials go only to SRM Academia for authentication. edutechsrm never stores your password — only the temporary session needed to fetch data." },
  { q: "How do I check attendance and bunk limit?", a: "Log in once. Every subject shows its percentage, shortage risk below 75%, and exactly how many classes you can skip or must attend — OD/ML aware." },
  { q: "Does it have PYQs and notes?", a: "Yes. Notes & PYQs are organized by course code so DBMS, DAA or OS material is two taps away." },
  { q: "Is edutechsrm free?", a: "Completely free for SRMIST KTR students. No subscriptions, no hidden premium." },
  { q: "Who built it?", a: 'Built and maintained by Aarav Goel (CSE AIML, SRM IST). Say hi on <a class="text-emerald-300 underline" href="https://www.linkedin.com/in/aaravgoel12/" target="_blank" rel="noreferrer">LinkedIn</a>.' },
]

/* ───────────────────── real android screenshots ───────────────────── */

const SHOT_SRC: Record<string, string> = {
  dashboard: "/screenshots/dashboard.jpg",
  timetable: "/screenshots/timetable.jpg",
  marks: "/screenshots/marks.jpg",
  calendar: "/screenshots/calendar.jpg",
  courses: "/screenshots/courses.jpg",
  notes: "/screenshots/notes.jpg",
  faculty: "/screenshots/faculty.jpg",
  profile: "/screenshots/profile.jpg",
  ai: "/screenshots/ai.jpg",
}

/** Real app capture (all shots 1080×2340 ≈ 0.4615) inside the Android frame,
    whose .android-screen geometry matches — `cover` shows the full frame. */
function RealPhone({
  shot,
  alt,
  glow,
  width = "min(265px, 78vw)",
}: {
  shot: string
  alt: string
  glow?: string
  width?: string
}) {
  return (
    <div className="relative mx-auto" style={{ width }}>
      {glow && (
        <div
          className="phone-ambient-halo pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[120%] w-[135%] rounded-full blur-[70px] opacity-50 -z-10"
          style={{
            background: `radial-gradient(ellipse at center, ${glow}44 0%, ${glow}14 45%, transparent 72%)`,
          }}
          aria-hidden="true"
        />
      )}
      <div
        className="android-frame w-full"
        style={{
          boxShadow: "0 28px 70px -12px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.06)",
        }}
      >
        <div className="android-screen">
          <img src={SHOT_SRC[shot]} alt={alt} width={1080} height={2340} loading="lazy" decoding="async" className="h-full w-full object-cover object-top" draggable={false} />
        </div>
      </div>
    </div>
  )
}

/* Phone visuals are real app screenshots rendered by RealPhone above. */

/* ───────────────────── main component ───────────────────── */

export function LandingPage({ onEnterApp }: { onEnterApp?: () => void }) {
  const { isAuthenticated } = useAuth()
  const reduce = useReducedMotion()
  const [mode, setMode] = useState<LandingMode>("poster")
  const isPoster = mode === "poster"
  const [active, setActive] = useState(0)
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const phoneRef = useRef<HTMLDivElement>(null)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])
  const progressRef = useRef<HTMLDivElement>(null)
  const railTrackRef = useRef<HTMLDivElement>(null)
  const railViewportRef = useRef<HTMLDivElement>(null)
  const railSectionRef = useRef<HTMLElement>(null)
  const railProgressRef = useRef<HTMLDivElement>(null)
  const mobileReelRef = useRef<HTMLDivElement>(null)
  const [mobileReelIdx, setMobileReelIdx] = useState(0)
  const [isAndroidUser, setIsAndroidUser] = useState(false)
  const [isAppleDevice, setIsAppleDevice] = useState(false)
  const lastTouchTime = useRef(0)
  const [showSplash, setShowSplash] = useState(true)
  const [showModeModal, setShowModeModal] = useState(false)

  useEffect(() => {
    try {
      const saved = (localStorage.getItem("edutechsrm-landing-mode") || localStorage.getItem("edutechsrm_landing_mode")) as string
      const initialMode = saved === "night" ? "night" : "poster"
      const themeName = initialMode === "poster" ? "poster" : "dark"
      setMode(initialMode)
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("data-landing-mode", initialMode)
        document.documentElement.setAttribute("data-theme", themeName)
        document.body.setAttribute("data-landing-mode", initialMode)
        document.body.setAttribute("data-theme", themeName)
        document.body.style.backgroundColor = initialMode === "poster" ? "#f7f5f0" : "#06080d"
      }
    } catch { /* noop */ }

    const onModeChange = (e: Event) => {
      const detail = (e as CustomEvent).detail
      const m = typeof detail === "string" ? detail : detail?.mode
      if (m === "poster" || m === "night") {
        const themeName = m === "poster" ? "poster" : "dark"
        setMode(m)
        if (typeof document !== "undefined") {
          document.documentElement.setAttribute("data-landing-mode", m)
          document.documentElement.setAttribute("data-theme", themeName)
          document.body.setAttribute("data-landing-mode", m)
          document.body.setAttribute("data-theme", themeName)
          document.body.style.backgroundColor = m === "poster" ? "#f7f5f0" : "#06080d"
        }
      }
    }
    window.addEventListener("landing-mode-change", onModeChange)
    return () => window.removeEventListener("landing-mode-change", onModeChange)
  }, [])

  const handleModeChange = (nextMode: LandingMode, coords?: { x: number; y: number }) => {
    const validMode = nextMode === "poster" ? "poster" : "night"
    const themeName = validMode === "poster" ? "poster" : "dark"

    const applyTheme = () => {
      try {
        flushSync(() => {
          setMode(validMode)
        })
      } catch {
        setMode(validMode)
      }
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("data-landing-mode", validMode)
        document.documentElement.setAttribute("data-theme", themeName)
        document.body.setAttribute("data-landing-mode", validMode)
        document.body.setAttribute("data-theme", themeName)
        document.body.style.backgroundColor = validMode === "poster" ? "#f7f5f0" : "#06080d"
      }
      try {
        localStorage.setItem("edutechsrm_landing_mode", validMode)
        localStorage.setItem("edutechsrm-landing-mode", validMode)
        const themeObj = {
          mode: themeName,
          presetId: validMode === "poster" ? "poster-cardstock" : "default",
          customImage: null,
          customColors: { pageBg: "#09090b", cardBg: "#18181b", textPrimary: "#f4f4f5", accent: "#34d399" },
        }
        localStorage.setItem("edutechsrm_theme", JSON.stringify(themeObj))
        localStorage.setItem("edutechsrm-theme", JSON.stringify(themeObj))
        window.dispatchEvent(new CustomEvent("landing-mode-change", {
          detail: { mode: validMode, ...(coords || {}) }
        }))
      } catch { /* noop */ }
    }

    performThemeTransition({
      nextMode: validMode,
      coords,
      applyTheme,
    })
  }

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      if (/Android/i.test(navigator.userAgent)) {
        setIsAndroidUser(true)
      }
      const isApple = /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
      setIsAppleDevice(isApple)
    }
  }, [])

  useEffect(() => { if (isAuthenticated) onEnterApp?.() }, [isAuthenticated, onEnterApp])

  const scrollMobileReelTo = (index: number) => {
    lastTouchTime.current = Date.now()
    const container = mobileReelRef.current
    if (!container) return
    const card = container.children[index] as HTMLElement
    if (!card) return
    const target = card.offsetLeft - (container.clientWidth - card.clientWidth) / 2
    container.scrollTo({ left: Math.max(0, target), behavior: "smooth" })
    setMobileReelIdx(index)
  }

  const jumpToScreen = (index: number) => {
    const storyEl = document.getElementById("story")
    if (!storyEl) return
    const rect = storyEl.getBoundingClientRect()
    const scrollTop = window.scrollY || document.documentElement.scrollTop
    const storyTop = scrollTop + rect.top
    const totalTravel = storyEl.offsetHeight - window.innerHeight
    const segmentFraction = (index + 0.5) / STORY.length
    const targetScroll = storyTop + Math.max(0, segmentFraction * totalTravel)
    window.scrollTo({ top: targetScroll, behavior: "smooth" })
    setActive(index)
  }

  /* Auto-scroll mobile screen reel to the right smoothly */
  useEffect(() => {
    if (reduce) return
    const container = mobileReelRef.current
    if (!container) return

    let isVisible = false
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting
      },
      { threshold: 0.25 }
    )
    observer.observe(container)

    let currentIdx = 0

    const interval = setInterval(() => {
      // ONLY auto-scroll if container is visible in viewport and user hasn't touched recently
      if (!isVisible) return
      if (Date.now() - lastTouchTime.current < 3500) return

      currentIdx = (currentIdx + 1) % STORY.length
      setMobileReelIdx(currentIdx)

      const card = container.children[currentIdx] as HTMLElement
      if (card) {
        const target = card.offsetLeft - (container.clientWidth - card.clientWidth) / 2
        container.scrollTo({ left: Math.max(0, target), behavior: "smooth" })
      }
    }, 3200)

    const onUserTouch = () => {
      lastTouchTime.current = Date.now()
    }

    const onScroll = () => {
      const scrollLeft = container.scrollLeft
      const card = container.children[0] as HTMLElement
      const step = card ? card.offsetWidth + 16 : 296
      const idx = Math.min(STORY.length - 1, Math.max(0, Math.round(scrollLeft / step)))
      currentIdx = idx
      setMobileReelIdx(idx)
    }

    container.addEventListener("scroll", onScroll, { passive: true })
    container.addEventListener("touchstart", onUserTouch, { passive: true })
    container.addEventListener("touchmove", onUserTouch, { passive: true })
    container.addEventListener("mousedown", onUserTouch, { passive: true })

    return () => {
      clearInterval(interval)
      observer.disconnect()
      container.removeEventListener("scroll", onScroll)
      container.removeEventListener("touchstart", onUserTouch)
      container.removeEventListener("touchmove", onUserTouch)
      container.removeEventListener("mousedown", onUserTouch)
    }
  }, [reduce])

  /* 5-Moment Cinematic Scroll Choreography:
     Hero Student Chaos -> Moment 01 (The Reality) -> Moment 02 (Memories Flood) ->
     Moment 03 (Core Tension) -> Moment 04 (Convergence) -> Moment 05 (Resolution & Product) */
  useEffect(() => {
    if (reduce) return

    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth < 768

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#top",
          start: "top top",
          end: "bottom bottom",
          scrub: isMobile ? 0.6 : 1.1,
        },
      })

      // ── Act 0: Hero Student Chaos Disperses (0.00 -> 0.14) ──
      tl.to(".hero-chip-attendance", { x: -140, y: -45, rotation: -12, opacity: 0, ease: "none", duration: 0.12 }, 0)
        .to(".hero-chip-timetable", { y: -70, rotation: -8, opacity: 0, ease: "none", duration: 0.12 }, 0.01)
        .to(".hero-chip-caution", { x: 140, y: -45, rotation: 14, opacity: 0, ease: "none", duration: 0.12 }, 0)
        .to(".hero-chip-campus", { x: -120, y: -30, rotation: 10, opacity: 0, ease: "none", duration: 0.12 }, 0.01)
        .to(".hero-chip-bunk", { x: 140, y: -10, rotation: 12, opacity: 0, ease: "none", duration: 0.12 }, 0.02)
        .to(".hero-chip-mobile", { opacity: 0, y: -20, ease: "none", duration: 0.10 }, 0)
        .to(".hero-chip-laptop", { opacity: 0, ease: "none", duration: 0.12 }, 0.01)
        .to(".hero-headline-wrap", { y: -40, opacity: 0, scale: 0.95, ease: "none", duration: 0.13 }, 0.02)
        .to(".hero-welcome-block", { autoAlpha: 0, ease: "none", duration: 0.14 }, 0.02)

      // ── Act 1: Moment 01 - The Reality (0.14 -> 0.31) ──
      // "College is thousands of frantic moments."
      tl.fromTo(".story-act-1", { opacity: 0, y: 40, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, ease: "none", duration: 0.04 }, 0.14)
        .to(".story-act-1", { opacity: 1, duration: 0.09 }, 0.18)
        .to(".story-act-1", { opacity: 0, y: -40, ...(isMobile ? {} : { filter: "blur(6px)" }), ease: "none", duration: 0.04 }, 0.27)

      // ── Act 2: Moment 02 - The Memories Flood (0.31 -> 0.49) ──
      tl.fromTo(".story-act-2", { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.03 }, 0.31)
        .fromTo(".mem-card-1", { x: -160, y: -50, opacity: 0, rotation: -8 }, { x: 0, y: 0, opacity: 1, rotation: -3, ease: "power2.out", duration: 0.05 }, 0.31)
        .fromTo(".mem-card-2", { x: 160, y: -60, opacity: 0, rotation: 8 }, { x: 0, y: 0, opacity: 1, rotation: 2.5, ease: "power2.out", duration: 0.05 }, 0.32)
        .fromTo(".mem-card-3", { x: -140, y: 40, opacity: 0, rotation: 6 }, { x: 0, y: 0, opacity: 1, rotation: 1.5, ease: "power2.out", duration: 0.05 }, 0.33)
        .fromTo(".mem-card-4", { x: 140, y: 30, opacity: 0, rotation: -6 }, { x: 0, y: 0, opacity: 1, rotation: -2, ease: "power2.out", duration: 0.05 }, 0.33)
        .fromTo(".mem-card-5", { y: 80, opacity: 0, rotation: 4 }, { y: 0, opacity: 1, rotation: 0, ease: "power2.out", duration: 0.05 }, 0.34)
        .fromTo(".mem-card-6", { x: -80, y: -80, opacity: 0 }, { x: 0, y: 0, opacity: 1, ease: "power2.out", duration: 0.05 }, 0.34)
        .to(".story-act-2", { opacity: 1, duration: 0.09 }, 0.36)
        .to(".mem-card-1", { x: -100, y: -30, opacity: 0, ease: "none", duration: 0.04 }, 0.45)
        .to(".mem-card-2", { x: 100, y: -30, opacity: 0, ease: "none", duration: 0.04 }, 0.45)
        .to(".mem-card-3", { x: -80, y: 30, opacity: 0, ease: "none", duration: 0.04 }, 0.45)
        .to(".mem-card-4", { x: 80, y: 30, opacity: 0, ease: "none", duration: 0.04 }, 0.45)
        .to(".mem-card-5", { y: 50, opacity: 0, ease: "none", duration: 0.04 }, 0.45)
        .to(".mem-card-6", { y: -40, opacity: 0, ease: "none", duration: 0.04 }, 0.45)
        .to(".story-act-2", { opacity: 0, ease: "none", duration: 0.03 }, 0.46)

      // ── Act 3: Moment 03 - The Core Tension (0.49 -> 0.67) ──
      // "EVERYTHING IS SOMEWHERE. NOTHING IS TOGETHER."
      tl.fromTo(".story-act-3", { opacity: 0, y: 50, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, ease: "none", duration: 0.04 }, 0.49)
        .to(".story-act-3", { opacity: 1, duration: 0.10 }, 0.53)
        .to(".story-act-3", { opacity: 0, y: -45, ...(isMobile ? {} : { filter: "blur(6px)" }), ease: "none", duration: 0.04 }, 0.63)

      // ── Act 4: Moment 04 - The Synthesis (0.67 -> 0.85) ──
      // "EVERY PIECE FINDS ITS PLACE."
      tl.fromTo(".story-act-4", { opacity: 0, y: 50, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, ease: "none", duration: 0.04 }, 0.67)
        .fromTo(".synth-card-1", { x: -70, opacity: 0 }, { x: 0, opacity: 1, ease: "power2.out", duration: 0.05 }, 0.68)
        .fromTo(".synth-card-2", { x: -35, opacity: 0 }, { x: 0, opacity: 1, ease: "power2.out", duration: 0.05 }, 0.69)
        .fromTo(".synth-card-3", { x: 35, opacity: 0 }, { x: 0, opacity: 1, ease: "power2.out", duration: 0.05 }, 0.69)
        .fromTo(".synth-card-4", { x: 70, opacity: 0 }, { x: 0, opacity: 1, ease: "power2.out", duration: 0.05 }, 0.68)
        .fromTo(".synth-core", { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, ease: "back.out(1.5)", duration: 0.05 }, 0.70)
        .to(".story-act-4", { opacity: 1, duration: 0.09 }, 0.72)
        .to(".synth-card-1", { x: 25, scale: 0.95, ease: "none", duration: 0.04 }, 0.81)
        .to(".synth-card-4", { x: -25, scale: 0.95, ease: "none", duration: 0.04 }, 0.81)
        .to(".story-act-4", { opacity: 0, y: -45, ...(isMobile ? {} : { filter: "blur(6px)" }), ease: "none", duration: 0.04 }, 0.82)

      // ── Act 5: Moment 05 - The Emotional Resolution (0.85 -> 1.00) ──
      tl.fromTo(".story-act-5", { opacity: 0, y: 40, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, ease: "none", duration: 0.04 }, 0.85)
        .set(".story-act-5", { pointerEvents: "auto" }, 0.87)
        .to(".story-act-5", { opacity: 1, duration: 0.12 }, 0.88)

      // Only pulse the orb on desktop — it's purely decorative and burns GPU on mobile
      if (!isMobile) {
        gsap.to(".hero-orb", { scale: 1.12, opacity: 0.85, duration: 4.2, yoyo: true, repeat: -1, ease: "sine.inOut" })
      }
    }, rootRef)

    return () => ctx.revert()
  }, [reduce])

  /* GSAP — parallax, reveals, scroll-story driver (perfect scrub) */
  useEffect(() => {
    if (reduce) return
    const ctx = gsap.context(() => {
      gsap.to(".hero-orb-top", { y: 100, opacity: 0.6, ease: "none", scrollTrigger: { trigger: "#top", start: "top top", end: "60% top", scrub: 0.5 } })
      gsap.utils.toArray<HTMLElement>(".gs-reveal").forEach((el) => {
        gsap.fromTo(el, { y: 34, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 86%" } })
      })
      /* story driver: pin stage, scrub active screens smoothly on desktop */
      const mm = gsap.matchMedia()
      mm.add("(min-width: 1024px)", () => {
        const storyTrigger = ScrollTrigger.create({
          trigger: "#story",
          start: "top top",
          end: "bottom bottom",
          scrub: 1.1,
          onUpdate: (self) => {
            const p = self.progress
            const step = 1 / STORY.length
            const idx = Math.min(STORY.length - 1, Math.floor(p / step))
            setActive(idx)
          },
        })
        if (phoneRef.current) {
          gsap.to(phoneRef.current, {
            rotateY: 6,
            rotateX: -2,
            y: -12,
            ease: "none",
            scrollTrigger: {
              trigger: "#story",
              start: "top top",
              end: "bottom bottom",
              scrub: 0.8,
            },
          })
        }
        return () => {
          storyTrigger.kill()
        }
      })
      /* features rail: sticky-driven sideways ride (desktop). Section height
         is set to exactly dist + viewport so the track always traverses fully —
         no pin-spacer, no early release. */
      mm.add("(min-width: 1024px)", () => {
        const track = railTrackRef.current
        const viewport = railViewportRef.current
        const section = railSectionRef.current
        if (!track || !viewport || !section) return
        gsap.set(viewport, { overflow: "visible" })
        const dist = () => Math.max(0, track.scrollWidth - viewport.clientWidth + 48)
        const setH = () => { section.style.height = `${dist() * 1.8 + window.innerHeight}px` }
        setH()
        ScrollTrigger.addEventListener("refreshInit", setH)
        if (typeof document !== "undefined" && document.fonts?.ready) {
          document.fonts.ready.then(() => ScrollTrigger.refresh()).catch(() => {})
        }
        const ride = gsap.timeline({
          scrollTrigger: {
            trigger: section, start: "top top", end: "bottom bottom",
            scrub: true, invalidateOnRefresh: true,
            onUpdate: (s) => { if (railProgressRef.current) railProgressRef.current.style.transform = `scaleX(${s.progress})` },
          },
        })
        ride.to(track, { x: () => -dist(), ease: "none", duration: 0.82 })
        ride.to({}, { duration: 0.18 })
        return () => {
          ScrollTrigger.removeEventListener("refreshInit", setH)
          ride.scrollTrigger?.kill()
          ride.kill()
          gsap.set(track, { clearProps: "x" })
          gsap.set(viewport, { clearProps: "overflow" })
          section.style.height = ""
        }
      })
    }, rootRef)
    return () => ctx.revert()
  }, [reduce])

  const goLogin = () => { window.location.href = isAuthenticated ? "/app" : "/login" }
  const tags = useMemo(() => ["Campus Explore", "SRM Timetable App", "Attendance Calculator", "Bunk Calculator", "OD / ML Mode", "Internal Marks", "GradeX CGPA", "Day Order Today", "PYQs + Notes", "edutechsrm AI", "Faculty Finder"], [])

  return (
    <>
      {/* Welcome splash — shows every time for non-authenticated visitors */}
      {!isAuthenticated && showSplash && (
        <WelcomeSplash
          isPoster={isPoster}
          onComplete={() => {
            setShowSplash(false)
            try {
              const dismissed = sessionStorage.getItem("edutechsrm_mode_prompt_seen")
              if (!dismissed) {
                setShowModeModal(true)
              }
            } catch {
              setShowModeModal(true)
            }
          }}
        />
      )}
      {/* JSON-LD structured data is server-rendered in app/layout.tsx — no client duplicate needed */}
      <style>{`
        .landing-root{font-family:var(--font-sans),Inter,ui-sans-serif,system-ui,sans-serif;background-color:var(--lm-bg,#06080d);color:var(--lm-text-primary,#f4f4f5);overflow-x:clip;}

        /* ══════════════════════════════════════════════════════════════════════
           SWISS / BRUTALIST POSTER MODE
           Tactile warm ivory cardstock, ink-black typography, crisp 2px borders,
           hard offset brutalist drop shadows, and high contrast editorial prints.
           ══════════════════════════════════════════════════════════════════════ */
        [data-landing-mode="poster"],
        .landing-root[data-landing-mode="poster"] {
          --lm-bg: #f7f5f0;
          background-color: #f7f5f0 !important;
          background-image: 
            linear-gradient(to right, rgba(17, 17, 17, 0.035) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(17, 17, 17, 0.035) 1px, transparent 1px) !important;
          background-size: 54px 54px !important;
          background-position: -1px -1px !important;
          color: #111111;
        }
        [data-landing-mode="poster"] h1,
        [data-landing-mode="poster"] h2,
        [data-landing-mode="poster"] h3,
        [data-landing-mode="poster"] h4,
        [data-landing-mode="poster"] .chaos-title-1,
        [data-landing-mode="poster"] .font-display {
          color: #111111 !important;
        }
        [data-landing-mode="poster"] .text-white:not(.keep-white):not([data-theme-keep="white"]) {
          color: #111111 !important;
        }
        [data-landing-mode="poster"] .keep-white,
        [data-landing-mode="poster"] .keep-white *,
        [data-landing-mode="poster"] [data-theme-keep="white"],
        [data-landing-mode="poster"] [data-theme-keep="white"] *,
        [data-landing-mode="poster"] header a.keep-white,
        [data-landing-mode="poster"] header button.keep-white {
          color: #ffffff !important;
        }
        .hero-trust-stamp {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(52, 211, 153, 0.3);
          color: #34d399;
          box-shadow: 0 0 20px rgba(52, 211, 153, 0.15);
        }
        .hero-trust-badge {
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(52, 211, 153, 0.25);
          color: #34d399;
        }
        [data-landing-mode="poster"] .hero-trust-stamp {
          background: #ffffff !important;
          border: 2px solid #111111 !important;
          box-shadow: 3px 3px 0px #111111 !important;
          color: #111111 !important;
        }
        [data-landing-mode="poster"] .hero-trust-badge {
          background: #ffffff !important;
          border: 1.5px solid #111111 !important;
          box-shadow: 2px 2px 0px #111111 !important;
          color: #111111 !important;
        }
        [data-landing-mode="poster"] .text-zinc-100,
        [data-landing-mode="poster"] .text-zinc-200,
        [data-landing-mode="poster"] .text-zinc-300 {
          color: #222222 !important;
        }
        [data-landing-mode="poster"] .text-zinc-400,
        [data-landing-mode="poster"] .text-zinc-500 {
          color: #555555 !important;
        }
        [data-landing-mode="poster"] .text-rose-200,
        [data-landing-mode="poster"] .text-rose-300 {
          color: #dc2626 !important;
        }
        [data-landing-mode="poster"] .text-rose-400,
        [data-landing-mode="poster"] .text-rose-500 {
          color: #b91c1c !important;
        }
        [data-landing-mode="poster"] .text-emerald-200,
        [data-landing-mode="poster"] .text-emerald-300 {
          color: #059669 !important;
        }
        [data-landing-mode="poster"] .text-emerald-400 {
          color: #047857 !important;
        }
        [data-landing-mode="poster"] .text-amber-200,
        [data-landing-mode="poster"] .text-amber-300 {
          color: #b45309 !important;
        }
        [data-landing-mode="poster"] .text-amber-400 {
          color: #92400e !important;
        }
        [data-landing-mode="poster"] .text-sky-200,
        [data-landing-mode="poster"] .text-sky-300 {
          color: #0284c7 !important;
        }
        [data-landing-mode="poster"] .text-sky-400 {
          color: #0369a1 !important;
        }
        [data-landing-mode="poster"] .text-violet-200,
        [data-landing-mode="poster"] .text-violet-300 {
          color: #7c3aed !important;
        }
        [data-landing-mode="poster"] .border-white\/\[0\.08\],
        [data-landing-mode="poster"] .border-white\/\[0\.04\],
        [data-landing-mode="poster"] .border-white\/\[0\.05\],
        [data-landing-mode="poster"] .border-white\/\[0\.06\],
        [data-landing-mode="poster"] .border-white\/\[0\.07\],
        [data-landing-mode="poster"] .border-white\/\[0\.10\],
        [data-landing-mode="poster"] .border-white\/\[0\.12\],
        [data-landing-mode="poster"] .border-white\/\[0\.14\],
        [data-landing-mode="poster"] .border-white\/10,
        [data-landing-mode="poster"] .border-white\/15,
        [data-landing-mode="poster"] .border-white\/20 {
          border-color: #111111 !important;
        }
        [data-landing-mode="poster"] .bg-\[\#0b1019\]\/90,
        [data-landing-mode="poster"] .bg-\[\#0c121e\]\/90,
        [data-landing-mode="poster"] .bg-\[\#0d1424\]\/95,
        [data-landing-mode="poster"] .bg-\[\#0c111c\]\/70,
        [data-landing-mode="poster"] .bg-\[\#0c1017\]\/80,
        [data-landing-mode="poster"] .bg-\[\#070b12\]\/40,
        [data-landing-mode="poster"] .bg-\[\#070b12\]\/90,
        [data-landing-mode="poster"] .bg-\[\#070b13\]\/85,
        [data-landing-mode="poster"] .bg-\[\#0a0f1b\]\/95,
        [data-landing-mode="poster"] .bg-\[\#080d16\]\/95,
        [data-landing-mode="poster"] .bg-\[\#05080e\],
        [data-landing-mode="poster"] .bg-\[\#0f1522\],
        [data-landing-mode="poster"] .bg-\[\#090d15\]\/80,
        [data-landing-mode="poster"] .bg-\[\#070c14\],
        [data-landing-mode="poster"] .bg-\[\#0a0f16\]\/90 {
          background-color: #ffffff !important;
          border: 2px solid #111111 !important;
          box-shadow: 6px 6px 0px #111111 !important;
        }
        [data-landing-mode="poster"] .hero-bg-glow {
          display: none !important;
        }
        .surface-card {
          background-color: var(--lm-surface, rgba(11, 16, 25, 0.85));
          border-color: var(--lm-border, rgba(255, 255, 255, 0.08));
        }
        .surface-card-elevated {
          background-color: var(--lm-surface-elevated, rgba(13, 20, 32, 0.95));
          border-color: var(--lm-border, rgba(255, 255, 255, 0.12));
        }
        [data-landing-mode="poster"] .surface-card,
        [data-landing-mode="poster"] .surface-card-elevated {
          background-color: #ffffff !important;
          border: 2px solid #111111 !important;
          box-shadow: 5px 5px 0px #111111 !important;
          color: #111111 !important;
        }
        [data-landing-mode="poster"] #campus .gs-reveal {
          background-color: #ffffff !important;
          border: 2px solid #111111 !important;
          box-shadow: 6px 6px 0px #111111 !important;
        }
        [data-landing-mode="poster"] #campus .campus-cockpit {
          background-color: #ffffff !important;
          border: 2px solid #111111 !important;
        }
        [data-landing-mode="poster"] #campus .cockpit-topbar {
          background-color: #f7f5f0 !important;
          border-bottom: 2px solid #111111 !important;
          color: #111111 !important;
        }
        [data-landing-mode="poster"] #campus .cockpit-searchbar {
          background-color: #fcfbf7 !important;
          border-bottom: 2px solid #111111 !important;
        }
        [data-landing-mode="poster"] #campus .cockpit-searchbar input {
          color: #111111 !important;
        }
        [data-landing-mode="poster"] #campus .campus-infocard {
          background-color: #ffffff !important;
          border: 2px solid #111111 !important;
          box-shadow: 4px 4px 0px #111111 !important;
        }
        [data-landing-mode="poster"] #campus .campus-hub-title {
          color: #111111 !important;
        }
        [data-landing-mode="poster"] #campus .campus-hub-meta {
          color: #555555 !important;
        }
        [data-landing-mode="poster"] #atlas .gs-reveal.group,
        [data-landing-mode="poster"] #atlas .group {
          background-color: #ffffff !important;
          border: 2px solid #111111 !important;
          box-shadow: 6px 6px 0px #111111 !important;
        }
        [data-landing-mode="poster"] #atlas h2 {
          color: #111111 !important;
        }
        [data-landing-mode="poster"] #atlas h3 {
          color: #111111 !important;
        }
        [data-landing-mode="poster"] #atlas p {
          color: #2b2b2b !important;
        }
        [data-landing-mode="poster"] #atlas .font-hand {
          color: #0b7a54 !important;
        }
        [data-landing-mode="poster"] #atlas .border-t,
        [data-landing-mode="poster"] #atlas .border-b {
          border-color: rgba(17, 17, 17, 0.12) !important;
        }
        [data-landing-mode="poster"] #atlas span.font-mono {
          color: #444444 !important;
        }
        [data-landing-mode="poster"] #atlas .rounded-full.border {
          background-color: #f7f6f2 !important;
          border-color: #111111 !important;
          color: #111111 !important;
        }
        [data-landing-mode="poster"] .tactile-chip,
        [data-landing-mode="poster"] .memory-card {
          background: #ffffff !important;
          border: 2px solid #111111 !important;
          box-shadow: 4px 4px 0px #111111 !important;
          color: #111111 !important;
        }
        [data-landing-mode="poster"] .tactile-chip .text-white,
        [data-landing-mode="poster"] .memory-card .text-white {
          color: #111111 !important;
        }
        [data-landing-mode="poster"] .tactile-chip .text-zinc-200,
        [data-landing-mode="poster"] .tactile-chip .text-zinc-300,
        [data-landing-mode="poster"] .memory-card .text-zinc-200,
        [data-landing-mode="poster"] .memory-card .text-zinc-300 {
          color: #222222 !important;
        }
        [data-landing-mode="poster"] .tactile-chip .text-zinc-400,
        [data-landing-mode="poster"] .tactile-chip .text-zinc-500,
        [data-landing-mode="poster"] .memory-card .text-zinc-400,
        [data-landing-mode="poster"] .memory-card .text-zinc-500 {
          color: #555555 !important;
        }
        .tactile-postit {
          background: rgba(45, 34, 15, 0.88);
          border: 1px solid rgba(245, 158, 11, 0.35);
        }
        [data-landing-mode="poster"] .tactile-postit {
          background: #fefce8 !important;
          border: 2px solid #111111 !important;
          box-shadow: 4px 4px 0px #111111 !important;
          color: #111111 !important;
        }
        [data-landing-mode="poster"] .tactile-postit .text-amber-200,
        [data-landing-mode="poster"] .tactile-postit .text-amber-300 {
          color: #78350f !important;
        }
        .tactile-stamp-red {
          border: 1.5px dashed rgba(244, 63, 94, 0.7);
          background: rgba(244, 63, 94, 0.15);
          color: #fda4af;
        }
        [data-landing-mode="poster"] .tactile-stamp-red {
          border: 2px dashed #dc2626 !important;
          background: #fee2e2 !important;
          color: #991b1b !important;
        }
        .tactile-stamp-emerald {
          border: 1.5px solid rgba(52, 211, 153, 0.4);
          background: rgba(16, 185, 129, 0.15);
          color: #6ee7b7;
        }
        [data-landing-mode="poster"] .tactile-stamp-emerald {
          border: 2px solid #047857 !important;
          background: #d1fae5 !important;
          color: #065f46 !important;
        }
        .tactile-washi-tape {
          background: rgba(255, 255, 255, 0.14);
          border: 1px solid rgba(255, 255, 255, 0.18);
          backdrop-filter: blur(4px);
        }
        [data-landing-mode="poster"] .tactile-washi-tape {
          background: rgba(217, 119, 6, 0.22) !important;
          border: 1px solid rgba(17, 17, 17, 0.3) !important;
        }
        [data-landing-mode="poster"] .tactile-chip .font-hand {
          color: #047857 !important;
        }
        [data-landing-mode="poster"] .story-tabs-pill {
          background-color: #ffffff !important;
          border: 2px solid #111111 !important;
          box-shadow: 4px 4px 0px #111111 !important;
        }
        [data-landing-mode="poster"] .story-tabs-pill button {
          color: #555555 !important;
        }
        [data-landing-mode="poster"] .story-tabs-pill button.is-active-tab {
          background-color: #111111 !important;
          color: #ffffff !important;
          border-color: #111111 !important;
          box-shadow: 2px 2px 0px rgba(0,0,0,0.3) !important;
        }
        [data-landing-mode="poster"] .story-tabs-pill button.is-active-tab span:not(.story-tab-dot) {
          color: #ffffff !important;
        }
        [data-landing-mode="poster"] .story-tabs-pill button.is-active-tab .story-tab-dot {
          background-color: #10b981 !important;
          box-shadow: 0 0 8px #10b981 !important;
        }
        [data-landing-mode="poster"] .story-step-counter {
          color: #111111 !important;
        }
        [data-landing-mode="poster"] .hero-scroll-hint {
          border-top-color: rgba(17, 17, 17, 0.12) !important;
        }
        [data-landing-mode="poster"] .hero-scroll-hint button {
          color: #444444 !important;
        }
        [data-landing-mode="poster"] .hero-scroll-hint button:hover {
          color: #111111 !important;
        }
        [data-landing-mode="poster"] .hero-scroll-arrow {
          background: #ffffff !important;
          border: 1.5px solid #111111 !important;
          color: #111111 !important;
          box-shadow: 2px 2px 0px #111111 !important;
        }
        [data-landing-mode="poster"] .cockpit-map-toggle {
          background: #ffffff !important;
          border: 1.5px solid #111111 !important;
        }
        [data-landing-mode="poster"] .cockpit-map-toggle button {
          color: #555555 !important;
        }
        [data-landing-mode="poster"] .cockpit-map-toggle button.active {
          background: #111111 !important;
          color: #ffffff !important;
        }
        [data-landing-mode="poster"] .cockpit-hubs-bar {
          background: #ffffff !important;
          border-top: 2px solid #111111 !important;
        }
        [data-landing-mode="poster"] .cockpit-hubs-bar > span {
          color: #111111 !important;
          font-weight: 700 !important;
        }
        [data-landing-mode="poster"] .cockpit-hub-btn {
          background: #f7f5f0 !important;
          border: 1.5px solid #111111 !important;
          color: #111111 !important;
          box-shadow: 2px 2px 0px #111111 !important;
        }
        [data-landing-mode="poster"] .cockpit-hub-btn span {
          color: #111111 !important;
        }
        [data-landing-mode="poster"] .cockpit-hub-btn.active-hub {
          background: #111111 !important;
          color: #ffffff !important;
        }
        [data-landing-mode="poster"] .cockpit-hub-btn.active-hub span {
          color: #ffffff !important;
        }
        [data-landing-mode="poster"] .campus-infocard {
          background: #ffffff !important;
          border: 2.5px solid #111111 !important;
          box-shadow: 6px 6px 0px #111111 !important;
        }
        [data-landing-mode="poster"] .campus-infocard .campus-hub-title {
          color: #111111 !important;
        }
        [data-landing-mode="poster"] .campus-infocard .campus-hub-meta {
          color: #444444 !important;
        }
        [data-landing-mode="poster"] .campus-infocard button {
          background: #111111 !important;
          color: #ffffff !important;
          border: 1.5px solid #111111 !important;
          box-shadow: 2px 2px 0px #111111 !important;
        }
        [data-landing-mode="poster"] .campus-infocard button:hover {
          background: #222222 !important;
        }
        [data-landing-mode="poster"] #campus .campus-telemetry-strip {
          background-color: #ffffff !important;
          border: 2px solid #111111 !important;
          box-shadow: 2px 2px 0px #111111 !important;
        }
        [data-landing-mode="poster"] #campus .campus-telemetry-strip > div {
          border-color: #111111 !important;
        }
        [data-landing-mode="poster"] #campus .campus-telemetry-strip span {
          color: #111111 !important;
        }
        [data-landing-mode="poster"] #campus .campus-telemetry-strip span.font-mono {
          color: #555555 !important;
        }
        [data-landing-mode="poster"] #campus .campus-cta-radar {
          background: #111111 !important;
          background-color: #111111 !important;
          color: #ffffff !important;
          border: 2px solid #111111 !important;
          box-shadow: 2px 2px 0px #111111 !important;
        }
        [data-landing-mode="poster"] #campus .campus-cta-radar span {
          color: #ffffff !important;
        }
        [data-landing-mode="poster"] #campus .campus-cta-radar svg {
          color: #34d399 !important;
        }
        [data-landing-mode="poster"] #campus .campus-cta-blocks {
          background-color: #ffffff !important;
          color: #111111 !important;
          border: 2px solid #111111 !important;
          box-shadow: 2px 2px 0px #111111 !important;
        }
        [data-landing-mode="poster"] #campus .campus-cta-blocks span,
        [data-landing-mode="poster"] #campus .campus-cta-blocks svg {
          color: #111111 !important;
        }
        [data-landing-mode="poster"] .faq-accordion-item {
          background-color: #ffffff !important;
          border: 2px solid #111111 !important;
          box-shadow: 4px 4px 0px #111111 !important;
        }
        [data-landing-mode="poster"] .faq-accordion-trigger span {
          color: #111111 !important;
        }
        [data-landing-mode="poster"] .faq-accordion-item p {
          color: #222222 !important;
          border-top-color: rgba(17, 17, 17, 0.12) !important;
        }
        [data-landing-mode="poster"] .faq-accordion-trigger span:last-child {
          background: #f7f5f0 !important;
          border: 1.5px solid #111111 !important;
          color: #111111 !important;
        }
        [data-landing-mode="poster"] #app-showcase h2 {
          color: #111111 !important;
        }
        [data-landing-mode="poster"] #app-showcase p {
          color: #222222 !important;
        }
        [data-landing-mode="poster"] #app-showcase .font-hand {
          color: #0b7a54 !important;
        }
        [data-landing-mode="poster"] #app-showcase a.btn-shine {
          background: #111111 !important;
          color: #ffffff !important;
          border: 2px solid #111111 !important;
          box-shadow: 4px 4px 0px #111111 !important;
        }
        [data-landing-mode="poster"] #app-showcase a.btn-shine div {
          color: #ffffff !important;
        }
        [data-landing-mode="poster"] #app-showcase a.btn-shine svg {
          fill: #ffffff !important;
          color: #ffffff !important;
        }
        [data-landing-mode="poster"] .tactile-chip {
          background: #ffffff !important;
          border: 2px solid #111111 !important;
          box-shadow: 4px 4px 0px #111111 !important;
          color: #111111 !important;
        }
        [data-landing-mode="poster"] .tactile-chip h3 {
          color: #111111 !important;
        }
        [data-landing-mode="poster"] .tactile-chip p {
          color: #222222 !important;
        }
        [data-landing-mode="poster"] .tactile-chip button {
          background: #111111 !important;
          color: #ffffff !important;
          border: 2px solid #111111 !important;
          box-shadow: 3px 3px 0px #111111 !important;
        }
        [data-landing-mode="poster"] .android-frame {
          background: #111111 !important;
          border: 2px solid #111111 !important;
          box-shadow: 6px 6px 0px #111111 !important;
        }
        [data-landing-mode="poster"] .phone-ambient-halo {
          display: none !important;
        }
        [data-landing-mode="poster"] .android-screen {
          border: 1.5px solid #111111 !important;
        }
        [data-landing-mode="poster"] .surface-card-elevated a[href*="play.google"],
        [data-landing-mode="poster"] .surface-card-elevated a.border-emerald-400\/30 {
          background: #111111 !important;
          border: 2px solid #111111 !important;
          color: #ffffff !important;
          box-shadow: 3px 3px 0px #111111 !important;
        }
        [data-landing-mode="poster"] .surface-card-elevated a[href*="play.google"] span,
        [data-landing-mode="poster"] .surface-card-elevated a[href*="play.google"] svg {
          color: #ffffff !important;
          fill: #ffffff !important;
        }
        [data-landing-mode="poster"] .surface-card-elevated button.btn-shine {
          background: #111111 !important;
          color: #ffffff !important;
          border: 2px solid #111111 !important;
          box-shadow: 4px 4px 0px #111111 !important;
        }
        [data-landing-mode="poster"] .surface-card-elevated button.btn-shine span,
        [data-landing-mode="poster"] .surface-card-elevated button.btn-shine svg {
          color: #ffffff !important;
        }

        .font-display{font-family:var(--font-display),"Space Grotesk",sans-serif}
        .font-serif{font-family:var(--font-serif),"Newsreader",serif}
        .font-mono{font-family:var(--font-mono),"JetBrains Mono",monospace}
        .hero-h{font-size:clamp(2.8rem,7vw,5.8rem);line-height:0.96;letter-spacing:-0.045em;text-wrap:balance}
        .glass{background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,.018));border:1px solid rgba(255,255,255,.08);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px)}
        .surface-editorial{background:linear-gradient(180deg,rgba(15,22,34,0.7),rgba(9,13,20,0.85));border:1px solid rgba(255,255,255,0.08);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px)}
        .btn-shine{position:relative;overflow:hidden}
        .btn-shine:after{content:"";position:absolute;inset:0;background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.35) 50%,transparent 60%);transform:translateX(-120%);animation:shine 3.8s ease infinite}
        @keyframes shine{0%{transform:translateX(-120%)}55%,100%{transform:translateX(120%)}}
        .scroll-arrows{display:flex;flex-direction:column;align-items:center}
        .scroll-arrows svg{color:#34d399;animation:scrollArrow 1.8s ease-in-out infinite}
        .scroll-arrows svg:nth-child(2){margin-top:-9px;animation-delay:.3s}
        @keyframes scrollArrow{0%{transform:translateY(-4px);opacity:0}35%{opacity:1}100%{transform:translateY(6px);opacity:0}}
        @keyframes caretBlink{50%{opacity:.1}}
        .vapour-white{background:linear-gradient(100deg,#ffffff 15%,#dbeafe 35%,#f5f3ff 50%,#e2e8f0 65%,#ffffff 85%);background-size:220% auto;-webkit-background-clip:text;background-clip:text;color:transparent;animation:shimmerSlide 5.5s linear infinite}
        @keyframes shimmerSlide{to{background-position:220% center}}
        @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .marquee-track{animation:marquee 34s linear infinite}
        .android-frame{width:min(265px,86vw);border-radius:40px;padding:8px;background:linear-gradient(165deg,#252e3d 0%,#141b25 45%,#080c12 100%);border:1px solid rgba(255,255,255,.18);box-shadow:0 25px 70px -15px rgba(0,0,0,.85),0 0 0 1px rgba(0,0,0,.8);position:relative}
        .android-frame::before{content:"";position:absolute;inset:1px;border-radius:39px;border:1px solid rgba(255,255,255,.07);pointer-events:none}
        .android-screen{border-radius:32px;overflow:hidden;width:100%;aspect-ratio:1080/2340;background:#080c13;border:1px solid rgba(255,255,255,.06);position:relative}
        .android-screen img{display:block;width:100%;height:100%;object-fit:cover;object-position:top;background:#080c13}
        .story-step{opacity:.85;transform:none;transition:opacity .4s cubic-bezier(0.16,1,0.3,1), transform .4s cubic-bezier(0.16,1,0.3,1)}
        @media(min-width:1024px){.story-step{opacity:.28;transform:scale(0.98)}}
        .story-step.is-on{opacity:1!important;transform:scale(1)!important}
        .story-dot{transition:all .3s}
        .tactile-chip {
          background: rgba(18, 25, 40, 0.88);
          border: 1px solid rgba(255, 255, 255, 0.14);
          box-shadow: 0 16px 40px -8px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease;
        }
        .tactile-chip:hover {
          transform: translateY(-2px);
          box-shadow: 0 22px 50px -10px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .story-act {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          opacity: 0;
          will-change: transform, opacity, filter;
        }

        .memory-card {
          position: absolute;
          background: rgba(17, 24, 39, 0.92);
          border: 1px solid rgba(255, 255, 255, 0.14);
          box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 1.25rem;
          padding: 0.85rem 1.15rem;
        }
        [data-landing-mode="paper"] .memory-card {
          background: #ffffff !important;
          border-color: rgba(28, 25, 23, 0.18) !important;
          box-shadow: 0 16px 36px -8px rgba(80, 60, 35, 0.14) !important;
          color: #1c1917 !important;
        }
        [data-landing-mode="poster"] .memory-card,
        [data-landing-mode="blueprint"] .memory-card {
          background: #ffffff !important;
          border: 2px solid #111111 !important;
          box-shadow: 4px 4px 0 #111111 !important;
          color: #111111 !important;
        }
        [data-landing-mode="poster"] .memory-card .text-white {
          color: #111111 !important;
        }
        [data-landing-mode="poster"] .memory-card .text-zinc-200,
        [data-landing-mode="poster"] .memory-card .text-zinc-300 {
          color: #111111 !important;
        }
        [data-landing-mode="poster"] .memory-card .text-zinc-400 {
          color: #555555 !important;
        }
        [data-landing-mode="poster"] .memory-card .text-rose-200 {
          color: #dc2626 !important;
        }
        [data-landing-mode="poster"] .memory-card .text-rose-300,
        [data-landing-mode="poster"] .memory-card [class*="text-rose-300"] {
          color: #b91c1c !important;
        }
        [data-landing-mode="poster"] .memory-card .text-sky-200 {
          color: #0369a1 !important;
        }
        [data-landing-mode="poster"] .memory-card .text-emerald-400 {
          color: #047857 !important;
        }
        [data-landing-mode="poster"] .memory-card .text-amber-300,
        [data-landing-mode="poster"] .memory-card .text-amber-200 {
          color: #b45309 !important;
        }
        [data-landing-mode="poster"] .memory-stream-badge {
          background: #ffffff !important;
          border: 2px solid #111111 !important;
          color: #991b1b !important;
          box-shadow: 3px 3px 0px #111111 !important;
        }

        .synth-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        [data-landing-mode="paper"] .synth-card {
          background: #ffffff !important;
          border-color: rgba(28, 25, 23, 0.18) !important;
          box-shadow: 0 16px 36px -8px rgba(80, 60, 35, 0.14) !important;
        }
        [data-landing-mode="poster"] .synth-card,
        [data-landing-mode="blueprint"] .synth-card {
          background: #ffffff !important;
          border: 1.5px solid #111111 !important;
          box-shadow: 3px 3px 0 #111111 !important;
        }
        [data-landing-mode="paper"] .synth-core {
          background: rgba(28, 25, 23, 0.08) !important;
          border-color: rgba(28, 25, 23, 0.2) !important;
          box-shadow: 0 4px 16px rgba(80, 60, 35, 0.12) !important;
        }
        [data-landing-mode="paper"] .synth-core span {
          color: #1c1917 !important;
        }
        [data-landing-mode="poster"] .synth-core,
        [data-landing-mode="blueprint"] .synth-core {
          background: #ffffff !important;
          border: 2px solid #111111 !important;
          box-shadow: 3px 3px 0 #111111 !important;
        }
        [data-landing-mode="poster"] .synth-core span,
        [data-landing-mode="blueprint"] .synth-core span {
          color: #111111 !important;
        }

        .hero-welcome-block { opacity: 1; transform: none; }
        .scroll-hint { opacity: .85; transform: none; }

        @media (prefers-reduced-motion: reduce) {
          .story-act-1, .story-act-2, .story-act-3, .story-act-4 {
            display: none !important;
          }
          .story-act-5 {
            opacity: 1 !important;
            position: relative !important;
            pointer-events: auto !important;
          }
          .hero-welcome-block {
            opacity: 1 !important;
          }
        }
        .rail-viewport{overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;padding:0 0 1.25rem}
        .rail-viewport::-webkit-scrollbar{display:none}
        .rail-track{display:flex;gap:1.25rem;width:max-content}
        .rail-gutter{width:max(1.25rem,calc((100vw - 75rem)/2 + 2rem));flex-shrink:0}
        .rail-card{scroll-snap-align:center;width:min(340px,80vw)}
        .rail-sticky{position:sticky;top:4.5rem;height:calc(100vh - 4.5rem);min-height:580px;width:100%;display:flex;flex-direction:column;justify-content:center;padding:1rem 0}
        .rail-clip{overflow:hidden;width:100%}
        @media(max-width:1023.5px){.rail-sticky{position:static;height:auto;min-height:0;display:block;padding:0}.rail-clip{overflow:visible}}
        @media(min-width:1024px){.rail-viewport{overflow:visible}}
        @media(prefers-reduced-motion:reduce){.marquee-track,.btn-shine:after{animation:none!important}.typed-caret > i{animation:none}.scroll-arrows svg{animation:none}}
      `}</style>

      <div ref={rootRef} className="landing-root relative min-h-screen" data-landing-mode={mode}>
        {/* ambient background (strictly clipped within page bounds, zero bottom overflow) */}
        <div className="hero-bg-glow pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="hero-orb hero-orb-top absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full blur-[120px]" style={{ background: "radial-gradient(closest-side, rgba(52,211,153,.22), transparent)" }} />
          <div className="hero-orb absolute top-[30%] -left-40 h-[480px] w-[480px] rounded-full blur-[110px]" style={{ background: "radial-gradient(closest-side, rgba(167,139,250,.18), transparent)" }} />
          <div className="hero-orb absolute top-[55%] -right-40 h-[520px] w-[520px] rounded-full blur-[110px]" style={{ background: "radial-gradient(closest-side, rgba(56,189,248,.15), transparent)" }} />
          <div className="absolute inset-0 opacity-[0.16]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.14) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.14) 1px, transparent 1px)", backgroundSize: "56px 56px", maskImage: "radial-gradient(70% 55% at 50% 30%, #000, transparent)" }} />
        </div>

        <Header onLoginClick={goLogin} mode={mode} onModeChange={handleModeChange} />

        <main className="relative z-10">
          {/* ── OPENING & 5-MOMENT CINEMATIC STORY SEQUENCE (580vh scroll space for deliberate pacing) ── */}
          <section id="top" className="relative min-h-[580vh] scroll-mt-24">
            <div className="sticky top-16 sm:top-20 flex h-[calc(100dvh-4rem)] sm:h-[calc(100vh-5rem)] flex-col justify-center overflow-hidden px-4 sm:px-8">
              
              {/* ── SCENE 01: Controlled Student Chaos & Alive Environment ── */}
              <div className="hero-welcome-block pointer-events-none absolute inset-0 flex flex-col justify-center p-4 sm:p-8 lg:p-12 z-10">
                {/* Main dominant typographic headline with physical interactions */}
                <div className="hero-headline-wrap relative my-auto max-w-5xl text-left z-10 py-2 sm:py-4">
                  {/* Vector guideline passing behind CHAOTIC */}
                  <div className="absolute top-[40%] -left-16 right-0 h-px bg-gradient-to-r from-transparent via-rose-500/30 to-transparent pointer-events-none hidden md:block" />

                  <div className="flex flex-wrap items-center gap-2.5 mb-2.5 sm:mb-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/15 px-3 py-0.5 sm:px-3.5 sm:py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-rose-300 backdrop-blur-md shadow-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
                      Scene 01 // Student Reality
                    </div>
                    <div className="hero-trust-badge inline-flex items-center gap-2 rounded-full px-3 py-0.5 sm:px-3.5 sm:py-1 text-[10px] font-mono uppercase tracking-wider font-bold transition-all">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>trusted by 450+ SRMites</span>
                    </div>
                    <span className="hidden lg:inline-block font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                      SYS_ID: SRM_KTR_2026 // [ACADEMIA SYNC: ACTIVE]
                    </span>
                  </div>

                  <div className="relative">
                    <h1 className="chaos-title-1 font-display text-[clamp(2.2rem,6.8vw,5.8rem)] font-black leading-[0.92] tracking-tight text-white">
                      COLLEGE IS{" "}
                      <span className="relative inline-block font-serif italic font-normal text-rose-300">
                        CHAOTIC.
                        {/* Dynamic SVG underline scribble */}
                        <svg className="absolute -bottom-2 sm:-bottom-2.5 left-0 w-full h-3 sm:h-3.5 text-rose-500/70 overflow-visible pointer-events-none" viewBox="0 0 200 14" fill="none">
                          <path d="M3 9C60 2 140 12 197 5M15 12C70 5 130 13 185 8" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
                        </svg>
                      </span>
                    </h1>
                  </div>

                  <div className="chaos-title-2 mt-2 sm:mt-5 flex flex-col sm:flex-row sm:items-baseline gap-1.5 sm:gap-6 relative">
                    <h2 className="font-display text-[clamp(1.75rem,5.2vw,4.6rem)] font-black leading-[0.94] tracking-tight text-zinc-200">
                      YOUR TOOLS <span className="font-serif italic font-normal text-emerald-300">SHOULDN&apos;T BE.</span>
                    </h2>

                    <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto pt-0.5 sm:pt-0">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 -rotate-12 shrink-0 hidden sm:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M7 17L17 7M17 7H7M17 7V17" />
                        </svg>
                        <span className="font-hand text-lg sm:text-2xl lg:text-3xl text-emerald-400 select-none -rotate-1">
                          built for SRMites who value their sanity
                        </span>
                      </div>

                      {/* Artistic Trust Stamp */}
                      <div className="hero-trust-stamp inline-flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-mono font-bold tracking-tight select-none rotate-[-1.5deg] shadow-sm transition-transform hover:rotate-0 cursor-default">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>trusted by 450+ SRMites</span>
                        <span className="text-[10px] opacity-70">✦</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating tactile student reality fragments & micro marks framing the screen */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden z-20">
                  {/* Fragment 1 (Top Left): Attendance Debarment Warning Gauge (Dynamic/Rotating outward on scroll - No tape) */}
                  <div className="hero-chip-attendance absolute top-[3%] left-[2%] sm:left-[3%] flex flex-col gap-1 sm:gap-1.5 rounded-xl sm:rounded-2xl tactile-chip p-2 sm:p-3.5 rotate-[-6deg] sm:rotate-[-7.5deg] max-w-[155px] xs:max-w-[185px] sm:max-w-[230px] select-none">
                    <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                      <span className="font-mono text-[8.5px] sm:text-[10px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-ping" />
                        Debar Risk
                      </span>
                      <span className="font-mono text-[8px] sm:text-[9px] text-zinc-400">DO 4</span>
                    </div>
                    <div className="flex items-baseline justify-between gap-1 sm:gap-2">
                      <span className="font-mono text-xs sm:text-base font-black text-rose-200">74.2%</span>
                      <span className="font-mono text-[8.5px] sm:text-[10px] text-rose-300/90 font-medium">1 slot left</span>
                    </div>
                    <div className="h-1 sm:h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-[74.2%] bg-gradient-to-r from-rose-500 to-amber-400 rounded-full" />
                    </div>
                    <span className="font-mono text-[7.5px] sm:text-[9px] text-rose-400/80">safe skips remaining: 0</span>
                  </div>

                  {/* Fragment 2 (Top Center-Left, Staggered Down): Mini Timetable Schedule Slot (Dynamic/Rotating outward on scroll - No tape) */}
                  <div className="hero-chip-timetable absolute top-[14%] left-[17%] xl:left-[19%] hidden lg:flex items-center gap-3 rounded-2xl tactile-chip px-4 py-2.5 rotate-[4.5deg] select-none">
                    <span className="rounded-lg bg-emerald-400/15 border border-emerald-400/30 px-2 py-1 font-mono text-[11px] font-bold text-emerald-300">
                      Slot B · 08:00 AM
                    </span>
                    <div>
                      <div className="font-mono text-xs font-bold text-white">Full Stack Web Dev</div>
                      <div className="font-mono text-[10px] text-zinc-400">TP402 Tech Park · Margin: +1</div>
                    </div>
                  </div>

                  {/* Laptop Fragment A (Top Center): SRM OD Approval Form (Static & taped - just dissolves on scroll) */}
                  <div className="hero-chip-laptop absolute top-[2.5%] left-[45%] xl:left-[47%] hidden lg:flex flex-col gap-1 rounded-2xl tactile-chip p-3 rotate-[-4.5deg] max-w-[220px] select-none border-amber-500/30">
                    {/* Washi tape anchoring it to poster */}
                    <div className="tactile-washi-tape absolute -top-2.5 left-8 w-12 h-3.5 rounded-xs rotate-[3deg] pointer-events-none" />
                    <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1">
                      <span className="font-mono text-[9px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                        <GraduationCap className="h-3 w-3 text-amber-400" />
                        OD FORM #408
                      </span>
                      <span className="font-mono text-[8px] font-black bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30">
                        PENDING HOD
                      </span>
                    </div>
                    <div className="font-hand text-xs text-amber-200 leading-tight">
                      &quot;Need 3 physical printouts &amp; parent letter&quot;
                    </div>
                    <div className="font-mono text-[8px] text-zinc-400 flex items-center justify-between pt-0.5">
                      <span>Milan Fest · 3 slots</span>
                      <span className="text-rose-400 font-bold">FA: &quot;Meet after 4 PM&quot;</span>
                    </div>
                  </div>

                  {/* Fragment 3 (Top Right): DO 4 or 5 Caution Chip (Dynamic/Rotating outward on scroll - No tape) */}
                  <div className="hero-chip-caution absolute top-[4%] right-[11%] xl:right-[13%] flex items-center gap-1.5 sm:gap-2.5 rounded-xl sm:rounded-2xl tactile-chip px-2.5 py-1.5 sm:px-4 sm:py-2.5 rotate-[8.5deg] max-w-[145px] xs:max-w-[180px] sm:max-w-none select-none">
                    <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-1.5">
                      <span className="font-mono text-[8.5px] sm:text-xs text-amber-200 font-bold leading-tight">DO 4 or 5?</span>
                      <span className="font-hand text-[10px] sm:text-sm text-amber-300 underline decoration-amber-400/40">circular?</span>
                    </div>
                  </div>

                  {/* Laptop Fragment B (Upper-Right): Handwritten 28-Page Assignment Sheet (Static & taped - just dissolves on scroll) */}
                  <div className="hero-chip-laptop absolute top-[16%] right-[2.5%] xl:right-[3.5%] hidden lg:flex flex-col gap-1.5 rounded-2xl tactile-chip tactile-postit p-3.5 rotate-[-6.5deg] max-w-[225px] select-none">
                    {/* Washi tape anchoring it to poster */}
                    <div className="tactile-washi-tape absolute -top-2.5 left-4 w-12 h-3.5 rounded-xs rotate-[-8deg] pointer-events-none" />
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[9px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <BookOpen className="h-3 w-3" />
                        ASSIGNMENT 02
                      </span>
                      <span className="tactile-stamp-red font-mono text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tight rotate-[4deg]">
                        DUE 8:00 AM
                      </span>
                    </div>
                    <div className="font-hand text-xs text-amber-200 leading-snug">
                      &quot;Handwriting 28 pages of code on ruled A4 sheets at 3 AM...&quot;
                    </div>
                    <div className="flex items-center justify-between pt-0.5 font-mono text-[8.5px] text-zinc-400">
                      <span className="text-purple-400 font-bold">18CSC302J</span>
                      <span>Slot C submission</span>
                    </div>
                  </div>

                  {/* Laptop Fragment C (Mid-Right): Lab Observation Manual (Static & taped - just dissolves on scroll) */}
                  <div className="hero-chip-laptop absolute top-[43%] right-[2%] xl:right-[3%] hidden lg:flex flex-col gap-1.5 rounded-2xl tactile-chip p-3.5 rotate-[6.5deg] max-w-[230px] select-none border-rose-500/30">
                    {/* Washi tape anchoring it to poster */}
                    <div className="tactile-washi-tape absolute -top-2.5 right-6 w-14 h-3.5 rounded-xs rotate-[-5deg] pointer-events-none" />
                    <div className="flex items-center justify-between border-b border-white/10 pb-1">
                      <span className="font-mono text-[9px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1">
                        <FileText className="h-3 w-3 text-rose-400" />
                        EXP 06 OBSERVATION
                      </span>
                      <span className="tactile-stamp-red font-mono text-[7.5px] font-black px-1.5 py-0.5 rounded rotate-[-2deg]">
                        RE-DO IN PENCIL ✕
                      </span>
                    </div>
                    <div className="font-hand text-xs text-rose-200 leading-tight">
                      &quot;Circuit graph drawn in ballpoint pen — redo before 4 PM or zero!&quot;
                    </div>
                    <div className="font-mono text-[8px] text-zinc-400 flex items-center justify-between pt-0.5">
                      <span>— Lab In-charge</span>
                      <span className="text-amber-400 font-bold">needs 12 printouts</span>
                    </div>
                  </div>

                  {/* Laptop Fragment D (Lower Mid-Right): SGPA Target 9.20 (Static & taped - just dissolves on scroll) */}
                  <div className="hero-chip-laptop absolute bottom-[27%] right-[15%] xl:right-[18%] hidden lg:flex flex-col gap-1.5 rounded-2xl tactile-chip p-3.5 rotate-[-5.5deg] max-w-[220px] select-none border-emerald-400/30">
                    {/* Washi tape anchoring it to poster */}
                    <div className="tactile-washi-tape absolute -top-2.5 left-10 w-12 h-3.5 rounded-xs rotate-[-3deg] pointer-events-none" />
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="font-mono text-[9px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-emerald-400" />
                        Target 9.20 SGPA
                      </span>
                      <span className="tactile-stamp-emerald font-mono text-[7.5px] font-black px-1.5 py-0.5 rounded uppercase">
                        DEAN&apos;S LIST
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 font-mono text-[9px] text-zinc-300 pt-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">DAA (Slot C)</span>
                        <span className="font-bold text-emerald-300">Need 22/25 in CA2</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">OS (Slot E)</span>
                        <span className="font-bold text-emerald-400">Safe for O grade</span>
                      </div>
                    </div>
                    <div className="font-hand text-[11px] text-emerald-300/90 -rotate-1 pt-0.5">
                      &quot;3 internal marks = 0.2 GPA bump&quot;
                    </div>
                  </div>

                  {/* Laptop Fragment E (Bottom Mid-Left): Tech Park Elevator Queue (Static & taped - just dissolves on scroll) */}
                  <div className="hero-chip-laptop absolute bottom-[12%] left-[17%] xl:left-[19%] hidden lg:flex items-center gap-3 rounded-2xl tactile-chip px-3.5 py-2.5 rotate-[-6deg] max-w-[230px] select-none border-sky-400/30">
                    {/* Washi tape anchoring it to poster */}
                    <div className="tactile-washi-tape absolute -top-2 right-6 w-10 h-3 rounded-xs rotate-[4deg] pointer-events-none" />
                    <div className="h-7 w-7 rounded-xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center shrink-0">
                      <Coffee className="h-3.5 w-3.5 text-sky-300" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[9.5px] font-bold text-sky-200">TP Lift Queue: ~48</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                      </div>
                      <div className="font-hand text-xs text-sky-300 leading-tight">
                        stairs = 3m 20s · skip the wait
                      </div>
                    </div>
                  </div>

                  {/* Fragment 4 (Bottom Left): Campus Locator (Dynamic/Rotating outward on scroll - No tape) */}
                  <div className="hero-chip-campus absolute bottom-[18%] sm:bottom-[16%] lg:bottom-[4%] left-[2%] sm:left-[3%] flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl tactile-chip px-2.5 py-1.5 sm:px-4 sm:py-3 rotate-[5deg] max-w-[160px] xs:max-w-[200px] sm:max-w-none select-none">
                    <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-sky-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-mono text-[8.5px] sm:text-xs font-bold text-sky-200 truncate">TP402 Tech Park</div>
                      <div className="font-hand text-[10px] sm:text-sm text-sky-300 leading-tight truncate">elevator line: 40 ↗ stairs</div>
                    </div>
                  </div>

                  {/* Fragment 6 (Bottom Right): Bunk Equation (Dynamic/Rotating outward on scroll - No tape) */}
                  <div className="hero-chip-bunk absolute bottom-[18%] sm:bottom-[20%] lg:bottom-[14%] right-[2%] sm:right-[3%] flex flex-col gap-0.5 sm:gap-1 rounded-xl sm:rounded-2xl tactile-chip p-2 sm:p-3.5 rotate-[6.5deg] max-w-[145px] xs:max-w-[185px] sm:max-w-none select-none">
                    <div className="flex items-center justify-between gap-1.5 sm:gap-3 text-[8px] sm:text-[10px] font-mono text-emerald-400 font-bold">
                      <span>BUNK MATH</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <div className="font-hand text-xs sm:text-lg text-emerald-200 leading-tight">
                      safe skips = 2 slots
                    </div>
                    <div className="text-[7.5px] sm:text-[9px] font-mono text-emerald-400/70 truncate">next class: Slot B TP402</div>
                  </div>
                </div>

                {/* Center Bottom Scroll Indicator */}
                <div className="hero-scroll-hint flex items-center justify-center border-t border-white/[0.08] pt-3 pb-1 w-full text-center">
                  <button
                    onClick={() => {
                      document.getElementById("story")?.scrollIntoView({ behavior: "smooth" })
                    }}
                    className="group inline-flex items-center gap-2.5 text-[11px] font-mono tracking-[0.14em] uppercase text-zinc-400 hover:text-white transition-colors cursor-pointer select-none"
                    aria-label="Scroll to bring order to chaos"
                  >
                    <span>Scroll to bring order to chaos</span>
                    <span className="hero-scroll-arrow inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 font-bold animate-bounce text-xs transition-transform group-hover:translate-y-0.5">
                      ↓
                    </span>
                  </button>
                </div>
              </div>

              {/* ── ACT 1: Moment 01 - The Reality (Quiet / Monumental) ── */}
              <div className="story-act-1 story-act">
                <div className="max-w-4xl text-center px-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3.5 py-1 text-[11px] font-mono uppercase tracking-[0.24em] text-emerald-300 mb-6">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Moment 01 // The Reality
                  </div>
                  <h2 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[0.98]">
                    College is thousands of{" "}
                    <span className="font-serif italic font-normal text-rose-300 underline decoration-rose-500/30 underline-offset-8">
                      frantic moments.
                    </span>
                  </h2>
                  <p className="font-hand text-xl sm:text-3xl text-zinc-400 mt-6 max-w-xl mx-auto">
                    ↳ waking up at 07:45 AM, checking which day order it is, calculating if you can skip slot A.
                  </p>
                </div>
              </div>

              {/* ── ACT 2: Moment 02 - The Memories Flood (Visual Memories in Parallax) ── */}
              <div className="story-act-2 story-act">
                <div className="relative h-full w-full max-w-6xl mx-auto flex items-center justify-center pointer-events-none">
                  <div className="absolute top-[47%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10">
                    <span className="memory-stream-badge whitespace-nowrap rounded-full border border-rose-500/30 bg-rose-500/15 px-3.5 py-1.5 font-mono text-[10px] sm:text-xs uppercase tracking-[0.18em] sm:tracking-[0.25em] text-rose-300 backdrop-blur-md">
                      MEMORY STREAM // OVERLOAD
                    </span>
                  </div>

                  {/* Memory 1: WhatsApp group panic bubble */}
                  <div className="mem-card-1 memory-card top-[6%] sm:top-[12%] left-2.5 sm:left-[8%] max-w-[240px] sm:max-w-[280px]">
                    <div className="flex items-center gap-2 font-mono text-[10px] text-emerald-400 mb-1">
                      <MessageSquareText className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">Batch 2026 Official Group</span>
                    </div>
                    <p className="text-xs text-zinc-200 font-sans leading-snug">
                      &quot;Bro who has the lab manual PDF?? portal closes at 11:59 PM tonight!!&quot;
                    </p>
                  </div>

                  {/* Memory 2: Timetable Conflict */}
                  <div className="mem-card-2 memory-card top-[24%] sm:top-[14%] right-2.5 sm:right-[8%] max-w-[230px] sm:max-w-[260px]">
                    <div className="flex items-center justify-between text-[10px] font-mono text-amber-300 mb-1">
                      <span>SLOT CONFLICT</span>
                      <span className="text-rose-400 font-bold">DO 3</span>
                    </div>
                    <div className="text-xs font-bold text-white">Slot A1 vs Slot B</div>
                    <div className="text-[10px] font-mono text-zinc-400">Both scheduled at 08:00 AM TP402</div>
                  </div>

                  {/* Memory 3: Debarment Alert */}
                  <div className="mem-card-3 memory-card top-[57%] sm:top-auto sm:bottom-[26%] left-2.5 sm:left-[6%] max-w-[240px] sm:max-w-[270px]">
                    <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-rose-400 mb-1">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      <span>ATTENDANCE CRITICAL</span>
                    </div>
                    <div className="text-base sm:text-lg font-black text-rose-200 font-mono">74.1% Attendance</div>
                    <div className="text-[10px] font-mono text-rose-300/80">Debarment warning automatically sent</div>
                  </div>

                  {/* Memory 4: Faculty Cabin Locked */}
                  <div className="mem-card-4 memory-card top-[75%] sm:top-auto sm:bottom-[24%] right-2.5 sm:right-[7%] max-w-[240px] sm:max-w-[270px]">
                    <div className="flex items-center gap-1.5 font-mono text-[10px] text-sky-300 mb-1">
                      <IdCard className="h-3.5 w-3.5 shrink-0" />
                      <span>Faculty Cabin Search</span>
                    </div>
                    <div className="text-xs font-bold text-white truncate">Prof. Ramachandran · TP411</div>
                    <div className="font-hand text-xs sm:text-sm text-sky-200 mt-0.5">&quot;Door locked · check UB 8th floor&quot;</div>
                  </div>

                  {/* Memory 5: Dead Google Drive Link */}
                  <div className="mem-card-5 memory-card top-[38%] left-[2%] sm:left-[14%] hidden md:block max-w-[240px]">
                    <div className="font-mono text-[10px] text-violet-300 mb-0.5">drive.google.com/srm...</div>
                    <div className="text-xs font-bold text-rose-300">404 You Need Permission</div>
                    <div className="text-[9px] font-mono text-zinc-400">Owner deleted file from server</div>
                  </div>

                  {/* Memory 6: Campus Shuttle Queue */}
                  <div className="mem-card-6 memory-card top-[42%] right-[2%] sm:right-[12%] hidden md:block max-w-[240px]">
                    <div className="font-mono text-[10px] text-amber-400 mb-0.5">Gate 1 EV Shuttle</div>
                    <div className="text-xs font-bold text-white">65 students in queue</div>
                    <div className="font-hand text-sm text-amber-200">&quot;Running to Tech Park stairs...&quot;</div>
                  </div>
                </div>
              </div>

              {/* ── ACT 3: Moment 03 - The Core Tension (Quiet / Visceral) ── */}
              <div className="story-act-3 story-act">
                <div className="max-w-4xl text-center px-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-[11px] font-mono uppercase tracking-[0.24em] text-amber-300 mb-6">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Moment 03 // The Universal Truth
                  </div>
                  <h2 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[0.96]">
                    EVERYTHING IS{" "}
                    <span className="font-serif italic font-normal text-zinc-300 underline decoration-white/20 underline-offset-8">
                      SOMEWHERE.
                    </span>
                  </h2>
                  <h3 className="font-display mt-4 sm:mt-8 text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-rose-400 leading-[0.96]">
                    NOTHING IS{" "}
                    <span className="font-serif italic font-normal text-amber-300 underline decoration-amber-400/30 underline-offset-8">
                      TOGETHER.
                    </span>
                  </h3>
                  <p className="font-hand text-xl sm:text-3xl text-zinc-400 mt-6 sm:mt-8">
                    ↳ Academia, portals, spreadsheets, group chats, drives. None of them talk to each other.
                  </p>
                </div>
              </div>

              {/* ── ACT 4: Moment 04 - The Synthesis (Chaos -> Unified Order) ── */}
              <div className="story-act-4 story-act">
                <div className="max-w-5xl text-center px-4 w-full">
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3.5 py-1 text-[11px] font-mono uppercase tracking-[0.24em] text-emerald-300 mb-6">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Moment 04 // The Synthesis
                  </div>

                  <h2 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[0.96]">
                    EVERY PIECE{" "}
                    <span className="font-serif italic font-normal text-emerald-300 underline decoration-emerald-400/30 underline-offset-8">
                      FINDS ITS PLACE.
                    </span>
                  </h2>

                  {/* The 4 Core Streams Converging with Central Core Badge */}
                  <div className="synth-dock relative mx-auto mt-7 sm:mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-4xl">
                    {/* Stream 1: Timetable */}
                    <div className="synth-card synth-card-1 flex items-center gap-2.5 rounded-2xl tactile-chip px-3.5 sm:px-4 py-2.5 border-emerald-400/30">
                      <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-400 shrink-0">
                        <CalendarDays className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <div className="font-mono text-[10px] text-emerald-300 uppercase tracking-wider font-bold">Timetable</div>
                        <div className="font-mono text-xs font-bold text-white">08:00 AM · TP402</div>
                      </div>
                    </div>

                    {/* Stream 2: Attendance Debar Guard */}
                    <div className="synth-card synth-card-2 flex items-center gap-2.5 rounded-2xl tactile-chip px-3.5 sm:px-4 py-2.5 border-rose-400/30">
                      <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-rose-400/15 text-rose-400 shrink-0">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <div className="font-mono text-[10px] text-rose-300 uppercase tracking-wider font-bold">Debar Guard</div>
                        <div className="font-mono text-xs font-bold text-white">75.0% Math Sync</div>
                      </div>
                    </div>

                    {/* Central Synthesis Core Node */}
                    <div className="synth-core flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.08] px-4 py-2 backdrop-blur-xl shadow-[0_0_40px_rgba(52,211,153,0.3)]">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="font-display text-xs sm:text-sm font-black tracking-widest text-white uppercase">
                        edutechsrm // core
                      </span>
                    </div>

                    {/* Stream 3: Study Notes & PYQs */}
                    <div className="synth-card synth-card-3 flex items-center gap-2.5 rounded-2xl tactile-chip px-3.5 sm:px-4 py-2.5 border-violet-400/30">
                      <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-violet-400/15 text-violet-400 shrink-0">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <div className="font-mono text-[10px] text-violet-300 uppercase tracking-wider font-bold">79 Subjects</div>
                        <div className="font-mono text-xs font-bold text-white">PYQs & Notes Vault</div>
                      </div>
                    </div>

                    {/* Stream 4: Campus Radar */}
                    <div className="synth-card synth-card-4 flex items-center gap-2.5 rounded-2xl tactile-chip px-3.5 sm:px-4 py-2.5 border-sky-400/30">
                      <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-sky-400/15 text-sky-400 shrink-0">
                        <Navigation className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <div className="font-mono text-[10px] text-sky-300 uppercase tracking-wider font-bold">Campus Radar</div>
                        <div className="font-mono text-xs font-bold text-white">TP · UB · Cabins</div>
                      </div>
                    </div>
                  </div>

                  <p className="font-hand text-xl sm:text-3xl text-zinc-400 mt-6 sm:mt-8">
                    ↳ Timetable, attendance math, faculty desks, and study archives — converging into one live thread.
                  </p>
                </div>
              </div>

              {/* ── ACT 5: Moment 05 - The Emotional Resolution & Product Emergence ── */}
              <div className="story-act-5 story-act">
                <div className="max-w-4xl text-center px-4">
                  <div className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-[11px] font-mono uppercase tracking-[0.24em] mb-5 transition-all ${
                    isPoster
                      ? "border-2 border-[#111111] bg-white text-[#111111] shadow-[2px_2px_0px_#111111]"
                      : "border border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${isPoster ? "bg-[#111111]" : "bg-emerald-400"}`} />
                    Resolution // The Engine
                  </div>
                  <h2 className={`font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.02] ${
                    isPoster ? "text-[#111111]" : "text-white"
                  }`}>
                    EduTechSRM is built for{" "}
                    <span className={`font-serif italic font-normal ${
                      isPoster ? "text-emerald-700 underline decoration-[#111111]/25" : "text-emerald-300"
                    }`}>
                      all of them.
                    </span>
                  </h2>
                  <p className={`mx-auto mt-4 sm:mt-6 max-w-xl text-sm sm:text-base leading-relaxed font-sans ${
                    isPoster ? "text-[#111111]/70" : "text-zinc-400"
                  }`}>
                    One sign-in. Live Academia attendance margins, day order sync, internal marks breakdown, and campus navigation unified in one place.
                  </p>

                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                      onClick={goLogin}
                      style={{ color: isPoster ? "#ffffff" : undefined }}
                      className={`inline-flex items-center justify-center gap-2.5 rounded-2xl px-8 py-4 text-sm font-black transition-all active:scale-[0.98] cursor-pointer ${
                        isPoster
                          ? "bg-[#111111] text-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] hover:bg-zinc-800 hover:shadow-[5px_5px_0px_#111111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                          : "btn-shine bg-gradient-to-r from-emerald-300 to-teal-300 text-zinc-950 shadow-lg shadow-emerald-500/25 hover:brightness-110"
                      }`}
                    >
                      <span style={{ color: isPoster ? "#ffffff" : undefined }}>{isAuthenticated ? "Launch Dashboard" : "Connect SRM Academia"}</span>
                      <ArrowRight className="h-4 w-4" style={{ color: isPoster ? "#ffffff" : undefined }} />
                    </button>
                    <button
                      onClick={() => document.getElementById("story")?.scrollIntoView({ behavior: "smooth" })}
                      className={`inline-flex items-center gap-2 rounded-2xl px-7 py-4 text-sm font-bold transition-all active:scale-[0.98] cursor-pointer ${
                        isPoster
                          ? "bg-white text-[#111111] border-2 border-[#111111] shadow-[3px_3px_0px_#111111] hover:bg-[#f4f1ea] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                          : "border border-white/10 bg-white/[0.04] text-zinc-300 backdrop-blur-md hover:bg-white/[0.08] hover:text-white"
                      }`}
                    >
                      <span style={{ color: isPoster ? "#111111" : undefined }}>See the 6 Screens</span>
                      <ChevronDown className="h-4 w-4" style={{ color: isPoster ? "#111111" : "#34d399" }} />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* ── marquee ── */}
          <section className="border-y border-white/5 bg-white/[0.015] py-5">
            <div className="overflow-hidden" style={{ maskImage: "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)" }}>
              <div className="marquee-track flex w-max gap-3">{[...tags, ...tags].map((t, i) => (
                <span key={i} className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-xs font-semibold text-zinc-400">{t}</span>
              ))}</div>
            </div>
          </section>

          {/* ── SCROLL STORY: PINNED CINEMATIC APP SHOWCASE THEATER ── */}
          <section id="story" className="relative min-h-auto lg:min-h-[500vh] scroll-mt-24">
            {/* Ambient atmospheric orbs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
              <div
                className="hero-orb absolute top-1/4 left-[10%] h-[380px] w-[500px] rounded-full blur-[140px] transition-colors duration-700 opacity-40"
                style={{ background: `radial-gradient(closest-side, ${STORY[active].accent}35, transparent)` }}
              />
              <div
                className="hero-orb absolute bottom-1/4 right-[10%] h-[340px] w-[460px] rounded-full blur-[140px] transition-colors duration-700 opacity-30"
                style={{ background: `radial-gradient(closest-side, ${STORY[active].accent}25, transparent)` }}
              />
            </div>

            {/* ══════════════════════════════════════════════════════════
                DESKTOP PINNED CINEMATIC THEATER (>= 1024px)
               ══════════════════════════════════════════════════════════ */}
            <div className="sticky top-16 sm:top-20 hidden lg:flex h-[calc(100dvh-4rem)] sm:h-[calc(100vh-5rem)] flex-col justify-between overflow-hidden px-8 lg:px-14 py-6 max-w-[1440px] mx-auto w-full z-20">
              
              {/* ── Top Director Bar: Category Badge + Interactive Engine Tabs + Progress ── */}
              <div className="flex items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
                {/* Left: Category Badge */}
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-3.5 py-1 text-xs font-mono uppercase tracking-[0.2em] text-emerald-400 backdrop-blur-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>002 // System Anatomy</span>
                  </div>
                  <span className="font-mono text-[11px] text-zinc-500 uppercase tracking-widest hidden xl:inline">
                    6 Shipping Engines // SRMIST KTR
                  </span>
                </div>

                {/* Center: Interactive Engine Switcher Tabs */}
                <div className="story-tabs-pill flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-black/40 p-1.5 backdrop-blur-xl shrink-0">
                  {STORY.map((s, i) => {
                    const isCurrent = active === i
                    return (
                      <button
                        key={s.id}
                        onClick={() => jumpToScreen(i)}
                        className={`relative flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-mono transition-all duration-300 ${
                          isCurrent
                            ? "is-active-tab text-white font-bold shadow-lg keep-white"
                            : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                        }`}
                        style={
                          isCurrent
                            ? isPoster
                              ? { background: "#111111", border: "1.5px solid #111111", color: "#ffffff" }
                              : { background: `${s.accent}25`, border: `1px solid ${s.accent}60`, color: "#ffffff" }
                            : { border: "1px solid transparent" }
                        }
                      >
                        <span
                          className="story-tab-dot h-1.5 w-1.5 rounded-full transition-all duration-300 shrink-0"
                          style={{
                            background: isCurrent ? (isPoster ? "#10b981" : s.accent) : "rgba(255,255,255,0.25)",
                            boxShadow: isCurrent ? (isPoster ? "0 0 8px #10b981" : `0 0 8px ${s.accent}`) : "none",
                          }}
                        />
                        <span className={isCurrent ? "keep-white font-bold" : undefined} style={{ color: isCurrent ? "#ffffff" : undefined }}>
                          0{i + 1} {s.id.toUpperCase()}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Right: Step Counter & Progress Pill */}
                <div className="flex items-center gap-3 shrink-0 whitespace-nowrap">
                  <span className="font-mono text-xs text-zinc-400 font-medium whitespace-nowrap story-step-counter">
                    0{active + 1} <span className="text-zinc-600">/</span> 0{STORY.length}
                  </span>
                  <div className="flex gap-1 shrink-0">
                    {STORY.map((_, i) => (
                      <div
                        key={i}
                        className="h-1.5 rounded-full transition-all duration-300 shrink-0"
                        style={{
                          width: active === i ? 22 : 6,
                          background: active === i ? (isPoster ? "#111111" : STORY[active].accent) : (isPoster ? "rgba(17,17,17,0.25)" : "rgba(255,255,255,0.15)"),
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Main Stage Arena: Left Editorial Spread vs Right Device Theater ── */}
              <div className="grid grid-cols-[1.1fr_0.9fr] xl:grid-cols-[1.18fr_0.82fr] gap-10 xl:gap-16 items-center flex-1 my-auto max-h-[74vh]">
                
                {/* ── Left Column: Monumental Editorial Typography ── */}
                <div className="relative z-10 flex flex-col justify-center pr-2">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={active}
                      initial={{ opacity: 0, y: 22, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -18, filter: "blur(4px)" }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="relative"
                    >
                      {/* Engine kicker pill */}
                      <div className="flex items-center gap-2.5 mb-4">
                        <span
                          className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-[11px] font-mono uppercase tracking-[0.16em] transition-all duration-300"
                          style={{
                            background: `${STORY[active].accent}15`,
                            color: STORY[active].accent,
                            border: `1px solid ${STORY[active].accent}40`,
                          }}
                        >
                          <span className="h-1.5 w-1.5 rounded-full animate-ping" style={{ background: STORY[active].accent }} />
                          {STORY[active].kicker}
                        </span>
                        <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                          // {STORY[active].eyebrow}
                        </span>
                      </div>

                      {/* Monumental Headline */}
                      <h2 className="font-display text-3xl sm:text-4xl xl:text-[3.4rem] font-black tracking-tight text-white leading-[0.98]">
                        {STORY[active].titlePrefix}{" "}
                        <span
                          className="font-serif italic font-normal underline decoration-1 underline-offset-8"
                          style={{
                            color: STORY[active].accent,
                            textDecorationColor: `${STORY[active].accent}40`,
                          }}
                        >
                          {STORY[active].titleEmphasis}
                        </span>
                      </h2>

                      {/* Narrative Body Copy */}
                      <p className="mt-5 text-base sm:text-lg text-zinc-300 font-sans leading-relaxed max-w-xl">
                        {STORY[active].body}
                      </p>

                      {/* Handwritten Student Quote */}
                      <div className="mt-4 flex items-center gap-2">
                        <span className="font-hand text-2xl sm:text-3xl text-emerald-300/95 select-none">
                          ↳ &ldquo;{STORY[active].studentNote}&rdquo;
                        </span>
                      </div>

                      {/* Action Links */}
                      <div className="mt-8 flex items-center gap-4">
                        <button
                          onClick={goLogin}
                          className="btn-shine inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs font-mono font-bold uppercase tracking-wider text-black transition-all hover:scale-[1.02] shadow-lg"
                          style={{ background: STORY[active].accent }}
                        >
                          <span>Experience on Web</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                        <a
                          href={PLAY_STORE_URL}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
                        >
                          <span>Android APK Live</span>
                          <ArrowUpRight className="h-3 w-3" />
                        </a>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* ── Right Column: Device Stage with Pure Uncluttered Pedestal ── */}
                <div className="relative flex items-center justify-center py-2">
                  {/* Dynamic multi-layer radial aura behind phone */}
                  <div
                    className="absolute h-[420px] w-[340px] rounded-full blur-[110px] pointer-events-none transition-all duration-700 opacity-60"
                    style={{ background: `radial-gradient(closest-side, ${STORY[active].accent}, transparent)` }}
                  />

                  {/* Phone wrapper with perspective tilt */}
                  <div ref={phoneRef} style={{ perspective: 1200 }} className="relative z-10">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={active}
                        initial={{ opacity: 0, scale: 0.96, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -16 }}
                        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <RealPhone
                          shot={STORY[active].shot}
                          alt={STORY[active].alt}
                          glow={STORY[active].accent}
                          width="min(255px, 22vw, calc((68vh - 40px) * 1080 / 2340))"
                        />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

              </div>

              {/* ── Bottom Director Bar: Active Label + Navigation Guidance ── */}
              <div className="flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs font-mono text-zinc-400">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">0{active + 1}</span>
                  <span className="text-zinc-600">//</span>
                  <span className="uppercase tracking-wider text-zinc-300">{STORY[active].kicker}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                  <span>SCROLL TO TRAVERSE ENGINES</span>
                  <span className="text-zinc-600">·</span>
                  <span>CLICK TABS TO JUMP</span>
                </div>
              </div>

            </div>

            {/* ══════════════════════════════════════════════════════════
                MOBILE NATIVE REEL (< 1024px)
               ══════════════════════════════════════════════════════════ */}
            <div className="lg:hidden px-5 py-20 sm:px-8">
              {/* Section Header */}
              <div className="mb-10 text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-3.5 py-1 text-xs font-mono uppercase tracking-[0.2em] text-emerald-400 backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>002 // SYSTEM ANATOMY</span>
                </div>
                <h2 className="font-display mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl">
                  One engine. <span className="font-serif italic font-normal text-zinc-300">Infinite clarity.</span>
                </h2>
                <p className="mt-3 text-sm text-zinc-400 font-sans">
                  Swipe horizontally to tour all 6 production screens.
                </p>
              </div>

              {/* Horizontal Swipeable Snap Reel */}
              <div
                ref={mobileReelRef}
                className="flex gap-5 overflow-x-auto pb-6 pt-1 scrollbar-none snap-x snap-mandatory"
              >
                {STORY.map((s, i) => (
                  <div
                    key={s.id}
                    className="w-[305px] shrink-0 snap-center rounded-3xl border border-white/10 p-5 shadow-2xl surface-card flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider"
                          style={{ background: `${s.accent}15`, color: s.accent, border: `1px solid ${s.accent}30` }}
                        >
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.accent }} />
                          {s.kicker}
                        </span>
                        <span className="font-mono text-[11px] text-zinc-500 font-bold">
                          0{i + 1} / 06
                        </span>
                      </div>

                      <h3 className="font-display mt-3 text-xl font-black text-white leading-tight">
                        {s.titlePrefix}{" "}
                        <span className="font-serif italic font-normal" style={{ color: s.accent }}>
                          {s.titleEmphasis}
                        </span>
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-zinc-400 font-sans line-clamp-2">
                        {s.body}
                      </p>
                      <p className="font-hand text-sm text-emerald-300 mt-1.5">
                        ↳ &ldquo;{s.studentNote}&rdquo;
                      </p>
                    </div>

                    {/* Compact Phone Frame */}
                    <div className="mt-4 flex justify-center relative">
                      <div
                        className="w-[205px] rounded-[26px] border p-1.5 shadow-2xl android-frame"
                        style={{ boxShadow: "0 16px 40px rgba(0,0,0,.7)" }}
                      >
                        <div className="overflow-hidden rounded-[20px] bg-[#0b0f16]" style={{ aspectRatio: "1080 / 2340" }}>
                          <img
                            src={SHOT_SRC[s.shot]}
                            alt={s.alt}
                            width={1080}
                            height={2340}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover object-top"
                            draggable={false}
                          />
                        </div>
                      </div>

                      {/* Primary Floating Badge on Mobile */}
                      {s.callouts[0] && (
                        <div
                          className="absolute -bottom-2 right-2 rounded-xl tactile-chip px-2.5 py-1 text-[10px] font-mono font-bold text-white border border-white/20 shadow-lg flex items-center gap-1.5"
                          style={{ background: "rgba(10,14,22,0.92)" }}
                        >
                          <span className="h-1.5 w-1.5 rounded-full animate-ping" style={{ background: s.accent }} />
                          <span>{s.callouts[0].text}</span>
                        </div>
                      )}
                    </div>

                    {/* Specs Row */}
                    <div className="mt-4 grid grid-cols-3 gap-1.5 border-t border-white/[0.06] pt-3">
                      {s.specs.map((spec, spIdx) => (
                        <div key={spIdx} className="rounded-lg bg-white/[0.03] p-1.5 text-center">
                          <span className="block text-[8px] font-mono uppercase text-zinc-500">{spec.label}</span>
                          <span className="block text-[10px] font-mono font-bold text-zinc-200 truncate mt-0.5">{spec.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile Navigation Controls */}
              <div className="mt-4 flex items-center justify-between px-2 text-[11px] font-mono text-zinc-400">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => scrollMobileReelTo(Math.max(0, mobileReelIdx - 1))}
                    disabled={mobileReelIdx === 0}
                    aria-label="Previous screen"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/[0.08]"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => scrollMobileReelTo(Math.min(STORY.length - 1, mobileReelIdx + 1))}
                    disabled={mobileReelIdx === STORY.length - 1}
                    aria-label="Next screen"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/[0.08]"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <span className="text-[11px] text-zinc-400 font-bold ml-1">
                    0{mobileReelIdx + 1} / 0{STORY.length}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {STORY.map((s, i) => (
                    <button
                      key={s.id}
                      aria-label={s.kicker}
                      onClick={() => scrollMobileReelTo(i)}
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: mobileReelIdx === i ? 20 : 6,
                        background: mobileReelIdx === i ? s.accent : "rgba(255,255,255,0.2)",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>



          <CampusShowcase isPoster={isPoster} />

          {/* ── 004: REAL-SCREEN GALLERY / THE INTERFACE ATLAS ── */}
          <section id="atlas" className="mx-auto w-full max-w-[1280px] px-5 pt-8 pb-28 sm:px-8 scroll-mt-28">
            {/* Editorial Section Header */}
            <div className="gs-reveal mb-14 lg:mb-18 text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-400/10 px-3.5 py-1 text-xs font-mono uppercase tracking-[0.2em] text-violet-300 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
                <span>004 // Interface Atlas</span>
              </div>
              <h2 className="font-display mt-5 text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-[3.2rem] leading-[1.0] text-balance">
                Calendar. Courses. Profile.
                <br />
                <span className="font-serif italic font-normal text-violet-300">
                  Three essential pillars. Zero compromise.
                </span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zinc-300 sm:text-base font-sans">
                Live day-order synchronizers, professor room allocations, and encrypted student profiles presented with editorial clarity.
              </p>
            </div>

            {/* Editorial Triptych Showcase */}
            <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible items-stretch">
              {GALLERY.map((g, idx) => (
                <div
                  key={g.shot}
                  className={`gs-reveal group relative flex flex-col justify-between rounded-[32px] border border-white/[0.08] bg-[#070b13]/85 p-6 sm:p-7 backdrop-blur-2xl transition-all duration-500 hover:border-white/[0.20] hover:bg-[#0a0f1b]/95 md:w-auto shrink-0 snap-center w-[310px] shadow-[0_24px_60px_rgba(0,0,0,0.55)] ${
                    idx === 1 ? "md:-translate-y-4" : ""
                  }`}
                >
                  {/* Subtle top ambient aura */}
                  <div
                    className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 h-44 w-44 rounded-full blur-[80px] opacity-25 group-hover:opacity-45 transition-opacity duration-500"
                    style={{ background: g.accent }}
                    aria-hidden="true"
                  />

                  {/* Top metadata badge strip */}
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-6">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider"
                      style={{
                        background: `${g.accent}15`,
                        color: g.accent,
                        border: `1px solid ${g.accent}35`,
                      }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full animate-ping" style={{ background: g.accent }} />
                      {g.tag}
                    </span>
                    <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                      {g.kicker}
                    </span>
                  </div>

                  {/* Phone Device Showcase with Pedestal Lighting */}
                  <div className="relative my-3 flex items-center justify-center">
                    <div
                      className="mx-auto w-fit transition-transform duration-500 group-hover:scale-[1.03]"
                      style={{
                        filter: "drop-shadow(0 25px 45px rgba(0,0,0,.7))",
                      }}
                    >
                      <div className="android-frame" style={{ width: 215 }}>
                        <div className="android-screen">
                          <img
                            src={SHOT_SRC[g.shot]}
                            alt={g.alt}
                            width={1080}
                            height={2340}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover object-top"
                            draggable={false}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Editorial Typography & Narrative */}
                  <div className="mt-7 text-left">
                    <h3 className="font-display text-xl sm:text-2xl font-black text-white leading-tight">
                      {g.titlePrefix}{" "}
                      <span className="font-serif italic font-normal" style={{ color: g.accent }}>
                        {g.titleEmphasis}
                      </span>
                    </h3>

                    <p className="mt-2.5 text-xs sm:text-[13px] leading-relaxed text-zinc-300 font-sans">
                      {g.desc}
                    </p>

                    <div className="mt-3">
                      <span className="font-hand text-lg sm:text-xl text-emerald-300/90 select-none">
                        ↳ &ldquo;{g.studentNote}&rdquo;
                      </span>
                    </div>

                    {/* Spec Tag Pills */}
                    <div className="mt-5 flex flex-wrap gap-1.5 pt-4 border-t border-white/[0.06]">
                      {g.specs.map((spec, sIdx) => (
                        <span
                          key={sIdx}
                          className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] font-mono text-zinc-400"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── features rail: scroll down, ride sideways ── */}
          <section id="features" ref={railSectionRef} data-od-id="features-rail" className="relative scroll-mt-24">
            <div className="rail-sticky">
              <div className="gs-reveal mx-auto mb-6 w-full max-w-5xl px-5 sm:px-8">
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 border-b border-white/[0.08] pb-5">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-1 text-xs font-mono uppercase tracking-[0.2em] text-cyan-300 backdrop-blur-md">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      <span>005 // Unified Toolkit</span>
                    </div>
                    <h2 className="font-display mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl leading-[0.95]">
                      TEN DEDICATED TOOLS.<br />
                      <span className="font-serif italic font-normal text-cyan-300">ONE LIVING ENGINE.</span>
                    </h2>
                  </div>

                  {/* Graphic connecting vector: TEXT → ARROW → MOVING SHELF */}
                  <div className="hidden lg:flex items-center gap-3 font-mono text-xs text-zinc-400 pb-1">
                    <span className="tracking-widest uppercase text-[11px] text-cyan-300/80">Toolkit Sequence</span>
                    <svg width="120" height="20" viewBox="0 0 120 20" fill="none" className="text-cyan-400">
                      <path d="M0 10H112M112 10L104 4M112 10L104 16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300">01 → 11 SLIDE</span>
                  </div>
                </div>
              </div>

              <div className="rail-clip">
                <div ref={railViewportRef} className="rail-viewport">
                  <div ref={railTrackRef} className="rail-track">
                    <div className="rail-gutter" aria-hidden="true" />
                    {GRID_FEATURES.map((f, i) => (
                      <article
                        key={f.title}
                        data-od-id={`feature-card-${f.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                        className="rail-card group relative overflow-hidden rounded-3xl border p-7 text-left backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 shadow-[0_16px_40px_rgba(0,0,0,0.5)] surface-card"
                      >
                        <div className="pointer-events-none absolute -top-12 right-0 h-32 w-32 rounded-full blur-3xl transition opacity-15 group-hover:opacity-30" style={{ background: f.color }} aria-hidden="true" />
                        <div className="flex items-start justify-between">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border transition-transform duration-300 group-hover:scale-105" style={{ borderColor: `${f.color}35`, background: `${f.color}10`, color: f.color }}>
                            <f.icon className="h-5 w-5" />
                          </div>
                          <span className="font-mono text-xs font-bold tracking-widest text-zinc-600">// {String(i + 1).padStart(2, "0")}</span>
                        </div>
                        <h3 className="font-display mt-5 text-xl font-bold tracking-tight text-white">{f.title}</h3>
                        <p className="mt-2 min-h-[44px] text-[13px] leading-relaxed text-zinc-400 font-sans">{f.desc}</p>
                        {f.note && (
                          <p className="font-hand text-base text-emerald-300/90 mt-2">
                            ↳ &ldquo;{f.note}&rdquo;
                          </p>
                        )}
                        <span className="mt-4 block h-0.5 w-8 rounded-full transition-all duration-300 group-hover:w-14" style={{ background: f.color }} aria-hidden="true" />
                      </article>
                    ))}
                    <article
                      data-od-id="feature-card-how-it-works"
                      className="surface-card rail-card group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/[0.08] via-white/[0.02] to-transparent p-7 text-left backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
                    >
                      <div className="pointer-events-none absolute -top-12 right-0 h-32 w-32 rounded-full blur-3xl transition opacity-20 group-hover:opacity-35" style={{ background: "#34d399" }} aria-hidden="true" />
                      <div className="flex items-start justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/35 bg-emerald-400/10 text-emerald-300 transition-transform duration-300 group-hover:scale-105">
                          <Zap className="h-5 w-5" />
                        </div>
                        <span className="font-mono text-xs font-bold tracking-widest text-zinc-600">// 11</span>
                      </div>
                      <h3 className="font-display mt-5 text-xl font-bold tracking-tight text-white">How It Works</h3>
                      
                      {/* Structured 3-step timeline */}
                      <div className="mt-3 space-y-2 font-mono text-[11px]">
                        <div className="flex items-center gap-2.5 text-zinc-300">
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-emerald-400/20 font-bold text-emerald-400 text-[10px]">1</span>
                          <span>Connect SRM Academia creds</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-zinc-300">
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-cyan-400/20 font-bold text-cyan-400 text-[10px]">2</span>
                          <span>Live-sync marks & timetable</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-zinc-300">
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-violet-400/20 font-bold text-violet-400 text-[10px]">3</span>
                          <span>AI bunk planner & alerts</span>
                        </div>
                      </div>

                      <p className="font-hand text-sm text-emerald-300/90 mt-2.5">
                        ↳ &ldquo;under 60s from zero to synced.&rdquo;
                      </p>

                      <button
                        onClick={goLogin}
                        className={`keep-white mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black transition-all cursor-pointer ${
                          isPoster
                            ? "bg-[#111111] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-zinc-800"
                            : "btn-shine bg-gradient-to-r from-emerald-300 via-teal-300 to-emerald-400 text-zinc-950 shadow-[0_4px_20px_rgba(52,211,153,0.3)] hover:brightness-110"
                        }`}
                        style={isPoster ? { color: "#ffffff", backgroundColor: "#111111" } : undefined}
                      >
                        <span className="keep-white font-mono uppercase tracking-wider" style={isPoster ? { color: "#ffffff" } : undefined}>
                          Launch Dashboard
                        </span>
                        <ArrowUpRight className={`h-4 w-4 ${isPoster ? "keep-white text-emerald-400" : "text-zinc-950 stroke-[2.5]"}`} style={isPoster ? { color: "#34d399" } : undefined} />
                      </button>
                    </article>
                    <div className="rail-gutter" aria-hidden="true" />
                  </div>
                </div>
                <div className="mx-auto mt-8 h-1 w-40 overflow-hidden rounded-full bg-white/[0.07]">
                  <div ref={railProgressRef} className="h-full w-full origin-left rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" style={{ transform: "scaleX(0)" }} />
                </div>
              </div>
            </div>
          </section>

          {/* ── GOOGLE PLAY APP SHOWCASE (Desktop & Android only; omitted on iOS/iPadOS) ── */}
          {!isAppleDevice && (
            <section id="app-showcase" className="relative mx-auto w-full max-w-[1240px] px-5 pt-28 pb-20 sm:py-24 lg:py-28 scroll-mt-28">
              <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                <div className="hero-orb absolute top-1/2 -right-16 h-[440px] w-[440px] -translate-y-1/2 rounded-full blur-[140px]" style={{ background: "radial-gradient(closest-side, rgba(52,211,153,.18), transparent)" }} />
                <div className="hero-orb absolute bottom-6 left-[8%] h-[300px] w-[300px] rounded-full blur-[120px]" style={{ background: "radial-gradient(closest-side, rgba(56,189,248,.12), transparent)" }} />
              </div>

              <div className="relative z-10 grid items-center gap-10 lg:grid-cols-12">
                {/* Left 7 cols: Monumental Typography + Play Store Badge */}
                <div className="gs-reveal lg:col-span-7 text-left flex flex-col items-start">
                  <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3.5 py-1 text-[11px] font-mono uppercase tracking-[0.14em] text-emerald-300 backdrop-blur-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="hidden sm:inline">Official Android Release · In.edutechsrm.app</span>
                    <span className="sm:hidden">Official Android Release</span>
                  </div>

                  <h2 className="font-display mt-5 text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl leading-[0.93]">
                    YOUR COLLEGE.<br />
                    <span className="font-serif italic font-normal text-emerald-300">IN YOUR POCKET.</span>
                  </h2>

                  <div className="mt-3">
                    <span className="font-hand text-2xl sm:text-3xl text-emerald-400 -rotate-1 inline-block select-none">
                      ↳ zero lag · instant push updates · built for 1000+ SRMites
                    </span>
                  </div>

                  <p className="mt-4 text-sm sm:text-base leading-relaxed text-zinc-300 font-sans max-w-xl">
                    Real-time Academia synchronization, instant day order notifications, live bunk limits, internal mark breakdowns, and the entire campus map — optimized natively for Android.
                  </p>

                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <a
                      href={PLAY_STORE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`keep-white inline-flex items-center gap-3.5 rounded-2xl px-7 py-4 text-sm font-black transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                        isPoster
                          ? "bg-[#111111] text-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] hover:bg-zinc-800"
                          : "btn-shine bg-gradient-to-r from-emerald-300 via-teal-300 to-emerald-400 text-zinc-950 shadow-[0_12px_40px_rgba(52,211,153,0.35)] hover:brightness-110"
                      }`}
                      style={isPoster ? { color: "#ffffff", backgroundColor: "#111111" } : undefined}
                    >
                      <svg className={`h-5 w-5 fill-current shrink-0 ${isPoster ? "keep-white text-white" : "text-zinc-950"}`} style={isPoster ? { color: "#ffffff" } : undefined} viewBox="0 0 24 24">
                        <path d="M3.609 1.814L13.793 12 3.61 22.186a2.38 2.38 0 0 1-.61-.986V2.8a2.38 2.38 0 0 1 .609-.986zm11.255 9.115l2.463-1.422-9.61-5.548 7.147 6.97zm2.463 2.142l-2.463-1.422-7.147 6.97 9.61-5.548zm1.06-1.071c.677.391.677 1.029 0 1.42l-2.029 1.171-2.463-2.463 2.463-2.463 2.029 1.171z" />
                      </svg>
                      <div className="text-left">
                        <div className={`keep-white text-[10px] uppercase font-mono tracking-widest leading-none ${isPoster ? "text-zinc-400" : "text-zinc-800"}`} style={isPoster ? { color: "#9ca3af" } : undefined}>GET IT ON</div>
                        <div className={`keep-white text-base font-black leading-tight ${isPoster ? "text-white" : ""}`} style={isPoster ? { color: "#ffffff" } : undefined}>Google Play</div>
                      </div>
                    </a>

                    <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span>Free · 4.8★ Rated · In.edutechsrm.app</span>
                    </div>
                  </div>
                </div>

                {/* Right 5 cols: Prominent Android frame */}
                <div className="lg:col-span-5 flex justify-center lg:justify-end pt-6 sm:pt-8 lg:pt-0">
                  <div className="app-phone-hero perspective-cinema relative w-full flex justify-center">
                    <div className="transform-gpu transition-transform duration-700 hover:rotate-0 rotate-0 sm:rotate-[2.5deg] lg:rotate-[4deg] hover:scale-[1.02]">
                      <RealPhone
                        shot="dashboard"
                        alt="edutechsrm Android App on Google Play"
                        glow="#34d399"
                        width="min(270px, 80vw)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ── FAQ (Placed after App Promotion) ── */}
          <section id="faq" className="mx-auto w-full max-w-[840px] px-5 py-24 sm:px-8 scroll-mt-24">
            <div className="gs-reveal mb-12 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-3.5 py-1 text-xs font-mono uppercase tracking-[0.2em] text-violet-400/90 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
                <span>007 // Clarifications</span>
              </div>
              <h2 className="font-display mt-6 text-3xl font-black text-white sm:text-4xl">
                Common questions, <span className="font-serif italic font-normal text-zinc-300">answered straight.</span>
              </h2>
            </div>
            <div className="space-y-3.5">
              {FAQS.map((f, i) => {
                const open = faqOpen === i
                return (
                  <div key={f.q} className="faq-accordion-item gs-reveal rounded-2xl border border-white/[0.08] bg-[#0c1017]/80 backdrop-blur-xl overflow-hidden transition-colors hover:border-white/[0.14]">
                    <button onClick={() => setFaqOpen(open ? null : i)} className="faq-accordion-trigger flex w-full items-center justify-between gap-4 px-6 py-5 text-left">
                      <span className="font-display text-sm font-bold sm:text-base text-white">{f.q}</span>
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.04] transition-transform duration-300 ${open ? "rotate-180 text-emerald-300" : "text-zinc-400"}`}><ChevronDown className="h-4 w-4" /></span>
                    </button>
                    <AnimatePresence initial={false}>{open && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28 }}>
                        <p className="border-t border-white/[0.06] px-6 py-4 text-sm leading-relaxed text-zinc-400 font-sans" dangerouslySetInnerHTML={{ __html: f.a }} />
                      </motion.div>
                    )}</AnimatePresence>
                  </div>
                )
              })}
            </div>
          </section>

          {/* ── welcoming login CTA ── */}
          <section className="px-4 pb-12 pt-4 sm:px-8 sm:pb-20 sm:pt-6">
            <div
              className="gs-reveal relative mx-auto max-w-[1000px] overflow-hidden rounded-3xl border p-8 text-center sm:rounded-[36px] sm:p-14 backdrop-blur-2xl shadow-[0_28px_80px_rgba(0,0,0,0.6)] surface-card-elevated"
              style={{
                background: mode === "paper"
                  ? "radial-gradient(90% 120% at 50% 0%, rgba(15,118,110,.08), transparent 60%), #ffffff"
                  : mode === "blueprint"
                    ? "radial-gradient(90% 120% at 50% 0%, rgba(56,189,248,.16), transparent 60%), #0a1c30"
                    : "radial-gradient(90% 120% at 50% 0%, rgba(52,211,153,.12), transparent 60%), radial-gradient(70% 100% at 50% 110%, rgba(167,139,250,.10), transparent 60%), #0b1019",
              }}
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3.5 py-1 text-[11px] font-mono font-bold text-emerald-300">
                {isAuthenticated ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>SRM Session Active</span>
                  </>
                ) : (
                  <>
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Direct SRM Academia Auth</span>
                  </>
                )}
              </div>

              <h2 className="font-display mx-auto max-w-2xl text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                College is already complicated.<br />
                <span className="font-serif italic font-normal text-emerald-300">Your tools don&apos;t have to be.</span>
              </h2>

              <div className="mt-2.5">
                <span className="font-hand text-2xl sm:text-3xl text-emerald-300 select-none">
                  &quot;one login · everything you actually need&quot;
                </span>
              </div>

              <p className="mx-auto mt-4 max-w-lg text-xs leading-relaxed text-zinc-400 sm:text-sm sm:leading-7 font-sans">
                {isAuthenticated
                  ? "Your live attendance, timetable, marks studio and campus map are ready."
                  : "Sign in with your NetID credentials to view your live attendance, day order, marks, timetable, and campus navigation."}
              </p>

              <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
                <button
                  onClick={goLogin}
                  className="btn-shine inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-300 to-teal-300 px-8 py-3.5 text-sm font-black text-zinc-950 shadow-lg shadow-emerald-500/20 transition hover:brightness-110 active:scale-[0.98]"
                >
                  {isAuthenticated ? (
                    <>
                      <span>Open Dashboard</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 text-zinc-900" />
                      <span>Log In with NetID</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                {isAndroidUser ? (
                  <a
                    href={PLAY_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2.5 rounded-2xl border border-emerald-400/30 bg-emerald-500/[0.08] px-7 py-3.5 text-sm font-bold text-emerald-200 transition hover:bg-emerald-500/[0.16] hover:border-emerald-400/50 active:scale-[0.98]"
                  >
                    <svg className="h-4 w-4 fill-current text-emerald-400 shrink-0" viewBox="0 0 24 24">
                      <path d="M3.609 1.814L13.793 12 3.61 22.186a2.38 2.38 0 0 1-.61-.986V2.8a2.38 2.38 0 0 1 .609-.986zm11.255 9.115l2.463-1.422-9.61-5.548 7.147 6.97zm2.463 2.142l-2.463-1.422-7.147 6.97 9.61-5.548zm1.06-1.071c.677.391.677 1.029 0 1.42l-2.029 1.171-2.463-2.463 2.463-2.463 2.029 1.171z" />
                    </svg>
                    <span>Available on Play Store</span>
                  </a>
                ) : (
                  <button
                    onClick={() => { window.location.href = "/explore" }}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/[0.1] bg-white/[0.03] px-7 py-3.5 text-sm font-bold text-zinc-200 backdrop-blur-md transition hover:border-white/[0.2] hover:bg-white/[0.06] hover:text-white active:scale-[0.98]"
                  >
                    <Navigation className="h-4 w-4 text-sky-300 shrink-0" />
                    <span>Explore campus map</span>
                  </button>
                )}
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-zinc-500 sm:gap-6">
                <span className="inline-flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-emerald-400/80" /> Direct SRM Academia auth
                </span>
                <span className="hidden h-1 w-1 rounded-full bg-zinc-700 sm:inline-block" />
                <span className="inline-flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-cyan-400/80" /> Credentials never stored
                </span>
                {isAndroidUser && (
                  <>
                    <span className="hidden h-1 w-1 rounded-full bg-zinc-700 sm:inline-block" />
                    <span className="inline-flex items-center gap-1.5 text-emerald-400/90">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Official Android App
                    </span>
                  </>
                )}
              </div>
            </div>
          </section>
        </main>

        <PublicFooter />
        <ModeSelectionModal
          isOpen={showModeModal}
          currentMode={mode}
          onSelectMode={(next, coords) => handleModeChange(next, coords)}
          onConfirm={() => {
            try {
              sessionStorage.setItem("edutechsrm_mode_prompt_seen", "1")
              localStorage.setItem("edutechsrm_theme_chosen_v1", "true")
            } catch {}
            setShowModeModal(false)
          }}
          onClose={() => {
            try {
              sessionStorage.setItem("edutechsrm_mode_prompt_seen", "1")
              localStorage.setItem("edutechsrm_theme_chosen_v1", "true")
            } catch {}
            setShowModeModal(false)
          }}
        />
        <FloatingAppAction onLogin={onEnterApp ?? goLogin} mode={mode} onModeChange={handleModeChange} />
      </div>
    </>
  )
}

function SmartphoneDot({ color }: { color: string }) {
  return <span className="inline-flex h-5 w-9 items-center rounded-full border border-white/10 bg-black/50 px-0.5"><span className="h-3.5 w-3.5 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}` }} /></span>
}

function MiniPhone({ index, accent }: { index: number; accent: string }) {
  const s = STORY[index]
  return (
    <div className="w-full max-w-[320px] rounded-[32px] border border-white/12 bg-gradient-to-b from-[#1a2230] to-[#0a0e15] p-2" style={{ boxShadow: `0 24px 60px rgba(0,0,0,.55), 0 0 40px ${accent}26` }}>
      <div className="overflow-hidden rounded-[24px] bg-[#0b0f16]" style={{ aspectRatio: "1080 / 2340" }}>
        <img src={SHOT_SRC[s.shot]} alt={s.alt} width={1080} height={2340} loading="lazy" decoding="async" className="h-full w-full object-cover object-top" draggable={false} />
      </div>
    </div>
  )
}
