import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { incomeEntryApi, Income, IncomeEntry, IncomeEntryDto } from "@/lib/api/income"

const fmt = (n: number, currency = "LKR") =>
  new Intl.NumberFormat("en-LK", { style: "currency", currency, maximumFractionDigits: 0 }).format(n)

// ─── Add Entry Dialog ─────────────────────────────────────────
export function AddEntryDialog({
  open,
  date,
  incomeId,
  onClose,
  onAdded,
}: {
  open: boolean
  date: string
  incomeId: number
  onClose: () => void
  onAdded: (entry: IncomeEntry) => void
}) {
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => { setAmount(""); setNote(""); setError(null) }

  const handleSubmit = async () => {
    if (!amount || isNaN(Number(amount))) { setError("Please enter a valid amount."); return }
    try {
      setLoading(true)
      const dto: IncomeEntryDto = { incomeId, date, amount: Number(amount), note }
      const res = await incomeEntryApi.create(dto)
      onAdded(res.data)
      reset()
      onClose()
    } catch {
      setError("Failed to add entry.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); onClose() } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Entry — {date}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Amount</Label>
            <Input
              type="number" placeholder="0"
              value={amount} onChange={e => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Note (optional)</Label>
            <Textarea
              placeholder="e.g. Regular payment"
              value={note} onChange={e => setNote(e.target.value)}
              rows={3}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onClose() }} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Entry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Edit Entry Dialog ────────────────────────────────────────
export function EditEntryDialog({
  open,
  entry,
  onClose,
  onUpdated,
}: {
  open: boolean
  entry: IncomeEntry | null
  onClose: () => void
  onUpdated: (entry: IncomeEntry) => void
}) {
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (entry) { setAmount(String(entry.amount)); setNote(entry.note ?? "") }
  }, [entry])

  const handleSubmit = async () => {
    if (!amount || isNaN(Number(amount))) { setError("Please enter a valid amount."); return }
    try {
      setLoading(true)
      const res = await incomeEntryApi.update(entry!.id, { amount: Number(amount), note })
      onUpdated(res.data)
      onClose()
    } catch {
      setError("Failed to update entry.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Entry — {entry?.date}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Amount</Label>
            <Input
              type="number" placeholder="0"
              value={amount} onChange={e => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Note (optional)</Label>
            <Textarea
              placeholder="e.g. Regular payment"
              value={note} onChange={e => setNote(e.target.value)}
              rows={3}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Update Entry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Delete Confirm Dialog ────────────────────────────────────
export function DeleteEntryDialog({
  open,
  entry,
  currency,
  onClose,
  onDeleted,
}: {
  open: boolean
  entry: IncomeEntry | null
  currency: string
  onClose: () => void
  onDeleted: (id: number) => void
}) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    try {
      setLoading(true)
      await incomeEntryApi.delete(entry!.id)
      onDeleted(entry!.id)
      onClose()
    } catch {
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Entry?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the entry of{" "}
            <span className="font-semibold">{entry ? fmt(entry.amount, currency) : ""}</span> on{" "}
            <span className="font-semibold">{entry?.date}</span>. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}