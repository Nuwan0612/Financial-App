"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FutureJournal } from "./types"
import { futureJournals, MONTHS, CURRENT_YEAR } from "./constants"
import { fmtUSD, getDaysInMonth, getFirstDayOfMonth } from "./helpers"
import { FutureJournalDialog } from "./FutureJournalDialog"

export function FutureCalendar() {
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [journalDialogDate, setJournalDialogDate] = useState<string | null>(null)
  const [journals, setJournals] = useState<FutureJournal[]>(futureJournals)

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth)
  const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blanks = Array.from({ length: firstDay }, (_, i) => i)

  const getDateStr = (day: number) =>
    `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`

  const journalsForDate = (dateStr: string) => journals.filter(j => j.date === dateStr)

  const monthProfit = journals
    .filter(j => {
      const d = new Date(j.date)
      return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth
    })
    .reduce((s, j) => s + j.profit, 0)

  const yearProfit = journals
    .filter(j => new Date(j.date).getFullYear() === selectedYear)
    .reduce((s, j) => s + j.profit, 0)

  const selectedDateJournals = selectedDate ? journalsForDate(selectedDate) : []

  return (
    <div className="space-y-4">
      {/* Year/month totals strip */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="pt-3 pb-3">
            <p className="text-xs text-muted-foreground">{selectedYear} Total P&L</p>
            <p className={`text-base font-semibold mt-0.5 ${yearProfit >= 0 ? "text-green-600" : "text-destructive"}`}>
              {yearProfit >= 0 ? "+" : ""}{fmtUSD(yearProfit)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3">
            <p className="text-xs text-muted-foreground">{MONTHS[selectedMonth]} {selectedYear} P&L</p>
            <p className={`text-base font-semibold mt-0.5 ${monthProfit >= 0 ? "text-green-600" : "text-destructive"}`}>
              {monthProfit >= 0 ? "+" : ""}{fmtUSD(monthProfit)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-[220px_1fr] gap-4">
        {/* Left — year + month selectors */}
        <div className="space-y-3">
          <Card>
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Year</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-1">
              {[CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1].map(y => (
                <button key={y} onClick={() => setSelectedYear(y)}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-colors
                    ${selectedYear === y ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted/50"}`}>
                  <span>{y}</span>
                </button>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Month</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="grid grid-cols-3 gap-1">
                {MONTHS.map((m, idx) => {
                  const mProfit = journals
                    .filter(j => { const d = new Date(j.date); return d.getFullYear() === selectedYear && d.getMonth() === idx })
                    .reduce((s, j) => s + j.profit, 0)
                  return (
                    <button key={m} onClick={() => setSelectedMonth(idx)}
                      className={`flex flex-col items-center py-1.5 rounded-md text-xs transition-colors
                        ${selectedMonth === idx ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted/50"}`}>
                      <span>{m}</span>
                      {mProfit !== 0 && (
                        <span className={`text-[9px] mt-0.5 ${selectedMonth === idx ? "text-primary-foreground/70" : mProfit > 0 ? "text-green-600" : "text-destructive"}`}>
                          {mProfit > 0 ? "+" : ""}{mProfit.toFixed(0)}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right — calendar */}
        <Card>
          <CardHeader className="pb-2 pt-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">{MONTHS[selectedMonth]} {selectedYear}</CardTitle>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" className="h-7 w-7"
                  onClick={() => { if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(y => y - 1) } else setSelectedMonth(m => m - 1) }}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-7 w-7"
                  onClick={() => { if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(y => y + 1) } else setSelectedMonth(m => m + 1) }}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="grid grid-cols-7 mb-1">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
                <div key={d} className="text-center text-xs text-muted-foreground py-1 font-medium">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {blanks.map(b => <div key={`b-${b}`} />)}
              {days.map(day => {
                const dateStr = getDateStr(day)
                const dayJournals = journalsForDate(dateStr)
                const dayProfit = dayJournals.reduce((s, j) => s + j.profit, 0)
                const hasJournals = dayJournals.length > 0
                const isSelected = selectedDate === dateStr
                const isToday = new Date().toISOString().split("T")[0] === dateStr

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                    onDoubleClick={() => setJournalDialogDate(dateStr)}
                    className={`flex flex-col items-center justify-start p-1 rounded-lg text-xs min-h-[52px] border transition-colors
                      ${isSelected ? "border-primary bg-primary/5" : "border-transparent hover:border-border hover:bg-muted/20"}`}
                  >
                    <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-medium
                      ${isToday ? "bg-primary text-primary-foreground" : ""}`}>
                      {day}
                    </span>
                    {hasJournals && (
                      <span className={`text-[9px] font-medium mt-0.5 ${dayProfit >= 0 ? "text-green-600" : "text-destructive"}`}>
                        {dayProfit >= 0 ? "+" : ""}{dayProfit.toFixed(0)}
                      </span>
                    )}
                    {hasJournals && (
                      <div className="flex gap-0.5 mt-0.5">
                        {dayJournals.slice(0, 3).map((_, i) => (
                          <div key={i} className="w-1 h-1 rounded-full bg-primary/50" />
                        ))}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected date journal entries */}
      {selectedDate && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{selectedDate} — Trade Journal</p>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setSelectedDate(null)}>Clear</Button>
          </div>
          {selectedDateJournals.length === 0 ? (
            <div className="rounded-lg border border-border py-8 text-center">
              <p className="text-xs text-muted-foreground">No trades journaled for this date.</p>
              <p className="text-xs text-muted-foreground">Double-click the date to add a trade.</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground border border-border">Pair</th>
                    <th className="text-center px-4 py-2 font-medium text-muted-foreground border border-border w-20">Direction</th>
                    <th className="text-right px-4 py-2 font-medium text-muted-foreground border border-border w-24">Entry</th>
                    <th className="text-right px-4 py-2 font-medium text-muted-foreground border border-border w-24">Exit</th>
                    <th className="text-right px-4 py-2 font-medium text-muted-foreground border border-border w-20">Size</th>
                    <th className="text-right px-4 py-2 font-medium text-muted-foreground border border-border w-28">P&L</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground border border-border">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDateJournals.map(j => (
                    <tr key={j.id} className="hover:bg-muted/20">
                      <td className="px-4 py-2 border border-border font-semibold">{j.pair}</td>
                      <td className="px-4 py-2 border border-border text-center">
                        <Badge className={j.direction === "LONG"
                          ? "bg-green-500/10 text-green-600 border-green-500/20 text-xs"
                          : "bg-red-500/10 text-red-600 border-red-500/20 text-xs"}>
                          {j.direction}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 border border-border text-right tabular-nums text-xs">${j.entryPrice.toLocaleString()}</td>
                      <td className="px-4 py-2 border border-border text-right tabular-nums text-xs">${j.exitPrice.toLocaleString()}</td>
                      <td className="px-4 py-2 border border-border text-right tabular-nums text-xs">{j.size}</td>
                      <td className={`px-4 py-2 border border-border text-right tabular-nums font-medium
                        ${j.profit >= 0 ? "text-green-600" : "text-destructive"}`}>
                        {j.profit >= 0 ? "+" : ""}{fmtUSD(j.profit)}
                      </td>
                      <td className="px-4 py-2 border border-border text-xs text-muted-foreground max-w-xs truncate">
                        {j.notes || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Journal dialog */}
      {journalDialogDate && (
        <FutureJournalDialog
          open={!!journalDialogDate}
          date={journalDialogDate}
          onClose={() => setJournalDialogDate(null)}
          onSaved={j => { setJournals(prev => [...prev, j]); setJournalDialogDate(null) }}
        />
      )}
    </div>
  )
}