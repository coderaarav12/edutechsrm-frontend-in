"use client"

import { motion } from "framer-motion"
import { BarChart3, BookOpen, Bot, CalendarDays, Clock, Globe, Lock, Rocket, ShieldCheck, Sparkles, Zap } from "lucide-react"
import { Header } from "@/components/Header"
import { PublicFooter } from "@/components/public-footer"

const values = [
  {
    icon: Zap,
    title: "Fast by default",
    text: "edutechsrm exists because academic data should not feel slow or scattered. The app turns SRM Academia data into focused dashboard views.",
    color: "#00f5d4",
  },
  {
    icon: ShieldCheck,
    title: "Student-first privacy",
    text: "Your SRM password is never stored. The app keeps only the session needed to fetch your live academic data.",
    color: "#34d399",
  },
  {
    icon: Bot,
    title: "AI with context",
    text: "edutechsrm AI can use timetable, attendance, marks, and academic context after login to answer practical student questions.",
    color: "#a78bfa",
  },
  {
    icon: Globe,
    title: "Built for SRMIST KTR",
    text: "The workflows are SRM-specific: day order, attendance shortage risk, GradeX CGPA planning, notes, PYQs, and academic calendar.",
    color: "#60a5fa",
  },
]

const modules = [
  [Clock, "Timetable", "Today, week, rooms, faculty, slots, and day order."],
  [BarChart3, "Attendance", "Percentages, bunk limit, shortage risk, and OD/ML mode."],
  [BookOpen, "Marks", "Internal marks, totals, low-score alerts, and GradeX inputs."],
  [CalendarDays, "Calendar", "Holidays, day order schedule, planner, and events."],
  [Sparkles, "Notes & PYQs", "Study material organized by course code."],
  [Bot, "edutechsrm AI", "Academic assistant for quick timetable and planning questions."],
] as const

export default function AboutPage() {
  return (
    <>
      <Header />
      <style>{`
        /* Poster Mode Styles */
        html[data-landing-mode="poster"] .about-main-bg {
          background-color: #f4efe6 !important;
          background-image: 
            radial-gradient(rgba(17,17,17,0.08) 1px, transparent 1px),
            linear-gradient(to right, rgba(17,17,17,0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(17,17,17,0.04) 1px, transparent 1px) !important;
          background-size: 24px 24px, 48px 48px, 48px 48px !important;
          color: #111111 !important;
        }
        html[data-landing-mode="poster"] .about-editorial-heading {
          color: #111111 !important;
        }
        html[data-landing-mode="poster"] .about-editorial-sub {
          color: #3f3f46 !important;
        }
        html[data-landing-mode="poster"] .about-telemetry-chip {
          background: #ffffff !important;
          border: 2px solid #111111 !important;
          box-shadow: 4px 4px 0px #111111 !important;
          color: #111111 !important;
        }
        html[data-landing-mode="poster"] .about-value-card {
          background: #ffffff !important;
          border: 2.5px solid #111111 !important;
          box-shadow: 6px 6px 0px #111111 !important;
          color: #111111 !important;
        }
        html[data-landing-mode="poster"] .about-value-card > div:first-child {
          background: #f4efe6 !important;
          border: 1.5px solid #111111 !important;
        }
        html[data-landing-mode="poster"] .about-value-card h2,
        html[data-landing-mode="poster"] .about-value-card p {
          color: #111111 !important;
        }
        html[data-landing-mode="poster"] .about-modules-section {
          background: #faf7f2 !important;
          border: 2.5px solid #111111 !important;
          box-shadow: 8px 8px 0px #111111 !important;
          color: #111111 !important;
        }
        html[data-landing-mode="poster"] .about-modules-section h2 {
          color: #111111 !important;
        }
        html[data-landing-mode="poster"] .about-module-card {
          background: #ffffff !important;
          border: 2px solid #111111 !important;
          box-shadow: 3px 3px 0px #111111 !important;
          color: #111111 !important;
        }
        html[data-landing-mode="poster"] .about-module-card h3 {
          color: #111111 !important;
        }
        html[data-landing-mode="poster"] .about-module-card p {
          color: #4b5563 !important;
        }
        html[data-landing-mode="poster"] .about-security-box {
          background: #ffffff !important;
          border: 2.5px solid #111111 !important;
          box-shadow: 6px 6px 0px #111111 !important;
          color: #111111 !important;
        }
        html[data-landing-mode="poster"] .about-security-box h2,
        html[data-landing-mode="poster"] .about-security-box p {
          color: #111111 !important;
        }
      `}</style>

      <main className="about-main-bg relative min-h-screen bg-[#070a0e] px-4 pb-24 pt-28 text-zinc-50 sm:px-6 lg:px-16 transition-colors duration-300 selection:bg-emerald-400 selection:text-black">
        <section className="mx-auto max-w-6xl">
          
          {/* Editorial Kicker & Monumental Masthead */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 backdrop-blur-md">
              <Rocket className="h-3.5 w-3.5" /> 001 // ORIGIN & MISSION
            </span>
            <h1 className="about-editorial-heading font-display mt-6 text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl leading-[1.05]">
              Engineered because student portals are <br />
              <span className="font-serif italic font-normal text-emerald-400">painfully slow.</span>
            </h1>
            <p className="about-editorial-sub mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
              edutechsrm is a high-speed academic client built for SRMIST KTR. We take raw, fractured Academia records and transform them into instantaneous timetable schedules, bunk calculations, marks projections, and contextual AI intelligence.
            </p>

            {/* Handwritten callout */}
            <div className="mt-4 inline-block transform -rotate-1 rounded-xl bg-amber-400/10 border border-amber-400/30 px-4 py-1.5">
              <span className="font-handwriting text-amber-300 text-sm sm:text-base font-medium" style={{ fontFamily: "var(--font-caveat, 'Caveat', cursive)", fontSize: "18px" }}>
                "Built by a student, for 1000+ students navigating SRM every day."
              </span>
            </div>
          </motion.div>

          {/* Telemetry Statistics Banner */}
          <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="about-telemetry-chip rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md text-center">
              <span className="block text-2xl sm:text-4xl font-black font-display text-emerald-400">1000+</span>
              <span className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mt-1">Campus Reach</span>
            </div>
            <div className="about-telemetry-chip rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md text-center">
              <span className="block text-2xl sm:text-4xl font-black font-display text-cyan-400">0</span>
              <span className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mt-1">Passwords Stored</span>
            </div>
            <div className="about-telemetry-chip rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md text-center">
              <span className="block text-2xl sm:text-4xl font-black font-display text-amber-400">79+</span>
              <span className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mt-1">Courses Indexed</span>
            </div>
            <div className="about-telemetry-chip rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md text-center">
              <span className="block text-2xl sm:text-4xl font-black font-display text-purple-400">120ms</span>
              <span className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mt-1">Average Sync</span>
            </div>
          </div>

          {/* Core Philosophy Grid */}
          <div className="about-value-grid mt-14 grid gap-5 md:grid-cols-2">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="about-value-card group relative flex flex-col items-start overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035] p-7 backdrop-blur-2xl transition hover:-translate-y-1 hover:border-white/20"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border bg-zinc-950/60" style={{ borderColor: `${value.color}44`, color: value.color }}>
                  <value.icon className="h-6 w-6" />
                </div>
                <h2 className="font-display text-2xl font-black text-zinc-100">{value.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">{value.text}</p>
              </motion.div>
            ))}
          </div>

          {/* All Included Modules */}
          <section className="about-modules-section mt-14 rounded-[32px] border border-white/10 bg-zinc-950/40 p-6 sm:p-10 backdrop-blur-2xl">
            <div className="about-modules-header mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">002 // SYSTEM CAPABILITIES</span>
                <h2 className="font-display mt-2 text-2xl sm:text-4xl font-black tracking-tight">One unified client for all SRM workflows.</h2>
              </div>
              <a href="/login" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-xs font-black uppercase tracking-wider text-zinc-950 hover:bg-emerald-300 transition-colors shrink-0">
                Launch Portal <Rocket className="h-4 w-4" />
              </a>
            </div>
            <div className="about-module-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {modules.map(([Icon, title, text]) => (
                <div key={title} className="about-module-card rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md transition hover:-translate-y-1">
                  <Icon className="mb-3 h-5 w-5 text-emerald-400" />
                  <div>
                    <h3 className="font-display text-base font-black text-zinc-100">{title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Privacy & Security Commitment */}
          <section className="about-security-box mt-14 rounded-[32px] border border-emerald-500/20 bg-emerald-500/[0.05] p-8 text-center backdrop-blur-2xl">
            <Lock className="mx-auto mb-4 h-7 w-7 text-emerald-400" />
            <h2 className="font-display text-2xl sm:text-3xl font-black">Zero Password Retention. Guaranteed.</h2>
            <p className="mx-auto mt-3 max-w-2xl text-xs sm:text-sm leading-relaxed text-zinc-400">
              edutechsrm is an independent student initiative built for SRMIST students. It operates via encrypted in-memory HTTPS proxy sessions. Passwords are never saved to databases, logs, or external third parties.
            </p>
          </section>

        </section>
      </main>
      <PublicFooter />
    </>
  )
}
