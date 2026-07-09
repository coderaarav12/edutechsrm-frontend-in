"use client"

import { useState } from "react"
import { motion } from "framer-motion"

interface DeckCard {
  src: string
  alt: string
  label: string
}

interface AppScreenshotDeckProps {
  cards?: DeckCard[]
  className?: string
}

const DEFAULT_CARDS: DeckCard[] = [
  { src: "/screenshots/dashboard.png", alt: "Dashboard overview", label: "Dashboard" },
  { src: "/screenshots/attendance.png", alt: "Attendance tracking", label: "Attendance" },
  { src: "/screenshots/timetable.png", alt: "Timetable view", label: "Timetable" },
  { src: "/screenshots/marks.png", alt: "Marks tracker", label: "Marks" },
]

export function AppScreenshotDeck({
  cards = DEFAULT_CARDS,
  className = "",
}: AppScreenshotDeckProps) {
  const [hovered, setHovered] = useState(false)
  const [tapped, setTapped] = useState(false)
  const isOpen = hovered || tapped

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setTapped((t) => !t)}
      role="presentation"
    >
      <div className="relative mx-auto" style={{ width: 280, height: 420 }}>
        {cards.map((card, i) => {
          const offset = i - (cards.length - 1) / 2
          const stackRotate = offset * 1.8
          const stackY = Math.abs(offset) * 5
          const fanRotate = offset * 6
          const fanX = offset * 55
          const fanY = Math.abs(offset) * 12 - 8
          const zIndex = cards.length - i

          return (
            <motion.div
              key={i}
              className="absolute inset-0 cursor-pointer select-none"
              style={{ zIndex }}
              initial={false}
              animate={
                isOpen
                  ? {
                      rotate: fanRotate,
                      x: fanX,
                      y: fanY,
                      scale: 1,
                    }
                  : {
                      rotate: stackRotate,
                      x: 0,
                      y: stackY,
                      scale: 1 - i * 0.025,
                    }
              }
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 22,
                mass: 0.8,
                delay: i * 0.04,
              }}
            >
              <div
                className="relative h-full w-full overflow-hidden rounded-2xl border bg-slate-900"
                style={{
                  borderColor: "rgba(255,255,255,0.1)",
                  boxShadow: isOpen
                    ? `0 20px 60px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.05)`
                    : `0 8px 30px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04)`,
                }}
              >
                <div className="flex h-7 items-center gap-1.5 border-b px-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <span className="h-2 w-2 rounded-full bg-red-500/60" />
                  <span className="h-2 w-2 rounded-full bg-amber-500/60" />
                  <span className="h-2 w-2 rounded-full bg-emerald-500/60" />
                  <span className="ml-2 text-[8px] font-medium uppercase tracking-wider text-slate-500">
                    {card.label}
                  </span>
                </div>
                <div className="flex h-[calc(100%-28px)] items-center justify-center bg-slate-800/50 p-4">
                  <div className="text-center">
                    <div className="mx-auto mb-2 h-32 w-full max-w-[200px] rounded-lg border bg-gradient-to-br from-teal-500/20 to-slate-800/60" style={{ borderColor: "rgba(45,212,191,0.15)" }}>
                      <div className="flex h-full items-center justify-center">
                        <div className="space-y-2 p-3 w-full">
                          <div className="h-2 w-3/4 rounded bg-slate-600/40" />
                          <div className="h-2 w-1/2 rounded bg-slate-600/30" />
                          <div className="mt-3 h-16 w-full rounded border bg-slate-700/30" style={{ borderColor: "rgba(45,212,191,0.1)" }}>
                            <div className="flex h-full items-center justify-center">
                              <div className="h-6 w-6 rounded border-2 border-teal-400/30 border-t-teal-400 animate-spin" />
                            </div>
                          </div>
                          <div className="h-2 w-2/3 rounded bg-slate-600/30" />
                          <div className="h-2 w-1/3 rounded bg-slate-600/20" />
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-[10px] font-medium text-slate-500">
                      {card.label}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="mt-6 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border bg-white/[0.03] px-3 py-1 text-[10px] font-medium text-slate-500 transition-opacity" style={{ borderColor: "rgba(255,255,255,0.08)", opacity: isOpen ? 0 : 1 }}>
          {cards.length} screens
        </span>
      </div>
    </div>
  )
}
