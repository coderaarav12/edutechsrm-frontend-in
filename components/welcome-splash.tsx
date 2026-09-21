"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface WelcomeSplashProps {
  isPoster?: boolean
  onComplete: () => void
}

export function WelcomeSplash({
  isPoster = false,
  onComplete,
}: WelcomeSplashProps) {
  const [phase, setPhase] = useState<"entering" | "holding" | "exiting" | "done">("entering")

  // Fast, cinematic sequencing (~1.9s total)
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("holding"), 250)
    const t2 = setTimeout(() => setPhase("exiting"), 1450)
    const t3 = setTimeout(() => {
      setPhase("done")
      onComplete()
    }, 1900)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [onComplete])

  const bg = isPoster ? "#f7f5f0" : "#06080d"
  const titleColor = isPoster ? "#111111" : "#ffffff"
  const subColor = isPoster ? "rgba(17, 17, 17, 0.6)" : "rgba(244, 244, 245, 0.55)"
  const accentColor = isPoster ? "#111111" : "#34d399"

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          key="welcome-splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden select-none"
          style={{ backgroundColor: bg }}
        >
          {/* Crisp, subtle drafting grid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: isPoster
                ? "linear-gradient(rgba(17,17,17,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(17,17,17,0.035) 1px, transparent 1px)"
                : "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />

          {/* Center Card / Content */}
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{
              opacity: phase === "exiting" ? 0 : 1,
              y: phase === "exiting" ? -14 : 0,
              scale: phase === "exiting" ? 1.02 : 1,
            }}
            transition={{
              duration: phase === "exiting" ? 0.42 : 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative z-10 flex flex-col items-center text-center px-6"
          >
            {/* Minimal system tag */}
            <div
              className="text-[10px] sm:text-xs font-mono tracking-[0.3em] uppercase mb-4"
              style={{ color: subColor }}
            >
              Academic Intelligence
            </div>

            {/* Brand Title */}
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-3 select-none"
              style={{
                color: titleColor,
                fontFamily:
                  'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              Edutech<span style={{ color: isPoster ? "#10b981" : "#34d399" }}>SRM</span>
            </h1>

            {/* Accent Rule / Underline */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="h-[2px] w-12 sm:w-16 mb-4 rounded-full"
              style={{
                backgroundColor: accentColor,
                transformOrigin: "center",
              }}
            />

            {/* Tagline */}
            <p
              className="text-xs sm:text-sm font-mono tracking-wider mb-5"
              style={{ color: subColor }}
            >
              your campus, synthesized
            </p>

            {/* Minimal Pulse Dots */}
            <div className="flex items-center gap-2">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="block w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: accentColor }}
                  animate={{
                    opacity: [0.25, 0.9, 0.25],
                    scale: [0.85, 1.15, 0.85],
                  }}
                  transition={{
                    duration: 0.9,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
