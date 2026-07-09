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
        @media (max-width: 640px) {
          .about-value-grid { margin-top: 2.25rem !important; gap: .75rem !important; }
          .about-value-card { min-height: auto; border-radius: 20px !important; padding: 1.5rem 1rem !important; }
          .about-value-icon { margin-bottom: 1rem !important; height: 2.6rem !important; width: 2.6rem !important; flex: none; border-radius: 14px !important; }
          .about-value-icon svg { height: 1.15rem; width: 1.15rem; }
          .about-value-card h2 { font-size: 1rem !important; line-height: 1.25; }
          .about-value-card p { margin-top: 0 !important; font-size: .78rem !important; line-height: 1.55 !important; }
          .about-modules-section { margin-top: 2.5rem !important; border-radius: 24px !important; padding: 1.1rem !important; }
          .about-modules-header { margin-bottom: 1rem !important; }
          .about-modules-header h2 { font-size: 1.55rem !important; line-height: 1.12; }
          .about-modules-header a { width: 100%; border-radius: 16px !important; padding: .85rem 1rem !important; }
          .about-module-grid { gap: .65rem !important; }
          .about-module-card {
            display: flex;
            align-items: flex-start;
            gap: .85rem;
            border-radius: 18px !important;
            padding: .9rem !important;
          }
          .about-module-card svg { margin: .1rem 0 0 !important; height: 1.15rem; width: 1.15rem; flex: 0 0 1.15rem; }
          .about-module-card h3 { font-size: .95rem !important; line-height: 1.2; }
          .about-module-card p { margin-top: .25rem !important; font-size: .76rem !important; line-height: 1.45 !important; }
        }
      `}</style>

      <main className="relative min-h-screen px-4 pb-24 pt-28 text-zinc-50 sm:px-6 lg:px-16">
        <section className="mx-auto max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
              <Rocket className="h-4 w-4" /> About the app
            </span>
            <h1 className="font-display mt-6 text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              Built to make SRM academic life easier.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
              edutechsrm is a free SRMIST KTR dashboard that connects to SRM Academia and presents timetable, attendance, marks, CGPA, notes, PYQs, calendar, assignments, and AI help in one clean interface.
            </p>
          </motion.div>

          <div className="about-value-grid mt-16 grid gap-5 md:grid-cols-2">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 26, rotateX: -8 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.07 }}
                className="about-value-card group relative flex flex-col items-center overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.035] p-7 text-center backdrop-blur-2xl transition hover:-translate-y-1 hover:border-white/20 active:scale-[0.97]"
              >
                  <div className="about-value-icon mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border bg-zinc-950/50" style={{ borderColor: `${value.color}44`, color: value.color }}>
                    <value.icon className="h-7 w-7" />
                  </div>
                  <h2 className="font-display text-2xl font-black text-zinc-50">{value.title}</h2>
                  <p className="mt-4 text-sm leading-7 text-zinc-400">{value.text}</p>
              </motion.div>
            ))}
          </div>

          <section className="about-modules-section mt-16 rounded-[36px] border border-white/10 bg-zinc-950/45 p-6 backdrop-blur-2xl sm:p-8 transition active:scale-[0.97]">
            <div className="about-modules-header mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">What it includes</span>
                <h2 className="font-display mt-3 text-3xl font-black tracking-tight sm:text-4xl">One dashboard, many SRM workflows.</h2>
              </div>
              <a href="/login" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-300 px-5 py-3 text-sm font-black text-zinc-950">
                Try it now <Rocket className="h-4 w-4" />
              </a>
            </div>
            <div className="about-module-grid grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {modules.map(([Icon, title, text]) => (
                <div key={title}                 className="about-module-card rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition md:hover:-translate-y-1 active:scale-[0.97]">
                  <Icon className="mb-5 h-5 w-5 text-emerald-300" />
                  <div>
                    <h3 className="font-display text-base font-black text-zinc-50">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-500">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-16 rounded-[36px] border border-emerald-300/15 bg-emerald-300/[0.045] p-8 text-center backdrop-blur-2xl transition md:hover:-translate-y-1 active:scale-[0.97]">
            <Lock className="mx-auto mb-5 h-8 w-8 text-emerald-300" />
            <h2 className="font-display text-3xl font-black">Credentials are never stored.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
              edutechsrm is not affiliated with SRM Institute of Science and Technology. It is an independent student project that fetches your academic data live from the official SRM Academia portal using your own credentials.
            </p>
          </section>
        </section>
      </main>
      <PublicFooter />
    </>
  )
}
