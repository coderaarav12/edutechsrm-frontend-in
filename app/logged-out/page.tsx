"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, LogIn, ShieldCheck } from "lucide-react"

export default function LoggedOutPage() {
  return (
    <div className="min-h-screen px-4 py-8 flex items-center justify-center"
      style={{ background: "#09090b" }}>
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md rounded-[28px] border p-6 sm:p-7 text-center"
        style={{
          background: "linear-gradient(145deg, rgba(25,10,14,0.96), rgba(18,11,16,0.92))",
          borderColor: "rgba(248,113,113,0.24)",
          boxShadow: "0 24px 70px rgba(0,0,0,0.5)",
        }}
      >
        <div
          className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, rgba(248,113,113,0.25), rgba(244,114,182,0.18))", border: "1px solid rgba(248,113,113,0.28)" }}
        >
          <ShieldCheck className="w-7 h-7" style={{ color: "#fda4af" }} />
        </div>

        <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "#fb7185" }}>
          Signed Out
        </p>
        <h1 className="mt-2 text-2xl font-black tracking-tight" style={{ color: "#f4f4f5" }}>
          You have been logged out
        </h1>
        <p className="mt-2 text-sm leading-6" style={{ color: "#a1a1aa" }}>
          Your app session has been cleared from this device, and your backend session was also asked to close.
        </p>

        <div className="mt-5 rounded-2xl border p-3 text-left" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
          <p className="text-sm font-semibold" style={{ color: "#d4d4d8" }}>
            What happens now
          </p>
          <p className="mt-2 text-[13px] leading-6" style={{ color: "#a1a1aa" }}>
            If you want to use edutechsrm again, just sign in from the main page. This screen is here so logout feels final instead of quietly dropping you back into the app shell.
          </p>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 rounded-2xl px-4 py-3 text-sm font-bold inline-flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg,#34d399,#10b981)", color: "#09090b", textDecoration: "none" }}
          >
            <LogIn className="w-4 h-4" />
            Go to login
          </Link>
          <Link
            href="/"
            className="flex-1 rounded-2xl px-4 py-3 text-sm font-semibold inline-flex items-center justify-center gap-2 border"
            style={{ borderColor: "rgba(255,255,255,0.08)", color: "#a1a1aa", textDecoration: "none" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
