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
        /* Poster Mode Styles */
        html[data-landing-mode="poster"] .terms-main-bg {
          background-color: #f4efe6 !important;
          background-image: 
            radial-gradient(rgba(17,17,17,0.08) 1px, transparent 1px),
            linear-gradient(to right, rgba(17,17,17,0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(17,17,17,0.04) 1px, transparent 1px) !important;
          background-size: 24px 24px, 48px 48px, 48px 48px !important;
          color: #111111 !important;
        }
        html[data-landing-mode="poster"] .terms-editorial-heading {
          color: #111111 !important;
        }
        html[data-landing-mode="poster"] .terms-editorial-sub {
          color: #3f3f46 !important;
        }
        html[data-landing-mode="poster"] .terms-notice-card {
          background: #fef08a !important;
          border: 2.5px solid #111111 !important;
          box-shadow: 8px 8px 0px #111111 !important;
          color: #111111 !important;
        }
        html[data-landing-mode="poster"] .terms-notice-card h2,
        html[data-landing-mode="poster"] .terms-notice-card p {
          color: #111111 !important;
        }
        html[data-landing-mode="poster"] .terms-summary-card {
          background: #ffffff !important;
          border: 2px solid #111111 !important;
          box-shadow: 4px 4px 0px #111111 !important;
          color: #111111 !important;
        }
        html[data-landing-mode="poster"] .terms-summary-card h3,
        html[data-landing-mode="poster"] .terms-summary-card p {
          color: #111111 !important;
        }
        html[data-landing-mode="poster"] .terms-clause-card {
          background: #ffffff !important;
          border: 2px solid #111111 !important;
          box-shadow: 4px 4px 0px #111111 !important;
          color: #111111 !important;
        }
        html[data-landing-mode="poster"] .terms-clause-card h2 {
          color: #111111 !important;
        }
        html[data-landing-mode="poster"] .terms-clause-card li {
          color: #27272a !important;
        }
        html[data-landing-mode="poster"] .terms-contact-box {
          background: #faf7f2 !important;
          border: 2.5px solid #111111 !important;
          box-shadow: 6px 6px 0px #111111 !important;
          color: #111111 !important;
        }
        html[data-landing-mode="poster"] .terms-contact-box h2,
        html[data-landing-mode="poster"] .terms-contact-box p {
          color: #111111 !important;
        }
      `}</style>

      <main className="terms-main-bg relative min-h-screen bg-[#070a0e] px-4 pb-24 pt-28 text-zinc-50 sm:px-6 lg:px-16 transition-colors duration-300 selection:bg-emerald-400 selection:text-black">
        <section className="mx-auto max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-widest text-amber-400 backdrop-blur-md">
              <Scale className="h-3.5 w-3.5" /> 001 // TERMS OF SERVICE
            </span>
            <h1 className="terms-editorial-heading font-display mt-6 text-4xl font-black tracking-tight sm:text-6xl leading-[1.05]">
              Terms of service and use. <br />
              <span className="font-serif italic font-normal text-amber-400">Clear, direct, and straightforward.</span>
            </h1>
            <p className="terms-editorial-sub mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-400">
              Last updated: {updatedAt}. These terms explain how edutechsrm may be used, acceptable use standards, and user responsibilities while navigating campus tools.
            </p>

            <div className="mt-4 inline-block transform -rotate-1 rounded-xl bg-amber-400/10 border border-amber-400/30 px-4 py-1.5">
              <span className="font-handwriting text-amber-300 text-sm sm:text-base font-medium" style={{ fontFamily: "var(--font-caveat, 'Caveat', cursive)", fontSize: "18px" }}>
                "Built by students, for students. Fair, open, and community-driven."
              </span>
            </div>
          </motion.div>

          <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="terms-notice-card mt-12 rounded-[34px] border border-amber-400/20 bg-amber-400/[0.055] p-6 backdrop-blur-2xl sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-amber-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-black text-amber-200">Independent Academic Project</h2>
                <p className="mt-1 text-xs sm:text-sm leading-relaxed text-zinc-300">
                  edutechsrm is an independent student-built project. It is not affiliated with, officially endorsed by, or managed by SRM Institute of Science and Technology. Always cross-verify critical academic matters on official university portals.
                </p>
              </div>
            </div>
          </motion.section>

          <div className="legal-summary-grid mt-8 grid gap-4 sm:grid-cols-3">
            {[
              [ShieldCheck, "Community Project", "Not an official SRM product or enterprise entity."],
              [BookOpen, "Academic Planning", "Calculations for planning; official grades rest on Academia."],
              [Zap, "Dynamic Uptime", "Reverse-proxy updates as SRM portal updates in real time."],
            ].map(([Icon, title, text]) => (
              <div key={String(title)} className="terms-summary-card rounded-[24px] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md">
                <Icon className="mb-4 h-5 w-5 text-amber-400" />
                <div>
                  <h3 className="font-display text-base font-black text-zinc-100">{String(title)}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">{String(text)}</p>
                </div>
              </div>
            ))}
          </div>

          <article className="mt-12 space-y-4">
            {sections.map((section, index) => (
              <motion.section
                key={section.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.02 }}
                className="terms-clause-card rounded-[28px] border border-white/10 bg-zinc-950/40 p-6 sm:p-8 backdrop-blur-2xl"
              >
                <h2 className="font-display text-xl font-black text-zinc-100">{section.title}</h2>
                <ul className="mt-4 space-y-3">
                  {section.body.map((item) => (
                    <li key={item} className="flex gap-3 text-xs sm:text-sm leading-relaxed text-zinc-400">
                      <Sparkles className="mt-1 h-3.5 w-3.5 shrink-0 text-amber-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.section>
            ))}
          </article>

          <section className="terms-contact-box mt-10 rounded-[28px] border border-white/10 bg-white/[0.035] p-6 sm:p-8 backdrop-blur-2xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="flex items-center gap-2 font-display text-xl font-black">
                  <Mail className="h-5 w-5 text-amber-400" /> Terms & Compliance
                </h2>
                <p className="mt-1 text-xs sm:text-sm leading-relaxed text-zinc-400">Inquiries regarding these Terms of Service can be sent to admin@edutechsrm.in.</p>
              </div>
              <a href="mailto:admin@edutechsrm.in" className="rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-mono font-black uppercase tracking-wider text-zinc-950 hover:bg-amber-300 transition-colors shrink-0 text-center">
                Contact Developer
              </a>
            </div>
          </section>

        </section>
      </main>
      <PublicFooter />
    </>
  )
}
