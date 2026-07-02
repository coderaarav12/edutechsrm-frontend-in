"use client"

import { useEffect, useMemo, useState } from "react"
import type { CSSProperties } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  ExternalLink,
  FileText,
  GraduationCap,
  Lock,
  MessageSquareText,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/Header"
import { SEOStructuredData } from "@/components/seo-structured-data"
import { AiPrankPopup } from "@/components/ai-prank-popup"
import { PublicFooter } from "@/components/public-footer"

const features = [
  {
    icon: Bot,
    title: "edutechsrm AI",
    description:
      "Not a generic chatbot. Ask about your attendance, timetable, marks — and get answers based on your actual data, not guesses.",
    color: "#a78bfa",
    span: "lg:col-span-2",
  },
  {
    icon: Clock,
    title: "SRM Timetable Viewer",
    description:
      "See your full weekly SRM class schedule, day order, room number, faculty, slot, and today's classes with live data from SRM Academia.",
    color: "#34d399",
    span: "lg:col-span-2",
  },
  {
    icon: BarChart3,
    title: "Attendance Tracker",
    description:
      "Track attendance percentage for every subject, see at-risk courses below 75%, and know exactly how many classes you can skip or must attend.",
    color: "#f472b6",
  },
  {
    icon: CalendarDays,
    title: "OD / ML Attendance Mode",
    description:
      "Add OD or ML ranges in planner settings and compare attendance with and without adjustments in one tap.",
    color: "#22d3ee",
  },
  {
    icon: BookOpen,
    title: "Internal Marks Tracker",
    description:
      "View SRM internal assessment marks, totals, percentages, and low-score alerts in one clean place.",
    color: "#f59e0b",
  },
  {
    icon: TrendingUp,
    title: "GradeX CGPA Calculator",
    description:
      "Calculate CGPA from internal marks, simulate final grades, and plan the semester using what-if projections.",
    color: "#fb923c",
  },
  {
    icon: FileText,
    title: "Notes & Previous Year QPs",
    description:
      "Access subject-wise notes, study materials, and previous year question papers organized by course code.",
    color: "#60a5fa",
    span: "lg:col-span-2",
  },
  {
    icon: Shield,
    title: "Secure, No Password Stored",
    description:
      "Your SRM credentials are used only for authentication with SRM Academia. edutechsrm never stores your password.",
    color: "#34d399",
    span: "lg:col-span-2",
  },
]

const faqs = [
  {
    q: "What is edutechsrm?",
    a: "edutechsrm is a free SRMIST KTR student dashboard and faster alternative to SRM Academia. It brings timetable, attendance, internal marks, CGPA, calendar, notes, PYQs, assignments, and AI help into one place.",
  },
  {
    q: "Is this better than SRM Academia portal?",
    a: "edutechsrm uses the same academic data but presents it in a faster, cleaner, mobile-friendly dashboard with extra tools like attendance planning, GradeX CGPA prediction, notes, PYQs, and edutechsrm AI.",
  },
  {
    q: "Is my SRM password safe?",
    a: "Yes. Your SRM password is never stored by edutechsrm. Credentials are sent only for SRM Academia authentication, and the app stores only the temporary session token needed to fetch your data.",
  },
  {
    q: "Can I check my SRMKTR timetable here?",
    a: "Yes. Your SRM KTR timetable syncs live from SRM Academia and shows day order, today's classes, room numbers, faculty, and full weekly schedule.",
  },
  {
    q: "How do I find my exam seat number in SRM?",
    a: "Log in to sp.srmist.edu.in, open the side menu, and go to Exam Timetable. Your hall ticket will show your seat number, room, and hall details when SRM releases them.",
  },
  {
    q: "Can I check my SRM attendance and bunk limit?",
    a: "Yes. edutechsrm shows attendance percentage for every subject, highlights shortage risk below 75%, and calculates how many classes you can skip or must attend.",
  },
  {
    q: "Does edutechsrm have previous year question papers?",
    a: "Yes. The Notes & PYQs section has previous year question papers and study material organized by course code.",
  },
  {
    q: "Does this work for all SRMIST KTR students?",
    a: "Yes. edutechsrm is built for SRM Institute of Science and Technology, Kattankulathur students. Log in with your SRM Academia credentials to load your data.",
  },
  {
    q: "Is edutechsrm free?",
    a: "Yes. edutechsrm is free to use, with no subscriptions or hidden costs.",
  },
  {
    q: "Does edutechsrm have an AI chatbot?",
    a: "Yes. edutechsrm AI can answer questions about your timetable, attendance, marks, and study planning inside the app after login.",
  },
]

const seoTags = [
  "SRM Timetable App",
  "SRMKTR Timetable Online",
  "SRM Attendance Calculator",
  "SRM Bunk Calculator",
  "SRM OD ML Attendance",
  "SRM Internal Marks Tracker",
  "SRM CGPA Calculator",
  "SRM Day Order Today",
  "SRM PYQ Previous Year Questions",
  "edutechsrm AI Chatbot",
]

const dashboardRows = [
  [
    { title: "Next Class: DS Lab", subtitle: "UB1204 in 15 mins", value: "DO 3", progress: 84 },
    { title: "Operating Systems", subtitle: "TP501 at 10:40 AM", value: "DO 1", progress: 62 },
    { title: "DBMS Lab", subtitle: "Lab 7B at 1:20 PM", value: "DO 4", progress: 76 },
    { title: "Maths Tutorial", subtitle: "CRC 302 tomorrow", value: "DO 2", progress: 48 },
    { title: "Computer Networks", subtitle: "UB904 in 45 mins", value: "DO 5", progress: 71 },
    { title: "AI Fundamentals", subtitle: "TP409 at 2:10 PM", value: "DO 3", progress: 88 },
    { title: "Python Lab", subtitle: "Lab 3A at 3:00 PM", value: "DO 6", progress: 55 },
    { title: "DAA Lecture", subtitle: "UB512 tomorrow", value: "DO 1", progress: 67 },
    { title: "Free Hour", subtitle: "Planner says breathe", value: "11:30", progress: 35 },
    { title: "Next Sync", subtitle: "Fresh data ready", value: "Live", progress: 92 },
  ],
  [
    { title: "Total Attendance", subtitle: "84% safe zone", value: "84%", progress: 84 },
    { title: "DS Lab Attendance", subtitle: "3 safe skips left", value: "82%", progress: 82 },
    { title: "OS Attendance", subtitle: "Attend next 2 classes", value: "73%", progress: 73 },
    { title: "DBMS Internals", subtitle: "CA total updated", value: "38/50", progress: 76 },
    { title: "GradeX Target", subtitle: "Need A+ average", value: "8.8", progress: 88 },
    { title: "Calendar Alert", subtitle: "Holiday next week", value: "Mon", progress: 58 },
    { title: "PYQs Found", subtitle: "DBMS and DAA ready", value: "12", progress: 68 },
    { title: "Assignments", subtitle: "2 due this week", value: "2", progress: 42 },
    { title: "AI Queries", subtitle: "Remaining today", value: "11", progress: 74 },
    { title: "Shortage Risk", subtitle: "1 subject needs care", value: "1", progress: 31 },
  ],
] as const

function AiShowcaseCard({ style }: { style?: CSSProperties }) {
  return (
    <motion.div
      style={style}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-[390px] rounded-[34px] border border-white/10 bg-white/[0.035] p-5 shadow-[0_34px_90px_rgba(0,0,0,0.45)] backdrop-blur-3xl"
    >
      <div className="absolute inset-0 rounded-[34px] bg-[radial-gradient(circle_at_50%_0%,rgba(167,139,250,0.16),transparent_44%),radial-gradient(circle_at_50%_100%,rgba(52,211,153,0.14),transparent_42%)]" />
      <div className="relative">
        <div className="mb-7 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-300/25 bg-violet-300/12">
            <Bot className="h-5 w-5 text-violet-300" />
          </div>
          <div>
            <p className="font-display text-sm font-bold text-zinc-50">edutechsrm AI</p>
            <p className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">Academic assistant</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="ml-auto max-w-[82%] rounded-[20px_20px_6px_20px] border border-white/10 bg-white/[0.055] px-4 py-3 text-sm text-zinc-200">
            How many classes can I skip in DS Lab?
          </div>
          <div className="max-w-[92%] rounded-[6px_20px_20px_20px] border border-emerald-300/20 bg-emerald-300/10 px-4 py-4 text-sm leading-relaxed text-zinc-100">
            <span className="mb-2 inline-flex rounded-full bg-emerald-300 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-zinc-950">
              Prediction
            </span>
            <br />
            Based on your current 82% attendance, you can safely skip 3 labs and still stay above 75%.
          </div>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-2">
          {["Attendance what-ifs", "Timetable lookups", "Marks & CGPA", "Study tips"].map((item, index) => (
            <div
              key={item}
              className="rounded-2xl border px-3 py-3 text-center text-[11px] font-bold text-zinc-200"
              style={{
                borderColor: index % 2 ? "rgba(167,139,250,.22)" : "rgba(52,211,153,.22)",
                background: index % 2 ? "rgba(167,139,250,.055)" : "rgba(52,211,153,.055)",
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function FeatureCard({
  feature,
  index,
  className = "",
  ariaHidden = false,
}: {
  feature: (typeof features)[number]
  index: number
  className?: string
  ariaHidden?: boolean
}) {
  const Icon = feature.icon
  return (
    <motion.div
      aria-hidden={ariaHidden}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay: index * 0.035, duration: 0.45 }}
      className={`group min-h-[220px] overflow-hidden rounded-[28px] transition hover:-translate-y-1 lg:perspective-[1000px] backdrop-blur-xl ${feature.span || ""} ${className}`}
    >
      <div className="relative h-full rounded-[28px] border border-white/10 bg-white/[0.035] shadow-2xl hover:border-white/20 transition-transform duration-[300ms] lg:[transform-style:preserve-3d] lg:group-hover:[transform:rotateY(180deg)]">
        <div className="absolute -top-16 right-0 h-44 w-44 rounded-full blur-3xl transition group-hover:opacity-80 pointer-events-none" style={{ background: feature.color, opacity: 0.14 }} />
        <div className="flex flex-col items-center justify-center gap-4 p-6 text-center lg:absolute lg:inset-0 lg:[backface-visibility:hidden]">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border bg-zinc-950/45 shrink-0" style={{ borderColor: `${feature.color}44`, color: feature.color }}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-xl font-black tracking-tight text-zinc-50">{feature.title}</h3>
            <p className="mt-3 text-sm leading-7 text-zinc-400 lg:hidden">{feature.description}</p>
          </div>
        </div>
        <div className="hidden lg:flex flex-col items-center justify-center p-8 lg:absolute lg:inset-0 lg:[backface-visibility:hidden] lg:[transform:rotateY(180deg)]">
          <p className="text-base leading-relaxed text-zinc-300 text-center max-w-[90%]">{feature.description}</p>
        </div>
      </div>
    </motion.div>
  )
}

function TypewriterText({ text, className = "" }: { text: string; className?: string }) {
  const [displayed, setDisplayed] = useState("")
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed("")
    setDone(false)
    let i = 0
    const timer = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(timer)
        setDone(true)
      }
    }, 45)
    return () => clearInterval(timer)
  }, [text])

  return (
    <span className={className} suppressHydrationWarning>
      {displayed}
      {!done && <span className="inline-block w-[2px] h-[0.85em] bg-emerald-300 align-middle ml-0.5 animate-pulse" />}
    </span>
  )
}

function FAQItem({ item, index }: { item: (typeof faqs)[number]; index: number }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.035 }}
      className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl"
    >
      <button onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
        <span className="font-display text-sm font-bold text-zinc-100 sm:text-base">{item.q}</span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.045] text-zinc-400">
          <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180 text-emerald-300" : ""}`} />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <p className="border-t border-white/5 px-5 pb-5 pt-4 text-sm leading-7 text-zinc-400">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function LandingPage({ onEnterApp }: { onEnterApp: () => void }) {
  const { isAuthenticated } = useAuth()
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0)

  useEffect(() => {
    if (isAuthenticated) onEnterApp()
  }, [isAuthenticated, onEnterApp])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveFeatureIndex((index) => (index + 1) % features.length)
    }, 2500)
    return () => window.clearInterval(timer)
  }, [])

  const tags = useMemo(() => [...seoTags, ...seoTags], [])

  return (
    <>
      <SEOStructuredData />
      <style>{`
        .landing-root { font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
        .font-display { font-family: "Space Grotesk", ui-sans-serif, system-ui, sans-serif; }
        .hero-heading { font-size: clamp(2.35rem, 5.8vw, 5.05rem); line-height: 1.02; letter-spacing: -0.045em; text-wrap: balance; }
        .hero-subheading { font-size: clamp(1.8rem, 4.5vw, 3.5rem); line-height: 1.1; }
        @media (min-width: 1024px) and (max-width: 1320px) {
          .hero-heading { font-size: clamp(3.4rem, 5.45vw, 4.55rem); }
          .hero-copy { max-width: 620px; }
        }
        @media (max-width: 640px) {
          .mobile-hero-section {
            min-height: 100svh;
            align-items: center;
            overflow: hidden;
            padding: 5.4rem 1rem 1.25rem;
            background: #07090f;
          }
          .mobile-hero-content { position: relative; z-index: 1; display: block; }
          .mobile-hero-text { display: flex; min-height: calc(100svh - 6.65rem); flex-direction: column; justify-content: center; }
          .mobile-hero-badges { margin-bottom: 1.05rem; gap: .55rem; }
          .mobile-hero-badges > span { min-height: 32px; border-radius: 999px; padding-inline: .78rem; background: rgba(255,255,255,.045); backdrop-filter: blur(12px); }
          .mobile-hero-badges > span > span { height: .4rem !important; width: .4rem !important; flex: 0 0 .4rem; border-radius: 999px; box-shadow: 0 0 10px rgba(52,211,153,.65); }
          .hero-heading { font-size: clamp(2.55rem, 10.9vw, 3.35rem); line-height: 1.05; letter-spacing: -0.034em; }
          .hero-copy { margin-top: 1.05rem; max-width: 22rem; font-size: .94rem; line-height: 1.78; color: rgba(212,212,216,.80); }
          .mobile-hero-actions { margin-top: 1.35rem; gap: .72rem; }
          .mobile-hero-actions button { min-height: 54px; border-radius: 18px; font-size: .9rem; }
          .mobile-hero-actions button:first-child { box-shadow: 0 14px 30px rgba(52,211,153,.20); }
          .mobile-trust-panel {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: .75rem 1rem;
            margin-top: 1.35rem;
            border: 0;
            background: transparent;
            padding-top: 1.1rem;
            border-top: 1px solid rgba(255,255,255,.08);
          }
          .mobile-trust-panel span {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: .4rem;
            text-align: center;
            font-size: .62rem;
            line-height: 1.2;
            color: rgba(212,212,216,.62);
          }
          .mobile-trust-panel span:nth-child(2) { color: rgba(236,253,245,.82); }
          .mobile-trust-panel svg { height: 15px; width: 15px; }
          .tag-track { animation-duration: 58s; }
          .mobile-dashboard-card { height: 132px; width: 252px; border-radius: 22px; padding: 16px; }
          .mobile-dashboard-card-title { font-size: 12px; line-height: 1.25; }
          .mobile-dashboard-card-subtitle { font-size: 9px; }
          .mobile-dashboard-card-value { font-size: 20px; }
          .features-mobile-mask { overflow: hidden; width: 100%; }
          .features-mobile-track { display: flex; gap: 14px; transition: transform .45s cubic-bezier(.22,1,.36,1); width: 100%; }
          .features-mobile-slide { width: 100%; flex: 0 0 100%; min-height: 260px; }
          .feature-card-mobile { height: 260px; width: 100%; padding: 1.25rem; border-radius: 24px; border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.035); }
          .features-mobile-dots { margin-top: .9rem; display: flex; justify-content: center; gap: .45rem; }
          .features-mobile-dot { height: .48rem; width: .48rem; border-radius: 999px; border: 1px solid rgba(255,255,255,.16); background: rgba(255,255,255,.12); }
          .feature-card h3 { font-size: 1.05rem; line-height: 1.18; }
          .feature-card p { font-size: 0.82rem; line-height: 1.65; }
        }
        @keyframes tagMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .tag-track { animation: tagMarquee 38s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .tag-track { animation: none !important; } }
      `}</style>

      <div className="landing-root relative min-h-screen overflow-hidden bg-[#07090f] text-zinc-50">
        <Header onLoginClick={() => { window.location.href = "/login" }} />

        <main className="relative z-10">
          <section className="mobile-hero-section relative flex min-h-[100dvh] items-center px-4 pb-16 pt-28 sm:px-6 lg:px-12 xl:px-16">
            <div className="mobile-hero-content w-full max-w-[1180px] mx-auto">
              <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_390px] xl:grid-cols-[minmax(0,1fr)_430px]">
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mobile-hero-text text-center lg:text-left"
              >
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.18, delayChildren: 0.35 } } }}
                  className="mobile-hero-badges mb-5 flex flex-wrap justify-center gap-2 lg:justify-start"
                >
                  <motion.span variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_#34d399]" />
                    Academia 2.1 live
                  </motion.span>
                  <motion.span variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-[11px] font-semibold text-zinc-300">
                    <Sparkles className="h-3.5 w-3.5 text-violet-300" />
                    edutechsrm AI
                  </motion.span>
                </motion.div>

                <h1 className="hero-heading font-display font-black">
                  <span className="block">Your SRM dashboard</span>
                  <span className="hero-subheading shimmer-text mt-3 block bg-gradient-to-r from-emerald-300 via-cyan-300 to-violet-300 bg-clip-text text-transparent">
                    <TypewriterText text="timetable attendance marks and AI" />
                  </span>
                </h1>
                <p className="hero-copy mx-auto mt-6 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg lg:mx-0">
                  A free SRMIST KTR academic dashboard that connects to SRM Academia and puts timetable, attendance, internal marks, CGPA, notes, PYQs, assignments, and planning tools in one fast interface.
                </p>

                <div className="mobile-hero-actions mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                  <button
                    onClick={() => { window.location.href = isAuthenticated ? "/" : "/login" }}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-300 px-6 py-4 text-sm font-black text-zinc-950 shadow-[0_8px_18px_rgba(52,211,153,0.15)] transition hover:scale-[1.02]"
                  >
                    {isAuthenticated ? "Open Dashboard" : "Connect SRM Academia"} <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.045] px-6 py-4 text-sm font-bold text-zinc-100 backdrop-blur-xl transition hover:bg-white/[0.08]"
                  >
                    Explore features <ChevronDown className="h-4 w-4" />
                  </button>
                </div>

                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.12, delayChildren: 0.5 } } }}
                  className="mobile-trust-panel mt-9 flex flex-wrap justify-center gap-5 border-t border-white/10 pt-6 text-xs font-bold uppercase tracking-wider text-zinc-500 lg:justify-start"
                >
                  {[
                    [Shield, "Password never stored"],
                    [Bot, "AI-powered"],
                    [CheckCircle2, "Free forever"],
                  ].map(([Icon, label]) => (
                    <motion.span key={String(label)} variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="inline-flex items-center gap-2">
                      <Icon className="h-4 w-4 text-emerald-300" /> {String(label)}
                    </motion.span>
                  ))}
                </motion.div>

                <div className="flex justify-center mt-8 md:hidden">
                  <div className="flex flex-col items-center gap-2.5">
                    <div className="flex items-center gap-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1.2 + i * 0.1, type: "spring", stiffness: 300 }}
                        >
                          <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                        </motion.span>
                      ))}
                    </div>
                    <p className="text-sm font-black text-zinc-200">Trusted by 100+ SRMites</p>
                  </div>
                </div>
              </motion.div>

              <div className="hidden md:block">
                <AiShowcaseCard />
              </div>
              </div>

              <div className="hidden md:flex justify-center mt-8">
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                  className="flex flex-col items-center gap-2.5"
                >
                  <div className="flex items-center gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.2 + i * 0.1, type: "spring", stiffness: 300 }}
                      >
                        <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                      </motion.span>
                    ))}
                  </div>
                  <p className="text-sm font-black text-zinc-200">Trusted by 100+ SRMites</p>
                </motion.div>
              </div>
            </div>
          </section>

          <section className="border-y border-white/5 bg-white/[0.015] py-8">
            <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
              <div className="tag-track flex w-max gap-3">
                {tags.map((tag, index) => (
                  <span key={`${tag}-${index}`} className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-xs font-semibold text-zinc-400">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section id="features" className="px-4 py-20 sm:px-6 lg:px-16 lg:py-28">
            <div className="mx-auto max-w-7xl">
              <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="mx-auto mb-12 max-w-3xl text-center">
                <span className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">Everything SRM students need</span>
                <h2 className="font-display mt-4 text-3xl font-black tracking-tight text-zinc-50 sm:text-5xl">
                  Stop juggling tabs. Use one dashboard.
                </h2>
                <p className="mt-5 text-sm leading-7 text-zinc-400 sm:text-base">
                  Timetable, attendance, marks, CGPA, calendar, notes, PYQs, AI — everything your SRM Academia data can do, wrapped in a dashboard that actually loads fast.
                </p>
              </motion.div>
              <div className="features-mobile-mask md:hidden">
                <div
                  className="features-mobile-track"
                  style={{ transform: `translateX(calc(-${activeFeatureIndex * 100}% - ${activeFeatureIndex * 14}px))` }}
                >
                  {features.map((feature, index) => (
                    <div className="features-mobile-slide" key={feature.title}>
                      <FeatureCard feature={feature} index={index} className="w-full h-full" />
                    </div>
                  ))}
                </div>
                <div className="features-mobile-dots">
                  {features.map((feature, index) => (
                    <button
                      key={feature.title}
                      type="button"
                      aria-label={`Show ${feature.title}`}
                      aria-current={activeFeatureIndex === index ? "true" : undefined}
                      onClick={() => setActiveFeatureIndex(index)}
                      className={`features-mobile-dot ${activeFeatureIndex === index ? "features-mobile-dot-active" : ""}`}
                    />
                  ))}
                </div>
              </div>
              <div className="hidden gap-4 md:grid md:grid-cols-2 lg:grid-cols-4">
                {features.map((feature, index) => (
                  <FeatureCard key={feature.title} feature={feature} index={index} />
                ))}
              </div>
            </div>
          </section>

          <section className="overflow-hidden border-y border-white/5 bg-white/[0.018] py-20">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="mx-auto mb-12 flex max-w-7xl flex-col gap-4 px-4 sm:px-6 lg:px-16">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Inside the dashboard</span>
              <h2 className="font-display text-3xl font-black tracking-tight sm:text-5xl">Fast academic data, designed for scanning.</h2>
              <p className="max-w-2xl text-sm leading-7 text-zinc-400">
                The logged-in app turns SRM Academia data into focused views for schedule, attendance risk, internal marks, GradeX prediction, calendar, assignments, and notes.
              </p>
            </motion.div>
            <div className="-rotate-2 space-y-5">
              {dashboardRows.map((items, row) => (
                <div key={row} className={`flex w-max gap-5 ${row ? "animate-[tagMarquee_44s_linear_infinite_reverse]" : "tag-track"}`}>
                  {[...items, ...items].map((item, index) => (
                    <div key={`${row}-${item.title}-${index}`} className="mobile-dashboard-card h-40 w-[320px] rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur-2xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-300/12 text-emerald-300">
                            {row ? <BarChart3 className="h-5 w-5" /> : <CalendarDays className="h-5 w-5" />}
                          </div>
                          <div>
                            <p className="mobile-dashboard-card-title text-sm font-black text-zinc-100">{item.title}</p>
                            <p className="mobile-dashboard-card-subtitle mt-1 text-[11px] font-bold uppercase tracking-wide text-zinc-500">{item.subtitle}</p>
                          </div>
                        </div>
                        <span className="mobile-dashboard-card-value font-display text-2xl font-black text-emerald-300">{item.value}</span>
                      </div>
                      <div className="mt-9 h-2 rounded-full bg-zinc-950/80">
                        <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300" style={{ width: `${item.progress}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>

          <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-16 lg:py-28">
            <div className="absolute inset-x-0 top-1/2 h-72 -translate-y-1/2 bg-[radial-gradient(circle_at_50%_50%,rgba(52,211,153,0.08),transparent_65%)] blur-3xl" />
            <div className="relative mx-auto max-w-6xl">
              <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="mx-auto max-w-3xl text-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                  <Zap className="h-4 w-4" /> How it works
                </span>
                <h2 className="font-display mt-5 text-3xl font-black tracking-tight text-zinc-50 sm:text-5xl">
                  Three steps, then your dashboard is alive.
                </h2>
                <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
                  The flow is intentionally simple: connect SRM, let edutechsrm normalize your academic data, then use the dashboard and AI tools to plan your semester.
                </p>
              </motion.div>

              <div className="relative mt-12">
                <div className="absolute bottom-10 left-1/2 top-10 hidden w-0.5 -translate-x-1/2 bg-gradient-to-b from-transparent via-emerald-300/50 to-transparent shadow-[0_0_12px_rgba(52,211,153,0.15)] lg:block" />
                {[
                  {
                    icon: Lock,
                    title: "Login with SRM credentials",
                    text: "Use the same credentials you use on SRM Academia. edutechsrm authenticates the session and never stores your password.",
                    meta: "Secure connection",
                    color: "#34d399",
                  },
                  {
                    icon: Zap,
                    title: "Live data sync",
                    text: "Timetable, attendance, marks, courses, calendar, circulars, and planner data are fetched and cleaned into dashboard-ready views.",
                    meta: "SRM data normalized",
                    color: "#00f5d4",
                  },
                  {
                    icon: GraduationCap,
                    title: "Plan smarter with tools",
                    text: "Use attendance what-ifs, OD/ML mode, GradeX, notes, PYQs, assignments, and edutechsrm AI to make better academic decisions.",
                    meta: "Dashboard ready",
                    color: "#a78bfa",
                  },
                ].map((step, index) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -60 : 60, rotateX: index % 2 === 0 ? 10 : -10 }}
                    whileInView={{ opacity: 1, x: 0, rotateX: 0 }}
                    viewport={{ once: true, margin: "-120px" }}
                    transition={{ delay: index * 0.08, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className={`group relative mb-6 max-w-xl rounded-[30px] border border-white/10 bg-zinc-950/55 p-6 shadow-2xl backdrop-blur-2xl transition hover:-translate-y-1 hover:border-white/20 ${index % 2 === 0 ? "lg:mr-auto" : "lg:ml-auto"}`}
                  >
                    <div className={`absolute top-0 h-full w-1 left-0 rounded-l-[30px] ${index % 2 === 0 ? "lg:right-0 lg:rounded-r-[30px] lg:left-auto" : ""}`} style={{ background: step.color, opacity: 0.75 }} />
                    <div className="mb-5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border bg-zinc-950" style={{ borderColor: `${step.color}55`, color: step.color }}>
                            <step.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: step.color }}>
                              Step 0{index + 1}
                            </span>
                            <h3 className="font-display mt-1 text-xl font-black text-zinc-50">{step.title}</h3>
                          </div>
                        </div>
                        <span className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-zinc-500 md:inline-flex">
                          {step.meta}
                        </span>
                      </div>
                      <p className="text-sm leading-7 text-zinc-400">{step.text}</p>
                    </motion.div>
                ))}
              </div>
            </div>
          </section>

          <section className="px-4 pb-20 sm:px-6 lg:px-16">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }} className="mx-auto max-w-4xl rounded-[32px] border border-violet-300/15 bg-violet-300/[0.045] p-6 backdrop-blur-2xl sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-violet-300/25 bg-violet-300/10 text-violet-300">
                  <ExternalLink className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-violet-300">SRM portal guide</span>
                  <h2 className="font-display mt-2 text-2xl font-black text-zinc-50">How to find your exam seat</h2>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">
                    SRM has changed their system. Log in to sp.srmist.edu.in, open the side menu, tap Exam Timetable, and check your hall ticket for seat number, room, and hall details.
                  </p>
                  <a href="https://sp.srmist.edu.in" target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-violet-300 px-5 py-3 text-sm font-black text-zinc-950">
                    Go to SRM Portal <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          </section>

          <section id="faq" className="px-4 pb-24 sm:px-6 lg:px-16">
            <div className="mx-auto max-w-4xl">
              <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="mb-10 text-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-violet-300/25 bg-violet-300/10 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-violet-300">
                  <MessageSquareText className="h-4 w-4" /> FAQ
                </span>
                <h2 className="font-display mt-5 text-3xl font-black tracking-tight text-zinc-50 sm:text-5xl">Common questions</h2>
              </motion.div>
              <div className="space-y-3">
                {faqs.map((item, index) => (
                  <FAQItem key={item.q} item={item} index={index} />
                ))}
              </div>
            </div>
          </section>

          <section className="border-t border-white/5 bg-white/[0.018] px-4 py-20 text-center sm:px-6 lg:px-16">
            <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }} className="mx-auto max-w-4xl">
              <h2 className="font-display text-4xl font-black tracking-tight sm:text-6xl">
                Ready to try <span className="text-emerald-300">edutechsrm v2.1?</span>
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-zinc-400">
                Login once with your SRM credentials. Get your timetable, attendance, OD/ML-aware insights, AI chatbot, marks and more instantly.
              </p>
              <button onClick={() => { window.location.href = isAuthenticated ? "/" : "/login" }} className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-emerald-300 px-8 py-4 text-sm font-black text-zinc-950 shadow-[0_8px_18px_rgba(52,211,153,0.15)]">
                {isAuthenticated ? "Open Dashboard" : "Get Started Free"} <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          </section>
        </main>

        <PublicFooter />

        <AiPrankPopup />

        <div className="absolute left-[-9999px] h-px w-px overflow-hidden" aria-hidden="true">
          <h2>SRM Timetable App - SRMKTR Timetable Online 2026</h2>
          <p>edutechsrm is an SRM timetable app for SRMIST KTR students. View SRM KTR timetable online, day order, class schedule, room numbers, and faculty details.</p>
          <h2>SRM Academia Alternative - Student Dashboard for SRM KTR</h2>
          <p>edutechsrm gives SRM attendance, internal marks, timetable, calendar, notes, PYQs, CGPA tools, and AI in one modern dashboard.</p>
          <h2>SRM Attendance Tracker - Bunk Calculator for SRMIST</h2>
          <p>Track SRM attendance percentage per subject and calculate how many classes you can skip while staying above 75 percent attendance.</p>
          <h2>SRM AI Chatbot - Academic Assistant for SRMIST Students</h2>
          <p>edutechsrm AI helps SRM students with timetable lookup, attendance shortage planning, bunk limit guidance, internal marks, and study tips.</p>
        </div>
      </div>
    </>
  )
}

