import { IncomeEntry } from "@/lib/api/income"

export const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
export const CURRENT_YEAR = new Date().getFullYear()

// ─── Helpers ─────────────────────────────────────────────────
export function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

export function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export function entriesForDate(entries: IncomeEntry[], year: number, month: number, day: number) {
  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  return entries.filter(e => e.date === dateStr)
}

export function totalForMonth(entries: IncomeEntry[], year: number, month: number) {
  return entries
    .filter(e => { const d = new Date(e.date); return d.getFullYear() === year && d.getMonth() === month })
    .reduce((s, e) => s + e.amount, 0)
}

export function totalForYear(entries: IncomeEntry[], year: number) {
  return entries
    .filter(e => new Date(e.date).getFullYear() === year)
    .reduce((s, e) => s + e.amount, 0)
}

// Years from current year upward + any years that have entries
export function getAvailableYears(entries: IncomeEntry[]) {
  const years = new Set<number>()
  // current year and 3 years into the future
  for (let y = CURRENT_YEAR; y <= CURRENT_YEAR + 3; y++) years.add(y)
  // any past years that actually have entries
  entries.forEach(e => years.add(new Date(e.date).getFullYear()))
  return [...years].sort((a, b) => b - a)
}