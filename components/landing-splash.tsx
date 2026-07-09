"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function LandingSplash({ onFinish }: { onFinish: () => void }) {
  const [progress, setProgress] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (document.readyState === "complete") {
      setLoaded(true)
    } else {
      const onLoad = () => setLoaded(true)
      window.addEventListener("load", onLoad)
      return () => window.removeEventListener("load", onLoad)
    }
  }, [])

  useEffect(() => {
    const duration = 1300
    const interval = 30
    const step = 100 / (duration / interval)
    let current = 0
    const id = setInterval(() => {
      current += step
      if (current >= 100) {
        setProgress(100)
        clearInterval(id)
      } else {
        setProgress(current)
      }
    }, interval)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (progress >= 100 && loaded) {
      const timer = setTimeout(() => setDone(true), 200)
      return () => clearTimeout(timer)
    }
  }, [progress, loaded])

  useEffect(() => {
    if (done) {
      const timer = setTimeout(() => onFinish(), 500)
      return () => clearTimeout(timer)
    }
  }, [done, onFinish])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#09090b" }}
        >
          <div className="flex flex-col items-center gap-6">
            <img
              src="https://edutechsrm.in/favicon.svg"
              alt="edutechsrm"
              className="w-12 h-12 sm:w-14 sm:h-14"
              style={{ filter: "brightness(1.1)" }}
            />
            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-zinc-100">
              Welcome to edutechsrm
            </h1>
            <div className="w-48 sm:w-56 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div
                className="h-full rounded-full transition-none"
                style={{ width: `${progress}%`, background: "#f4f4f5" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
