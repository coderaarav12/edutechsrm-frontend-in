"use client"

import { motion } from "framer-motion"
import { useEffect, useRef } from "react"

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const isMobile = window.innerWidth < 768
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8
    const lowPowerMode = isMobile && (deviceMemory <= 4 || navigator.hardwareConcurrency <= 4 || connection?.saveData)
    const count = lowPowerMode ? 12 : isMobile ? 24 : 50
    const maxDistance = lowPowerMode ? 64 : isMobile ? 86 : 120

    const setSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    setSize()

    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      size: Math.random() * 1.4 + 0.7,
      opacity: Math.random() * 0.34 + 0.12,
    }))

    let frame = 0
    let rafId = 0

    const draw = () => {
      rafId = requestAnimationFrame(draw)
      frame += 1
      const drawConnections = !lowPowerMode && frame % 2 === 0

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const particle of particles) {
        particle.x += lowPowerMode ? particle.vx * 0.8 : particle.vx
        particle.y += lowPowerMode ? particle.vy * 0.8 : particle.vy

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(45,212,191,${lowPowerMode ? particle.opacity * 0.75 : particle.opacity})`
        ctx.fill()
      }

      if (drawConnections) {
        const maxDistanceSquared = maxDistance * maxDistance
        for (let i = 0; i < particles.length; i += 1) {
          const first = particles[i]
          for (let j = i + 1; j < particles.length; j += 1) {
            const second = particles[j]
            const dx = first.x - second.x
            const dy = first.y - second.y
            const distanceSquared = dx * dx + dy * dy

            if (distanceSquared < maxDistanceSquared) {
              const alpha = 0.065 * (1 - distanceSquared / maxDistanceSquared)
              ctx.beginPath()
              ctx.moveTo(first.x, first.y)
              ctx.lineTo(second.x, second.y)
              ctx.strokeStyle = `rgba(125,211,252,${alpha})`
              ctx.lineWidth = 0.55
              ctx.stroke()
            }
          }
        }
      }
    }

    draw()

    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId)
        return
      }
      draw()
    }

    const handleResize = () => setSize()
    document.addEventListener("visibilitychange", handleVisibility)
    window.addEventListener("resize", handleResize, { passive: true })

    return () => {
      cancelAnimationFrame(rafId)
      document.removeEventListener("visibilitychange", handleVisibility)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden [clip-path:inset(0)] [contain:paint]">
      <motion.div
        className="absolute -top-20 left-1/2 h-[18rem] w-[18rem] -translate-x-1/2 rounded-full blur-3xl sm:-top-24 sm:h-[24rem] sm:w-[24rem]"
        style={{ background: "radial-gradient(circle, rgba(45,212,191,0.14) 0%, rgba(45,212,191,0) 72%)" }}
        animate={{ x: [0, 20, -14, 0], y: [0, 12, 20, 0], scale: [1, 1.04, 0.99, 1] }}
        transition={{ duration: 24, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-5rem] right-[-2rem] h-[14rem] w-[14rem] rounded-full blur-3xl sm:bottom-[-7rem] sm:right-[-4rem] sm:h-[20rem] sm:w-[20rem]"
        style={{ background: "radial-gradient(circle, rgba(251,191,36,0.11) 0%, rgba(251,191,36,0) 72%)" }}
        animate={{ x: [0, -14, -6, 0], y: [0, -18, -10, 0], scale: [1, 0.97, 1.02, 1] }}
        transition={{ duration: 28, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
      <div
        className="absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(148,163,184,0.14) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148,163,184,0.14) 1px, transparent 1px)
          `,
          backgroundSize: "54px 54px",
          maskImage: "radial-gradient(circle at center, black 40%, transparent 90%)",
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 opacity-70" />
    </div>
  )
}
