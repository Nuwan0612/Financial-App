import { useState, useEffect } from "react"
import { CalendarIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreateLiabilityDto, CreateLiabilityPaymentDto, liabilitiesApi, Liability, liabilityPaymentsApi } from "@/lib/api/liabilities"

import { format } from "date-fns"
import { cn } from "@/lib/utils" 

import { Calendar } from "@/components/ui/calendar"
import {
  Field,
  FieldLabel,
} from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { Assets, assetsApi, AssetsDto } from "@/lib/api/assets"

import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"


/*====================================================================== */
/*                              ASSETS                                   */
/*====================================================================== */

export function AddAssetDialog({
  open,
  onClose,
  onAdded,
}: {
  open: boolean
  onClose: () => void
  onAdded: (asset: Assets) => void // Replace 'any' with 'Assets'
}) {
  const [form, setForm] = useState<AssetsDto>({ // Replace 'any' with 'AssetsDto'
    name: "",
    purchasePrice: 0,
    accrueDate: new Date().toISOString().split('T')[0],
    currentMarketValue: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!form.name || form.purchasePrice === 0) {
      setError("Please fill in all fields.")
      return
    }

    try {
      setLoading(true)
      setError(null)
      console.log("Submitting form:", form) // Debug log to check form data
      const res = await assetsApi.create(form)
      onAdded(res.data)
      onClose()
      setForm({ name: "", purchasePrice: 0, accrueDate: new Date().toISOString().split('T')[0], currentMarketValue: 0 })
    } catch (err) {
      setError("Failed to add asset. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Asset</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g. Land, Gold"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          {/* Amount + Currency side by side */}
          <div className="flex gap-3">
            <div className="space-y-1.5 flex-1">
              <Label htmlFor="purchase">Purchase Price</Label>
              <Input
                id="purchase"
                type="number"
                placeholder="0"
                value={form.purchasePrice || ""}
                onChange={(e) => setForm({ ...form, purchasePrice: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="space-y-1.5 flex-1">
              <Label htmlFor="market">Market Value</Label>
              <Input
                id="market"
                type="number"
                placeholder="0"
                value={form.currentMarketValue || ""}
                onChange={(e) => setForm({ ...form, currentMarketValue: Number(e.target.value) })}
              />
            </div>
          </div>

          {/* Accrue Date Picker */}
          <div className="space-y-1.5 flex flex-col">
            <Label>Accrue Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !form.accrueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.accrueDate ? format(new Date(form.accrueDate), "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  captionLayout="dropdown"
                  selected={form.accrueDate ? new Date(form.accrueDate) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      // Using date-fns format instead of .toISOString() ensures it stays in the local timezone 
                      // and prevents the date from accidentally rolling back by one day
                      setForm({ ...form, accrueDate: format(date, "yyyy-MM-dd") })
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
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
            Add Asset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


export function UpdateAssetDialog({
  open,
  updateItem,
  onClose,
  onUpdated,
}: {
  open: boolean
  updateItem: Assets | null
  onClose: () => void
  onUpdated: (asset: Assets) => void
}) {
  const [form, setForm] = useState<AssetsDto>({ // Replace 'any' with 'AssetsDto'
    name: "",
    purchasePrice: 0,
    accrueDate: new Date().toISOString().split('T')[0],
    currentMarketValue: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (updateItem) {
      setForm({
        name: updateItem.name,
        purchasePrice: updateItem.purchasePrice,
        currentMarketValue: updateItem.currentMarketValue,
        accrueDate: updateItem.accrueDate,
      })
      setError(null) 
    }
  }, [updateItem, open])

  const handleSubmit = async () => {
    if (!updateItem?.id) return;

    if (!form.name || form.purchasePrice === 0) {
      setError("Please fill in all fields.")
      return
    }

    try {
      setLoading(true)
      setError(null)
      console.log("Submitting form:", form) // Debug log to check form data
      const res = await assetsApi.update(updateItem.id, form)
      onUpdated(res.data)
      onClose()
      setForm({ name: "", purchasePrice: 0, accrueDate: new Date().toISOString().split('T')[0], currentMarketValue: 0 })
    } catch (err) {
      setError("Failed to update asset. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Asset</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g. Land, Gold"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          {/* Amount + Currency side by side */}
          <div className="flex gap-3">
            <div className="space-y-1.5 flex-1">
              <Label htmlFor="purchase">Purchase Price</Label>
              <Input
                id="purchase"
                type="number"
                placeholder="0"
                value={form.purchasePrice || ""}
                onChange={(e) => setForm({ ...form, purchasePrice: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="space-y-1.5 flex-1">
              <Label htmlFor="market">Market Value</Label>
              <Input
                id="market"
                type="number"
                placeholder="0"
                value={form.currentMarketValue || ""}
                onChange={(e) => setForm({ ...form, currentMarketValue: Number(e.target.value) })}
              />
            </div>
          </div>

          {/* Accrue Date Picker */}
          <div className="space-y-1.5 flex flex-col">
            <Label>Accrue Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !form.accrueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.accrueDate ? format(new Date(form.accrueDate), "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  captionLayout="dropdown"
                  selected={form.accrueDate ? new Date(form.accrueDate) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      // Using date-fns format instead of .toISOString() ensures it stays in the local timezone 
                      // and prevents the date from accidentally rolling back by one day
                      setForm({ ...form, accrueDate: format(date, "yyyy-MM-dd") })
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
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
            Update Asset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

