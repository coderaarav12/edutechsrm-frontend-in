"use client"

import { motion } from "framer-motion"
import { ArrowDown, Globe, Shield, Smartphone, Sparkles, Download } from "lucide-react"
import { Header } from "@/components/Header"
import { PublicFooter } from "@/components/public-footer"

export default function DownloadPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen px-4 pb-16 pt-24 text-zinc-50 sm:px-6 lg:px-16">
        <section className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center"
          >
            <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-950/60 ring-1 ring-emerald-300/20 sm:h-20 sm:w-20">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-300/20 to-emerald-300/5" />
              <Smartphone className="relative h-8 w-8 text-emerald-300 sm:h-10 sm:w-10" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-2xl border-2 border-emerald-300/10"
              >
                <div className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-300/30" />
              </motion.div>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-300">
              <Sparkles className="h-3 w-3" /> Available on Play Store
            </span>

            <h1 className="font-display mt-5 text-3xl font-black tracking-tight sm:text-5xl">
              edutechsrm for Android
            </h1>

            <p className="mt-3 max-w-lg text-sm leading-6 text-zinc-400 sm:text-base sm:leading-7">
              The SRM dashboard you use on the web — rebuilt natively for Android.
              Timetable, attendance, marks, and AI — all offline-first.
            </p>

            <div className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
              <a
                href="https://play.google.com/store/apps/details?id=in.edutechsrm.app"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-zinc-950/60 px-5 py-3.5 ring-1 ring-emerald-300/30 backdrop-blur-2xl transition hover:ring-emerald-300/50 hover:bg-zinc-950/80 active:scale-[0.98] sm:w-auto"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-emerald-300">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 010 1.38l-2.302 2.302L15.394 12l2.304-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302L5.864 2.658z"/>
                </svg>
                <div className="text-left">
                  <span className="block text-[10px] font-medium uppercase tracking-wide text-emerald-300/70">Get it on</span>
                  <span className="block font-black text-base text-zinc-50">Google Play Store</span>
                </div>
                <Download className="ml-1 h-4 w-4 text-emerald-300" />
              </a>

              <a
                href="/home"
                className="group inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-zinc-950/60 px-5 py-3.5 ring-1 ring-white/10 backdrop-blur-2xl transition hover:ring-cyan-300/30 hover:bg-zinc-950/80 active:scale-[0.98] sm:w-auto"
              >
                <Globe className="h-6 w-6 text-cyan-300" />
                <div className="text-left">
                  <span className="block text-[10px] font-medium uppercase tracking-wide text-zinc-500">Available Now</span>
                  <span className="block font-black text-base text-zinc-50">Web App (PWA)</span>
                </div>
                <ArrowDown className="ml-1 h-4 w-4 text-zinc-500" />
              </a>
            </div>
          </motion.div>

          <div className="mx-auto mt-10 grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <Shield className="h-5 w-5 shrink-0 text-emerald-300" />
              <span className="text-sm font-medium text-zinc-300">Credentials never stored</span>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <Sparkles className="h-5 w-5 shrink-0 text-cyan-300" />
              <span className="text-sm font-medium text-zinc-300">Free & open source</span>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <Smartphone className="h-5 w-5 shrink-0 text-amber-300" />
              <span className="text-sm font-medium text-zinc-300">Installable PWA</span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative mt-10 overflow-hidden rounded-[28px] border border-emerald-300/15 bg-emerald-300/[0.045] p-6 text-center backdrop-blur-2xl sm:p-10"
          >
            <Shield className="mx-auto mb-4 h-8 w-8 text-emerald-300" />
            <h2 className="font-display text-xl font-black sm:text-2xl">Use it today — right in your browser</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-zinc-400">
              edutechsrm is a fully installable PWA. Open <span className="font-semibold text-zinc-200">edutechsrm.in</span> on your phone,
              tap "Install App" in your browser menu — no Play Store needed.
            </p>
            <a
              href="/home"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-300 px-5 py-3 text-sm font-black text-zinc-950 transition hover:bg-emerald-400 active:scale-[0.98]"
            >
              Open Web App <ArrowDown className="h-4 w-4" />
            </a>
          </motion.div>

          <div className="mt-10 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/50 px-4 py-2">
              <Shield className="h-3.5 w-3.5 text-zinc-500" />
              <span className="text-xs font-medium text-zinc-400">
                Not affiliated with SRM Institute. Independent student project.
              </span>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  )
}