"use client"

import { motion } from "framer-motion"
import { BookOpen, ExternalLink, FileText, Github, Globe, Shield } from "lucide-react"
import { Header } from "@/components/Header"
import { PublicFooter } from "@/components/public-footer"

const sections = [
  {
    icon: BookOpen,
    title: "Overview",
    text: "edutechsrm is a student-built academic dashboard for SRMIST KTR students. It connects to SRM Academia and presents timetable, attendance, marks, CGPA, assignments, mess menu, and more in a clean, fast interface.",
    color: "#22d3ee",
  },
  {
    icon: FileText,
    title: "Architecture",
    text: "The frontend is built with Next.js 15 and deployed on Cloudflare Workers via @cloudflare/next-on-pages. The backend runs as a separate Cloudflare Worker with Durable Objects for state management and rate limiting.",
    color: "#34d399",
  },
  {
    icon: Shield,
    title: "Security",
    text: "Your password is never stored — credentials go directly to SRM Academia's servers. Only a session token is kept temporarily. The payment endpoint is rate-limited, and Turnstile bot protection activates after repeated failed logins.",
    color: "#a78bfa",
  },
  {
    icon: Github,
    title: "Source Code",
    text: "The frontend repository is publicly available on GitHub. It includes the full source code, deployment configuration, and CI/CD workflows.",
    color: "#f87171",
  },
]

export default function DocsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-28 pb-16 px-4">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.2)" }}>
              <BookOpen className="w-6 h-6" style={{ color: "#22d3ee" }} />
            </div>
            <h1 className="text-3xl font-black text-zinc-100 tracking-tight font-display">Documentation</h1>
            <p className="text-sm mt-2 text-zinc-500 max-w-lg mx-auto">
              Everything you need to know about edutechsrm — how it works, how it's built, and how to get involved.
            </p>
          </motion.div>

          <div className="flex flex-col gap-4">
            {sections.map((section, i) => {
              const Icon = section.icon
              return (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
                >
                  <div
                    className="rounded-2xl p-5"
                    style={{
                      background: "rgba(24,24,27,0.6)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          background: `${section.color}15`,
                          border: `1px solid ${section.color}30`,
                        }}
                      >
                        <Icon className="w-5 h-5" style={{ color: section.color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-sm font-bold text-zinc-200">{section.title}</h2>
                        <p className="text-xs mt-1.5 text-zinc-400 leading-relaxed">{section.text}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mt-8 text-center"
          >
            <a
              href="https://github.com/coderaarav12/edutechsrm-frontend-in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold px-5 py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, rgba(52,211,153,0.15), rgba(34,211,238,0.1))",
                color: "#34d399",
                border: "1px solid rgba(52,211,153,0.2)",
              }}
            >
              <Github className="w-4 h-4" />
              View on GitHub
              <ExternalLink className="w-3.5 h-3.5" style={{ opacity: 0.6 }} />
            </a>
          </motion.div>
        </div>
      </main>
      <PublicFooter />
    </>
  )
}
