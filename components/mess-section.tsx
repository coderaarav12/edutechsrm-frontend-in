"use client"

import { useMemo, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sunrise, Sun, Coffee, Moon, UtensilsCrossed } from "lucide-react"
import { getMessMenu, getCurrentDayIndex, HOSTELS, type Hostel } from "@/lib/mess-menu"
import { AIPromoBadge } from "@/components/ai-promo-badge"

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const mealConfig: Record<string, { icon: typeof Sun; color: string }> = {
  Breakfast: { icon: Sunrise, color: "#34d399" },
  Lunch:     { icon: Sun,     color: "#38bdf8" },
  Snacks:    { icon: Coffee,  color: "#fbbf24" },
  Dinner:    { icon: Moon,    color: "#f472b6" },
}

const DAY_ITEMS = DAYS_SHORT.map((name, i) => ({
  dayName: name,
  dayOfWeek: i,
  isToday: i === new Date().getDay(),
}))

export function MessSection() {
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
          <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-1">Meals</p>
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight font-display">Mess Menu</h1>
          <p className="text-xs mt-1 text-zinc-500">{currentDay?.day} · 4 meals</p>
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
            className={`flex-1 py-2 px-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              selectedHostel === hostel
                ? "bg-zinc-800 text-emerald-400 shadow-md border border-white/5"
                : "bg-transparent text-zinc-500 border border-transparent hover:text-zinc-300"
            }`}
          >
            {hostel}
          </motion.button>
        ))}
      </div>

      {/* Day selector — 7-column grid */}
      <div className="grid grid-cols-7 gap-1 p-1.5 rounded-xl bg-zinc-900 ring-1 ring-white/5 shadow-inner mb-8">
        {DAY_ITEMS.map((day) => {
          const isSelected = selectedDow === day.dayOfWeek
          return (
            <motion.button
              key={day.dayOfWeek}
              ref={(node) => { dayButtonRefs.current[day.dayOfWeek] = node }}
              whileTap={{ scale: 0.93 }}
              onClick={() => setSelectedDow(day.dayOfWeek)}
              className={`flex flex-col items-center py-1.5 px-1 rounded-lg transition-all ${
                isSelected
                  ? "bg-zinc-800 shadow-md border border-white/5"
                  : "bg-transparent border border-transparent"
              }`}
            >
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isSelected ? "text-emerald-400" : "text-zinc-500"}`}>{day.dayName}</span>
              {day.isToday ? (
                <span className={`text-[9px] font-black mt-0.5 ${isSelected ? "text-emerald-400" : "text-emerald-400/70"}`}>TODAY</span>
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
              <div className="w-20 h-20 rounded-full bg-[#111113] border border-white/[0.04] mb-6 flex items-center justify-center shadow-2xl text-zinc-500">
                <UtensilsCrossed size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-semibold text-zinc-200 mb-3 tracking-tight">No menu available</h3>
              <p className="text-[15px] text-zinc-500 max-w-[280px] leading-relaxed">
                The menu for {DAYS_SHORT[selectedDow]} hasn't been updated yet. Check back later.
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
                    className="bg-[#0f0f11] rounded-2xl p-5 sm:p-6 flex flex-col gap-4 border border-white/[0.04] shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden transition-all hover:bg-[#121214]"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-zinc-900/80 border border-white/[0.05] shadow-inner"
                          style={{ color: config.color }}>
                          <Icon size={18} strokeWidth={2.2} />
                        </div>
                        <div className="flex flex-col justify-center">
                          <h3 className="font-semibold text-zinc-100 text-lg tracking-tight">{meal.label}</h3>
                          <p className="text-[12px] text-zinc-500 font-medium mt-0.5">{meal.time}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {meal.items.map((item, j) => (
                        <span
                          key={j}
                          className="px-3 py-1.5 rounded-lg text-[13px] font-medium bg-white/[0.04] text-zinc-300 border border-white/[0.06]"
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

      <p className="text-[10px] mt-8 text-center leading-relaxed text-zinc-600">
        Monthly two times Chicken Biryani (on non-veg days)
        <br />🔺They keep changing this, specially snacks menu, so take it with a grain of salt.
      </p>
    </div>
  )
}
