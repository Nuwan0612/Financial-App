"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FutureJournal } from "./types"
import { FutureJournalDialog, JournalDetailDialog } from "./FutureDialog"


export function FutureCalendar({ accountId, bucketId, futureJournals }: { accountId: number; bucketId: number; futureJournals: FutureJournal[] }) {

  const CURRENT_YEAR = new Date().getFullYear();
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  // Dummy helper functions for calendar (replace with your actual imports)
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [journalDialogDate, setJournalDialogDate] = useState<string | null>(null)
  const [journals, setJournals] = useState<FutureJournal[]>(futureJournals)  

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth)
  const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blanks = Array.from({ length: firstDay }, (_, i) => i)

  const [detailJournal, setDetailJournal] = useState<FutureJournal | null>(null)

  const getDateStr = (day: number) =>
    `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`

  // Match based on closeDate string representation
  const journalsForDate = (dateStr: string) => journals.filter(j => {
    const d = new Date(j.closeDate);
    const jDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return jDateStr === dateStr;
  })

  const selectedDateJournals = selectedDate ? journalsForDate(selectedDate) : []

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[220px_1fr] gap-4">
        {/* Left — year + month selectors */}
        <div className="space-y-3">
          <Card>
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Year</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-1">
              {[CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1, CURRENT_YEAR + 2, CURRENT_YEAR + 3].map(y => {
                // Fixed to realizedPnl and closeDate
                const yProfit = journals
                  .filter(j => new Date(j.closeDate).getFullYear() === y)
                  .reduce((s, j) => s + j.realizedPnl, 0)

                return (
                  <button 
                    key={y} 
                    onClick={() => setSelectedYear(y)}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-colors
                      ${selectedYear === y ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted/50"}`}
                  >
                    <span>{y}</span>
                    
                    {yProfit !== 0 && (
                      <span 
                        className={`text-xs ${
                          selectedYear === y 
                            ? "text-primary-foreground/80" 
                            : yProfit > 0 
                              ? "text-green-600" 
                              : "text-destructive"
                        }`}
                      >
                        {yProfit > 0 ? "+" : ""}{yProfit.toFixed(0)}
                      </span>
                    )}
                  </button>
                )
              })}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Month</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="grid grid-cols-3 gap-1">
                {MONTHS.map((m, idx) => {
                  // Fixed to realizedPnl and closeDate
                  const mProfit = journals
                    .filter(j => { const d = new Date(j.closeDate); return d.getFullYear() === selectedYear && d.getMonth() === idx })
                    .reduce((s, j) => s + j.realizedPnl, 0)
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
                // Fixed to realizedPnl
                const dayProfit = dayJournals.reduce((s, j) => s + j.realizedPnl, 0)
                const hasJournals = dayJournals.length > 0
                const isSelected = selectedDate === dateStr
                
                // Keep local time string check to prevent timezone mismatch on "Today"
                const today = new Date();
                const isToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}` === dateStr;

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
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground border border-border w-32">Pair</th>
                    <th className="text-center px-4 py-2 font-medium text-muted-foreground border border-border w-32">Direction</th>
                    <th className="text-right px-4 py-2 font-medium text-muted-foreground border border-border w-32">Leverage</th>
                    <th className="text-right px-4 py-2 font-medium text-muted-foreground border border-border w-32">Margin</th>
                    <th className="text-right px-4 py-2 font-medium text-muted-foreground border border-border w-32">Position Size</th>
                    <th className="text-right px-4 py-2 font-medium text-muted-foreground border border-border w-28">P&L</th>
                    <th className="text-center px-4 py-2 font-medium text-muted-foreground border border-border w-32">SS</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground border border-border">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDateJournals.map(j => (
                    <tr key={j.id}
                      className="hover:bg-muted/20 cursor-pointer"
                      onClick={() => setDetailJournal(j)} 
                    >
                      <td className="px-4 py-2 border border-border font-semibold">{j.coinPair}</td>
                      <td className="px-4 py-2 border border-border text-center">
                        <Badge className={j.positionType === "LONG"
                          ? "bg-green-500/10 text-green-600 border-green-500/20 text-xs"
                          : "bg-red-500/10 text-red-600 border-red-500/20 text-xs"}>
                          {j.positionType}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 border border-border text-right tabular-nums text-xs">{j.leverage}x</td>
                      <td className="px-4 py-2 border border-border text-right tabular-nums text-xs">${j.margin}</td>
                      <td className="px-4 py-2 border border-border text-right tabular-nums text-xs">${j.margin * j.leverage}</td>
                      {/* Fixed to realizedPnl */}
                      <td className={`px-4 py-2 border border-border text-right tabular-nums font-medium
                        ${j.realizedPnl >= 0 ? "text-green-600" : "text-destructive"}`}>
                        {j.realizedPnl >= 0 ? "+" : ""}${j.realizedPnl}
                      </td>
                      <td className="px-4 py-2 border border-border text-center">
                        {j.ss_path ? (
                          <span className="text-[10px] text-primary">📎 View</span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">—</span>
                        )}
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
      <FutureJournalDialog
        open={!!journalDialogDate}
        date={journalDialogDate ?? ""}
        accountId={accountId}
        bucketId={bucketId}
        onClose={() => setJournalDialogDate(null)}
        onSaved={j => { setJournals(prev => [...prev, j]); setJournalDialogDate(null) }}
      />

      <JournalDetailDialog
        open={!!detailJournal}
        journal={detailJournal}
        onClose={() => setDetailJournal(null)}
      />
    </div>
  )
}