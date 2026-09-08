"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface InkOrigin {
  x: number
  y: number
}

export function ThemeCurtainWipe() {
  const [active, setActive] = useState(false)
  const [targetMode, setTargetMode] = useState<"poster" | "night">("poster")
  const [origin, setOrigin] = useState<InkOrigin>({ x: 0, y: 0 })
  const [diameter, setDiameter] = useState(2600)
  const lastClickRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const busyRef = useRef(false)

  useEffect(() => {
    // Track pointer clicks to origin the ink drop at the exact tap/click spot
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0]?.clientX : (e as MouseEvent).clientX
      const clientY = "touches" in e ? e.touches[0]?.clientY : (e as MouseEvent).clientY
      if (typeof clientX === "number" && typeof clientY === "number") {
        lastClickRef.current = { x: clientX, y: clientY, time: Date.now() }
      }
    }

    window.addEventListener("pointerdown", handlePointerDown, { passive: true })

    const onModeChange = (e: Event) => {
      const detail = (e as CustomEvent).detail
      const mode = detail === "poster" ? "poster" : "night"

      if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return
      }

      if (busyRef.current) return
      busyRef.current = true

      const vw = typeof window !== "undefined" ? window.innerWidth : 1200
      const vh = typeof window !== "undefined" ? window.innerHeight : 800

      // Default origin: top right toggle area or screen center
      let origX = vw > 768 ? vw * 0.85 : vw / 2
      let origY = vw > 768 ? 40 : 40

      if (lastClickRef.current && Date.now() - lastClickRef.current.time < 1200) {
        origX = lastClickRef.current.x
        origY = lastClickRef.current.y
      }

      // Calculate max radius needed from origin to reach the furthest screen corner
      const maxDist = Math.max(
        Math.hypot(origX, origY),
        Math.hypot(vw - origX, origY),
        Math.hypot(origX, vh - origY),
        Math.hypot(vw - origX, vh - origY)
      )

      setDiameter(Math.ceil(maxDist * 2.25))
      setOrigin({ x: origX, y: origY })
      setTargetMode(mode)
      setActive(true)
    }

    window.addEventListener("landing-mode-change", onModeChange)
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown)
      window.removeEventListener("landing-mode-change", onModeChange)
    }
  }, [])

  const isPoster = targetMode === "poster"

  return (
    <AnimatePresence>
      {active && (
        <div
          className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden"
          aria-hidden="true"
        >
          {/* 1. Initial Ink Drop Impact Spot */}
          <motion.div
            initial={{ scale: 0, opacity: 0.9 }}
            animate={{ scale: [0, 1.5, 0], opacity: [0.9, 0.7, 0] }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: origin.x,
              top: origin.y,
              width: 24,
              height: 24,
              marginLeft: -12,
              marginTop: -12,
              background: isPoster ? "#111111" : "#34d399",
              boxShadow: isPoster
                ? "0 0 25px rgba(17, 17, 17, 0.7)"
                : "0 0 30px #34d399",
            }}
          />

          {/* 2. Fluid Ripple Ring Expanding Outward */}
          <motion.div
            initial={{ scale: 0.05, opacity: 0.85 }}
            animate={{ scale: 2.8, opacity: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: origin.x,
              top: origin.y,
              width: 120,
              height: 120,
              marginLeft: -60,
              marginTop: -60,
              border: isPoster
                ? "2px solid rgba(17, 17, 17, 0.45)"
                : "2px solid rgba(52, 211, 153, 0.6)",
              boxShadow: isPoster
                ? "0 0 25px rgba(17, 17, 17, 0.2)"
                : "0 0 35px rgba(52, 211, 153, 0.35)",
            }}
          />

          {/* 3. Main Organic Ink / Paper Wash Bloom */}
          <motion.div
            initial={{ scale: 0.01, opacity: 1 }}
            animate={{ scale: 1, opacity: [1, 1, 1, 0] }}
            transition={{
              duration: 0.72,
              times: [0, 0.68, 0.88, 1],
              ease: [0.16, 1, 0.3, 1],
            }}
            onAnimationComplete={() => {
              setActive(false)
              busyRef.current = false
            }}
            className="absolute rounded-full pointer-events-none will-change-transform"
            style={{
              left: origin.x,
              top: origin.y,
              width: diameter,
              height: diameter,
              marginLeft: -diameter / 2,
              marginTop: -diameter / 2,
              backgroundColor: isPoster ? "#f7f5f0" : "#06080d",
              border: isPoster
                ? "3px solid #111111"
                : "2px solid #34d399",
              boxShadow: isPoster
                ? "0 0 90px rgba(17, 17, 17, 0.3), inset 0 0 60px rgba(17, 17, 17, 0.06)"
                : "0 0 90px rgba(52, 211, 153, 0.45), inset 0 0 60px rgba(52, 211, 153, 0.12)",
            }}
          >
            {/* Peaceful tactile paper grain or midnight aura */}
            {isPoster ? (
              <div
                className="absolute inset-0 rounded-full opacity-40 pointer-events-none"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, rgba(17, 17, 17, 0.06) 1px, transparent 1px), linear-gradient(to right, rgba(17, 17, 17, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(17, 17, 17, 0.03) 1px, transparent 1px)",
                  backgroundSize: "20px 20px, 40px 40px, 40px 40px",
                }}
              />
            ) : (
              <div
                className="absolute inset-0 rounded-full opacity-35 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(52, 211, 153, 0.18) 0%, rgba(6, 8, 13, 0.95) 75%)",
                }}
              />
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
