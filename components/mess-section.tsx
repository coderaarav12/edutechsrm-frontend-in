"use client"

import { useMemo, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sunrise, Sun, Coffee, Moon, UtensilsCrossed } from "lucide-react"
import { getMessMenu, getCurrentDayIndex, HOSTELS, type Hostel } from "@/lib/mess-menu"
import { AIPromoBadge } from "@/components/ai-promo-badge"
import { useIsPosterTheme } from "@/lib/theme-context"

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const mealConfig: Record<string, { icon: typeof Sun; color: string }> = {
  Breakfast: { icon: Sunrise, color: "#38bdf8" },
  Lunch:     { icon: Sun,     color: "#34d399" },
  Snacks:    { icon: Coffee,  color: "#fbbf24" },
  Dinner:    { icon: Moon,    color: "#f472b6" },
}

const DAY_ITEMS = DAYS_SHORT.map((name, i) => ({
  dayName: name,
  dayOfWeek: i,
  isToday: i === new Date().getDay(),
}))

export function MessSection() {
  const isPoster = useIsPosterTheme()

  const [selectedHostel, setSelectedHostel] = useState<Hostel>("Sannasi")
  const menu = useMemo(() => getMessMenu(selectedHostel), [selectedHostel])
  const todayDow = getCurrentDayIndex()

  const [selectedDow, setSelectedDow] = useState(todayDow)
  const dayButtonRefs = useRef<(HTMLButtonElement | null)[]>([])
  const currentDay = menu[selectedDow]

  return (
    <div className="min-h-full pt-[3.75rem] pb-20 px-3 sm:px-4 lg:px-8 lg:pb-8 w-full">
      <div className="flex justify-between items-start mb-8">
        <div>
          <p className={`font-bold text-[10px] uppercase tracking-widest mb-1 ${isPoster ? "text-zinc-600 font-mono" : "text-zinc-500"}`}>Meals</p>
          <h1 className={`text-3xl font-bold tracking-tight font-display ${isPoster ? "text-[#111111]" : "text-zinc-100"}`}>Mess Menu</h1>
          <p className={`text-xs mt-1 ${isPoster ? "text-zinc-600 font-medium" : "text-zinc-500"}`}>{currentDay?.day} · 4 meals</p>
        </div>
        <div className="flex items-center gap-2">
          <AIPromoBadge page="mess" />
        </div>
      </div>

      {/* Hostel selector */}
      <div className="flex gap-2 mb-4">
        {HOSTELS.map((hostel) => (
          <motion.button
            key={hostel}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedHostel(hostel)}
            className={`flex-1 py-2 px-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              selectedHostel === hostel
                ? isPoster
                  ? "bg-[#111111] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] keep-white"
                  : "bg-zinc-800 text-emerald-400 shadow-md border border-white/5"
                : isPoster
                  ? "bg-white text-zinc-700 border-2 border-[#111111]/30 hover:border-[#111111] hover:text-[#111111]"
                  : "bg-transparent text-zinc-500 border border-transparent hover:text-zinc-300"
            }`}
          >
            {hostel}
          </motion.button>
        ))}
      </div>

      {/* Day selector — 7-column grid */}
      <div className={`grid grid-cols-7 gap-1 p-1.5 rounded-xl mb-8 ${
        isPoster
          ? "bg-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111]"
          : "bg-zinc-900 ring-1 ring-white/5 shadow-inner"
      }`}>
        {DAY_ITEMS.map((day) => {
          const isSelected = selectedDow === day.dayOfWeek
          return (
            <motion.button
              key={day.dayOfWeek}
              ref={(node) => { dayButtonRefs.current[day.dayOfWeek] = node }}
              whileTap={{ scale: 0.93 }}
              onClick={() => setSelectedDow(day.dayOfWeek)}
              className={`flex flex-col items-center py-1.5 px-1 rounded-lg transition-all cursor-pointer ${
                isSelected
                  ? isPoster
                    ? "bg-[#111111] text-white shadow-sm border border-[#111111] keep-white"
                    : "bg-zinc-800 shadow-md border border-white/5"
                  : isPoster
                    ? "bg-transparent hover:bg-black/5"
                    : "bg-transparent border border-transparent"
              }`}
            >
              <span className={`text-[10px] uppercase font-bold tracking-wider ${
                isSelected
                  ? isPoster
                    ? "text-white keep-white"
                    : "text-emerald-400"
                  : isPoster
                    ? "text-zinc-700"
                    : "text-zinc-500"
              }`}>{day.dayName}</span>
              {day.isToday ? (
                <span className={`text-[9px] font-black mt-0.5 ${
                  isSelected
                    ? isPoster
                      ? "text-emerald-300 font-bold"
                      : "text-emerald-400"
                    : isPoster
                      ? "text-emerald-700 font-bold"
                      : "text-emerald-400/70"
                }`}>TODAY</span>
              ) : null}
            </motion.button>
          )
        })}
      </div>

      {/* Meal cards — prototype style */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedDow}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.12 }}
        >
          {!currentDay || currentDay.meals.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center text-center px-4">
              <div className={`w-20 h-20 rounded-full mb-6 flex items-center justify-center shadow-2xl ${
                isPoster
                  ? "bg-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111] text-[#111111]"
                  : "bg-[#111113] border border-white/[0.04] text-zinc-500"
              }`}>
                <UtensilsCrossed size={32} strokeWidth={1.5} />
              </div>
              <h3 className={`text-2xl font-semibold mb-3 tracking-tight ${isPoster ? "text-[#111111]" : "text-zinc-200"}`}>No menu available</h3>
              <p className={`text-[15px] max-w-[280px] leading-relaxed ${isPoster ? "text-zinc-600" : "text-zinc-500"}`}>
                The menu for {DAYS_SHORT[selectedDow]} hasn&apos;t been updated yet. Check back later.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {currentDay.meals.map((meal, i) => {
                const config = mealConfig[meal.label] || mealConfig.Breakfast
                const Icon = config.icon
                return (
                  <motion.div
                    key={meal.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className={`rounded-2xl p-5 sm:p-6 flex flex-col gap-4 relative overflow-hidden transition-all ${
                      isPoster
                        ? "bg-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] text-[#111111] hover:-translate-y-0.5"
                        : "bg-[#0f0f11] border border-white/[0.04] shadow-[0_8px_32px_rgba(0,0,0,0.4)] text-zinc-100 hover:bg-[#121214]"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isPoster
                            ? "bg-[#f7f5f0] border-2 border-[#111111] shadow-[1.5px_1.5px_0px_#111111]"
                            : "bg-zinc-900/80 border border-white/[0.05] shadow-inner"
                        }`}
                          style={{ color: isPoster ? "#111111" : config.color }}>
                          <Icon size={18} strokeWidth={2.2} />
                        </div>
                        <div className="flex flex-col justify-center">
                          <h3 className={`font-semibold text-lg tracking-tight ${isPoster ? "text-[#111111] font-bold" : "text-zinc-100"}`}>{meal.label}</h3>
                          <p className={`text-[12px] font-medium mt-0.5 ${isPoster ? "text-zinc-600 font-mono" : "text-zinc-500"}`}>{meal.time}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {meal.items.map((item, j) => (
                        <span
                          key={j}
                          className={`px-3 py-1.5 rounded-lg text-[13px] font-medium ${
                            isPoster
                              ? "bg-[#f7f5f0] text-[#111111] border border-[#111111] shadow-[1px_1px_0px_#111111]"
                              : "bg-white/[0.04] text-zinc-300 border border-white/[0.06]"
                          }`}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <p className={`text-[10px] mt-8 text-center leading-relaxed ${isPoster ? "text-zinc-700 font-medium" : "text-zinc-600"}`}>
        Monthly two times Chicken Biryani (on non-veg days)
        <br />🔺They keep changing this, specially snacks menu, so take it with a grain of salt.
      </p>
    </div>
  )
}
