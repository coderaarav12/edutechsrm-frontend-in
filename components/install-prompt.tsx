"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Download, X } from "lucide-react"
import { useIsPosterTheme } from "@/lib/theme-context"

const STORAGE_KEY = "edutechsrm_install_done_v2"

function getPrompt() {
  return typeof window !== "undefined" ? (window as any).__deferredPrompt : null
}

export function InstallPrompt() {
  const isPoster = useIsPosterTheme()
  const [show, setShow] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(getPrompt)

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches
    if (standalone) return

    if (localStorage.getItem(STORAGE_KEY) === "1") {
      localStorage.removeItem(STORAGE_KEY)
    }

    const p = getPrompt()
    if (p) {
      setShow(true)
      setDeferredPrompt(p)
      return
    }

    const handlePrompt = (e: Event) => {
      e.preventDefault()
      ;(window as any).__deferredPrompt = e
      setDeferredPrompt(e)
      setShow(true)
    }

    window.addEventListener("beforeinstallprompt", handlePrompt)

    const timer = setTimeout(() => {
      const p2 = getPrompt()
      if (p2) {
        setShow(true)
        setDeferredPrompt(p2)
      }
    }, 3000)

    return () => {
      clearTimeout(timer)
      window.removeEventListener("beforeinstallprompt", handlePrompt)
    }
  }, [])

  const handleInstall = async () => {
    const prompt = deferredPrompt
    if (!prompt) return
    prompt.prompt()
    try {
      const result = await prompt.userChoice
      if (result.outcome === "accepted") {
        localStorage.setItem(STORAGE_KEY, "1")
      }
    } catch {}
    setShow(false)
  }

  const dismiss = () => {
    setShow(false)
  }

  return (
    <AnimatePresence>
      {show && deferredPrompt && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: "auto", marginBottom: 14 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <div className={`relative rounded-xl px-3 py-2.5 overflow-hidden flex items-center gap-2.5 transition-all ${
            isPoster
              ? "bg-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111] text-[#111111]"
              : "bg-zinc-900/60 border border-white/5"
          }`}>
            {!isPoster && (
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />
            )}

            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              isPoster
                ? "bg-[#f7f5f0] border border-[#111111] text-[#111111]"
                : "bg-emerald-500/10 ring-1 ring-emerald-500/20 text-emerald-400"
            }`}>
              <Download size={13} />
            </div>

            <p className={`text-xs flex-1 min-w-0 leading-tight ${isPoster ? "text-[#555555]" : "text-zinc-400"}`}>
              <span className={`font-semibold ${isPoster ? "text-[#111111]" : "text-zinc-200"}`}>Install the App</span>
              <span className="hidden sm:inline"> — your campus, one tap away</span>
            </p>

            <button
              onClick={handleInstall}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap shrink-0 transition-all ${
                isPoster
                  ? "bg-[#111111] text-white border border-[#111111] hover:bg-[#333333]"
                  : "bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
              }`}
            >
              Install
            </button>

            <button
              onClick={dismiss}
              className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                isPoster
                  ? "text-[#111111] hover:bg-[#f7f5f0]"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
              }`}
            >
              <X size={12} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
