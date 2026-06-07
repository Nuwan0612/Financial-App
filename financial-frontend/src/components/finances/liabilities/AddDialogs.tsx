import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreateLiabilityDto, CreateLiabilityPaymentDto, liabilitiesApi, Liability, liabilityPaymentsApi } from "@/lib/api/liabilities"


import {
  Field,
  FieldLabel,
} from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"


/*====================================================================== */
/*                              LIABILITIES                                 */
/*====================================================================== */

export function AddLiabilityDialog({
  open,
  onClose,
  onAdded,
}: {
  open: boolean
  onClose: () => void
  onAdded: (liability: Liability) => void
}) {
  const [form, setForm] = useState<CreateLiabilityDto>({
    name: "",
    isPaid: false,
    completed: "",
    borrowed: new Date().toISOString().split('T')[0],
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
      const res = await liabilitiesApi.create(form)
      onAdded(res.data)
      onClose()
      setForm({ name: "", amount: 0, isPaid: false, completed: "", borrowed: new Date().toISOString().split('T')[0] })
    } catch (err) {
      setError("Failed to add liability. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Liability</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g. Debt, Loan"
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
            Add Liability
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


export function UpdateLiabilityDialog({
  open,
  updateItem,
  onClose,
  onUpdated,
}: {
  open: boolean
  updateItem: Liability | null
  onClose: () => void
  onUpdated: (liability: Liability) => void
}) {
  const [form, setForm] = useState<CreateLiabilityDto>({
    name: "",
    isPaid: false,
    completed: "",
    borrowed: new Date().toISOString().split('T')[0],
    amount: 0,
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (updateItem) {
      setForm({
        name: updateItem.name,
        isPaid: updateItem.isPaid ? true : false,
        completed: updateItem.completed,
        borrowed: updateItem.borrowed,
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
      const res = await liabilitiesApi.update(updateItem.id, form)
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
          <DialogTitle>Update Liability</DialogTitle> 
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
            Update Liability
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}



/*====================================================================== */
/*                           ADD PAYMENT                                 */
/*====================================================================== */

export function AddPaymentDialog({
  open,
  id,
  onClose,
  onAdded,
}: {
  open: boolean
  id: number
  onClose: () => void
  onAdded: (liability: Liability) => void
}) {
  const [form, setForm] = useState<CreateLiabilityPaymentDto>({
    amountPaid: 0,
    notes: "",
    paymentDate: new Date().toISOString().split('T')[0],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!form.amountPaid) {
      setError("Please fill in all fields.")
      return
    }

    try {
      setLoading(true)
      setError(null)
      const res = await liabilityPaymentsApi.create(id!, form)
      onAdded(res.data)
      onClose()
      setForm({ amountPaid: 0, notes: "", paymentDate: new Date().toISOString().split('T')[0] })
    } catch (err) {
      setError("Failed to add liability. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="amount">Payment Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              // value={form.amountPaid}
              onChange={(e) => setForm({ ...form, amountPaid: Number(e.target.value) })}
            />
          </div>

          {/* Amount + Currency side by side */}
          <div className="flex gap-3">
            <div className="space-y-1.5 flex-1">
              <Field>
                <FieldLabel htmlFor="textarea-message">Notes</FieldLabel>
                {/* <FieldDescription>Enter your message below.</FieldDescription> */}
                <Textarea 
                  id="textarea-message" 
                  placeholder="Type your note here." 
                  value={form.notes || ""}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
              </Field>
              {/* <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={form.notes || ""}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              /> */}
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
            Add Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}