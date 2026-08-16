"use client"

import { motion } from "framer-motion"
import { Bot, CheckCircle2, Database, Eye, Lock, Mail, MapPin, Shield, Sparkles } from "lucide-react"
import { Header } from "@/components/Header"
import { PublicFooter } from "@/components/public-footer"

const updatedAt = "August 16, 2026"

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
      "Academic data fetched from SRM Academia, including timetable, attendance, courses, marks, calendar, circulars, assignments, and profile information (name, registration number, program, department, batch, semester).",
      "AI chat messages and voice recordings when you choose to use the AI chatbot feature.",
      "User-created content including notes, tasks, custom planner classes, and OD/ML (on-duty / medical leave) entries stored locally in your browser.",
      "Device push notification token if you enable push notifications for attendance warnings or reminders.",
      "Payment information if you choose to support the project. Razorpay processes all payments securely in a WebView; edutechsrm does not store your card or UPI details but retains a record of the transaction for support purposes.",
      "Support or feedback details if you contact us.",
      "Basic technical metadata such as browser, device, IP address, and usage events for reliability, security, and abuse prevention.",
      "Your device location (approximate or precise) when you use the interactive campus map feature to find nearby buildings, calculate distances, and get directions. Location access is entirely optional and is only used while the map feature is active.",
    ],
  },
  {
    title: "2. How We Use Information",
    body: [
      "To authenticate your SRM Academia session.",
      "To fetch, transform, and display your academic data in the app.",
      "To keep your session active until logout or expiry.",
      "To power AI features — academic context (timetable, attendance, marks, courses, profile) is sent to the AI backend only when you use the AI chatbot.",
      "To send push notifications for low attendance warnings or class reminders (if enabled).",
      "To calculate your distance from campus buildings and provide directions when you use the campus map explorer.",
      "To improve performance, debug issues, prevent abuse, and maintain platform security.",
      "To answer support messages and publish important updates.",
    ],
  },
  {
    title: "3. Data Deletion",
    body: [
      "Logging out clears your active session and all locally stored academic data from your device immediately.",
      "You can clear all locally cached dashboard data at any time by clearing browser storage or app data.",
      "To request permanent deletion of server-stored data (donation/transaction records, AI chat history, support tickets, feedback submissions), email admin@edutechsrm.in with your registered email address.",
      "Server-side data deletion requests are processed within 30 days. After deletion, your data is permanently removed from all server systems and backups.",
      "The following data is stored server-side and can be deleted on request: donation/transaction records (kept for financial reconciliation until requested deletion), AI chat history (deleted on request), support tickets and feedback (deleted on request).",
      "Locally stored data (notes, tasks, custom classes, OD/ML entries, cached academic data) is fully under your control and can be removed by logging out or clearing browser storage — no server-deletion request is needed.",
    ],
  },
  {
    title: "4. Data Sharing",
    body: [
      "We do not sell, rent, or share your personal information with third parties for marketing or any other purpose.",
      "SRM Academia receives your credentials directly for authentication — this is the core function of the app and is performed with your explicit consent at login.",
      "Razorpay processes support/donation payments directly within a WebView. No payment details (card numbers, UPI IDs, bank details) pass through or are stored by edutechsrm servers.",
      "Cloudflare provides hosting, CDN, serverless workers (backend API), and DDoS protection. Cloudflare acts as a service provider and processes data only on our behalf.",
      "AI providers receive academic context (timetable, marks, attendance, courses) when you voluntarily use the AI chatbot feature. Your SRM password is never sent to any AI provider.",
      "No data is shared with any other third party beyond what is described in this section.",
    ],
  },
  {
    title: "5. Storage and Security",
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
    title: "6. AI Chatbot Processing",
    body: [
      "When you use edutechsrm AI, relevant academic context such as timetable, attendance, marks, courses, and profile summary may be sent to the AI backend to generate a useful answer.",
      "Your SRM password is never sent to the AI provider.",
      "Conversation memory is limited and designed for academic help, not credential handling.",
      "Common greetings and simple interactions may be handled locally to reduce API usage.",
      "AI chat messages and voice recordings are stored temporarily for conversation continuity and are deletable on request.",
    ],
  },
  {
    title: "7. Location Data (Campus Map)",
    body: [
      "The interactive campus map feature on both the website (edutechsrm.in/explore) and the Android app may request access to your device's location to show nearby buildings and calculate distances.",
      "Location access is entirely optional — you can use the campus map without granting location permission, but distance and 'nearest' sorting will be unavailable.",
      "When granted, your location is processed locally on your device using the browser or Android geolocation API. Your coordinates are not sent to or stored on edutechsrm servers.",
      "Location data is used only to compute the distance between your position and campus building coordinates (haversine formula) and to generate navigation URLs when you tap 'Get Directions'.",
      "No location history is tracked, stored, or transmitted. Location is read only while the map feature is actively in use and is discarded immediately when you navigate away.",
      "The campus map uses publicly available coordinates from OpenStreetMap for 171 building and landmark entries across the SRM Kattankulathur campus.",
    ],
  },
  {
    title: "8. Third-Party Services",
    body: [
      "SRM Academia is used to verify credentials and fetch official academic data.",
      "Cloudflare is used for hosting, security, routing, DNS, and serverless workers (backend API).",
      "AI infrastructure (Cloudflare Workers AI / external LLM providers) is used for chatbot responses when you choose to use AI features.",
      "Razorpay is used for processing support/donation payments. No sensitive payment details are stored by edutechsrm.",
      "Google Maps is used to embed interactive campus maps and provide navigation directions. Google's privacy policy applies when you open directions in Google Maps.",
      "Vercel is used for frontend hosting and deployment.",
    ],
  },
  {
    title: "9. Your Choices and Rights",
    body: [
      "You can log out at any time to clear the active session and all locally stored data.",
      "You can clear browser storage or app data to remove locally cached dashboard data, notes, tasks, and planner entries.",
      "You can contact admin@edutechsrm.in to request deletion of server-stored data, access your data, or ask privacy questions.",
      "You can choose not to use the AI chatbot — your academic data will not be sent to any AI provider.",
      "You can enable or disable push notifications at any time via the app settings.",
      "You can grant or deny location access at any time — the campus map works without it, just without distance and nearest-building features.",
      "You should never share your SRM password over email, chat, or support messages.",
    ],
  },
  {
    title: "10. Retention",
    body: [
      "Session tokens remain until logout, expiry, or replacement.",
      "Locally cached academic data remains in your browser until cleared or replaced by fresh sync data.",
      "User-created content (notes, tasks, custom classes, OD/ML entries) remains in local storage until you delete it or clear app data.",
      "Donation/transaction records are retained server-side for financial reconciliation purposes until a deletion request is processed.",
      "AI chat history is retained temporarily and deletable on request.",
      "Operational logs may be retained temporarily for debugging, abuse prevention, and security.",
    ],
  },
  {
    title: "11. Children's Privacy",
    body: [
      "edutechsrm is intended for use by students of SRM Institute of Science and Technology who are typically 18 years or older. The app accesses official SRM Academia data and does not knowingly collect personal information from children under 13.",
      "If you believe a child under 13 has provided personal information, contact admin@edutechsrm.in for removal.",
    ],
  },
  {
    title: "12. Changes",
    body: [
      "We may update this Privacy Policy as the product changes.",
      `When we make meaningful changes, we update this page and revise the Last updated date. This version was last updated on ${updatedAt}.`,
      "For significant changes, we may notify users via the app or email.",
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
              [MapPin, "Location", "Optional, processed locally for campus map only."],
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
