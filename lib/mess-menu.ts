import { MESS_MENUS, HOSTELS, type Hostel } from "@/lib/mess-menus"

export { HOSTELS }
export type { Hostel }

export interface MealPeriod {
  label: string
  time: string
  items: string[]
}

export interface DayMenu {
  day: string
  meals: MealPeriod[]
}

const MEAL_NAMES = ["breakfast", "lunch", "snacks", "dinner"] as const

const MEAL_TIMES: Record<string, string> = {
  breakfast: "7:00 AM - 9:00 AM",
  lunch: "11:30 AM - 1:30 PM",
  snacks: "4:30 PM - 5:30 PM",
  dinner: "7:30 PM - 9:00 PM",
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export function getMessMenu(hostel: Hostel = "Sannasi"): DayMenu[] {
  const menu = MESS_MENUS[hostel]
  return DAY_NAMES.map((day) => ({
    day,
    meals: MEAL_NAMES.map((name) => ({
      label: name.charAt(0).toUpperCase() + name.slice(1),
      time: MEAL_TIMES[name],
      items: menu[day][name],
    })),
  }))
}

export function getCurrentDayIndex(): number {
  return new Date().getDay()
}

export function getCurrentMealIndex(): number {
  const hrs = new Date().getHours()
  const min = new Date().getMinutes()
  if (hrs < 9) return 0
  if (hrs < 13 || (hrs === 13 && min < 30)) return 1
  if (hrs < 17 || (hrs === 17 && min < 30)) return 2
  return 3
}
