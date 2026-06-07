import { useEffect, useState } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IncomeEntry } from "@/lib/api/income"
import { entriesForDate, getDaysInMonth, getFirstDayOfMonth } from "./helperFunctions"
import { AddEntryDialog, DeleteEntryDialog, EditEntryDialog } from "./EntryDialogs"

const fmt = (n: number, currency = "LKR") =>
  new Intl.NumberFormat("en-LK", { style: "currency", currency, maximumFractionDigits: 0 }).format(n)




// ─── Calendar ─────────────────────────────────────────────────
export function MonthCalendar({
  year, month, entries, currency, incomeId,
  onEntryAdded, onEntryUpdated, onEntryDeleted,
}: {
  year: number
  month: number
  entries: IncomeEntry[]
  currency: string
  incomeId: number
  onEntryAdded: (entry: IncomeEntry) => void
  onEntryUpdated: (entry: IncomeEntry) => void
  onEntryDeleted: (id: number) => void
}) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editEntry, setEditEntry] = useState<IncomeEntry | null>(null)
  const [deleteEntry, setDeleteEntry] = useState<IncomeEntry | null>(null)

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blanks = Array.from({ length: firstDay }, (_, i) => i)

  const selectedDate = selectedDay
    ? `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`
    : null

  // Reset selected day when month/year changes
  useEffect(() => { setSelectedDay(null) }, [year, month])

  return (
    <div>
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
          <div key={d} className="text-center text-xs text-muted-foreground py-2 font-medium">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {blanks.map(b => <div key={`b-${b}`} />)}
        {days.map(day => {
          const dayEntries = entriesForDate(entries, year, month, day)
          const hasEntries = dayEntries.length > 0
          const isSelected = selectedDay === day
          const isToday = new Date().getFullYear() === year &&
            new Date().getMonth() === month && new Date().getDate() === day

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(isSelected ? null : day)}
              className={`
                relative flex flex-col items-center justify-start p-1.5 rounded-lg text-xs
                min-h-14 border transition-colors
                ${isSelected ? "border-primary bg-primary/5" : "border-transparent hover:border-border hover:bg-muted/30"}
              `}
            >
              <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium
                ${isToday ? "bg-primary text-primary-foreground" : ""}`}>
                {day}
              </span>
              {hasEntries && (
                <div className="mt-1 space-y-0.5 w-full">
                  {dayEntries.map(e => (
                    <div key={e.id} className="text-[10px] text-green-600 font-medium truncate text-center">
                      +{new Intl.NumberFormat("en-LK", { maximumFractionDigits: 0 }).format(e.amount)}
                    </div>
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected day detail panel */}
      {selectedDay && selectedDate && (
        <div className="mt-4 rounded-lg border border-border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border">
            <p className="text-sm font-medium">{selectedDate}</p>
            <Button size="sm" className="h-7 text-xs gap-1.5" onClick={() => setShowAdd(true)}>
              <Plus className="h-3 w-3" /> Add Entry
            </Button>
          </div>

          {(() => {
            const dayEntries = entriesForDate(entries, year, month, selectedDay)
            if (dayEntries.length === 0) {
              return (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No entries for this date.
                </p>
              )
            }
            return (
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-muted/20">
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground border border-border">Note</th>
                    <th className="text-right px-4 py-2 font-medium text-muted-foreground border border-border w-36">Amount</th>
                    <th className="text-center px-4 py-2 font-medium text-muted-foreground border border-border w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dayEntries.map(e => (
                    <tr key={e.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-2 border border-border text-muted-foreground">
                        {e.note || "—"}
                      </td>
                      <td className="px-4 py-2 border border-border text-right tabular-nums font-medium text-green-600">
                        {fmt(e.amount, currency)}
                      </td>
                      <td className="px-4 py-2 border border-border text-center">
                        <div className="flex justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7"
                            onClick={() => setEditEntry(e)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => setDeleteEntry(e)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          })()}
        </div>
      )}

      {/* Dialogs */}
      <AddEntryDialog
        open={showAdd}
        date={selectedDate ?? ""}
        incomeId={incomeId}
        onClose={() => setShowAdd(false)}
        onAdded={onEntryAdded}
      />
      <EditEntryDialog
        open={!!editEntry}
        entry={editEntry}
        onClose={() => setEditEntry(null)}
        onUpdated={onEntryUpdated}
      />
      <DeleteEntryDialog
        open={!!deleteEntry}
        entry={deleteEntry}
        currency={currency}
        onClose={() => setDeleteEntry(null)}
        onDeleted={onEntryDeleted}
      />
    </div>
  )
}