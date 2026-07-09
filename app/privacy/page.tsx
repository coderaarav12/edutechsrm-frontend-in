"use client"

import { motion } from "framer-motion"
import { Bot, CheckCircle2, Database, Eye, Lock, Mail, Shield, Sparkles } from "lucide-react"
import { Header } from "@/components/Header"
import { PublicFooter } from "@/components/public-footer"

const updatedAt = "July 2, 2026"

const commitments = [
  "Your SRM password is never stored by edutechsrm.",
  "Credentials are used only to authenticate with SRM Academia and are forwarded to SRM's servers in real time.",
  "Your password passes through our server briefly for authentication and is not retained in logs, databases, or caches.",
  "Academic data is used to show your dashboard and power app features.",
  "edutechsrm AI receives academic context only when you use AI features, never your password.",
  "All communication is encrypted over HTTPS. We do not sell your personal information.",
]

const sections = [
  {
    title: "1. Information We Collect",
    body: [
      "SRM login details (email and password) you enter for authentication. Your credentials are forwarded to SRM Academia's official servers and are not stored, logged, or retained by edutechsrm.",
      "Session token and auth state required to keep you signed in.",
      "Academic data fetched from SRM Academia, including timetable, attendance, courses, marks, calendar, circulars, assignments, and profile information.",
      "Support or feedback details if you contact us.",
      "Payment information if you choose to support the project. Razorpay processes all payments securely; edutechsrm does not store your card or UPI details.",
      "Basic technical metadata such as browser, device, IP address, and usage events for reliability, security, and abuse prevention.",
    ],
  },
  {
    title: "2. How We Use Information",
    body: [
      "To authenticate your SRM Academia session.",
      "To fetch, transform, and display your academic data in the app.",
      "To keep your session active until logout or expiry.",
      "To improve performance, debug issues, prevent abuse, and maintain platform security.",
      "To answer support messages and publish important updates.",
    ],
  },
  {
    title: "3. Storage and Security",
    body: [
      "Passwords are not stored in local storage, databases, logs, or persistent server storage.",
      "When you log in, your credentials are forwarded to SRM Academia's official servers for authentication. They pass through our server in memory only and are discarded immediately after the authentication response.",
      "We do not log, cache, or retain passwords at any point in the authentication flow.",
      "Session tokens may be stored temporarily so you can stay signed in.",
      "Some academic data may be cached in your browser for offline display and faster reloads.",
      "Data in transit uses HTTPS and industry-standard encryption. All API communication is over TLS.",
      "No system is perfectly secure, but we design edutechsrm to minimize sensitive storage.",
    ],
  },
  {
    title: "4. AI Chatbot Processing",
    body: [
      "When you use edutechsrm AI, relevant academic context such as timetable, attendance, marks, courses, and profile summary may be sent to the AI backend to generate a useful answer.",
      "Your SRM password is never sent to the AI provider.",
      "Conversation memory is limited and designed for academic help, not credential handling.",
      "Common greetings and simple interactions may be handled locally to reduce API usage.",
    ],
  },
  {
    title: "5. Third-Party Services",
    body: [
      "SRM Academia is used to verify credentials and fetch official academic data.",
      "Cloudflare is used for hosting, security, routing, and serverless workers.",
      "AI infrastructure is used for chatbot responses when you choose to use AI features.",
      "Razorpay is used for processing support payments. No sensitive payment details are stored by edutechsrm.",
    ],
  },
  {
    title: "6. Your Choices",
    body: [
      "You can log out at any time to clear the active session.",
      "You can clear browser storage to remove locally cached dashboard data.",
      "You can contact us to request help with privacy questions or session/data concerns.",
      "You should never share your SRM password over email, chat, or support messages.",
    ],
  },
  {
    title: "7. Retention",
    body: [
      "Session tokens remain until logout, expiry, or replacement.",
      "Locally cached academic data remains in your browser until cleared or replaced by fresh sync data.",
      "Operational logs may be retained temporarily for debugging, abuse prevention, and security.",
    ],
  },
  {
    title: "8. Changes",
    body: [
      "We may update this Privacy Policy as the product changes.",
      `When we make meaningful changes, we update this page and revise the Last updated date. This version was last updated on ${updatedAt}.`,
    ],
  },
]

export default function PrivacyPage() {
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
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
              <Shield className="h-4 w-4" /> privacy policy
            </span>
            <h1 className="font-display mt-6 text-4xl font-black tracking-tight sm:text-6xl">Privacy, written clearly.</h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-zinc-400">
              Last updated: {updatedAt}. This policy explains what edutechsrm processes, why it is needed, and how your SRM credentials are handled — including the fact that credentials pass through our server briefly during login to reach SRM Academia's official servers.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-12 rounded-[34px] border border-emerald-300/15 bg-emerald-300/[0.045] p-6 backdrop-blur-2xl sm:p-8 transition md:hover:-translate-y-1 active:scale-[0.97]">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-300/25 bg-emerald-300/10 text-emerald-300">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-black">Key commitments</h2>
                <p className="mt-1 text-sm text-zinc-500">The important parts first.</p>
              </div>
            </div>
            <div className="grid gap-3">
              {commitments.map((item) => (
                <div key={item} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition md:hover:-translate-y-1 active:scale-[0.97]">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                  <p className="text-sm leading-6 text-zinc-300">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="legal-summary-grid mt-8 grid gap-4 md:grid-cols-3">
            {[
              [Lock, "Password", "Forwarded to SRM in real time, never stored or logged."],
              [Database, "Session", "Stored temporarily for login persistence."],
              [Bot, "AI", "Uses academic context, never credentials."],
            ].map(([Icon, title, text]) => (
              <div key={String(title)} className="legal-summary-card rounded-[26px] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-2xl transition md:hover:-translate-y-1 active:scale-[0.97]">
                <Icon className="mb-5 h-6 w-6 text-cyan-300" />
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
                      <Sparkles className="mt-1.5 h-3.5 w-3.5 shrink-0 text-emerald-300" />
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
                  <Mail className="h-5 w-5 text-emerald-300" /> Contact
                </h2>
                <p className="mt-2 text-sm leading-7 text-zinc-400">Questions about privacy or data handling can be sent to admin@edutechsrm.in.</p>
              </div>
              <a href="mailto:admin@edutechsrm.in" className="rounded-2xl bg-emerald-300 px-5 py-3 text-sm font-black text-zinc-950">Email</a>
            </div>
          </section>

        </section>
      </main>
      <PublicFooter />
    </>
  )
}
