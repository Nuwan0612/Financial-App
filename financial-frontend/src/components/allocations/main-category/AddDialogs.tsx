import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MainCategory, mainCategoryApi, MainCategoryDto } from "@/lib/api/allocations"


export function AddMainCategoryDialog({
  open,
  onClose,
  onAdded,
}: {
  open: boolean
  onClose: () => void
  onAdded: (mainCategory: MainCategory) => void
}) {
  const [form, setForm] = useState<MainCategoryDto>({
    name: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!form.name) {
      setError("Please fill in all fields.")
      return
    }

    try {
      setLoading(true)
      setError(null)
      const res = await mainCategoryApi.create(form)
      onAdded(res.data)
      onClose()
      setForm({ name: "" })
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
          <DialogTitle>Add Main Category</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g. Donations, Investments"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
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




export function UpdateMainCategoryDialog({
  open,
  updateItem,
  onClose,
  onUpdated,
}: {
  open: boolean
  updateItem: MainCategory | null
  onClose: () => void
  onUpdated: (mainCategory: MainCategory) => void
}) {
  const [form, setForm] = useState<MainCategoryDto>({
    name: "",
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (updateItem) {
      setForm({
        name: updateItem.name,
      })
      setError(null) 
    }
  }, [updateItem, open])

  const handleSubmit = async () => {
    // Safety check: Make sure we actually have an ID to update!
    if (!updateItem?.id) return;

    if (!form.name) {
      setError("Please fill in all fields.")
      return
    }

    try {
      setLoading(true)
      setError(null)
      const res = await mainCategoryApi.update(updateItem.id, form)
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
          <DialogTitle>Update Main Category</DialogTitle> 
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g. Donations, Investments"
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
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
            Update Main Category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


