"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

/**
 * WelcomeSplash — A cinematic welcome loader for edutechsrm.
 *
 * Shows "Welcome to edutechsrm" with organic vapor / mist dissolve effects.
 * Adapts to poster (warm ivory cardstock) or night (deep obsidian) mode.
 * Auto-dismisses after ~2.8s with a beautiful vapor evaporation exit.
 */
export function WelcomeSplash({
  isPoster = true,
  onComplete,
}: {
  isPoster?: boolean
  onComplete: () => void
}) {
  const [phase, setPhase] = useState<"entering" | "holding" | "exiting" | "done">("entering")
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number>(0)

  // Colors based on mode
  const bg = isPoster ? "#f7f5f0" : "#06080d"
  const textColor = isPoster ? "#111111" : "#f4f4f5"
  const accentColor = isPoster ? "#111111" : "#34d399"

  // Vapor particle type
  interface VaporParticle {
    x: number
    y: number
    vx: number
    vy: number
    size: number
    opacity: number
    life: number
    maxLife: number
    hue: number
  }

  const particlesRef = useRef<VaporParticle[]>([])

  const createParticle = useCallback(
    (w: number, h: number): VaporParticle => ({
      x: Math.random() * w,
      y: h * 0.3 + Math.random() * h * 0.4,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -0.2 - Math.random() * 0.6,
      size: 60 + Math.random() * 120,
      opacity: 0,
      life: 0,
      maxLife: 120 + Math.random() * 80,
      hue: isPoster ? 40 + Math.random() * 20 : 150 + Math.random() * 20,
    }),
    [isPoster]
  )

  // Canvas vapor animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener("resize", resize)

    const w = () => window.innerWidth
    const h = () => window.innerHeight

    // Seed initial particles
    for (let i = 0; i < 25; i++) {
      const p = createParticle(w(), h())
      p.life = Math.random() * p.maxLife * 0.5
      p.opacity = Math.random() * 0.3
      particlesRef.current.push(p)
    }

    let spawnTimer = 0
    let currentPhase = "entering"

    const animate = () => {
      ctx.clearRect(0, 0, w(), h())

      // Spawn new particles
      spawnTimer++
      if (spawnTimer % 3 === 0 && particlesRef.current.length < 40 && currentPhase !== "exiting") {
        particlesRef.current.push(createParticle(w(), h()))
      }

      // Update & draw particles
      particlesRef.current = particlesRef.current.filter((p) => {
        p.life++
        p.x += p.vx + Math.sin(p.life * 0.015) * 0.3
        p.y += p.vy
        p.vx *= 0.998

        // Fade in then out
        const progress = p.life / p.maxLife
        if (progress < 0.2) {
          p.opacity = (progress / 0.2) * 0.25
        } else if (progress > 0.7) {
          p.opacity = ((1 - progress) / 0.3) * 0.25
        }

        if (currentPhase === "exiting") {
          p.opacity *= 0.95
          p.vy -= 0.02
        }

        if (p.life > p.maxLife) return false

        // Draw vapor blob
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size)
        if (isPoster) {
          gradient.addColorStop(0, `hsla(${p.hue}, 15%, 70%, ${p.opacity * 0.6})`)
          gradient.addColorStop(0.5, `hsla(${p.hue}, 10%, 80%, ${p.opacity * 0.3})`)
          gradient.addColorStop(1, `hsla(${p.hue}, 5%, 90%, 0)`)
        } else {
          gradient.addColorStop(0, `hsla(${p.hue}, 60%, 60%, ${p.opacity * 0.5})`)
          gradient.addColorStop(0.5, `hsla(${p.hue}, 50%, 50%, ${p.opacity * 0.2})`)
          gradient.addColorStop(1, `hsla(${p.hue}, 40%, 40%, 0)`)
        }
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()

        return true
      })

      animFrameRef.current = requestAnimationFrame(animate)
    }

    // Listen for phase changes via a custom attribute on the canvas
    const observer = new MutationObserver(() => {
      currentPhase = canvas.dataset.phase || "entering"
    })
    observer.observe(canvas, { attributes: true, attributeFilter: ["data-phase"] })

    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener("resize", resize)
      observer.disconnect()
    }
  }, [isPoster, createParticle])

  // Phase sequencing
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("holding"), 400)
    const t2 = setTimeout(() => setPhase("exiting"), 2400)
    const t3 = setTimeout(() => {
      setPhase("done")
      onComplete()
    }, 3200)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [onComplete])

  // Sync phase to canvas data attribute for the animation loop
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.dataset.phase = phase
    }
  }, [phase])

  if (phase === "done") return null

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          key="welcome-splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: bg }}
        >
          {/* Vapor canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{
              opacity: phase === "exiting" ? 0.3 : 0.7,
              transition: "opacity 0.8s ease",
            }}
          />

          {/* Subtle grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: isPoster
                ? "linear-gradient(rgba(17,17,17,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(17,17,17,0.03) 1px, transparent 1px)"
                : "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          {/* Center content */}
          <div className="relative z-10 flex flex-col items-center gap-6">
            {/* Top system label */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{
                opacity: phase === "exiting" ? 0 : 0.5,
                y: phase === "exiting" ? -12 : 0,
              }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="text-xs tracking-[0.35em] uppercase"
              style={{
                color: isPoster ? "#555555" : "#71717a",
                fontFamily: "var(--font-mono), monospace",
              }}
            >
              SYS_INIT // LOADING
            </motion.div>

            {/* Main title */}
            <motion.h1
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={{
                opacity: phase === "exiting" ? 0 : 1,
                y: phase === "exiting" ? -20 : 0,
                filter: phase === "exiting" ? "blur(12px)" : "blur(0px)",
              }}
              transition={{
                duration: 0.8,
                delay: phase === "entering" ? 0.2 : 0,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="text-center select-none"
              style={{
                color: textColor,
                fontFamily: "var(--font-display), var(--font-sans), system-ui",
              }}
            >
              <span className="block text-lg sm:text-xl font-light tracking-wide mb-2 opacity-70">
                Welcome to
              </span>
              <span
                className="block text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight"
                style={{
                  ...(isPoster
                    ? {}
                    : {
                        background:
                          "linear-gradient(135deg, #f4f4f5 0%, #34d399 50%, #f4f4f5 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundSize: "200% 200%",
                        animation: "shimmerText 3s ease infinite",
                      }),
                }}
              >
                edutechsrm
              </span>
            </motion.h1>

            {/* Decorative ink line / glow bar */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{
                scaleX: phase === "exiting" ? 0 : 1,
                opacity: phase === "exiting" ? 0 : 1,
              }}
              transition={{
                duration: 0.7,
                delay: phase === "entering" ? 0.4 : 0,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="h-[2px] w-24 rounded-full"
              style={{
                backgroundColor: accentColor,
                boxShadow: isPoster
                  ? "none"
                  : "0 0 20px rgba(52, 211, 153, 0.4), 0 0 40px rgba(52, 211, 153, 0.15)",
                transformOrigin: "center",
              }}
            />

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{
                opacity: phase === "exiting" ? 0 : 0.6,
                y: phase === "exiting" ? -8 : 0,
              }}
              transition={{
                duration: 0.6,
                delay: phase === "entering" ? 0.55 : 0,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="text-sm tracking-wider"
              style={{
                color: isPoster ? "#555555" : "#71717a",
                fontFamily: "var(--font-sans), system-ui",
              }}
            >
              your campus, synthesized
            </motion.p>

            {/* Loading dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: phase === "exiting" ? 0 : 0.7 }}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="flex items-center gap-1.5 mt-2"
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="block w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: accentColor }}
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1.1, 0.8],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>
          </div>

          {/* Ambient vapor wisps */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={`wisp-${i}`}
                className="absolute rounded-full"
                style={{
                  width: 300 + i * 100,
                  height: 300 + i * 100,
                  background: isPoster
                    ? `radial-gradient(circle, rgba(17,17,17,${0.02 + i * 0.005}) 0%, transparent 70%)`
                    : `radial-gradient(circle, rgba(52,211,153,${0.04 + i * 0.01}) 0%, transparent 70%)`,
                  left: `${20 + i * 25}%`,
                  top: `${30 + i * 15}%`,
                }}
                animate={{
                  x: [0, 30, -20, 0],
                  y: [0, -20, 10, 0],
                  scale: [1, 1.1, 0.95, 1],
                }}
                transition={{
                  duration: 6 + i * 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* shimmer keyframe for dark mode title gradient */}
          <style>{`
            @keyframes shimmerText {
              0% { background-position: 200% 50%; }
              50% { background-position: 0% 50%; }
              100% { background-position: 200% 50%; }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
