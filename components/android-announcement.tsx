"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Smartphone, X, ExternalLink } from "lucide-react"

const STORAGE_KEY = "edutechsrm_android_announcement_seen"

export function AndroidAnnouncementModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}>
          <motion.div initial={{ opacity: 0, y: 14, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.2 }} onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl border p-6 sm:p-7"
            style={{ background: "rgba(9,9,11,0.96)", borderColor: "rgba(52,211,153,0.22)", boxShadow: "0 28px 70px rgba(0,0,0,0.6)" }}>

            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em]"
                style={{ color: "#86efac", borderColor: "rgba(52,211,153,0.35)", background: "rgba(52,211,153,0.09)" }}>
                <Smartphone className="h-3 w-3" /> New
              </div>
              <button onClick={onClose} className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-white/5 text-zinc-500 hover:text-zinc-300 transition-colors">
                <X size={14} />
              </button>
            </div>

            <div className="mt-5 flex h-16 w-16 items-center justify-center rounded-2xl border"
              style={{ borderColor: "rgba(52,211,153,0.25)", background: "rgba(52,211,153,0.08)" }}>
              <Smartphone className="h-8 w-8" style={{ color: "#34d399" }} />
            </div>

            <h2 className="mt-4 text-2xl font-black tracking-tight" style={{ color: "#f4f4f5" }}>edutechsrm is on Android</h2>
            <p className="mt-2 text-sm leading-6" style={{ color: "#a1a1aa" }}>
              The full SRM dashboard — timetable, attendance, marks, AI, and campus map — now available as a native Android app. Install it from the Play Store.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <a href="https://play.google.com/store/apps/details?id=in.edutechsrm.app" target="_blank" rel="noopener noreferrer"
                onClick={onClose}
                className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold"
                style={{ background: "linear-gradient(135deg, #34d399, #10b981)", color: "#0b0f14" }}>
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 010 1.38l-2.302 2.302L15.394 12l2.304-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302L5.864 2.658z"/>
                </svg>
                Get it on Play Store
                <ExternalLink className="h-3.5 w-3.5 opacity-60" />
              </a>
              <button onClick={onClose} className="w-full rounded-xl px-4 py-2.5 text-sm font-bold border"
                style={{ color: "#d4d4d8", borderColor: "rgba(255,255,255,0.16)", background: "rgba(255,255,255,0.02)" }}>
                Maybe later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function useAndroidAnnouncement() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (typeof navigator === "undefined") return
    if (!/android/i.test(navigator.userAgent)) return
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") return
    } catch {}
    setShow(true)
  }, [])

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, "1") } catch {}
    setShow(false)
  }

  return { show, dismiss }
}
