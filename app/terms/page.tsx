"use client"

import { motion } from "framer-motion"
import { AlertTriangle, BookOpen, CheckCircle2, Mail, Scale, ShieldCheck, Sparkles, Zap } from "lucide-react"
import { Header } from "@/components/Header"
import { PublicFooter } from "@/components/public-footer"

const updatedAt = "July 2, 2026"

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: [
      "By accessing or using edutechsrm, you agree to these Terms of Service.",
      "If you do not agree, you should stop using the service.",
    ],
  },
  {
    title: "2. What edutechsrm Provides",
    body: [
      "edutechsrm is an independent student-built dashboard for SRMIST KTR students.",
      "The service provides timetable, attendance, internal marks, courses, academic calendar, mess menu, notes, PYQs, CGPA tools, assignments, announcements, and AI-assisted academic help.",
      "Data is fetched from SRM Academia and displayed through a cleaner interface.",
      "The mess menu is based on available SRM data. Menu items change frequently and may not always be complete or accurate.",
    ],
  },
  {
    title: "3. Eligibility",
    body: [
      "The app is intended for SRM Institute of Science and Technology students with valid SRM Academia credentials.",
      "You are responsible for using your own account and keeping your credentials secure.",
    ],
  },
  {
    title: "4. Credentials and Account Use",
    body: [
      "You may need to provide SRM Academia credentials to access protected dashboard features.",
      "Your password is never stored by edutechsrm.",
      "Do not share your credentials or allow others to use your session.",
      "Access may be limited or blocked if misuse, abuse, or suspicious activity is detected.",
    ],
  },
  {
    title: "5. Acceptable Use",
    body: [
      "Do not use edutechsrm for unlawful, abusive, or unauthorized activity.",
      "Do not attempt to access another user's data or session.",
      "Do not reverse engineer, exploit, overload, scrape, or attack the platform.",
      "Do not impersonate SRM Institute, official SRM channels, or other users.",
      "Do not resell or redistribute data fetched through the service.",
    ],
  },
  {
    title: "6. Privacy and Data",
    body: [
      "Use of the service is also governed by the Privacy Policy.",
      "Academic data is used to provide dashboard features and, when you choose to use AI, contextual AI responses.",
      "Your SRM password is never shared with AI systems.",
      "We do not sell your personal data.",
    ],
  },
  {
    title: "7. AI Chatbot Disclaimer",
    body: [
      "edutechsrm AI can help with timetable, attendance, marks, study planning, and academic questions.",
      "AI responses may be inaccurate, incomplete, or outdated.",
      "Always verify critical information such as attendance, marks, grades, exam details, and official deadlines with SRM's official records.",
    ],
  },
  {
    title: "8. Support and Payments",
    body: [
      "Users may choose to support the project through Razorpay, a third-party payment gateway.",
      "Support is entirely voluntary and does not affect access to any features.",
      "Razorpay handles all payment processing. edutechsrm does not collect, store, or process any payment card or UPI details.",
      "All support transactions are non-refundable unless stated otherwise.",
    ],
  },
  {
    title: "9. Academic Accuracy",
    body: [
      "edutechsrm aims to display data accurately, but SRM Academia data may change, fail to load, or be temporarily unavailable.",
      "The mess menu is based on available SRM data — menu items change frequently and may not always be complete or up to date.",
      "The app is an interface and planning tool, not an official source of academic truth.",
      "You are responsible for checking official SRM systems before making important academic decisions.",
    ],
  },
  {
    title: "10. Intellectual Property",
    body: [
      "edutechsrm's original interface, code, branding, and features belong to the project owner unless otherwise stated.",
      "SRM Academia, SRM data, and SRM marks are property of SRM Institute of Science and Technology or their respective owners.",
      "You receive a limited, personal, non-transferable right to use edutechsrm.",
    ],
  },
  {
    title: "11. Service Availability",
    body: [
      "The service is provided as-is and as-available.",
      "Features may change, break, or be unavailable due to SRM portal changes, maintenance, network issues, Cloudflare issues, backend limits, or abuse prevention.",
      "We may update, suspend, or remove features when needed.",
    ],
  },
  {
    title: "12. Limitation of Liability",
    body: [
      "To the maximum extent permitted by law, edutechsrm is not liable for indirect, incidental, special, consequential, or punitive damages.",
      "edutechsrm is not responsible for academic decisions made solely from displayed dashboard data or AI-generated responses.",
    ],
  },
  {
    title: "13. Changes to Terms",
    body: [
      "These Terms may be updated as the product changes.",
      `When updates are made, this page and the Last updated date will be revised. This version was last updated on ${updatedAt}.`,
    ],
  },
  {
    title: "14. Governing Law",
    body: [
      "These Terms are governed by the laws of India, without regard to conflict-of-law rules.",
    ],
  },
]

export default function TermsPage() {
  return (
    <>
      <Header />
      <style>{`
        @media (max-width: 640px) {
          .legal-summary-grid { gap: .75rem !important; }
          .legal-summary-card { display: flex; align-items: flex-start; gap: .85rem; border-radius: 20px !important; padding: 1rem !important; }
          .legal-summary-card svg { margin: .1rem 0 0 !important; height: 1.25rem; width: 1.25rem; flex: 0 0 1.25rem; }
          .legal-summary-card h3 { font-size: .98rem !important; line-height: 1.25; }
          .legal-summary-card p { margin-top: .3rem !important; font-size: .78rem !important; line-height: 1.5 !important; }
        }
      `}</style>

      <main className="min-h-screen px-4 pb-24 pt-28 text-zinc-50 sm:px-6 lg:px-16">
        <section className="mx-auto max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-amber-300">
              <Scale className="h-4 w-4" /> terms of service
            </span>
            <h1 className="font-display mt-6 text-4xl font-black tracking-tight sm:text-6xl">Terms, without the clutter.</h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-zinc-400">
              Last updated: {updatedAt}. These terms explain how edutechsrm may be used and what responsibilities come with using it.
            </p>
          </motion.div>

          <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-12 rounded-[34px] border border-amber-300/20 bg-amber-300/[0.055] p-6 backdrop-blur-2xl sm:p-8 transition md:hover:-translate-y-1 active:scale-[0.97]">
            <div className="flex flex-col gap-5 sm:flex-row">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-300/25 bg-amber-300/10 text-amber-300">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-black text-amber-100">Important notice</h2>
                <p className="mt-3 text-sm leading-7 text-zinc-300">
                  edutechsrm is an independent student-built project. It is not affiliated with, endorsed by, or sponsored by SRM Institute of Science and Technology. Official academic records should always be verified through SRM's official systems.
                </p>
              </div>
            </div>
          </motion.section>

          <div className="legal-summary-grid mt-8 grid gap-4 md:grid-cols-3">
            {[
              [ShieldCheck, "Independent", "Not an official SRM product."],
              [BookOpen, "Academic tool", "Useful for planning, not official records."],
              [Zap, "As available", "Features may change as SRM systems change."],
            ].map(([Icon, title, text]) => (
              <div key={String(title)} className="legal-summary-card rounded-[26px] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-2xl transition md:hover:-translate-y-1 active:scale-[0.97]">
                <Icon className="mb-5 h-6 w-6 text-amber-300" />
                <div>
                  <h3 className="font-display text-lg font-black">{String(title)}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">{String(text)}</p>
                </div>
              </div>
            ))}
          </div>

          <article className="mt-10 space-y-4">
            {sections.map((section, index) => (
              <motion.section
                key={section.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.025 }}
                className="rounded-[26px] border border-white/10 bg-zinc-950/45 p-6 backdrop-blur-2xl transition md:hover:-translate-y-1 active:scale-[0.97]"
              >
                <h2 className="font-display text-xl font-black text-zinc-50">{section.title}</h2>
                <ul className="mt-4 space-y-3">
                  {section.body.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-7 text-zinc-400">
                      <Sparkles className="mt-1.5 h-3.5 w-3.5 shrink-0 text-amber-300" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.section>
            ))}
          </article>

          <section className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-2xl transition md:hover:-translate-y-1 active:scale-[0.97]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="flex items-center gap-2 font-display text-xl font-black">
                  <Mail className="h-5 w-5 text-amber-300" /> Contact
                </h2>
                <p className="mt-2 text-sm leading-7 text-zinc-400">Questions about these Terms can be sent to admin@edutechsrm.in.</p>
              </div>
              <a href="mailto:admin@edutechsrm.in" className="rounded-2xl bg-amber-300 px-5 py-3 text-sm font-black text-zinc-950">Email</a>
            </div>
          </section>

        </section>
      </main>
      <PublicFooter />
    </>
  )
}
