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
        /* Poster Mode Styles */
        html[data-landing-mode="poster"] .privacy-main-bg {
          background-color: #f4efe6 !important;
          background-image: 
            radial-gradient(rgba(17,17,17,0.08) 1px, transparent 1px),
            linear-gradient(to right, rgba(17,17,17,0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(17,17,17,0.04) 1px, transparent 1px) !important;
          background-size: 24px 24px, 48px 48px, 48px 48px !important;
          color: #111111 !important;
        }
        html[data-landing-mode="poster"] .privacy-editorial-heading {
          color: #111111 !important;
        }
        html[data-landing-mode="poster"] .privacy-editorial-sub {
          color: #3f3f46 !important;
        }
        html[data-landing-mode="poster"] .privacy-commit-card {
          background: #ffffff !important;
          border: 2.5px solid #111111 !important;
          box-shadow: 8px 8px 0px #111111 !important;
          color: #111111 !important;
        }
        html[data-landing-mode="poster"] .privacy-commit-card h2,
        html[data-landing-mode="poster"] .privacy-commit-card p {
          color: #111111 !important;
        }
        html[data-landing-mode="poster"] .privacy-commit-item {
          background: #faf7f2 !important;
          border: 1.5px solid #111111 !important;
          color: #111111 !important;
        }
        html[data-landing-mode="poster"] .privacy-commit-item p {
          color: #111111 !important;
        }
        html[data-landing-mode="poster"] .privacy-summary-card {
          background: #ffffff !important;
          border: 2px solid #111111 !important;
          box-shadow: 4px 4px 0px #111111 !important;
          color: #111111 !important;
        }
        html[data-landing-mode="poster"] .privacy-summary-card h3,
        html[data-landing-mode="poster"] .privacy-summary-card p {
          color: #111111 !important;
        }
        html[data-landing-mode="poster"] .privacy-clause-card {
          background: #ffffff !important;
          border: 2px solid #111111 !important;
          box-shadow: 4px 4px 0px #111111 !important;
          color: #111111 !important;
        }
        html[data-landing-mode="poster"] .privacy-clause-card h2 {
          color: #111111 !important;
        }
        html[data-landing-mode="poster"] .privacy-clause-card li {
          color: #27272a !important;
        }
        html[data-landing-mode="poster"] .privacy-contact-box {
          background: #faf7f2 !important;
          border: 2.5px solid #111111 !important;
          box-shadow: 6px 6px 0px #111111 !important;
          color: #111111 !important;
        }
        html[data-landing-mode="poster"] .privacy-contact-box h2,
        html[data-landing-mode="poster"] .privacy-contact-box p {
          color: #111111 !important;
        }
      `}</style>

      <main className="privacy-main-bg relative min-h-screen bg-[#070a0e] px-4 pb-24 pt-28 text-zinc-50 sm:px-6 lg:px-16 transition-colors duration-300 selection:bg-emerald-400 selection:text-black">
        <section className="mx-auto max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 backdrop-blur-md">
              <Shield className="h-3.5 w-3.5" /> 001 // PRIVACY PROTOCOL
            </span>
            <h1 className="privacy-editorial-heading font-display mt-6 text-4xl font-black tracking-tight sm:text-6xl leading-[1.05]">
              Privacy, security, and trust. <br />
              <span className="font-serif italic font-normal text-emerald-400">Written with complete transparency.</span>
            </h1>
            <p className="privacy-editorial-sub mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-400">
              Last updated: {updatedAt}. This document details precisely what edutechsrm accesses, why it is required, and how your credentials pass in-memory to SRM Academia without persistent storage.
            </p>

            <div className="mt-4 inline-block transform -rotate-1 rounded-xl bg-amber-400/10 border border-amber-400/30 px-4 py-1.5">
              <span className="font-handwriting text-amber-300 text-sm sm:text-base font-medium" style={{ fontFamily: "var(--font-caveat, 'Caveat', cursive)", fontSize: "18px" }}>
                "Zero passwords stored. Zero analytics selling. Verified student architecture."
              </span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="privacy-commit-card mt-12 rounded-[34px] border border-emerald-400/20 bg-emerald-400/[0.045] p-6 backdrop-blur-2xl sm:p-8">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-black">Architectural Commitments</h2>
                <p className="mt-0.5 text-xs font-mono uppercase tracking-wider text-zinc-400">Non-negotiable security principles</p>
              </div>
            </div>
            <div className="grid gap-3">
              {commitments.map((item) => (
                <div key={item} className="privacy-commit-item flex gap-3.5 rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-md">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                  <p className="text-xs sm:text-sm leading-relaxed text-zinc-300">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="legal-summary-grid mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [Lock, "SRM Passwords", "Forwarded in-memory, never stored or cached."],
              [Database, "Session State", "Stored locally on your device for fast re-sync."],
              [Bot, "Contextual AI", "Only receives academic context, never passwords."],
              [MapPin, "Campus GPS", "Optional, processed client-side with zero tracking."],
            ].map(([Icon, title, text]) => (
              <div key={String(title)} className="privacy-summary-card rounded-[24px] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md">
                <Icon className="mb-4 h-5 w-5 text-cyan-400" />
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
                className="privacy-clause-card rounded-[28px] border border-white/10 bg-zinc-950/40 p-6 sm:p-8 backdrop-blur-2xl"
              >
                <h2 className="font-display text-xl font-black text-zinc-100">{section.title}</h2>
                <ul className="mt-4 space-y-3">
                  {section.body.map((item) => (
                    <li key={item} className="flex gap-3 text-xs sm:text-sm leading-relaxed text-zinc-400">
                      <Sparkles className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.section>
            ))}
          </article>

          <section className="privacy-contact-box mt-10 rounded-[28px] border border-white/10 bg-white/[0.035] p-6 sm:p-8 backdrop-blur-2xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="flex items-center gap-2 font-display text-xl font-black">
                  <Mail className="h-5 w-5 text-emerald-400" /> Security Inquiries
                </h2>
                <p className="mt-1 text-xs sm:text-sm leading-relaxed text-zinc-400">Questions or audit requests can be directed to admin@edutechsrm.in.</p>
              </div>
              <a href="mailto:admin@edutechsrm.in" className="rounded-xl bg-emerald-400 px-5 py-2.5 text-xs font-mono font-black uppercase tracking-wider text-zinc-950 hover:bg-emerald-300 transition-colors shrink-0 text-center">
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
