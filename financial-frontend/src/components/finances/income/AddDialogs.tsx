import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { CreateIncomeDto, Currency, Income, incomesApi } from "@/lib/api/income"
import { CreateExpenseDto, Expense, expensesApi } from "@/lib/api/expenses"
import { CreateLiabilityDto, CreateLiabilityPaymentDto, liabilitiesApi, Liability, liabilityPaymentsApi } from "@/lib/api/liabilities"


import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"




/*====================================================================== */
/*                                 INCOME                                */
/*====================================================================== */


export function AddIncomeDialog({
  open,
  onClose,
  onAdded,
}: {
  open: boolean
  onClose: () => void
  onAdded: (income: Income) => void
}) {
  const [form, setForm] = useState<CreateIncomeDto>({
    name: "",
    expectedAmount: 0,
    currency: "LKR",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!form.name || !form.expectedAmount) {
      setError("Please fill in all fields.")
      return
    }

    try {
      setLoading(true)
      setError(null)
      const res = await incomesApi.create(form)
      onAdded(res.data)
      onClose()
      setForm({ name: "", expectedAmount: 0, currency: "LKR" })
    } catch (err) {
      setError("Failed to add income. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Income Source</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g. Salary, Swimming"
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
                value={form.expectedAmount || ""}
                onChange={(e) => setForm({ ...form, expectedAmount: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-1.5 w-32">
              <Label>Currency</Label>
              <Select
                value={form.currency}
                onValueChange={(val) => setForm({ ...form, currency: val as Currency })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LKR">LKR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
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
            Add Income
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}




export function UpdateIncomeDialog({
  open,
  updateItem,
  onClose,
  onUpdated,
}: {
  open: boolean
  updateItem: Income | null
  onClose: () => void
  onUpdated: (income: Income) => void
}) {
  const [form, setForm] = useState<CreateIncomeDto>({
    name: "",
    expectedAmount: 0,
    currency: "LKR",
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (updateItem) {
      setForm({
        name: updateItem.name,
        expectedAmount: updateItem.expectedAmount,
        currency: updateItem.currency,
      })
      setError(null) 
    }
  }, [updateItem, open])

  const handleSubmit = async () => {
    // Safety check: Make sure we actually have an ID to update!
    if (!updateItem?.id) return;

    if (!form.name || !form.expectedAmount) {
      setError("Please fill in all fields.")
      return
    }

    try {
      setLoading(true)
      setError(null)
      const res = await incomesApi.update(updateItem.id, form)
      onUpdated(res.data)
      onClose()
    } catch (err) {
      setError("Failed to update income. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          {/* Changed title from "Add" to "Update" */}
          <DialogTitle>Update Income Source</DialogTitle> 
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g. Salary, Swimming"
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
                value={form.expectedAmount || ""} // 2. CHANGED TO form.expectedAmount
                onChange={(e) => setForm({ ...form, expectedAmount: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-1.5 w-32">
              <Label>Currency</Label>
              <Select
                value={form.currency} // 2. CHANGED TO form.currency
                onValueChange={(val) => setForm({ ...form, currency: val as Currency })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LKR">LKR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
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
            Update Income
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


