import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { FutureJournal } from "./types"
import { fmtUSD } from "./helpers"

export function FutureJournalDialog({
  open, date, onClose, onSaved,
}: {
  open: boolean
  date: string
  onClose: () => void
  onSaved: (journal: FutureJournal) => void
}) {
  const [form, setForm] = useState({
    pair: "BTC/USDT",
    direction: "LONG" as "LONG" | "SHORT",
    entryPrice: "",
    exitPrice: "",
    size: "",
    notes: "",
  })

  const profit = form.entryPrice && form.exitPrice && form.size
    ? form.direction === "LONG"
      ? (Number(form.exitPrice) - Number(form.entryPrice)) * Number(form.size)
      : (Number(form.entryPrice) - Number(form.exitPrice)) * Number(form.size)
    : null

  const handleSave = () => {
    if (!form.pair || !form.entryPrice || !form.exitPrice || !form.size) return
    onSaved({
      id: Date.now(),
      date,
      pair: form.pair,
      direction: form.direction,
      entryPrice: Number(form.entryPrice),
      exitPrice: Number(form.exitPrice),
      size: Number(form.size),
      profit: profit ?? 0,
      notes: form.notes,
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Journal Trade — {date}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex gap-3">
            <div className="space-y-1.5 flex-1">
              <Label className="text-xs">Pair</Label>
              <Input placeholder="e.g. BTC/USDT" value={form.pair}
                onChange={e => setForm(p => ({ ...p, pair: e.target.value }))} className="h-8 text-xs" />
            </div>
            <div className="space-y-1.5 w-28">
              <Label className="text-xs">Direction</Label>
              <Select value={form.direction} onValueChange={v => setForm(p => ({ ...p, direction: v as any }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LONG">LONG</SelectItem>
                  <SelectItem value="SHORT">SHORT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="space-y-1.5 flex-1">
              <Label className="text-xs">Entry Price ($)</Label>
              <Input type="number" placeholder="0" value={form.entryPrice}
                onChange={e => setForm(p => ({ ...p, entryPrice: e.target.value }))} className="h-8 text-xs" />
            </div>
            <div className="space-y-1.5 flex-1">
              <Label className="text-xs">Exit Price ($)</Label>
              <Input type="number" placeholder="0" value={form.exitPrice}
                onChange={e => setForm(p => ({ ...p, exitPrice: e.target.value }))} className="h-8 text-xs" />
            </div>
            <div className="space-y-1.5 flex-1">
              <Label className="text-xs">Size</Label>
              <Input type="number" placeholder="0" value={form.size}
                onChange={e => setForm(p => ({ ...p, size: e.target.value }))} className="h-8 text-xs" />
            </div>
          </div>
          {profit !== null && (
            <div className={`rounded-lg p-3 text-center font-semibold text-sm
              ${profit >= 0 ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-destructive"}`}>
              Estimated P&L: {profit >= 0 ? "+" : ""}{fmtUSD(profit)}
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs">Notes</Label>
            <textarea
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs resize-none h-20 focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="What was your reason for the trade? How did it go?"
              value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSave}>Save Journal</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}