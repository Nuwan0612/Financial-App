import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreateExpenseDto, Expense, expensesApi } from "@/lib/api/expenses"


/*====================================================================== */
/*                              EXPENSES                                 */
/*====================================================================== */

export function AddExpenseDialog({
  open,
  onClose,
  onAdded,
}: {
  open: boolean
  onClose: () => void
  onAdded: (expense: Expense) => void
}) {
  const [form, setForm] = useState<CreateExpenseDto>({
    name: "",
    amount: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!form.name || !form.amount) {
      setError("Please fill in all fields.")
      return
    }

    try {
      setLoading(true)
      setError(null)
      const res = await expensesApi.create(form)
      onAdded(res.data)
      onClose()
      setForm({ name: "", amount: 0 })
    } catch (err) {
      setError("Failed to add expense. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g. Transport, Food"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          {/* Amount + Currency side by side */}
          <div className="flex gap-3">
            <div className="space-y-1.5 flex-1">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={form.amount || ""}
                onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Add Expense
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


export function UpdateExpenseDialog({
  open,
  updateItem,
  onClose,
  onUpdated,
}: {
  open: boolean
  updateItem: Expense | null
  onClose: () => void
  onUpdated: (expense: Expense) => void
}) {
  const [form, setForm] = useState<CreateExpenseDto>({
    name: "",
    amount: 0,
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (updateItem) {
      setForm({
        name: updateItem.name,
        amount: updateItem.amount,
      })
      setError(null) 
    }
  }, [updateItem, open])

  const handleSubmit = async () => {
    // Safety check: Make sure we actually have an ID to update!
    if (!updateItem?.id) return;

    if (!form.name || !form.amount) {
      setError("Please fill in all fields.")
      return
    }

    try {
      setLoading(true)
      setError(null)
      const res = await expensesApi.update(updateItem.id, form)
      onUpdated(res.data)
      onClose()
    } catch (err) {
      setError("Failed to update expense. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          {/* Changed title from "Add" to "Update" */}
          <DialogTitle>Update Expense</DialogTitle> 
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g. Transport, Food"
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          {/* Amount + Currency side by side */}
          <div className="flex gap-3">
            <div className="space-y-1.5 flex-1">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={form.amount || ""} // 2. CHANGED TO form.amount
                onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Update Expense
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


