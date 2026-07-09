"use client"

import { motion } from "framer-motion"
import {
  Bookmark,
  Bot,
  Cloud,
  Cpu,
  Github,
  Heart,
  Mail,
  MapPin,
  Send,
  ShieldCheck,
  Terminal,
  Zap,
} from "lucide-react"
import { Header } from "@/components/Header"
import { useSupport } from "@/lib/use-support"
import { SupportModal } from "@/components/support-modal"
import { PublicFooter } from "@/components/public-footer"

const contactLinks = [
  {
    icon: Mail,
    label: "Email",
    value: "admin@edutechsrm.in",
    href: "mailto:admin@edutechsrm.in",
    color: "#f472b6",
  },
  {
    icon: Github,
    label: "GitHub",
    value: "@coderaarav12",
    href: "https://github.com/coderaarav12",
    color: "#34d399",
  },
  {
    icon: Bookmark,
    label: "LinkedIn",
    value: "Connect with me",
    href: "https://www.linkedin.com/in/aaravgoel12/",
    color: "#0a66c2",
  },
]

export default function ContactPage() {
  const { isSupportOpen, handleSupportClick, closeSupport } = useSupport()

  return (
    <>
      <Header />
      
      <main className="min-h-screen px-4 pb-24 pt-28 text-zinc-50 sm:px-6 lg:px-16">
        <section className="mx-auto max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
              <Terminal className="h-4 w-4" /> contact
            </span>
            <h1 className="font-display mt-6 text-4xl font-black tracking-tight sm:text-6xl">
              Contact the developer.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-zinc-400">
              Reach out for bugs, suggestions, support, or anything related to edutechsrm. Built and maintained by Aarav Goel, 2nd Year CSE AIML student at SRM IST KTR.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mt-14 grid gap-8 rounded-[38px] border border-white/10 bg-white/[0.035] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-3xl md:grid-cols-[280px_minmax(0,1fr)] sm:p-8"
          >
            <div className="flex flex-col items-center text-center">
              <div className="relative h-56 w-56 overflow-hidden rounded-[30px] border-2 border-emerald-300/25 shadow-[0_18px_50px_rgba(52,211,153,0.14)]">
                <img src="/aarav_goel.jpg" alt="Aarav Goel" className="h-full w-full object-cover" />
                <div className="absolute inset-0 rounded-[28px] border border-white/10" />
              </div>
              <h2 className="font-display mt-6 text-3xl font-black">Aarav Goel</h2>
              <p className="mt-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-zinc-500">
                <MapPin className="h-3.5 w-3.5 text-cyan-300" /> 2nd Year CSE AIML · SRMIST KTR
              </p>
            </div>

            <div className="min-w-0">
              <div className="mb-6 flex flex-wrap gap-2">
                {["SRM Student", "2nd Year", "CSE AIML", "Solo Dev", "Cloudflare", "AI"].map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-400">
                    {tag}
                  </span>
                ))}
              </div>

              <p className="text-sm leading-8 text-zinc-400">
                I built edutechsrm to solve a real SRM student problem: slow navigation and scattered academic data. The system pulls live data from SRM, normalizes timetable, attendance, marks, and planner information into one interface, then layers edutechsrm AI on top for quick academic Q&A.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  [Cloud, "Cloudflare", "Workers and edge deploys"],
                  [Cpu, "Context-aware AI", "Live academic data in prompts"],
                  [Zap, "v2.1", "Faster UI and cleaner flows"],
                ].map(([Icon, title, text]) => (
                  <div key={String(title)} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition md:hover:-translate-y-1 active:scale-[0.97]">
                    <Icon className="mb-4 h-5 w-5 text-violet-300" />
                    <h3 className="font-display text-sm font-black text-zinc-50">{String(title)}</h3>
                    <p className="mt-2 text-xs leading-5 text-zinc-500">{String(text)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-3 md:grid-cols-3">
                {contactLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="group relative flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/20 hover:bg-white/[0.055] md:hover:-translate-y-1 active:scale-[0.97]"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border bg-zinc-950/45" style={{ borderColor: `${link.color}3d`, color: link.color }}>
                        <link.icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-display text-sm font-black text-zinc-100">{link.label}</p>
                        <p className="truncate text-xs text-zinc-500">{link.value}</p>
                      </div>
                    </div>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-zinc-500 opacity-0 transition group-hover:opacity-100 group-active:opacity-100">
                      <Send className="h-4 w-4" />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-[28px] border border-emerald-300/15 bg-emerald-300/[0.045] p-6 backdrop-blur-2xl transition md:hover:-translate-y-1 active:scale-[0.97]">
              <ShieldCheck className="mb-5 h-6 w-6 text-emerald-300" />
              <h3 className="font-display text-xl font-black">Privacy note</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                Do not send your SRM password over email or chat. edutechsrm never needs your raw password outside the secure login page.
              </p>
            </div>

            <div className="rounded-[28px] border border-violet-300/15 bg-violet-300/[0.045] p-6 backdrop-blur-2xl transition md:hover:-translate-y-1 active:scale-[0.97]">
              <Heart className="mb-5 h-6 w-6 text-violet-300" />
              <h3 className="font-display text-xl font-black">Support the project</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-400">Helps cover domain, Cloudflare subscriptions, and AI API costs.</p>
              <button onClick={handleSupportClick} className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-violet-400 px-5 py-3 text-sm font-black text-zinc-950 transition hover:bg-violet-300">
                <Heart className="h-4 w-4" /> Support
              </button>
            </div>
          </div>

          <div className="absolute left-[-9999px] h-px w-px overflow-hidden" aria-hidden="true">
            <h2>Contact Aarav Goel, developer of edutechsrm</h2>
            <p>Contact the edutechsrm developer for SRMIST KTR dashboard feedback, bug reports, suggestions, support, and edutechsrm AI questions.</p>
            <h2>About edutechsrm AI for SRMIST KTR Students</h2>
            <p>edutechsrm AI helps SRM students with timetable lookup, attendance shortage planning, bunk limit guidance, internal marks overview, and semester study tips.</p>
          </div>
        </section>

        <SupportModal isOpen={isSupportOpen} onClose={closeSupport} />
      </main>
      <PublicFooter />
    </>
  )
}

